import React, { useState, useCallback, useRef } from 'react';

export function ScreenColorWash({ type, onDismiss }) {
  if (!type) return null;
  const persistent = ["big","mega","epic","jackpot"].includes(type);
  const config = {
    gold:    { bg:"rgba(212,175,55,0.13)", anim:"colorWash 0.5s ease-out forwards" },
    big:     { bg:"rgba(241,196,15,0.14)", anim:"colorWashHold 0.4s ease-out forwards" },
    mega:    { bg:"rgba(255,80,80,0.14)", anim:"colorWashPulse 1.6s ease-out forwards" },
    epic:    { bg:"rgba(255,69,0,0.16)", anim:"colorShift 2s ease-out forwards" },
    jackpot: { bg:"rgba(255,215,0,0.15)", anim:"jackpotWash 2.5s ease-out forwards, jackpotWashLoop 3s ease-in-out 2.5s infinite" },
    loss:    { bg:"rgba(231,76,60,0.1)", anim:"colorWash 0.4s ease-out forwards" },
  };
  const c = config[type] || config.gold;
  return (
    <div style={{
      position:"fixed", top:0, left:0, right:0, bottom:0, zIndex:10004,
      pointerEvents: "none",
      background: c.bg,
      animation: c.anim,
    }} />
  );
}
export function useScreenColorWash() {
  const [wash, setWash] = useState(null);
  const timerRef = useRef(null);
  const triggerWash = useCallback((type = "gold") => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    setWash(type);
    if (!["big","mega","epic","jackpot"].includes(type)) {
      const autoDur = { gold:500, loss:400 };
      timerRef.current = setTimeout(() => { setWash(null); timerRef.current = null; }, autoDur[type] || 500);
    }
  }, []);
  const clearWash = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    setWash(null);
  }, []);
  return { washType: wash, triggerWash, clearWash };
}
