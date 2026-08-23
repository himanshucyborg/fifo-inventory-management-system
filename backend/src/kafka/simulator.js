require('dotenv').config();
const { connectProducer, publishEvent, producer } = require('./producer');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runKafkaSimulator() {
  console.log(' Starting Kafka Event Stream Simulator...');

  try {
    await connectProducer();

    const products = ['PRD001', 'PRD002', 'PRD003', 'PRD004'];
    const eventCount = Math.floor(Math.random() * 6) + 5;
    const usedQuantities = new Set();

    const getUniqueQuantity = (min, max) => {
      let qty;
      let attempts = 0;
      do {
        qty = Math.floor(Math.random() * (max - min + 1)) + min;
        attempts++;
      } while (usedQuantities.has(qty) && attempts < 100);
      usedQuantities.add(qty);
      return qty;
    };

    const stockLevels = { PRD001: 50, PRD002: 40, PRD003: 30, PRD004: 25 };

    for (let i = 1; i <= eventCount; i++) {
      const productId = products[Math.floor(Math.random() * products.length)];
      const currentStock = stockLevels[productId] || 0;

      let eventType = Math.random() > 0.4 ? 'purchase' : 'sale';
      if (currentStock <= 5) {
        eventType = 'purchase';
      }

      let event;
      if (eventType === 'purchase') {
        const qty = getUniqueQuantity(15, 65);
        const unitCost = parseFloat((Math.random() * 80 + 40).toFixed(2));
        const timestamp = new Date().toISOString();

        event = {
          product_id: productId,
          event_type: 'purchase',
          quantity: qty,
          unit_price: unitCost,
          timestamp
        };

        stockLevels[productId] = (stockLevels[productId] || 0) + qty;
        console.log(`[Event ${i}/${eventCount}] PURCHASE -> Product: ${productId} | Qty: ${qty} | Price: ₹${unitCost}`);
      } else {
        const maxSale = Math.min(currentStock, 25);
        const qty = getUniqueQuantity(1, Math.max(1, maxSale));
        const timestamp = new Date().toISOString();

        event = {
          product_id: productId,
          event_type: 'sale',
          quantity: qty,
          timestamp
        };

        stockLevels[productId] = (stockLevels[productId] || 0) - qty;
        console.log(`[Event ${i}/${eventCount}] SALE  -> Product: ${productId} | Qty: ${qty}`);
      }

      await publishEvent(event);
      await sleep(1500);
    }

    console.log(' All simulated events published successfully to Kafka!');

    await producer.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('✖ Simulator Error:', error.message);
    process.exit(1);
  }
}

runKafkaSimulator();
