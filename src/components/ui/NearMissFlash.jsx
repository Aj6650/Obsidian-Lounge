import React from 'react';
import { T } from '../../constants/styles.js';

export function NearMissFlash({ message }) {
  return (
    <div style={{
      textAlign:"center", padding:"4px 14px", borderRadius:8,
      background:"rgba(255,165,0,0.1)", border:"1px solid rgba(255,165,0,0.25)",
      animation:"nearMissPulse 0.4s ease-out, fadeIn 0.3s ease",
      fontSize:11, fontWeight:600, fontFamily:T.mono, letterSpacing:1,
      color:"#ffa500",
    }}>{message}</div>
  );
}
