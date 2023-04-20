const { globalApiKey } = require('./config')
const { sendErrorResponse } = require('./utils')
const { validateSession } = require('./sessions')

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

module.exports = {
  sessionValidationMiddleware,
  apikeyMiddleware
}
