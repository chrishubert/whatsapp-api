const axios = require('axios')
const { baseWebhookURL, globalApiKey } = require('./config')

// Trigger webhook endpoint
const triggerWebhook = (sessionId, dataType, data) => {
  axios.post(baseWebhookURL, { dataType, data, sessionId }, { headers: { 'x-api-key': globalApiKey } })
    .catch(error => console.error('Failed to send new message webhook:', error.message))
}

// Function to send a response with error status and message
const sendErrorResponse = (res, status, message) => {
  res.status(status).json({ error: message })
}

module.exports = { triggerWebhook, sendErrorResponse }
