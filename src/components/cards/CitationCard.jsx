import React, { useState } from 'react';
import { Copy, ExternalLink, Check } from 'lucide-react';

export default function CitationCard({ citation }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = `${citation.authors} (${citation.year}). "${citation.title}". ${citation.journal}. DOI: ${citation.doi}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="glass-card glass-card-hover"
      style={{
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span
          style={{
            fontSize: '0.72rem',
            fontWeight: 800,
            padding: '2px 10px',
            borderRadius: '999px',
            backgroundColor: 'rgba(0, 212, 170, 0.15)',
            color: '#00D4AA',
            border: '1px solid rgba(0, 212, 170, 0.3)'
          }}
        >
          {citation.id}
        </span>
        <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 600 }}>
          {citation.year}
        </span>
      </div>

      <div>
        <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#F8FAFC', lineHeight: 1.4, marginBottom: '6px' }}>
          {citation.title}
        </h4>
        <div style={{ fontSize: '0.84rem', color: '#00B4D8', fontWeight: 600, marginBottom: '4px' }}>
          {citation.authors}
        </div>
        <div style={{ fontSize: '0.8rem', color: '#64748B', fontStyle: 'italic' }}>
          {citation.journal}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
        <button
          onClick={handleCopy}
          style={{
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(148, 163, 184, 0.25)',
            borderRadius: '8px',
            padding: '6px 12px',
            color: copied ? '#10B981' : '#94A3B8',
            fontSize: '0.78rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s ease'
          }}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          <span>{copied ? 'Copied' : 'Copy Citation'}</span>
        </button>

        {citation.doi && (
          <a
            href={`https://doi.org/${citation.doi}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: 'rgba(0, 180, 216, 0.1)',
              border: '1px solid rgba(0, 180, 216, 0.3)',
              borderRadius: '8px',
              padding: '6px 12px',
              color: '#00B4D8',
              fontSize: '0.78rem',
              fontWeight: 600,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>DOI Link</span>
            <ExternalLink size={13} />
          </a>
        )}
      </div>
    </div>
  );
}
