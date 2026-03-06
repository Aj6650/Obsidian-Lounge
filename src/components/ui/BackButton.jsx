import React from 'react';
import { theme } from '../../theme-globals.js';
import { T } from '../../constants/styles.js';

export function BackButton({ onClick, accent = theme.accent }) {
  return (
    <button onClick={onClick} className={`back-btn${theme.isRainbow ? " anim-rainbow" : theme.isJackpotSkin ? " anim-gold-shimmer" : ""}`} style={{
      position:"absolute", top:16, left:16, background:`${accent}14`,
      border:`1px solid ${accent}33`, color:accent, padding:"7px 16px",
      borderRadius:T.radius, fontSize:12, fontFamily:T.serif,
      letterSpacing:2, textTransform:"uppercase", cursor:"pointer", zIndex:10,
      transition:"all 0.2s",
    }}
      onMouseEnter={e => { e.currentTarget.style.background = `${accent}30`; e.currentTarget.style.borderColor = accent + "66"; }}
      onMouseLeave={e => { e.currentTarget.style.background = `${accent}14`; e.currentTarget.style.borderColor = accent + "33"; }}>
      ← Lobby
    </button>
  );
}
