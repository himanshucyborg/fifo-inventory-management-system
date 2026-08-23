const API_PREFIX = '/api';

export async function loginUser(username, password) {
  const response = await fetch(`${API_PREFIX}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Authentication failed');
  }
  return data;
}

export async function getInventoryOverview(token) {
  const response = await fetch(`${API_PREFIX}/inventory`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch inventory overview');
  }
  return data;
}

export async function getTransactionLedger(token) {
  const response = await fetch(`${API_PREFIX}/ledger`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch transaction ledger');
  }
  return data;
}

export async function runSimulation(token) {
  const response = await fetch(`${API_PREFIX}/simulate-event`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Simulation trigger failed');
  }
  return data;
}
