const { globalApiKey } = require('../config')

const { sendErrorResponse } = require('../utils')

/**
 * Responds to checkApiKey request
 *
 * @function checkApiKey
 * @async
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>} - Promise that resolves once response is sent
 * @throws {Object} - Throws error if response fails
 */
const checkApiKey = async (req, res) => {
  /*
    #swagger.summary = 'Check api key'
    #swagger.description = 'Check if provided api key is valid.'
    #swagger.tags = ['Various']
  */
  try {
    return res.json({ success: true, message: 'authorized' })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
}

module.exports = { checkApiKey }
