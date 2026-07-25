import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
  if (!message) return null;

  const isSuccess = type === 'success';
  const isError = type === 'error';
  const color = isSuccess ? '#10B981' : isError ? '#EF4444' : '#00B4D8';
  const Icon = isSuccess ? CheckCircle2 : isError ? AlertCircle : Info;

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(16px)',
        border: `1px solid ${color}`,
        borderRadius: '12px',
        padding: '12px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        boxShadow: `0 8px 24px ${color}33`,
        animation: 'slideDown 0.3s ease-out'
      }}
    >
      <Icon size={20} color={color} />
      <span style={{ color: '#F8FAFC', fontSize: '0.9rem', fontWeight: 600 }}>
        {message}
      </span>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#94A3B8',
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
