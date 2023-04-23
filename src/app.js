require('./routes')
const { restoreSessions } = require('./sessions')
const { routes } = require('./routes')
const app = require('express')()
const bodyParser = require('body-parser')
const { maxAttachmentSize } = require('./config')

// Initialize Express app (file limit is 100mb from WhatsApp)
app.disable('x-powered-by')
app.use(bodyParser.json({ limit: maxAttachmentSize }))
app.use(bodyParser.urlencoded({ limit: maxAttachmentSize, extended: true }))
app.use('/', routes)

restoreSessions()

module.exports = app
