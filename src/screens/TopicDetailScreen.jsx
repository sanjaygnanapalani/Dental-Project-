import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DnaAnimation from '../components/common/DnaAnimation';
import MetricCard from '../components/common/MetricCard';
import { ArrowLeft, GitBranch, Network, BarChart3, Pill, CheckCircle2, ShieldAlert } from 'lucide-react';

const TOPIC_DETAILS = {
  vessel_sprouting: {
    title: 'Vessel Sprouting Kinetics',
    subtitle: 'Tip-Cell Migration & VEGF Gradient Dynamics',
    icon: GitBranch,
    heroText: 'Endothelial tip cells lead angiogenic vessel sprouts toward hypoxic tissue gradients by extending long, motile filopodia enriched with VEGF Receptor-2 (VEGFR2).',
    stats: [
      { label: 'Tip Migration Speed', value: '14.2', unit: 'µm/hr', color: '#00D4AA' },
      { label: 'Filopodia Radius', value: '450', unit: 'nm', color: '#00B4D8' },
      { label: 'Gradient Sensitivity', value: '0.85', unit: 'idx', color: '#F472B6' }
    ],
    sections: [
      {
        heading: 'Filopodia Extension & Delta-Like 4 Signaling',
        text: 'When local tissue hypoxia triggers VEGF-A secretion, neighboring endothelial cells enter a competitive selection hierarchy mediated by Notch signaling. The cell expressing highest VEGFR2 becomes the specialized tip cell, suppressing adjacent stalk-cell phenotypes via Delta-like ligand 4 (Dll4).'
      },
      {
        heading: 'Extracellular Matrix Remodeling',
        text: 'Sprouting tip cells secrete matrix metalloproteinases (MMP-2, MMP-9) to locally degrade the basement membrane, paving a permeable channel for trailing stalk cells to proliferate and form a new vessel lumen.'
      }
    ]
  },
  network_formation: {
    title: 'Network Formation & Anastomosis',
    subtitle: 'Capillary Loop Formation & Pericyte Recruitment',
    icon: Network,
    heroText: 'Vessel anastomosis occurs when two independent sprouting tip cells meet, adhere, and fuse their luminal membranes to establish a functional continuous microcirculatory loop.',
    stats: [
      { label: 'Anastomosis Time', value: '6.4', unit: 'hrs', color: '#00B4D8' },
      { label: 'Pericyte Coverage', value: '78.5', unit: '%', color: '#10B981' },
      { label: 'Branching Stability', value: '92.0', unit: '%', color: '#FBBF24' }
    ],
    sections: [
      {
        heading: 'Lumen Coalescence & Flow Induction',
        text: 'Following filopodia adhesion, VE-cadherin junctions remodel to form a contiguous intercellular lumen. Hydrostatic pressure from blood flow stabilizes the nascent capillary wall and prevents regression.'
      },
      {
        heading: 'Pericyte Stabilization & Basement Membrane Synthesis',
        text: 'Platelet-Derived Growth Factor BB (PDGF-BB) secreted by endothelial cells recruits mural pericytes, which wrap around capillaries, secrete collagen IV, and establish quiescent blood-scaffold barrier function.'
      }
    ]
  },
  quantitative_analysis: {
    title: 'Quantitative Vascular Metrics',
    subtitle: 'Zhang-Suen Thinning & Fractal Lacunarity Quantification',
    icon: BarChart3,
    heroText: 'Precise automated image segmentation measures microvascular density, branch point distribution, and structural lacunarity to objectively evaluate PLGA biomaterial performance.',
    stats: [
      { label: 'Algorithm Convergence', value: '< 150', unit: 'ms', color: '#00D4AA' },
      { label: 'Skeleton Precision', value: '99.4', unit: '%', color: '#F472B6' },
      { label: 'Connectivity Index', value: '88.6', unit: '%', color: '#00B4D8' }
    ],
    sections: [
      {
        heading: 'Zhang-Suen Digital Matrix Thinning',
        text: 'Zhang-Suen thinning is a 2-pass iterative thinning algorithm that preserves topological connectivity while paring binary vessel shapes down to single-pixel centerlines, allowing exact pixel-length and node counting.'
      },
      {
        heading: 'Fractal Lacunarity & Connectivity',
        text: 'Lacunarity measures gappiness heterogeneity across overlapping 32x32 pixel boxes. Low lacunarity indicates uniform vessel distribution, whereas high lacunarity signals clumped, irregular vessel clusters.'
      }
    ]
  },
  therapeutic_importance: {
    title: 'Therapeutic Angiogenesis',
    subtitle: 'Pro- vs Anti-Angiogenic Regenerative Therapies',
    icon: Pill,
    heroText: 'Controlled growth factor release from bio-resorbable PLGA microspheres restores microvascular perfusion in ischemic cardiac, neural, and diabetic limb pathologies.',
    stats: [
      { label: 'Perfusion Recovery', value: '340', unit: '%', color: '#10B981' },
      { label: 'Necrosis Reduction', value: '64.5', unit: '%', color: '#00D4AA' },
      { label: 'Tissue Viability', value: '95.2', unit: '%', color: '#FBBF24' }
    ],
    sections: [
      {
        heading: 'Controlled Dual Growth Factor Delivery',
        text: 'Sequential release of VEGF (burst phase) followed by bFGF/PDGF (sustained phase) mimics physiological tissue healing, overcoming the instability and short half-life of bolus growth factor injections.'
      },
      {
        heading: 'Clinical Translation in Scaffold Engineering',
        text: 'Incorporating PLGA microspheres into 3D bioprinted constructs enables rapid vascular integration upon implantation, preventing core ischemia in large synthetic organ transplants.'
      }
    ]
  }
};

export default function TopicDetailScreen() {
  const { topicName } = useParams();
  const navigate = useNavigate();

  const topic = TOPIC_DETAILS[topicName] || TOPIC_DETAILS['vessel_sprouting'];
  const Icon = topic.icon;

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        backgroundColor: '#0A0E1A',
        color: '#F8FAFC',
        padding: '24px 20px 60px'
      }}
    >
      <DnaAnimation opacity={0.3} />

      <div style={{ position: 'relative', zIndex: 10, maxWidth: '900px', margin: '0 auto' }}>
        {/* Back Button */}
        <button
          onClick={() => navigate('/main')}
          style={{
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(0, 212, 170, 0.3)',
            color: '#00D4AA',
            padding: '8px 16px',
            borderRadius: '10px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '24px'
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Main Dashboard</span>
        </button>

        {/* Hero Banner */}
        <div
          className="glass-card"
          style={{
            padding: '32px 28px',
            marginBottom: '28px',
            borderLeft: '4px solid #00D4AA'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                backgroundColor: 'rgba(0, 212, 170, 0.15)',
                color: '#00D4AA',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Icon size={26} />
            </div>
            <div>
              <span className="section-label">{topic.subtitle}</span>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#F8FAFC' }}>
                {topic.title}
              </h1>
            </div>
          </div>

          <p style={{ fontSize: '1rem', color: '#94A3B8', lineHeight: 1.6 }}>
            {topic.heroText}
          </p>
        </div>

        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          {topic.stats.map((s, idx) => (
            <MetricCard key={idx} title={s.label} value={s.value} unit={s.unit} color={s.color} />
          ))}
        </div>

        {/* Deep Dive Content Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {topic.sections.map((sec, idx) => (
            <div key={idx} className="glass-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <CheckCircle2 size={20} color="#00D4AA" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#F8FAFC' }}>
                  {sec.heading}
                </h3>
              </div>
              <p style={{ fontSize: '0.92rem', color: '#94A3B8', lineHeight: 1.6 }}>
                {sec.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
