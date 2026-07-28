import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DnaAnimation from '../components/common/DnaAnimation';
import AppLogo from '../components/common/AppLogo';
import { Activity, Eye, EyeOff, CheckCircle2, User, Building, Mail, Phone, Lock } from 'lucide-react';

export default function SignUpScreen() {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [formData, setFormData] = useState({
    firstName: 'Sanjay',
    lastName: 'Grs',
    email: 'sanjay@biomed.org',
    phone: '',
    institution: 'Biomedical Institute',
    role: 'Researcher',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState(false);
  const [loading, setLoading] = useState(false);

  const calculatePasswordStrength = (pass) => {
    let score = 0;
    if (!pass) return { score: 0, label: 'None', color: 'var(--text-secondary)' };
    if (pass.length >= 8) score++;
    if (/\d/.test(pass)) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'var(--error-red)' };
    if (score === 2) return { score: 2, label: 'Fair', color: 'var(--warning-amber)' };
    if (score === 3) return { score: 3, label: 'Good', color: 'var(--cyan-accent)' };
    return { score: 4, label: 'Strong', color: 'var(--success-green)' };
  };

  const strength = calculatePasswordStrength(formData.password);

  const validate = () => {
    const errs = {};
    if (!formData.firstName.trim()) errs.firstName = 'First name is required';
    if (!formData.lastName.trim()) errs.lastName = 'Last name is required';
    if (!formData.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = 'Invalid email format';

    if (!formData.institution.trim()) errs.institution = 'Institution is required';

    if (!formData.password) errs.password = 'Password is required';
    else if (formData.password.length < 6) errs.password = 'Must be at least 6 characters';

    if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    if (!formData.agreeTerms) errs.agreeTerms = 'You must accept the terms & conditions';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await signup(formData);
      setSuccessMsg(true);
      setTimeout(() => {
        navigate('/main');
      }, 1500);
    } catch (err) {
      setErrors({ form: 'Registration failed. Email may already exist.' });
    } finally {
      setLoading(false);
    }
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
        padding: '32px 16px',
        transition: 'background-color 0.3s ease, color 0.3s ease'
      }}
    >
      <DnaAnimation blur={true} opacity={0.4} />

      <div
        className="glass-card"
        style={{
          zIndex: 10,
          width: '100%',
          maxWidth: '560px',
          padding: '36px 30px',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
            <AppLogo size={56} iconSize={30} borderRadius={16} />
          </div>

          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Researcher Registration
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Create an account to start analyzing microsphere vessel networks
          </p>
        </div>

        {/* Success Banner */}
        {successMsg && (
          <div
            style={{
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid var(--success-green)',
              borderRadius: '12px',
              padding: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: 'var(--success-green)',
              fontSize: '0.9rem',
              fontWeight: 700,
              marginBottom: '20px'
            }}
          >
            <CheckCircle2 size={22} />
            <span>Registration Successful! Navigating...</span>
          </div>
        )}

        {errors.form && (
          <div style={{ color: 'var(--error-red)', fontSize: '0.85rem', textAlign: 'center', fontWeight: 600, marginBottom: '16px' }}>
            {errors.form}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* First & Last Name Side by Side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--teal-accent)', marginBottom: '4px' }}>
                FIRST NAME *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  value={formData.firstName}
                  onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                  style={{ paddingLeft: '38px' }}
                />
                <User size={16} color="var(--text-secondary)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
              {errors.firstName && <span style={{ color: 'var(--error-red)', fontSize: '0.72rem' }}>{errors.firstName}</span>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--teal-accent)', marginBottom: '4px' }}>
                LAST NAME *
              </label>
              <input
                type="text"
                className="form-input"
                value={formData.lastName}
                onChange={e => setFormData({ ...formData, lastName: e.target.value })}
              />
              {errors.lastName && <span style={{ color: 'var(--error-red)', fontSize: '0.72rem' }}>{errors.lastName}</span>}
            </div>
          </div>

          {/* Email */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--teal-accent)', marginBottom: '4px' }}>
              EMAIL ADDRESS *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="form-input"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                style={{ paddingLeft: '38px' }}
              />
              <Mail size={16} color="var(--text-secondary)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
            {errors.email && <span style={{ color: 'var(--error-red)', fontSize: '0.72rem' }}>{errors.email}</span>}
          </div>

          {/* Phone (Optional) */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              PHONE NUMBER (OPTIONAL)
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="tel"
                className="form-input"
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                style={{ paddingLeft: '38px' }}
              />
              <Phone size={16} color="var(--text-secondary)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          {/* Institution & Role */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--teal-accent)', marginBottom: '4px' }}>
                INSTITUTION / UNIV *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  value={formData.institution}
                  onChange={e => setFormData({ ...formData, institution: e.target.value })}
                  style={{ paddingLeft: '38px' }}
                />
                <Building size={16} color="var(--text-secondary)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
              {errors.institution && <span style={{ color: 'var(--error-red)', fontSize: '0.72rem' }}>{errors.institution}</span>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--teal-accent)', marginBottom: '4px' }}>
                RESEARCH ROLE
              </label>
              <select
                className="form-select"
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="Researcher">Researcher</option>
                <option value="Student">Student</option>
                <option value="Professor">Professor</option>
                <option value="Industry Professional">Industry Professional</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Password */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--teal-accent)', marginBottom: '4px' }}>
              PASSWORD *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                style={{ paddingLeft: '38px', paddingRight: '38px' }}
              />
              <Lock size={16} color="var(--text-secondary)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <span style={{ color: 'var(--error-red)', fontSize: '0.72rem' }}>{errors.password}</span>}

            {/* 4-bar Password Strength Meter */}
            <div style={{ marginTop: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                <span>Password Strength</span>
                <span style={{ color: strength.color, fontWeight: 700 }}>{strength.label}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', height: '5px' }}>
                {[1, 2, 3, 4].map(idx => (
                  <div
                    key={idx}
                    style={{
                      height: '100%',
                      borderRadius: '2px',
                      backgroundColor: idx <= strength.score ? strength.color : 'var(--input-border)',
                      transition: 'background-color 0.3s ease'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--teal-accent)', marginBottom: '4px' }}>
              CONFIRM PASSWORD *
            </label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
            />
            {errors.confirmPassword && <span style={{ color: 'var(--error-red)', fontSize: '0.72rem' }}>{errors.confirmPassword}</span>}
          </div>

          {/* Terms Checkbox */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.agreeTerms}
                onChange={e => setFormData({ ...formData, agreeTerms: e.target.checked })}
                style={{ accentColor: 'var(--teal-accent)', width: '16px', height: '16px' }}
              />
              I accept the Research Terms & Data Guidelines
            </label>
            {errors.agreeTerms && <span style={{ color: 'var(--error-red)', fontSize: '0.72rem', display: 'block', marginTop: '2px' }}>{errors.agreeTerms}</span>}
          </div>

          {/* Submit Button */}
          <button type="submit" className="btn-gradient" disabled={loading || successMsg} style={{ width: '100%', marginTop: '6px' }}>
            {loading ? 'Creating Account...' : 'Register & Continue'}
          </button>

          {/* Google Register */}
          <button
            type="button"
            className="btn-outlined"
            onClick={() => {
              setFormData({
                ...formData,
                firstName: 'Google',
                lastName: 'Researcher',
                email: 'google.user@biomed.org',
                password: 'googleUser123',
                confirmPassword: 'googleUser123',
                agreeTerms: true
              });
            }}
            style={{ width: '100%' }}
          >
            Register via Google (Mock)
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '16px' }}>
          Already registered?{' '}
          <Link to="/login" style={{ color: 'var(--teal-accent)', textDecoration: 'none', fontWeight: 700 }}>
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}
