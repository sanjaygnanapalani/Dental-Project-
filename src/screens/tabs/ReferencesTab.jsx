import React, { useState } from 'react';
import CitationCard from '../../components/cards/CitationCard';
import EmptyState from '../../components/common/EmptyState';
import Toast from '../../components/common/Toast';
import { Search, Copy, Check, BookOpen } from 'lucide-react';

const INITIAL_CITATIONS = [
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

export default function ReferencesTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedAll, setCopiedAll] = useState(false);
  const [toast, setToast] = useState(null);

  const filteredCitations = INITIAL_CITATIONS.filter(item => {
    const q = searchTerm.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.authors.toLowerCase().includes(q) ||
      item.journal.toLowerCase().includes(q) ||
      item.id.toLowerCase().includes(q) ||
      item.year.includes(q)
    );
  });

  const handleCopyFullBibliography = () => {
    const fullText = INITIAL_CITATIONS.map(
      c => `[${c.id}] ${c.authors} (${c.year}). "${c.title}". ${c.journal}. https://doi.org/${c.doi}`
    ).join('\n\n');

    navigator.clipboard.writeText(fullText);
    setCopiedAll(true);
    setToast({ message: 'Full bibliography copied to clipboard!', type: 'success' });
    setTimeout(() => setCopiedAll(false), 2500);
  };

  return (
    <div style={{ position: 'relative', minHeight: 'calc(100vh - 134px)', padding: '24px 20px 90px', maxWidth: '960px', margin: '0 auto' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '24px' }}>
        <div>
          <span className="section-label">SCIENTIFIC LITERATURE</span>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#F8FAFC', marginTop: '4px' }}>
            Reference Bibliography
          </h1>
        </div>

        <button
          className="btn-gradient"
          onClick={handleCopyFullBibliography}
          style={{ padding: '10px 18px', fontSize: '0.85rem' }}
        >
          {copiedAll ? <Check size={16} /> : <Copy size={16} />}
          <span>{copiedAll ? 'Bibliography Copied!' : 'Copy Full Bibliography'}</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="glass-card" style={{ padding: '12px 16px', marginBottom: '24px' }}>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search by author, journal, keyword or year..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '40px', background: 'transparent', border: 'none' }}
          />
          <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
        </div>
      </div>

      {/* Citations List */}
      {filteredCitations.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredCitations.map(citation => (
            <CitationCard key={citation.id} citation={citation} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={BookOpen}
          title="No matching scientific records found."
          subtitle={`No citations matched "${searchTerm}". Try searching for terms like "Carmeliet", "Zhang", "scaffold" or "2023".`}
          actionText="Clear Search Filter"
          onAction={() => setSearchTerm('')}
        />
      )}
    </div>
  );
}
