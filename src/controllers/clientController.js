const { MessageMedia, Location, Buttons, List, Poll } = require('whatsapp-web.js')
const { sessions } = require('../sessions')
const { sendErrorResponse } = require('../utils')

/**
 * Send a message to a chat using the WhatsApp API
 *
 * @async
 * @function sendMessage
 * @param {Object} req - The request object containing the request parameters
 * @param {Object} req.body - The request body containing the chatId, content, contentType and options
 * @param {string} req.body.chatId - The chat id where the message will be sent
 * @param {string|Object} req.body.content - The message content to be sent, can be a string or an object containing the MessageMedia data
 * @param {string} req.body.contentType - The type of the message content, must be one of the following: 'string', 'MessageMedia', 'MessageMediaFromURL', 'Location', 'Buttons', or 'List'
 * @param {Object} req.body.options - Additional options to be passed to the WhatsApp API
 * @param {string} req.params.sessionId - The id of the WhatsApp session to be used
 * @param {Object} res - The response object
 * @returns {Object} - The response object containing a success flag and the sent message data
 * @throws {Error} - If there is an error while sending the message
 */
const sendMessage = async (req, res) => {
  /*
    #swagger.requestBody = {
      required: true,
      '@content': {
        "application/json": {
          schema: {
            type: 'object',
            properties: {
              chatId: {
                type: 'string',
                description: 'The Chat id which contains the message (Group or Individual)',
              },
              contentType: {
                type: 'string',
                description: 'The type of message content, must be one of the following: string, MessageMedia, MessageMediaFromURL, Location, Buttons, or List',
              },
              content: {
                type: 'object',
                description: 'The content of the message, can be a string or an object',
              },
              options: {
                type: 'object',
                description: 'The message send options',
              }
            }
          },
          examples: {
            string: { value: { chatId: '6281288888888@c.us', contentType: 'string', content: 'Hello World!' } },
            MessageMedia: { value: { chatId: '6281288888888@c.us', contentType: 'MessageMedia', content: { mimetype: 'image/jpeg', data: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', filename: 'image.jpg' } } },
            MessageMediaFromURL: { value: { chatId: '6281288888888@c.us', contentType: 'MessageMediaFromURL', content: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Example' } },
            Location: { value: { chatId: '6281288888888@c.us', contentType: 'Location', content: { latitude: -6.2, longitude: 106.8, description: 'Jakarta' } } },
            Buttons: { value: { chatId: '6281288888888@c.us', contentType: 'Buttons', content: { body: 'Hello World!', buttons: [{ body: 'button 1' }], title: 'Hello World!', footer: 'Hello World!' } } },
            List: {
              value: { chatId: '6281288888888@c.us', contentType: 'List', content: { body: 'Hello World!', buttonText: 'Hello World!', sections: [{ title: 'sectionTitle', rows: [{ id: 'customId', title: 'ListItem2', description: 'desc' }, { title: 'ListItem2' }] }], title: 'Hello World!', footer: 'Hello World!' } }
            },
            Contact: {
              value: { chatId: '6281288888888@c.us', contentType: 'Contact', content: { contactId: '6281288888889@c.us' } }
            },
            Poll: {
              value: { chatId: '6281288888888@c.us', contentType: 'Poll', content: { pollName: 'Cats or Dogs?', pollOptions: ['Cats', 'Dogs'], options: { allowMultipleAnswers: true } } }
            },
          }
        }
      }
    }
  */

  try {
    const { chatId, content, contentType, options } = req.body
    const client = sessions.get(req.params.sessionId)

    let messageOut
    switch (contentType) {
      case 'string':
        if (options?.media) {
          const media = options.media
          media.filename = null
          media.filesize = null
          options.media = new MessageMedia(media.mimetype, media.data, media.filename, media.filesize)
        }
        messageOut = await client.sendMessage(chatId, content, options)
        break
      case 'MessageMediaFromURL': {
        const messageMediaFromURL = await MessageMedia.fromUrl(content, { unsafeMime: true })
        messageOut = await client.sendMessage(chatId, messageMediaFromURL, options)
        break
      }
      case 'MessageMedia': {
        const messageMedia = new MessageMedia(content.mimetype, content.data, content.filename, content.filesize)
        messageOut = await client.sendMessage(chatId, messageMedia, options)
        break
      }
      case 'Location': {
        const location = new Location(content.latitude, content.longitude, content.description)
        messageOut = await client.sendMessage(chatId, location, options)
        break
      }
      case 'Buttons': {
        const buttons = new Buttons(content.body, content.buttons, content.title, content.footer)
        messageOut = await client.sendMessage(chatId, buttons, options)
        break
      }
      case 'List': {
        const list = new List(content.body, content.buttonText, content.sections, content.title, content.footer)
        messageOut = await client.sendMessage(chatId, list, options)
        break
      }
      case 'Contact': {
        const contactId = content.contactId.endsWith('@c.us') ? content.contactId : `${content.contactId}@c.us`
        const contact = await client.getContactById(contactId)
        messageOut = await client.sendMessage(chatId, contact, options)
        break
      }
      case 'Poll': {
        const poll = new Poll(content.pollName, content.pollOptions, content.options)
        messageOut = await client.sendMessage(chatId, poll, options)
        break
      }
      default:
        return sendErrorResponse(res, 404, 'contentType invalid, must be string, MessageMedia, MessageMediaFromURL, Location, Buttons, List, Contact or Poll')
    }

    res.json({ success: true, message: messageOut })
  } catch (error) {
    console.log(error)
    sendErrorResponse(res, 500, error.message)
  }
}

/**
 * Get session information for a given sessionId
 *
 * @async
 * @function getClientInfo
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {string} req.params.sessionId - The sessionId for which the session info is requested
 * @returns {Object} - Response object with session info
 * @throws Will throw an error if session info cannot be retrieved
 */
const getClassInfo = async (req, res) => {
  try {
    const client = sessions.get(req.params.sessionId)
    const sessionInfo = await client.info
    res.json({ success: true, sessionInfo })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
}

/**
 * Check if a user is registered on WhatsApp
 *
 * @async
 * @function isRegisteredUser
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {string} req.params.sessionId - The sessionId in which the user is registered
 * @param {string} req.body.id - The id of the user to check
 * @returns {Object} - Response object with a boolean indicating whether the user is registered
 * @throws Will throw an error if user registration cannot be checked
 */
const isRegisteredUser = async (req, res) => {
  /*
    #swagger.requestBody = {
      required: true,
      schema: {
        type: 'object',
        properties: {
          number: {
            type: 'string',
            description: 'The number or ID (\"@c.us\" will be automatically appended if not specified)',
            example: '6281288888888'
          },
        }
      },
    }
  */
  try {
    const { number } = req.body
    const client = sessions.get(req.params.sessionId)
    const result = await client.isRegisteredUser(number)
    res.json({ success: true, result })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
}

/**
 * Retrieves the registered WhatsApp ID for a number
 *
 * @async
 * @function getNumberId
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {string} req.params.sessionId - The sessionId in which the user is registered
 * @param {string} req.body.id - The id of the user to check
 * @returns {Object} - Response object with a boolean indicating whether the user is registered
 * @throws Will throw an error if user registration cannot be checked
 */
const getNumberId = async (req, res) => {
  /*
    #swagger.requestBody = {
      required: true,
      schema: {
        type: 'object',
        properties: {
          number: {
            type: 'string',
            description: 'The number or ID (\"@c.us\" will be automatically appended if not specified)',
            example: '6281288888888'
          },
        }
      },
    }
  */
  try {
    const { number } = req.body
    const client = sessions.get(req.params.sessionId)
    const result = await client.getNumberId(number)
    res.json({ success: true, result })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
}

/**
 * Create a group with the given name and participants
 *
 * @async
 * @function createGroup
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {string} req.params.sessionId - The sessionId in which to create the group
 * @param {string} req.body.name - The name of the group to create
 * @param {Array} req.body.participants - Array of user ids to add to the group
 * @returns {Object} - Response object with information about the created group
 * @throws Will throw an error if group cannot be created
 */
const createGroup = async (req, res) => {
  try {
    const { name, participants } = req.body
    const client = sessions.get(req.params.sessionId)
    const response = await client.createGroup(name, participants)
    res.json({ success: true, response })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
}

/**
 * Set the status of the user in a given session
 *
 * @async
 * @function setStatus
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {string} req.params.sessionId - The sessionId in which to set the status
 * @param {string} req.body.status - The status to set
 * @returns {Object} - Response object indicating success
 * @throws Will throw an error if status cannot be set
 */
const setStatus = async (req, res) => {
  /*
    #swagger.requestBody = {
      required: true,
      schema: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            description: 'New status message',
            example: 'I\'m running WhatsApp Web Api'
          },
        }
      },
    }
  */
  try {
    const { status } = req.body
    const client = sessions.get(req.params.sessionId)
    await client.setStatus(status)
    res.json({ success: true })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
}

/**
 * Retrieves the contacts of the current session.
 * @async
 * @function
 * @param {Object} req - The request object.
 * @param {string} req.params.sessionId - The session ID associated with the client.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A Promise that resolves with the retrieved contacts or rejects with an error.
 */
const getContacts = async (req, res) => {
  try {
    const client = sessions.get(req.params.sessionId)
    const contacts = await client.getContacts()
    res.json({ success: true, contacts })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
}

/**
 * Retrieve all chats for the given session ID.
 *
 * @function
 * @async
 *
 * @param {Object} req - The request object.
 * @param {string} req.params.sessionId - The session ID.
 * @param {Object} res - The response object.
 *
 * @returns {Promise<void>} A Promise that resolves when the operation is complete.
 *
 * @throws {Error} If the operation fails, an error is thrown.
 */
const getChats = async (req, res) => {
  try {
    const client = sessions.get(req.params.sessionId)
    const chats = await client.getChats()
    res.json({ success: true, chats })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
}

/**
 * Returns the profile picture URL for a given contact ID.
 *
 * @async
 * @function
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {string} req.params.sessionId - The ID of the current session.
 * @param {string} req.body.contactId - The ID of the contact to get the profile picture for.
 * @returns {Promise<void>} - A Promise that resolves with the profile picture URL.
 * @throws {Error} - If there is an error retrieving the profile picture URL.
 */
const getProfilePictureUrl = async (req, res) => {
  /*
    #swagger.requestBody = {
      required: true,
      schema: {
        type: 'object',
        properties: {
          contactId: {
            type: 'string',
            description: 'The contact ID\'s of profile',
            example: '6281288888888@c.us'
          },
        }
      },
    }
  */
  try {
    const { contactId } = req.body
    const client = sessions.get(req.params.sessionId)
    const result = await client.getProfilePicUrl(contactId)
    res.json({ success: true, result })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
}

/**
 * Accepts an invite.
 *
 * @async
 * @function
 * @param {Object} req - The HTTP request object.
 * @param {Object} req.body - The request body.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.sessionId - The ID of the session.
 * @param {Object} res - The HTTP response object.
 * @returns {Object} The response object.
 * @throws {Error} If there is an error while accepting the invite.
 */
const acceptInvite = async (req, res) => {
  /*
    #swagger.requestBody = {
      required: true,
      schema: {
        type: 'object',
        properties: {
          inviteCode: {
            type: 'string',
            description: 'Invitation code',
            example: ''
          },
        }
      },
    }
  */
  try {
    const { inviteCode } = req.body
    const client = sessions.get(req.params.sessionId)
    const acceptInvite = await client.acceptInvite(inviteCode)
    res.json({ success: true, acceptInvite })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
}

/**
 * Retrieves the version of WhatsApp Web currently being run.
 *
 * @async
 * @function getWWebVersion
 * @param {Object} req - The HTTP request object.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.sessionId - The ID of the session.
 * @param {Object} res - The HTTP response object.
 * @returns {Object} The response object.
 * @throws {Error} If there is an error while accepting the invite.
 */
const getWWebVersion = async (req, res) => {
  try {
    const client = sessions.get(req.params.sessionId)
    const result = await client.getWWebVersion()
    res.json({ success: true, result })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
}

/**
 * Archives a chat.
 *
 * @async
 * @function
 * @param {Object} req - The HTTP request object.
 * @param {Object} req.body - The request body.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.sessionId - The ID of the session.
 * @param {Object} res - The HTTP response object.
 * @returns {Object} The response object.
 * @throws {Error} If there is an error while archiving the chat.
 */
const archiveChat = async (req, res) => {
  /*
    #swagger.requestBody = {
      required: true,
      schema: {
        type: 'object',
        properties: {
          chatId: {
            type: 'string',
            description: 'ID of the chat',
            example: ''
          },
        }
      },
    }
  */
  try {
    const { chatId } = req.body
    const client = sessions.get(req.params.sessionId)
    const result = await client.archiveChat(chatId)
    res.json({ success: true, result })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
}

/**
 * Get the list of blocked contacts for the user's client.
 *
 * @async
 * @function getBlockedContacts
 * @param {Object} req - The request object.
 * @param {string} req.params.sessionId - The session ID to use for the client.
 * @param {Object} res - The response object.
 * @returns {Promise<Object>} - A promise that resolves to an object with a success property and an array of blocked contacts.
 * @throws {Error} - Throws an error if the operation fails.
 */
const getBlockedContacts = async (req, res) => {
  try {
    const client = sessions.get(req.params.sessionId)
    const blockedContacts = await client.getBlockedContacts()
    res.json({ success: true, blockedContacts })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
}

/**
 * Get the chat with the given ID.
 *
 * @async
 * @function getChatById
 * @param {Object} req - The request object.
 * @param {string} req.params.sessionId - The session ID to use for the client.
 * @param {string} req.body.chatId - The ID of the chat to get.
 * @param {Object} res - The response object.
 * @returns {Promise<Object>} - A promise that resolves to an object with a success property and the chat object.
 * @throws {Error} - Throws an error if the operation fails.
 */
const getChatById = async (req, res) => {
  /*
    #swagger.requestBody = {
      required: true,
      schema: {
        type: 'object',
        properties: {
          chatId: {
            type: 'string',
            description: 'ID of the chat',
            example: ''
          },
        }
      },
    }
  */
  try {
    const { chatId } = req.body
    const client = sessions.get(req.params.sessionId)
    const chat = await client.getChatById(chatId)
    res.json({ success: true, chat })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
}

/**
 * Get the labels for the chat with the given ID.
 *
 * @async
 * @function getChatLabels
 * @param {Object} req - The request object.
 * @param {string} req.params.sessionId - The session ID to use for the client.
 * @param {string} req.body.chatId - The ID of the chat to get labels for.
 * @param {Object} res - The response object.
 * @returns {Promise<Object>} - A promise that resolves to an object with a success property and an array of labels for the chat.
 * @throws {Error} - Throws an error if the operation fails.
 */
const getChatLabels = async (req, res) => {
  /*
    #swagger.requestBody = {
      required: true,
      schema: {
        type: 'object',
        properties: {
          chatId: {
            type: 'string',
            description: 'ID of the chat',
            example: ''
          },
        }
      },
    }
  */
  try {
    const { chatId } = req.body
    const client = sessions.get(req.params.sessionId)
    const chatLabels = await client.getChatLabels(chatId)
    res.json({ success: true, chatLabels })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
}

/**
 * Get the chats with the given label ID.
 *
 * @async
 * @function getChatsByLabelId
 * @param {Object} req - The request object.
 * @param {string} req.params.sessionId - The session ID to use for the client.
 * @param {string} req.body.labelId - The ID of the label to get chats for.
 * @param {Object} res - The response object.
 * @returns {Promise<Object>} - A promise that resolves to an object with a success property and an array of chats with the given label.
 * @throws {Error} - Throws an error if the operation fails.
 */
const getChatsByLabelId = async (req, res) => {
  /*
    #swagger.requestBody = {
      required: true,
      schema: {
        type: 'object',
        properties: {
          labelId: {
            type: 'string',
            description: 'ID of the label',
            example: ''
          },
        }
      },
    }
  */
  try {
    const { labelId } = req.body
    const client = sessions.get(req.params.sessionId)
    const chats = await client.getChatsByLabelId(labelId)
    res.json({ success: true, chats })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
}

/**
 * Retrieves the common groups between the client's session and the specified contact.
 * @async
 * @function getCommonGroups
 * @param {Object} req - The request object.
 * @param {string} req.params.sessionId - The session ID of the client.
 * @param {string} req.body.contactId - The ID of the contact to retrieve the common groups with.
 * @param {Object} res - The response object.
 * @returns {Object} - An object containing a success flag and the retrieved groups.
 * @throws {Error} - If an error occurs while retrieving the common groups.
 */
const getCommonGroups = async (req, res) => {
  /*
    #swagger.requestBody = {
      required: true,
      schema: {
        type: 'object',
        properties: {
          contactId: {
            type: 'string',
            description: 'The whatsapp user\'s ID (_serialized format)',
            example: ''
          },
        }
      },
    }
  */
  try {
    const { contactId } = req.body
    const client = sessions.get(req.params.sessionId)
    const groups = await client.getCommonGroups(contactId)
    res.json({ success: true, groups })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
}

/**
 * Retrieves the contact with the specified ID.
 * @async
 * @function getContactById
 * @param {Object} req - The request object.
 * @param {string} req.params.sessionId - The session ID of the client.
 * @param {string} req.body.contactId - The ID of the contact to retrieve.
 * @param {Object} res - The response object.
 * @returns {Object} - An object containing a success flag and the retrieved contact.
 * @throws {Error} - If an error occurs while retrieving the contact.
 */
const getContactById = async (req, res) => {
  /*
    #swagger.requestBody = {
      required: true,
      schema: {
        type: 'object',
        properties: {
          contactId: {
            type: 'string',
            description: 'The whatsapp user\'s ID',
            example: ''
          },
        }
      },
    }
  */
  try {
    const { contactId } = req.body
    const client = sessions.get(req.params.sessionId)
    const contact = await client.getContactById(contactId)
    res.json({ success: true, contact })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
}

/**
 * Retrieves the invite information for the specified invite code.
 * @async
 * @function getInviteInfo
 * @param {Object} req - The request object.
 * @param {string} req.params.sessionId - The session ID of the client.
 * @param {string} req.body.inviteCode - The invite code to retrieve information for.
 * @param {Object} res - The response object.
 * @returns {Object} - An object containing a success flag and the retrieved invite information.
 * @throws {Error} - If an error occurs while retrieving the invite information.
 */
const getInviteInfo = async (req, res) => {
  /*
    #swagger.requestBody = {
      required: true,
      schema: {
        type: 'object',
        properties: {
          inviteCode: {
            type: 'string',
            description: 'Invitation code',
            example: ''
          },
        }
      },
    }
  */
  try {
    const { inviteCode } = req.body
    const client = sessions.get(req.params.sessionId)
    const inviteInfo = await client.getInviteInfo(inviteCode)
    res.json({ success: true, inviteInfo })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
}

/**
 * Retrieves the label with the given ID for a particular session.
 * @async
 * @function
 * @param {Object} req - The request object.
 * @param {string} req.params.sessionId - The ID of the session to retrieve the label for.
 * @param {Object} req.body - The request body object.
 * @param {string} req.body.labelId - The ID of the label to retrieve.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 * @throws {Error} If there is an error retrieving the label.
 */
const getLabelById = async (req, res) => {
  /*
    #swagger.requestBody = {
      required: true,
      schema: {
        type: 'object',
        properties: {
          labelId: {
            type: 'string',
            description: 'ID of the label',
            example: ''
          },
        }
      },
    }
  */
  try {
    const { labelId } = req.body
    const client = sessions.get(req.params.sessionId)
    const label = await client.getLabelById(labelId)
    res.json({ success: true, label })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
}

/**
 * Retrieves all labels for a particular session.
 * @async
 * @function
 * @param {Object} req - The request object.
 * @param {string} req.params.sessionId - The ID of the session to retrieve the labels for.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 * @throws {Error} If there is an error retrieving the labels.
 */
const getLabels = async (req, res) => {
  try {
    const client = sessions.get(req.params.sessionId)
    const labels = await client.getLabels()
    res.json({ success: true, labels })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
}

/**
 * Adds or removes labels to/from chats.
 * @async
 * @function
 * @param {Object} req - the request object
 * @param {Object} res - the response object
 * @return {Promise} a Promise that resolves to the JSON response with success status and labels
 * @throws {Error} if an error occurs
 */
const addOrRemoveLabels = async (req, res) => {
  /*
  #swagger.requestBody = {
    required: true,
    schema: {
      type: 'object',
      properties: {
        labelIds: {
          type: 'array',
          description: 'Array of label IDs',
          example: []
        },
        chatIds: {
          type: 'array',
          description: 'Array of chat IDs',
          example: []
        },
      }
    },
  }
*/
  try {
    const { labelIds, chatIds } = req.body
    const client = sessions.get(req.params.sessionId)
    const labels = await client.addOrRemoveLabels(labelIds, chatIds)
    res.json({ success: true, labels })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
}

/**
 * Retrieves the state for a particular session.
 * @async
 * @function
 * @param {Object} req - The request object.
 * @param {string} req.params.sessionId - The ID of the session to retrieve the state for.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 * @throws {Error} If there is an error retrieving the state.
 */
const getState = async (req, res) => {
  try {
    const client = sessions.get(req.params.sessionId)
    const state = await client.getState()
    res.json({ success: true, state })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
}

/**
 * Marks a chat as unread.
 *
 * @async
 * @function markChatUnread
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {string} req.params.sessionId - The session ID.
 * @param {string} req.body.chatId - The ID of the chat to mark as unread.
 * @returns {Promise<void>} - A Promise that resolves when the chat is marked as unread.
 * @throws {Error} - If an error occurs while marking the chat as unread.
 */
const markChatUnread = async (req, res) => {
  /*
    #swagger.requestBody = {
      required: true,
      schema: {
        type: 'object',
        properties: {
          chatId: {
            type: 'string',
            description: 'ID of the chat',
            example: ''
          },
        }
      },
    }
  */
  try {
    const { chatId } = req.body
    const client = sessions.get(req.params.sessionId)
    const mark = await client.markChatUnread(chatId)
    res.json({ success: true, mark })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
}

/**
 * Mutes a chat.
 *
 * @async
 * @function muteChat
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {string} req.params.sessionId - The session ID.
 * @param {string} req.body.chatId - The ID of the chat to mute.
 * @param {Date} [req.body.unmuteDate] - The date and time when the chat should be unmuted. If not provided, the chat will be muted indefinitely.
 * @returns {Promise<void>} - A Promise that resolves when the chat is muted.
 * @throws {Error} - If an error occurs while muting the chat.
 */
const muteChat = async (req, res) => {
  /*
    #swagger.requestBody = {
      required: true,
      schema: {
        type: 'object',
        properties: {
          chatId: {
            type: 'string',
            description: 'ID of the chat',
            example: ''
          },
          unmuteDate: {
            type: 'string',
            description: 'Date when the chat will be muted, leave as is to mute forever',
            example: ''
          },
        }
      },
    }
  */
  try {
    const { chatId, unmuteDate } = req.body
    const client = sessions.get(req.params.sessionId)
    let mute
    if (unmuteDate) {
      mute = await client.muteChat(chatId, new Date(unmuteDate))
    } else {
      mute = await client.muteChat(chatId, null)
    }
    res.json({ success: true, mute })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
}

/**
 * Pins a chat.
 *
 * @async
 * @function pinChat
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {string} req.params.sessionId - The session ID.
 * @param {string} req.body.chatId - The ID of the chat to pin.
 * @returns {Promise<void>} - A Promise that resolves when the chat is pinned.
 * @throws {Error} - If an error occurs while pinning the chat.
 */
const pinChat = async (req, res) => {
  /*
    #swagger.requestBody = {
      required: true,
      schema: {
        type: 'object',
        properties: {
          chatId: {
            type: 'string',
            description: 'ID of the chat',
            example: ''
          },
        }
      },
    }
  */
  try {
    const { chatId } = req.body
    const client = sessions.get(req.params.sessionId)
    const result = await client.pinChat(chatId)
    res.json({ success: true, result })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
}
/**
 * Search messages with the given query and options.
 * @async
 * @function searchMessages
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {string} req.params.sessionId - The session ID.
 * @param {Object} req.body - The request body.
 * @param {string} req.body.query - The search query.
 * @param {Object} [req.body.options] - The search options (optional).
 * @returns {Promise<void>} - A Promise that resolves with the search results.
 * @throws {Error} - If there's an error during the search.
 */
const searchMessages = async (req, res) => {
  /*
    #swagger.requestBody = {
      required: true,
      schema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search string',
            example: ''
          },
          options: {
            type: 'object',
            description: 'Search options',
            example: {}
          },
        }
      },
    }
  */
  try {
    const { query, options } = req.body
    const client = sessions.get(req.params.sessionId)
    let messages
    if (options) {
      messages = await client.searchMessages(query, options)
    } else {
      messages = await client.searchMessages(query)
    }
    res.json({ success: true, messages })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
}

/**
 * Send presence available to the XMPP server.
 * @async
 * @function sendPresenceAvailable
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {string} req.params.sessionId - The session ID.
 * @returns {Promise<void>} - A Promise that resolves with the presence status.
 * @throws {Error} - If there's an error during the presence sending.
 */
const sendPresenceAvailable = async (req, res) => {
  try {
    const client = sessions.get(req.params.sessionId)
    const presence = await client.sendPresenceAvailable()
    res.json({ success: true, presence })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
}

/**
 * Send presence unavailable to the XMPP server.
 * @async
 * @function sendPresenceUnavailable
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {string} req.params.sessionId - The session ID.
 * @returns {Promise<void>} - A Promise that resolves with the presence status.
 * @throws {Error} - If there's an error during the presence sending.
 */
const sendPresenceUnavailable = async (req, res) => {
  try {
    const client = sessions.get(req.params.sessionId)
    const presence = await client.sendPresenceUnavailable()
    res.json({ success: true, presence })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
}

/**
 * Send a 'seen' message status for a given chat ID.
 * @async
 * @function
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {string} req.body.chatId - The ID of the chat to set the seen status for.
 * @param {string} req.params.sessionId - The ID of the session for the user.
 * @returns {Object} Returns a JSON object with a success status and the result of the function.
 * @throws {Error} If there is an issue sending the seen status message, an error will be thrown.
 */
const sendSeen = async (req, res) => {
  /*
    #swagger.requestBody = {
      required: true,
      schema: {
        type: 'object',
        properties: {
          chatId: {
            type: 'string',
            description: 'ID of the chat',
            example: ''
          },
        }
      },
    }
  */
  try {
    const { chatId } = req.body
    const client = sessions.get(req.params.sessionId)
    const result = await client.sendSeen(chatId)
    res.json({ success: true, result })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
}

/**
 * Set the display name for the user's WhatsApp account.
 * @async
 * @function
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {string} req.body.displayName - The new display name to set for the user's WhatsApp account.
 * @param {string} req.params.sessionId - The ID of the session for the user.
 * @returns {Object} Returns a JSON object with a success status and the result of the function.
 * @throws {Error} If there is an issue setting the display name, an error will be thrown.
 */
const setDisplayName = async (req, res) => {
  /*
    #swagger.requestBody = {
      required: true,
      schema: {
        type: 'object',
        properties: {
          displayName: {
            type: 'string',
            description: 'New display name',
            example: ''
          },
        }
      },
    }
  */
  try {
    const { displayName } = req.body
    const client = sessions.get(req.params.sessionId)
    const result = await client.setDisplayName(displayName)
    res.json({ success: true, result })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
}

/**
 * Unarchive a chat for the user's WhatsApp account.
 * @async
 * @function
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {string} req.body.chatId - The ID of the chat to unarchive.
 * @param {string} req.params.sessionId - The ID of the session for the user.
 * @returns {Object} Returns a JSON object with a success status and the result of the function.
 * @throws {Error} If there is an issue unarchiving the chat, an error will be thrown.
 */
const unarchiveChat = async (req, res) => {
  /*
    #swagger.requestBody = {
      required: true,
      schema: {
        type: 'object',
        properties: {
          chatId: {
            type: 'string',
            description: 'ID of the chat',
            example: ''
          },
        }
      },
    }
  */
  try {
    const { chatId } = req.body
    const client = sessions.get(req.params.sessionId)
    const result = await client.unarchiveChat(chatId)
    res.json({ success: true, result })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
}

/**
 * Unmutes the chat identified by chatId using the client associated with the given sessionId.
 *
 * @async
 * @function
 * @param {Object} req - The HTTP request object containing the chatId and sessionId.
 * @param {string} req.body.chatId - The unique identifier of the chat to unmute.
 * @param {string} req.params.sessionId - The unique identifier of the session associated with the client to use.
 * @param {Object} res - The HTTP response object.
 * @returns {Promise<Object>} - A Promise that resolves with a JSON object containing a success flag and the result of the operation.
 * @throws {Error} - If an error occurs during the operation, it is thrown and handled by the catch block.
 */
const unmuteChat = async (req, res) => {
  /*
    #swagger.requestBody = {
      required: true,
      schema: {
        type: 'object',
        properties: {
          chatId: {
            type: 'string',
            description: 'ID of the chat',
            example: ''
          },
        }
      },
    }
  */
  try {
    const { chatId } = req.body
    const client = sessions.get(req.params.sessionId)
    const result = await client.unmuteChat(chatId)
    res.json({ success: true, result })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
}

/**
 * Unpins the chat identified by chatId using the client associated with the given sessionId.
 *
 * @async
 * @function
 * @param {Object} req - The HTTP request object containing the chatId and sessionId.
 * @param {string} req.body.chatId - The unique identifier of the chat to unpin.
 * @param {string} req.params.sessionId - The unique identifier of the session associated with the client to use.
 * @param {Object} res - The HTTP response object.
 * @returns {Promise<Object>} - A Promise that resolves with a JSON object containing a success flag and the result of the operation.
 * @throws {Error} - If an error occurs during the operation, it is thrown and handled by the catch block.
 */
const unpinChat = async (req, res) => {
  /*
    #swagger.requestBody = {
      required: true,
      schema: {
        type: 'object',
        properties: {
          chatId: {
            type: 'string',
            description: 'ID of the chat',
            example: ''
          },
        }
      },
    }
  */
  try {
    const { chatId } = req.body
    const client = sessions.get(req.params.sessionId)
    const result = await client.unpinChat(chatId)
    res.json({ success: true, result })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
}

/**
 * update the profile Picture of the session user
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Object} req.body.media - The new profile picture to set for the user's WhatsApp account.
 * @param {string} req.params.sessionId - The ID of the session for the user.
 * @returns {Object} Returns a JSON object with a success status and the result of the function.
 * @throws {Error} If there is an issue setting the profile picture, an error will be thrown.
 */

const setProfilePicture = async (req, res) => {
  /*
    #swagger.requestBody = {
      required: true,
      schema: {
        type: "object",
        properties: {
          pictureMimetype: {
            type: "string",
            description: "The mimetype of the picture to set as the profile picture for the user WhatsApp account.",
            example: "image/png"
          },
          pictureData: {
            type: "string",
            description: "The base64 data of the picture to set as the profile picture for the user WhatsApp account.",
            example: "iVBORw0KGgoAAAANSUhEUgAAAAgAAAAIAQMAAAD+wSzIAAAABlBMVEX///+/v7+jQ3Y5AAAADklEQVQI12P4AIX8EAgALgAD/aNpbtEAAAAASUVORK5CYII="
          }
        }
      }
    }
  */

  try {
    const { pictureMimetype, pictureData } = req.body
    const client = sessions.get(req.params.sessionId)
    const media = new MessageMedia(pictureMimetype, pictureData)
    const result = await client.setProfilePicture(media)
    res.json({ success: true, result })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
}

module.exports = {
  getClassInfo,
  acceptInvite,
  archiveChat,
  createGroup,
  getBlockedContacts,
  getChatById,
  getChatLabels,
  getChats,
  getChatsByLabelId,
  getCommonGroups,
  getContactById,
  getContacts,
  getInviteInfo,
  getLabelById,
  getLabels,
  addOrRemoveLabels,
  isRegisteredUser,
  getNumberId,
  getProfilePictureUrl,
  getState,
  markChatUnread,
  muteChat,
  pinChat,
  searchMessages,
  sendMessage,
  sendPresenceAvailable,
  sendPresenceUnavailable,
  sendSeen,
  setDisplayName,
  setProfilePicture,
  setStatus,
  unarchiveChat,
  unmuteChat,
  unpinChat,
  getWWebVersion
}
