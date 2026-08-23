import React from 'react';
import { Package } from 'lucide-react';

export default function StockOverview({ items }) {
  if (!items || items.length === 0) {
    return (
      <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        No product inventory batches recorded yet. Run simulation to populate.
      </div>
    );
  }

  return (
    <div>
      <div className="section-header">
        <h2 className="section-title">Product Stock Overview</h2>
      </div>

      <div className="grid-cards">
        {items.map((item) => (
          <div key={item.product_id} className="glass-card stock-card">
            <div className="card-header">
              <span className="product-tag">{item.product_id}</span>
              <Package size={20} style={{ color: 'var(--accent-purple)' }} />
            </div>

            <h3 className="card-title">{item.product_name || `Product ${item.product_id}`}</h3>

            <div className="metric-group">
              <div className="metric-label">Current Stock Quantity</div>
              <div className="metric-value" style={{ color: 'var(--accent-emerald)' }}>
                {item.current_quantity} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>units</span>
              </div>
            </div>

            <div className="metric-sub">
              <div>
                <span className="metric-label">Total Cost</span>
                <div style={{ fontWeight: 600, color: 'var(--accent-blue)' }}>
                  ₹{Number(item.total_inventory_cost).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div>
                <span className="metric-label">Avg Unit Cost</span>
                <div style={{ fontWeight: 600, color: 'var(--accent-amber)' }}>
                  ₹{Number(item.average_cost_per_unit).toFixed(2)}
                </div>
              </div>
            </div>
            
          </div>
        ))}
      </div>
    </div>
  );
}
