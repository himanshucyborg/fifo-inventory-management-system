const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');
const authMiddleware = require('../middleware/auth');

router.get('/ledger', authMiddleware, salesController.getLedger);
router.get('/sales/:id', authMiddleware, salesController.getSaleById);

module.exports = router;
