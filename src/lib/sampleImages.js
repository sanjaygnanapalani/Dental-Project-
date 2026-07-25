/**
 * Generates synthetic biomedical microscopy test images on demand via Canvas.
 */

function createSyntheticMicroscopyImage(type = 'dense') {
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 400;
  const ctx = canvas.getContext('2d');

  // Background: dark microscopy substrate with subtle gradient & noise
  const bgGrad = ctx.createRadialGradient(200, 200, 20, 200, 200, 250);
  bgGrad.addColorStop(0, '#EAEFF5');
  bgGrad.addColorStop(0.7, '#CED7E4');
  bgGrad.addColorStop(1, '#9AA9BD');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 400, 400);

  // Add PLGA Microsphere circle outline in background
  ctx.strokeStyle = 'rgba(100, 115, 140, 0.4)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(200, 200, 170, 0, 2 * Math.PI);
  ctx.stroke();

  // Draw vessel structures (Dark branches on bright background)
  ctx.strokeStyle = '#1E293B'; // Dark vessel color
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (type === 'dense') {
    // Main Trunk 1
    drawBranch(ctx, 60, 200, 180, 180, 12, 4);
    drawBranch(ctx, 180, 180, 320, 120, 9, 3);
    drawBranch(ctx, 180, 180, 260, 270, 8, 3);
    drawBranch(ctx, 260, 270, 340, 310, 6, 2);

    // Main Trunk 2
    drawBranch(ctx, 200, 360, 210, 220, 11, 4);
    drawBranch(ctx, 210, 220, 110, 110, 8, 3);
    drawBranch(ctx, 210, 220, 330, 210, 7, 2);
    drawBranch(ctx, 110, 110, 80, 50, 5, 2);

    // Sprouting capillaries
    drawBranch(ctx, 120, 140, 170, 70, 5, 2);
    drawBranch(ctx, 280, 160, 350, 220, 4, 1);
  } else if (type === 'sprouting') {
    // Central sphere with radiating sprouts
    drawBranch(ctx, 200, 200, 120, 100, 10, 3);
    drawBranch(ctx, 200, 200, 280, 90, 10, 3);
    drawBranch(ctx, 200, 200, 310, 260, 10, 3);
    drawBranch(ctx, 200, 200, 100, 290, 10, 3);

    // Fine sprouts
    drawBranch(ctx, 120, 100, 70, 60, 5, 1);
    drawBranch(ctx, 280, 90, 340, 50, 5, 1);
    drawBranch(ctx, 310, 260, 370, 320, 5, 1);
    drawBranch(ctx, 100, 290, 40, 350, 5, 1);
  } else {
    // Interconnected anastomosis network
    const points = [
      { x: 80, y: 80 }, { x: 200, y: 70 }, { x: 320, y: 90 },
      { x: 100, y: 200 }, { x: 220, y: 190 }, { x: 310, y: 220 },
      { x: 70, y: 320 }, { x: 190, y: 330 }, { x: 330, y: 310 }
    ];
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const dist = Math.hypot(points[i].x - points[j].x, points[i].y - points[j].y);
        if (dist < 150) {
          drawBranch(ctx, points[i].x, points[i].y, points[j].x, points[j].y, Math.max(3, 10 - dist / 20), 2);
        }
      }
    }
  }

  // Add realistic noise & blur simulation
  const imgData = ctx.getImageData(0, 0, 400, 400);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 16;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);

  return canvas.toDataURL('image/png');
}

function drawBranch(ctx, x1, y1, x2, y2, startWidth, depth) {
  ctx.lineWidth = startWidth;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  const cx = (x1 + x2) / 2 + (Math.random() - 0.5) * 30;
  const cy = (y1 + y2) / 2 + (Math.random() - 0.5) * 30;
  ctx.quadraticCurveTo(cx, cy, x2, y2);
  ctx.stroke();

  if (depth > 0) {
    const subX = (x1 + x2) / 2;
    const subY = (y1 + y2) / 2;
    const angle = Math.atan2(y2 - y1, x2 - x1) + (Math.random() > 0.5 ? 0.6 : -0.6);
    const len = Math.hypot(y2 - y1, x2 - x1) * 0.6;
    const endX = subX + Math.cos(angle) * len;
    const endY = subY + Math.sin(angle) * len;
    drawBranch(ctx, subX, subY, endX, endY, Math.max(2, startWidth * 0.65), depth - 1);
  }
}

export const SAMPLE_IMAGES = [
  {
    id: 'sample_1',
    title: 'Dense Microvascular Network',
    subtitle: 'PLGA Day 14 VEGF/bFGF delivery',
    dataUrl: createSyntheticMicroscopyImage('dense')
  },
  {
    id: 'sample_2',
    title: 'Vessel Sprouting Tips',
    subtitle: 'Early tip-cell filopodia formation',
    dataUrl: createSyntheticMicroscopyImage('sprouting')
  },
  {
    id: 'sample_3',
    title: 'Anastomotic Network',
    subtitle: 'Interconnected capillary plexus',
    dataUrl: createSyntheticMicroscopyImage('anastomosis')
  }
];
