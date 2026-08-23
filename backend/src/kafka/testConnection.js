require("dotenv").config();

const kafka = require("../config/kafka");

async function testConnection() {
  const admin = kafka.admin();

  try {
    await admin.connect();

    console.log("Successfully connected to Redpanda Cloud!");

    const topics = await admin.listTopics();

    console.log("Topics:", topics);

    await admin.disconnect();
  } catch (error) {
    console.error("Kafka connection failed:");
    console.error(error.message);
  }
}

testConnection();