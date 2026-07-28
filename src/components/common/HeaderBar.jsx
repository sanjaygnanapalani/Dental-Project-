import React from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AppLogo from './AppLogo';

export default function HeaderBar() {
  const { session, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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
        backgroundColor: 'var(--glass-bg)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--glass-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        zIndex: 90,
        gap: '16px',
        transition: 'background-color 0.3s ease, border-color 0.3s ease'
      }}
    >
      {/* Brand Logo Component */}
      <AppLogo size={38} iconSize={22} borderRadius={12} showText={true} titleSize="1.2rem" />

      {/* User Info & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 1, minWidth: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '6px 14px',
            borderRadius: '999px',
            backgroundColor: 'var(--input-bg)',
            border: '1px solid var(--glass-border)',
            minWidth: 0,
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--teal-accent) 0%, var(--cyan-accent) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 800,
              color: '#0A0E1A',
              flexShrink: 0
            }}
          >
            {initials}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <span
              style={{
                fontSize: '0.82rem',
                fontWeight: 700,
                color: 'var(--pure-white)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {displayName}
            </span>
            <span
              style={{
                fontSize: '0.68rem',
                color: 'var(--muted-white)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {session.institution || 'Biomedical Institute'}
            </span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          title="Sign Out"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#EF4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.25)'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.12)'}
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
