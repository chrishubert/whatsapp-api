const labelsQueue = require('./queues/labelsQueue');

sendLabelsToQueue = async (clientUuid, labels) => {
  try {
    await labelsQueue.connect()

    for (const label of labels) {
      const message = {
        clientUuid,
        label
      };

      labelsQueue.sendMessage(message);
      console.log(`Published label: ${label.name}`);
    }

    await labelsQueue.disconnect()
  } catch (error) {
    console.error('Error publishing labels to queue:', error);
  }
}

module.exports = { sendLabelsToQueue }
