import React from 'react';
import { theme } from '../../theme-globals.js';
import { T } from '../../constants/styles.js';

export function StatCard({ label, value, sub, color = "#d4af37", accent = theme.accent }) {
  return (
    <div className="stat-card" style={{
      background:"rgba(255,255,255,0.03)", border:`1px solid ${accent}1a`,
      borderRadius:10, padding:"12px 14px", textAlign:"center", minWidth:0,
    }}>
      <div style={{ fontSize:9, letterSpacing:2, textTransform:"uppercase", color:T.dim,
        fontFamily:T.mono, marginBottom:4 }}>{label}</div>
      <div className="stat-value" style={{ fontSize:20, fontWeight:700, fontFamily:T.mono,
        color, lineHeight:1.2 }}>{value}</div>
      {sub && <div style={{ fontSize:9, color:"#4a4030", fontFamily:T.mono, marginTop:3 }}>{sub}</div>}
    </div>
  );
}
