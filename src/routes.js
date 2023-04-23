const { MessageMedia } = require('whatsapp-web.js')
const fs = require('fs')
const routes = require('express').Router()
const qrcode = require('qrcode-terminal')
const { apikeyMiddleware, sessionValidationMiddleware, rateLimiterMiddleware } = require('./middleware')
const { sessionFolderPath, enableLocalCallbackExample } = require('./config')
const { sessions, setupSession, deleteSession, validateSession } = require('./sessions')
const { sendErrorResponse } = require('./utils')

// API endpoint to check if server is alive
routes.get('/ping', (req, res) => {
  try {
    res.json({ success: true, message: 'pong' })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
})

// API basic callback
if (enableLocalCallbackExample) {
  routes.post('/localCallbackExample', [apikeyMiddleware, rateLimiterMiddleware], (req, res) => {
    try {
      const { sessionId, dataType, data } = req.body
      if (dataType === 'qr') { qrcode.generate(data.qr, { small: true }) }
      fs.writeFile(`${sessionFolderPath}/message_log.txt`, `(${sessionId}) ${dataType}: ${JSON.stringify(data)}\r\n`, { flag: 'a+' }, _ => _)
      res.json({ success: true })
    } catch (error) {
      console.log(error)
      fs.writeFile(`${sessionFolderPath}/message_log.txt`, `(ERROR) ${JSON.stringify(error)}\r\n`, { flag: 'a+' }, _ => _)
      sendErrorResponse(res, 500, error.message)
    }
  })
}

// API endpoint for starting the session
routes.get('/api/startSession/:sessionId', apikeyMiddleware, (req, res) => {
  try {
    const sessionId = req.params.sessionId
    if (!sessionId.match(/^[\w]+$/i)) {
      return sendErrorResponse(res, 500, 'Session should be alphanumerical')
    }
    setupSession(sessionId)
    res.json({ success: true, message: 'Session initiated successfully' })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
})

// API endpoint for sending a message
routes.post('/api/sendMessage/:sessionId', [apikeyMiddleware, sessionValidationMiddleware], async (req, res) => {
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
})

// API endpoint for validating WhatsApp number
routes.get('/api/getSessionInfo/:sessionId', [apikeyMiddleware, sessionValidationMiddleware], async (req, res) => {
  try {
    const client = sessions.get(req.params.sessionId)
    const sessionInfo = await client.info
    res.json({ success: true, sessionInfo })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
})

// API endpoint for validating WhatsApp number
routes.post('/api/isRegisteredUser/:sessionId', [apikeyMiddleware, sessionValidationMiddleware], async (req, res) => {
  try {
    const { id } = req.body
    const client = sessions.get(req.params.sessionId)
    const isRegisteredUser = await client.isRegisteredUser(id)
    res.json({ success: true, valid: isRegisteredUser })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
})

// API endpoint to set Status
routes.post('/api/setStatus/:sessionId', [apikeyMiddleware, sessionValidationMiddleware], async (req, res) => {
  try {
    const { status } = req.body
    const client = sessions.get(req.params.sessionId)
    await client.setStatus(status)
    res.json({ success: true })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
})

// API endpoint for getting contacts
routes.get('/api/getContacts/:sessionId', [apikeyMiddleware, sessionValidationMiddleware], async (req, res) => {
  try {
    const client = sessions.get(req.params.sessionId)
    const contacts = await client.getContacts()
    res.json({ success: true, contacts })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
})

// API endpoint for getting chats
routes.get('/api/getChats/:sessionId', [apikeyMiddleware, sessionValidationMiddleware], async (req, res) => {
  try {
    const client = sessions.get(req.params.sessionId)
    const chats = await client.getChats()
    res.json({ success: true, chats })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
})

// API endpoint for getting profile picture
routes.post('/api/getProfilePicUrl/:sessionId', [apikeyMiddleware, sessionValidationMiddleware], async (req, res) => {
  try {
    const { contactId } = req.body
    const client = sessions.get(req.params.sessionId)
    const profilePicUrl = await client.getProfilePicUrl(contactId)
    res.json({ success: true, profilePicUrl })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
})

// API endpoint for logging out
routes.get('/api/terminateSession/:sessionId', apikeyMiddleware, async (req, res) => {
  try {
    const sessionId = req.params.sessionId
    if (!sessionId.match(/^[\w]+$/i)) {
      return sendErrorResponse(res, 500, 'Session should be alphanumerical')
    }
    if (!sessions.has(sessionId)) {
      return sendErrorResponse(res, 404, 'Client session not found')
    }
    const result = await deleteSession(sessionId)
    if (result === true) {
      res.json({ success: true, message: 'Logged out successfully' })
    } else {
      return sendErrorResponse(res, 500, result)
    }
  } catch (error) {
    console.log(error)
    sendErrorResponse(res, 500, error.message)
  }
})

const flushInactiveSessions = async (deleteInactive) => {
  // Read the contents of the sessions folder
  fs.readdir(sessionFolderPath, async (_, files) => {
    // Iterate through the files in the parent folder
    for (const file of files) {
      // Use regular expression to extract the string from the folder name
      const match = file.match(/^session-(.+)$/)
      if (match && match[1]) {
        const sessionId = match[1]
        if (deleteInactive) {
          await deleteSession(sessionId)
        } else {
          const validation = await validateSession(sessionId)
          if (validation !== true) { await deleteSession(sessionId) }
        }
      }
    }
  })
}

// API endpoint for flushing all non-connected sessions
routes.get('/api/terminateInactiveSessions', apikeyMiddleware, async (req, res) => {
  await flushInactiveSessions(false)
  res.json({ success: true, message: 'Flush completed successfully' })
})

// API endpoint for flushing all sessions
routes.get('/api/terminateAllSessions', apikeyMiddleware, async (req, res) => {
  await flushInactiveSessions(true)
  res.json({ success: true, message: 'Flush completed successfully' })
})

module.exports = { routes }
