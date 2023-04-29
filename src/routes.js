const express = require('express')
const routes = express.Router()
const { apikeyMiddleware, sessionValidationMiddleware, sessionNameValidationMiddleware, rateLimiterMiddleware } = require('./middleware')
const { enableLocalCallbackExample } = require('./config')

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

// API endpoint to check if server is alive
routes.get('/ping', healthController.ping)
// API basic callback
if (enableLocalCallbackExample) {
  routes.post('/localCallbackExample', [apikeyMiddleware, rateLimiterMiddleware], healthController.localCallbackExample)
}

/**
 * ================
 * SESSION ENDPOINTS
 * ================
 */
const sessionRouter = express.Router()
sessionRouter.use([apikeyMiddleware])
routes.use('/session', sessionRouter)

sessionRouter.get('/start/:sessionId', sessionNameValidationMiddleware, sessionController.startSession)
sessionRouter.get('/terminate/:sessionId', sessionNameValidationMiddleware, sessionController.terminateSession)
sessionRouter.get('/terminateInactive', sessionController.terminateInactiveSessions)
sessionRouter.get('/terminateAll', sessionController.terminateAllSessions)

/**
 * ================
 * CLIENT ENDPOINTS
 * ================
 */

const clientRouter = express.Router()
clientRouter.use([apikeyMiddleware, sessionNameValidationMiddleware, sessionValidationMiddleware])
routes.use('/client', clientRouter)

clientRouter.get('/getClassInfo/:sessionId', clientController.getClassInfo)
clientRouter.post('/acceptInvite/:sessionId', clientController.acceptInvite)
clientRouter.post('/archiveChat/:sessionId', clientController.archiveChat)
clientRouter.post('/createGroup/:sessionId', clientController.createGroup)
clientRouter.post('/getBlockedContacts/:sessionId', clientController.getBlockedContacts)
clientRouter.post('/getChatById/:sessionId', clientController.getChatById)
clientRouter.post('/getChatLabels/:sessionId', clientController.getChatLabels)
clientRouter.get('/getChats/:sessionId', clientController.getChats)
clientRouter.post('/getChatsByLabelId/:sessionId', clientController.getChatsByLabelId)
clientRouter.post('/getCommonGroups/:sessionId', clientController.getCommonGroups)
clientRouter.post('/getContactById/:sessionId', clientController.getContactById)
clientRouter.get('/getContacts/:sessionId', clientController.getContacts)
clientRouter.post('/getInviteInfo/:sessionId', clientController.getInviteInfo)
clientRouter.post('/getLabelById/:sessionId', clientController.getLabelById)
clientRouter.post('/getLabels/:sessionId', clientController.getLabels)
clientRouter.post('/getNumberId/:sessionId', clientController.getNumberId)
clientRouter.post('/getProfilePicUrl/:sessionId', clientController.getProfilePictureUrl)
clientRouter.post('/getState/:sessionId', clientController.getState)
clientRouter.post('/markChatUnread/:sessionId', clientController.markChatUnread)
clientRouter.post('/muteChat/:sessionId', clientController.muteChat)
clientRouter.post('/pinChat/:sessionId', clientController.pinChat)
clientRouter.post('/searchMessages/:sessionId', clientController.searchMessages)
clientRouter.post('/sendMessage/:sessionId', clientController.sendMessage)
clientRouter.post('/sendPresenceAvailable/:sessionId', clientController.sendPresenceAvailable)
clientRouter.post('/sendPresenceUnavailable/:sessionId', clientController.sendPresenceUnavailable)
clientRouter.post('/sendSeen/:sessionId', clientController.sendSeen)
clientRouter.post('/setDisplayName/:sessionId', clientController.setDisplayName)
clientRouter.post('/setStatus/:sessionId', clientController.setStatus)
clientRouter.post('/unarchiveChat/:sessionId', clientController.unarchiveChat)
clientRouter.post('/unmuteChat/:sessionId', clientController.unmuteChat)
clientRouter.post('/unpinChat/:sessionId', clientController.unpinChat)

/**
 * ================
 * CHAT ENDPOINTS
 * ================
 */
const chatRouter = express.Router()
chatRouter.use([apikeyMiddleware, sessionNameValidationMiddleware, sessionValidationMiddleware])
routes.use('/chat', chatRouter)

chatRouter.post('/getClassInfo/:sessionId', chatController.getClassInfo)
chatRouter.post('/clearMessages/:sessionId', chatController.clearMessages)
chatRouter.post('/clearState/:sessionId', chatController.clearState)
chatRouter.post('/delete/:sessionId', chatController.deleteChat)
chatRouter.post('/fetchMessages/:sessionId', chatController.fetchMessages)
chatRouter.post('/getContact/:sessionId', chatController.getContact)
chatRouter.post('/sendStateRecording/:sessionId', chatController.sendStateRecording)
chatRouter.post('/sendStateTyping/:sessionId', chatController.sendStateTyping)

/**
 * ================
 * GROUP CHAT ENDPOINTS
 * ================
 */
const groupChatRouter = express.Router()
groupChatRouter.use([apikeyMiddleware, sessionNameValidationMiddleware, sessionValidationMiddleware])
routes.use('/groupChat', groupChatRouter)

groupChatRouter.post('/getClassInfo/:sessionId', groupChatController.getClassInfo)
groupChatRouter.post('/addParticipants/:sessionId', groupChatController.addParticipants)
groupChatRouter.post('/demoteParticipants/:sessionId', groupChatController.demoteParticipants)
groupChatRouter.post('/getInviteCode/:sessionId', groupChatController.getInviteCode)
groupChatRouter.post('/leave/:sessionId', groupChatController.leave)
groupChatRouter.post('/promoteParticipants/:sessionId', groupChatController.promoteParticipants)
groupChatRouter.post('/removeParticipants/:sessionId', groupChatController.removeParticipants)
groupChatRouter.post('/revokeInvite/:sessionId', groupChatController.revokeInvite)
groupChatRouter.post('/setDescription/:sessionId', groupChatController.setDescription)
groupChatRouter.post('/setInfoAdminsOnly/:sessionId', groupChatController.setInfoAdminsOnly)
groupChatRouter.post('/setMessagesAdminsOnly/:sessionId', groupChatController.setMessagesAdminsOnly)
groupChatRouter.post('/setSubject/:sessionId', groupChatController.setSubject)

/**
 * ================
 * MESSAGE ENDPOINTS
 * ================
 */
const messageRouter = express.Router()
messageRouter.use([apikeyMiddleware, sessionNameValidationMiddleware, sessionValidationMiddleware])
routes.use('/message', messageRouter)

messageRouter.post('/getClassInfo/:sessionId', messageController.getClassInfo)
messageRouter.post('/delete/:sessionId', messageController.deleteMessage)
messageRouter.post('/downloadMedia/:sessionId', messageController.downloadMedia)
messageRouter.post('/forward/:sessionId', messageController.forward)
messageRouter.post('/getInfo/:sessionId', messageController.getInfo)
messageRouter.post('/getMentions/:sessionId', messageController.getMentions)
messageRouter.post('/getOrder/:sessionId', messageController.getOrder)
messageRouter.post('/getPayment/:sessionId', messageController.getPayment)
messageRouter.post('/getQuotedMessage/:sessionId', messageController.getQuotedMessage)
messageRouter.post('/react/:sessionId', messageController.react)
messageRouter.post('/reply/:sessionId', messageController.reply)
messageRouter.post('/star/:sessionId', messageController.star)
messageRouter.post('/unstar/:sessionId', messageController.unstar)

/**
 * ================
 * MESSAGE ENDPOINTS
 * ================
 */
const contactRouter = express.Router()
contactRouter.use([apikeyMiddleware, sessionNameValidationMiddleware, sessionValidationMiddleware])
routes.use('/contact', contactRouter)

contactRouter.post('/getClassInfo/:sessionId', contactController.getClassInfo)
contactRouter.post('/block/:sessionId', contactController.block)
contactRouter.post('/getAbout/:sessionId', contactController.getAbout)
contactRouter.post('/getChat/:sessionId', contactController.getChat)
contactRouter.post('/unblock/:sessionId', contactController.unblock)

module.exports = { routes }
