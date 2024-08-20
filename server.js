const express = require('express')
const app = require('./src/app')
const path = require('path')
const { useFrontend } = require('./src/config')
require('dotenv').config()

// Start the server
const port = process.env.PORT || 5000

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
