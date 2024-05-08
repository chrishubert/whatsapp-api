// Load environment variables from .env file
import { config } from 'dotenv';
config();

// setup global const
export const sessionFolderPath = process.env.SESSIONS_PATH || './sessions';
export const enableLocalCallbackExample =
  (process.env.ENABLE_LOCAL_CALLBACK_EXAMPLE || '').toLowerCase() === 'true';
export const globalApiKey = process.env.API_KEY;
export const baseWebhookURL = process.env.BASE_WEBHOOK_URL;
export const maxAttachmentSize = process.env.MAX_ATTACHMENT_SIZE
  ? parseInt(process.env.MAX_ATTACHMENT_SIZE)
  : 10000000;
export const setMessagesAsSeen =
  (process.env.SET_MESSAGES_AS_SEEN || '').toLowerCase() === 'true';
export const disabledCallbacks = process.env.DISABLED_CALLBACKS
  ? process.env.DISABLED_CALLBACKS.split('|')
  : [];
export const enableSwaggerEndpoint =
  (process.env.ENABLE_SWAGGER_ENDPOINT || '').toLowerCase() === 'true';
export const webVersion = process.env.WEB_VERSION;
export const webVersionCacheType = process.env.WEB_VERSION_CACHE_TYPE || 'none';
export const rateLimitMax = process.env.RATE_LIMIT_MAX
  ? parseInt(process.env.RATE_LIMIT_MAX)
  : 1000;
export const rateLimitWindowMs = process.env.RATE_LIMIT_WINDOW_MS
  ? parseInt(process.env.RATE_LIMIT_WINDOW_MS)
  : 1000;
export const recoverSessions =
  (process.env.RECOVER_SESSIONS || '').toLowerCase() === 'true';

export default {
  sessionFolderPath,
  enableLocalCallbackExample,
  globalApiKey,
  baseWebhookURL,
  maxAttachmentSize,
  setMessagesAsSeen,
  disabledCallbacks,
  enableSwaggerEndpoint,
  webVersion,
  webVersionCacheType,
  rateLimitMax,
  rateLimitWindowMs,
  recoverSessions,
};
