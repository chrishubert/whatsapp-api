const request = require('supertest');

// Mock your application's environment variables
process.env.API_KEY = 'your_api_key';
process.env.SESSIONS_PATH = './sessions_test';

const app = require("../app");

// Mock your application's dependencies
jest.mock('axios');
jest.mock('fs');

// Define test cases
describe('API Tests', () => {
  it('should return a valid healthcheck', async () => {
    const response = await request(app).get('/ping');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'pong', success: true });
  });

  it('should return 403 Forbidden for invalid API key', async () => {
    const response = await request(app).get('/api/startSession/1');
    expect(response.status).toBe(403);
    expect(response.body).toEqual({ error: 'Invalid API key' });
  });

  // it('should setup a client session when requesting QR code', async () => {
  //   const response = await request(app).get('/api/qr/123456789').set('x-api-key', 'your_api_key');
  //   expect(response.status).toBe(200);
  //   expect(response.body).toEqual({ success: true, message: 'QR Requested successfully' });
  // });

  // it('should send a message when POSTing to /api/sendMessage', async () => {
  //   const response = await request(app)
  //     .post('/api/sendMessage/123456789')
  //     .set('x-api-key', 'your_api_key')
  //     .send({ target_number: '6281287331783', message: 'Hello, world! Love from Jest' });
  //   expect(response.status).toBe(200);
  //   expect(response.body).toEqual({ success: true, message: 'Message sent successfully' });
  // });

  // it('should terminate the session', async () => {
  //   const response = await request(app).get('/api/logout/123456789').set('x-api-key', 'your_api_key');
  //   expect(response.status).toBe(200);
  //   expect(response.body).toEqual({ success: true, message: 'Logged out successfully' });
  // });
});
