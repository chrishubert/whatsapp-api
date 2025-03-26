require('./routes')
const { restoreSessions } = require('./sessions')
const { routes } = require('./routes')
const app = require('express')()
const bodyParser = require('body-parser')
const { maxAttachmentSize } = require('./config')
const express = require('express')
const path = require('path')

// Initialize Express app
app.disable('x-powered-by')
app.use(bodyParser.json({ limit: maxAttachmentSize + 1000000 }))
app.use(bodyParser.urlencoded({ limit: maxAttachmentSize + 1000000, extended: true }))

// Serve static assets from assets directory
app.use('/assets', express.static(path.join(__dirname, '..', 'assets')))

app.use('/', routes)

restoreSessions()

module.exports = app
