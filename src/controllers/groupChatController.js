const { sessions } = require('../sessions')
const { sendErrorResponse } = require('../utils')

/**
 * Adds participants to a group chat.
 * @async
 * @function
 * @param {Object} req - The request object containing the chatId and contactIds in the body.
 * @param {string} req.body.chatId - The ID of the group chat.
 * @param {Array<string>} req.body.contactIds - An array of contact IDs to be added to the group.
 * @param {Object} res - The response object.
 * @returns {Object} Returns a JSON object containing a success flag and the updated participants list.
 * @throws {Error} Throws an error if the chat is not a group chat.
*/
const addParticipants = async (req, res) => {
  try {
    const { chatId, contactIds } = req.body
    const client = sessions.get(req.params.sessionId)
    const chat = await client.getChatById(chatId)
    if (!chat.isGroup) { throw new Error('The chat is not a group') }
    await chat.addParticipants(contactIds)
    res.json({ success: true, participants: chat.participants })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
}

/**
 * Removes participants from a group chat
 *
 * @async
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<Object>} Returns a JSON object with success flag and updated participants list
 * @throws {Error} If chat is not a group
 */
const removeParticipants = async (req, res) => {
  try {
    const { chatId, contactIds } = req.body
    const client = sessions.get(req.params.sessionId)
    const chat = await client.getChatById(chatId)
    if (!chat.isGroup) { throw new Error('The chat is not a group') }
    await chat.removeParticipants(contactIds)
    res.json({ success: true, participants: chat.participants })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
}

/**
 * Promotes participants in a group chat to admin
 *
 * @async
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<Object>} Returns a JSON object with success flag and updated participants list
 * @throws {Error} If chat is not a group
 */
const promoteParticipants = async (req, res) => {
  try {
    const { chatId, contactIds } = req.body
    const client = sessions.get(req.params.sessionId)
    const chat = await client.getChatById(chatId)
    if (!chat.isGroup) { throw new Error('The chat is not a group') }
    await chat.promoteParticipants(contactIds)
    res.json({ success: true, participants: chat.participants })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
}

/**
 * Demotes admin participants in a group chat
 *
 * @async
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<Object>} Returns a JSON object with success flag and updated participants list
 * @throws {Error} If chat is not a group
 */
const demoteParticipants = async (req, res) => {
  try {
    const { chatId, contactIds } = req.body
    const client = sessions.get(req.params.sessionId)
    const chat = await client.getChatById(chatId)
    if (!chat.isGroup) { throw new Error('The chat is not a group') }
    await chat.demoteParticipants(contactIds)
    res.json({ success: true, participants: chat.participants })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
}

/**
 * Gets the invite code for a group chat
 *
 * @async
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<Object>} Returns a JSON object with success flag and invite code
 * @throws {Error} If chat is not a group
 */
const getInviteCode = async (req, res) => {
  try {
    const { chatId } = req.body
    const client = sessions.get(req.params.sessionId)
    const chat = await client.getChatById(chatId)
    if (!chat.isGroup) { throw new Error('The chat is not a group') }
    const inviteCode = await chat.getInviteCode()
    res.json({ success: true, inviteCode })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
}

/**
 * Sets the subject of a group chat
 *
 * @async
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<Object>} Returns a JSON object with success flag and updated chat object
 * @throws {Error} If chat is not a group
 */
const setSubject = async (req, res) => {
  try {
    const { chatId, subject } = req.body
    const client = sessions.get(req.params.sessionId)
    const chat = await client.getChatById(chatId)
    if (!chat.isGroup) { throw new Error('The chat is not a group') }
    const success = await chat.setSubject(subject)
    res.json({ success, chat })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
}

/**
 * Sets the description of a group chat
 *
 * @async
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<Object>} Returns a JSON object with success flag and updated chat object
 * @throws {Error} If chat is not a group
 */
const setDescription = async (req, res) => {
  try {
    const { chatId, description } = req.body
    const client = sessions.get(req.params.sessionId)
    const chat = await client.getChatById(chatId)
    if (!chat.isGroup) { throw new Error('The chat is not a group') }
    const success = await chat.setDescription(description)
    res.json({ success, chat })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
}

/**
 * Leaves a group chat
 *
 * @async
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<Object>} Returns a JSON object with success flag and outcome of leaving the chat
 * @throws {Error} If chat is not a group
 */
const leave = async (req, res) => {
  try {
    const { chatId } = req.body
    const client = sessions.get(req.params.sessionId)
    const chat = await client.getChatById(chatId)
    if (!chat.isGroup) { throw new Error('The chat is not a group') }
    const outcome = await chat.leave()
    res.json({ success: true, outcome })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
}

/**
 * Retrieves information about a chat based on the provided chatId
 *
 * @async
 * @function getClassInfo
 * @param {object} req - The request object
 * @param {object} res - The response object
 * @param {string} req.body.chatId - The chatId of the chat to retrieve information about
 * @param {string} req.params.sessionId - The sessionId of the client making the request
 * @throws {Error} The chat is not a group.
 * @returns {Promise<void>} - A JSON response with success true and chat object containing chat information
 */
const getClassInfo = async (req, res) => {
  try {
    const { chatId } = req.body
    const client = sessions.get(req.params.sessionId)
    const chat = await client.getChatById(chatId)
    if (!chat.isGroup) { throw new Error('The chat is not a group') }
    res.json({ success: true, chat })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
}

/**
 * Revokes the invite link for a group chat based on the provided chatId
 *
 * @async
 * @function revokeInvite
 * @param {object} req - The request object
 * @param {object} res - The response object
 * @param {string} req.body.chatId - The chatId of the group chat to revoke the invite for
 * @param {string} req.params.sessionId - The sessionId of the client making the request
 * @throws {Error} The chat is not a group.
 * @returns {Promise<void>} - A JSON response with success true and the new invite code for the group chat
 */
const revokeInvite = async (req, res) => {
  try {
    const { chatId } = req.body
    const client = sessions.get(req.params.sessionId)
    const chat = await client.getChatById(chatId)
    if (!chat.isGroup) { throw new Error('The chat is not a group') }
    const newInviteCode = await chat.revokeInvite()
    res.json({ success: true, newInviteCode })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
}

/**
 * Sets admins-only status of a group chat's info or messages.
 *
 * @async
 * @function setInfoAdminsOnly
 * @param {Object} req - Request object.
 * @param {Object} res - Response object.
 * @param {string} req.params.sessionId - ID of the user's session.
 * @param {Object} req.body - Request body.
 * @param {string} req.body.chatId - ID of the group chat.
 * @param {boolean} req.body.adminsOnly - Desired admins-only status.
 * @returns {Promise<void>} Promise representing the success or failure of the operation.
 * @throws {Error} If the chat is not a group.
 */
const setInfoAdminsOnly = async (req, res) => {
  try {
    const { chatId, adminsOnly } = req.body
    const client = sessions.get(req.params.sessionId)
    const chat = await client.getChatById(chatId)
    if (!chat.isGroup) { throw new Error('The chat is not a group') }
    const result = await chat.setInfoAdminsOnly(adminsOnly)
    res.json({ success: true, result })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
}

/**
 * Sets admins-only status of a group chat's messages.
 *
 * @async
 * @function setMessagesAdminsOnly
 * @param {Object} req - Request object.
 * @param {Object} res - Response object.
 * @param {string} req.params.sessionId - ID of the user's session.
 * @param {Object} req.body - Request body.
 * @param {string} req.body.chatId - ID of the group chat.
 * @param {boolean} req.body.adminsOnly - Desired admins-only status.
 * @returns {Promise<void>} Promise representing the success or failure of the operation.
 * @throws {Error} If the chat is not a group.
 */
const setMessagesAdminsOnly = async (req, res) => {
  try {
    const { chatId, adminsOnly } = req.body
    const client = sessions.get(req.params.sessionId)
    const chat = await client.getChatById(chatId)
    if (!chat.isGroup) { throw new Error('The chat is not a group') }
    const result = await chat.setMessagesAdminsOnly(adminsOnly)
    res.json({ success: true, result })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
}

module.exports = {
  getClassInfo,
  addParticipants,
  demoteParticipants,
  getInviteCode,
  leave,
  promoteParticipants,
  removeParticipants,
  revokeInvite,
  setDescription,
  setInfoAdminsOnly,
  setMessagesAdminsOnly,
  setSubject
}
