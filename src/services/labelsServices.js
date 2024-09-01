const labelsQueue = require('./queues/labelsQueue');

sendLabelsToQueue = async (sessionId, labels) => {
  const [ customerUuid, numberUuid ] = sessionId.split('_-_')
  try {
    await labelsQueue.connect()

    for (const label of labels) {
      const message = {
        customerUuid,
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