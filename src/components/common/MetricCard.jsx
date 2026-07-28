import React from 'react';

export default function MetricCard({ title, value, unit = '', icon: Icon, color = 'var(--teal-accent)', description }) {
  return (
    <div
      className="glass-card glass-card-hover"
      style={{
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '8px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '4px',
          height: '100%',
          backgroundColor: color
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className="section-label" style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>
          {title}
        </span>
        {Icon && (
          <div
            style={{
              padding: '6px',
              borderRadius: '8px',
              backgroundColor: 'rgba(0, 212, 170, 0.12)',
              color: color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Icon size={16} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
        <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
          {value}
        </span>
        {unit && (
          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: color }}>
            {unit}
          </span>
        )}
      </div>

      {description && (
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          {description}
        </span>
      )}
    </div>
  );
}
