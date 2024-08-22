let API_BASE_URL;
if (process.env.REACT_APP_BACKEND_RESTAPI_PORT) {
  API_BASE_URL = `${process.env.REACT_APP_BACKEND_URL}:${process.env.REACT_APP_BACKEND_RESTAPI_PORT}`;
} else {
  API_BASE_URL = process.env.REACT_APP_BACKEND_URL
}

export function getHeaders(apiKey) {
  if (apiKey === '') {
    return null;
  } else {
    return { headers: { "x-api-key": apiKey } }
  }
}

export async function checkApiKey(apiKey) {
  const headers = getHeaders(apiKey);
  const response = await fetch(`${API_BASE_URL}/checkApiKey`, headers);
  return await response.json();
}

export async function getAllSessions(apiKey) {
  const headers = getHeaders(apiKey);
  const response = await fetch(`${API_BASE_URL}/session/getAllSessions`, headers);
  return await response.json();
}

export async function startSession(sessionId, apiKey) {
  const headers = getHeaders(apiKey);
  const response = await fetch(`${API_BASE_URL}/session/start/${sessionId}`, headers);
  return await response.json();
}

export async function getSessionStatus(sessionId, apiKey) {
  const headers = getHeaders(apiKey);
  const response = await fetch(`${API_BASE_URL}/session/status/${sessionId}`, headers);
  return await response.json();
}

export async function getSessionQr(sessionId, apiKey) {
  const headers = getHeaders(apiKey);
  const response = await fetch(`${API_BASE_URL}/session/qr/${sessionId}`, headers);
  return await response.json();
}

export async function restartSession(sessionId, apiKey) {
  const headers = getHeaders(apiKey);
  const response = await fetch(`${API_BASE_URL}/session/restart/${sessionId}`, headers);
  return await response.json();
}

export async function terminateSession(sessionId, apiKey) {
  const headers = getHeaders(apiKey);
  const response = await fetch(`${API_BASE_URL}/session/terminate/${sessionId}`, headers);
  return await response.json();
}

export async function terminateInactiveSessions(apiKey) {
  const headers = getHeaders(apiKey);
  const response = await fetch(`${API_BASE_URL}/session/terminateInactive`, headers);
  return await response.json();
}

export async function terminateAllSessions(apiKey) {
  const headers = getHeaders(apiKey);
  const response = await fetch(`${API_BASE_URL}/session/terminateAll`, headers);
  return await response.json();
}
