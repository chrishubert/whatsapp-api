const { Client, LocalAuth } = require('whatsapp-web.js')
const fs = require('fs')
const sessions = new Map()
const { sessionFolderPath, maxAttachmentSize, disabledCallbacks, setMessagesAsSeen } = require('./config')
const { triggerWebhook, waitForNestedObject } = require('./utils')

// Function to validate if the session is ready
const validateSession = async (sessionId) => {
  try {
    const returnData = { success: false, state: null, message: '' }

    // Session not Connected 😢
    if (!sessions.has(sessionId) || !sessions.get(sessionId)) {
      returnData.message = 'session_not_found'
      return returnData
    }

    const client = sessions.get(sessionId)
    // wait until the client is created
    await waitForNestedObject(client, 'pupPage')
      .catch((err) => { return { success: false, state: null, message: err.message } })

    // Wait for client.pupPage to be evaluable
    while (true) {
      try {
        await client.pupPage.evaluate('1'); break
      } catch (error) {
        // Ignore error and wait for a bit before trying again
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    const state = await client.getState()
    returnData.state = state
    console.log('Session state:', sessionId, state)
    if (state !== 'CONNECTED') {
      returnData.message = 'session_not_connected'
      return returnData
    }

    // Session Connected 🎉
    returnData.success = true
    returnData.message = 'session_connected'
    return returnData
  } catch (error) {
    console.log(error)
    return { success: false, state: null, message: error.message }
  }
}

// Function to handle client session restoration
const restoreSessions = () => {
  try {
    if (!fs.existsSync(sessionFolderPath)) {
      fs.mkdirSync(sessionFolderPath) // Create the session directory if it doesn't exist
    }
    // Read the contents of the folder
    fs.readdir(sessionFolderPath, (_, files) => {
      // Iterate through the files in the parent folder
      for (const file of files) {
        // Use regular expression to extract the string from the folder name
        const match = file.match(/^session-(.+)$/)
        if (match) {
          const sessionId = match[1]
          console.log('existing session detected', sessionId)
          setupSession(sessionId)
        }
      }
    })
  } catch (error) {
    console.log(error)
    console.error('Failed to restore sessions:', error)
  }
}

// Setup Session
const setupSession = (sessionId) => {
  try {
    if (sessions.has(sessionId)) {
      return { success: false, message: `Session already exists for: ${sessionId}`, client: sessions.get(sessionId) }
    }

    const client = new Client({
      puppeteer: {
        executablePath: process.env.CHROME_BIN || null,
        // headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage']
      },
      userAgent: 'Mozilla/5.0 (X11 Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.54 Safari/537.36',
      authStrategy: new LocalAuth({ clientId: sessionId, dataPath: sessionFolderPath })
    })

    client.initialize().catch(err => console.log('Initialize error:', err.message))

    if (!disabledCallbacks.includes('auth_failure')) {
      client.on('auth_failure', (msg) => {
        triggerWebhook(sessionId, 'status', { msg })
      })
    }
    if (!disabledCallbacks.includes('authenticated')) {
      client.on('authenticated', () => {
        triggerWebhook(sessionId, 'authenticated')
      })
    }
    if (!disabledCallbacks.includes('call')) {
      client.on('call', async (call) => {
        triggerWebhook(sessionId, 'call', { call })
      })
    }

    if (!disabledCallbacks.includes('change_state')) {
      client.on('change_state', state => {
        triggerWebhook(sessionId, 'change_state', { state })
      })
    }

    if (!disabledCallbacks.includes('disconnected')) {
      client.on('disconnected', (reason) => {
        triggerWebhook(sessionId, 'disconnected', { reason })
      })
    }

    if (!disabledCallbacks.includes('group_join')) {
      client.on('group_join', (notification) => {
        triggerWebhook(sessionId, 'group_join', { notification })
      })
    }

    if (!disabledCallbacks.includes('group_leave')) {
      client.on('group_leave', (notification) => {
        triggerWebhook(sessionId, 'group_leave', { notification })
      })
    }

    if (!disabledCallbacks.includes('group_update')) {
      client.on('group_update', (notification) => {
        triggerWebhook(sessionId, 'group_update', { notification })
      })
    }

    if (!disabledCallbacks.includes('loading_screen')) {
      client.on('loading_screen', (percent, message) => {
        triggerWebhook(sessionId, 'loading_screen', { percent, message })
      })
    }

    if (!disabledCallbacks.includes('media_uploaded')) {
      client.on('media_uploaded', (message) => {
        triggerWebhook(sessionId, 'media_uploaded', { message })
      })
    }

    if (!disabledCallbacks.includes('message')) {
      client.on('message', async (message) => {
        triggerWebhook(sessionId, 'message', { message })
        if (setMessagesAsSeen) {
          const chat = await message.getChat()
          chat.sendSeen()
        }
        if (message.hasMedia) {
          if (message._data?.size < maxAttachmentSize) {
            const messageMedia = await message.downloadMedia()
            triggerWebhook(sessionId, 'media', { messageMedia, message })
          } else {
            console.log(`(${message.id?.id}) Attachment too large, sending null message body`)
            triggerWebhook(sessionId, 'media', { messageMedia: null, message })
          }
        }
      })
    }

    if (!disabledCallbacks.includes('message_ack')) {
      client.on('message_ack', async (message, ack) => {
        triggerWebhook(sessionId, 'message_ack', { message, ack })
        if (setMessagesAsSeen) {
          const chat = await message.getChat()
          chat.sendSeen()
        }
      })
    }

    if (!disabledCallbacks.includes('message_create')) {
      client.on('message_create', async (message) => {
        triggerWebhook(sessionId, 'message_create', { message })
        if (setMessagesAsSeen) {
          const chat = await message.getChat()
          chat.sendSeen()
        }
      })
    }

    if (!disabledCallbacks.includes('message_reaction')) {
      client.on('message_reaction', (reaction) => {
        triggerWebhook(sessionId, 'message_reaction', { reaction })
      })
    }

    if (!disabledCallbacks.includes('message_revoke_everyone')) {
      client.on('message_revoke_everyone', async (after, before) => {
        triggerWebhook(sessionId, 'message_revoke_everyone', { after, before })
      })
    }

    if (!disabledCallbacks.includes('qr')) {
      client.on('qr', (qr) => {
        triggerWebhook(sessionId, 'qr', { qr })
      })
    }

    if (!disabledCallbacks.includes('ready')) {
      client.on('ready', () => {
        triggerWebhook(sessionId, 'ready')
      })
    }

    if (!disabledCallbacks.includes('contact_changed')) {
      client.on('contact_changed', async (message, oldId, newId, isContact) => {
        triggerWebhook(sessionId, 'contact_changed', { message, oldId, newId, isContact })
      })
    }

    // Save the session to the Map
    sessions.set(sessionId, client)
    return { success: true, message: 'Session initiated successfully', client }
  } catch (error) {
    return { success: false, message: error.message, client: null }
  }
}

// Function to check if folder is writeable
const deleteSessionFolder = async (sessionId) => {
  try {
    const targetDirPath = `${sessionFolderPath}/session-${sessionId}/`
    const resolvedTargetDirPath = await fs.promises.realpath(targetDirPath)
    const resolvedSessionPath = await fs.promises.realpath(sessionFolderPath)
    // Check if the target directory path is a subdirectory of the sessions folder path
    if (!resolvedTargetDirPath.startsWith(resolvedSessionPath)) {
      throw new Error('Invalid path')
    }
    await fs.promises.rm(targetDirPath, { recursive: true, force: true })
  } catch (error) {
    console.log('Folder deletion error', error)
    throw error
  }
}

// Function to delete client session
const deleteSession = async (sessionId, validation) => {
  try {
    if (validation.success) {
      // Client Connected, request logout
      console.log(`Logging out session ${sessionId}`)
      await sessions.get(sessionId).logout()
    } else if (validation.message === 'session_not_connected') {
      // Client not Connected, request destroy
      console.log(`Destroying session ${sessionId}`)
      await sessions.get(sessionId).destroy()
      await deleteSessionFolder(sessionId)
      sessions.delete(sessionId)
    }
  } catch (error) {
    console.log(error)
    throw error
  }
}

// Function to handle session flush
const flushSessions = async (deleteOnlyInactive) => {
  try {
    // Read the contents of the sessions folder
    const files = await fs.promises.readdir(sessionFolderPath)
    // Iterate through the files in the parent folder
    for (const file of files) {
      // Use regular expression to extract the string from the folder name
      const match = file.match(/^session-(.+)$/)
      if (match && match[1]) {
        const sessionId = match[1]
        const validation = await validateSession(sessionId)
        if (!deleteOnlyInactive || !validation.success) {
          await deleteSession(sessionId, validation)
        }
      }
    }
  } catch (error) {
    console.log(error)
    throw error
  }
}

module.exports = {
  sessions,
  setupSession,
  restoreSessions,
  validateSession,
  deleteSession,
  flushSessions
}
