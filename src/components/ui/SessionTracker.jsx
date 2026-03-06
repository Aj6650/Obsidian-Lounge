import React, { useState, useEffect } from 'react';
import { theme } from '../../theme-globals.js';
import { T } from '../../constants/styles.js';

export function SessionTracker({ chips, sessionStart, sessionRounds, sessionChipsStart, stats, accent = theme.accent }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setElapsed(Math.floor((Date.now() - sessionStart) / 1000)), 1000);
    return () => clearInterval(interval);
  }, [sessionStart]);
  const hrs = Math.floor(elapsed / 3600);
  const mins = Math.floor((elapsed % 3600) / 60);
  const secs = elapsed % 60;
  const timeStr = hrs > 0 ? `${hrs}h ${mins}m` : mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  const sessionProfit = chips - sessionChipsStart;
  const profitPerRound = sessionRounds > 0 ? Math.round(sessionProfit / sessionRounds) : 0;
  const profitPerMin = elapsed >= 60 ? Math.round(sessionProfit / (elapsed / 60)) : null;
  const tw = Object.values(stats.winsPerGame || {}).reduce((a, b) => a + b, 0);
  const tl = Object.values(stats.lossesPerGame || {}).reduce((a, b) => a + b, 0);
  const wr = (tw + tl) > 0 ? Math.round(tw / (tw + tl) * 100) : 0;
  const profitColor = sessionProfit > 0 ? "#22c55e" : sessionProfit < 0 ? "#ef4444" : T.muted;
  return (
    <div style={{ marginTop:16, background:"rgba(255,255,255,0.02)", border:`1px solid ${accent}18`,
      borderRadius:12, padding:"14px 16px", overflow:"hidden" }}>
      <div style={{ fontSize:9, letterSpacing:2, textTransform:"uppercase", color:T.dim,
        fontFamily:T.mono, marginBottom:10, textAlign:"center" }}>This Session</div>
      <div className="session-bar" style={{ display:"flex", justifyContent:"space-around", alignItems:"center",
        gap:12, flexWrap:"wrap" }}>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:8, color:T.dim, fontFamily:T.mono, letterSpacing:1 }}>TIME</div>
          <div style={{ fontSize:16, fontWeight:700, fontFamily:T.mono, color:"#3b82f6" }}>{timeStr}</div>
        </div>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:8, color:T.dim, fontFamily:T.mono, letterSpacing:1 }}>ROUNDS</div>
          <div style={{ fontSize:16, fontWeight:700, fontFamily:T.mono, color:"#a855f7" }}>{sessionRounds}</div>
        </div>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:8, color:T.dim, fontFamily:T.mono, letterSpacing:1 }}>SESSION P/L</div>
          <div style={{ fontSize:16, fontWeight:700, fontFamily:T.mono, color:profitColor }}>
            {sessionProfit >= 0 ? "+" : ""}${sessionProfit.toLocaleString()}
          </div>
        </div>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:8, color:T.dim, fontFamily:T.mono, letterSpacing:1 }}>PER ROUND</div>
          <div style={{ fontSize:14, fontWeight:700, fontFamily:T.mono,
            color: profitPerRound > 0 ? "#22c55e" : profitPerRound < 0 ? "#ef4444" : T.muted }}>
            {sessionRounds > 0 ? `${profitPerRound >= 0 ? "+" : ""}$${profitPerRound.toLocaleString()}` : "—"}
          </div>
        </div>
      </div>
      {}
      {sessionRounds > 0 && (
        <div style={{ marginTop:10, display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:8, color:T.dim, fontFamily:T.mono, flexShrink:0 }}>{sessionChipsStart.toLocaleString()}</span>
          <div style={{ flex:1, height:4, borderRadius:2, background:"rgba(255,255,255,0.06)", overflow:"hidden", position:"relative" }}>
            {(() => {
              const range = Math.max(Math.abs(sessionProfit), sessionChipsStart * 0.1);
              const pct = Math.min(100, Math.max(0, ((chips - sessionChipsStart + range) / (range * 2)) * 100));
              return (
                <>
                  <div style={{ position:"absolute", left:"50%", top:0, width:1, height:"100%", background:"rgba(255,255,255,0.15)" }} />
                  <div style={{ position:"absolute", left: sessionProfit >= 0 ? "50%" : `${pct}%`,
                    width: sessionProfit >= 0 ? `${pct - 50}%` : `${50 - pct}%`,
                    height:"100%", borderRadius:2,
                    background: sessionProfit >= 0 ? "linear-gradient(90deg, #22c55e, #4ade80)" : "linear-gradient(90deg, #ef4444, #f87171)",
                    transition:"all 0.5s" }} />
                </>
              );
            })()}
          </div>
          <span style={{ fontSize:8, color:profitColor, fontFamily:T.mono, flexShrink:0 }}>{chips.toLocaleString()}</span>
        </div>
      )}
    </div>
  );
}
