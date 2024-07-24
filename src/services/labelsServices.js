const RabbitMQClient = require('../../server/clients/amqp.client')

const rabbitMQClient = new RabbitMQClient();
const exchange = 'whatsapp_labels'

sendLabelsToQueue = async (client, labels) => {
  try {
    await rabbitMQClient.connect();
    await rabbitMQClient.exchange(exchange);
    
    for (const label of labels) {
      const message = JSON.stringify(label);
      rabbitMQClient.publish(exchange, client, message);
      console.log(`Published label: ${label.name}`);
    }

    await rabbitMQClient.close();
  } catch (error) {
    console.error('Error publishing labels to RabbitMQ:', error);
  }
}

module.exports = { sendLabelsToQueue }
