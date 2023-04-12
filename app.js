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

// Global API key for securing endpoints
const globalApiKey = process.env.API_KEY;

// Map to store client sessions
const sessions = new Map();
const sessionFolderPath = process.env.SESSIONS_PATH || './sessions';

// Trigger webhook endpoint
const triggerWebhook = (number, data_type, data) => {
  axios.post(process.env.BASE_WEBHOOK_URL, { data_type: data_type, data: data, number: number })
    .catch(error => console.error('Failed to send new message webhook:', error));
}
// Function to validate if the session is ready
const validateSessions = async (number) => {
  try {
    if (!sessions.has(number) || !sessions.get(number)) {
      return 'Client session not found';
    }
    const state = await sessions.get(number).getState();
    console.log("Session state:", number, state)
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
          const number = match[1];
          console.log("existing session detected", number);
          setupSession(number);
        }
      }

    });
  } catch (error) {
    console.error('Failed to restore sessions:', error);
  }
};

// Setup Session
async function setupSession(number) {
  try {
    if (sessions.has(number)) {
      console.log('Session already exists for:', number);
      return;
    }

    console.log('Setting up number:', number);

    const client = new Client({
      puppeteer: {
        executablePath: process.env.CHROME_BIN || null,
        // headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage']
      },
      authStrategy: new LocalAuth({ clientId: number, dataPath: sessionFolderPath })
    });

    client.initialize();

    client.on(`qr`, (qr) => {
      console.log('qr', qr);
      // Emit the new message to webhooks
      triggerWebhook(number, 'qr', qr);
    });

    client.on(`authenticated`, (session) => {
      triggerWebhook(number, 'status', 'authenticated');
    });

    client.on(`auth_failure`, (msg) => {
      console.log(`auth_failure`, msg);
      triggerWebhook(number, 'status', 'auth_failure');
    });

    client.on(`ready`, () => {
      console.log(`ready`, number);
      triggerWebhook(number, 'status', 'ready');
    });

    client.on(`message`, async msg => {
      console.log('message', number)
      triggerWebhook(number, 'message', msg);
    });

    client.on(`disconnected`, (reason) => {
      console.log(`disconnected`, reason);
      triggerWebhook(number, 'status', 'disconnected');
    });

    // Save the session to the Map
    sessions.set(number, client)
  } catch (error) {
    console.error('Failed to setup sessions:', error);
  }
};

// Function to delete client session
const deleteSession = async (number) => {
  const validation = await validateSessions(number);
  if (validation !== true) {
    return validation;
  }
  await sessions.get(number).destroy();
  fs.rmdir(`${sessionFolderPath}/session-${number}`, { recursive: true }, (err) => {
    if (err) {
      console.error(`Failed to delete folder: ${err}`);
    } else {
      console.log(`Folder ${sessionFolderPath}/session-${number} has been deleted successfully.`);
    }
  });
  sessions.delete(number);
  return true;
};

// Function to send a response with error status and message
const sendErrorResponse = (res, status, message) => {
  res.status(status).json({ error: message });
};

// Middleware for securing endpoints with API key
const apikeyMiddleware = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== globalApiKey) {
    return sendErrorResponse(res, 403, 'Invalid API key');
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

// API endpoint for getting QR code for login
app.get('/api/qr/:number', apikeyMiddleware, (req, res) => {
  try {
    setupSession(req.params.number);
    res.json({ success: true, message: 'QR Requested successfully' });
  } catch (error) {
    sendErrorResponse(res, 500, error.message);
  }
});

// API endpoint for sending a message
app.post('/api/sendMessage/:number', apikeyMiddleware, async (req, res) => {
  try {
    const { target_number, message } = req.body;
    const validation = await validateSessions(req.params.number)
    if (validation !== true) {
      return sendErrorResponse(res, 404, validation);
    }

    const client = sessions.get(req.params.number);
    await client.sendMessage(target_number + '@c.us', message);
    res.json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    console.log(error);
    sendErrorResponse(res, 500, error.message);
  }
});

// API endpoint for validating number
app.post('/api/validateNumber/:number', apikeyMiddleware, async (req, res) => {
  try {
    const validation = await validateSessions(req.params.number)
    if (validation !== true) {
      return sendErrorResponse(res, 404, validation);
    }
    const { target_number } = req.body;
    const client = sessions.get(req.params.number);
    const isNumberValid = await client.isRegisteredUser(target_number);
    res.json({ success: true, valid: isNumberValid });
  } catch (error) {
    sendErrorResponse(res, 500, error.message);
  }
});

// API endpoint for logging out
app.get('/api/logout/:number', apikeyMiddleware, async (req, res) => {
  try {
    if (!sessions.has(req.params.number)) {
      return sendErrorResponse(res, 404, 'Client session not found');
    }
    const result = await deleteSession(req.params.number);
    if (result === true) {
      res.json({ success: true, message: 'Logged out successfully' });
    } else {
      sendErrorResponse(res, 500, result);
    }
  } catch (error) {
    sendErrorResponse(res, 500, error.message);
  }
});

module.exports = app;