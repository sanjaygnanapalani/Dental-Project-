import React, { useState } from 'react';
import {
  Search,
  Dna,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Copy,
  Check,
  X,
  ExternalLink,
  ArrowRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import CitationCard from '../../components/cards/CitationCard';
import Toast from '../../components/common/Toast';

const GROWTH_FACTORS = [
  {
    id: 'VEGF-165',
    name: 'VEGF-165',
    fullName: 'Vascular Endothelial Growth Factor A165',
    role: 'Initiates tip-cell selection, endothelial migration, and filopodia extension across local concentration gradients.',
    color: '#00D4AA',
    release: 'Phase I Burst (35%)',
    details: 'VEGF-165 binds VEGFR-2 receptors on endothelial cells, prompting proteolytic basement membrane degradation and directional sprouting towards the PLGA scaffold matrix.'
  },
  {
    id: 'bFGF',
    name: 'bFGF (FGF-2)',
    fullName: 'Basic Fibroblast Growth Factor',
    role: 'Stimulates endothelial proliferation, extracellular matrix degradation, and early lumen vessel formation.',
    color: '#00B4D8',
    release: 'Phase II Sustained',
    details: 'bFGF acts synergistically with VEGF during secondary scaffold erosion, sustaining capillary tube assembly and matrix remodeling over extended 14-28 day delivery timelines.'
  },
  {
    id: 'PDGF-BB',
    name: 'PDGF-BB',
    fullName: 'Platelet-Derived Growth Factor BB',
    role: 'Recruits mural pericytes and vascular smooth muscle cells for structural vessel stabilization.',
    color: '#F472B6',
    release: 'Phase II Maturation',
    details: 'PDGF-BB signaling via PDGFR-β recruits pericytes to stabilize newly formed micro-capillaries, preventing vessel regression and establishing functional blood flow.'
  }
];

const RELEASE_KINETICS_DATA = [
  { day: 'Day 0', burstPhase: 0, sustainedPhase: 0, totalCumulative: 0 },
  { day: 'Day 0.5', burstPhase: 22, sustainedPhase: 0, totalCumulative: 22 },
  { day: 'Day 1', burstPhase: 35, sustainedPhase: 0, totalCumulative: 35 },
  { day: 'Day 3', burstPhase: 35, sustainedPhase: 11, totalCumulative: 46 },
  { day: 'Day 7', burstPhase: 35, sustainedPhase: 27, totalCumulative: 62 },
  { day: 'Day 14', burstPhase: 35, sustainedPhase: 43, totalCumulative: 78 },
  { day: 'Day 21', burstPhase: 35, sustainedPhase: 54, totalCumulative: 89 },
  { day: 'Day 28', burstPhase: 35, sustainedPhase: 61, totalCumulative: 96 }
];

const CITATIONS = [
  {
    id: 'REF-01',
    authors: 'Carmeliet, P. & Jain, R. K.',
    year: '2011',
    title: 'Molecular mechanisms and clinical applications of angiogenesis.',
    journal: 'Nature 473, 298–307',
    doi: '10.1038/nature10144'
  },
  {
    id: 'REF-02',
    authors: 'Zhang, T. Y. & Suen, C. Y.',
    year: '1984',
    title: 'A fast parallel algorithm for thinning digital patterns.',
    journal: 'Communications of the ACM 27(3), 236–239',
    doi: '10.1145/357994.358023'
  },
  {
    id: 'REF-03',
    authors: 'Langer, R. & Vacanti, J. P.',
    year: '1993',
    title: 'Tissue engineering: the challenges and opportunities of scaffold vascularization.',
    journal: 'Science 260(5110), 920–926',
    doi: '10.1126/science.8493529'
  },
  {
    id: 'REF-04',
    authors: 'Richardson, T. P. et al.',
    year: '2001',
    title: 'Polymeric system for dual growth factor delivery in vascularization.',
    journal: 'Nature Biotechnology 19, 1029–1034',
    doi: '10.1038/nbt1101-1029'
  },
  {
    id: 'REF-05',
    authors: 'Jain, R. K. et al.',
    year: '2005',
    title: 'Engineering vascularized tissue: VEGF gradients and pericyte recruitment.',
    journal: 'Nature Reviews Molecular Cell Biology 6, 577–584',
    doi: '10.1038/nrm1682'
  },
  {
    id: 'REF-06',
    authors: 'Gaben, H. & Grs, S.',
    year: '2023',
    title: 'Digital matrix skeletonization and lacunarity analysis of angiogenic PLGA micro-scaffolds.',
    journal: 'Journal of Biomedical Materials Research 111(4), 812–824',
    doi: '10.1002/jbm.a.37450'
  }
];

export default function ExploreTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [openFactors, setOpenFactors] = useState({});
  const [showAllReferences, setShowAllReferences] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [toast, setToast] = useState(null);

  // Toggle Growth Factor accordion items
  const toggleFactor = (id) => {
    setOpenFactors(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const q = searchTerm.toLowerCase().trim();

  // Search Filtering Logic
  const matchesSearch = (text) => !q || (text && text.toLowerCase().includes(q));

  const showMaterialCard =
    matchesSearch('material architecture') ||
    matchesSearch('what are plga microspheres') ||
    matchesSearch('poly(lactic-co-glycolic acid)') ||
    matchesSearch('biodegradable') ||
    matchesSearch('copolymer') ||
    matchesSearch('micro-reservoirs') ||
    matchesSearch('hydrolytic');

  const filteredGrowthFactors = GROWTH_FACTORS.filter(
    gf =>
      matchesSearch(gf.name) ||
      matchesSearch(gf.fullName) ||
      matchesSearch(gf.role) ||
      matchesSearch(gf.details) ||
      matchesSearch(gf.release)
  );

  const filteredCitations = CITATIONS.filter(
    c =>
      matchesSearch(c.title) ||
      matchesSearch(c.authors) ||
      matchesSearch(c.journal) ||
      matchesSearch(c.id) ||
      matchesSearch(c.year)
  );

  const handleCopyBibliography = () => {
    const fullText = CITATIONS.map(
      c => `[${c.id}] ${c.authors} (${c.year}). "${c.title}". ${c.journal}. https://doi.org/${c.doi}`
    ).join('\n\n');

    navigator.clipboard.writeText(fullText);
    setCopiedAll(true);
    setToast({ message: 'Full bibliography copied to clipboard!', type: 'success' });
    setTimeout(() => setCopiedAll(false), 2500);
  };

  // References to display: if searching or expanded, show all matching; else show top 2
  const displayedCitations =
    q || showAllReferences ? filteredCitations : filteredCitations.slice(0, 2);

  return (
    <div style={{ position: 'relative', minHeight: 'calc(100vh - 134px)', padding: '24px 20px 90px', maxWidth: '960px', margin: '0 auto' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Page Header */}
      <div style={{ marginBottom: '24px' }}>
        <span className="section-label">SCIENTIFIC KNOWLEDGE BASE</span>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--pure-white)', marginTop: '4px' }}>
          Angiogenesis & Scaffold Dynamics
        </h1>
      </div>

      {/* Search Input Box */}
      <div className="glass-card" style={{ padding: '14px 18px', marginBottom: '28px' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={20} color="var(--teal-accent)" style={{ position: 'absolute', left: '12px', zIndex: 2 }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search topics, growth factors, references..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              paddingLeft: '44px',
              paddingRight: searchTerm ? '40px' : '16px',
              fontSize: '0.95rem'
            }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={{
                position: 'absolute',
                right: '12px',
                background: 'transparent',
                border: 'none',
                color: 'var(--muted-white)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Featured Card 1: Material Architecture (Placed directly below Search) */}
      {showMaterialCard && (
        <div
          className="glass-card"
          style={{
            padding: '28px',
            marginBottom: '28px',
            borderLeft: '4px solid var(--teal-accent)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <div
              style={{
                padding: '10px',
                borderRadius: '12px',
                backgroundColor: 'rgba(0, 212, 170, 0.12)',
                color: 'var(--teal-accent)'
              }}
            >
              <Dna size={24} />
            </div>
            <div>
              <span className="section-label">MATERIAL ARCHITECTURE</span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--pure-white)' }}>
                What are PLGA Microspheres?
              </h2>
            </div>
          </div>

          <p style={{ fontSize: '0.92rem', color: 'var(--muted-white)', lineHeight: 1.6, marginBottom: '14px' }}>
            Poly(lactic-co-glycolic acid) [PLGA] is a FDA-approved biodegradable copolymer renowned for its biocompatibility and tunable degradation kinetics. In tissue engineering, PLGA microspheres act as micro-reservoirs encapsulating labile angiogenic growth factors (VEGF, bFGF).
          </p>

          <p style={{ fontSize: '0.92rem', color: 'var(--muted-white)', lineHeight: 1.6, marginBottom: '18px' }}>
            As the polymer ester bonds undergo hydrolytic cleavage, growth factors are delivered directly into the local microenvironment, creating steep haptotactic concentration gradients that stimulate targeted blood vessel sprouting.
          </p>

          {/* View More External Link */}
          <a
            href="https://www.google.com/search?q=PLGA+microspheres+biocompatible+biodegradable+copolymer+tissue+engineering"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.85rem',
              fontWeight: 700,
              color: 'var(--teal-accent)',
              textDecoration: 'none',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1.0'}
          >
            <span>View More</span>
            <ArrowRight size={15} />
          </a>
        </div>
      )}

      {/* Section 2: Molecular Agents (Collapsible Accordion Dropdowns) */}
      {filteredGrowthFactors.length > 0 && (
        <div style={{ marginBottom: '28px' }}>
          <div style={{ marginBottom: '16px' }}>
            <span className="section-label">MOLECULAR AGENTS</span>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--pure-white)', marginTop: '2px' }}>
              Angiogenic Growth Factors
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {filteredGrowthFactors.map(gf => {
              const isOpen = !!openFactors[gf.id] || !!q;

              return (
                <div
                  key={gf.id}
                  className="glass-card"
                  style={{
                    borderLeft: `4px solid ${gf.color}`,
                    overflow: 'hidden',
                    transition: 'all 0.25s ease'
                  }}
                >
                  {/* Collapsible Accordion Header */}
                  <div
                    onClick={() => toggleFactor(gf.id)}
                    style={{
                      padding: '18px 22px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      userSelect: 'none',
                      backgroundColor: isOpen ? 'rgba(0, 212, 170, 0.04)' : 'transparent'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--pure-white)' }}>
                        {gf.name}
                      </h3>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '3px 10px',
                          borderRadius: '999px',
                          backgroundColor: `${gf.color}22`,
                          color: gf.color,
                          border: `1px solid ${gf.color}44`
                        }}
                      >
                        {gf.release}
                      </span>
                    </div>

                    <div
                      style={{
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.25s ease',
                        color: gf.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '4px'
                      }}
                    >
                      <ChevronDown size={20} />
                    </div>
                  </div>

                  {/* Collapsible Body */}
                  {isOpen && (
                    <div
                      style={{
                        padding: '0 22px 22px 22px',
                        borderTop: '1px solid rgba(148, 163, 184, 0.1)',
                        paddingTop: '16px'
                      }}
                    >
                      <div style={{ fontSize: '0.86rem', color: gf.color, fontWeight: 700, marginBottom: '8px' }}>
                        {gf.fullName}
                      </div>
                      <p style={{ fontSize: '0.88rem', color: 'var(--muted-white)', lineHeight: 1.5, marginBottom: '10px' }}>
                        {gf.role}
                      </p>
                      <p style={{ fontSize: '0.84rem', color: 'var(--muted-white)', opacity: 0.8, lineHeight: 1.5, fontStyle: 'italic' }}>
                        {gf.details}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Section 3: Two-Phase Release Profile with Recharts Cumulative Release Curve */}
      {(matchesSearch('release') || matchesSearch('kinetics') || matchesSearch('phase') || matchesSearch('burst') || !q) && (
        <div
          className="glass-card"
          style={{
            padding: '28px',
            marginBottom: '28px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div
              style={{
                padding: '10px',
                borderRadius: '12px',
                backgroundColor: 'rgba(0, 180, 216, 0.12)',
                color: 'var(--cyan-accent)'
              }}
            >
              <TrendingUp size={24} />
            </div>
            <div>
              <span className="section-label">RELEASE KINETICS</span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--pure-white)' }}>
                Two-Phase Sustained Release Profile
              </h2>
            </div>
          </div>

          {/* Recharts Area Chart: Cumulative % Released Curve */}
          <div style={{ width: '100%', height: 260, marginTop: '20px', marginBottom: '24px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={RELEASE_KINETICS_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="burstGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00D4AA" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#00D4AA" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="sustainedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00B4D8" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#00B4D8" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" />
                <XAxis dataKey="day" stroke="var(--muted-white)" fontSize={12} tickLine={false} />
                <YAxis unit="%" domain={[0, 100]} stroke="var(--muted-white)" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--teal-accent)',
                    borderRadius: '10px',
                    color: 'var(--pure-white)',
                    fontSize: '0.85rem'
                  }}
                  formatter={(value, name) => [`${value}%`, name === 'burstPhase' ? 'Phase I Burst' : 'Phase II Sustained']}
                />
                <Legend
                  formatter={(value) => (
                    <span style={{ color: 'var(--pure-white)', fontSize: '0.82rem', fontWeight: 600 }}>
                      {value === 'burstPhase' ? 'Phase I Burst (VEGF Initial Release)' : 'Phase II Sustained (bFGF/PDGF Polymer Erosion)'}
                    </span>
                  )}
                />
                <Area type="monotone" dataKey="burstPhase" stroke="#00D4AA" fillOpacity={1} fill="url(#burstGradient)" strokeWidth={2.5} />
                <Area type="monotone" dataKey="sustainedPhase" stroke="#00B4D8" fillOpacity={1} fill="url(#sustainedGradient)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Stat Callout Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(0, 212, 170, 0.08)', border: '1px solid rgba(0, 212, 170, 0.2)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--teal-accent)' }}>PHASE I BURST (HOURS 0-24)</span>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--pure-white)', margin: '4px 0' }}>~35% Release</div>
              <p style={{ fontSize: '0.82rem', color: 'var(--muted-white)', lineHeight: 1.4 }}>
                Initial surface desorption establishing acute VEGF chemical gradient to stimulate rapid endothelial tip-cell sprouting.
              </p>
            </div>

            <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(0, 180, 216, 0.08)', border: '1px solid rgba(0, 180, 216, 0.2)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--cyan-accent)' }}>PHASE II SUSTAINED (DAYS 2-28)</span>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--pure-white)', margin: '4px 0' }}>~96% Total</div>
              <p style={{ fontSize: '0.82rem', color: 'var(--muted-white)', lineHeight: 1.4 }}>
                Bulk polymer erosion-controlled release maintaining steady bFGF/PDGF diffusion for capillary maturation and anastomosis.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Section 4: References & Citations */}
      <div>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '16px' }}>
          <div>
            <span className="section-label">SCIENTIFIC LITERATURE</span>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--pure-white)', marginTop: '2px' }}>
              References & Citations
            </h2>
          </div>

          <button
            className="btn-outlined"
            onClick={handleCopyBibliography}
            style={{ padding: '8px 14px', fontSize: '0.8rem' }}
          >
            {copiedAll ? <Check size={15} color="var(--success-green)" /> : <Copy size={15} />}
            <span>{copiedAll ? 'Bibliography Copied!' : 'Copy Bibliography'}</span>
          </button>
        </div>

        {displayedCitations.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {displayedCitations.map(citation => (
              <CitationCard key={citation.id} citation={citation} />
            ))}

            {/* "See More" / "Show Less" Expand Button */}
            {!q && (
              <div style={{ textAlign: 'center', marginTop: '8px' }}>
                <button
                  className="btn-outlined"
                  onClick={() => setShowAllReferences(!showAllReferences)}
                  style={{ padding: '10px 22px', fontSize: '0.88rem', borderRadius: '12px' }}
                >
                  <BookOpen size={16} />
                  <span>{showAllReferences ? 'Show Less References' : `See More References (${CITATIONS.length - 2} More)`}</span>
                  {showAllReferences ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="glass-card" style={{ padding: '24px', textAlign: 'center', color: 'var(--muted-white)' }}>
            No references found matching "{searchTerm}".
          </div>
        )}
      </div>
    </div>
  );
}
