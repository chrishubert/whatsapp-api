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
clientRouter.use(apikeyMiddleware)
routes.use('/client', clientRouter)

clientRouter.get('/getClassInfo/:sessionId', [sessionNameValidationMiddleware, sessionValidationMiddleware], clientController.getClassInfo)
clientRouter.post('/acceptInvite/:sessionId', [sessionNameValidationMiddleware, sessionValidationMiddleware], clientController.acceptInvite)
clientRouter.post('/archiveChat/:sessionId', [sessionNameValidationMiddleware, sessionValidationMiddleware], clientController.archiveChat)
clientRouter.post('/createGroup/:sessionId', [sessionNameValidationMiddleware, sessionValidationMiddleware], clientController.createGroup)
clientRouter.post('/getBlockedContacts/:sessionId', [sessionNameValidationMiddleware, sessionValidationMiddleware], clientController.getBlockedContacts)
clientRouter.post('/getChatById/:sessionId', [sessionNameValidationMiddleware, sessionValidationMiddleware], clientController.getChatById)
clientRouter.post('/getChatLabels/:sessionId', [sessionNameValidationMiddleware, sessionValidationMiddleware], clientController.getChatLabels)
clientRouter.get('/getChats/:sessionId', [sessionNameValidationMiddleware, sessionValidationMiddleware], clientController.getChats)
clientRouter.post('/getChatsByLabelId/:sessionId', [sessionNameValidationMiddleware, sessionValidationMiddleware], clientController.getChatsByLabelId)
clientRouter.post('/getCommonGroups/:sessionId', [sessionNameValidationMiddleware, sessionValidationMiddleware], clientController.getCommonGroups)
clientRouter.post('/getContactById/:sessionId', [sessionNameValidationMiddleware, sessionValidationMiddleware], clientController.getContactById)
clientRouter.get('/getContacts/:sessionId', [sessionNameValidationMiddleware, sessionValidationMiddleware], clientController.getContacts)
clientRouter.post('/getInviteInfo/:sessionId', [sessionNameValidationMiddleware, sessionValidationMiddleware], clientController.getInviteInfo)
clientRouter.post('/getLabelById/:sessionId', [sessionNameValidationMiddleware, sessionValidationMiddleware], clientController.getLabelById)
clientRouter.post('/getLabels/:sessionId', [sessionNameValidationMiddleware, sessionValidationMiddleware], clientController.getLabels)
clientRouter.post('/getNumberId/:sessionId', [sessionNameValidationMiddleware, sessionValidationMiddleware], clientController.getNumberId)
clientRouter.post('/getProfilePicUrl/:sessionId', [sessionNameValidationMiddleware, sessionValidationMiddleware], clientController.getProfilePictureUrl)
clientRouter.get('/getState/:sessionId', [sessionNameValidationMiddleware], clientController.getState)
clientRouter.post('/markChatUnread/:sessionId', [sessionNameValidationMiddleware, sessionValidationMiddleware], clientController.markChatUnread)
clientRouter.post('/muteChat/:sessionId', [sessionNameValidationMiddleware, sessionValidationMiddleware], clientController.muteChat)
clientRouter.post('/pinChat/:sessionId', [sessionNameValidationMiddleware, sessionValidationMiddleware], clientController.pinChat)
clientRouter.post('/searchMessages/:sessionId', [sessionNameValidationMiddleware, sessionValidationMiddleware], clientController.searchMessages)
clientRouter.post('/sendMessage/:sessionId', [sessionNameValidationMiddleware, sessionValidationMiddleware], clientController.sendMessage)
clientRouter.post('/sendPresenceAvailable/:sessionId', [sessionNameValidationMiddleware, sessionValidationMiddleware], clientController.sendPresenceAvailable)
clientRouter.post('/sendPresenceUnavailable/:sessionId', [sessionNameValidationMiddleware, sessionValidationMiddleware], clientController.sendPresenceUnavailable)
clientRouter.post('/sendSeen/:sessionId', [sessionNameValidationMiddleware, sessionValidationMiddleware], clientController.sendSeen)
clientRouter.post('/setDisplayName/:sessionId', [sessionNameValidationMiddleware, sessionValidationMiddleware], clientController.setDisplayName)
clientRouter.post('/setStatus/:sessionId', [sessionNameValidationMiddleware, sessionValidationMiddleware], clientController.setStatus)
clientRouter.post('/unarchiveChat/:sessionId', [sessionNameValidationMiddleware, sessionValidationMiddleware], clientController.unarchiveChat)
clientRouter.post('/unmuteChat/:sessionId', [sessionNameValidationMiddleware, sessionValidationMiddleware], clientController.unmuteChat)
clientRouter.post('/unpinChat/:sessionId', [sessionNameValidationMiddleware, sessionValidationMiddleware], clientController.unpinChat)

/**
 * ================
 * CHAT ENDPOINTS
 * ================
 */
const chatRouter = express.Router()
chatRouter.use(apikeyMiddleware)
routes.use('/chat', chatRouter)

chatRouter.post('/getClassInfo/:sessionId', [sessionNameValidationMiddleware, sessionValidationMiddleware], chatController.getClassInfo)
chatRouter.post('/clearMessages/:sessionId', [sessionNameValidationMiddleware, sessionValidationMiddleware], chatController.clearMessages)
chatRouter.post('/clearState/:sessionId', [sessionNameValidationMiddleware, sessionValidationMiddleware], chatController.clearState)
chatRouter.post('/delete/:sessionId', [sessionNameValidationMiddleware, sessionValidationMiddleware], chatController.deleteChat)
chatRouter.post('/fetchMessages/:sessionId', [sessionNameValidationMiddleware, sessionValidationMiddleware], chatController.fetchMessages)
chatRouter.post('/getContact/:sessionId', [sessionNameValidationMiddleware, sessionValidationMiddleware], chatController.getContact)
chatRouter.post('/sendStateRecording/:sessionId', [sessionNameValidationMiddleware, sessionValidationMiddleware], chatController.sendStateRecording)
chatRouter.post('/sendStateTyping/:sessionId', [sessionNameValidationMiddleware, sessionValidationMiddleware], chatController.sendStateTyping)

/**
 * ================
 * GROUP CHAT ENDPOINTS
 * ================
 */
const groupChatRouter = express.Router()
groupChatRouter.use(apikeyMiddleware)
routes.use('/groupChat', groupChatRouter)

groupChatRouter.post('/getClassInfo/:sessionId', [sessionNameValidationMiddleware, sessionValidationMiddleware], groupChatController.getClassInfo)
groupChatRouter.post('/addParticipants/:sessionId', [sessionNameValidationMiddleware, sessionValidationMiddleware], groupChatController.addParticipants)
groupChatRouter.post('/demoteParticipants/:sessionId', [sessionNameValidationMiddleware, sessionValidationMiddleware], groupChatController.demoteParticipants)
groupChatRouter.post('/getInviteCode/:sessionId', [sessionNameValidationMiddleware, sessionValidationMiddleware], groupChatController.getInviteCode)
groupChatRouter.post('/leave/:sessionId', [sessionNameValidationMiddleware, sessionValidationMiddleware], groupChatController.leave)
groupChatRouter.post('/promoteParticipants/:sessionId', [sessionNameValidationMiddleware, sessionValidationMiddleware], groupChatController.promoteParticipants)
groupChatRouter.post('/removeParticipants/:sessionId', [sessionNameValidationMiddleware, sessionValidationMiddleware], groupChatController.removeParticipants)
groupChatRouter.post('/revokeInvite/:sessionId', [sessionNameValidationMiddleware, sessionValidationMiddleware], groupChatController.revokeInvite)
groupChatRouter.post('/setDescription/:sessionId', [sessionNameValidationMiddleware, sessionValidationMiddleware], groupChatController.setDescription)
groupChatRouter.post('/setInfoAdminsOnly/:sessionId', [sessionNameValidationMiddleware, sessionValidationMiddleware], groupChatController.setInfoAdminsOnly)
groupChatRouter.post('/setMessagesAdminsOnly/:sessionId', [sessionNameValidationMiddleware, sessionValidationMiddleware], groupChatController.setMessagesAdminsOnly)
groupChatRouter.post('/setSubject/:sessionId', [sessionNameValidationMiddleware, sessionValidationMiddleware], groupChatController.setSubject)

/**
 * ================
 * MESSAGE ENDPOINTS
 * ================
 */
const messageRouter = express.Router()
messageRouter.use(apikeyMiddleware)
routes.use('/message', messageRouter)

messageRouter.post('/getClassInfo/:sessionId', [sessionNameValidationMiddleware, sessionValidationMiddleware], messageController.getClassInfo)
messageRouter.post('/delete/:sessionId', [sessionNameValidationMiddleware, sessionValidationMiddleware], messageController.deleteMessage)
messageRouter.post('/downloadMedia/:sessionId', [sessionNameValidationMiddleware, sessionValidationMiddleware], messageController.downloadMedia)
messageRouter.post('/forward/:sessionId', [sessionNameValidationMiddleware, sessionValidationMiddleware], messageController.forward)
messageRouter.post('/getInfo/:sessionId', [sessionNameValidationMiddleware, sessionValidationMiddleware], messageController.getInfo)
messageRouter.post('/getMentions/:sessionId', [sessionNameValidationMiddleware, sessionValidationMiddleware], messageController.getMentions)
messageRouter.post('/getOrder/:sessionId', [sessionNameValidationMiddleware, sessionValidationMiddleware], messageController.getOrder)
messageRouter.post('/getPayment/:sessionId', [sessionNameValidationMiddleware, sessionValidationMiddleware], messageController.getPayment)
messageRouter.post('/getQuotedMessage/:sessionId', [sessionNameValidationMiddleware, sessionValidationMiddleware], messageController.getQuotedMessage)
messageRouter.post('/react/:sessionId', [sessionNameValidationMiddleware, sessionValidationMiddleware], messageController.react)
messageRouter.post('/reply/:sessionId', [sessionNameValidationMiddleware, sessionValidationMiddleware], messageController.reply)
messageRouter.post('/star/:sessionId', [sessionNameValidationMiddleware, sessionValidationMiddleware], messageController.star)
messageRouter.post('/unstar/:sessionId', [sessionNameValidationMiddleware, sessionValidationMiddleware], messageController.unstar)

/**
 * ================
 * MESSAGE ENDPOINTS
 * ================
 */
const contactRouter = express.Router()
contactRouter.use(apikeyMiddleware)
routes.use('/contact', contactRouter)

contactRouter.post('/getClassInfo/:sessionId', [sessionNameValidationMiddleware, sessionValidationMiddleware], contactController.getClassInfo)
contactRouter.post('/block/:sessionId', [sessionNameValidationMiddleware, sessionValidationMiddleware], contactController.block)
contactRouter.post('/getAbout/:sessionId', [sessionNameValidationMiddleware, sessionValidationMiddleware], contactController.getAbout)
contactRouter.post('/getChat/:sessionId', [sessionNameValidationMiddleware, sessionValidationMiddleware], contactController.getChat)
contactRouter.post('/unblock/:sessionId', [sessionNameValidationMiddleware, sessionValidationMiddleware], contactController.unblock)

module.exports = { routes }
