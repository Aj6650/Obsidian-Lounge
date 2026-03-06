import React, { useEffect } from 'react';
import { theme } from '../../theme-globals.js';
import { T } from '../../constants/styles.js';

export function AchievementToast({ achievement, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 4000);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div style={{
      position:"fixed", top:16, right:16, zIndex:45000,
      display:"flex", alignItems:"center", gap:10,
      padding:"10px 16px 10px 12px", borderRadius:12,
      background:"linear-gradient(135deg, rgba(26,26,46,0.95), rgba(15,15,26,0.95))",
      border:`1px solid ${theme.accent}66`,
      boxShadow:`0 8px 32px rgba(0,0,0,0.5), 0 0 20px ${theme.accent}1a`,
      animation:"toastSlide 4s ease-in-out both",
      backdropFilter:"blur(10px)",
      maxWidth:280,
    }}>
      <span style={{ fontSize:28, lineHeight:1 }}>{achievement.icon}</span>
      <div>
        <div style={{ fontSize:8, letterSpacing:3, textTransform:"uppercase",
          color:theme.accent, fontFamily:T.mono, fontWeight:700, marginBottom:2 }}>
          ACHIEVEMENT UNLOCKED
        </div>
        <div style={{ fontSize:13, fontWeight:700, color:T.text, fontFamily:T.serif,
          letterSpacing:1 }}>{achievement.name}</div>
        <div style={{ fontSize:9, color:T.muted, fontFamily:T.mono, marginTop:1 }}>
          {achievement.desc}
        </div>
      </div>
    </div>
  );
}
