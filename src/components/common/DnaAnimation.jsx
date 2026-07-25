import React, { useEffect, useRef } from 'react';

/**
 * Animated DNA Double Helix + Floating Particle Canvas Background
 */
export default function DnaAnimation({ blur = false, opacity = 1 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // 60 Drifting Background Particles
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2 + 1,
      speedY: Math.random() * 0.4 + 0.1,
      speedX: (Math.random() - 0.5) * 0.2,
      opacity: Math.random() * 0.5 + 0.2
    }));

    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render Drifting Particles
      particles.forEach(p => {
        p.y -= p.speedY;
        p.x += p.speedX;

        if (p.y < 0) p.y = height;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        ctx.fillStyle = `rgba(0, 212, 170, ${p.opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI);
        ctx.fill();
      });

      // Render DNA Double Helix on Right Side / Center
      const dnaX = width > 768 ? width * 0.75 : width * 0.5;
      const strandGap = 70;
      const frequency = 0.015;
      const speed = 0.025;
      const pointsCount = Math.floor(height / 14);

      phase += speed;

      for (let i = 0; i < pointsCount; i++) {
        const y = i * 14;
        const sinVal = Math.sin(y * frequency + phase);

        const x1 = dnaX + sinVal * strandGap;
        const x2 = dnaX - sinVal * strandGap;

        // Base pair connecting rung (pink accent)
        const rungOpacity = (sinVal + 1.2) / 2.4;
        ctx.strokeStyle = `rgba(244, 114, 182, ${Math.max(0.15, rungOpacity * 0.45)})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x1, y);
        ctx.lineTo(x2, y);
        ctx.stroke();

        // Base pair node dots
        ctx.fillStyle = `rgba(244, 114, 182, ${Math.max(0.3, rungOpacity)})`;
        ctx.beginPath();
        ctx.arc((x1 + x2) / 2, y, 2.5, 0, 2 * Math.PI);
        ctx.fill();

        // Strand 1 Node (Teal)
        const s1Z = Math.cos(y * frequency + phase);
        const s1Radius = 3 + s1Z * 1.5;
        ctx.fillStyle = s1Z > 0 ? '#00D4AA' : 'rgba(0, 212, 170, 0.4)';
        ctx.beginPath();
        ctx.arc(x1, y, Math.max(1.5, s1Radius), 0, 2 * Math.PI);
        ctx.fill();

        // Strand 2 Node (Cyan)
        const s2Z = -s1Z;
        const s2Radius = 3 + s2Z * 1.5;
        ctx.fillStyle = s2Z > 0 ? '#00B4D8' : 'rgba(0, 180, 216, 0.4)';
        ctx.beginPath();
        ctx.arc(x2, y, Math.max(1.5, s2Radius), 0, 2 * Math.PI);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
        filter: blur ? 'blur(10px) brightness(0.6)' : 'none',
        opacity: opacity
      }}
    />
  );
}
