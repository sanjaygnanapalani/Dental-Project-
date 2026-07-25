import React, { useEffect, useRef } from 'react';

/**
 * Animated Vessel Network Node Graph Canvas Background (Home tab)
 */
export default function VesselNetworkAnimation() {
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

    // ~45 Drifting connected nodes
    const nodeCount = 45;
    const nodes = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 2.5 + 1.5
    }));

    // Signal pulses traveling along connections
    const pulses = [];

    const maxDist = 110;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Move nodes
      nodes.forEach(node => {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;
      });

      // Draw connections & generate pulses
      const connections = [];

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.hypot(dx, dy);

          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.35;
            ctx.strokeStyle = `rgba(0, 212, 170, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();

            connections.push({ from: nodes[i], to: nodes[j], dist });

            // Random pulse spawn
            if (Math.random() < 0.0015 && pulses.length < 12) {
              pulses.push({
                fromX: nodes[i].x,
                fromY: nodes[i].y,
                toX: nodes[j].x,
                toY: nodes[j].y,
                progress: 0,
                speed: 0.015 + Math.random() * 0.01
              });
            }
          }
        }
      }

      // Draw nodes
      nodes.forEach(node => {
        ctx.fillStyle = '#00D4AA';
        ctx.shadowColor = 'rgba(0, 212, 170, 0.6)';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      });

      // Render flowing cyan signal pulses
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        p.progress += p.speed;

        if (p.progress >= 1) {
          pulses.splice(i, 1);
          continue;
        }

        const currX = p.fromX + (p.toX - p.fromX) * p.progress;
        const currY = p.fromY + (p.toY - p.fromY) * p.progress;

        ctx.fillStyle = '#00B4D8';
        ctx.shadowColor = '#00B4D8';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(currX, currY, 3, 0, 2 * Math.PI);
        ctx.fill();
        ctx.shadowBlur = 0;
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
        opacity: 0.65
      }}
    />
  );
}
