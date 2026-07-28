import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import DnaAnimation from '../components/common/DnaAnimation';
import AppLogo from '../components/common/AppLogo';
import { ArrowLeft, Mail, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ForgotPasswordScreen() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please provide a valid email address');
      return;
    }

    setError('');
    setSubmitted(true);
  };

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        backgroundColor: 'var(--dark-bg)',
        color: 'var(--text-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        transition: 'background-color 0.3s ease, color 0.3s ease'
      }}
    >
      <DnaAnimation blur={true} opacity={0.4} />

      <div
        className="glass-card"
        style={{
          zIndex: 10,
          width: '100%',
          maxWidth: '420px',
          padding: '32px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}
      >
        <button
          onClick={() => navigate('/login')}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--teal-accent)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            alignSelf: 'flex-start'
          }}
        >
          <ArrowLeft size={16} />
          Back to Login
        </button>

        <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0' }}>
          <AppLogo size={56} iconSize={30} borderRadius={16} />
        </div>

        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Reset Password
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Enter your institutional email to receive a password reset link
          </p>
        </div>

        {submitted ? (
          <div
            style={{
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid var(--success-green)',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <CheckCircle2 size={36} color="var(--success-green)" />
            <h3 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', fontWeight: 700 }}>
              Reset Link Sent!
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              We've dispatched password recovery instructions to <strong style={{ color: 'var(--teal-accent)' }}>{email}</strong>.
            </p>
            <Link to="/login" className="btn-gradient" style={{ textDecoration: 'none', marginTop: '8px', width: '100%' }}>
              Return to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {error && (
              <div style={{ color: 'var(--error-red)', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertCircle size={15} />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--teal-accent)', marginBottom: '6px' }}>
                RESEARCHER EMAIL ADDRESS
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="form-input"
                  placeholder="researcher@institute.org"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{ paddingLeft: '38px' }}
                />
                <Mail size={16} color="var(--text-secondary)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <button type="submit" className="btn-gradient" style={{ width: '100%', marginTop: '6px' }}>
              Send Reset Link
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
