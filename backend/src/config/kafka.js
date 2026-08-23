const { Kafka } = require('kafkajs');
require('dotenv').config();

const brokers = process.env.KAFKA_BROKERS ? process.env.KAFKA_BROKERS.split(',') : ['localhost:9092'];
const clientId = process.env.KAFKA_CLIENT_ID || 'fifo-inventory';

const sasl = process.env.KAFKA_SASL_USERNAME && process.env.KAFKA_SASL_PASSWORD ? {
  username: process.env.KAFKA_SASL_USERNAME,
  password: process.env.KAFKA_SASL_PASSWORD,
  mechanism: process.env.KAFKA_SASL_MECHANISM || 'scram-sha-256'
} : null;

const ssl = sasl ? true : false;

const kafka = new Kafka({
  clientId,
  brokers,
  ssl,
  sasl,
  connectionTimeout: 10000,
  requestTimeout: 25000
});

module.exports = kafka;
