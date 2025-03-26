/**
 * Swagger helper functions to improve API documentation organization
 */

/**
 * Returns a swagger documentation object for common parameters
 * @returns {Object} Swagger parameter object
 */
const getSessionIdParam = () => {
  return {
    name: 'sessionId',
    in: 'path',
    required: true,
    schema: {
      type: 'string'
    },
    description: 'Unique identifier for the session (alphanumeric and - allowed)',
    example: 'f8377d8d-a589-4242-9ba6-9486a04ef80c'
  }
}

/**
 * Returns common error responses for API endpoints
 * @returns {Object} Common error responses
 */
const getCommonResponses = () => {
  return {
    403: {
      description: 'Forbidden - Invalid API key',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/ForbiddenResponse'
          }
        }
      }
    },
    404: {
      description: 'Not Found - Session not found',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/NotFoundResponse'
          }
        }
      }
    },
    422: {
      description: 'Unprocessable Entity - Invalid input data',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/ErrorResponse'
          }
        }
      }
    },
    500: {
      description: 'Internal Server Error',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/ErrorResponse'
          }
        }
      }
    }
  }
}

/**
 * Add Swagger documentation to an endpoint
 * @param {string} tag - The tag for grouping in Swagger UI
 * @param {string} summary - Summary of the endpoint
 * @param {string} description - Detailed description
 * @param {Object} additionalOptions - Additional options for documentation
 * @returns {string} Swagger documentation comment
 */
const documentEndpoint = (tag, summary, description = '', additionalOptions = {}) => {
  const options = {
    tags: [tag],
    summary,
    description,
    ...additionalOptions
  }

  return `/* ${JSON.stringify({ swagger: options })} */`
}

module.exports = {
  getSessionIdParam,
  getCommonResponses,
  documentEndpoint
}
