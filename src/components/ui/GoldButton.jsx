import React, { useState } from 'react';
import { theme } from '../../theme-globals.js';
import { T } from '../../constants/styles.js';

export function GoldButton({ onClick, disabled, children, style: extraStyle = {}, small = false, hint = null, accent = theme.accent }) {
  const [hover, setHover] = useState(false);
  const [pressed, setPressed] = useState(false);
  const pad = small ? "8px 24px" : "12px 48px";
  const fs = small ? 12 : 15;
  const accentLight = accent + "cc";
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={() => !disabled && setHover(true)}
      onMouseLeave={() => { setHover(false); setPressed(false); }}
      onMouseDown={() => !disabled && setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        padding: pad, fontSize: fs, fontWeight: 700, fontFamily: T.serif,
        letterSpacing: 3, textTransform: "uppercase", position:"relative",
        background: disabled ? "rgba(80,60,40,0.3)"
          : theme.isJackpotSkin ? `linear-gradient(90deg, ${accent}, #fff8dc, ${accent}, #ffe87c, ${accent})`
          : hover ? `linear-gradient(135deg, ${accentLight} 0%, ${accent}ee 50%, ${accent} 100%)`
          : `linear-gradient(135deg, ${accent} 0%, ${accent}cc 100%)`,
        backgroundSize: theme.isJackpotSkin ? "300% auto" : "auto",
        color: disabled ? "#554a3a" : "#0e0a08",
        border: disabled ? "1px solid rgba(80,60,40,0.2)" : `1px solid ${accent}50`,
        borderRadius: 8, cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.2s cubic-bezier(0.4,0,0.2,1)",
        boxShadow: disabled ? "none"
          : hover ? `0 6px 24px ${accent}70, 0 0 40px ${accent}25`
          : "0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)",
        transform: pressed ? "scale(0.96) translateY(1px)" : hover ? "translateY(-2px)" : "none",
        ...extraStyle,
      }}
      className={`${small ? "gold-btn gold-btn-small" : "gold-btn"}${theme.isRainbow ? " anim-rainbow" : ""}${theme.isJackpotSkin ? " anim-gold-shimmer" : ""}`}
      >{children}{hint && !disabled && <span style={{ position:"absolute", bottom:-14, left:"50%", transform:"translateX(-50%)", fontSize:8, fontFamily:T.mono, color:`${accent}60`, letterSpacing:1, whiteSpace:"nowrap", textTransform:"none", fontWeight:400 }}>{hint}</span>}</button>
  );
}
