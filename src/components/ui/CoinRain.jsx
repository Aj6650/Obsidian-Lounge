import React, { useState, useCallback, useMemo } from 'react';

export function CoinRain({ intensity = "light" }) {
  const isMobileP = typeof window !== "undefined" && window.innerWidth < 480;
  const baseCount = intensity === "extra_heavy" ? 60 : intensity === "heavy" ? 30 : intensity === "medium" ? 16 : 8;
  const count = isMobileP ? Math.ceil(baseCount * 0.5) : baseCount;
  const maxDuration = intensity === "extra_heavy" ? 2.5 : 1.5;
  const coins = useMemo(() => Array.from({length:count}, (_, i) => ({
    size: intensity === "extra_heavy" ? (10 + Math.random() * 14) : (8 + Math.random() * 10),
    left: Math.random() * 100,
    delay: Math.random() * (intensity === "extra_heavy" ? 1.5 : 0.8),
    duration: 1.2 + Math.random() * maxDuration,
  })), [count, intensity, maxDuration]);
  return (
    <div style={{ position:"fixed", top:0, left:0, right:0, bottom:0, pointerEvents:"none", zIndex:10003, overflow:"hidden" }}>
      {coins.map((coin, i) => (
          <div key={i} className="anim-coin-rain" style={{
            position:"absolute", left:`${coin.left}%`, top:-20,
            width:coin.size, height:coin.size, borderRadius:"50%",
            background:`radial-gradient(circle at 35% 35%, #ffd700, #b8860b)`,
            border:"1px solid rgba(255,215,0,0.5)",
            boxShadow: intensity === "extra_heavy"
              ? "0 0 10px rgba(255,215,0,0.6), 0 0 20px rgba(255,215,0,0.2)"
              : "0 0 6px rgba(255,215,0,0.4), inset 0 -2px 4px rgba(0,0,0,0.2)",
            animationDuration:`${coin.duration}s`,
            animationDelay:`${coin.delay}s`,
            opacity:0.9,
          }} />
      ))}
    </div>
  );
}
export function useCoinRain() {
  const [active, setActive] = useState(null);
  const triggerCoins = useCallback((intensity = "light") => {
    setActive(intensity);
  }, []);
  const clearCoins = useCallback(() => setActive(null), []);
  return { coinRainActive: active, triggerCoins, clearCoins };
}
