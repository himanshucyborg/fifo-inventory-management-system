import React, { useState, useEffect } from 'react';
import { Package, History, X } from 'lucide-react';
import { getProductBatches } from '../services/api';

export default function StockOverview({ items }) {
  const [selectedProductForHistory, setSelectedProductForHistory] = useState(null);
  const [batchHistory, setBatchHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (selectedProductForHistory) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedProductForHistory]);

  const openHistoryModal = async (productId) => {
    setSelectedProductForHistory(productId);
    setLoadingHistory(true);
    try {
      const token = localStorage.getItem('token');
      const data = await getProductBatches(productId, token);
      setBatchHistory(data);
    } catch (err) {
      console.error(err);
      setBatchHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const closeHistoryModal = () => {
    setSelectedProductForHistory(null);
    setBatchHistory([]);
  };

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
            
            <button 
              className="action-btn"
              style={{ width: '100%', marginTop: '1rem', background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', color: 'var(--text-primary)' }}
              onClick={() => openHistoryModal(item.product_id)}
            >
              <History size={14} style={{ marginRight: '6px' }} /> Batch History
            </button>
          </div>
        ))}
      </div>

      {selectedProductForHistory && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 1000
        }}>
          <div className="glass-card" style={{ width: '90%', maxWidth: '800px', display: 'flex', flexDirection: 'column', maxHeight: '80vh', padding: 0, overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', padding: '1.2rem 1.5rem', backgroundColor: 'var(--bg-glass)' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                Batch History: <span style={{ color: 'var(--accent-purple)' }}>{selectedProductForHistory}</span>
              </h3>
              <button onClick={closeHistoryModal} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={24} />
              </button>
            </div>

            <div style={{ padding: '0 1.5rem 1.5rem 1.5rem', overflowY: 'auto', flex: 1 }}>
              {loadingHistory ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading history...</div>
              ) : batchHistory.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No batches found.</div>
              ) : (
                <table className="custom-table" style={{ margin: 0, width: '100%' }}>
                  <thead style={{ position: 'sticky', top: 0, zIndex: 1, backgroundColor: 'var(--bg-glass)', backdropFilter: 'blur(10px)' }}>
                    <tr>
                      <th>Batch ID</th>
                      <th>Purchased At</th>
                      <th>Original Qty</th>
                      <th>Remaining Qty</th>
                      <th>Unit Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batchHistory.map((batch) => (
                      <tr key={batch.id}>
                        <td><strong>{batch.id}</strong></td>
                        <td>{new Date(batch.purchased_at).toLocaleString()}</td>
                        <td style={{ color: 'var(--accent-blue)' }}>{batch.original_quantity}</td>
                        <td style={{ color: batch.remaining_quantity > 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)', fontWeight: 'bold' }}>
                          {batch.remaining_quantity}
                        </td>
                        <td>₹{Number(batch.unit_cost).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
