import React, { useState, useCallback } from 'react';
import { theme } from '../../theme-globals.js';
import { T } from '../../constants/styles.js';

export const actionBtnStyle = (enabled) => ({
  padding: "10px 28px", fontSize: 13, fontWeight: 600,
  fontFamily: T.serif, letterSpacing: 2, textTransform: "uppercase",
  background: enabled ? `${theme.accent}25` : "rgba(100,100,100,0.1)",
  color: enabled ? theme.accent : "#555",
  border: enabled ? `1.5px solid ${theme.accent}66` : "1.5px solid rgba(100,100,100,0.2)",
  borderRadius: 6, cursor: enabled ? "pointer" : "not-allowed",
  transition: "all 0.15s",
});
export function ActionButton({ label, onClick, enabled = true }) {
  return (
    <button onClick={onClick} disabled={!enabled} className={theme.isRainbow ? "anim-rainbow" : theme.isJackpotSkin ? "anim-gold-shimmer" : ""} style={actionBtnStyle(enabled)}>
      {label}
    </button>
  );
}
export function useScreenShake() {
  const [shaking, setShaking] = useState(false);
  const [intensity, setIntensity] = useState("normal");
  const shake = useCallback((duration = 400, level = "normal") => {
    setIntensity(level);
    setShaking(true);
    setTimeout(() => setShaking(false), duration);
  }, []);
  return { shaking, shake, shakeIntensity: intensity };
}
