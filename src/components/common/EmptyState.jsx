import React from 'react';
import { FileQuestion } from 'lucide-react';

export default function EmptyState({
  icon: Icon = FileQuestion,
  title = 'No Records Found',
  subtitle = 'Try adjusting your search query or upload a new image to start.',
  actionText,
  onAction
}) {
  return (
    <div
      className="glass-card"
      style={{
        padding: '48px 24px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '14px',
        maxWidth: '480px',
        margin: '32px auto'
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '20px',
          backgroundColor: 'rgba(0, 212, 170, 0.1)',
          border: '1px solid rgba(0, 212, 170, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#00D4AA'
        }}
      >
        <Icon size={32} />
      </div>

      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#F8FAFC' }}>
        {title}
      </h3>

      <p style={{ fontSize: '0.88rem', color: '#94A3B8', maxWidth: '360px', lineHeight: 1.5 }}>
        {subtitle}
      </p>

      {actionText && onAction && (
        <button className="btn-gradient" onClick={onAction} style={{ marginTop: '8px' }}>
          {actionText}
        </button>
      )}
    </div>
  );
}
