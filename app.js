// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const { Client, LocalAuth } = require('whatsapp-web.js');
const fs = require('fs');

// Initialize Express app
const app = express();

// Middleware for parsing JSON request bodies
app.use(bodyParser.json());

// Load environment variables from .env file
require('dotenv').config();

// Map to store client sessions
const sessions = new Map();
const sessionFolderPath = process.env.SESSIONS_PATH || './sessions';

// Trigger webhook endpoint
const triggerWebhook = (sessionId, data_type, data) => {
  axios.post(process.env.BASE_WEBHOOK_URL, { data_type: data_type, data: data, sessionId: sessionId })
    .catch(error => console.error('Failed to send new message webhook:', error));
}
// Function to validate if the session is ready
const validateSessions = async (sessionId) => {
  try {
    if (!sessions.has(sessionId) || !sessions.get(sessionId)) {
      return 'Client session not found';
    }
    const state = await sessions.get(sessionId).getState();
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
      authStrategy: new LocalAuth({ clientId: sessionId, dataPath: sessionFolderPath })
    });

    client.initialize().catch(_ => _);

    client.on(`qr`, (qr) => {
      console.log('qr', qr);
      triggerWebhook(sessionId, 'qr', qr);
    });

    client.on(`authenticated`, () => {
      triggerWebhook(sessionId, 'status', 'authenticated');
    });

    client.on(`auth_failure`, (msg) => {
      console.log(`auth_failure`, msg);
      triggerWebhook(sessionId, 'status', 'auth_failure');
    });

    client.on(`ready`, () => {
      console.log(`ready`, sessionId);
      triggerWebhook(sessionId, 'status', 'ready');
    });

    client.on(`message`, async msg => {
      console.log('message', sessionId)
      triggerWebhook(sessionId, 'message', msg);
    });

    client.on(`disconnected`, (reason) => {
      console.log(`disconnected`, reason);
      triggerWebhook(sessionId, 'status', 'disconnected');
    });

    // Save the session to the Map
    sessions.set(sessionId, client)
  } catch (error) {
    console.error('Failed to setup sessions:', error.message);
  }
};

// Function to check if folder is writeable
const deleteSessionFolder = (sessionId) => {
  fs.rmSync(`${sessionFolderPath}/session-${sessionId}`, { recursive: true, force: true }, _ => {
    deleteSessionFolder(sessionId);
  });
}

// Function to delete client session
const deleteSession = async (sessionId) => {
  if (sessions.has(sessionId)) {
    console.log(`Destroying session ${sessionId}`)
    await sessions.get(sessionId).destroy().catch(_ => _);
  }
  // await new Promise(resolve => setTimeout(resolve, 500));
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
  const globalApiKey = process.env.API_KEY
  if (globalApiKey) {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || apiKey !== globalApiKey) {
      return sendErrorResponse(res, 403, 'Invalid API key');
    }
  }
  next();
};

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
    setupSession(req.params.sessionId);
    res.json({ success: true, message: 'Session initiated successfully' });
  } catch (error) {
    sendErrorResponse(res, 500, error.message);
  }
});

// API endpoint for sending a message
app.post('/api/sendMessage/:sessionId', apikeyMiddleware, async (req, res) => {
  try {
    const { targetNumber, message } = req.body;
    const validation = await validateSessions(req.params.sessionId)
    if (validation !== true) {
      return sendErrorResponse(res, 404, validation);
    }
    const client = sessions.get(req.params.sessionId);
    await client.sendMessage(targetNumber + '@c.us', message);
    res.json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    console.log(error);
    sendErrorResponse(res, 500, error.message);
  }
});

// API endpoint for validating WhatsApp number
app.post('/api/validateNumber/:sessionId', apikeyMiddleware, async (req, res) => {
  try {
    const validation = await validateSessions(req.params.sessionId)
    if (validation !== true) {
      return sendErrorResponse(res, 404, validation);
    }
    const { targetNumber } = req.body;
    const client = sessions.get(req.params.number);
    const isNumberValid = await client.isRegisteredUser(targetNumber);
    res.json({ success: true, valid: isNumberValid });
  } catch (error) {
    sendErrorResponse(res, 500, error.message);
  }
});

// API endpoint for logging out
app.get('/api/terminateSession/:sessionId', apikeyMiddleware, async (req, res) => {
  try {
    if (!sessions.has(req.params.sessionId)) {
      return sendErrorResponse(res, 404, 'Client session not found');
    }
    const result = await deleteSession(req.params.sessionId);
    if (result === true) {
      res.json({ success: true, message: 'Logged out successfully' });
    } else {
      sendErrorResponse(res, 500, result);
    }
  } catch (error) {
    console.log(error);
    sendErrorResponse(res, 500, error.message);
  }
});

const flushInactiveSessions = async () => {
  // Read the contents of the sessions folder
  fs.readdir(sessionFolderPath, async (err, files) => {
    // Iterate through the files in the parent folder
    for (const file of files) {
      // Use regular expression to extract the string from the folder name
      const match = file.match(/^session-(.+)$/);
      if (match) {
        const sessionId = match[1];
        if (sessions.has(sessionId)) {
          const state = await sessions.get(sessionId).getState().catch( _ => _);
          if (state !== "CONNECTED") {
            console.log("Inactive session to be deleted", sessionId, state);
            await deleteSession(sessionId);
          }
        } else {
          console.log("Orphan session to be deleted", sessionId);
          await deleteSession(sessionId);
        }
      }
    }
  });
}

// API endpoint for flushing all non-connected sessions
app.get('/api/flushSessions', apikeyMiddleware, async (req, res) => {
  const result = await flushInactiveSessions();
  res.json({ success: true, message: 'Flush completed successfully' });
});

module.exports = app; 