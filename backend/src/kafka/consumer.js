const kafka = require('../config/kafka');
const FIFOService = require('../services/fifoService');
const connectToDB = require('../config/database');
require('dotenv').config();

const consumer = kafka.consumer({
  groupId: process.env.KAFKA_GROUP_ID || 'fifo-inventory-group'
});

const startConsumer = async () => {
  try {
    await connectToDB();

    await consumer.connect();
    console.log('Kafka Consumer connected successfully to broker.');

    const topic = process.env.KAFKA_TOPIC || 'inventory-events';
    await consumer.subscribe({ topic, fromBeginning: false });
    console.log(`Subscribed to topic: "${topic}"`);

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const payloadString = message.value.toString();

        try {
          const event = JSON.parse(payloadString);
          const { product_id, event_type, quantity, unit_price, timestamp } = event;

          if (!product_id || !event_type || isNaN(parseFloat(quantity))) {
            console.warn(`[Kafka Consumer] Skipping message due to missing properties: ${payloadString}`);
            return;
          }

          if (event_type === 'purchase') {
            if (isNaN(parseFloat(unit_price))) {
              console.warn(`[Kafka Consumer] Skipping purchase event due to missing unit_price: ${payloadString}`);
              return;
            }
            await FIFOService.recordPurchase({
              productId: product_id,
              quantity: parseFloat(quantity),
              unitCost: parseFloat(unit_price),
              purchasedAt: timestamp || new Date().toISOString()
            });
            console.log(`[Kafka Consumer] Successfully recorded purchase batch for ${product_id}`);
          } else if (event_type === 'sale') {
            const result = await FIFOService.recordSale({
              productId: product_id,
              quantity: parseFloat(quantity),
              soldAt: timestamp || new Date().toISOString()
            });
            console.log(`[Kafka Consumer] Successfully recorded sale for ${product_id}. Computed FIFO Cost: ₹${result.sale.total_cost}`);
          } else {
            console.warn(`[Kafka Consumer] Unknown event_type: ${event_type}`);
          }
        } catch (err) {
          console.error(`[Kafka Consumer] Error processing message:`, err.message);
        }
      }
    });
  } catch (error) {
    console.error('Kafka Consumer initialization failure:', error.message);
  }
};

// If file is executed directly from CLI: `node src/kafka/consumer.js`
if (require.main === module) {
  startConsumer();
}

module.exports = {
  startConsumer,
  consumer
};
