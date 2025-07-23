import express from 'express';
import cors from 'cors';
import https from 'https';
import { Log } from '../logging-middleware/logger.js';

const app = express();
const PORT = 8080;

app.use(cors());
app.use(express.json());

// In-memory storage
const urlDatabase = new Map();
const clickStats = new Map();

// Generate random shortcode
function generateShortcode() {
  return Math.random().toString(36).substring(2, 8);
}

// Get location from IP address
async function getLocationFromIP(ip) {
  try {
    // For localhost/development, return a default location
    if (ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1' || !ip) {
      return 'Local Development';
    }
    
    return new Promise((resolve) => {
      const options = {
        hostname: 'ipapi.co',
        path: `/${ip}/json/`,
        method: 'GET',
        headers: {
          'User-Agent': 'Node.js'
        }
      };
      
      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const locationData = JSON.parse(data);
            if (locationData.city && locationData.region && locationData.country_name) {
              resolve(`${locationData.city}, ${locationData.region}, ${locationData.country_name}`);
            } else if (locationData.country_name) {
              resolve(locationData.country_name);
            } else {
              resolve('Unknown Location');
            }
          } catch (error) {
            resolve('Unknown Location');
          }
        });
      });
      
      req.on('error', async (error) => {
        await Log('backend', 'warn', 'service', `Location lookup failed: ${error.message}`);
        resolve('Unknown Location');
      });
      
      req.setTimeout(5000, () => {
        req.destroy();
        resolve('Unknown Location');
      });
      
      req.end();
    });
  } catch (error) {
    await Log('backend', 'warn', 'service', `Location lookup failed: ${error.message}`);
    return 'Unknown Location';
  }
}

// Create short URL
app.post('/shorturls', async (req, res) => {
  try {
    await Log('backend', 'info', 'controller', 'Creating new short URL');
    
    const { url, validity = 30, shortcode } = req.body;
    
    if (!url) {
      await Log('backend', 'error', 'handler', 'URL is required');
      return res.status(400).json({ error: 'URL is required' });
    }
    
    let finalShortcode = shortcode || generateShortcode();
    
    // Check if shortcode exists
    if (urlDatabase.has(finalShortcode)) {
      await Log('backend', 'warn', 'handler', 'Shortcode already exists');
      finalShortcode = generateShortcode(); // Generate new one
    }
    
    const expiryTime = new Date(Date.now() + validity * 60 * 1000);
    
    urlDatabase.set(finalShortcode, {
      originalUrl: url,
      expiry: expiryTime,
      created: new Date()
    });
    
    clickStats.set(finalShortcode, []);
    
    await Log('backend', 'info', 'service', `Short URL created: ${finalShortcode}`);
    
    res.status(201).json({
      shortLink: `http://localhost:${PORT}/${finalShortcode}`,
      expiry: expiryTime.toISOString()
    });
    
  } catch (error) {
    await Log('backend', 'error', 'handler', `Error creating URL: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get stats for shortcode
app.get('/shorturls/:shortcode', async (req, res) => {
  try {
    const { shortcode } = req.params;
    
    await Log('backend', 'info', 'controller', `Getting stats for: ${shortcode}`);
    
    const urlData = urlDatabase.get(shortcode);
    if (!urlData) {
      await Log('backend', 'warn', 'handler', 'Shortcode not found');
      return res.status(404).json({ error: 'Short URL not found' });
    }
    
    const clicks = clickStats.get(shortcode) || [];
    
    res.json({
      shortcode,
      originalUrl: urlData.originalUrl,
      created: urlData.created,
      expiry: urlData.expiry,
      totalClicks: clicks.length,
      clicks: clicks
    });
    
  } catch (error) {
    await Log('backend', 'error', 'handler', `Error getting stats: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Redirect to original URL
app.get('/:shortcode', async (req, res) => {
  try {
    const { shortcode } = req.params;
    
    await Log('backend', 'info', 'handler', `Redirecting shortcode: ${shortcode}`);
    
    const urlData = urlDatabase.get(shortcode);
    if (!urlData) {
      await Log('backend', 'warn', 'handler', 'Shortcode not found for redirect');
      return res.status(404).json({ error: 'Short URL not found' });
    }
    
    // Check if expired
    if (new Date() > urlData.expiry) {
      await Log('backend', 'warn', 'handler', 'Short URL expired');
      return res.status(410).json({ error: 'Short URL has expired' });
    }
    
    // Get client IP address
    const clientIP = req.headers['x-forwarded-for'] || 
                     req.connection.remoteAddress || 
                     req.socket.remoteAddress ||
                     (req.connection.socket ? req.connection.socket.remoteAddress : null);
    
    // Get location information
    const location = await getLocationFromIP(clientIP);
    
    // Record click
    const clickData = {
      timestamp: new Date(),
      referrer: req.headers.referer || 'Direct',
      userAgent: req.headers['user-agent'] || 'Unknown',
      location: location,
      ip: clientIP
    };
    
    const clicks = clickStats.get(shortcode) || [];
    clicks.push(clickData);
    clickStats.set(shortcode, clicks);
    
    await Log('backend', 'info', 'service', 'Click recorded successfully');
    
    res.redirect(urlData.originalUrl);
    
  } catch (error) {
    await Log('backend', 'error', 'handler', `Redirect error: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  Log('backend', 'info', 'service', `Server started on port ${PORT}`);
});
