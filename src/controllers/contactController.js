// controllers/contactController.js

const { sessions } = require('../sessions');
const { sendErrorResponse } = require('../utils');

/**
 * Recupera informações de um contato do WhatsApp por ID.
 */
const getClassInfo = async (req, res) => {
  try {
    const { contactId } = req.body;
    const client = sessions.get(req.params.sessionId);
    if (!client) {
      return sendErrorResponse(res, 404, 'Session not Found');
    }
    const contact = await client.getContactById(contactId);
    if (!contact) {
      return sendErrorResponse(res, 404, 'Contact not Found');
    }
    res.json({ success: true, result: contact });
  } catch (error) {
    sendErrorResponse(res, 500, error.message);
  }
};

/**
 * Bloqueia um contato do WhatsApp por ID.
 */
const block = async (req, res) => {
  try {
    const { contactId } = req.body;
    const client = sessions.get(req.params.sessionId);
    if (!client) {
      return sendErrorResponse(res, 404, 'Session not Found');
    }
    const contact = await client.getContactById(contactId);
    if (!contact) {
      return sendErrorResponse(res, 404, 'Contact not Found');
    }
    const result = await contact.block();
    res.json({ success: true, result });
  } catch (error) {
    sendErrorResponse(res, 500, error.message);
  }
};

/**
 * Recupera o campo "About" de um contato.
 */
const getAbout = async (req, res) => {
  try {
    const { contactId } = req.body;
    const client = sessions.get(req.params.sessionId);
    if (!client) {
      return sendErrorResponse(res, 404, 'Session not Found');
    }
    const contact = await client.getContactById(contactId);
    if (!contact) {
      return sendErrorResponse(res, 404, 'Contact not Found');
    }
    const result = await contact.getAbout();
    res.json({ success: true, result });
  } catch (error) {
    sendErrorResponse(res, 500, error.message);
  }
};

/**
 * Recupera o chat de um contato.
 */
const getChat = async (req, res) => {
  try {
    const { contactId } = req.body;
    const client = sessions.get(req.params.sessionId);
    if (!client) {
      return sendErrorResponse(res, 404, 'Session not Found');
    }
    const contact = await client.getContactById(contactId);
    if (!contact) {
      return sendErrorResponse(res, 404, 'Contact not Found');
    }
    const result = await contact.getChat();
    res.json({ success: true, result });
  } catch (error) {
    sendErrorResponse(res, 500, error.message);
  }
};

/**
 * Recupera o número formatado de um contato.
 */
const getFormattedNumber = async (req, res) => {
  try {
    const { contactId } = req.body;
    const client = sessions.get(req.params.sessionId);
    if (!client) {
      return sendErrorResponse(res, 404, 'Session not Found');
    }
    const contact = await client.getContactById(contactId);
    if (!contact) {
      return sendErrorResponse(res, 404, 'Contact not Found');
    }
    const result = await contact.getFormattedNumber();
    res.json({ success: true, result });
  } catch (error) {
    sendErrorResponse(res, 500, error.message);
  }
};

/**
 * Recupera o código de país de um contato.
 */
const getCountryCode = async (req, res) => {
  try {
    const { contactId } = req.body;
    const client = sessions.get(req.params.sessionId);
    if (!client) {
      return sendErrorResponse(res, 404, 'Session not Found');
    }
    const contact = await client.getContactById(contactId);
    if (!contact) {
      return sendErrorResponse(res, 404, 'Contact not Found');
    }
    const result = await contact.getCountryCode();
    res.json({ success: true, result });
  } catch (error) {
    sendErrorResponse(res, 500, error.message);
  }
};

/**
 * Recupera a URL da foto de perfil de um contato.
 */
const getProfilePicUrl = async (req, res) => {
  try {
    const { contactId } = req.body;
    const client = sessions.get(req.params.sessionId);
    if (!client) {
      return sendErrorResponse(res, 404, 'Session not Found');
    }
    const contact = await client.getContactById(contactId);
    if (!contact) {
      return sendErrorResponse(res, 404, 'Contact not Found');
    }
    // catch para caso não haja foto
    const result = await contact.getProfilePicUrl().catch(() => null);
    res.json({ success: true, result });
  } catch (error) {
    sendErrorResponse(res, 500, error.message);
  }
};

/**
 * Desbloqueia um contato do WhatsApp por ID.
 */
const unblock = async (req, res) => {
  try {
    const { contactId } = req.body;
    const client = sessions.get(req.params.sessionId);
    if (!client) {
      return sendErrorResponse(res, 404, 'Session not Found');
    }
    const contact = await client.getContactById(contactId);
    if (!contact) {
      return sendErrorResponse(res, 404, 'Contact not Found');
    }
    const result = await contact.unblock();
    res.json({ success: true, result });
  } catch (error) {
    sendErrorResponse(res, 500, error.message);
  }
};

/**
 * Recupera todos os grupos ativos dos quais a sessão ainda faz parte,
 * trazendo informações detalhadas e regras de participação e envio.
 *
 * Usa apenas UMA chamada a client.getChats() e filtra diretamente
 * pelos metadados disponíveis no array de Chat, sem iterar chamando
 * getChatById em cada um.
 */
const getActiveGroups = async (req, res) => {
  try {
    const client = sessions.get(req.params.sessionId);
    if (!client) {
      return sendErrorResponse(res, 404, 'Session not Found');
    }

    // 1 única chamada a todos os chats
    const chats = await client.getChats();
    const myJid = client.info.wid._serialized;

    // para cada chat de grupo, pega os metadados já carregados
    const groups = await Promise.all(
      chats
        .filter(chat => chat.isGroup && chat.groupMetadata)  // só grupos com metadados
        .map(async chat => {
          const meta = chat.groupMetadata;
          const participants = meta.participants || [];

          // só retorna se eu ainda estiver no grupo
          const me = participants.find(p => p.id._serialized === myJid);
          if (!me) return null;

          // foto do grupo (usa client, não chat)
          let picture = null;
          try {
            picture = await client.getProfilePicUrl(meta.id._serialized);
          } catch {}

          return {
            id:               meta.id._serialized,
            name:             chat.name || meta.subject,
            subject:          meta.subject,
            owner:            meta.owner?._serialized,
            createdAt:        meta.createdAt,
            description:      meta.description,
            picture,
            // regras
            announcementOnly: Boolean(chat.isAnnounceGroup), // só admin envia
            restrictInfo:     Boolean(chat.isRestricted),    // só admin altera
            participantCount: participants.length,
            participants: participants.map(p => ({
              id:           p.id._serialized,
              isAdmin:      p.isAdmin,
              isSuperAdmin: p.isSuperAdmin
            })),
            myRole: {
              isAdmin:      me.isAdmin,
              isSuperAdmin: me.isSuperAdmin
            },
            // posso enviar?
            canIMessage: !chat.isAnnounceGroup || me.isAdmin || me.isSuperAdmin
          };
        })
    );

    // filtra eventuais nulos (casos de saída do grupo)
    res.json({ success: true, result: groups.filter(g => g) });
  } catch (error) {
    sendErrorResponse(res, 500, error.message);
  }
};

module.exports = {
  getClassInfo,
  block,
  getAbout,
  getChat,
  getFormattedNumber,
  getCountryCode,
  getProfilePicUrl,
  unblock,
  getActiveGroups
};
