import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAnalysisRecords } from '../../lib/db';
import Toast from '../../components/common/Toast';
import { User, Building, Mail, Shield, Moon, Bell, LogOut, Database, Calendar, Award } from 'lucide-react';

export default function ProfileTab() {
  const navigate = useNavigate();
  const { session, logout } = useAuth();

  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [savedRecords, setSavedRecords] = useState([]);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    getAnalysisRecords(session?.email)
      .then(records => setSavedRecords(records))
      .catch(err => console.error('Failed fetching saved records:', err));
  }, [session]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ position: 'relative', minHeight: 'calc(100vh - 134px)', padding: '24px 20px 90px', maxWidth: '900px', margin: '0 auto' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <span className="section-label">ACCOUNT CONTROL PANEL</span>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#F8FAFC', marginTop: '4px' }}>
          Profile & Settings
        </h1>
      </div>

      {/* User Information Glass Card */}
      <div
        className="glass-card"
        style={{
          padding: '28px',
          marginBottom: '28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          borderLeft: '4px solid #00D4AA'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #00D4AA 0%, #00B4D8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0A0E1A',
              fontWeight: 800,
              fontSize: '1.5rem',
              boxShadow: '0 0 24px rgba(0, 212, 170, 0.4)'
            }}
          >
            {session.firstName?.[0]}{session.lastName?.[0]}
          </div>

          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#F8FAFC' }}>
              {session.firstName} {session.lastName}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 10px', borderRadius: '999px', backgroundColor: 'rgba(0, 212, 170, 0.15)', color: '#00D4AA' }}>
                {session.role || 'Researcher'}
              </span>
              <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                Local SQLite Session
              </span>
            </div>
          </div>
        </div>

        <div style={{ height: '1px', backgroundColor: 'rgba(148, 163, 184, 0.15)', margin: '4px 0' }} />

        {/* Read-Only Info Fields */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '10px', backgroundColor: 'rgba(10, 14, 26, 0.6)' }}>
            <Mail size={18} color="#00D4AA" />
            <div>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>EMAIL</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#F8FAFC' }}>{session.email}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '10px', backgroundColor: 'rgba(10, 14, 26, 0.6)' }}>
            <Building size={18} color="#00B4D8" />
            <div>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>INSTITUTION</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#F8FAFC' }}>{session.institution}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Preferences Toggles */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '28px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#00D4AA', marginBottom: '16px' }}>
          SYSTEM PREFERENCES
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Dark Mode Enforced */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Moon size={20} color="#00B4D8" />
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#F8FAFC' }}>Dark Mode Enforced</div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Clinical high-contrast aesthetic (Always On)</div>
              </div>
            </div>
            <input type="checkbox" checked={true} disabled style={{ accentColor: '#00D4AA', width: '20px', height: '20px', cursor: 'not-allowed' }} />
          </div>

          <div style={{ height: '1px', backgroundColor: 'rgba(148, 163, 184, 0.15)' }} />

          {/* Analysis Reminders */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Bell size={20} color="#F472B6" />
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#F8FAFC' }}>Analysis Reminders</div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Receive daily notification prompts for pending samples</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={remindersEnabled}
              onChange={e => {
                setRemindersEnabled(e.target.checked);
                setToast({ message: `Reminders ${e.target.checked ? 'enabled' : 'disabled'}`, type: 'info' });
              }}
              style={{ accentColor: '#00D4AA', width: '20px', height: '20px', cursor: 'pointer' }}
            />
          </div>
        </div>
      </div>

      {/* Saved SQLite Analysis History */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Database size={20} color="#00D4AA" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#F8FAFC' }}>
              Saved Analysis Records ({savedRecords.length})
            </h3>
          </div>
          <span style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 700 }}>IndexedDB Synchronized</span>
        </div>

        {savedRecords.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.2)', textAlign: 'left', color: '#94A3B8' }}>
                  <th style={{ padding: '8px 12px' }}>ID</th>
                  <th style={{ padding: '8px 12px' }}>Density</th>
                  <th style={{ padding: '8px 12px' }}>Branches</th>
                  <th style={{ padding: '8px 12px' }}>Length</th>
                  <th style={{ padding: '8px 12px' }}>Connectivity</th>
                  <th style={{ padding: '8px 12px' }}>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {savedRecords.map(rec => (
                  <tr key={rec.id} style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)', color: '#F8FAFC' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 700, color: '#00D4AA' }}>#{rec.id}</td>
                    <td style={{ padding: '10px 12px' }}>{rec.vessel_density}%</td>
                    <td style={{ padding: '10px 12px' }}>{rec.branch_points} pts</td>
                    <td style={{ padding: '10px 12px' }}>{rec.total_length} px</td>
                    <td style={{ padding: '10px 12px' }}>{rec.connectivity}%</td>
                    <td style={{ padding: '10px 12px', color: '#94A3B8', fontSize: '0.75rem' }}>
                      {new Date(rec.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '20px', textAlign: 'center', color: '#94A3B8', fontSize: '0.85rem' }}>
            No saved SQLite analysis records yet. Process a microscopy sample in the Analyzer tab and click "Save Analysis to DB".
          </div>
        )}
      </div>

      {/* Logout & Erase Button */}
      <button
        onClick={handleLogout}
        style={{
          width: '100%',
          backgroundColor: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          color: '#EF4444',
          padding: '14px',
          borderRadius: '12px',
          fontSize: '0.95rem',
          fontWeight: 700,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.25)'}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.12)'}
      >
        <LogOut size={18} />
        <span>Log Out & Erase Active Session</span>
      </button>
    </div>
  );
}
