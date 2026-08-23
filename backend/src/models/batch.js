const { DataTypes } = require('sequelize');
const connectToDB = require('../config/database');
const sequelize = connectToDB.sequelize;
const Product = require('./product');

const InventoryBatch = sequelize.define('InventoryBatch', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  product_id: {
    type: DataTypes.STRING(50),
    allowNull: false,
    references: {
      model: Product,
      key: 'product_id'
    }
  },
  original_quantity: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  remaining_quantity: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  unit_cost: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  purchased_at: {
    type: DataTypes.DATE,
    allowNull: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'inventory_batches',
  timestamps: false
});

InventoryBatch.belongsTo(Product, { foreignKey: 'product_id', targetKey: 'product_id', as: 'Product' });
Product.hasMany(InventoryBatch, { foreignKey: 'product_id', sourceKey: 'product_id', as: 'Batches' });


InventoryBatch.getStockOverview = async function() {
  const result = await sequelize.query(
    `SELECT 
      p.product_id,
      p.name as product_name,
      COALESCE(SUM(b.remaining_quantity), 0) as current_quantity,
      COALESCE(SUM(b.remaining_quantity * b.unit_cost), 0) as total_inventory_cost,
      CASE 
        WHEN COALESCE(SUM(b.remaining_quantity), 0) > 0 
        THEN COALESCE(SUM(b.remaining_quantity * b.unit_cost), 0) / SUM(b.remaining_quantity)
        ELSE 0 
      END as average_cost_per_unit
     FROM products p
     LEFT JOIN inventory_batches b ON p.product_id = b.product_id AND b.remaining_quantity > 0
     GROUP BY p.product_id, p.name
     ORDER BY p.product_id ASC`,
    { type: sequelize.QueryTypes.SELECT }
  );
  return result.map(row => ({
    product_id: row.product_id,
    product_name: row.product_name,
    current_quantity: parseFloat(row.current_quantity),
    total_inventory_cost: parseFloat(row.total_inventory_cost),
    average_cost_per_unit: parseFloat(row.average_cost_per_unit)
  }));
};

module.exports = InventoryBatch;
