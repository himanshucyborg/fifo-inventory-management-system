const { Sequelize } = require('sequelize');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: isProduction ? {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  } : {}
});

const connectToDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Successfully connected to PostgreSQL Database using Sequelize ORM.');
    await sequelize.sync();
    console.log('Database tables synchronized successfully.');
  } catch (error) {
    console.error('Database connection or synchronization failure:', error.message);
    process.exit(1);
  }
};

connectToDB.sequelize = sequelize;

module.exports = connectToDB;
