const { Op } = require('sequelize');
const connectToDB = require('../config/database');
const sequelize = connectToDB.sequelize;
const Product = require('../models/product');
const InventoryBatch = require('../models/batch');
const Sale = require('../models/sale');

class FIFOService {
  
  static async recordPurchase({ productId, quantity, unitCost, purchasedAt }) {
    if (!productId || typeof productId !== 'string' || productId.trim().length === 0) {
      throw new Error('Product ID is required and must be a non-empty string');
    }

    const qty = parseFloat(quantity);
    const cost = parseFloat(unitCost);
    const date = purchasedAt ? new Date(purchasedAt) : new Date();

    if (isNaN(date.getTime())) {
      throw new Error('Invalid timestamp format');
    }

    if (isNaN(qty) || qty <= 0) {
      throw new Error('Quantity must be a positive number');
    }

    if (isNaN(cost) || cost < 0) {
      throw new Error('Unit cost must be a non-negative number');
    }

    return await sequelize.transaction(async (t) => {

      const [product] = await Product.findOrCreate({
        where: { product_id: productId },
        defaults: { name: `Product ${productId}` },
        transaction: t
      });

      const timeBufferMs = 10000;
      const startTime = new Date(date.getTime() - timeBufferMs);
      const endTime = new Date(date.getTime() + timeBufferMs);

      const existingBatch = await InventoryBatch.findOne({
        where: {
          product_id: productId,
          original_quantity: qty,
          unit_cost: cost,
          purchased_at: { [Op.between]: [startTime, endTime] }
        },
        transaction: t
      });

      if (existingBatch) {
        return { success: true, batch: existingBatch.toJSON(), isDuplicate: true };
      }

      const batch = await InventoryBatch.create({
        product_id: productId,
        original_quantity: qty,
        remaining_quantity: qty,
        unit_cost: cost,
        purchased_at: date
      }, { transaction: t });

      return { success: true, batch: batch.toJSON() };
    });
  }

  static async recordSale({ productId, quantity, soldAt }) {
    if (!productId || typeof productId !== 'string' || productId.trim().length === 0) {
      throw new Error('Product ID is required and must be a non-empty string');
    }

    const qtyToSell = parseFloat(quantity);
    const date = soldAt ? new Date(soldAt) : new Date();

    if (isNaN(date.getTime())) {
      throw new Error('Invalid timestamp format');
    }

    if (isNaN(qtyToSell) || qtyToSell <= 0) {
      throw new Error('Sale quantity must be a positive number');
    }

    return await sequelize.transaction(async (t) => {

      const product = await Product.findOne({
        where: { product_id: productId },
        transaction: t
      });

      if (!product) {
        throw new Error(`Product ${productId} does not exist`);
      }

      const batches = await InventoryBatch.findAll({
        where: {
          product_id: productId,
          remaining_quantity: { [Op.gt]: 0 }
        },
        order: [
          ['purchased_at', 'ASC'],
          ['id', 'ASC']
        ],
        transaction: t,
        lock: t.LOCK.UPDATE
      });

      const totalAvailable = batches.reduce((sum, b) => sum + parseFloat(b.remaining_quantity), 0);
      if (totalAvailable < qtyToSell) {
        throw new Error(`Insufficient stock for product ${productId}. Available: ${totalAvailable}, Requested: ${qtyToSell}`);
      }

      let remainingToDeduct = qtyToSell;
      let totalCost = 0;
      const consumedBatchesDetails = [];

      for (const batch of batches) {
        if (remainingToDeduct <= 0) break;

        const remainingInBatch = parseFloat(batch.remaining_quantity);
        const batchUnitCost = parseFloat(batch.unit_cost);

        if (remainingInBatch <= remainingToDeduct) {
          remainingToDeduct -= remainingInBatch;
          totalCost += remainingInBatch * batchUnitCost;

          batch.remaining_quantity = 0;
          await batch.save({ transaction: t });

          consumedBatchesDetails.push({
            batchId: batch.id,
            quantityConsumed: remainingInBatch,
            unitCost: batchUnitCost
          });
        } else {

          const newRemaining = remainingInBatch - remainingToDeduct;
          totalCost += remainingToDeduct * batchUnitCost;

          batch.remaining_quantity = newRemaining;
          await batch.save({ transaction: t });

          consumedBatchesDetails.push({
            batchId: batch.id,
            quantityConsumed: remainingToDeduct,
            unitCost: batchUnitCost
          });
          remainingToDeduct = 0;
        }
      }

      const sale = await Sale.create({
        product_id: productId,
        quantity: qtyToSell,
        total_cost: totalCost,
        sold_at: date
      }, { transaction: t });

      return {
        success: true,
        sale: sale.toJSON(),
        consumedBatches: consumedBatchesDetails
      };
    });
  }
}

module.exports = FIFOService;
