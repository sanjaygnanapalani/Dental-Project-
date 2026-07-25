import React from 'react';
import { Compass, Dna, Activity, TrendingUp, ShieldCheck, HeartPulse } from 'lucide-react';

export default function ExploreTab() {
  const growthFactors = [
    {
      name: 'VEGF-165',
      fullName: 'Vascular Endothelial Growth Factor',
      role: 'Initiates tip-cell selection, endothelial migration, and filopodia extension.',
      color: '#00D4AA',
      release: 'Phase I Burst (35%)'
    },
    {
      name: 'bFGF (FGF-2)',
      fullName: 'Basic Fibroblast Growth Factor',
      role: 'Stimulates endothelial proliferation and extracellular matrix degradation.',
      color: '#00B4D8',
      release: 'Phase II Sustained'
    },
    {
      name: 'PDGF-BB',
      fullName: 'Platelet-Derived Growth Factor',
      role: 'Recruits mural pericytes and smooth muscle cells for vessel stabilization.',
      color: '#F472B6',
      release: 'Phase II Maturation'
    }
  ];

  return (
    <div style={{ position: 'relative', minHeight: 'calc(100vh - 134px)', padding: '24px 20px 90px', maxWidth: '960px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <span className="section-label">SCIENTIFIC KNOWLEDGE BASE</span>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#F8FAFC', marginTop: '4px' }}>
          Angiogenesis & Scaffold Dynamics
        </h1>
      </div>

      {/* Section 1: PLGA Microspheres Overview */}
      <div
        className="glass-card"
        style={{
          padding: '28px',
          marginBottom: '28px',
          borderLeft: '4px solid #00D4AA'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
          <div
            style={{
              padding: '10px',
              borderRadius: '12px',
              backgroundColor: 'rgba(0, 212, 170, 0.12)',
              color: '#00D4AA'
            }}
          >
            <Dna size={24} />
          </div>
          <div>
            <span className="section-label">MATERIAL ARCHITECTURE</span>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#F8FAFC' }}>
              What are PLGA Microspheres?
            </h2>
          </div>
        </div>

        <p style={{ fontSize: '0.92rem', color: '#94A3B8', lineHeight: 1.6, marginBottom: '14px' }}>
          Poly(lactic-co-glycolic acid) [PLGA] is a FDA-approved biodegradable copolymer renowned for its biocompatibility and tunable degradation kinetics. In tissue engineering, PLGA microspheres act as micro-reservoirs encapsulating labile angiogenic growth factors (VEGF, bFGF).
        </p>

        <p style={{ fontSize: '0.92rem', color: '#94A3B8', lineHeight: 1.6 }}>
          As the polymer ester bonds undergo hydrolytic cleavage, growth factors are delivered directly into the local microenvironment, creating steep haptotactic concentration gradients that stimulate targeted blood vessel sprouting.
        </p>
      </div>

      {/* Section 2: Angiogenic Growth Factors */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ marginBottom: '16px' }}>
          <span className="section-label">MOLECULAR AGENTS</span>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#F8FAFC', marginTop: '2px' }}>
            Angiogenic Growth Factors
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
          {growthFactors.map(gf => (
            <div
              key={gf.name}
              className="glass-card glass-card-hover"
              style={{
                padding: '22px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '12px',
                borderTop: `3px solid ${gf.color}`
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#F8FAFC' }}>
                    {gf.name}
                  </h3>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: '999px', backgroundColor: `${gf.color}22`, color: gf.color }}>
                    {gf.release}
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: gf.color, fontWeight: 600, marginBottom: '8px' }}>
                  {gf.fullName}
                </div>
                <p style={{ fontSize: '0.85rem', color: '#94A3B8', lineHeight: 1.5 }}>
                  {gf.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: Two-Phase Release Profile */}
      <div
        className="glass-card"
        style={{
          padding: '28px',
          marginBottom: '28px',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(10, 14, 26, 0.95) 100%)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div
            style={{
              padding: '10px',
              borderRadius: '12px',
              backgroundColor: 'rgba(0, 180, 216, 0.12)',
              color: '#00B4D8'
            }}
          >
            <TrendingUp size={24} />
          </div>
          <div>
            <span className="section-label">RELEASE KINETICS</span>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#F8FAFC' }}>
              Two-Phase Sustained Release Profile
            </h2>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginTop: '16px' }}>
          <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(0, 212, 170, 0.08)', border: '1px solid rgba(0, 212, 170, 0.2)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#00D4AA' }}>PHASE I BURST (HOURS 0-24)</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#F8FAFC', margin: '4px 0' }}>~35% Release</div>
            <p style={{ fontSize: '0.82rem', color: '#94A3B8', lineHeight: 1.4 }}>
              Initial surface desorption establishing acute VEGF chemical gradient to stimulate rapid endothelial tip-cell sprouting.
            </p>
          </div>

          <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(0, 180, 216, 0.08)', border: '1px solid rgba(0, 180, 216, 0.2)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#00B4D8' }}>PHASE II SUSTAINED (DAYS 2-28)</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#F8FAFC', margin: '4px 0' }}>~96% Total</div>
            <p style={{ fontSize: '0.82rem', color: '#94A3B8', lineHeight: 1.4 }}>
              Bulk polymer erosion-controlled release maintaining steady bFGF/PDGF diffusion for capillary maturation and anastomosis.
            </p>
          </div>
        </div>
      </div>

      {/* Section 4: Clinical Benefits */}
      <div className="glass-card" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div
            style={{
              padding: '10px',
              borderRadius: '12px',
              backgroundColor: 'rgba(244, 114, 182, 0.12)',
              color: '#F472B6'
            }}
          >
            <HeartPulse size={24} />
          </div>
          <div>
            <span className="section-label">TRANSLATIONAL IMPACT</span>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#F8FAFC' }}>
              Clinical & Regenerative Benefits
            </h2>
          </div>
        </div>

        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            'Accelerates neovascularization in ischemic tissue engineering scaffolds by >400%.',
            'Prevents central necrosis in thick engineered bone and cardiac tissue constructs.',
            'Reduces systemic growth factor toxicity via localized zero-order delivery kinetics.',
            'Enables precise quantitative monitoring of microvascular branch density over time.'
          ].map((item, idx) => (
            <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.88rem', color: '#94A3B8' }}>
              <ShieldCheck size={18} color="#00D4AA" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
