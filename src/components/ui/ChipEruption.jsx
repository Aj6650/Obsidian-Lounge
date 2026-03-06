import React, { useState, useCallback } from 'react';

export function ChipEruption({ count = 12 }) {
  return (
    <div style={{ position:"fixed", top:0, left:0, right:0, bottom:0, pointerEvents:"none", zIndex:10003, overflow:"hidden" }}>
      {Array.from({length:count}, (_, i) => {
        const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
        const dist = 120 + Math.random() * 200;
        const tx = Math.cos(angle) * dist;
        const ty = Math.sin(angle) * dist - 80;
        const size = 10 + Math.random() * 8;
        const chipColors = ["#c0392b","#2980b9","#27ae60","#8e44ad","#d4af37","#e67e22"];
        return (
          <div key={i} style={{
            position:"absolute", left:"50%", top:"40%",
            width:size, height:size, borderRadius:"50%",
            background:`radial-gradient(circle at 35% 35%, ${chipColors[i % chipColors.length]}, ${chipColors[(i+1) % chipColors.length]})`,
            border:`1.5px solid rgba(255,255,255,0.3)`,
            boxShadow:`0 2px 8px rgba(0,0,0,0.3)`,
            animation:`chipErupt 0.8s ease-out ${i * 0.03}s forwards`,
            transform:`translate(${tx}px, ${ty}px)`,
            opacity:0,
          }}
          ref={el => {
            if (el) {
              el.animate([
                { transform:"translate(0,0) scale(1)", opacity:1 },
                { transform:`translate(${tx}px, ${ty}px) scale(0.3)`, opacity:0 },
              ], { duration:800 + Math.random() * 400, delay:i * 30, easing:"cubic-bezier(0,.7,.3,1)", fill:"forwards" });
            }
          }}
          />
        );
      })}
    </div>
  );
}
export function useChipEruption() {
  const [active, setActive] = useState(false);
  const triggerEruption = useCallback(() => {
    setActive(true);
  }, []);
  const clearEruption = useCallback(() => setActive(false), []);
  return { eruptionActive: active, triggerEruption, clearEruption };
}
