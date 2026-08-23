import { useState } from 'react';
import { Play, RefreshCw } from 'lucide-react';
import { runSimulation } from '../services/api';

export default function SimulatorControl({ token, onSimulationComplete }) {
  const [simulating, setSimulating] = useState(false);
  const [lastMessage, setLastMessage] = useState('');

  const handleSimulate = async () => {
    setSimulating(true);
    setLastMessage('');
    try {
      const data = await runSimulation(token);
      setLastMessage(data.message || 'Simulation executed successfully!');
      if (onSimulationComplete) {
        onSimulationComplete();
      }
    } catch (err) {
      setLastMessage(`Error: ${err.message}`);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="glass-card" style={{ padding: '1.25rem 1.5rem', marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.1rem' }}>
            <span>Kafka Event Simulator Control</span>
          </div>
        </div>

        <button onClick={handleSimulate} disabled={simulating} className="btn btn-primary">
          {simulating ? (
            <>
              <RefreshCw size={18} className="animate-spin" />
              Simulating Batch...
            </>
          ) : (
            <>
              <Play size={18} />
              Simulate 5–10 Events
            </>
          )}
        </button>
      </div>

      {lastMessage && (
        <div
          style={{
            marginTop: '1rem',
            padding: '0.6rem 1rem',
            borderRadius: '8px',
            fontSize: '0.85rem',
            background: lastMessage.startsWith('Error') ? 'rgba(225, 29, 72, 0.1)' : 'rgba(4, 120, 87, 0.1)',
            color: lastMessage.startsWith('Error') ? '#be123c' : '#047857',
            border: `1px solid ${lastMessage.startsWith('Error') ? 'rgba(225, 29, 72, 0.2)' : 'rgba(4, 120, 87, 0.2)'}`
          }}
        >
          {lastMessage}
        </div>
      )}
    </div>
  );
}
