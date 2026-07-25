import { jsPDF } from 'jspdf';

/**
 * PDF Report Generator for PLGA Microvascular Analysis Results
 */
export function generatePDFReport({ metrics, binaryCanvas, skeletonCanvas, overlayCanvas, researcher }) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Dark header block
  doc.setFillColor(15, 23, 42); // #0F172A
  doc.rect(0, 0, pageWidth, 32, 'F');

  // Teal header line
  doc.setFillColor(0, 212, 170); // #00D4AA
  doc.rect(0, 32, pageWidth, 1.5, 'F');

  // Title
  doc.setTextColor(0, 212, 170);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('PLGA Vascularization Analyzer', 14, 15);

  doc.setTextColor(248, 250, 252);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Biomedical Microvascular Quantification Report', 14, 23);

  // Metadata box (Right side)
  const timestamp = new Date().toLocaleString();
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(`Researcher: ${researcher?.firstName || 'Sanjay'} ${researcher?.lastName || 'Grs'}`, pageWidth - 14, 12, { align: 'right' });
  doc.text(`Institution: ${researcher?.institution || 'Biomedical Institute'}`, pageWidth - 14, 17, { align: 'right' });
  doc.text(`Role: ${researcher?.role || 'Researcher'}`, pageWidth - 14, 22, { align: 'right' });
  doc.text(`Date: ${timestamp}`, pageWidth - 14, 27, { align: 'right' });

  // Section 1: Executive Metrics Summary Header
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Microvascular Metric Quantification', 14, 42);

  // Metrics Table (2 Columns x 4 Rows)
  const tableTop = 47;
  const colWidth = 88;
  const rowHeight = 9;

  const metricItems = [
    { label: 'Vessel Density', val: `${metrics.vesselDensity}%` },
    { label: 'Branch Points', val: `${metrics.branchPoints}` },
    { label: 'Vessel Segments', val: `${metrics.vesselSegments}` },
    { label: 'Total Length', val: `${metrics.totalLength} px` },
    { label: 'Avg Vessel Width', val: `${metrics.avgWidth} px` },
    { label: 'Endpoints', val: `${metrics.endpoints}` },
    { label: 'Lacunarity Index', val: `${metrics.lacunarity}` },
    { label: 'Connectivity', val: `${metrics.connectivity}%` }
  ];

  doc.setFontSize(9);
  metricItems.forEach((m, idx) => {
    const isCol2 = idx >= 4;
    const colIdx = idx % 4;
    const x = isCol2 ? 14 + colWidth + 6 : 14;
    const y = tableTop + colIdx * rowHeight;

    // Row Background (Alternating)
    if (colIdx % 2 === 0) {
      doc.setFillColor(241, 245, 249);
      doc.rect(x, y, colWidth, rowHeight - 1, 'F');
    } else {
      doc.setFillColor(255, 255, 255);
      doc.rect(x, y, colWidth, rowHeight - 1, 'F');
    }

    // Label
    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'normal');
    doc.text(m.label, x + 4, y + 5.5);

    // Value
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text(m.val, x + colWidth - 4, y + 5.5, { align: 'right' });
  });

  // Section 2: Side-by-Side Canvases
  const imagesTop = 92;
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Matrix Processing Outputs', 14, imagesTop);

  const imgWidth = 56;
  const imgHeight = 56;
  const gap = 6;

  // Convert Canvases to Data URLs
  const binaryDataUrl = binaryCanvas.toDataURL('image/png');
  const skeletonDataUrl = skeletonCanvas.toDataURL('image/png');
  const overlayDataUrl = overlayCanvas.toDataURL('image/png');

  // Image 1: Binary Mask
  doc.setDrawColor(0, 212, 170);
  doc.setLineWidth(0.5);
  doc.rect(14, imagesTop + 4, imgWidth, imgHeight);
  doc.addImage(binaryDataUrl, 'PNG', 14, imagesTop + 4, imgWidth, imgHeight);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 150, 120);
  doc.text('1. Binary Mask (Adaptive)', 14 + imgWidth / 2, imagesTop + imgHeight + 9, { align: 'center' });

  // Image 2: Skeleton Network
  const x2 = 14 + imgWidth + gap;
  doc.rect(x2, imagesTop + 4, imgWidth, imgHeight);
  doc.addImage(skeletonDataUrl, 'PNG', x2, imagesTop + 4, imgWidth, imgHeight);
  doc.setTextColor(0, 140, 180);
  doc.text('2. Skeleton Centerlines', x2 + imgWidth / 2, imagesTop + imgHeight + 9, { align: 'center' });

  // Image 3: Overlay Network
  const x3 = x2 + imgWidth + gap;
  doc.rect(x3, imagesTop + 4, imgWidth, imgHeight);
  doc.addImage(overlayDataUrl, 'PNG', x3, imagesTop + 4, imgWidth, imgHeight);
  doc.setTextColor(220, 100, 150);
  doc.text('3. Analysis Overlay', x3 + imgWidth / 2, imagesTop + imgHeight + 9, { align: 'center' });

  // Legend box below images
  const legendTop = imagesTop + imgHeight + 15;
  doc.setFillColor(248, 250, 252);
  doc.rect(14, legendTop, pageWidth - 28, 14, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(14, legendTop, pageWidth - 28, 14, 'S');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Overlay Legend:', 18, legendTop + 8.5);

  // Teal box
  doc.setFillColor(0, 212, 170);
  doc.rect(50, legendTop + 5, 4, 4, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Vessels', 56, legendTop + 8.5);

  // Cyan box
  doc.setFillColor(0, 180, 216);
  doc.rect(80, legendTop + 5, 4, 4, 'F');
  doc.text('Skeleton', 86, legendTop + 8.5);

  // Pink circle
  doc.setFillColor(244, 114, 182);
  doc.circle(115, legendTop + 7, 2, 'F');
  doc.text('Branch Point', 119, legendTop + 8.5);

  // Gold circle
  doc.setFillColor(251, 191, 36);
  doc.circle(155, legendTop + 7, 2, 'F');
  doc.text('Endpoint', 159, legendTop + 8.5);

  // Footer Disclaimer
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'italic');
  doc.text(
    'Generative microvascular stats derived from local Zhang-Suen digital matrix thinning.',
    pageWidth / 2,
    pageHeight - 10,
    { align: 'center' }
  );

  // Save PDF
  doc.save(`PLGA_Vascular_Report_${Date.now()}.pdf`);
}
