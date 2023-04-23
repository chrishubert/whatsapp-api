const { globalApiKey } = require('./config')
const { sendErrorResponse } = require('./utils')
const { validateSession } = require('./sessions')
const rateLimiter = require('express-rate-limit')

// Middleware for securing endpoints with API key
const apikeyMiddleware = (req, res, next) => {
  if (globalApiKey) {
    const apiKey = req.headers['x-api-key']
    if (!apiKey || apiKey !== globalApiKey) {
      return sendErrorResponse(res, 403, 'Invalid API key')
    }
  }
  next()
}

const sessionValidationMiddleware = async (req, res, next) => {
  const validation = await validateSession(req.params.sessionId)
  if (validation !== true) {
    return sendErrorResponse(res, 404, validation)
  }
  next()
}

const rateLimiterMiddleware = rateLimiter({
  max: 500,
  windowMS: 1000, // 1 second
  message: "You can't make any more requests at the moment. Try again later"
})

module.exports = {
  sessionValidationMiddleware,
  apikeyMiddleware,
  rateLimiterMiddleware
}
