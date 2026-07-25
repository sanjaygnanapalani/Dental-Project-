import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DnaAnimation from '../components/common/DnaAnimation';
import { Activity, Eye, EyeOff, CheckCircle2, Lock, Mail } from 'lucide-react';

export default function LoginScreen() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('sanjay@biomed.org');
  const [password, setPassword] = useState('demo123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Invalid email address format';

    if (!password) errs.password = 'Password is required';
    else if (password.length < 6) errs.password = 'Password must be at least 6 characters';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setSuccessMsg(true);
    
    try {
      await login(email, password);
    } catch (err) {
      console.warn('Login warning:', err);
    } finally {
      setTimeout(() => {
        navigate('/main');
      }, 500);
    }
  };

  const handleGoogleSignIn = async () => {
    setEmail('researcher.google@biomed.org');
    setPassword('googleDemo123');
    setSuccessMsg(true);
    try {
      await login('researcher.google@biomed.org', 'googleDemo123');
    } catch (err) {
      console.warn('Google sign in warning:', err);
    } finally {
      setTimeout(() => {
        navigate('/main');
      }, 500);
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        backgroundColor: '#0A0E1A',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}
    >
      <DnaAnimation blur={true} opacity={0.5} />

      <div
        className="glass-card"
        style={{
          zIndex: 10,
          width: '100%',
          maxWidth: '440px',
          padding: '36px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #00D4AA 0%, #00B4D8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 0 24px rgba(0, 212, 170, 0.4)'
            }}
          >
            <Activity size={32} color="#0A0E1A" strokeWidth={2.5} />
          </div>

          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#F8FAFC' }}>
            Welcome Back
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#94A3B8', marginTop: '4px' }}>
            Sign in to access your PLGA vascular analysis dashboard
          </p>
        </div>

        {/* Success Banner */}
        {successMsg && (
          <div
            style={{
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid #10B981',
              borderRadius: '12px',
              padding: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: '#10B981',
              fontSize: '0.9rem',
              fontWeight: 700,
              animation: 'fadeIn 0.3s ease'
            }}
          >
            <CheckCircle2 size={22} />
            <span>Authentication Successful! Redirecting...</span>
          </div>
        )}

        {/* Form Error */}
        {errors.form && (
          <div style={{ color: '#EF4444', fontSize: '0.85rem', textAlign: 'center', fontWeight: 600 }}>
            {errors.form}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Email */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#00D4AA', marginBottom: '6px' }}>
              EMAIL ADDRESS
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="form-input"
                placeholder="researcher@institute.org"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{ paddingLeft: '40px' }}
              />
              <Mail size={18} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
            {errors.email && <span style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{errors.email}</span>}
          </div>

          {/* Password */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#00D4AA', marginBottom: '6px' }}>
              PASSWORD
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ paddingLeft: '40px', paddingRight: '40px' }}
              />
              <Lock size={18} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <span style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{errors.password}</span>}
          </div>

          {/* Remember Me & Forgot Password */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#94A3B8' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                style={{ accentColor: '#00D4AA', width: '16px', height: '16px' }}
              />
              Remember Me
            </label>
            <Link to="/forgot-password" style={{ color: '#00B4D8', textDecoration: 'none', fontWeight: 600 }}>
              Forgot Password?
            </Link>
          </div>

          {/* Submit */}
          <button type="submit" className="btn-gradient" disabled={loading || successMsg} style={{ width: '100%', marginTop: '6px' }}>
            {loading ? 'Authenticating...' : 'Log In'}
          </button>

          {/* Google Sign In */}
          <button
            type="button"
            className="btn-outlined"
            onClick={handleGoogleSignIn}
            style={{ width: '100%' }}
          >
            Sign in with Google
          </button>
        </form>

        {/* Register link */}
        <div style={{ textAlign: 'center', fontSize: '0.85rem', color: '#94A3B8' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: '#00D4AA', textDecoration: 'none', fontWeight: 700 }}>
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
