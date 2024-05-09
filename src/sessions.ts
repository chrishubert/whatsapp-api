import { Client, ClientOptions, LocalAuth, RemoteAuth } from 'whatsapp-web.js';
import fs from 'fs';
import mongoose from 'mongoose';
import { MongoStore } from 'wwebjs-mongo';
import path from 'path';
import {
  baseWebhookURL,
  sessionFolderPath,
  maxAttachmentSize,
  setMessagesAsSeen,
  webVersion,
  webVersionCacheType,
  recoverSessions,
  mongoURI,
  remoteSessionsIds,
} from './config';
import {
  triggerWebhook,
  waitForNestedObject,
  checkIfEventisEnabled,
} from './utils';
import { Providers, Types } from './enums';

export const sessions = new Map();

// Function to validate if the session is ready
export const validateSession = async (sessionId) => {
  try {
    const returnData = { success: false, state: null, message: '' };

    // Session not Connected 😢
    if (!sessions.has(sessionId) || !sessions.get(sessionId)) {
      returnData.message = 'session_not_found';
      return returnData;
    }

    const client = sessions.get(sessionId);
    // wait until the client is created
    await waitForNestedObject(client, 'pupPage').catch((err) => {
      return { success: false, state: null, message: err.message };
    });

    // Wait for client.pupPage to be evaluable
    let shouldContinue = true;
    while (shouldContinue) {
      try {
        if (client.pupPage.isClosed()) {
          return { success: false, state: null, message: 'browser tab closed' };
        }
        await client.pupPage.evaluate('1');
        shouldContinue = false;
      } catch (error) {
        // Ignore error and wait for a bit before trying again
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    const state = await client.getState();
    returnData.state = state;
    if (state !== 'CONNECTED') {
      returnData.message = 'session_not_connected';
      return returnData;
    }

    // Session Connected 🎉
    returnData.success = true;
    returnData.message = 'session_connected';
    return returnData;
  } catch (error) {
    console.log(error);
    return { success: false, state: null, message: error.message };
  }
};

// Function to handle client session restoration
export const restoreSessions = async () => {
  try {
    if (!fs.existsSync(sessionFolderPath)) {
      fs.mkdirSync(sessionFolderPath); // Create the session directory if it doesn't exist
    }
    // Read the contents of the folder
    fs.readdir(sessionFolderPath, async (_, files) => {
      // Iterate through the files in the parent folder
      for (const file of files) {
        // Use regular expression to extract the string from the folder name
        const match = file.match(/^session-(.+)$/);
        if (match) {
          const sessionId = match[1];
          console.log('Existing local session detected', sessionId);
          await setupSession({ sessionId, auth: { type: Types.local } });
        }
      }
    });
    if (mongoURI) {
      await mongoose.connect(mongoURI);
      const store = new MongoStore({ mongoose });
      for (const remoteSessionId of remoteSessionsIds) {
        if (
          await store.sessionExists({
            session: `RemoteAuth-${remoteSessionId}`,
          })
        ) {
          console.log('Existing remote session detected', remoteSessionId);
          await setupSession({
            sessionId: remoteSessionId,
            auth: { type: Types.remote, provider: Providers.mongodb },
          });
        }
      }
    }
  } catch (error) {
    console.log(error);
    console.error('Failed to restore sessions:', error);
  }
};

// Setup Session
export const setupSession = async ({
  sessionId,
  auth: { type, provider = undefined },
}) => {
  try {
    if (sessions.has(sessionId)) {
      return {
        success: false,
        message: `Session already exists for: ${sessionId}`,
        client: sessions.get(sessionId),
      };
    }
    if (!type) {
      return {
        success: false,
        message: 'Auth type not provided',
        client: null,
      };
    }
    if (!Types[type]) {
      return {
        success: false,
        message: `Invalid auth type: ${type}`,
        client: null,
      };
    }
    if (type === Types.remote && !provider) {
      return {
        success: false,
        message: 'Auth provider not provided',
        client: null,
      };
    }
    if (type === Types.remote && !Providers[provider]) {
      return {
        success: false,
        message: `Auth provider not supported: ${provider}`,
        client: null,
      };
    }

    let auth: undefined | LocalAuth | RemoteAuth;
    // Disable the delete folder from the logout function (will be handled separately)
    if (type === Types.local) {
      console.log(`Using LocalAuth session management for ${sessionId}`);
      auth = new LocalAuth({
        clientId: sessionId,
        dataPath: sessionFolderPath,
      });
      auth.logout = async () => {};
    } else if (type === Types.remote) {
      if (provider === Providers.mongodb) {
        console.log(`Using RemoteAuth session management for ${sessionId}`);
        if (mongoose.connection.readyState === mongoose.STATES.disconnected)
          await mongoose.connect(mongoURI);
        const store = new MongoStore({ mongoose });
        auth = new RemoteAuth({
          clientId: sessionId,
          backupSyncIntervalMs: 60000,
          store,
        });
      }
    }

    const clientOptions: ClientOptions = {
      puppeteer: {
        executablePath: process.env.CHROME_BIN,
        // headless: false,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-gpu',
          '--disable-dev-shm-usage',
        ],
      },
      userAgent:
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36',
      authStrategy: auth,
    };

    if (webVersion) {
      clientOptions.webVersion = webVersion;
      switch (webVersionCacheType.toLowerCase()) {
        case 'local':
          clientOptions.webVersionCache = {
            type: 'local',
          };
          break;
        case 'remote':
          clientOptions.webVersionCache = {
            type: 'remote',
            remotePath:
              'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/' +
              webVersion +
              '.html',
          };
          break;
        default:
          clientOptions.webVersionCache = {
            type: 'none',
          };
      }
    }

    const client = new Client(clientOptions);

    client
      .initialize()
      .catch((err) => console.log('Initialize error:', err.message));

    initializeEvents({ client, sessionId, auth: { type, provider } });

    // Save the session to the Map
    sessions.set(sessionId, client);
    return { success: true, message: 'Session initiated successfully', client };
  } catch (error) {
    return { success: false, message: error.message, client: null };
  }
};

export const initializeEvents = ({
  client,
  sessionId,
  auth: { type, provider },
}) => {
  // check if the session webhook is overridden
  const sessionWebhook =
    process.env[sessionId.toUpperCase() + '_WEBHOOK_URL'] || baseWebhookURL;

  if (recoverSessions) {
    waitForNestedObject(client, 'pupPage')
      .then(() => {
        const restartSession = async (sessionId) => {
          sessions.delete(sessionId);
          await client.destroy().catch((e) => {});
          await setupSession({ sessionId, auth: { type, provider } });
        };
        client.pupPage.once('close', function () {
          // emitted when the page closes
          console.log(`Browser page closed for ${sessionId}. Restoring`);
          restartSession(sessionId);
        });
        client.pupPage.once('error', function () {
          // emitted when the page crashes
          console.log(
            `Error occurred on browser page for ${sessionId}. Restoring`,
          );
          restartSession(sessionId);
        });
      })
      .catch((e) => {});
  }

  checkIfEventisEnabled('auth_failure').then((_) => {
    client.on('auth_failure', (message) => {
      triggerWebhook(sessionWebhook, sessionId, 'auth_failure', { message });
    });
  });

  checkIfEventisEnabled('authenticated').then((_) => {
    client.on('authenticated', (session) => {
      triggerWebhook(sessionWebhook, sessionId, 'authenticated', { session });
    });
  });

  checkIfEventisEnabled('change_battery').then((_) => {
    client.on('change_battery', (batteryInfo) => {
      triggerWebhook(sessionWebhook, sessionId, 'change_battery', {
        batteryInfo,
      });
    });
  });

  checkIfEventisEnabled('change_state').then((_) => {
    client.on('change_state', (state) => {
      triggerWebhook(sessionWebhook, sessionId, 'change_state', { state });
    });
  });

  checkIfEventisEnabled('disconnected').then((_) => {
    client.on('disconnected', (reason) => {
      triggerWebhook(sessionWebhook, sessionId, 'disconnected', { reason });
    });
  });

  checkIfEventisEnabled('group_join').then((_) => {
    client.on('group_join', (notification) => {
      triggerWebhook(sessionWebhook, sessionId, 'group_join', { notification });
    });
  });

  checkIfEventisEnabled('group_leave').then((_) => {
    client.on('group_leave', (notification) => {
      triggerWebhook(sessionWebhook, sessionId, 'group_leave', {
        notification,
      });
    });
  });

  checkIfEventisEnabled('group_admin_changed').then((_) => {
    client.on('group_admin_changed', (notification) => {
      triggerWebhook(sessionWebhook, sessionId, 'group_admin_changed', {
        notification,
      });
    });
  });

  checkIfEventisEnabled('group_membership_request').then((_) => {
    client.on('group_membership_request', (notification) => {
      triggerWebhook(sessionWebhook, sessionId, 'group_membership_request', {
        notification,
      });
    });
  });

  checkIfEventisEnabled('group_update').then((_) => {
    client.on('group_update', (notification) => {
      triggerWebhook(sessionWebhook, sessionId, 'group_update', {
        notification,
      });
    });
  });

  checkIfEventisEnabled('contact_changed').then((_) => {
    client.on('contact_changed', async (message, oldId, newId, isContact) => {
      triggerWebhook(sessionWebhook, sessionId, 'contact_changed', {
        message,
        oldId,
        newId,
        isContact,
      });
    });
  });

  checkIfEventisEnabled('media_uploaded').then((_) => {
    client.on('media_uploaded', (message) => {
      triggerWebhook(sessionWebhook, sessionId, 'media_uploaded', { message });
    });
  });

  checkIfEventisEnabled('message').then((_) => {
    client.on('message', async (message) => {
      triggerWebhook(sessionWebhook, sessionId, 'message', { message });
      if (message.hasMedia && message._data?.size < maxAttachmentSize) {
        // custom service event
        checkIfEventisEnabled('media_uploaded').then((_) => {
          message
            .downloadMedia()
            .then((messageMedia) => {
              triggerWebhook(sessionWebhook, sessionId, 'media_uploaded', {
                messageMedia,
                message,
              });
            })
            .catch((e) => {
              console.log('Download media error:', e.message);
            });
        });
      }
      if (setMessagesAsSeen) {
        const chat = await message.getChat();
        chat.sendSeen();
      }
    });
  });

  checkIfEventisEnabled('message_ack').then((_) => {
    client.on('message_ack', async (message, ack) => {
      triggerWebhook(sessionWebhook, sessionId, 'message_ack', {
        message,
        ack,
      });
      if (setMessagesAsSeen) {
        const chat = await message.getChat();
        chat.sendSeen();
      }
    });
  });

  checkIfEventisEnabled('message_edit').then((_) => {
    client.on('message_edit', async (message, newBody, prevBody) => {
      triggerWebhook(sessionWebhook, sessionId, 'message_edit', {
        message,
        newBody,
        prevBody,
      });
      if (setMessagesAsSeen) {
        const chat = await message.getChat();
        chat.sendSeen();
      }
    });
  });

  checkIfEventisEnabled('unread_count').then((_) => {
    client.on('unread_count', (chat) => {
      triggerWebhook(sessionWebhook, sessionId, 'unread_count', {
        chat,
      });
    });
  });

  checkIfEventisEnabled('message_create').then((_) => {
    client.on('message_create', async (message) => {
      triggerWebhook(sessionWebhook, sessionId, 'message_create', { message });
      if (setMessagesAsSeen) {
        const chat = await message.getChat();
        chat.sendSeen();
      }
    });
  });

  checkIfEventisEnabled('message_ciphertext').then((_) => {
    client.on('message_ciphertext', async (message) => {
      triggerWebhook(sessionWebhook, sessionId, 'message_ciphertext', {
        message,
      });
      if (setMessagesAsSeen) {
        const chat = await message.getChat();
        chat.sendSeen();
      }
    });
  });

  checkIfEventisEnabled('message_revoke_everyone').then((_) => {
    client.on('message_revoke_everyone', (message, revoked_msg) => {
      triggerWebhook(sessionWebhook, sessionId, 'message_revoke_everyone', {
        message,
        revoked_msg,
      });
    });
  });

  checkIfEventisEnabled('message_revoke_me').then((_) => {
    client.on('message_revoke_me', (message) => {
      triggerWebhook(sessionWebhook, sessionId, 'message_revoke_me', {
        message,
      });
    });
  });

  checkIfEventisEnabled('message_reaction').then((_) => {
    client.on('message_reaction', (reaction) => {
      triggerWebhook(sessionWebhook, sessionId, 'message_reaction', {
        reaction,
      });
    });
  });

  checkIfEventisEnabled('chat_removed').then((_) => {
    client.on('chat_removed', (chat) => {
      triggerWebhook(sessionWebhook, sessionId, 'chat_removed', {
        chat,
      });
    });
  });

  checkIfEventisEnabled('chat_archived').then((_) => {
    client.on('chat_archived', (chat, currState, prevState) => {
      triggerWebhook(sessionWebhook, sessionId, 'chat_archived', {
        chat,
        currState,
        prevState,
      });
    });
  });

  checkIfEventisEnabled('loading_screen').then((_) => {
    client.on('loading_screen', (percent, message) => {
      triggerWebhook(sessionWebhook, sessionId, 'loading_screen', {
        percent,
        message,
      });
    });
  });

  client.on('qr', (qr) => {
    // inject qr code into session
    client.qr = qr;
    checkIfEventisEnabled('qr').then((_) => {
      triggerWebhook(sessionWebhook, sessionId, 'qr', { qr });
    });
  });

  checkIfEventisEnabled('call').then((_) => {
    client.on('call', (call) => {
      triggerWebhook(sessionWebhook, sessionId, 'call', { call });
    });
  });

  checkIfEventisEnabled('ready').then((_) => {
    client.on('ready', () => {
      triggerWebhook(sessionWebhook, sessionId, 'ready', {});
    });
  });

  checkIfEventisEnabled('remote_session_saved').then((_) => {
    client.on('remote_session_saved', () => {
      triggerWebhook(sessionWebhook, sessionId, 'remote_session_saved', {});
    });
  });
};

export const deleteSessionFolder = async (sessionId) => {
  try {
    const targetDirPath = path.join(sessionFolderPath, `session-${sessionId}`);
    const resolvedTargetDirPath = await fs.promises.realpath(targetDirPath);
    const resolvedSessionPath = await fs.promises.realpath(sessionFolderPath);

    // Ensure the target directory path ends with a path separator
    const safeSessionPath = `${resolvedSessionPath}${path.sep}`;

    // Validate the resolved target directory path is a subdirectory of the session folder path
    if (!resolvedTargetDirPath.startsWith(safeSessionPath)) {
      throw new Error('Invalid path: Directory traversal detected');
    }
    await fs.promises.rm(resolvedTargetDirPath, {
      recursive: true,
      force: true,
    });
  } catch (error) {
    console.log('Folder deletion error', error);
    throw error;
  }
};

// Function to delete client session
export const deleteSession = async (sessionId, validation) => {
  try {
    const client = sessions.get(sessionId);
    if (!client) {
      return;
    }
    client.pupPage.removeAllListeners('close');
    client.pupPage.removeAllListeners('error');
    if (validation.success) {
      // Client Connected, request logout
      console.log(`Logging out session ${sessionId}`);
      await client.logout();
    } else if (validation.message === 'session_not_connected') {
      // Client not Connected, request destroy
      console.log(`Destroying session ${sessionId}`);
      await client.destroy();
    }

    // Wait for client.pupBrowser to be disconnected before deleting the folder
    while (client.pupBrowser.isConnected()) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    await deleteSessionFolder(sessionId);
    sessions.delete(sessionId);
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// Function to handle session flush
export const flushSessions = async (deleteOnlyInactive) => {
  try {
    // Read the contents of the sessions folder
    const files = await fs.promises.readdir(sessionFolderPath);
    // Iterate through the files in the parent folder
    for (const file of files) {
      // Use regular expression to extract the string from the folder name
      const match = file.match(/^session-(.+)$/);
      if (match) {
        const sessionId = match[1];
        const validation = await validateSession(sessionId);
        if (!deleteOnlyInactive || !validation.success) {
          await deleteSession(sessionId, validation);
        }
      }
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export default {
  sessions,
  setupSession,
  restoreSessions,
  validateSession,
  deleteSession,
  flushSessions,
};
