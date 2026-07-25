import React, { useState, useRef } from 'react';
import { processVesselImage } from '../../lib/vesselProcessor';
import { generatePDFReport } from '../../lib/pdfGenerator';
import { saveAnalysisRecord } from '../../lib/db';
import { SAMPLE_IMAGES } from '../../lib/sampleImages';
import { useAuth } from '../../context/AuthContext';
import ResultCanvasCard from '../../components/analyzer/ResultCanvasCard';
import MetricsCharts from '../../components/analyzer/MetricsCharts';
import MetricCard from '../../components/common/MetricCard';
import Toast from '../../components/common/Toast';
import {
  Upload,
  Play,
  FileText,
  Download,
  Save,
  Sliders,
  Sparkles,
  Percent,
  GitBranch,
  Layers,
  Ruler,
  Maximize2,
  CircleDot,
  Grid,
  Activity
} from 'lucide-react';

export default function AnalyzerTab() {
  const { session } = useAuth();

  const [selectedImage, setSelectedImage] = useState(SAMPLE_IMAGES[0].dataUrl);
  const [sensitivity, setSensitivity] = useState(120);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const [toast, setToast] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedImage(event.target.result);
      setResults(null);
    };
    reader.readAsDataURL(file);
  };

  const handleRunAnalysis = async () => {
    if (!selectedImage) return;

    setIsProcessing(true);
    setResults(null);

    // Create Image element
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = selectedImage;

    img.onload = async () => {
      try {
        // Simulate processing step time for smooth shimmer effect
        setTimeout(async () => {
          const res = await processVesselImage(img, sensitivity);
          setResults(res);
          setIsProcessing(false);
          setToast({ message: 'Vessel network analysis completed successfully!', type: 'success' });
        }, 600);
      } catch (err) {
        console.error(err);
        setIsProcessing(false);
        setToast({ message: 'Image processing failed. Try adjusting sensitivity.', type: 'error' });
      }
    };
  };

  const handleExportPDF = () => {
    if (!results) return;
    try {
      generatePDFReport({
        metrics: results.metrics,
        binaryCanvas: results.binaryCanvas,
        skeletonCanvas: results.skeletonCanvas,
        overlayCanvas: results.overlayCanvas,
        researcher: session
      });
      setToast({ message: 'PDF report generated and downloaded!', type: 'success' });
    } catch (err) {
      console.error(err);
      setToast({ message: 'Failed generating PDF report.', type: 'error' });
    }
  };

  const handleSaveOverlayPNG = () => {
    if (!results?.overlayCanvas) return;
    const link = document.createElement('a');
    link.download = `PLGA_Overlay_${Date.now()}.png`;
    link.href = results.overlayCanvas.toDataURL('image/png');
    link.click();
    setToast({ message: 'Overlay PNG saved to downloads!', type: 'success' });
  };

  const handleSaveToDatabase = async () => {
    if (!results?.metrics) return;
    setIsSaving(true);

    try {
      await saveAnalysisRecord({
        researcherEmail: session?.email || 'sanjay@biomed.org',
        researcherName: `${session?.firstName || 'Sanjay'} ${session?.lastName || 'Grs'}`,
        institution: session?.institution || 'Biomedical Institute',
        role: session?.role || 'Researcher',
        vesselDensity: results.metrics.vesselDensity,
        branchPoints: results.metrics.branchPoints,
        vesselSegments: results.metrics.vesselSegments,
        totalLength: results.metrics.totalLength,
        avgWidth: results.metrics.avgWidth,
        endpoints: results.metrics.endpoints,
        lacunarity: results.metrics.lacunarity,
        connectivity: results.metrics.connectivity
      });

      setToast({ message: 'Analysis record saved to local SQLite database!', type: 'success' });
    } catch (err) {
      console.error(err);
      setToast({ message: 'Failed saving record to SQLite database.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ position: 'relative', minHeight: 'calc(100vh - 134px)', padding: '24px 20px 90px', maxWidth: '1100px', margin: '0 auto' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <span className="section-label">BIOMEDICAL MATRIX ANALYZER</span>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#F8FAFC', marginTop: '4px' }}>
          Microvascular Quantification Engine
        </h1>
      </div>

      {/* Top Configuration Card */}
      <div
        className="glass-card"
        style={{
          padding: '24px',
          marginBottom: '28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}
      >
        {/* Presets + Upload Row */}
        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#00D4AA', marginBottom: '10px' }}>
            1. SELECT OR UPLOAD MICROSCOPY IMAGE
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            {/* Custom Upload Target */}
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: '2px dashed rgba(0, 212, 170, 0.4)',
                borderRadius: '12px',
                padding: '16px',
                textAlign: 'center',
                cursor: 'pointer',
                backgroundColor: 'rgba(10, 14, 26, 0.6)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#00D4AA'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(0, 212, 170, 0.4)'}
            >
              <Upload size={24} color="#00D4AA" />
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#F8FAFC' }}>
                Upload Microscopy File
              </span>
              <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>
                PNG, JPG or TIFF
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>

            {/* Sample Image Presets */}
            {SAMPLE_IMAGES.map(sample => (
              <div
                key={sample.id}
                onClick={() => {
                  setSelectedImage(sample.dataUrl);
                  setResults(null);
                }}
                style={{
                  border: selectedImage === sample.dataUrl ? '2px solid #00D4AA' : '1px solid rgba(148, 163, 184, 0.2)',
                  borderRadius: '12px',
                  padding: '10px',
                  cursor: 'pointer',
                  backgroundColor: selectedImage === sample.dataUrl ? 'rgba(0, 212, 170, 0.1)' : 'rgba(10, 14, 26, 0.6)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'all 0.2s ease'
                }}
              >
                <img
                  src={sample.dataUrl}
                  alt={sample.title}
                  style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover' }}
                />
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#F8FAFC', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {sample.title}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#94A3B8' }}>
                    {sample.subtitle}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Image Preview & Sensitivity Slider */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', alignItems: 'center' }}>
          {selectedImage && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <img
                src={selectedImage}
                alt="Selected"
                style={{ width: '90px', height: '90px', borderRadius: '12px', border: '1px solid #00D4AA', objectFit: 'cover' }}
              />
              <div>
                <span style={{ fontSize: '0.72rem', color: '#00D4AA', fontWeight: 700 }}>IMAGE READY FOR MATRIX THINNING</span>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#F8FAFC' }}>Input Microscopy Sample</h4>
                <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Adaptive 31x31 threshold window</span>
              </div>
            </div>
          )}

          {/* Sensitivity Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#00D4AA', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sliders size={15} />
                2. THRESHOLD SENSITIVITY
              </label>
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#00B4D8' }}>
                {sensitivity} / 255
              </span>
            </div>

            <input
              type="range"
              min="20"
              max="220"
              value={sensitivity}
              onChange={e => setSensitivity(Number(e.target.value))}
              style={{
                width: '100%',
                accentColor: '#00D4AA',
                cursor: 'pointer'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#64748B', marginTop: '4px' }}>
              <span>Low Threshold (Coarse)</span>
              <span>High Threshold (Sensitive)</span>
            </div>
          </div>
        </div>

        {/* Process Button */}
        <button
          className="btn-gradient"
          onClick={handleRunAnalysis}
          disabled={isProcessing || !selectedImage}
          style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
        >
          {isProcessing ? (
            <>
              <Sparkles className="spin" size={20} />
              <span>Simulating Matrix Extraction...</span>
            </>
          ) : (
            <>
              <Play size={20} fill="#050B14" />
              <span>Process Image & Compute Metrics</span>
            </>
          )}
        </button>
      </div>

      {/* Loading Skeleton */}
      {isProcessing && (
        <div style={{ marginTop: '32px' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#00D4AA' }}>
              Extracting Digital Vessel Thinning Matrix...
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#94A3B8' }}>
              Running integral adaptive thresholding & Zhang-Suen 2-pass iterative thinning algorithm
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="skeleton-pulse" style={{ height: '90px' }} />
            ))}
          </div>
        </div>
      )}

      {/* Results Section */}
      {results && !isProcessing && (
        <div style={{ marginTop: '10px' }}>
          {/* Canvases Row */}
          <div style={{ marginBottom: '20px' }}>
            <span className="section-label">OUTPUT MATRIX VISUALIZATIONS</span>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#F8FAFC', marginTop: '4px' }}>
              Processed Image Canvases
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '32px' }}>
            <ResultCanvasCard
              title="Binary Mask"
              subtitle="Adaptive 31x31 integral thresholding"
              sourceCanvas={results.binaryCanvas}
              accentColor="#00D4AA"
              legendLabel="Teal = Vessel"
            />
            <ResultCanvasCard
              title="Skeleton Network"
              subtitle="Zhang-Suen iterative digital thinning"
              sourceCanvas={results.skeletonCanvas}
              accentColor="#00B4D8"
              legendLabel="Cyan = Centerline"
            />
            <ResultCanvasCard
              title="Analysis Overlay"
              subtitle="Blended original with branch & endpoints"
              sourceCanvas={results.overlayCanvas}
              accentColor="#F472B6"
              legendLabel="Pink=Branch, Gold=Endpoint"
            />
          </div>

          {/* Interactive Legend Box */}
          <div
            className="glass-card"
            style={{
              padding: '16px 24px',
              marginBottom: '32px',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px'
            }}
          >
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#F8FAFC' }}>
              Overlay Color Legend:
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', fontSize: '0.82rem', fontWeight: 600 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#00D4AA' }} />
                <span style={{ color: '#94A3B8' }}>Teal = Vessel Area</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#00B4D8' }} />
                <span style={{ color: '#94A3B8' }}>Cyan = Skeleton</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#F472B6' }} />
                <span style={{ color: '#94A3B8' }}>Pink = Branch Point</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#FBBF24' }} />
                <span style={{ color: '#94A3B8' }}>Gold = Endpoint</span>
              </div>
            </div>
          </div>

          {/* 2x4 Metric Cards Grid */}
          <div style={{ marginBottom: '20px' }}>
            <span className="section-label">QUANTITATIVE ANGIOGENESIS METRICS</span>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#F8FAFC', marginTop: '4px' }}>
              Computed Microvascular Metrics
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '32px' }}>
            <MetricCard title="VESSEL DENSITY" value={results.metrics.vesselDensity} unit="%" icon={Percent} color="#00D4AA" description="Foreground pixel coverage" />
            <MetricCard title="BRANCH POINTS" value={results.metrics.branchPoints} unit="pts" icon={GitBranch} color="#F472B6" description="N-neighbor nodes (≥3)" />
            <MetricCard title="VESSEL SEGMENTS" value={results.metrics.vesselSegments} unit="seg" icon={Layers} color="#00B4D8" description="Distinct connected paths" />
            <MetricCard title="TOTAL LENGTH" value={results.metrics.totalLength} unit="px" icon={Ruler} color="#FBBF24" description="Centerline pixel count" />
            <MetricCard title="AVG VESSEL WIDTH" value={results.metrics.avgWidth} unit="px" icon={Maximize2} color="#10B981" description="Density / Total Length" />
            <MetricCard title="ENDPOINTS" value={results.metrics.endpoints} unit="pts" icon={CircleDot} color="#F59E0B" description="Free terminal vessel tips" />
            <MetricCard title="LACUNARITY INDEX" value={results.metrics.lacunarity} unit="idx" icon={Grid} color="#00B4D8" description="Gaps heterogeneity (32x32)" />
            <MetricCard title="CONNECTIVITY" value={results.metrics.connectivity} unit="%" icon={Activity} color="#00D4AA" description="Branches per segment ratio" />
          </div>

          {/* Recharts Data Visualization */}
          <MetricsCharts metrics={results.metrics} />

          {/* Action Buttons Row */}
          <div
            style={{
              marginTop: '36px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '14px',
              justifyContent: 'center'
            }}
          >
            <button className="btn-gradient" onClick={handleExportPDF} style={{ padding: '12px 24px' }}>
              <FileText size={18} />
              <span>Export PDF Report</span>
            </button>

            <button className="btn-outlined" onClick={handleSaveOverlayPNG} style={{ padding: '12px 24px' }}>
              <Download size={18} />
              <span>Save Overlay PNG</span>
            </button>

            <button
              className="btn-outlined"
              onClick={handleSaveToDatabase}
              disabled={isSaving}
              style={{
                borderColor: '#10B981',
                color: '#10B981',
                padding: '12px 24px'
              }}
            >
              <Save size={18} />
              <span>{isSaving ? 'Saving to SQLite...' : 'Save Analysis to DB'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
