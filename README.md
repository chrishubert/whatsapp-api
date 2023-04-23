# WhatsAppWeb.js REST API Wrapper

REST API wrapper for the [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js) library, providing an easy-to-use interface to interact with the WhatsApp Web platform. It is designed to be scalable, secure, and easy to integrate with other applications.

This project is far from perfect: star it, create issues, features or pull requests ❣️

**NOTE**: I can't guarantee you will not be blocked by using this method, although it has worked for me. WhatsApp does not allow bots or unofficial clients on their platform, so this shouldn't be considered totally safe.

## Table of Contents

[1. Quick Start with Docker](#quick-start-with-docker)

[2. Features](#features)

[3. Run Locally](#run-locally)

[4. Testing](#testing)

[5. Documentation](#documentation)

[6. Deploy to Production](#deploy-to-production)

[7. Contributing](#contributing)

[8. License](#license)

[9. Star History](#star-history)

## Quick Start with Docker

[![dockeri.co](https://dockerico.blankenship.io/image/chrishubert/whatsapp-web-api)](https://hub.docker.com/r/chrishubert/whatsapp-web-api)

1. Clone the repository:

```bash
git clone https://github.com/chrishubert/whatsapp-web-api.git
cd whatsapp-web-api
```

3. Run the Docker Compose:

```bash
docker-compose pull && docker-compose up
```
4. Visit http://localhost:3000/api/startSession/ABCD

5. Scan the QR on your console using WhatsApp mobile app -> Linked Device -> Link a Device (it may take time to setup the session)

6. Visit http://localhost:3000/api/getContacts/ABCD

7. EXTRA: Look at all the callbacks data in `./session/message_log.txt`

![Quick Start](./assets/basic_start.gif)

## Features

1. API and Callbacks (Done ✅ & Work in Progress ❌)

| API actions |   |
| ------------------------------- | - |
| Send Image Message              | ✅ |
| Send Video Message              | ✅ |
| Send Audio Message              | ✅ |
| Send Document Message           | ✅ |
| Send File URL                   | ✅ |
| Send Button Message             | ❌ |
| Send Contact Message            | ❌ |
| Send List Message               | ❌ |
| Set Status                      | ✅ |
| Send Button With Media          | ❌ |
| Is On Whatsapp?                 | ✅ |
| Download Profile Pic            | ✅ |
| User Status                     | ❌ |
| Block/Unblock User              | ❌ |
| Update Profile Picture          | ❌ |
| Create Group                    | ✅ |
| Leave Group                     | ❌ |
| All Groups                      | ❌ |
| Invite User                     | ❌ |
| Make Admin                      | ❌ |
| Demote Admin                    | ❌ |
| Group Invite Code               | ❌ |
| Update Group Participants       | ❌ |
| Update Group Setting            | ❌ |
| Update Group Subject            | ❌ |
| Update Group Description        | ❌ |

| API authentication |   |
| -------------------------------------- | - |
| API initiate session                   | ✅ |
| API terminate session                  | ✅ |
| API terminate inactive sessions        | ✅ |
| API terminate all sessions             | ✅ |
| API healthcheck                        | ✅ |
| API callback example                   | ✅ |

| Callbacks (Webhook URL defined in .env file) |   |
| ----------------------------------------------------- | - |
| Callback QR code                                      | ✅ |
| Callback new message                                  | ✅ |
| Callback status change                                | ✅ |
| Callback message media attachment                     | ✅ |

3. Handle multiple client sessions (session data saved locally), identified by unique id

4. All endpoints may be secured by a global API key

5. On server start, all existing sessions are restored

## Run Locally

1. Clone the repository:

```bash
git clone https://github.com/chrishubert/whatsapp-web-api.git
cd whatsapp-web-api
```

2. Install the dependencies:

```bash
npm install
```

3. Copy the `.env.example` file to `.env` and update the required environment variables:

```bash
cp .env.example .env
```

4. Run the application in development mode:

```bash
npm run start
```

5. Access the API at `http://localhost:3000`

## Testing

Run the test suite with the following command:

```bash
npm run test
```

## Documentation

API documentation can be found in the [`swagger.yml`](https://raw.githubusercontent.com/chrishubert/whatsapp-web-api/master/swagger.yml) file. See this file directly into [Swagger Editor](https://editor.swagger.io/?url=https://raw.githubusercontent.com/chrishubert/whatsapp-web-api/master/swagger.yml) or any other OpenAPI-compatible tool to view and interact with the API documentation.

## Deploy to Production

- Load the docker image in docker-compose, or your Kubernetes environment
- Disable the `ENABLE_LOCAL_CALLBACK_EXAMPLE` environment variable
- Run periodically the `api/terminateInactiveSessions` endpoint to prevent useless sessions to take up space and ressources

## Contributing

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Disclaimer

This project is not affiliated, associated, authorized, endorsed by, or in any way officially connected with WhatsApp or any of its subsidiaries or its affiliates. The official WhatsApp website can be found at https://whatsapp.com. "WhatsApp" as well as related names, marks, emblems and images are registered trademarks of their respective owners.

## License

This project is licensed under the MIT License - see the [LICENSE.md](./LICENSE.md) file for details.

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=chrishubert/whatsapp-web-api&type=Date)](https://star-history.com/#chrishubert/whatsapp-web-api&Date)
