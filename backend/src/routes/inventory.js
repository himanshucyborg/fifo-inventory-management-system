const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, inventoryController.getInventoryOverview);

module.exports = router;
