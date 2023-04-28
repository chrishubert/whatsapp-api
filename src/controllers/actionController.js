const { MessageMedia } = require('whatsapp-web.js')
const { sessions } = require('../sessions')
const { sendErrorResponse } = require('../utils')

const sendMessage = async (req, res) => {
  try {
    const { chatId, content, contentType, options } = req.body
    const client = sessions.get(req.params.sessionId)

    let messageOut
    switch (contentType) {
      case 'string':
        messageOut = await client.sendMessage(chatId, content, options)
        break
      case 'MessageMediaFromURL': {
        const messageMediaFromURL = await MessageMedia.fromUrl(content)
        messageOut = await client.sendMessage(chatId, messageMediaFromURL, options)
        break
      }
      case 'MessageMedia': {
        const messageMedia = new MessageMedia(content.mimetype, content.data, content.filename, content.filesize)
        messageOut = await client.sendMessage(chatId, messageMedia, options)
        break
      }
      /* Disabled - non functioning anymore
      case 'Location':
        const location = new Location(content.latitude, content.longitude, content.description)
        messageOut = await client.sendMessage(chatId, location, options)
        break
      case 'Buttons':
        const buttons = new Buttons(content.body, content.buttons, content.title, content.footer)
        messageOut = await client.sendMessage(chatId, buttons, options)
        break
      case 'List':
        const list = new List(content.body, content.list, content.title, content.footer)
        messageOut = await client.sendMessage(chatId, list, options)
        break
      */
      default:
        return sendErrorResponse(res, 404, 'contentType invalid, must be string, MessageMedia, MessageMediaFromURL, Location, Buttons, or List')
    }

    res.json({ success: true, message: messageOut })
  } catch (error) {
    console.log(error)
    sendErrorResponse(res, 500, error.message)
  }
}

const getSessionInfo = async (req, res) => {
  try {
    const client = sessions.get(req.params.sessionId)
    const sessionInfo = await client.info
    res.json({ success: true, sessionInfo })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
}

const isRegisteredUser = async (req, res) => {
  try {
    const { id } = req.body
    const client = sessions.get(req.params.sessionId)
    const isRegisteredUser = await client.isRegisteredUser(id)
    res.json({ success: true, valid: isRegisteredUser })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
}

const createGroup = async (req, res) => {
  try {
    const { name, participants } = req.body
    const client = sessions.get(req.params.sessionId)
    const response = await client.createGroup(name, participants)
    res.json({ success: true, response })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
}

const setStatus = async (req, res) => {
  try {
    const { status } = req.body
    const client = sessions.get(req.params.sessionId)
    await client.setStatus(status)
    res.json({ success: true })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
}

const getContacts = async (req, res) => {
  try {
    const client = sessions.get(req.params.sessionId)
    const contacts = await client.getContacts()
    res.json({ success: true, contacts })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
}

const getChats = async (req, res) => {
  try {
    const client = sessions.get(req.params.sessionId)
    const chats = await client.getChats()
    res.json({ success: true, chats })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
}

const getProfilePictureUrl = async (req, res) => {
  try {
    const { contactId } = req.body
    const client = sessions.get(req.params.sessionId)
    const profilePicUrl = await client.getProfilePicUrl(contactId)
    res.json({ success: true, profilePicUrl })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
}

module.exports = { sendMessage, getSessionInfo, isRegisteredUser, createGroup, setStatus, getContacts, getChats, getProfilePictureUrl }
