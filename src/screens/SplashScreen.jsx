import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DnaAnimation from '../components/common/DnaAnimation';
import AppLogo from '../components/common/AppLogo';

export default function SplashScreen() {
  const navigate = useNavigate();
  const { session } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (session?.isLoggedIn) {
        navigate('/main');
      } else {
        navigate('/login');
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [session, navigate]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        backgroundColor: 'var(--dark-bg)',
        color: 'var(--text-primary)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        transition: 'background-color 0.3s ease, color 0.3s ease'
      }}
    >
      <DnaAnimation opacity={0.85} />

      <div
        style={{
          zIndex: 10,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
          padding: '24px'
        }}
      >
        {/* Brand App Logo */}
        <AppLogo size={88} iconSize={52} borderRadius={26} />

        <div>
          <h1
            className="gradient-text"
            style={{
              fontSize: '2.5rem',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              marginBottom: '8px'
            }}
          >
            PLGA Vascularization
          </h1>
          <p
            style={{
              fontSize: '1rem',
              color: 'var(--text-secondary)',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              fontWeight: 600
            }}
          >
            Microsphere Angiogenesis Analyzer
          </p>
        </div>

        <div style={{ marginTop: '24px', display: 'flex', gap: '8px' }}>
          <div className="pulse-dot" style={{ backgroundColor: 'var(--teal-accent)' }} />
          <div className="pulse-dot" style={{ backgroundColor: 'var(--cyan-accent)', animationDelay: '0.3s' }} />
          <div className="pulse-dot" style={{ backgroundColor: 'var(--pink-accent)', animationDelay: '0.6s' }} />
        </div>
      </div>
    </div>
  );
}
