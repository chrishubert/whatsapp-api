require('./routes')
const { restoreSessions } = require('./sessions')
const { routes } = require('./routes')

// Import required modules
const app = require('express')()
const bodyParser = require('body-parser')

// Initialize Express app
app.disable('x-powered-by')
app.use(bodyParser.json({ limit: '100mb' }))
app.use('/', routes)

restoreSessions()

module.exports = app
