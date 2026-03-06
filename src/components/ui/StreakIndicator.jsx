import React from 'react';
import { T } from '../../constants/styles.js';

export function StreakIndicator({ streak }) {
  if (streak < 2) return null;
  const intensity = Math.min(streak, 15);
  const fireSize = 14 + intensity * 1.5;
  const glowColor = streak >= 10 ? "#ff4500" : streak >= 5 ? "#ff6b00" : "#ff9500";
  const fireCount = streak >= 10 ? 5 : streak >= 5 ? 3 : 0;
  return (
    <div className={streak >= 10 ? "anim-streak-glow-fast" : streak >= 5 ? "anim-streak-glow-slow" : ""} style={{
      display:"flex", alignItems:"center", gap:4, position:"relative",
      padding:"3px 10px 3px 6px", borderRadius:16,
      background:`rgba(255,${Math.max(50, 150 - intensity * 10)},0,${0.08 + intensity * 0.02})`,
      border: streak >= 10
        ? `2px solid rgba(255,69,0,0.6)`
        : streak >= 5
        ? `1.5px solid rgba(255,107,0,0.5)`
        : `1px solid rgba(255,${150 - intensity * 10},0,0.3)`,
      boxShadow: streak >= 10
        ? "0 0 16px rgba(255,69,0,0.4), 0 0 32px rgba(255,69,0,0.15)"
        : streak >= 5
        ? "0 0 10px rgba(255,107,0,0.3)"
        : "none",
    }}>
      {}
      {Array.from({length:fireCount}, (_, i) => (
        <div key={i} style={{
          position:"absolute",
          left: `${20 + Math.random() * 60}%`,
          top: -4,
          width: 3 + Math.random() * 3,
          height: 6 + Math.random() * 6,
          borderRadius:"50% 50% 50% 50% / 60% 60% 40% 40%",
          background: `radial-gradient(circle, ${i % 2 === 0 ? "#ffd700" : "#ff4500"}, transparent)`,
          animation:`fireParticle ${0.5 + Math.random() * 0.5}s ease-out ${Math.random() * 0.5}s infinite`,
          opacity:0.7,
        }} />
      ))}
      <span className={streak >= 10 ? "anim-fire-fast" : "anim-fire-slow"} style={{
        fontSize:fireSize, lineHeight:1,
        filter: `drop-shadow(0 0 ${intensity * 1.5}px ${glowColor})`,
      }}>▲</span>
      <span style={{
        fontSize: streak >= 10 ? 15 : 12, fontWeight:900, fontFamily:T.mono,
        color:glowColor, letterSpacing:1,
        textShadow: streak >= 10 ? `0 0 10px ${glowColor}` : "none",
      }}>{streak}</span>
    </div>
  );
}
