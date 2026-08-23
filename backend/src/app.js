const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const inventoryRoutes = require('./routes/inventory');
const salesRoutes = require('./routes/sales');
const simulatorRoutes = require('./routes/simulator');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("./public"));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api', salesRoutes); 
app.use('/api', simulatorRoutes); 

app.get('/', (req, res) => {
  res.json({ message: 'FIFO Inventory Management System API is running.' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Something went wrong on the server' });
});


module.exports = app;
