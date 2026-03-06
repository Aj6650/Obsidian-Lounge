import React, { useState, useEffect, useRef } from 'react';

export function LightningBolts({ color, intensity = 1 }) {
  const [bolts, setBolts] = useState([]);
  const boltId = useRef(0);
  useEffect(() => {
    const spawnRate = intensity >= 2 ? 1200 : 2000;
    const maxBolts = intensity >= 2 ? 2 : 1;
    const isTier5 = intensity >= 2;
    const spawn = () => {
      const id = boltId.current++;
      const isStretch = isTier5 && Math.random() < 0.25;
      const startSide = Math.random();
      let sx, sy;
      if (startSide < 0.25) { sx = Math.random() * 100; sy = 0; }
      else if (startSide < 0.5) { sx = 100; sy = Math.random() * 100; }
      else if (startSide < 0.75) { sx = Math.random() * 100; sy = 100; }
      else { sx = 0; sy = Math.random() * 100; }
      let tx, ty;
      if (isStretch) {
        if (startSide < 0.25) { tx = Math.random() * 100; ty = 100; }
        else if (startSide < 0.5) { tx = 0; ty = Math.random() * 100; }
        else if (startSide < 0.75) { tx = Math.random() * 100; ty = 0; }
        else { tx = 100; ty = Math.random() * 100; }
      } else {
        tx = 35 + Math.random() * 30;
        ty = 30 + Math.random() * 40;
      }
      const segments = isStretch ? (6 + Math.floor(Math.random() * 4)) : (4 + Math.floor(Math.random() * 4));
      let path = `M${sx.toFixed(1)},${sy.toFixed(1)}`;
      const points = [[sx, sy]];
      for (let i = 1; i <= segments; i++) {
        const progress = i / segments;
        const baseX = sx + (tx - sx) * progress;
        const baseY = sy + (ty - sy) * progress;
        const jagMag = Math.sin(progress * Math.PI) * (10 + Math.random() * 15);
        const jagAngle = (Math.random() - 0.5) * 2;
        const px = baseX + jagAngle * jagMag;
        const py = baseY + (Math.random() - 0.5) * jagMag * 0.5;
        path += ` L${px.toFixed(1)},${py.toFixed(1)}`;
        points.push([px, py]);
      }
      const filaments = [];
      for (let i = 1; i < points.length - 1; i++) {
        if (Math.random() < 0.6) {
          const [px, py] = points[i];
          const angle = Math.random() * Math.PI * 2;
          const len = 4 + Math.random() * 8;
          const mx = px + Math.cos(angle) * len * 0.5 + (Math.random() - 0.5) * 3;
          const my = py + Math.sin(angle) * len * 0.5 + (Math.random() - 0.5) * 3;
          const ex = px + Math.cos(angle) * len;
          const ey = py + Math.sin(angle) * len;
          filaments.push(`M${px.toFixed(1)},${py.toFixed(1)} L${mx.toFixed(1)},${my.toFixed(1)} L${ex.toFixed(1)},${ey.toFixed(1)}`);
        }
      }
      let fork = null;
      if (isTier5 && Math.random() > 0.4) {
        const forkIdx = 1 + Math.floor(Math.random() * (points.length - 2));
        const [fbx, fby] = points[forkIdx];
        const fex = fbx + (Math.random() - 0.5) * 40;
        const fey = fby + (Math.random() - 0.5) * 30;
        fork = `M${fbx.toFixed(1)},${fby.toFixed(1)} L${((fbx + fex) / 2 + (Math.random() - 0.5) * 10).toFixed(1)},${((fby + fey) / 2 + (Math.random() - 0.5) * 8).toFixed(1)} L${fex.toFixed(1)},${fey.toFixed(1)}`;
      }
      const lifetime = 100 + Math.random() * 120;
      setBolts(prev => {
        const next = [...prev, { id, path, fork, filaments, isStretch, lifetime }];
        return next.length > maxBolts ? next.slice(-maxBolts) : next;
      });
      setTimeout(() => {
        setBolts(prev => prev.filter(b => b.id !== id));
      }, lifetime);
    };
    spawn();
    const interval = setInterval(() => {
      if (Math.random() < 0.7) spawn();
    }, spawnRate);
    return () => clearInterval(interval);
  }, [intensity]);
  if (bolts.length === 0) return null;
  const outerW = intensity >= 2 ? 1.6 : 0.8;
  const coreW = intensity >= 2 ? 0.6 : 0.3;
  const tintW = intensity >= 2 ? 0.35 : 0.15;
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none"
      style={{ position:"absolute", inset:0, width:"100%", height:"100%",
        pointerEvents:"none", zIndex:4, overflow:"visible" }}>
      <defs>
        <filter id="boltGlow">
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      {bolts.map(b => (
        <g key={b.id} filter="url(#boltGlow)" style={{ animation:`chipFxFlicker 0.05s steps(2) 1` }}>
          {}
          <path d={b.path} fill="none" stroke={color} strokeWidth={b.isStretch ? outerW * 1.4 : outerW} opacity={0.3}
            strokeLinecap="round" strokeLinejoin="round" />
          {}
          <path d={b.path} fill="none" stroke="#ffffff" strokeWidth={b.isStretch ? coreW * 1.3 : coreW} opacity={0.9}
            strokeLinecap="round" strokeLinejoin="round" />
          {}
          <path d={b.path} fill="none" stroke={color} strokeWidth={tintW} opacity={0.7}
            strokeLinecap="round" strokeLinejoin="round" />
          {}
          {b.filaments && b.filaments.map((f, fi) => (
            <path key={fi} d={f} fill="none" stroke={color} strokeWidth={intensity >= 2 ? 0.3 : 0.15} opacity={intensity >= 2 ? 0.4 : 0.3}
              strokeLinecap="round" strokeLinejoin="round" />
          ))}
          {}
          {b.fork && (
            <>
              <path d={b.fork} fill="none" stroke={color} strokeWidth={outerW * 0.7} opacity={0.25}
                strokeLinecap="round" strokeLinejoin="round" />
              <path d={b.fork} fill="none" stroke="#ffffff" strokeWidth={coreW * 0.6} opacity={0.7}
                strokeLinecap="round" strokeLinejoin="round" />
            </>
          )}
        </g>
      ))}
    </svg>
  );
}
