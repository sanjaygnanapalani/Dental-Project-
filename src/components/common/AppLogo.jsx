import React from 'react';
import { Activity } from 'lucide-react';

/**
 * Standardized Brand Logo Component
 * Renders the vibrant cyan-teal gradient squircle badge with dark pulse line icon.
 */
export default function AppLogo({
  size = 38,
  iconSize = 22,
  borderRadius = 12,
  showText = false,
  subtitle = 'MICROVASCULAR ANALYZER',
  titleSize = '1.1rem'
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: `${borderRadius}px`,
          background: 'linear-gradient(135deg, #00D4AA 0%, #00B4D8 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 20px rgba(0, 212, 170, 0.45)',
          flexShrink: 0,
          transition: 'all 0.3s ease'
        }}
      >
        <Activity size={iconSize} color="#0A0E1A" strokeWidth={2.8} />
      </div>

      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span
            style={{
              fontSize: titleSize,
              fontWeight: 800,
              color: 'var(--pure-white)',
              letterSpacing: '-0.02em',
              lineHeight: 1.1
            }}
          >
            PLGA Vascular
          </span>
          <span
            style={{
              fontSize: '0.62rem',
              fontWeight: 700,
              color: 'var(--teal-accent)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginTop: '2px'
            }}
          >
            {subtitle}
          </span>
        </div>
      )}
    </div>
  );
}
