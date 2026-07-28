import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getAnalysisRecords, deleteAnalysisRecord, exportDatabaseFile } from '../../lib/db';
import { generatePDFReport } from '../../lib/pdfGenerator';
import Toast from '../../components/common/Toast';
import { User, Building, Mail, Moon, Sun, Bell, LogOut, Database, Download, FileText, Trash2 } from 'lucide-react';

export default function ProfileTab() {
  const navigate = useNavigate();
  const { session, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();

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

  const handleExportDB = async () => {
    try {
      await exportDatabaseFile();
      setToast({ message: 'SQLite database exported (.sqlite download started)', type: 'success' });
    } catch (err) {
      console.error('DB Export Error:', err);
      setToast({ message: 'Failed to export SQLite database file.', type: 'error' });
    }
  };

  const handleDownloadRecordPDF = (rec) => {
    try {
      const metrics = {
        vesselDensity: rec.vessel_density,
        branchPoints: rec.branch_points,
        vesselSegments: rec.vessel_segments,
        totalLength: rec.total_length,
        avgWidth: rec.avg_width,
        endpoints: rec.endpoints,
        lacunarity: rec.lacunarity,
        connectivity: rec.connectivity
      };

      const researcher = {
        firstName: rec.researcher_name?.split(' ')[0] || session?.firstName || 'Sanjay',
        lastName: rec.researcher_name?.split(' ')[1] || session?.lastName || 'Grs',
        institution: rec.institution || session?.institution || 'Biomedical Institute',
        role: rec.role || session?.role || 'Researcher'
      };

      generatePDFReport({
        metrics,
        binaryDataUrl: rec.binary_b64,
        skeletonDataUrl: rec.skeleton_b64,
        overlayDataUrl: rec.overlay_b64,
        researcher
      });
      setToast({ message: `PDF report downloaded!`, type: 'success' });
    } catch (err) {
      console.error('PDF Export Error:', err);
      setToast({ message: 'Failed to generate PDF report.', type: 'error' });
    }
  };

  const handleDeleteRecord = async (id) => {
    try {
      await deleteAnalysisRecord(id);
      setSavedRecords(prev => prev.filter(r => r.id !== id));
      setToast({ message: `Analysis record #${id} deleted from SQLite DB.`, type: 'info' });
    } catch (err) {
      console.error('Delete Error:', err);
      setToast({ message: 'Failed to delete record.', type: 'error' });
    }
  };

  return (
    <div style={{ position: 'relative', minHeight: 'calc(100vh - 134px)', padding: '24px 20px 90px', maxWidth: '900px', margin: '0 auto' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <span className="section-label">ACCOUNT CONTROL PANEL</span>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--pure-white)', marginTop: '4px' }}>
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
          borderLeft: '4px solid var(--teal-accent)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, var(--teal-accent) 0%, var(--cyan-accent) 100%)',
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
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--pure-white)' }}>
              {session.firstName} {session.lastName}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 10px', borderRadius: '999px', backgroundColor: 'rgba(0, 212, 170, 0.15)', color: 'var(--teal-accent)' }}>
                {session.role || 'Researcher'}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--muted-white)' }}>
                Local SQLite Session
              </span>
            </div>
          </div>
        </div>

        <div style={{ height: '1px', backgroundColor: 'rgba(148, 163, 184, 0.15)', margin: '4px 0' }} />

        {/* Read-Only Info Fields */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '10px', backgroundColor: 'var(--input-bg)' }}>
            <Mail size={18} color="var(--teal-accent)" />
            <div>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--muted-white)', textTransform: 'uppercase' }}>EMAIL</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--pure-white)' }}>{session.email}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '10px', backgroundColor: 'var(--input-bg)' }}>
            <Building size={18} color="var(--cyan-accent)" />
            <div>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--muted-white)', textTransform: 'uppercase' }}>INSTITUTION</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--pure-white)' }}>{session.institution}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Preferences Toggles */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '28px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--teal-accent)', marginBottom: '16px' }}>
          SYSTEM PREFERENCES
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Functional Dark/Light Theme Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  padding: '8px',
                  borderRadius: '10px',
                  backgroundColor: isDark ? 'rgba(0, 180, 216, 0.15)' : 'rgba(216, 155, 10, 0.15)',
                  color: isDark ? 'var(--cyan-accent)' : 'var(--gold-accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {isDark ? <Moon size={20} /> : <Sun size={20} />}
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--pure-white)' }}>
                  Theme Appearance
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted-white)' }}>
                  Active Mode: <strong>{isDark ? 'Dark Clinical Mode' : 'Light Clinical Mode'}</strong>
                </div>
              </div>
            </div>

            {/* Toggle Switch */}
            <div
              onClick={() => {
                toggleTheme();
                setToast({ message: `Switched to ${isDark ? 'Light' : 'Dark'} Theme`, type: 'info' });
              }}
              style={{
                width: '52px',
                height: '28px',
                borderRadius: '14px',
                backgroundColor: isDark ? 'rgba(0, 212, 170, 0.3)' : 'rgba(0, 168, 138, 0.5)',
                border: '1px solid var(--teal-accent)',
                padding: '2px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: isDark ? 'flex-end' : 'flex-start',
                transition: 'all 0.25s ease'
              }}
            >
              <div
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--teal-accent)',
                  boxShadow: '0 0 8px rgba(0, 212, 170, 0.6)'
                }}
              />
            </div>
          </div>

          <div style={{ height: '1px', backgroundColor: 'rgba(148, 163, 184, 0.15)' }} />

          {/* Analysis Reminders */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  padding: '8px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(244, 114, 182, 0.15)',
                  color: 'var(--pink-accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Bell size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--pure-white)' }}>Analysis Reminders</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted-white)' }}>Receive daily notification prompts for pending samples</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={remindersEnabled}
              onChange={e => {
                setRemindersEnabled(e.target.checked);
                setToast({ message: `Reminders ${e.target.checked ? 'enabled' : 'disabled'}`, type: 'info' });
              }}
              style={{ accentColor: 'var(--teal-accent)', width: '20px', height: '20px', cursor: 'pointer' }}
            />
          </div>
        </div>
      </div>

      {/* Saved SQLite Analysis History */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Database size={20} color="var(--teal-accent)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--pure-white)' }}>
              Saved Analysis Records ({savedRecords.length})
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              className="btn-outlined"
              onClick={handleExportDB}
              style={{ padding: '6px 14px', fontSize: '0.78rem', borderRadius: '8px' }}
            >
              <Download size={14} />
              <span>Export .sqlite File</span>
            </button>
            <span style={{ fontSize: '0.72rem', color: 'var(--success-green)', fontWeight: 700 }}>IndexedDB Active</span>
          </div>
        </div>

        {savedRecords.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.2)', textAlign: 'left', color: 'var(--muted-white)' }}>
                  <th style={{ padding: '8px 12px' }}>S.No</th>
                  <th style={{ padding: '8px 12px' }}>Density</th>
                  <th style={{ padding: '8px 12px' }}>Branches</th>
                  <th style={{ padding: '8px 12px' }}>Length</th>
                  <th style={{ padding: '8px 12px' }}>Connectivity</th>
                  <th style={{ padding: '8px 12px' }}>Timestamp</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {savedRecords.map((rec, idx) => (
                  <tr key={rec.id} style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)', color: 'var(--pure-white)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--teal-accent)' }}>
                      #{savedRecords.length - idx}
                    </td>
                    <td style={{ padding: '10px 12px' }}>{rec.vessel_density}%</td>
                    <td style={{ padding: '10px 12px' }}>{rec.branch_points} pts</td>
                    <td style={{ padding: '10px 12px' }}>{rec.total_length} px</td>
                    <td style={{ padding: '10px 12px' }}>{rec.connectivity}%</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted-white)', fontSize: '0.75rem' }}>
                      {new Date(rec.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                        <button
                          onClick={() => handleDownloadRecordPDF(rec)}
                          title="Download PDF Report"
                          style={{
                            background: 'rgba(0, 212, 170, 0.12)',
                            border: '1px solid rgba(0, 212, 170, 0.35)',
                            color: 'var(--teal-accent)',
                            borderRadius: '8px',
                            padding: '6px 10px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <FileText size={14} />
                          <span>PDF</span>
                        </button>

                        <button
                          onClick={() => handleDeleteRecord(rec.id)}
                          title="Delete Saved Record from SQLite"
                          style={{
                            background: 'rgba(239, 68, 68, 0.12)',
                            border: '1px solid rgba(239, 68, 68, 0.35)',
                            color: '#EF4444',
                            borderRadius: '8px',
                            padding: '6px 8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--muted-white)', fontSize: '0.85rem' }}>
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
