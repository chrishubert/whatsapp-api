const QueueAdapter = require('../adapters/queueAdapter');
const { splitSessionId } = require('../utils');

const exchangeName = 'whatsapp-exchange'
const queueName = 'whatsapp-labels-queue'
const deadQueueName = queueName + '.dead_letter'
const bindOptions = {
  durable: true,
  arguments: {
    "x-dead-letter-exchange": deadQueueName,
    "x-dead-letter-routing-key": deadQueueName
  }
}

module.exports = async (sessionId, labels) => {
  const { customerUuid, numberUuid } = splitSessionId(sessionId)
  const queue = new QueueAdapter(
    exchangeName,
    queueName,
    deadQueueName
  )

  try {
    await queue.connect(bindOptions)

    for (const label of labels) {
      const eventType = 'label.create';
      const message = {
        customerUuid,
        numberUuid,
        label
      };

      queue.sendMessage(eventType, message);
      console.log(`Published label: ${label.name}`);
    }

    await queue.disconnect()
  } catch (error) {
    console.error('Error publishing labels to queue:', error);
  }
}