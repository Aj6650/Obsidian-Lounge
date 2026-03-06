import React from 'react';
import { theme } from '../../theme-globals.js';
import { getChipSkin } from '../../constants/chips.js';

export function PokerChipIcon({ size = 22, color = theme.accent, skinId }) {
  const skin = skinId ? getChipSkin(skinId) : null;
  const chipFill = skin && skin.colors?.[0] ? skin.colors[0].fill : color;
  const chipRim = skin && skin.colors?.[0] ? skin.colors[0].rim : null;
  const c = chipFill;
  const dark = chipRim || `${c}88`;
  const light = "#fff";
  const edgeLight = "rgba(255,255,255,0.85)";
  const uid = c.replace('#','') + (skinId||'');
  return (
    <svg width={size} height={size} viewBox="0 0 36 36">
      <defs>
        <radialGradient id={`cg_${uid}`} cx="45%" cy="40%" r="55%">
          <stop offset="0%" stopColor={light} stopOpacity="0.3" />
          <stop offset="50%" stopColor={c} />
          <stop offset="100%" stopColor={dark} />
        </radialGradient>
      </defs>
      <ellipse cx={18} cy={19.5} rx={15} ry={14.5} fill="rgba(0,0,0,0.3)" />
      <circle cx={18} cy={18} r={15} fill={`url(#cg_${uid})`} />
      {Array.from({length:12}, (_, i) => {
        const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
        const x1 = 18 + Math.cos(a) * 12.2, y1 = 18 + Math.sin(a) * 12.2;
        const x2 = 18 + Math.cos(a) * 15, y2 = 18 + Math.sin(a) * 15;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={edgeLight} strokeWidth={2} strokeLinecap="round" opacity={i % 2 === 0 ? 0.9 : 0.5} />;
      })}
      <circle cx={18} cy={18} r={11.5} fill="none" stroke={dark} strokeWidth={0.8} opacity={0.5} />
      <circle cx={18} cy={18} r={10.5} fill={c} opacity={0.3} />
      <circle cx={18} cy={18} r={7} fill={c} />
      <circle cx={18} cy={18} r={7} fill="none" stroke={light} strokeWidth={0.5} opacity={0.35} />
      <circle cx={18} cy={18} r={5.2} fill="none" stroke={light} strokeWidth={0.3} opacity={0.2} />
      <text x={18} y={22} textAnchor="middle" fontSize={11} fontWeight="900" fontFamily="Georgia, serif" fill={light} opacity={0.95}>$</text>
      {}
      <ellipse cx={14.5} cy={12} rx={6} ry={3.5} fill="rgba(255,255,255,0.18)" transform="rotate(-15 14.5 12)" />
      {}
      <path d="M 8 24 A 15 15 0 0 0 28 24" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={1.5} />
    </svg>
  );
}
