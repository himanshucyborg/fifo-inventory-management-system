const FIFOService = require('../services/fifoService');
const Batch = require('../models/batch');
const { publishEvent, isProducerConnected } = require('../kafka/producer');

exports.runSimulation = async (req, res) => {
  try {
    const productsList = ['PRD001', 'PRD002', 'PRD003', 'PRD004'];
    const simulationLogs = [];
    const transactionCount = Math.floor(Math.random() * 6) + 5;
    const useKafka = isProducerConnected();

    const overview = await Batch.getStockOverview();
    const stockTracker = {};
    for (const p of overview) {
      stockTracker[p.product_id] = p.current_quantity;
    }

    const usedQuantities = new Set();
    const getUniqueQty = (min, max) => {
      let qty;
      let attempts = 0;
      do {
        qty = Math.floor(Math.random() * (max - min + 1)) + min;
        attempts++;
      } while (usedQuantities.has(qty) && attempts < 100);
      usedQuantities.add(qty);
      return qty;
    };

    for (let i = 0; i < transactionCount; i++) {
      const productId = productsList[Math.floor(Math.random() * productsList.length)];
      const currentQty = stockTracker[productId] || 0;

      let eventType = Math.random() > 0.4 ? 'purchase' : 'sale';
      if (currentQty <= 0) {
        eventType = 'purchase';
      }

      if (eventType === 'purchase') {
        const qty = getUniqueQty(10, 60); 
        const unitCost = parseFloat((Math.random() * 100 + 50).toFixed(2)); 
        const timestamp = new Date().toISOString();

        const event = {
          product_id: productId,
          event_type: 'purchase',
          quantity: qty,
          unit_price: unitCost,
          timestamp
        };

        if (useKafka) {
          await publishEvent(event);
        } else {
          await FIFOService.recordPurchase({
            productId,
            quantity: qty,
            unitCost,
            purchasedAt: timestamp
          });
        }

        stockTracker[productId] = (stockTracker[productId] || 0) + qty;

        simulationLogs.push({ index: i + 1, ...event });
      } else {
        const maxSale = Math.min(currentQty, 30);
        const qty = getUniqueQty(1, Math.max(1, maxSale));
        const timestamp = new Date().toISOString();

        const event = {
          product_id: productId,
          event_type: 'sale',
          quantity: qty,
          timestamp
        };

        if (useKafka) {
          await publishEvent(event);
        } else {
          await FIFOService.recordSale({
            productId,
            quantity: qty,
            soldAt: timestamp
          });
        }

        stockTracker[productId] = (stockTracker[productId] || 0) - qty;

        simulationLogs.push({ index: i + 1, ...event });
      }
    }

    res.status(200).json({
      message: `Simulation completed: ${transactionCount} events ${useKafka ? 'published to Kafka topic "inventory-events"' : 'processed directly (Kafka unavailable)'}.`,
      mode: useKafka ? 'kafka' : 'direct',
      transactions: simulationLogs
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
