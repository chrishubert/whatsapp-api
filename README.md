# WhatsApp Web API

A comprehensive RESTful API wrapper for WhatsApp Web, built on top of [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js). This API allows developers to interact with WhatsApp Web through a simple and powerful HTTP interface.

## 🌟 Features

- **Multi-session Support**: Run multiple WhatsApp sessions simultaneously
- **Message Management**: Send, receive, and manage messages including text, media, location, buttons, and more
- **Chat Operations**: Create, archive, pin, and manage individual and group chats
- **Group Management**: Create groups, add/remove participants, set admins, and manage group settings
- **Contact Handling**: Get contacts, block/unblock, and manage profiles
- **Media Support**: Send and receive images, documents, audio, and videos
- **Status Updates**: Set and manage WhatsApp status
- **Presence Management**: Show typing status and online/offline status
- **QR Code Authentication**: Easy session authentication using QR codes
- **Webhook Integration**: Receive real-time notifications for WhatsApp events
- **Swagger Documentation**: Interactive API documentation with Swagger UI
- **Security**: API key authentication and rate limiting
- **Docker Support**: Easy deployment with Docker and Docker Compose

## 📋 API Endpoints

The API is organized into logical controller groups:

- **Session**: Start, stop, and manage WhatsApp sessions
- **Client**: Core WhatsApp client operations
- **Chat**: Individual chat operations
- **Group Chat**: Group-specific operations
- **Message**: Message-related operations
- **Contact**: Contact-related operations

## 🚀 Installation

### Prerequisites

- Node.js 14.17.0 or higher
- NPM or Yarn package manager

### Local Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/username/whatsapp-web-api.git
   cd whatsapp-web-api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the example environment file and configure it:
   ```bash
   cp .env.example .env
   ```
   
4. Edit the `.env` file to configure your environment:
   - Set `API_KEY` for authentication
   - Configure `BASE_WEBHOOK_URL` for callbacks
   - Adjust other settings as needed

5. Generate Swagger documentation:
   ```bash
   npm run swagger
   ```

6. Start the server:
   ```bash
   npm start
   ```

### Docker Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/username/whatsapp-web-api.git
   cd whatsapp-web-api
   ```

2. Copy the example environment file and configure it:
   ```bash
   cp .env.example .env
   ```

3. Build and start the Docker container:
   ```bash
   docker-compose up -d
   ```

## 💻 Usage

### Authentication

All API endpoints (except health checks) require an API key for authentication. You can set the API key in the `.env` file.

Include the API key in the `X-API-Key` header of your requests:

```
X-API-Key: your_global_api_key_here
```

### Starting a Session

To start a new WhatsApp session:

```
GET /session/start/{sessionId}
```

You'll receive a QR code that you need to scan with your WhatsApp mobile app.

### Sending a Message

```http
POST /client/sendMessage/{sessionId}
Content-Type: application/json
X-API-Key: your_global_api_key_here

{
  "chatId": "123456789@c.us",
  "contentType": "string",
  "content": "Hello, world!"
}
```

## 📚 Documentation

Access the Swagger documentation at:

```
http://localhost:3000/api-docs
```

Default credentials (configurable in .env):
- Username: admin
- Password: password

## ⚙️ Configuration

The API can be configured through environment variables in the `.env` file:

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3000 |
| API_KEY | Global API key for authentication | (empty) |
| BASE_WEBHOOK_URL | URL for webhooks (mandatory) | - |
| ENABLE_LOCAL_CALLBACK_EXAMPLE | Enable local callback example | TRUE |
| RATE_LIMIT_MAX | Maximum number of connections per time frame | 1000 |
| RATE_LIMIT_WINDOW_MS | Time frame for rate limiting (ms) | 1000 |
| MAX_ATTACHMENT_SIZE | Maximum attachment size (bytes) | 10000000 |
| SET_MESSAGES_AS_SEEN | Automatically mark messages as read | TRUE |
| DISABLED_CALLBACKS | Types of callbacks to disable | message_ack,message_reaction... |
| WEB_VERSION | WhatsApp Web version to use | 2.2328.5 |
| RECOVER_SESSIONS | Recover sessions on page failures | TRUE |
| SESSIONS_PATH | Path to store session files | ./sessions |
| ENABLE_SWAGGER_ENDPOINT | Enable Swagger documentation | TRUE |
| SWAGGER_USER | Username for Swagger UI | your_secure_username |
| SWAGGER_PASSWORD | Password for Swagger UI | your_secure_password |

## 🔒 Security Considerations

- Change the default API key and Swagger credentials
- Use HTTPS in production
- Configure appropriate rate limits
- Limit callback URLs to trusted domains

### Security Vulnerabilities

This project addresses the following security vulnerabilities:

- ✅ **Prototype Pollution**: Replaced vulnerable `base64-img` package with a custom secure implementation
- ⚠️ **WS DoS Vulnerability**: See [Security Documentation](./docs/SECURITY.md) for detailed fixes

For detailed information on security vulnerabilities and their fixes, see [Security Documentation](./docs/SECURITY.md).

## 🐳 Docker Deployment

The included Docker setup uses:
- Node.js 20 Alpine as the base image
- Chromium browser for WhatsApp Web
- Production-ready configuration

To build and start the container:

```bash
docker-compose up -d
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request 