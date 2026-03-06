import React, { useEffect, useRef } from 'react';

export function AmbientParticles({ config }) {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const frameRef = useRef(null);
  useEffect(() => {
    if (!config) return;
    const tier = config.tier || 3;
    const sizeMin = tier >= 5 ? 3 : tier >= 4 ? 2.5 : 2;
    const sizeRange = tier >= 5 ? 6 : tier >= 4 ? 5 : 4;
    const opMin = tier >= 5 ? 0.3 : tier >= 4 ? 0.22 : 0.15;
    const opRange = tier >= 5 ? 0.5 : tier >= 4 ? 0.4 : 0.3;
    particlesRef.current = Array.from({ length: config.count }, (_, i) => ({
      x: Math.random(), y: Math.random(),
      size: sizeMin + Math.random() * sizeRange,
      baseOp: opMin + Math.random() * opRange,
      speed: (0.3 + Math.random() * 0.7) * config.speed,
      drift: (Math.random() - 0.5) * 0.003,
      phase: Math.random() * Math.PI * 2,
      flickerFreq: 0.002 + Math.random() * (tier >= 5 ? 0.006 : tier >= 4 ? 0.004 : 0.002),
      flickerAmp: tier >= 5 ? 0.5 + Math.random() * 0.4 : tier >= 4 ? 0.35 + Math.random() * 0.3 : 0.2 + Math.random() * 0.2,
    }));
    const hexToRgb = (hex) => {
      const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
      return [r, g, b];
    };
    const rgb = hexToRgb(config.color);
    const isRainbow = config.type === "rainbow";
    const isSmoke = config.type === "smoke";
    const isSpark = config.type === "sparks";
    const isCoin = config.type === "coins";
    const isGoldEnergy = config.type === "goldenergy";
    const isBubble = config.type === "bubbles";
    const hasglow = tier >= 4;
    let lastTime = performance.now();
    const animate = (time) => {
      const canvas = canvasRef.current;
      if (!canvas) { frameRef.current = requestAnimationFrame(animate); return; }
      const ctx = canvas.getContext("2d");
      const w = canvas.width, h = canvas.height;
      const dt = (time - lastTime) / 1000;
      lastTime = time;
      ctx.clearRect(0, 0, w, h);
      for (const p of particlesRef.current) {
        p.y -= p.speed * dt * 0.015;
        p.x += p.drift + Math.sin(p.phase + time * 0.001) * 0.0015;
        if (p.y < -0.05) { p.y = 1.05; p.x = Math.random(); }
        if (p.x < -0.05) p.x = 1.05;
        if (p.x > 1.05) p.x = -0.05;
        const px = p.x * w, py = p.y * h;
        const flicker = 1 + Math.sin(p.phase + time * p.flickerFreq) * p.flickerAmp;
        const op = Math.min(1, p.baseOp * flicker);
        if (isRainbow) {
          const hue = (p.phase * 57.3 + time * 0.06) % 360;
          const lightness = 55 + flicker * 15;
          const col = `hsla(${hue},100%,${lightness}%,${op * 0.75})`;
          if (hasglow) {
            ctx.shadowColor = `hsl(${hue},100%,${lightness}%)`;
            ctx.shadowBlur = p.size * (tier >= 5 ? 4 : 2);
          }
          ctx.beginPath();
          ctx.arc(px, py, p.size * 0.5, 0, Math.PI * 2);
          ctx.fillStyle = col;
          ctx.fill();
          ctx.shadowBlur = 0;
        } else if (isSmoke) {
          const r = p.size * (tier >= 5 ? 2 : tier >= 4 ? 1.6 : 1.2);
          ctx.beginPath();
          ctx.arc(px, py, r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${op * 0.25})`;
          ctx.fill();
        } else if (isSpark) {
          ctx.save();
          ctx.translate(px, py);
          ctx.rotate(p.drift * 120 * Math.PI / 180);
          if (hasglow) { ctx.shadowColor = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.8)`; ctx.shadowBlur = p.size * (tier >= 5 ? 4 : 2); }
          ctx.fillStyle = `rgba(255,255,255,${op})`;
          ctx.fillRect(-p.size * 0.15, -p.size * 0.6, p.size * 0.3, p.size * 1.2);
          ctx.shadowBlur = 0;
          ctx.restore();
        } else if (isCoin) {
          ctx.save();
          ctx.translate(px, py);
          const coinRot = p.drift * 180 * Math.PI / 180 + time * 0.001 * p.speed;
          ctx.rotate(coinRot);
          const trailGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size * 1.5);
          trailGrad.addColorStop(0, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${op * 0.3})`);
          trailGrad.addColorStop(0.5, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${op * 0.08})`);
          trailGrad.addColorStop(1, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0)`);
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 1.5, 0, Math.PI * 2);
          ctx.fillStyle = trailGrad;
          ctx.fill();
          if (hasglow) { ctx.shadowColor = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.8)`; ctx.shadowBlur = p.size * (tier >= 5 ? 4 : 2); }
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size * 0.5, p.size * 0.3, 0, 0, Math.PI * 2);
          const coinGrad = ctx.createLinearGradient(-p.size * 0.4, -p.size * 0.2, p.size * 0.4, p.size * 0.2);
          coinGrad.addColorStop(0, `rgba(255,248,200,${op * 0.9})`);
          coinGrad.addColorStop(0.5, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${op * 0.85})`);
          coinGrad.addColorStop(1, `rgba(${Math.floor(rgb[0]*0.7)},${Math.floor(rgb[1]*0.6)},${Math.floor(rgb[2]*0.3)},${op * 0.9})`);
          ctx.fillStyle = coinGrad;
          ctx.fill();
          ctx.beginPath();
          ctx.ellipse(-p.size * 0.1, -p.size * 0.06, p.size * 0.2, p.size * 0.12, 0, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${op * 0.35})`;
          ctx.fill();
          if (p.size > 5) {
            ctx.shadowBlur = 0;
            ctx.font = `bold ${Math.round(p.size * 0.35)}px Georgia`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = `rgba(180,140,0,${op * 0.7})`;
            ctx.fillText("$", 0, 1);
          }
          ctx.shadowBlur = 0;
          ctx.restore();
        } else if (isGoldEnergy) {
          ctx.save();
          ctx.translate(px, py);
          const pulse = 0.7 + Math.sin(p.phase + time * 0.003) * 0.3;
          const orbSize = p.size * 0.6 * pulse;
          const trailLen = p.size * 3;
          const trailGrad = ctx.createLinearGradient(0, 0, 0, trailLen);
          trailGrad.addColorStop(0, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${op * 0.25})`);
          trailGrad.addColorStop(0.4, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${op * 0.08})`);
          trailGrad.addColorStop(1, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0)`);
          ctx.fillStyle = trailGrad;
          ctx.fillRect(-orbSize * 0.4, 0, orbSize * 0.8, trailLen);
          const haloGrad = ctx.createRadialGradient(0, 0, orbSize * 0.3, 0, 0, orbSize * 2.5);
          haloGrad.addColorStop(0, `rgba(255,248,200,${op * 0.15 * pulse})`);
          haloGrad.addColorStop(0.3, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${op * 0.1 * pulse})`);
          haloGrad.addColorStop(1, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0)`);
          ctx.beginPath();
          ctx.arc(0, 0, orbSize * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = haloGrad;
          ctx.fill();
          ctx.shadowColor = `rgba(255,230,100,0.9)`;
          ctx.shadowBlur = orbSize * 4;
          const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, orbSize);
          coreGrad.addColorStop(0, `rgba(255,255,230,${op * 0.95})`);
          coreGrad.addColorStop(0.35, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${op * 0.8})`);
          coreGrad.addColorStop(0.7, `rgba(${rgb[0]},${rgb[1]},${Math.floor(rgb[2] * 0.5)},${op * 0.5})`);
          coreGrad.addColorStop(1, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0)`);
          ctx.beginPath();
          ctx.arc(0, 0, orbSize, 0, Math.PI * 2);
          ctx.fillStyle = coreGrad;
          ctx.fill();
          if (Math.sin(p.phase + time * 0.005) > 0.7) {
            const sparkAngle = (p.phase * 3 + time * 0.002) % (Math.PI * 2);
            const sparkDist = orbSize * (1.2 + Math.random());
            const sx = Math.cos(sparkAngle) * sparkDist;
            const sy = Math.sin(sparkAngle) * sparkDist;
            ctx.beginPath();
            ctx.arc(sx, sy, orbSize * 0.15, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,255,200,${op * 0.6})`;
            ctx.fill();
          }
          ctx.shadowBlur = 0;
          ctx.restore();
        } else if (isBubble) {
          if (hasglow) { ctx.shadowColor = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.5)`; ctx.shadowBlur = p.size * (tier >= 5 ? 3 : 1.5); }
          ctx.beginPath();
          ctx.arc(px, py, p.size * 0.55, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${op * 0.7})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
          if (tier >= 4) {
            ctx.beginPath();
            ctx.arc(px, py, p.size * 0.2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${op * 0.3})`;
            ctx.fill();
          }
          ctx.shadowBlur = 0;
        } else {
          if (hasglow) { ctx.shadowColor = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.6)`; ctx.shadowBlur = p.size * (tier >= 5 ? 4 : 2); }
          ctx.beginPath();
          const r = p.size * (config.type === "stars" ? 0.3 : 0.4);
          ctx.arc(px, py, r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${op * 0.8})`;
          ctx.fill();
          if (config.type === "stars") {
            ctx.strokeStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${op * 0.5})`;
            ctx.lineWidth = 0.4;
            ctx.beginPath(); ctx.moveTo(px - p.size * 0.6, py); ctx.lineTo(px + p.size * 0.6, py); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(px, py - p.size * 0.6); ctx.lineTo(px, py + p.size * 0.6); ctx.stroke();
            if (tier >= 4) {
              ctx.lineWidth = 0.25;
              ctx.beginPath(); ctx.moveTo(px - p.size * 0.4, py - p.size * 0.4); ctx.lineTo(px + p.size * 0.4, py + p.size * 0.4); ctx.stroke();
              ctx.beginPath(); ctx.moveTo(px + p.size * 0.4, py - p.size * 0.4); ctx.lineTo(px - p.size * 0.4, py + p.size * 0.4); ctx.stroke();
            }
          }
          ctx.shadowBlur = 0;
        }
      }
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [config?.type, config?.count, config?.speed, config?.tier]);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);
  if (!config) return null;
  return <canvas ref={canvasRef} style={{ position:"fixed", inset:0, width:"100%", height:"100%", pointerEvents:"none", zIndex:0 }} />;
}
