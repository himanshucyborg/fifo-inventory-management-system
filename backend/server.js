require('dotenv').config();
const app = require('./src/app');
const connectToDB = require('./src/config/database');
const { startConsumer } = require('./src/kafka/consumer');
const { connectProducer } = require('./src/kafka/producer');

const PORT = process.env.PORT || 3000;

connectToDB().then(async () => {
  
  startConsumer().catch(err => {
    console.warn('Kafka Consumer failed to start (non-fatal):', err.message);
  });
  connectProducer().catch(err => {
    console.warn('Kafka Producer failed to connect (non-fatal):', err.message);
    console.warn('Simulate button will fall back to direct DB processing.');
  });

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

}).catch(err => {
  console.error('Failed to initialize server:', err.message);
});
