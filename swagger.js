const swaggerAutogen = require('swagger-autogen')({ openapi: '3.0.0', autoBody: false })

const outputFile = './swagger.json'
const endpointsFiles = ['./src/routes.js']

const doc = {
  info: {
    title: 'WEE API',
    description: '',
    version: '1.0.0',
    'x-logo': {
      url: 'https://remlic.co.za/Remlic.png',
      altText: 'WEE API Logo'
    }
  },
  servers: [
    {
      url: '',
      description: 'Production Server'
    },
    {
      url: 'http://localhost:3050',
      description: 'Local Development Server'
    }
  ],
  securityDefinitions: {
    apiKeyAuth: {
      type: 'apiKey',
      in: 'header',
      name: 'x-api-key',
      description: 'API key authentication'
    }
  },
  produces: ['application/json'],
  tags: [
    {
      name: 'Health',
      description: 'API health and status endpoints'
    },
    {
      name: 'Session',
      description: 'Handling multiple WhatsApp sessions, including creation, status checks, and termination'
    },
    {
      name: 'Client',
      description: 'WhatsApp client management operations including connection status, profile management, and client features'
    },
    {
      name: 'Chat',
      description: 'Operations for managing WhatsApp chats and conversations'
    },
    {
      name: 'Group',
      description: 'Group chat management including creation, participant management, and settings'
    },
    {
      name: 'Message',
      description: 'Message operations including sending, receiving, and management. Note: May fail if the message is too old (Only from the last 100 Messages of the given chat)'
    },
    {
      name: 'Contact',
      description: 'Contact management including retrieval and updates'
    }
  ],
  components: {
    schemas: {
      Error: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            description: 'Error message',
            example: 'An error occurred'
          },
          code: {
            type: 'string',
            description: 'Error code',
            example: 'ERR_INVALID_REQUEST'
          }
        }
      }
    },
    responses: {
      UnauthorizedError: {
        description: 'Authentication failed',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            },
            example: {
              message: 'API key is missing or invalid',
              code: 'ERR_UNAUTHORIZED'
            }
          }
        }
      }
    }
  },
  definitions: {
    StartSessionResponse: {
      success: true,
      message: 'Session initiated successfully'
    },
    StatusSessionResponse: {
      success: true,
      state: 'CONNECTED',
      message: 'session_connected'
    },
    RestartSessionResponse: {
      success: true,
      message: 'Restarted successfully'
    },
    TerminateSessionResponse: {
      success: true,
      message: 'Logged out successfully'
    },
    TerminateSessionsResponse: {
      success: true,
      message: 'Flush completed successfully'
    },
    ErrorResponse: {
      success: false,
      error: 'Some server error'
    },
    NotFoundResponse: {
      success: false,
      error: 'Some server error'
    },
    ForbiddenResponse: {
      success: false,
      error: 'Invalid API key'
    }
  },
  swaggerUIOptions: {
    docExpansion: 'none', // 'list', 'full', or 'none'
    defaultModelsExpandDepth: 0,
    defaultModelExpandDepth: 1,
    deepLinking: true,
    displayOperationId: false,
    displayRequestDuration: true,
    filter: true,
    showExtensions: false,
    showCommonExtensions: false,
    syntaxHighlight: {
      activate: true,
      theme: 'monokai'
    },
    tryItOutEnabled: true,
    validatorUrl: null
  },
  autoHeaders: true,
  autoQuery: true,
  autoBody: true
}

swaggerAutogen(outputFile, endpointsFiles, doc)
