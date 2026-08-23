const kafka = require('../config/kafka');
require('dotenv').config();

const producer = kafka.producer();
let isConnected = false;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const connectProducer = async () => {
  try {
    await producer.connect();
    isConnected = true;
    console.log('Kafka Producer connected successfully.');
  } catch (error) {
    isConnected = false;
    console.error('Kafka Producer connection failed:', error.message);
    throw error;
  }
};

const publishEvent = async (event) => {
  const topic = process.env.KAFKA_TOPIC || 'inventory-events';
  if (!isConnected) {
    await connectProducer();
  }

  await producer.send({
    topic,
    messages: [
      {
        key: event.product_id || 'DEFAULT_KEY',
        value: JSON.stringify(event)
      }
    ]
  });
  console.log(`[Kafka Producer] Published event (${event.event_type}) for ${event.product_id} to topic "${topic}"`);
};

const isProducerConnected = () => isConnected;
const runStandaloneSimulation = async () => {
  try {
    console.log('Starting Standalone Kafka Producer Simulation...');
    await connectProducer();

    const mockEvents = [
      { product_id: 'PRD001', event_type: 'purchase', quantity: 14, unit_price: 100.0, timestamp: new Date().toISOString() },
      { product_id: 'PRD001', event_type: 'purchase', quantity: 27, unit_price: 120.0, timestamp: new Date().toISOString() },
      { product_id: 'PRD002', event_type: 'purchase', quantity: 43, unit_price: 15.0, timestamp: new Date().toISOString() },
      { product_id: 'PRD001', event_type: 'sale', quantity: 31, timestamp: new Date().toISOString() },
      { product_id: 'PRD002', event_type: 'sale', quantity: 41, timestamp: new Date().toISOString() },
      { product_id: 'PRD001', event_type: 'purchase', quantity: 23, unit_price: 130.0, timestamp: new Date().toISOString() },
      { product_id: 'PRD001', event_type: 'sale', quantity: 21, timestamp: new Date().toISOString() }
    ];

    console.log(`Publishing ${mockEvents.length} transactions to Kafka topic...\n`);
    for (let i = 0; i < mockEvents.length; i++) {
      await publishEvent(mockEvents[i]);
      await sleep(1500);
    }

    console.log('\nAll events successfully sent.');
    await producer.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Simulation error:', err.message);
    process.exit(1);
  }
};

if (require.main === module) {
  runStandaloneSimulation();
}

module.exports = {
  connectProducer,
  publishEvent,
  isProducerConnected,
  producer
};
