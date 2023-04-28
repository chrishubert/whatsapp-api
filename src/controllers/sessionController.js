
const { setupSession, deleteSession, validateSession, flushSessions } = require('../sessions')
const { sendErrorResponse, waitForNestedObject } = require('../utils')

const startSession = async (req, res) => {
  try {
    const sessionId = req.params.sessionId
    const setupSessionReturn = setupSession(sessionId)
    if (!setupSessionReturn.success) { sendErrorResponse(res, 422, setupSessionReturn.message); return }

    // wait until the client is created
    waitForNestedObject(setupSessionReturn.client, 'pupPage')
      .then(res.json({ success: true, message: setupSessionReturn.message }))
      .catch((err) => { sendErrorResponse(res, 500, err.message) })
  } catch (error) {
    console.log('startSession ERROR', error)
    sendErrorResponse(res, 500, error)
  }
}

const terminateSession = async (req, res) => {
  try {
    const sessionId = req.params.sessionId
    const validation = await validateSession(sessionId)
    await deleteSession(sessionId, validation)
    res.json({ success: true, message: 'Logged out successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

const terminateInactiveSessions = async (req, res) => {
  try {
    await flushSessions(true)
    res.json({ success: true, message: 'Flush completed successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

const terminateAllSessions = async (req, res) => {
  try {
    await flushSessions(false)
    res.json({ success: true, message: 'Flush completed successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

module.exports = { startSession, terminateSession, terminateInactiveSessions, terminateAllSessions }
