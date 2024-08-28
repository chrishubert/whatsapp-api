const AmqpClient = require('../../../server/clients/amqpClient')

const amqpClient = new AmqpClient();
const date = new Date();
const isoString = date.toISOString();
const exchangeName = 'whatsapp-exchange'
const queueName = 'whatsapp-labels-queue'
const deadLetterQueueName = queueName + '.dead_letter'
const optionsQueue = {
  durable: true,
  arguments: {
    "x-dead-letter-exchange": deadLetterQueueName,
    "x-dead-letter-routing-key": deadLetterQueueName
  }
}

const connect = async () => {
  amqpClient.setExchangeName(exchangeName)
  await amqpClient.connect();
  await setupExchangeAndQueue()
}

const setupExchangeAndQueue = async () => {
  await amqpClient.exchange('direct', { durable: true })
  await amqpClient.bindQueue(queueName, optionsQueue)
}

const createPayload = (message) => {
  return {
    eventType: "label.create",
    data: message,
    metadata: {
      originalQueue: queueName,
      dlq: deadLetterQueueName,
      timestamp: isoString
    }
  }
}

const sendMessage = async (message) => {
  try {
    const payload = createPayload(message)
    await amqpClient.publish(queueName, payload);
  } catch (error) {
    console.error('Error publishing labels to queue:', error);
  }
}

const disconnect = async () => {
  await amqpClient.disconnect();
}

module.exports = { connect, sendMessage, disconnect }
