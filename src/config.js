// Load environment variables from .env file
require('dotenv').config()

// setup global const
const sessionFolderPath = process.env.SESSIONS_PATH || './sessions'
const enableLocalCallbackExample = process.env.ENABLE_LOCAL_CALLBACK_EXAMPLE === 'TRUE'
const globalApiKey = process.env.API_KEY
const baseWebhookURL = process.env.BASE_WEBHOOK_URL
const maxAttachmentSize = parseInt(process.env.MAX_ATTACHMENT_SIZE) || 10000000
const setMessagesAsSeen = process.env.SET_MESSAGES_AS_SEEN === 'TRUE'
const disabledCallbacks = process.env.DISABLED_CALLBACKS ? process.env.DISABLED_CALLBACKS.split('|') : []
const enableSwaggerEndpoint = process.env.ENABLE_SWAGGER_ENDPOINT === 'TRUE'
const webVersion = process.env.WEB_VERSION
const webVersionCacheType = process.env.WEB_VERSION_CACHE_TYPE || 'remote'

module.exports = {
  sessionFolderPath,
  enableLocalCallbackExample,
  globalApiKey,
  baseWebhookURL,
  maxAttachmentSize,
  setMessagesAsSeen,
  disabledCallbacks,
  enableSwaggerEndpoint,
  webVersion,
  webVersionCacheType
}
