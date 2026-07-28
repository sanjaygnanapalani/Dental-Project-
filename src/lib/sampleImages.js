/**
 * Generates synthetic biomedical microscopy test images on demand via Canvas.
 */

function createAngiogenesisLumenImage(type = 'lumen') {
  const canvas = document.createElement('canvas');
  canvas.width = 500;
  canvas.height = 500;
  const ctx = canvas.getContext('2d');

  // Background: Deep crimson/red blood vessel lumen tunnel gradient (#4A0A10 to #951C24)
  const bgGrad = ctx.createRadialGradient(250, 250, 15, 250, 250, 240);
  bgGrad.addColorStop(0, '#B82632');
  bgGrad.addColorStop(0.5, '#7A121A');
  bgGrad.addColorStop(1, '#3D060B');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 500, 500);

  // Endothelial wall tissue texture ring
  ctx.strokeStyle = 'rgba(230, 90, 105, 0.4)';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(250, 250, 220, 0, 2 * Math.PI);
  ctx.stroke();

  // Draw Angiogenesis Sprout Nodes & Vessel Tubes
  ctx.strokeStyle = '#D32F2F';
  ctx.fillStyle = '#F472B6';
  ctx.lineCap = 'round';

  const numSprouts = type === 'node' ? 10 : (type === 'sprouting' ? 14 : 5);
  for (let i = 0; i < numSprouts; i++) {
    const angle = (2 * Math.PI / numSprouts) * i + (Math.random() - 0.5) * 0.2;
    const len = 150 + Math.random() * 70;
    const ex = 250 + Math.cos(angle) * len;
    const ey = 250 + Math.sin(angle) * len;

    ctx.lineWidth = 12 + Math.random() * 8;
    ctx.beginPath();
    ctx.moveTo(250, 250);
    ctx.lineTo(ex, ey);
    ctx.stroke();

    // Sprout Branch Node Point
    ctx.beginPath();
    ctx.arc(ex, ey, 8, 0, 2 * Math.PI);
    ctx.fill();
  }

  // Draw Flowing Red Blood Cells (Biconcave Discs)
  const rbcCount = type === 'lumen' ? 24 : 15;
  for (let i = 0; i < rbcCount; i++) {
    const dist = Math.random() * 190;
    const ang = Math.random() * 2 * Math.PI;
    const rx = 250 + Math.cos(ang) * dist;
    const ry = 250 + Math.sin(ang) * dist;
    const rsize = 14 + Math.random() * 10;

    ctx.save();
    ctx.translate(rx, ry);
    ctx.rotate(Math.random() * Math.PI);

    // RBC Outer rim
    ctx.fillStyle = '#E53935';
    ctx.beginPath();
    ctx.ellipse(0, 0, rsize, rsize * 0.6, 0, 0, 2 * Math.PI);
    ctx.fill();

    // RBC Biconcave dimple center
    ctx.fillStyle = '#8E0000';
    ctx.beginPath();
    ctx.ellipse(0, 0, rsize * 0.45, rsize * 0.28, 0, 0, 2 * Math.PI);
    ctx.fill();

    ctx.restore();
  }

  return canvas.toDataURL('image/png');
}

export const SAMPLE_IMAGES = [
  {
    id: 'sample_1',
    title: 'Intraluminal Blood Vessel & Flow',
    subtitle: '3D Vessel Lumen with Erythrocyte Flow',
    dataUrl: createAngiogenesisLumenImage('lumen')
  },
  {
    id: 'sample_2',
    title: 'Angiogenic Sprout Branch Node',
    subtitle: 'Endothelial sprout bifurcation junction',
    dataUrl: createAngiogenesisLumenImage('node')
  },
  {
    id: 'sample_3',
    title: 'Capillary Sprouting Network',
    subtitle: 'Neovascular micro-capillary plexus',
    dataUrl: createAngiogenesisLumenImage('sprouting')
  }
];
