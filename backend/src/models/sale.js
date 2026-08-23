const { DataTypes } = require('sequelize');
const connectToDB = require('../config/database');
const sequelize = connectToDB.sequelize;
const Product = require('./product');

const Sale = sequelize.define('Sale', {
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
  quantity: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  total_cost: {
    type: DataTypes.DECIMAL(14, 2),
    allowNull: false
  },
  sold_at: {
    type: DataTypes.DATE,
    allowNull: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'sales',
  timestamps: false
});

Sale.belongsTo(Product, { foreignKey: 'product_id', targetKey: 'product_id', as: 'Product' });
Product.hasMany(Sale, { foreignKey: 'product_id', sourceKey: 'product_id', as: 'Sales' });

Sale.findById = async function(id) {
  const result = await Sale.findOne({
    where: { id },
    include: [{ model: Product, as: 'Product', attributes: ['name'] }]
  });
  if (!result) return null;
  const json = result.toJSON();
  json.product_name = json.Product ? json.Product.name : '';
  return json;
};

Sale.getTransactionLedger = async function({ page = 1, limit = 100 } = {}) {
  const offset = (page - 1) * limit;
  const result = await sequelize.query(
    `SELECT 
      'purchase' AS type,
      b.id,
      b.product_id,
      p.name as product_name,
      b.original_quantity AS quantity,
      b.unit_cost AS unit_price,
      (b.original_quantity * b.unit_cost) AS total_value,
      b.purchased_at AS timestamp
     FROM inventory_batches b
     JOIN products p ON b.product_id = p.product_id
     
     UNION ALL
     
     SELECT 
      'sale' AS type,
      s.id,
      s.product_id,
      p.name as product_name,
      s.quantity AS quantity,
      CASE WHEN s.quantity > 0 THEN s.total_cost / s.quantity ELSE 0 END AS unit_price,
      s.total_cost AS total_value,
      s.sold_at AS timestamp
     FROM sales s
     JOIN products p ON s.product_id = p.product_id
     
     ORDER BY timestamp DESC, id DESC
     LIMIT :limit OFFSET :offset`,
    {
      type: sequelize.QueryTypes.SELECT,
      replacements: { limit, offset }
    }
  );
  return result.map(row => ({
    type: row.type,
    id: parseInt(row.id),
    product_id: row.product_id,
    product_name: row.product_name,
    quantity: parseFloat(row.quantity),
    unit_price: parseFloat(row.unit_price),
    total_value: parseFloat(row.total_value),
    timestamp: row.timestamp
  }));
};

module.exports = Sale;
