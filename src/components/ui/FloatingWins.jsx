import React, { useState, useCallback, useRef } from 'react';
import { T } from '../../constants/styles.js';

export function FloatingWins({ wins }) {
  return (
    <div style={{ position:"fixed", top:0, left:0, right:0, bottom:0, pointerEvents:"none", overflow:"hidden", zIndex:10005 }}>
      {wins.map(w => (
        <div key={w.id} style={{
          position:"absolute", left:`${w.x}%`, top:`${w.y}%`,
          fontSize: w.mega ? 32 : w.big ? 26 : 18,
          fontWeight:900, fontFamily:T.mono,
          color: w.mega ? "#ff6b6b" : w.big ? "#f1c40f" : "#22c55e",
          textShadow: w.mega ? "0 0 30px #ff6b6b, 0 0 60px rgba(255,107,107,0.5)"
            : w.big ? "0 0 20px #f1c40f, 0 0 40px rgba(241,196,15,0.4)"
            : "0 0 12px rgba(34,197,94,0.6)",
          animation: "floatUp 1.8s ease-out forwards",
          whiteSpace:"nowrap",
        }}>+${w.amount.toLocaleString()}</div>
      ))}
    </div>
  );
}
export function useFloatingWins() {
  const [wins, setWins] = useState([]);
  const idRef = useRef(0);
  const addWin = useCallback((amount, opts = {}) => {
    const id = ++idRef.current;
    const count = amount >= (opts.megaThreshold ?? 500) ? 3 : amount >= (opts.bigThreshold ?? 100) ? 2 : 1;
    for (let i = 0; i < count; i++) {
      const wid = id * 100 + i;
      setTimeout(() => {
        setWins(prev => [...prev, {
          id: wid, amount,
          x: (opts.x ?? (35 + Math.random() * 30)) + (i * 8 - (count-1)*4),
          y: (opts.y ?? (30 + Math.random() * 20)) + (i * 5),
          big: amount >= (opts.bigThreshold ?? 100),
          mega: amount >= (opts.megaThreshold ?? 500),
        }]);
        setTimeout(() => setWins(prev => prev.filter(w => w.id !== wid)), 2000);
      }, i * 200);
    }
  }, []);
  return { wins, addWin };
}
