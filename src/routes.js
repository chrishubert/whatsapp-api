const routes = require('express').Router()
const { apikeyMiddleware, sessionValidationMiddleware, sessionNameValidationMiddleware, rateLimiterMiddleware } = require('./middleware')
const { enableLocalCallbackExample } = require('./config')

const { ping, localCallbackExample } = require('./controllers/healthController')
const { startSession, terminateSession, terminateInactiveSessions, terminateAllSessions } = require('./controllers/sessionController')
const { sendMessage, getSessionInfo, isRegisteredUser, createGroup, setStatus, getContacts, getChats, getProfilePictureUrl } = require('./controllers/actionController')

/**
 * ================
 * HEALTH ENDPOINTS
 * ================
 */

// API endpoint to check if server is alive
routes.get('/ping', ping)
// API basic callback
if (enableLocalCallbackExample) {
  routes.post('/localCallbackExample', [apikeyMiddleware, rateLimiterMiddleware], localCallbackExample)
}

/**
 * ================
 * SESSION ENDPOINTS
 * ================
 */

// API endpoint for starting the session
routes.get('/api/startSession/:sessionId', [apikeyMiddleware, sessionNameValidationMiddleware], startSession)
// API endpoint for logging out
routes.get('/api/terminateSession/:sessionId', [apikeyMiddleware, sessionNameValidationMiddleware], terminateSession)
// API endpoint for flushing all non-connected sessions
routes.get('/api/terminateInactiveSessions', apikeyMiddleware, terminateInactiveSessions)
// API endpoint for flushing all sessions
routes.get('/api/terminateAllSessions', apikeyMiddleware, terminateAllSessions)

/**
 * ================
 * ACTION ENDPOINTS
 * ================
 */

// API endpoint for sending a message
routes.post('/api/sendMessage/:sessionId', [apikeyMiddleware, sessionNameValidationMiddleware, sessionValidationMiddleware], sendMessage)
// API endpoint for validating WhatsApp number
routes.get('/api/getSessionInfo/:sessionId', [apikeyMiddleware, sessionNameValidationMiddleware, sessionValidationMiddleware], getSessionInfo)
// API endpoint for validating WhatsApp number
routes.post('/api/isRegisteredUser/:sessionId', [apikeyMiddleware, sessionNameValidationMiddleware, sessionValidationMiddleware], isRegisteredUser)
// API endpoint for creating group
routes.post('/api/createGroup/:sessionId', [apikeyMiddleware, sessionNameValidationMiddleware, sessionValidationMiddleware], createGroup)
// API endpoint to set Status
routes.post('/api/setStatus/:sessionId', [apikeyMiddleware, sessionNameValidationMiddleware, sessionValidationMiddleware], setStatus)
// API endpoint for getting contacts
routes.get('/api/getContacts/:sessionId', [apikeyMiddleware, sessionNameValidationMiddleware, sessionValidationMiddleware], getContacts)
// API endpoint for getting chats
routes.get('/api/getChats/:sessionId', [apikeyMiddleware, sessionNameValidationMiddleware, sessionValidationMiddleware], getChats)
// API endpoint for getting profile picture
routes.post('/api/getProfilePicUrl/:sessionId', [apikeyMiddleware, sessionNameValidationMiddleware, sessionValidationMiddleware], getProfilePictureUrl)

module.exports = { routes }
