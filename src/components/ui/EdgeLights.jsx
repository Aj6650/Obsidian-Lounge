import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { theme } from '../../theme-globals.js';

export const LIGHT_COUNT = 48;
export function EdgeLights({ mode = "idle", color = theme.accent }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const speed = mode === "idle" ? 150 : 400;
    const iv = setInterval(() => setTick(t => t + 1), speed);
    return () => clearInterval(iv);
  }, [mode]);
  const lights = useMemo(() => {
    const result = [];
    const perSide = Math.floor(LIGHT_COUNT / 4);
    for (let i = 1; i <= perSide; i++) result.push({ x: `${(i / (perSide + 1)) * 100}%`, y: "0%", side: "top" });
    for (let i = 1; i <= perSide; i++) result.push({ x: "100%", y: `${(i / (perSide + 1)) * 100}%`, side: "right" });
    for (let i = perSide; i >= 1; i--) result.push({ x: `${(i / (perSide + 1)) * 100}%`, y: "100%", side: "bottom" });
    for (let i = perSide; i >= 1; i--) result.push({ x: "0%", y: `${(i / (perSide + 1)) * 100}%`, side: "left" });
    return result;
  }, []);
  const megaColors = ["#ef4444","#f97316","#facc15","#22c55e","#3b82f6","#a855f7","#ec4899"];
  return (
    <div style={{ position:"absolute", top:0, left:0, right:0, bottom:0, pointerEvents:"none", zIndex:5 }}>
      {lights.map((l, i) => {
        let opacity, bulbColor, size, glow;
        if (mode === "mega") {
          const on = (i + tick) % 2 === 0;
          bulbColor = megaColors[i % megaColors.length];
          opacity = on ? 1 : 0.15;
          size = on ? 7 : 3;
          glow = on ? `0 0 14px ${bulbColor}` : "none";
        } else if (mode === "big") {
          const on = (i + tick) % 2 === 0;
          bulbColor = "#22c55e";
          opacity = on ? 1 : 0.1;
          size = on ? 7 : 3;
          glow = on ? "0 0 14px #22c55e" : "none";
        } else if (mode === "win") {
          const on = (i + tick) % 2 === 0;
          bulbColor = "#22c55e";
          opacity = on ? 0.9 : 0.08;
          size = on ? 6 : 3;
          glow = on ? "0 0 10px #22c55e" : "none";
        } else if (mode === "loss") {
          const on = (i + tick) % 2 === 0;
          bulbColor = "#e74c3c";
          opacity = on ? 0.85 : 0.08;
          size = on ? 6 : 3;
          glow = on ? "0 0 10px #e74c3c" : "none";
        } else if (mode === "push") {
          const on = (i + tick) % 2 === 0;
          bulbColor = "#f1c40f";
          opacity = on ? 0.8 : 0.08;
          size = on ? 5 : 3;
          glow = on ? "0 0 8px #f1c40f" : "none";
        } else {
          const chasePos = tick % lights.length;
          const dist = Math.min(Math.abs(i - chasePos), lights.length - Math.abs(i - chasePos));
          const isChasing = dist < 3;
          bulbColor = color;
          opacity = isChasing ? 0.7 : 0.15;
          size = isChasing ? 5 : 3;
          glow = isChasing ? `0 0 6px ${color}` : "none";
        }
        return (
          <div key={i} style={{
            position:"absolute",
            left: l.x, top: l.y,
            transform: "translate(-50%, -50%)",
            width: size, height: size,
            borderRadius: "50%",
            background: bulbColor,
            opacity,
            boxShadow: glow,
            transition: mode === "idle" ? "opacity 0.15s, width 0.15s, height 0.15s" : "none",
          }} />
        );
      })}
    </div>
  );
}
export function useEdgeLights() {
  const [lightMode, setLightMode] = useState("idle");
  const timerRef = useRef(null);
  const triggerLights = useCallback((mode, duration = 0) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setLightMode(mode);
    if (duration > 0) {
      timerRef.current = setTimeout(() => setLightMode("idle"), duration);
    }
  }, []);
  const clearLights = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    setLightMode("idle");
  }, []);
  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);
  return { lightMode, triggerLights, clearLights };
}
