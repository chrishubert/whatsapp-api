const { Client, LocalAuth } = require('whatsapp-web.js')
const fs = require('fs')
const sessions = new Map()
const { sessionFolderPath } = require('./config')
const { triggerWebhook } = require('./utils')

// Function to validate if the session is ready
const validateSession = async (sessionId) => {
  try {
    if (!sessions.has(sessionId) || !sessions.get(sessionId)) {
      return 'Client session not found'
    }
    const state = await sessions.get(sessionId).getState().catch(_ => _)
    console.log('Session state:', sessionId, state)
    if (state !== 'CONNECTED') {
      return 'Client session not ready'
    }
    return true
  } catch (error) {
    return error.message
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
async function setupSession (sessionId) {
  try {
    if (sessions.has(sessionId)) {
      console.log('Session already exists for:', sessionId)
      return
    }

    console.log('Setting up session:', sessionId)

    const client = new Client({
      puppeteer: {
        executablePath: process.env.CHROME_BIN || null,
        // headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage']
      },
      userAgent: 'Mozilla/5.0 (X11 Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.54 Safari/537.36',
      authStrategy: new LocalAuth({ clientId: sessionId, dataPath: sessionFolderPath })
    })

    client.initialize().catch(_ => _)

    client.on('auth_failure', (msg) => {
      triggerWebhook(sessionId, 'status', { msg })
    })

    client.on('authenticated', () => {
      triggerWebhook(sessionId, 'authenticated')
    })

    client.on('call', async (call) => {
      triggerWebhook(sessionId, 'call', { call })
    })

    client.on('change_state', state => {
      triggerWebhook(sessionId, 'change_state', { state })
    })

    client.on('disconnected', (reason) => {
      triggerWebhook(sessionId, 'disconnected', { reason })
    })

    client.on('group_join', (notification) => {
      triggerWebhook(sessionId, 'group_join', { notification })
    })

    client.on('group_leave', (notification) => {
      triggerWebhook(sessionId, 'group_leave', { notification })
    })

    client.on('group_update', (notification) => {
      triggerWebhook(sessionId, 'group_update', { notification })
    })

    client.on('loading_screen', (percent, message) => {
      triggerWebhook(sessionId, 'loading_screen', { percent, message })
    })

    client.on('media_uploaded', (message) => {
      triggerWebhook(sessionId, 'media_uploaded', { message })
    })

    client.on('message', async (message) => {
      triggerWebhook(sessionId, 'message', { message })
      if (message.hasMedia) {
        const media = await message.downloadMedia()
        triggerWebhook(sessionId, 'media', { media })
      }
    })

    client.on('message_ack', (msg, ack) => {
      triggerWebhook(sessionId, 'message_ack', { msg, ack })
    })

    client.on('message_create', (message) => {
      triggerWebhook(sessionId, 'message_create', { message })
    })

    client.on('message_reaction', (reaction) => {
      triggerWebhook(sessionId, 'message_reaction', { reaction })
    })

    client.on('message_revoke_everyone', async (after, before) => {
      triggerWebhook(sessionId, 'message_revoke_everyone', { after, before })
    })

    client.on('qr', (qr) => {
      triggerWebhook(sessionId, 'qr', { qr })
    })

    client.on('ready', () => {
      triggerWebhook(sessionId, 'ready')
    })

    client.on('contact_changed', async (message, oldId, newId, isContact) => {
      triggerWebhook(sessionId, 'contact_changed', { message, oldId, newId, isContact })
    })

    // Save the session to the Map
    sessions.set(sessionId, client)
  } catch (error) {
    console.error('Failed to setup sessions:', error.message)
  }
}

// Function to check if folder is writeable
const deleteSessionFolder = (sessionId) => {
  fs.rmSync(`${sessionFolderPath}/session-${sessionId}`, { recursive: true, force: true }, async err => {
    console.log(err)
    await new Promise(resolve => setTimeout(resolve, 200))
    deleteSessionFolder(sessionId)
  })
}

// Function to delete client session
const deleteSession = async (sessionId) => {
  if (sessions.has(sessionId)) {
    console.log(`Destroying session ${sessionId}`)
    await sessions.get(sessionId).destroy().catch(err => console.log(err))
  }
  deleteSessionFolder(sessionId)
  sessions.delete(sessionId)
  return true
}

module.exports = {
  sessions,
  setupSession,
  restoreSessions,
  validateSession,
  deleteSession
}
