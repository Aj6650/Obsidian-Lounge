import React from 'react';

export function Sparkline({ results, width = 44, height = 14 }) {
  if (!results || results.length < 2) return null;
  const n = results.length;
  const barW = Math.min(3, (width - n + 1) / n);
  const gap = 1;
  const totalW = n * (barW + gap) - gap;
  return (
    <svg width={totalW} height={height} style={{ display:"block" }}>
      {results.map((r, i) => {
        const isWin = r > 0;
        const barH = Math.max(2, Math.min(height, isWin ? Math.min(height, 3 + Math.log10(Math.max(1,r)) * 3) : Math.min(height * 0.6, 3)));
        const y = isWin ? (height / 2) - barH : height / 2;
        return <rect key={i} x={i * (barW + gap)} y={y} width={barW} height={barH} rx={0.5}
          fill={isWin ? "#22c55e" : "#ef4444"} opacity={0.4 + (i / n) * 0.6} />;
      })}
      <line x1={0} y1={height/2} x2={totalW} y2={height/2} stroke="rgba(255,255,255,0.08)" strokeWidth={0.5} />
    </svg>
  );
}
