const express = require('express')
const app = require('./src/app')
const path = require('path')
const { baseWebhookURL, useFrontend } = require('./src/config')
require('dotenv').config()

// Start the server
const port = process.env.API_PORT || 5000

// Check if BASE_WEBHOOK_URL environment variable is available
if (!baseWebhookURL) {
  console.error('BASE_WEBHOOK_URL environment variable is not available. Exiting...')
  process.exit(1) // Terminate the application with an error code
}

if (useFrontend) {
  // Serve static files from the React app
  app.use(express.static(path.join(__dirname, 'frontend/build')))
  // Handle any requests that don't match the ones above
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'))
  })
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
