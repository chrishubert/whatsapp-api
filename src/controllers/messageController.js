const { sessions } = require('../sessions')
const { sendErrorResponse } = require('../utils')

/**
 * Get message by its ID from a given chat using the provided client.
 * @async
 * @function
 * @param {object} client - The chat client.
 * @param {string} messageId - The ID of the message to get.
 * @param {string} chatId - The ID of the chat to search in.
 * @returns {Promise<object>} - A Promise that resolves with the message object that matches the provided ID, or undefined if no such message exists.
 * @throws {Error} - Throws an error if the provided client, message ID or chat ID is invalid.
 */
const _getMessageById = async (client, messageId, chatId) => {
  const chat = await client.getChatById(chatId)
  const messages = await chat.fetchMessages({ limit: 100 })
  const message = messages.find((message) => { return message.id.id === messageId })
  return message
}

/**
 * Gets information about a message's class.
 * @async
 * @function
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {string} req.params.sessionId - The session ID.
 * @param {string} req.body.messageId - The message ID.
 * @param {string} req.body.chatId - The chat ID.
 * @returns {Promise<void>} - A Promise that resolves with no value when the function completes.
 */
const getClassInfo = async (req, res) => {
  try {
    const { messageId, chatId } = req.body
    const client = sessions.get(req.params.sessionId)
    const message = await _getMessageById(client, messageId, chatId)
    if (!message) { throw new Error('Message not Found') }
    res.json({ success: true, message })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
}

/**
 * Deletes a message.
 * @async
 * @function
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {string} req.params.sessionId - The session ID.
 * @param {string} req.body.messageId - The message ID.
 * @param {string} req.body.chatId - The chat ID.
 * @param {boolean} req.body.everyone - Whether to delete the message for everyone or just the sender.
 * @returns {Promise<void>} - A Promise that resolves with no value when the function completes.
 */
const deleteMessage = async (req, res) => {
  try {
    const { messageId, chatId, everyone } = req.body
    const client = sessions.get(req.params.sessionId)
    const message = await _getMessageById(client, messageId, chatId)
    if (!message) { throw new Error('Message not Found') }
    const result = await message.delete(everyone)
    res.json({ success: true, result })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
}

/**
 * Downloads media from a message.
 * @async
 * @function
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {string} req.params.sessionId - The session ID.
 * @param {string} req.body.messageId - The message ID.
 * @param {string} req.body.chatId - The chat ID.
 * @param {boolean} req.body.everyone - Whether to download the media for everyone or just the sender.
 * @returns {Promise<void>} - A Promise that resolves with no value when the function completes.
 */
const downloadMedia = async (req, res) => {
  try {
    const { messageId, chatId, everyone } = req.body
    const client = sessions.get(req.params.sessionId)
    const message = await _getMessageById(client, messageId, chatId)
    if (!message) { throw new Error('Message not Found') }
    const messageMedia = await message.downloadMedia(everyone)
    res.json({ success: true, messageMedia })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
}

/**
 * Forwards a message to a destination chat.
 * @async
 * @function forward
 * @param {Object} req - The request object received by the server.
 * @param {Object} req.body - The body of the request object.
 * @param {string} req.body.messageId - The ID of the message to forward.
 * @param {string} req.body.chatId - The ID of the chat that contains the message to forward.
 * @param {string} req.body.destinationChatId - The ID of the chat to forward the message to.
 * @param {string} req.params.sessionId - The ID of the session to use the Telegram API with.
 * @param {Object} res - The response object to be sent back to the client.
 * @returns {Object} - The response object with a JSON body containing the result of the forward operation.
 * @throws Will throw an error if the message is not found or if there is an error during the forward operation.
 */
const forward = async (req, res) => {
  try {
    const { messageId, chatId, destinationChatId } = req.body
    const client = sessions.get(req.params.sessionId)
    const message = await _getMessageById(client, messageId, chatId)
    if (!message) { throw new Error('Message not Found') }
    const result = await message.forward(destinationChatId)
    res.json({ success: true, result })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
}

/**
 * Gets information about a message.
 * @async
 * @function getInfo
 * @param {Object} req - The request object received by the server.
 * @param {Object} req.body - The body of the request object.
 * @param {string} req.body.messageId - The ID of the message to get information about.
 * @param {string} req.body.chatId - The ID of the chat that contains the message to get information about.
 * @param {string} req.params.sessionId - The ID of the session to use the Telegram API with.
 * @param {Object} res - The response object to be sent back to the client.
 * @returns {Object} - The response object with a JSON body containing the information about the message.
 * @throws Will throw an error if the message is not found or if there is an error during the get info operation.
 */
const getInfo = async (req, res) => {
  try {
    const { messageId, chatId } = req.body
    const client = sessions.get(req.params.sessionId)
    const message = await _getMessageById(client, messageId, chatId)
    if (!message) { throw new Error('Message not Found') }
    const info = await message.getInfo()
    res.json({ success: true, info })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
}

/**
 * Retrieves a list of contacts mentioned in a specific message
 *
 * @async
 * @function
 * @param {Object} req - The HTTP request object
 * @param {Object} req.body - The request body
 * @param {string} req.body.messageId - The ID of the message to retrieve mentions from
 * @param {string} req.body.chatId - The ID of the chat where the message was sent
 * @param {string} req.params.sessionId - The ID of the session for the client making the request
 * @param {Object} res - The HTTP response object
 * @returns {Promise<void>} - The JSON response with the list of contacts
 * @throws {Error} - If there's an error retrieving the message or mentions
 */
const getMentions = async (req, res) => {
  try {
    const { messageId, chatId } = req.body
    const client = sessions.get(req.params.sessionId)
    const message = await _getMessageById(client, messageId, chatId)
    if (!message) { throw new Error('Message not Found') }
    const contacts = await message.getMentions()
    res.json({ success: true, contacts })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
}

/**
 * Retrieves the order information contained in a specific message
 *
 * @async
 * @function
 * @param {Object} req - The HTTP request object
 * @param {Object} req.body - The request body
 * @param {string} req.body.messageId - The ID of the message to retrieve the order from
 * @param {string} req.body.chatId - The ID of the chat where the message was sent
 * @param {string} req.params.sessionId - The ID of the session for the client making the request
 * @param {Object} res - The HTTP response object
 * @returns {Promise<void>} - The JSON response with the order information
 * @throws {Error} - If there's an error retrieving the message or order information
 */
const getOrder = async (req, res) => {
  try {
    const { messageId, chatId } = req.body
    const client = sessions.get(req.params.sessionId)
    const message = await _getMessageById(client, messageId, chatId)
    if (!message) { throw new Error('Message not Found') }
    const order = await message.getOrder()
    res.json({ success: true, order })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
}

/**
 * Retrieves the payment information from a specific message identified by its ID.
 *
 * @async
 * @function getPayment
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {string} req.params.sessionId - The session ID associated with the client making the request.
 * @param {Object} req.body - The message ID and chat ID associated with the message to retrieve payment information from.
 * @param {string} req.body.messageId - The ID of the message to retrieve payment information from.
 * @param {string} req.body.chatId - The ID of the chat the message is associated with.
 * @returns {Object} An object containing a success status and the payment information for the specified message.
 * @throws {Object} If the specified message is not found or if an error occurs during the retrieval process.
 */
const getPayment = async (req, res) => {
  try {
    const { messageId, chatId } = req.body
    const client = sessions.get(req.params.sessionId)
    const message = await _getMessageById(client, messageId, chatId)
    if (!message) { throw new Error('Message not Found') }
    const payment = await message.getPayment()
    res.json({ success: true, payment })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
}

/**
 * Retrieves the quoted message information from a specific message identified by its ID.
 *
 * @async
 * @function getQuotedMessage
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {string} req.params.sessionId - The session ID associated with the client making the request.
 * @param {Object} req.body - The message ID and chat ID associated with the message to retrieve quoted message information from.
 * @param {string} req.body.messageId - The ID of the message to retrieve quoted message information from.
 * @param {string} req.body.chatId - The ID of the chat the message is associated with.
 * @returns {Object} An object containing a success status and the quoted message information for the specified message.
 * @throws {Object} If the specified message is not found or if an error occurs during the retrieval process.
 */
const getQuotedMessage = async (req, res) => {
  try {
    const { messageId, chatId } = req.body
    const client = sessions.get(req.params.sessionId)
    const message = await _getMessageById(client, messageId, chatId)
    if (!message) { throw new Error('Message not Found') }
    const quotedMessage = await message.getQuotedMessage()
    res.json({ success: true, quotedMessage })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
}

/**
 * React to a specific message in a chat
 *
 * @async
 * @function react
 * @param {Object} req - The HTTP request object containing the request parameters and body.
 * @param {Object} res - The HTTP response object to send the result.
 * @param {string} req.params.sessionId - The ID of the session to use.
 * @param {string} req.body.messageId - The ID of the message to react to.
 * @param {string} req.body.chatId - The ID of the chat the message is in.
 * @param {string} req.body.reaction - The reaction to add to the message.
 * @returns {Object} The HTTP response containing the result of the operation.
 * @throws {Error} If there was an error during the operation.
 */
const react = async (req, res) => {
  try {
    const { messageId, chatId, reaction } = req.body
    const client = sessions.get(req.params.sessionId)
    const message = await _getMessageById(client, messageId, chatId)
    if (!message) { throw new Error('Message not Found') }
    const result = await message.react(reaction)
    res.json({ success: true, result })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
}

/**
 * Reply to a specific message in a chat
 *
 * @async
 * @function reply
 * @param {Object} req - The HTTP request object containing the request parameters and body.
 * @param {Object} res - The HTTP response object to send the result.
 * @param {string} req.params.sessionId - The ID of the session to use.
 * @param {string} req.body.messageId - The ID of the message to reply to.
 * @param {string} req.body.chatId - The ID of the chat the message is in.
 * @param {string} req.body.content - The content of the message to send.
 * @param {string} req.body.destinationChatId - The ID of the chat to send the reply to.
 * @param {Object} req.body.options - Additional options for sending the message.
 * @returns {Object} The HTTP response containing the result of the operation.
 * @throws {Error} If there was an error during the operation.
 */
const reply = async (req, res) => {
  try {
    const { messageId, chatId, content, destinationChatId, options } = req.body
    const client = sessions.get(req.params.sessionId)
    const message = await _getMessageById(client, messageId, chatId)
    if (!message) { throw new Error('Message not Found') }
    const repliedMessage = await message.reply(content, destinationChatId, options)
    res.json({ success: true, repliedMessage })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
}

/**
 * @function star
 * @async
 * @description Stars a message by message ID and chat ID.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {string} req.params.sessionId - The session ID.
 * @param {string} req.body.messageId - The message ID.
 * @param {string} req.body.chatId - The chat ID.
 * @returns {Promise} A Promise that resolves with the result of the message.star() call.
 * @throws {Error} If message is not found, it throws an error with the message "Message not Found".
 */
const star = async (req, res) => {
  try {
    const { messageId, chatId } = req.body
    const client = sessions.get(req.params.sessionId)
    const message = await _getMessageById(client, messageId, chatId)
    if (!message) { throw new Error('Message not Found') }
    const result = await message.star()
    res.json({ success: true, result })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
}

/**
 * @function unstar
 * @async
 * @description Unstars a message by message ID and chat ID.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {string} req.params.sessionId - The session ID.
 * @param {string} req.body.messageId - The message ID.
 * @param {string} req.body.chatId - The chat ID.
 * @returns {Promise} A Promise that resolves with the result of the message.unstar() call.
 * @throws {Error} If message is not found, it throws an error with the message "Message not Found".
 */
const unstar = async (req, res) => {
  try {
    const { messageId, chatId } = req.body
    const client = sessions.get(req.params.sessionId)
    const message = await _getMessageById(client, messageId, chatId)
    if (!message) { throw new Error('Message not Found') }
    const result = await message.unstar()
    res.json({ success: true, result })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
}

module.exports = {
  getClassInfo,
  deleteMessage,
  downloadMedia,
  forward,
  getInfo,
  getMentions,
  getOrder,
  getPayment,
  getQuotedMessage,
  react,
  reply,
  star,
  unstar
}
