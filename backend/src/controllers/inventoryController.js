const Batch = require('../models/batch');

exports.getInventoryOverview = async (req, res) => {
  try {
    const overview = await Batch.getStockOverview();
    res.status(200).json(overview);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProductBatches = async (req, res) => {
  try {
    const { productId } = req.params;
    const batches = await Batch.findAll({
      where: { product_id: productId },
      order: [['purchased_at', 'DESC']]
    });
    res.status(200).json(batches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
