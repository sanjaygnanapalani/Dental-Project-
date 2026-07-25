import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function TopicCard({ icon: Icon, title, description, slug, onClick }) {
  return (
    <div
      onClick={onClick}
      className="glass-card glass-card-hover"
      style={{
        padding: '24px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '16px',
        position: 'relative'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            backgroundColor: 'rgba(0, 212, 170, 0.12)',
            border: '1px solid rgba(0, 212, 170, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#00D4AA'
          }}
        >
          <Icon size={22} />
        </div>

        <div
          style={{
            color: '#00B4D8',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.8rem',
            fontWeight: 600
          }}
        >
          <span>Explore</span>
          <ArrowRight size={14} />
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#F8FAFC', marginBottom: '6px' }}>
          {title}
        </h3>
        <p style={{ fontSize: '0.85rem', color: '#94A3B8', lineHeight: 1.5 }}>
          {description}
        </p>
      </div>
    </div>
  );
}
