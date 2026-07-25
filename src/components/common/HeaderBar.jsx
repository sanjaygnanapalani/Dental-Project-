import React from 'react';
import { LogOut, Activity } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function HeaderBar() {
  const { session, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Format display name nicely if email prefix was used
  const rawName = `${session.firstName || ''} ${session.lastName || ''}`.trim();
  const displayName = rawName.includes('researcher.google') ? 'Google Researcher' : (rawName || 'Researcher');
  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        left: 0,
        right: 0,
        height: '68px',
        backgroundColor: 'rgba(10, 14, 26, 0.9)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(0, 212, 170, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        zIndex: 90,
        gap: '16px'
      }}
    >
      {/* Brand Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #00D4AA 0%, #00B4D8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(0, 212, 170, 0.4)'
          }}
        >
          <Activity size={22} color="#0A0E1A" strokeWidth={2.5} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span
            className="gradient-text"
            style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1 }}
          >
            PLGA Vascular
          </span>
          <span style={{ fontSize: '0.65rem', color: '#94A3B8', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 700 }}>
            Microvascular Analyzer
          </span>
        </div>
      </div>

      {/* User Info & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 1, minWidth: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            border: '1px solid rgba(0, 212, 170, 0.2)',
            padding: '6px 14px 6px 8px',
            borderRadius: '999px',
            maxWidth: '260px'
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #00D4AA 0%, #00B4D8 100%)',
              color: '#0A0E1A',
              fontWeight: 800,
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            {initials}
          </div>

          <div style={{ overflow: 'hidden', minWidth: 0, textAlign: 'left' }}>
            <div
              style={{
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#F8FAFC',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {displayName}
            </div>
            <div
              style={{
                fontSize: '0.68rem',
                color: '#00D4AA',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {session.institution || 'Biomedical Institute'}
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          title="Log Out"
          style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            color: '#EF4444',
            borderRadius: '12px',
            width: '38px',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            flexShrink: 0
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.25)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.12)';
          }}
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
