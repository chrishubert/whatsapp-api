const { restApiKey, disabledCallbacks } = require('../server/config')

// Trigger webhook endpoint
const triggerWebhook = async (webhookURL, sessionId, dataType, data) => {
  try {
    await fetch(webhookURL, {
      method: 'post',
      body: JSON.stringify({ dataType, data, sessionId }),
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': restApiKey
      }
    })
  } catch (error) {
    console.error('Failed to send new message webhook:', sessionId, dataType, error.message, data || '')
  }
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

module.exports = {
  triggerWebhook,
  sendErrorResponse,
  waitForNestedObject,
  checkIfEventisEnabled
}
