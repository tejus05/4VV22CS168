import { useState } from 'react'
import { 
  Paper, 
  TextField, 
  Button, 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent,
  Alert 
} from '@mui/material'
import { Log } from '../logger.js'

const API_BASE = 'http://localhost:8080'

function UrlShortener() {
  const [urls, setUrls] = useState([
    { originalUrl: '', validity: 30, shortcode: '', result: null, error: '' }
  ])

  const addUrlField = () => {
    if (urls.length < 5) {
      setUrls([...urls, { originalUrl: '', validity: 30, shortcode: '', result: null, error: '' }])
      Log('frontend', 'info', 'component', 'Added new URL field')
    }
  }

  const updateUrl = (index, field, value) => {
    const newUrls = [...urls]
    newUrls[index][field] = value
    newUrls[index].error = '' // Clear error
    setUrls(newUrls)
  }

  const validateUrl = (url) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const shortenUrl = async (index) => {
    const urlData = urls[index]
    
    // Basic validation
    if (!urlData.originalUrl) {
      updateUrl(index, 'error', 'URL is required')
      return
    }
    
    if (!validateUrl(urlData.originalUrl)) {
      updateUrl(index, 'error', 'Please enter a valid URL')
      return
    }

    if (urlData.validity && isNaN(urlData.validity)) {
      updateUrl(index, 'error', 'Validity must be a number')
      return
    }

    try {
      Log('frontend', 'info', 'api', 'Sending URL shortening request')
      
      const response = await fetch(`${API_BASE}/shorturls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: urlData.originalUrl,
          validity: parseInt(urlData.validity) || 30,
          shortcode: urlData.shortcode || undefined
        })
      })

      const result = await response.json()
      
      if (response.ok) {
        updateUrl(index, 'result', result)
        
        // Extract shortcode from the result and store it
        const shortcode = result.shortLink.split('/').pop()
        if (shortcode) {
          const existingUrls = JSON.parse(localStorage.getItem('createdUrls') || '[]')
          if (!existingUrls.includes(shortcode)) {
            existingUrls.push(shortcode)
            localStorage.setItem('createdUrls', JSON.stringify(existingUrls))
          }
        }
        
        Log('frontend', 'info', 'api', 'URL shortened successfully')
      } else {
        updateUrl(index, 'error', result.error || 'Failed to shorten URL')
        Log('frontend', 'error', 'api', `URL shortening failed: ${result.error}`)
      }
    } catch (error) {
      updateUrl(index, 'error', 'Network error')
      Log('frontend', 'error', 'api', `Network error: ${error.message}`)
    }
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Shorten Your URLs</Typography>
      
      {urls.map((urlData, index) => (
        <Card key={index} sx={{ mb: 2 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Original URL"
                  value={urlData.originalUrl}
                  onChange={(e) => updateUrl(index, 'originalUrl', e.target.value)}
                  placeholder="https://example.com"
                />
              </Grid>
              <Grid size={{ xs: 6, md: 2 }}>
                <TextField
                  fullWidth
                  label="Validity (minutes)"
                  type="number"
                  value={urlData.validity}
                  onChange={(e) => updateUrl(index, 'validity', e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 6, md: 2 }}>
                <TextField
                  fullWidth
                  label="Custom Shortcode"
                  value={urlData.shortcode}
                  onChange={(e) => updateUrl(index, 'shortcode', e.target.value)}
                  placeholder="optional"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 2 }}>
                <Button 
                  fullWidth 
                  variant="contained" 
                  onClick={() => shortenUrl(index)}
                  sx={{ height: '56px' }}
                >
                  Shorten
                </Button>
              </Grid>
            </Grid>
            
            {urlData.error && (
              <Alert severity="error" sx={{ mt: 2 }}>{urlData.error}</Alert>
            )}
            
            {urlData.result && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="subtitle2">Short URL:</Typography>
                <Typography 
                  variant="body2" 
                  component="a"
                  href={urlData.result.shortLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ 
                    wordBreak: 'break-all', 
                    color: 'primary.main',
                    textDecoration: 'underline',
                    '&:hover': {
                      textDecoration: 'none'
                    }
                  }}
                >
                  {urlData.result.shortLink}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  Expires: {new Date(urlData.result.expiry).toLocaleString()}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      ))}
      
      {urls.length < 5 && (
        <Button variant="outlined" onClick={addUrlField}>
          Add Another URL
        </Button>
      )}
    </Paper>
  )
}

export default UrlShortener
