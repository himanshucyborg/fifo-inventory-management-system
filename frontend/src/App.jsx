import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Login from './components/Login';
import StockOverview from './components/StockOverview';
import TransactionLedger from './components/TransactionLedger';
import SimulatorControl from './components/SimulatorControl';
import { getInventoryOverview, getTransactionLedger } from './services/api';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [username, setUsername] = useState(localStorage.getItem('username') || '');

  const [stockItems, setStockItems] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  
  const handleLoginSuccess = (newToken, user) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('username', user);
    setToken(newToken);
    setUsername(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setToken('');
    setUsername('');
  };

  
  const fetchData = useCallback(async () => {
    if (!token) return;
    try {
      const [inventoryData, ledgerData] = await Promise.all([
        getInventoryOverview(token),
        getTransactionLedger(token)
      ]);
      setStockItems(inventoryData);
      setTransactions(ledgerData);
      setError('');
    } catch (err) {
      if (err.message.includes('token') || err.message.includes('Access denied')) {
        handleLogout();
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      setLoading(true);
      fetchData();
    }
  }, [token, fetchData]);

  if (!token) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div>
      <Navbar username={username} onLogout={handleLogout} />

      <main className="app-container">
        {error && <div className="alert-error" style={{ marginBottom: '1.5rem' }}>{error}</div>}

        <SimulatorControl token={token} onSimulationComplete={fetchData} />

        {loading && stockItems.length === 0 ? (
          <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>
            Loading live inventory dashboard metrics...
          </div>
        ) : (
          <>
            <StockOverview items={stockItems} />
            <TransactionLedger transactions={transactions} />
          </>
        )}
      </main>
    </div>
  );
}
