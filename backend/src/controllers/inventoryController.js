const Batch = require('../models/batch');

exports.getInventoryOverview = async (req, res) => {
  try {
    const overview = await Batch.getStockOverview();
    res.status(200).json(overview);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
