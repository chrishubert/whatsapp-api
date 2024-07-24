const amqplib = require('amqplib')
const { rabbitmq } = require("../config.js");

class RabbitMQClient {
  constructor() {    
    this.connection = null;
    this.channel = null;
  }

  async connect() {
    try {
      this.connection = await amqplib.connect(rabbitmq);
      this.channel = await this.connection.createChannel();
    } catch (err) {
      console.error('Error connecting to RabbitMQ:', err);
      throw err;
    }
  }

  async exchange(exchangeName) {
    try {
      await this.channel.assertExchange(exchangeName, 'direct', { durable: true });
    } catch (err) {
      console.error(`Error asserting exchange '${exchangeName}':`, err);
      throw err;
    }
  }

  publish(exchangeName, routingKey, message) {
    try {
      this.channel.publish(exchangeName, routingKey, Buffer.from(JSON.stringify(message)));
    } catch (err) {
      console.error(`Error publishing message to exchange '${exchangeName}' with routing key '${routingKey}':`, err);
      throw err;
    }
  }

  async close() {
    try {
      await this.channel.close();
      await this.connection.close();
    } catch (err) {
      console.error('Error closing RabbitMQ connection:', err);
      throw err;
    }
  }
}

module.exports = RabbitMQClient