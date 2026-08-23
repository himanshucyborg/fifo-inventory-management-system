import React from 'react';
import { LogOut } from 'lucide-react';

export default function Navbar({ onLogout, username }) {
  return (
    <header className="navbar">
      <div className="nav-brand">
        <span>FIFO Inventory System</span>
      </div>

      <div className="user-badge">
        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          User: <strong>{username}</strong>
        </span>

        <button onClick={onLogout} className="btn btn-danger">
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </header>
  );
}
