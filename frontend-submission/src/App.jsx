import { useState } from 'react'
import { Container, AppBar, Toolbar, Typography, Tabs, Tab, Box } from '@mui/material'
import UrlShortener from './components/UrlShortener.jsx'
import Statistics from './components/Statistics.jsx'
import { Log } from './logger.js'

function App() {
  const [tabValue, setTabValue] = useState(0)

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
    Log('frontend', 'info', 'component', `Tab changed to ${newValue}`)
  }

  return (
    <>
      <Container maxWidth="lg" sx={{ mt: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Shorten URLs" />
          <Tab label="Statistics" />
        </Tabs>
        
        <Box sx={{ mt: 2 }}>
          {tabValue === 0 && <UrlShortener />}
          {tabValue === 1 && <Statistics />}
        </Box>
      </Container>
    </>
  )
}

export default App
