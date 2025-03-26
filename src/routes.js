const express = require('express')
const routes = express.Router()
const swaggerUi = require('swagger-ui-express')
const swaggerDocument = require('../swagger.json')
const { enableLocalCallbackExample, enableSwaggerEndpoint } = require('./config')

const middleware = require('./middleware')
const healthController = require('./controllers/healthController')
const sessionController = require('./controllers/sessionController')
const clientController = require('./controllers/clientController')
const chatController = require('./controllers/chatController')
const groupChatController = require('./controllers/groupChatController')
const messageController = require('./controllers/messageController')
const contactController = require('./controllers/contactController')

/**
 * ================
 * HEALTH ENDPOINTS
 * ================
 */

// Apply health swagger middleware
routes.use('/ping', middleware.healthSwagger)

// API endpoint to check if server is alive
routes.get('/ping', healthController.ping)
// API basic callback
if (enableLocalCallbackExample) {
  routes.use('/localCallbackExample', middleware.healthSwagger)
  routes.post('/localCallbackExample', [middleware.apikey, middleware.rateLimiter], healthController.localCallbackExample)
}

/**
 * ================
 * SESSION ENDPOINTS
 * ================
 */
const sessionRouter = express.Router()
sessionRouter.use(middleware.apikey)
routes.use('/session', sessionRouter)
// Apply session swagger middleware to all session routes
sessionRouter.use(middleware.sessionSwagger)

sessionRouter.get('/start/:sessionId', middleware.sessionNameValidation, sessionController.startSession)
sessionRouter.get('/status/:sessionId', middleware.sessionNameValidation, sessionController.statusSession)
sessionRouter.get('/qr/:sessionId', middleware.sessionNameValidation, sessionController.sessionQrCode)
sessionRouter.get('/qr/:sessionId/image', middleware.sessionNameValidation, sessionController.sessionQrCodeImage)
sessionRouter.get('/restart/:sessionId', middleware.sessionNameValidation, sessionController.restartSession)
sessionRouter.get('/terminate/:sessionId', middleware.sessionNameValidation, sessionController.terminateSession)
sessionRouter.get('/terminateInactive', sessionController.terminateInactiveSessions)
sessionRouter.get('/terminateAll', sessionController.terminateAllSessions)

/**
 * ================
 * CLIENT ENDPOINTS
 * ================
 */

const clientRouter = express.Router()
clientRouter.use(middleware.apikey)
routes.use('/client', clientRouter)
// Apply client swagger middleware to all client routes
clientRouter.use(middleware.clientSwagger)

clientRouter.get('/getClassInfo/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], clientController.getClassInfo)
clientRouter.post('/acceptInvite/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], clientController.acceptInvite)
clientRouter.post('/archiveChat/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], clientController.archiveChat)
clientRouter.post('/createGroup/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], clientController.createGroup)
clientRouter.post('/getBlockedContacts/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], clientController.getBlockedContacts)
clientRouter.post('/getChatById/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], clientController.getChatById)
clientRouter.post('/getChatLabels/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], clientController.getChatLabels)
clientRouter.get('/getChats/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], clientController.getChats)
clientRouter.post('/getChatsByLabelId/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], clientController.getChatsByLabelId)
clientRouter.post('/getCommonGroups/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], clientController.getCommonGroups)
clientRouter.post('/getContactById/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], clientController.getContactById)
clientRouter.get('/getContacts/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], clientController.getContacts)
clientRouter.post('/getInviteInfo/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], clientController.getInviteInfo)
clientRouter.post('/getLabelById/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], clientController.getLabelById)
clientRouter.post('/getLabels/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], clientController.getLabels)
clientRouter.post('/addOrRemoveLabels/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], clientController.addOrRemoveLabels)
clientRouter.post('/getNumberId/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], clientController.getNumberId)
clientRouter.post('/isRegisteredUser/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], clientController.isRegisteredUser)
clientRouter.post('/getProfilePicUrl/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], clientController.getProfilePictureUrl)
clientRouter.get('/getState/:sessionId', [middleware.sessionNameValidation], clientController.getState)
clientRouter.post('/markChatUnread/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], clientController.markChatUnread)
clientRouter.post('/muteChat/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], clientController.muteChat)
clientRouter.post('/pinChat/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], clientController.pinChat)
clientRouter.post('/searchMessages/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], clientController.searchMessages)
clientRouter.post('/sendMessage/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], clientController.sendMessage)
clientRouter.post('/sendPresenceAvailable/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], clientController.sendPresenceAvailable)
clientRouter.post('/sendPresenceUnavailable/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], clientController.sendPresenceUnavailable)
clientRouter.post('/sendSeen/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], clientController.sendSeen)
clientRouter.post('/setDisplayName/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], clientController.setDisplayName)
clientRouter.post('/setProfilePicture/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], clientController.setProfilePicture)
clientRouter.post('/setStatus/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], clientController.setStatus)
clientRouter.post('/unarchiveChat/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], clientController.unarchiveChat)
clientRouter.post('/unmuteChat/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], clientController.unmuteChat)
clientRouter.post('/unpinChat/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], clientController.unpinChat)
clientRouter.get('/getWWebVersion/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], clientController.getWWebVersion)

/**
 * ================
 * CHAT ENDPOINTS
 * ================
 */
const chatRouter = express.Router()
chatRouter.use(middleware.apikey)
routes.use('/chat', chatRouter)
// Apply chat swagger middleware to all chat routes
chatRouter.use(middleware.chatSwagger)

chatRouter.post('/getClassInfo/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], chatController.getClassInfo)
chatRouter.post('/clearMessages/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], chatController.clearMessages)
chatRouter.post('/clearState/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], chatController.clearState)
chatRouter.post('/delete/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], chatController.deleteChat)
chatRouter.post('/fetchMessages/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], chatController.fetchMessages)
chatRouter.post('/getContact/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], chatController.getContact)
chatRouter.post('/sendStateRecording/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], chatController.sendStateRecording)
chatRouter.post('/sendStateTyping/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], chatController.sendStateTyping)

/**
 * ================
 * GROUP CHAT ENDPOINTS
 * ================
 */
const groupChatRouter = express.Router()
groupChatRouter.use(middleware.apikey)
routes.use('/groupChat', groupChatRouter)
// Apply group chat swagger middleware - make sure all group routes get the right tags
groupChatRouter.use(middleware.groupChatSwagger)

groupChatRouter.post('/getClassInfo/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], groupChatController.getClassInfo)
groupChatRouter.post('/addParticipants/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], groupChatController.addParticipants)
groupChatRouter.post('/demoteParticipants/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], groupChatController.demoteParticipants)
groupChatRouter.post('/getInviteCode/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], groupChatController.getInviteCode)
groupChatRouter.post('/leave/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], groupChatController.leave)
groupChatRouter.post('/promoteParticipants/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], groupChatController.promoteParticipants)
groupChatRouter.post('/removeParticipants/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], groupChatController.removeParticipants)
groupChatRouter.post('/revokeInvite/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], groupChatController.revokeInvite)
groupChatRouter.post('/setDescription/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], groupChatController.setDescription)
groupChatRouter.post('/setInfoAdminsOnly/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], groupChatController.setInfoAdminsOnly)
groupChatRouter.post('/setMessagesAdminsOnly/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], groupChatController.setMessagesAdminsOnly)
groupChatRouter.post('/setSubject/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], groupChatController.setSubject)
groupChatRouter.post('/setPicture/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], groupChatController.setPicture)
groupChatRouter.post('/deletePicture/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], groupChatController.deletePicture)

/**
 * ================
 * MESSAGE ENDPOINTS
 * ================
 */
const messageRouter = express.Router()
messageRouter.use(middleware.apikey)
routes.use('/message', messageRouter)
// Apply message swagger middleware to all message routes
messageRouter.use(middleware.messageSwagger)

messageRouter.post('/getClassInfo/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], messageController.getClassInfo)
messageRouter.post('/delete/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], messageController.deleteMessage)
messageRouter.post('/downloadMedia/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], messageController.downloadMedia)
messageRouter.post('/forward/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], messageController.forward)
messageRouter.post('/getInfo/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], messageController.getInfo)
messageRouter.post('/getMentions/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], messageController.getMentions)
messageRouter.post('/getOrder/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], messageController.getOrder)
messageRouter.post('/getPayment/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], messageController.getPayment)
messageRouter.post('/getQuotedMessage/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], messageController.getQuotedMessage)
messageRouter.post('/react/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], messageController.react)
messageRouter.post('/reply/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], messageController.reply)
messageRouter.post('/star/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], messageController.star)
messageRouter.post('/unstar/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], messageController.unstar)

/**
 * ================
 * CONTACT ENDPOINTS
 * ================
 */
const contactRouter = express.Router()
contactRouter.use(middleware.apikey)
routes.use('/contact', contactRouter)
// Apply contact swagger middleware to all contact routes
contactRouter.use(middleware.contactSwagger)

contactRouter.post('/getClassInfo/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], contactController.getClassInfo)
contactRouter.post('/block/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], contactController.block)
contactRouter.post('/getAbout/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], contactController.getAbout)
contactRouter.post('/getChat/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], contactController.getChat)
contactRouter.post('/unblock/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], contactController.unblock)
contactRouter.post('/getFormattedNumber/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], contactController.getFormattedNumber)
contactRouter.post('/getCountryCode/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], contactController.getCountryCode)
contactRouter.post('/getProfilePicUrl/:sessionId', [middleware.sessionNameValidation, middleware.sessionValidation], contactController.getProfilePicUrl)

/**
 * ================
 * SWAGGER ENDPOINTS
 * ================
 */
if (enableSwaggerEndpoint) {
  // Basic Auth middleware for Swagger docs
  const swaggerBasicAuth = (req, res, next) => {
    // Get credentials from environment variables or use defaults
    const SWAGGER_USER = process.env.SWAGGER_USER || 'admin'
    const SWAGGER_PASSWORD = process.env.SWAGGER_PASSWORD || 'password'

    // Check for authorization header
    const authHeader = req.headers.authorization

    if (!authHeader) {
      res.setHeader('WWW-Authenticate', 'Basic realm="Swagger API Documentation"')
      return res.status(401).send('Authentication required to access API documentation')
    }

    // Get the encoded credentials
    const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':')
    const user = auth[0]
    const password = auth[1]

    // Compare with expected credentials
    if (user === SWAGGER_USER && password === SWAGGER_PASSWORD) {
      return next()
    }

    // Authentication failed
    res.setHeader('WWW-Authenticate', 'Basic realm="Swagger API Documentation"')
    return res.status(401).send('Invalid credentials')
  }

  // Apply auth middleware to Swagger routes
  routes.use('/api-docs', swaggerBasicAuth, swaggerUi.serve)
  routes.get('/api-docs', swaggerUi.setup(swaggerDocument, {
    explorer: true,
    customCss: `
      .swagger-ui .topbar { display: none }
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
      @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500&display=swap');
    `,
    customCssUrl: '/assets/swagger-custom.css',
    customSiteTitle: 'WEE API Documentation',
    customfavIcon: '/assets/favicon.png',
    swaggerOptions: {
      docExpansion: 'none',
      defaultModelsExpandDepth: 0,
      defaultModelExpandDepth: 2,
      deepLinking: true,
      displayRequestDuration: true,
      filter: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      persistAuthorization: true,
      syntaxHighlight: {
        activate: true,
        theme: 'monokai'
      }
    }
  }) /* #swagger.ignore = true */)
}

module.exports = { routes }
