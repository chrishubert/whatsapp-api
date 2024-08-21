const axios = require('axios')
const { globalApiKey, disabledCallbacks } = require('./config')
const http = require('http')
const { Server } = require('socket.io')

// Trigger webhook endpoint
const triggerWebhook = (webhookURL, sessionId, dataType, data) => {
  axios.post(webhookURL, { dataType, data, sessionId }, { headers: { 'x-api-key': globalApiKey } })
    .catch(error => console.error('Failed to send new message webhook:', sessionId, dataType, error.message, data || ''))
}

// Emit web socket
const emitWebSocket = (socket, sessionId, dataType, data) => {
  socket.emit('socketEvent', { dataType, data, sessionId })
}

// Function to send a response with error status and message
const sendErrorResponse = (res, status, message) => {
  res.status(status).json({ success: false, error: message })
}

// Function to wait for a specific item not to be null
const waitForNestedObject = (rootObj, nestedPath, maxWaitTime = 10000, interval = 100) => {
  const start = Date.now()
  return new Promise((resolve, reject) => {
    const checkObject = () => {
      const nestedObj = nestedPath.split('.').reduce((obj, key) => obj ? obj[key] : undefined, rootObj)
      if (nestedObj) {
        // Nested object exists, resolve the promise
        resolve()
      } else if (Date.now() - start > maxWaitTime) {
        // Maximum wait time exceeded, reject the promise
        console.log('Timed out waiting for nested object')
        reject(new Error('Timeout waiting for nested object'))
      } else {
        // Nested object not yet created, continue waiting
        setTimeout(checkObject, interval)
      }
    }
    checkObject()
  })
}

const checkIfEventisEnabled = (event) => {
  return new Promise((resolve, reject) => { if (!disabledCallbacks.includes(event)) { resolve() } })
}

const initializeWebSocket = (app, port) => {
  // Configure a web socket
  const server = http.createServer(app)
  const io = new Server(server, {
    cors: {
      origin: 'http://localhost:*', // React frontend URL
      methods: ['GET', 'POST']
    }
  })

  io.on('connection', (socket) => {
    console.log('A user connected')
    socket.on('disconnect', () => {
      console.log('A user disconnected')
    })
  })

  io.use((socket, next) => {
    const token = socket.handshake.auth.token
    if (token === globalApiKey) {
      if (globalApiKey) {
        console.log('Authenticated')
      }
      next()
    } else {
      next(new Error('Authentication failed'))
    }
  })

  server.listen(port, () => {
    console.log(`Web socket running on port ${port}`)
  })

  return io
}

module.exports = {
  emitWebSocket,
  triggerWebhook,
  sendErrorResponse,
  waitForNestedObject,
  checkIfEventisEnabled,
  initializeWebSocket
}
