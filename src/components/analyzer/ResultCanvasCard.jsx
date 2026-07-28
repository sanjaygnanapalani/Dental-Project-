import React, { useEffect, useRef } from 'react';

export default function ResultCanvasCard({ title, subtitle, sourceCanvas, accentColor = 'var(--teal-accent)', legendLabel }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!sourceCanvas || !containerRef.current) return;

    containerRef.current.innerHTML = '';

    // Clone canvas content
    const canvasCopy = document.createElement('canvas');
    canvasCopy.width = sourceCanvas.width;
    canvasCopy.height = sourceCanvas.height;
    const ctx = canvasCopy.getContext('2d');
    ctx.drawImage(sourceCanvas, 0, 0);

    canvasCopy.style.width = '100%';
    canvasCopy.style.height = 'auto';
    canvasCopy.style.borderRadius = '8px';
    canvasCopy.style.display = 'block';

    containerRef.current.appendChild(canvasCopy);
  }, [sourceCanvas]);

  return (
    <div
      className="glass-card glass-card-hover"
      style={{
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        borderTop: `3px solid ${accentColor}`
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {title}
          </h4>
          {subtitle && (
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              {subtitle}
            </span>
          )}
        </div>
        {legendLabel && (
          <span
            style={{
              fontSize: '0.65rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '999px',
              backgroundColor: 'rgba(0, 212, 170, 0.15)',
              color: accentColor,
              border: `1px solid rgba(0, 212, 170, 0.3)`
            }}
          >
            {legendLabel}
          </span>
        )}
      </div>

      <div
        ref={containerRef}
        style={{
          width: '100%',
          backgroundColor: 'var(--input-bg)',
          borderRadius: '8px',
          overflow: 'hidden',
          minHeight: '200px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      />
    </div>
  );
}
