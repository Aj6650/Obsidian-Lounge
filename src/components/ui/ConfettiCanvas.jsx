import React, { useState, useCallback, useEffect, useRef } from 'react';

export function ConfettiCanvas({ type = "confetti" }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const particles = [];
    const colors = type === "fireworks"
      ? ["#ff6b6b","#f1c40f","#22c55e","#3b82f6","#ec4899","#a855f7","#ff4500","#ffd700","#fff"]
      : ["#f1c40f","#d4af37","#ffd700","#22c55e","#3b82f6","#ec4899","#e74c3c","#fff"];
    const spawnBurst = () => {
      const isMobileConf = window.innerWidth < 480;
      const count = isMobileConf ? (type === "fireworks" ? 25 : 18) : (type === "fireworks" ? 60 : 40);
      const cx = canvas.width * (0.2 + Math.random() * 0.6);
      const cy = canvas.height * (0.15 + Math.random() * 0.35);
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = type === "fireworks" ? (4 + Math.random() * 12) : (2 + Math.random() * 6);
        particles.push({
          x: cx + (Math.random() - 0.5) * 60,
          y: cy + (Math.random() - 0.5) * 40,
          vx: Math.cos(angle) * speed * (type === "fireworks" ? 1.5 : 1),
          vy: Math.sin(angle) * speed - (type === "fireworks" ? 4 : 2),
          size: type === "fireworks" ? (2 + Math.random() * 4) : (3 + Math.random() * 5),
          color: colors[Math.floor(Math.random() * colors.length)],
          gravity: 0.06 + Math.random() * 0.06,
          friction: 0.985,
          rotation: Math.random() * 360,
          rotSpeed: (Math.random() - 0.5) * 12,
          shape: Math.random() > 0.4 ? "rect" : "circle",
          trail: type === "fireworks" ? [] : null,
        });
      }
    };
    spawnBurst();
    const burstInterval = setInterval(spawnBurst, type === "fireworks" ? 800 : 1200);
    let running = true;
    const animate = () => {
      if (!running) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = particles.length - 1; i >= 0; i--) {
        if (particles[i].y > canvas.height + 40 || particles[i].x < -40 || particles[i].x > canvas.width + 40) {
          particles.splice(i, 1);
        }
      }
      for (const p of particles) {
        p.vy += p.gravity;
        p.vx *= p.friction;
        p.vy *= p.friction;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotSpeed;
        const screenRatio = Math.min(1, Math.max(0.3, 1 - (p.y / canvas.height) * 0.4));
        if (p.trail) {
          p.trail.push({ x: p.x, y: p.y, alpha: screenRatio });
          if (p.trail.length > 5) p.trail.shift();
          for (const t of p.trail) {
            ctx.globalAlpha = t.alpha * 0.3;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(t.x, t.y, p.size * 0.4, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.globalAlpha = screenRatio;
        ctx.fillStyle = p.color;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation * Math.PI / 180);
        if (p.shape === "rect") {
          ctx.fillRect(-p.size/2, -p.size/4, p.size, p.size/2);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        if (type === "fireworks" && screenRatio > 0.6) {
          ctx.globalAlpha = screenRatio * 0.3;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 15;
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
        ctx.restore();
      }
      ctx.globalAlpha = 1;
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => { running = false; clearInterval(burstInterval); cancelAnimationFrame(animRef.current); };
  }, [type]);
  return (
    <canvas ref={canvasRef} style={{
      position:"fixed", top:0, left:0, width:"100%", height:"100%",
      pointerEvents:"none", zIndex:10004,
    }} />
  );
}
export function useConfetti() {
  const [confetti, setConfetti] = useState(null);
  const triggerConfetti = useCallback((type = "confetti") => {
    setConfetti({ type, key: Date.now() });
  }, []);
  const clearConfetti = useCallback(() => setConfetti(null), []);
  return { confetti, triggerConfetti, clearConfetti };
}
