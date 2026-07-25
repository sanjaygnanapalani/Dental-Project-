import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DnaAnimation from '../components/common/DnaAnimation';
import { Activity } from 'lucide-react';

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
        backgroundColor: '#0A0E1A',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
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
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '24px',
            background: 'linear-gradient(135deg, #00D4AA 0%, #00B4D8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 40px rgba(0, 212, 170, 0.5)'
          }}
        >
          <Activity size={48} color="#0A0E1A" strokeWidth={2.5} />
        </div>

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
              color: '#94A3B8',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              fontWeight: 600
            }}
          >
            Microsphere Angiogenesis Analyzer
          </p>
        </div>

        <div style={{ marginTop: '24px', display: 'flex', gap: '8px' }}>
          <div className="pulse-dot" style={{ backgroundColor: '#00D4AA' }} />
          <div className="pulse-dot" style={{ backgroundColor: '#00B4D8', animationDelay: '0.3s' }} />
          <div className="pulse-dot" style={{ backgroundColor: '#F472B6', animationDelay: '0.6s' }} />
        </div>
      </div>
    </div>
  );
}
