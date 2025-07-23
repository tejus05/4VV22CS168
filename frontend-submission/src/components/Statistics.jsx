import { useState, useEffect } from 'react'
import { 
  Paper, 
  Typography, 
  Card, 
  CardContent, 
  Box,
  Chip,
  List,
  ListItem,
  ListItemText,
  Button,
  CircularProgress
} from '@mui/material'
import { Log } from '../logger.js'

function Statistics() {
  const [urlStats, setUrlStats] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchStatistics = async () => {
    setLoading(true)
    try {
      Log('frontend', 'info', 'component', 'Loading statistics page')
      
      // Get stored shortcodes from localStorage
      const storedUrls = localStorage.getItem('createdUrls')
      if (!storedUrls) {
        setUrlStats([])
        setLoading(false)
        return
      }

      const shortcodes = JSON.parse(storedUrls)
      const statsPromises = shortcodes.map(async (shortcode) => {
        try {
          const response = await fetch(`http://localhost:8080/shorturls/${shortcode}`)
          if (response.ok) {
            return await response.json()
          }
          return null
        } catch (error) {
          Log('frontend', 'error', 'api', `Failed to fetch stats for ${shortcode}`)
          return null
        }
      })

      const results = await Promise.all(statsPromises)
      const validStats = results.filter(stat => stat !== null)
      setUrlStats(validStats)
      Log('frontend', 'info', 'api', `Loaded ${validStats.length} URL statistics`)
      
    } catch (error) {
      Log('frontend', 'error', 'component', 'Failed to load statistics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatistics()
  }, [])

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">URL Statistics</Typography>
        <Button variant="outlined" onClick={fetchStatistics} disabled={loading}>
          {loading ? <CircularProgress size={20} /> : 'Refresh'}
        </Button>
      </Box>
      
      {loading && urlStats.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : urlStats.length === 0 ? (
        <Typography color="text.secondary">
          No shortened URLs yet. Create some URLs to see statistics here.
        </Typography>
      ) : (
        urlStats.map((stat, index) => (
          <Card key={index} sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ mb: 1 }}>
                <Typography 
                  variant="h6" 
                  component="a"
                  href={`http://localhost:8080/${stat.shortcode}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ 
                    color: 'primary.main',
                    textDecoration: 'underline',
                    '&:hover': {
                      textDecoration: 'none'
                    }
                  }}
                >
                  localhost:8080/{stat.shortcode}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
                  → {stat.originalUrl}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <Chip label={`${stat.totalClicks} clicks`} color="primary" size="small" />
                <Chip 
                  label={`Created: ${new Date(stat.created).toLocaleDateString()}`} 
                  size="small" 
                />
                <Chip 
                  label={`Expires: ${new Date(stat.expiry).toLocaleDateString()}`} 
                  size="small" 
                />
              </Box>
              
              {stat.clicks.length > 0 && (
                <>
                  <Typography variant="subtitle2" gutterBottom>Click Details:</Typography>
                  <List dense>
                    {stat.clicks.map((click, clickIndex) => (
                      <ListItem key={clickIndex} sx={{ py: 0.5 }}>
                        <ListItemText
                          primary={`${new Date(click.timestamp).toLocaleString()}`}
                          secondary={`From: ${click.referrer} | Location: ${click.location}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </Paper>
  )
}

export default Statistics
