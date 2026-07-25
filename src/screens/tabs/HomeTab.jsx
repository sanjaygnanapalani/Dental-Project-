import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VesselNetworkAnimation from '../../components/common/VesselNetworkAnimation';
import TopicCard from '../../components/cards/TopicCard';
import { ArrowRight, Play, GitBranch, Network, BarChart3, Pill } from 'lucide-react';

export default function HomeTab({ onSwitchTab }) {
  const navigate = useNavigate();

  // Typewriter animation state
  const fullTitle = "Development of PLGA Microsphere for Controlled Delivery of Angiogenic Growth Factors to Enhance Vascularization";
  const [typedTitle, setTypedTitle] = useState('');

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < fullTitle.length) {
        setTypedTitle(fullTitle.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 35);

    return () => clearInterval(interval);
  }, []);

  const topics = [
    {
      slug: 'vessel_sprouting',
      title: 'Vessel Sprouting',
      description: 'Tip-cell selection & VEGF-driven directional filopodia sprouting mechanism.',
      icon: GitBranch
    },
    {
      slug: 'network_formation',
      title: 'Network Formation',
      description: 'Endothelial stalk elongation, vessel lumen formation & microcapillary anastomosis.',
      icon: Network
    },
    {
      slug: 'quantitative_analysis',
      title: 'Quantitative Stats',
      description: 'Zhang-Suen thinning, fractal lacunarity & microvascular connectivity metrics.',
      icon: BarChart3
    },
    {
      slug: 'therapeutic_importance',
      title: 'Therapeutics',
      description: 'Targeted spatial-temporal dual growth factor release in ischemic tissue regeneration.',
      icon: Pill
    }
  ];

  return (
    <div style={{ position: 'relative', minHeight: 'calc(100vh - 134px)', padding: '24px 20px 90px' }}>
      <VesselNetworkAnimation />

      <div style={{ position: 'relative', zIndex: 10, maxWidth: '1000px', margin: '0 auto' }}>
        {/* Hero Card */}
        <div
          className="glass-card"
          style={{
            padding: '32px 28px',
            marginBottom: '36px',
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.88) 0%, rgba(10, 14, 26, 0.94) 100%)',
            border: '1px solid rgba(0, 212, 170, 0.25)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5)'
          }}
        >
          <div style={{ marginBottom: '16px' }}>
            <span className="pulse-badge">
              <span className="pulse-dot" />
              RESEARCH PROJECT #385
            </span>
          </div>

          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: '#F8FAFC',
              lineHeight: 1.3,
              marginBottom: '14px',
              minHeight: '4.2rem'
            }}
          >
            {typedTitle}
            <span style={{ color: '#00D4AA', animation: 'blink 1s infinite' }}>|</span>
          </h1>

          <p
            style={{
              fontSize: '0.95rem',
              color: '#94A3B8',
              lineHeight: 1.6,
              marginBottom: '24px',
              maxWidth: '820px'
            }}
          >
            Automated biomedical image-processing pipeline designed to quantify microvascular sprout density,
            branching node complexity, and lacunarity in bio-resorbable Poly(lactic-co-glycolic acid) scaffolds.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
            <button
              className="btn-gradient"
              onClick={() => onSwitchTab('analyzer')}
              style={{ padding: '12px 28px', fontSize: '0.95rem' }}
            >
              <Play size={18} fill="#050B14" />
              <span>Start Analysis</span>
            </button>

            <button
              className="btn-outlined"
              onClick={() => onSwitchTab('explore')}
              style={{ padding: '12px 24px', fontSize: '0.95rem' }}
            >
              <span>Learn More</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Understanding the Science Section */}
        <div style={{ marginBottom: '20px' }}>
          <span className="section-label">THEORETICAL FOUNDATION</span>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#F8FAFC', marginTop: '4px' }}>
            Understanding the Science
          </h2>
        </div>

        {/* 2x2 Grid of Topic Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px'
          }}
        >
          {topics.map(t => (
            <TopicCard
              key={t.slug}
              icon={t.icon}
              title={t.title}
              description={t.description}
              slug={t.slug}
              onClick={() => navigate(`/topic/${t.slug}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
