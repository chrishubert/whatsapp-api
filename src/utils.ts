import axios from 'axios';
import { globalApiKey, disabledCallbacks } from './config';

// Trigger webhook endpoint
export const triggerWebhook = (webhookURL, sessionId, dataType, data) => {
  axios
    .post(
      webhookURL,
      { dataType, data, sessionId },
      { headers: { 'x-api-key': globalApiKey } },
    )
    .catch((error) =>
      console.error(
        'Failed to send new message webhook:',
        sessionId,
        dataType,
        error.message,
        data || '',
      ),
    );
};

// Function to send a response with error status and message
export const sendErrorResponse = (res, status, message) => {
  res.status(status).json({ success: false, error: message });
};

// Function to wait for a specific item not to be null
export const waitForNestedObject = (
  rootObj,
  nestedPath,
  maxWaitTime = 10000,
  interval = 100,
) => {
  const start = Date.now();
  return new Promise<void>((resolve, reject) => {
    const checkObject = () => {
      const nestedObj = nestedPath
        .split('.')
        .reduce((obj, key) => (obj ? obj[key] : undefined), rootObj);
      if (nestedObj) {
        // Nested object exists, resolve the promise
        resolve();
      } else if (Date.now() - start > maxWaitTime) {
        // Maximum wait time exceeded, reject the promise
        console.log('Timed out waiting for nested object');
        reject(new Error('Timeout waiting for nested object'));
      } else {
        // Nested object not yet created, continue waiting
        setTimeout(checkObject, interval);
      }
    };
    checkObject();
  });
};

export const checkIfEventisEnabled = (event) => {
  return new Promise<void>((resolve, reject) => {
    if (!disabledCallbacks.includes(event)) {
      resolve();
    }
  });
};

export default {
  triggerWebhook,
  sendErrorResponse,
  waitForNestedObject,
  checkIfEventisEnabled,
};
