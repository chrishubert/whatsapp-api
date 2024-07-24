// Load environment variables from .env file
require('dotenv').config()

// setup global const
const appPort = process.env.PORT || 3000
const sessionFolderPath = process.env.SESSIONS_PATH || './sessions'
const enableLocalCallbackExample = (process.env.ENABLE_LOCAL_CALLBACK_EXAMPLE || '').toLowerCase() === 'true'
const apiKey = process.env.API_KEY
const restApiKey = process.env.REST_API_KEY
const baseWebhookURL = process.env.BASE_WEBHOOK_URL
const maxAttachmentSize = parseInt(process.env.MAX_ATTACHMENT_SIZE) || 10000000
const setMessagesAsSeen = (process.env.SET_MESSAGES_AS_SEEN || '').toLowerCase() === 'true'
const disabledCallbacks = process.env.DISABLED_CALLBACKS ? process.env.DISABLED_CALLBACKS.split('|') : []
const enableSwaggerEndpoint = (process.env.ENABLE_SWAGGER_ENDPOINT || '').toLowerCase() === 'true'
const webVersion = process.env.WEB_VERSION
const webVersionCacheType = process.env.WEB_VERSION_CACHE_TYPE || 'none'
const qrCodeMaxRetries = process.env.QR_MAX_RETRIES || 10
const rateLimitMax = process.env.RATE_LIMIT_MAX || 1000
const rateLimitWindowMs = process.env.RATE_LIMIT_WINDOW_MS || 1000
const recoverSessions = (process.env.RECOVER_SESSIONS || '').toLowerCase() === 'true'
const rabbitmq = `amqp://${process.env.RABBIT_USER}:${process.env.RABBIT_PASS}@rabbitmq:5672`

module.exports = {
  appPort,
  apiKey,
  rabbitmq,
  restApiKey,
  sessionFolderPath,
  enableLocalCallbackExample,
  baseWebhookURL,
  maxAttachmentSize,
  setMessagesAsSeen,
  disabledCallbacks,
  enableSwaggerEndpoint,
  webVersion,
  webVersionCacheType,
  rateLimitMax,
  qrCodeMaxRetries,
  rateLimitWindowMs,
  recoverSessions
}
