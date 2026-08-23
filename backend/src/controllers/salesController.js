const Sale = require('../models/sale');

exports.getLedger = async (req, res) => {
  try {
    const ledger = await Sale.getTransactionLedger();
    res.status(200).json(ledger);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSaleById = async (req, res) => {
  try {
    const saleId = parseInt(req.params.id, 10);
    if (isNaN(saleId) || saleId <= 0) {
      return res.status(400).json({ error: 'Invalid sale ID. Must be a positive integer.' });
    }
    const sale = await Sale.findById(saleId);
    
    if (!sale) {
      return res.status(404).json({ error: 'Sale record not found' });
    }

    res.status(200).json(sale);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
