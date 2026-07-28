import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
  if (!message) return null;

  const isSuccess = type === 'success';
  const isError = type === 'error';
  const color = isSuccess ? 'var(--success-green)' : isError ? 'var(--error-red)' : 'var(--cyan-accent)';
  const Icon = isSuccess ? CheckCircle2 : isError ? AlertCircle : Info;

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        backgroundColor: 'var(--card-bg)',
        backdropFilter: 'blur(16px)',
        border: `1px solid ${color}`,
        borderRadius: '12px',
        padding: '12px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        boxShadow: `0 8px 24px rgba(0, 0, 0, 0.2)`,
        animation: 'slideDown 0.3s ease-out'
      }}
    >
      <Icon size={20} color={color} />
      <span style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 600 }}>
        {message}
      </span>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '2px',
            marginLeft: '8px',
            display: 'flex'
          }}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
