import React, { useMemo, useState, useEffect } from 'react';
import { theme } from '../../theme-globals.js';
import { T } from '../../constants/styles.js';

export function BetControls({ bet, setBet, chips, presets = [5,10,25,50,100], accent = theme.accent }) {
  const [confirmingAllIn, setConfirmingAllIn] = useState(false);
  useEffect(() => { setConfirmingAllIn(false); }, [chips]);

  const increments = chips < 10000 ? [100, 500, 1000]
    : chips < 100000 ? [1000, 5000, 10000]
    : chips < 1000000 ? [10000, 50000, 100000]
    : [100000, 500000, 1000000];

  const fmtInc = (n) => n >= 1000000 ? `${n/1000000}M` : n >= 1000 ? `${n/1000}k` : `${n}`;

  const dynamicPresets = useMemo(() => {
    if (chips <= 500) return presets.filter(p => p <= chips);
    const targets = [0.01, 0.05, 0.1, 0.25, 0.5];
    return targets.map(pct => {
      const raw = Math.round(chips * pct);
      if (raw >= 1000) return Math.round(raw / 100) * 100;
      if (raw >= 100) return Math.round(raw / 25) * 25;
      if (raw >= 10) return Math.round(raw / 5) * 5;
      return Math.max(1, raw);
    }).filter((v, i, a) => v > 0 && a.indexOf(v) === i);
  }, [chips, presets]);
  const isDynamic = chips > 500;
  const pctLabels = [0.01, 0.05, 0.1, 0.25, 0.5];
  return (
    <div className={theme.isRainbow ? "anim-rainbow" : theme.isJackpotSkin ? "anim-gold-shimmer" : ""} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:14, width:"100%" }}>
      <div style={{ display:"flex", gap:6, justifyContent:"center" }}>
        {increments.map(inc => {
          const disabled = bet + inc > chips;
          return (
            <button key={inc} onClick={() => setBet(Math.min(bet + inc, chips))} disabled={disabled}
              style={{
                width:52, height:34, borderRadius:17,
                border:`1.5px solid ${disabled ? accent + "20" : accent + "55"}`,
                background: disabled ? "rgba(60,60,60,0.1)" : `${accent}14`,
                color: disabled ? "#444" : accent,
                fontSize:11, fontWeight:700, fontFamily:T.mono,
                cursor: disabled ? "not-allowed" : "pointer", transition:"all 0.15s",
                opacity: disabled ? 0.35 : 1,
              }}>+{fmtInc(inc)}</button>
          );
        })}
      </div>
      <div className="bet-chip-row" style={{ display:"flex", gap:6, flexWrap:"wrap", justifyContent:"center", alignItems:"center" }}>
        <button onClick={() => setBet(Math.max(1, Math.floor(bet / 2)))}
          style={{
            width:36, height:36, borderRadius:"50%",
            border:`1.5px solid ${accent}40`, background:`${accent}0F`,
            color:accent, fontSize:13, fontWeight:700, fontFamily:T.mono,
            cursor:"pointer", transition:"all 0.2s", display:"flex", alignItems:"center", justifyContent:"center",
          }}>½</button>
        {dynamicPresets.map((amount, idx) => (
          <button key={amount} onClick={() => setBet(Math.min(amount, chips))} disabled={amount > chips}
            style={{
              width:48, height:48, borderRadius:"50%", position:"relative",
              border: bet === amount ? `2px solid ${accent}` : `2px solid ${accent}50`,
              background: amount > chips ? "rgba(60,60,60,0.2)" : bet === amount ? `radial-gradient(circle, ${accent} 0%, ${accent}cc 100%)` : `radial-gradient(circle, ${accent}25 0%, ${accent}0d 100%)`,
              color: amount > chips ? "#555" : bet === amount ? "#1a1a2e" : accent,
              fontSize: amount >= 10000 ? 8 : amount >= 1000 ? 9 : 12, fontWeight:700, fontFamily:T.mono,
              cursor: amount > chips ? "not-allowed" : "pointer", transition:"all 0.2s",
              boxShadow: bet === amount ? `0 0 12px ${accent}60` : "none",
            }}>{amount >= 1000 ? `${(amount/1000).toFixed(amount%1000===0?0:1)}k` : `${amount}`}
            {isDynamic && pctLabels[idx] && <span style={{ position:"absolute", bottom:-10, left:"50%", transform:"translateX(-50%)",
              fontSize:7, color:`${accent}60`, fontFamily:T.mono, whiteSpace:"nowrap" }}>{Math.round(pctLabels[idx]*100)}%</span>}
          </button>
        ))}
        <button onClick={() => setConfirmingAllIn(true)}
          style={{
            height:48, padding:"0 14px", borderRadius:24,
            border: bet === chips ? "2px solid #c0392b" : "2px solid rgba(192,57,43,0.4)",
            background: bet === chips ? "radial-gradient(circle, #c0392b 0%, #962d22 100%)" : "radial-gradient(circle, rgba(192,57,43,0.15) 0%, rgba(192,57,43,0.05) 100%)",
            color: bet === chips ? "#fff" : "#c0392b",
            fontSize:10, fontWeight:700, fontFamily:T.mono,
            cursor:"pointer", transition:"all 0.2s", letterSpacing:1,
            boxShadow: bet === chips ? "0 0 12px rgba(192,57,43,0.4)" : "none",
          }}>ALL IN</button>
        <button onClick={() => setBet(Math.min(chips, bet * 2))}
          style={{
            width:36, height:36, borderRadius:"50%",
            border:`1.5px solid ${accent}40`, background:`${accent}0F`,
            color:accent, fontSize:13, fontWeight:700, fontFamily:T.mono,
            cursor:"pointer", transition:"all 0.2s", display:"flex", alignItems:"center", justifyContent:"center",
          }}>2×</button>
      </div>
      {confirmingAllIn && (
        <div style={{
          display:"flex", alignItems:"center", gap:10, padding:"10px 16px",
          background:"rgba(192,57,43,0.1)", border:"1px solid rgba(192,57,43,0.35)",
          borderRadius:10, flexWrap:"wrap", justifyContent:"center",
        }}>
          <span style={{ fontFamily:T.mono, fontSize:12, color:"#e05540", fontWeight:600 }}>
            Bet all ${chips.toLocaleString()}?
          </span>
          <button onClick={() => { setBet(chips); setConfirmingAllIn(false); }}
            style={{ padding:"5px 14px", background:"#c0392b", color:"#fff", border:"none",
              borderRadius:6, fontWeight:700, fontSize:12, fontFamily:T.mono, cursor:"pointer" }}>
            Confirm
          </button>
          <button onClick={() => setConfirmingAllIn(false)}
            style={{ padding:"5px 14px", background:"rgba(255,255,255,0.06)", color:"#999",
              border:"1px solid rgba(255,255,255,0.12)",
              borderRadius:6, fontWeight:700, fontSize:12, fontFamily:T.mono, cursor:"pointer" }}>
            Cancel
          </button>
        </div>
      )}
      <div style={{ width:"100%", maxWidth:320, padding:"0 8px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:6 }}>
          <span style={{ fontSize:11, letterSpacing:2, textTransform:"uppercase", color:T.muted }}>Wager</span>
          <span style={{ fontFamily:T.mono, fontSize:20, fontWeight:600, color:accent }}>${bet.toLocaleString()}</span>
        </div>
        <input type="range" min={1} max={Math.max(1, chips)} step={chips > 1000 ? Math.max(1, Math.floor(chips/200)) : 1} value={bet} onChange={e => setBet(Number(e.target.value))}
          style={{ width:"100%", height:6, appearance:"none", WebkitAppearance:"none", background:`linear-gradient(to right, ${accent} 0%, ${accent} ${(bet/chips)*100}%, ${accent}35 ${(bet/chips)*100}%, ${accent}35 100%)`, borderRadius:3, outline:"none", cursor:"pointer" }} />
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:3, fontFamily:T.mono, fontSize:10, color:T.dim }}>
          <span>$1</span><span>${chips.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
