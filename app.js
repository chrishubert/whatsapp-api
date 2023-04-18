// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const { Client, LocalAuth, Location, List, Buttons, MessageMedia } = require('whatsapp-web.js');
const fs = require('fs');
const qrcode = require('qrcode-terminal');

// Initialize Express app
const app = express();
app.disable("x-powered-by");

// Middleware for parsing JSON request bodies
app.use(bodyParser.json({ limit: '10mb' }));

// Load environment variables from .env file
require('dotenv').config();

// setup global const
const sessions = new Map();
const sessionFolderPath = process.env.SESSIONS_PATH || './sessions';
const enableLocalCallbackExample = process.env.ENABLE_LOCAL_CALLBACK_EXAMPLE === "TRUE";
const globalApiKey = process.env.API_KEY

// Trigger webhook endpoint
const triggerWebhook = (sessionId, data_type, data) => {
  axios.post(process.env.BASE_WEBHOOK_URL, { data_type: data_type, data: data, sessionId: sessionId }, { headers: { 'x-api-key': globalApiKey } })
    .catch(error => console.error('Failed to send new message webhook:', error.message));
}

// Function to validate if the session is ready
const validateSession = async (sessionId) => {
  try {
    if (!sessions.has(sessionId) || !sessions.get(sessionId)) {
      return 'Client session not found';
    }
    const state = await sessions.get(sessionId).getState().catch(_ => _);
    console.log("Session state:", sessionId, state)
    if (state !== "CONNECTED") {
      return 'Client session not ready';
    }
    return true;
  } catch (error) {
    return error.message;
  }
}

// Function to handle client session restoration
const restoreSessions = () => {
  try {
    if (!fs.existsSync(sessionFolderPath)) {
      fs.mkdirSync(sessionFolderPath); // Create the session directory if it doesn't exist
    }
    // Read the contents of the folder
    fs.readdir(sessionFolderPath, (err, files) => {
      // Iterate through the files in the parent folder
      for (const file of files) {
        // Use regular expression to extract the string from the folder name
        const match = file.match(/^session-(.+)$/);
        if (match) {
          const sessionId = match[1];
          console.log("existing session detected", sessionId);
          setupSession(sessionId);
        }
      }
    });
  } catch (error) {
    console.log(error);
    console.error('Failed to restore sessions:', error);
  }
};

// Setup Session
async function setupSession(sessionId) {
  try {
    if (sessions.has(sessionId)) {
      console.log('Session already exists for:', sessionId);
      return;
    }

    console.log('Setting up session:', sessionId);

    const client = new Client({
      puppeteer: {
        executablePath: process.env.CHROME_BIN || null,
        // headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage']
      },
      userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.54 Safari/537.36",
      authStrategy: new LocalAuth({ clientId: sessionId, dataPath: sessionFolderPath })
    });

    client.initialize().catch(_ => _);

    client.on(`auth_failure`, (msg) => {
      triggerWebhook(sessionId, 'status', { msg: msg });
    });

    client.on(`authenticated`, () => {
      triggerWebhook(sessionId, 'authenticated');
    });

    client.on('call', async (call) => {
      triggerWebhook(sessionId, 'call', { call: call });
    });

    client.on('change_state', state => {
      triggerWebhook(sessionId, 'change_state', { state: state });
    });

    client.on(`disconnected`, (reason) => {
      triggerWebhook(sessionId, 'disconnected', { reason: reason });
    });

    client.on('group_join', (notification) => {
      triggerWebhook(sessionId, 'group_join', { notification: notification });
    });

    client.on('group_leave', (notification) => {
      triggerWebhook(sessionId, 'group_leave', { notification: notification });
    });

    client.on('group_update', (notification) => {
      triggerWebhook(sessionId, 'group_update', { notification: notification });
    });

    client.on('loading_screen', (percent, message) => {
      triggerWebhook(sessionId, 'loading_screen', { percent: percent, message: message });
    });

    client.on(`media_uploaded`, (message) => {
      triggerWebhook(sessionId, 'media_uploaded', { message: message });
    });

    client.on(`message`, async (message) => {
      triggerWebhook(sessionId, 'message', { message: message });
      if (message.hasMedia){
        const media = await message.downloadMedia();
        triggerWebhook(sessionId, 'media', { media: media });
      }
    });

    client.on('message_ack', (msg, ack) => {
      triggerWebhook(sessionId, 'message_ack', { msg: msg, ack: ack });
    });

    client.on(`message_create`, (message) => {
      triggerWebhook(sessionId, 'message_create', { message: message });
    });

    client.on('message_reaction', (reaction) => {
      triggerWebhook(sessionId, 'message_reaction', { reaction: reaction });
    });

    client.on('message_revoke_everyone', async (after, before) => {
      triggerWebhook(sessionId, 'message_revoke_everyone', { after: after, before: before });
    });

    client.on(`qr`, (qr) => {
      triggerWebhook(sessionId, 'qr', { qr: qr });
    });

    client.on(`ready`, () => {
      triggerWebhook(sessionId, 'ready');
    });

    client.on('contact_changed', async (message, oldId, newId, isContact) => {
      triggerWebhook(sessionId, 'contact_changed', { message: message, oldId: oldId, newId: newId, isContact: isContact });

    });

    // Save the session to the Map
    sessions.set(sessionId, client)
  } catch (error) {
    console.error('Failed to setup sessions:', error.message);
  }
};

// Function to check if folder is writeable
const deleteSessionFolder = (sessionId) => {
  fs.rmSync(`${sessionFolderPath}/session-${sessionId}`, { recursive: true, force: true }, async err => {
    console.log(err);
    await new Promise(resolve => setTimeout(resolve, 200));
    deleteSessionFolder(sessionId);
  });
}

// Function to delete client session
const deleteSession = async (sessionId) => {

  if (sessions.has(sessionId)) {
    console.log(`Destroying session ${sessionId}`)
    await sessions.get(sessionId).destroy().catch(err => console.log(err));
  }
  deleteSessionFolder(sessionId);
  sessions.delete(sessionId);
  return true;
};

// Function to send a response with error status and message
const sendErrorResponse = (res, status, message) => {
  res.status(status).json({ error: message });
};

// Middleware for securing endpoints with API key
const apikeyMiddleware = (req, res, next) => {
  if (globalApiKey) {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || apiKey !== globalApiKey) {
      return sendErrorResponse(res, 403, 'Invalid API key');
    }
  }
  next();
};

const sessionValidationMiddleware = async (req, res, next) => {
  const validation = await validateSession(req.params.sessionId)
  if (validation !== true) {
    return sendErrorResponse(res, 404, validation);
  }
  next();
}

// Initialize WhatsApp client and restore sessions
restoreSessions();

// API endpoint to check if server is alive
app.get('/ping', (req, res) => {
  try {
    res.json({ success: true, message: 'pong' });
  } catch (error) {
    sendErrorResponse(res, 500, error.message);
  }
});

// API endpoint for starting the session
app.get('/api/startSession/:sessionId', apikeyMiddleware, (req, res) => {
  try {
    if (!req.params.sessionId.match(/^[a-z0-9A-Z]+$/i)) {
      return sendErrorResponse(res, 500, 'Session should be alphanumerical');
    }
    setupSession(req.params.sessionId);
    res.json({ success: true, message: 'Session initiated successfully' });
  } catch (error) {
    sendErrorResponse(res, 500, error.message);
  }
});

// API endpoint for sending a message
app.post('/api/sendMessage/:sessionId', [apikeyMiddleware, sessionValidationMiddleware], async (req, res) => {
  try {
    const { chatId, content, contentType, options } = req.body;
    const client = sessions.get(req.params.sessionId);
    let messageOut;

    switch (contentType) {
      case 'string':
        messageOut = await client.sendMessage(chatId, content, options);
        break;
      case 'MessageMediaFromURL':
        const messageMediaFromURL = await MessageMedia.fromUrl(content);
        messageOut = await client.sendMessage(chatId, messageMediaFromURL, options);
        break;
      case 'MessageMedia':
        const messageMedia = new MessageMedia(content.mimetype, content.data, content.filename, content.filesize);
        messageOut = await client.sendMessage(chatId, messageMedia, options);
        break;
      /* Disabled - non functioning anymore
      case 'Location':
        const location = new Location(content.latitude, content.longitude, content.description);
        messageOut = await client.sendMessage(chatId, location, options);
        break;
      case 'Buttons':
        const buttons = new Buttons(content.body, content.buttons, content.title, content.footer);
        messageOut = await client.sendMessage(chatId, buttons, options);
        break;
      case 'List':
        const list = new List(content.body, content.list, content.title, content.footer);
        messageOut = await client.sendMessage(chatId, list, options);
        break;
      */
      default:
        return sendErrorResponse(res, 404, 'contentType invalid, must be string, MessageMedia, MessageMediaFromURL, Location, Buttons, or List');
    }

    res.json({ success: true, message: messageOut });
  } catch (error) {
    console.log(error);
    sendErrorResponse(res, 500, error.message);
  }
});

// API endpoint for validating WhatsApp number
app.post('/api/validateNumber/:sessionId', [apikeyMiddleware, sessionValidationMiddleware], async (req, res) => {
  try {
    const { targetNumber } = req.body;
    const client = sessions.get(req.params.sessionId);
    const isNumberValid = await client.isRegisteredUser(targetNumber);
    res.json({ success: true, valid: isNumberValid });
  } catch (error) {
    sendErrorResponse(res, 500, error.message);
  }
});

// API endpoint for getting contacts
app.get('/api/getContacts/:sessionId', [apikeyMiddleware, sessionValidationMiddleware], async (req, res) => {
  try {
    const client = sessions.get(req.params.sessionId);
    const contacts = await client.getContacts() ;
    res.json({ success: true, contacts: contacts });
  } catch (error) {
    sendErrorResponse(res, 500, error.message);
  }
});

// API endpoint for logging out
app.get('/api/terminateSession/:sessionId', apikeyMiddleware, async (req, res) => {
  try {
    if (!req.params.sessionId.match(/^[a-z0-9A-Z]+$/i)) {
      return sendErrorResponse(res, 500, 'Session should be alphanumerical');
    }
    if (!sessions.has(req.params.sessionId)) {
      return sendErrorResponse(res, 404, 'Client session not found');
    }
    const result = await deleteSession(req.params.sessionId);
    if (result === true) {
      res.json({ success: true, message: 'Logged out successfully' });
    } else {
      return sendErrorResponse(res, 500, result);
    }
  } catch (error) {
    console.log(error);
    sendErrorResponse(res, 500, error.message);
  }
});

const flushInactiveSessions = async (deleteInactive) => {
  // Read the contents of the sessions folder
  fs.readdir(sessionFolderPath, async (err, files) => {
    // Iterate through the files in the parent folder
    for (const file of files) {
      // Use regular expression to extract the string from the folder name
      const match = file.match(/^session-(.+)$/);
      if (match && match[1]) {
        const sessionId = match[1];
        if (deleteInactive) { await deleteSession(sessionId); }
        else {
          const validation = await validateSession(sessionId);
          if (validation !== true) { await deleteSession(sessionId); }
        }
      }
    }
  });
}

// API endpoint for flushing all non-connected sessions
app.get('/api/terminateInactiveSessions', apikeyMiddleware, async (req, res) => {
  await flushInactiveSessions(false);
  res.json({ success: true, message: 'Flush completed successfully' });
});

// API endpoint for flushing all sessions
app.get('/api/terminateAllSessions', apikeyMiddleware, async (req, res) => {
  await flushInactiveSessions(true);
  res.json({ success: true, message: 'Flush completed successfully' });
});

// API basic callback
if (enableLocalCallbackExample) {
  app.post('/localCallbackExample', apikeyMiddleware, (req, res) => {
    try {
      const { sessionId, data_type, data } = req.body;
      if (data_type === 'qr') { qrcode.generate(data.qr, { small: true }); }
      fs.writeFile(`${sessionFolderPath}/message_log.txt`, `(${sessionId}) ${data_type}: ${JSON.stringify(data)}\r\n`, { flag: "a+" }, _ => _)
      res.json({ success: true });
    } catch (error) {
      console.log(error);
      fs.writeFile(`${sessionFolderPath}/message_log.txt`, `(ERROR) ${JSON.stringify(error)}\r\n`, { flag: "a+" }, _ => _)
      sendErrorResponse(res, 500, error.message);
    }
  });
}

module.exports = app; 