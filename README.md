# WhatsApp Web.js REST API Wrapper

REST API wrapper for the [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js) library, providing an easy-to-use interface to interact with the WhatsApp Web platform. It is designed to be scalable, secure, and easy to integrate with other applications.

It came from my lack of knowlege with NodeJS and the need to create OTP authentication flow where I couldn't trust external services.

This project is far from perfect: star it, create issues, features or pull requests ❣️

**NOTE**: I can't guarantee you will not be blocked by using this method, although it has worked for me. WhatsApp does not allow bots or unofficial clients on their platform, so this shouldn't be considered totally safe.

## Table of Contents

[1. Features](#features)

[2. Quick Start with Docker](#quick-start-with-docker)

[3. Run Locally](#run-locally)

[4. Testing](#testing)

[5. Documentation](#documentation)

[6. Contributing](#contributing)

[7. License](#license)

[8. Star History](#star-history)

## Features

1. Available API endpoints
- API Initiate Session
- API Send Message
- API Validate if number is available on WhatsApp
- API Logout
- API Flush inactive sessions
- API HealthCheck
- API Callback example

2. Available Callbacks (Webhook URL defined in .env file)
- Callback QR Code
- Callback new message
- Callback status change

3. Handle multiple client sessions (session data saved locally), identified by phone number

4. All Endpoints are secured by a global API key saved in the .env file

5. On server start, all previous clients are restored

## Quick Start with Docker

1. Clone the repository:

```bash
git clone https://github.com/chrishubert/whatsapp-web-api.git
cd whatsapp-web-api
```

3. Run the Docker Compose:

```bash
docker-compose up
```

6. Scan the QR with your phone (it may take time to setup the session)

7. Enjoy!

![Quick Start](./assets/basic_start.gif)

## Run Locally

1. Clone the repository:

```bash
git clone https://github.com/chrishubert/whatsapp-web-api.git
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
npm run start
```

5. Access the API at `http://localhost:3000`

## Testing

Run the test suite with the following command:

```bash
npm test
```

## Documentation

API documentation can be found in the [`swagger.yml`](https://raw.githubusercontent.com/chrishubert/whatsapp-web-api/master/swagger.yml) file. Import this file into [Swagger Editor](https://editor.swagger.io/) or any other OpenAPI-compatible tool to view and interact with the API documentation.

## Contributing

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Disclaimer

This project is not affiliated, associated, authorized, endorsed by, or in any way officially connected with WhatsApp or any of its subsidiaries or its affiliates. The official WhatsApp website can be found at https://whatsapp.com. "WhatsApp" as well as related names, marks, emblems and images are registered trademarks of their respective owners.

## License

This project is licensed under the MIT License - see the [LICENSE.md](./LICENSE.md) file for details.

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=chrishubert/whatsapp-web-api&type=Date)](https://star-history.com/#chrishubert/whatsapp-web-api&Date)