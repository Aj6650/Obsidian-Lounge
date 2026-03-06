import React from 'react';

export function ChipSkinEffect({ effect, accent }) {
  if (!effect) return null;
  const effects = {
    subtleglow: { tier:1, shadow:`0 0 8px ${accent}25, 0 0 16px ${accent}10` },
    mist: { tier:1, shadow:`0 0 10px ${accent}30, 0 0 20px ${accent}12` },
    neonpulse: { tier:2, shadow:`0 0 14px #ff149350, 0 0 28px #00e5ff25, 0 0 40px #bf00ff12` },
    frost: { tier:2, shadow:`0 0 14px ${accent}45, 0 0 28px #e0f0ff20, 0 0 40px ${accent}10` },
    greenflame: { tier:2, shadow:`0 0 16px ${accent}50, 0 0 30px #ff6b3525, 0 0 42px ${accent}12` },
    smoke: { tier:3, shadow:`0 0 24px ${accent}60, 0 0 48px #0f0f2035, 0 0 72px ${accent}18, 0 0 96px ${accent}08` },
    stars: { tier:3, shadow:`0 0 24px ${accent}60, 0 0 48px #1e1b4b35, 0 0 72px ${accent}20, 0 0 96px ${accent}08` },
    radiance: { tier:3, shadow:`0 0 24px ${accent}55, 0 0 48px ${accent}28, 0 0 72px ${accent}14, 0 0 96px ${accent}06` },
    lightning: { tier:4, shadow:`0 0 28px ${accent}75, 0 0 52px ${accent}40, 0 0 80px ${accent}20, 0 0 110px ${accent}08`, fc:accent },
    prismatic: { tier:4, shadow:`0 0 28px rgba(200,180,255,0.55), 0 0 52px rgba(180,200,255,0.3), 0 0 80px rgba(220,180,255,0.15), 0 0 110px rgba(200,180,255,0.06)`, fc:"#c8b0ff" },
    ember: { tier:4, shadow:`0 0 30px ${accent}70, 0 0 56px #ff450040, 0 0 84px #ff000018, 0 0 110px ${accent}06`, fc:"#ff4500" },
    toxic: { tier:4, shadow:`0 0 28px ${accent}65, 0 0 52px #bf00ff30, 0 0 80px ${accent}15, 0 0 110px #bf00ff06`, fc:"#39ff14" },
    royalflame: { tier:4, shadow:`0 0 30px ${accent}75, 0 0 56px #ffd70035, 0 0 84px ${accent}18, 0 0 110px #ffd70008`, fc:"#ff6a00" },
    goldstorm: { tier:5, shadow:`0 0 34px #ffd70080, 0 0 64px #ffaa0045, 0 0 96px #ff880022, 0 0 130px #ffd70010`, fc:"#ffd700" },
    rainbow: { tier:5, shadow:`0 0 34px rgba(255,0,80,0.6), 0 0 56px rgba(0,255,100,0.4), 0 0 80px rgba(0,150,255,0.3), 0 0 108px rgba(255,255,0,0.2), 0 0 140px rgba(255,0,255,0.12)`, fc:"#ffffff" },
  };
  const fx = effects[effect];
  if (effect === "divineaureole") {
    return (
      <>
        {}
        <div style={{ position:"absolute", inset:-14, borderRadius:26, pointerEvents:"none", zIndex:0,
          background:`radial-gradient(ellipse at center, rgba(255,215,0,0.25) 0%, rgba(255,180,0,0.1) 40%, rgba(184,154,0,0.04) 70%, transparent 100%)`,
          animation:"divineBreathOuter 4s ease-in-out infinite" }} />
        {}
        <div style={{ position:"absolute", inset:-6, borderRadius:18, pointerEvents:"none", zIndex:1,
          boxShadow:"0 0 20px rgba(255,215,0,0.5), 0 0 40px rgba(255,200,0,0.25), 0 0 60px rgba(255,215,0,0.1)",
          animation:"divineBreath 3s ease-in-out infinite",
          filter:"drop-shadow(0 0 8px rgba(255,248,200,0.4))" }} />
        {}
        <div style={{ position:"absolute", inset:-10, borderRadius:22, pointerEvents:"none", zIndex:0,
          border:"1px solid rgba(255,215,0,0.12)",
          boxShadow:"0 0 16px rgba(255,215,0,0.12), inset 0 0 12px rgba(255,215,0,0.06)",
          animation:"divineRingPulse 3.5s ease-in-out 0.5s infinite" }} />
        {}
        <div style={{ position:"absolute", inset:-20, pointerEvents:"none", zIndex:0,
          background:`radial-gradient(ellipse at 30% 40%, rgba(255,215,0,0.08) 0%, transparent 60%)`,
          animation:"divineWispA 5s ease-out infinite" }} />
        <div style={{ position:"absolute", inset:-18, pointerEvents:"none", zIndex:0,
          background:`radial-gradient(ellipse at 70% 60%, rgba(255,230,100,0.06) 0%, transparent 55%)`,
          animation:"divineWispB 6s ease-out 1.5s infinite" }} />
        <div style={{ position:"absolute", inset:-22, pointerEvents:"none", zIndex:0,
          background:`radial-gradient(ellipse at 50% 30%, rgba(255,248,200,0.05) 0%, transparent 50%)`,
          animation:"divineWispA 7s ease-out 3s infinite" }} />
      </>
    );
  }
  if (!fx) return null;
  const t = fx.tier;
  const pulseSpeed = t <= 1 ? 4 : t === 2 ? 2.5 : t === 3 ? 1.8 : t === 4 ? 1.2 : 0.8;
  const mainAnim = t <= 1 ? `chipFxFloat ${pulseSpeed}s ease-in-out infinite`
    : t <= 3 ? `chipFxPulse ${pulseSpeed}s ease-in-out infinite`
    : t === 4 ? `chipFxPulse ${pulseSpeed}s ease-in-out infinite`
    : `chipFxPulse ${pulseSpeed}s ease-in-out infinite, chipFxRainbow 2s linear infinite`;
  const mainOpacity = t <= 1 ? 0.55 : t === 2 ? 0.7 : t === 3 ? 0.85 : t === 4 ? 0.95 : 1;
  const mainFilter = t <= 2 ? "none" : t === 3 ? `drop-shadow(0 0 4px ${accent}50)`
    : `drop-shadow(0 0 6px ${fx.fc || accent}80) drop-shadow(0 0 14px ${fx.fc || accent}30)`;
  return (
    <>
      {}
      <div style={{ position:"absolute", inset: t >= 4 ? -8 : -5, borderRadius:16, pointerEvents:"none", zIndex:1,
        animation:mainAnim, boxShadow:fx.shadow, filter:mainFilter, opacity:mainOpacity }} />
      {}
      {t >= 5 && (
        <div style={{ position:"absolute", inset:-14, borderRadius:22, pointerEvents:"none", zIndex:0,
          animation:`chipFxPulse 1.5s ease-in-out infinite`,
          background:`radial-gradient(ellipse at center, transparent 40%, ${fx.fc}06 70%, transparent 100%)`,
          boxShadow:`0 0 28px ${fx.fc}20, 0 0 56px ${fx.fc}10, 0 0 84px ${fx.fc}05`,
          border:`1px solid ${fx.fc}18`,
          opacity:0.5 }} />
      )}
    </>
  );
}
