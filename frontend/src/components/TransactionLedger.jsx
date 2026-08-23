import React, { useState, useEffect } from 'react';
import { ArrowDownLeft, ArrowUpRight, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

export default function TransactionLedger({ transactions }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [transactions.length]);

  if (!transactions || transactions.length === 0) {
    return (
      <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        No transactions recorded in the ledger yet.
      </div>
    );
  }

  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = transactions.slice(indexOfFirstItem, indexOfLastItem);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      <div className="section-header">
        <h2 className="section-title">Transaction Ledger (FIFO Time-Series)</h2>
      </div>

      <div className="glass-card table-wrapper" style={{ display: 'flex', flexDirection: 'column' }}>
        <table className="custom-table" style={{ borderBottom: 'none' }}>
          <thead>
            <tr>
              <th>Type</th>
              <th>Product</th>
              <th>Quantity</th>
              <th>Unit / FIFO Cost</th>
              <th>Total Transaction Value</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          
          <tbody>
            {currentItems.map((tx, index) => {
              const isPurchase = tx.type === 'purchase';
              return (
                <tr key={`${tx.type}-${tx.id}-${index}`}>
                  <td>
                    <span className={`badge ${isPurchase ? 'badge-purchase' : 'badge-sale'}`}>
                      {isPurchase ? (
                        <>
                          <ArrowDownLeft size={14} style={{ marginRight: '4px' }} /> Purchase
                        </>
                      ) : (
                        <>
                          <ArrowUpRight size={14} style={{ marginRight: '4px' }} /> Sale
                        </>
                      )}
                    </span>
                  </td>
                  <td>
                    <strong>{tx.product_id}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{tx.product_name}</div>
                  </td>
                  <td>
                    <strong style={{ color: isPurchase ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
                      {isPurchase ? `+${tx.quantity}` : `-${tx.quantity}`}
                    </strong>
                  </td>
                  <td>
                    ₹{Number(tx.unit_price).toFixed(2)}
                    {!isPurchase && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--accent-purple)', marginLeft: '6px' }}>
                        (Calculated via FIFO)
                      </span>
                    )}
                  </td>
                  <td>
                    <strong>₹{Number(tx.total_value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Clock size={14} />
                      {new Date(tx.timestamp).toLocaleString()}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="pagination-container">
            <div className="pagination-info">
              Showing <strong>{indexOfFirstItem + 1}</strong> to <strong>{Math.min(indexOfLastItem, transactions.length)}</strong> of <strong>{transactions.length}</strong> transactions
            </div>
            <div className="pagination-controls">
              <button onClick={handlePrevPage} disabled={currentPage === 1} className="pagination-btn">
                <ChevronLeft size={16} />
                Prev
              </button>
              <span style={{ fontSize: '0.85rem', padding: '0 0.5rem', color: 'var(--text-muted)' }}>
                Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
              </span>
              <button onClick={handleNextPage} disabled={currentPage === totalPages} className="pagination-btn">
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
