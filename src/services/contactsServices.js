const QueueAdapter = require('../adapters/queueAdapter');
const { splitSessionId } = require('../utils');

const exchangeName = 'whatsapp-exchange'
const queueName = 'whatsapp-contacts-queue'
const deadQueueName = queueName + '.dead_letter'
const bindOptions = {
  durable: true,
  arguments: {
    "x-dead-letter-exchange": deadQueueName,
    "x-dead-letter-routing-key": deadQueueName
  }
}

module.exports = async (sessionId, contacts) => {
  const { customerUuid, numberUuid } = splitSessionId(sessionId)
  const queue = new QueueAdapter(
    exchangeName,
    queueName,
    deadQueueName
  )

  try {
    await queue.connect(bindOptions)

    for (const contact of contacts.slice(0, 10)) {
      if (contact.id.server !== 'lid' && contact.isUser && contact.isWAContact) {
        const eventType = 'contact.create';
        const message = {
          customerUuid,
          numberUuid,
          contact
        };
        
        queue.sendMessage(eventType, message);
        console.log(`Published contact: ${contact.name}`);
      }
    }

    await queue.disconnect()
  } catch (error) {
    console.error('Error publishing contacts to queue:', error);
  }
}