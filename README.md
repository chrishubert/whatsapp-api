# Project Name: WhatsApp Web.js REST API Wrapper

This project is a REST API wrapper for the [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js) library, providing an easy-to-use interface to interact with the WhatsApp Web platform. It is designed to be scalable, secure, and easy to integrate with other applications.

## Features

1. Available API endpoints
- API Get QR (Login)
- API Send Message
- API Validate if number is available on WhatsApp
- API Logout
2. Available Webhooks (defined in .env file)
- Webhook new message
- Webhook status change
3. Handle multiple client sessions (session data saved locally) and identified by phone number
4. All Endpoints are secured by a global API key saved in the .env file
5. On server start, all clients are restored

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/yourusername/whatsapp-web.js-rest-api.git
cd whatsapp-web.js-rest-api
```

2. Install the dependencies:

```bash
npm install
```

3. Copy the `env.example` file to `.env` and update the required environment variables:

```bash
cp env.example .env
```

4. Run the application in development mode:

```bash
npm run dev
```

5. Access the API at `http://localhost:3000`

## Deployment

1. Build the Docker image:

```bash
docker build -t whatsapp-web-api .
```

2. Run the Docker container:

```bash
docker run -d -p 3000:3000 --name whatsapp-web-api --env-file .env whatsapp-web-api
```

3. Access the API at `http://your_server_ip:3000`

## Testing

Run the test suite with the following command:

```bash
npm test
```

## Documentation

API documentation can be found in the `swagger.yml` file. Import this file into [Swagger Editor](https://editor.swagger.io/) or any other OpenAPI-compatible tool to view and interact with the API documentation.

## Contributing

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## License

This project is licensed under the MIT License - see the [LICENSE.md](./LICENSE.md) file for details.