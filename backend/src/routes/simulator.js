const express = require('express');
const router = express.Router();
const simulatorController = require('../controllers/simulatorController');
const authMiddleware = require('../middleware/auth');

router.post('/simulate-event', authMiddleware, simulatorController.runSimulation);

module.exports = router;
