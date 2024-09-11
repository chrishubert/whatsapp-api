const amqplib = require('amqplib')
const { rabbitmqHost } = require("../config.js");

class AmqpClient {
  constructor(exchangeName) {
    this.channel = null;
    this.connection = null;
    this.exchangeName = exchangeName;
  }

  async connect() {
    if (!this.connection || !this.channel) {
      this.connection = await amqplib.connect(rabbitmqHost);
      this.channel = await this.connection.createChannel();
    }
  }

  async exchange(type, options = {}) {
    await this.channel.assertExchange(this.exchangeName, type, options);
  }

  async bindQueue(queueName, options = {}) {
    const { queue } = await this.channel.assertQueue(queueName, options);
    await this.channel.bindQueue(queue, this.exchangeName, queueName);
  }

  async publish(queueName, message, options = {}) {
    try {
      const messageBuffer = Buffer.from(JSON.stringify(message));
      this.channel.publish(this.exchangeName, queueName, messageBuffer, options);
    } catch (err) {
      console.error('Error publishing message:', err);
      throw err;
    }
  }

  async disconnect() {
    if (this.connection) {
      await this.channel.close();
      await this.connection.close();
      this.connection = null;
      this.channel = null;
    }
  }
}

module.exports = AmqpClient;
