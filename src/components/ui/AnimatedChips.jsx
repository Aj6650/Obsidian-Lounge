import React, { useState, useEffect, useRef } from 'react';

export function AnimatedChips({ chips }) {
  const [display, setDisplay] = useState(chips);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState(0);
  const [popClass, setPopClass] = useState("none");
  const [glowIntensity, setGlowIntensity] = useState(0);
  const prevRef = useRef(chips);
  useEffect(() => {
    if (chips === prevRef.current) return;
    const diff = chips - prevRef.current;
    const start = prevRef.current;
    prevRef.current = chips;
    const absDiff = Math.abs(diff);
    setAnimating(true);
    setDirection(diff > 0 ? 1 : -1);
    if (diff > 0) {
      if (absDiff >= 5000) { setPopClass("mega"); setGlowIntensity(3); }
      else if (absDiff >= 500) { setPopClass("big"); setGlowIntensity(2); }
      else { setPopClass("normal"); setGlowIntensity(1); }
    } else {
      setPopClass("none"); setGlowIntensity(0);
    }
    const steps = absDiff >= 1000 ? 30 : 20;
    let step = 0;
    const iv = setInterval(() => {
      step++;
      const t = step / steps;
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(start + diff * eased));
      if (step >= steps) { clearInterval(iv); setDisplay(chips); setAnimating(false); setPopClass("none"); setGlowIntensity(0); }
    }, absDiff >= 1000 ? 30 : 25);
    return () => clearInterval(iv);
  }, [chips]);
  const glowShadow = glowIntensity === 3
    ? "0 0 30px rgba(255,200,50,0.6), 0 0 60px rgba(255,150,0,0.3)"
    : glowIntensity === 2
    ? "0 0 20px rgba(241,196,15,0.5), 0 0 40px rgba(241,196,15,0.2)"
    : glowIntensity === 1
    ? "0 0 10px rgba(34,197,94,0.4)"
    : "none";
  return (
    <span style={{
      transition: "color 0.3s",
      color: animating ? (direction > 0 ? "#22c55e" : "#ef4444") : undefined,
      animation: popClass === "mega" ? "megaPop 0.5s ease-out" : popClass === "big" ? "chipPop 0.4s ease-out" : popClass === "normal" ? "chipPop 0.3s ease-out" : "none",
      textShadow: glowShadow,
      display: "inline-block",
    }}>${display.toLocaleString()}</span>
  );
}
