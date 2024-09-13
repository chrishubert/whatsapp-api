const AmqpClient = require('../../server/clients/amqpClient')

class QueueAdapter {
  constructor(
    exchangeName,
    queueName,
    deadQueueName
  ) {
    this.amqpClient = new AmqpClient(exchangeName)
    this.queueName = queueName,
    this.deadQueueName = deadQueueName
  }

  async connect(bindOptions) {    
    await this.amqpClient.connect();
    await this.amqpClient.exchange('direct', { durable: true })
    await this.amqpClient.bindQueue(this.queueName, bindOptions)
  }

  createPayload(eventType, message) {
    const date = new Date();
    const isoString = date.toISOString();

    return {
      eventType: eventType,
      data: message,
      sender: 'whatsapp-api',
      metadata: {
        originalQueue: this.queueName,
        deadQueue: this.deadQueueName,
        timestamp: isoString
      }
    }
  }

  async sendMessage(eventType, message) {
    try {
      const payload = this.createPayload(eventType, message)
      await this.amqpClient.publish(this.queueName, payload);
    } catch (error) {
      console.error('Error publishing labels to queue:', error);
    }
  }

  async disconnect() {
    await this.amqpClient.disconnect()
  }
}

module.exports = QueueAdapter
