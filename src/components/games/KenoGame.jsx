import React, { useState, useEffect, useCallback } from 'react';
import { theme } from '../../theme-globals.js';
import { T } from '../../constants/styles.js';
import { GameShell } from '../../components/GameShell.jsx';
import { GoldButton } from '../../components/ui/GoldButton.jsx';
import { BetControls } from '../../components/ui/BetControls.jsx';

export const KENO_PAYOUTS = {
  1: { 1: 3.7 },
  2: { 1: 1.8, 2: 4.5 },
  3: { 2: 4, 3: 20 },
  4: { 2: 2, 3: 7, 4: 40 },
  5: { 2: 1.5, 3: 3, 4: 12, 5: 70 },
  6: { 3: 3.5, 4: 10, 5: 40, 6: 250 },
  7: { 3: 2.5, 4: 5, 5: 18, 6: 80, 7: 500 },
  8: { 4: 5, 5: 18, 6: 100, 7: 500, 8: 3000 },
  9: { 4: 3, 5: 10, 6: 40, 7: 180, 8: 1000, 9: 6000 },
  10: { 4: 2, 5: 6, 6: 22, 7: 90, 8: 450, 9: 2500, 10: 15000 },
};
export function KenoGame({ chips, setChips, onBack, onRebuy, startChips, lastBets = {}, setLastBet, winStreak = 0, vipPoints = 0, achCount = 0, reportLoss, applyWin = null, onBetPlaced = null, onRoundEnd, skipOverlays = false, skipEffects = false, theme: themeMode = "dark", skinTheme, skinId = "house", activePowerUps = [] }) {
  const GRID_SIZE = 40;
  const MAX_PICKS = 10;
  const DRAW_COUNT = 10;
  const [bet, setBet] = useState(() => Math.min(lastBets?.keno || 5, chips));
  useEffect(() => { if (setLastBet) setLastBet("keno", bet); }, [bet, setLastBet]);
  const [picks, setPicks] = useState([]);
  const [drawn, setDrawn] = useState([]);
  const [phase, setPhase] = useState("picking");
  const [drawIndex, setDrawIndex] = useState(0);
  const [matches, setMatches] = useState(0);
  useEffect(() => { if (phase === "result" && onRoundEnd) onRoundEnd(); }, [phase, onRoundEnd]);
  const [payout, setPayout] = useState(0);
  const [showOverlay, setShowOverlay] = useState(false);
  const [nearMiss, setNearMiss] = useState(null);
  const fx = useWinEffects();
  const { shaking, shake, shakeIntensity, floatWins, addFloatWin, flash, triggerFlash, lightMode, triggerLights,
    bigWin, setBigWin, dismissOverlay, dismissAll, celebrateWin, shellEffects, coinRainActive, triggerCoins, softCoinRain, washType, triggerWash,
    confetti, triggerConfetti, eruptionActive, triggerEruption } = fx;
  const togglePick = (num) => {
    if (phase !== "picking") return;
    if (picks.includes(num)) {
      setPicks(p => p.filter(n => n !== num));
    } else if (picks.length < MAX_PICKS) {
      setPicks(p => [...p, num]);
    }
  };
  const quickPick = (count) => {
    const nums = [];
    while (nums.length < count) {
      const n = Math.floor(Math.random() * GRID_SIZE) + 1;
      if (!nums.includes(n)) nums.push(n);
    }
    setPicks(nums.sort((a,b) => a - b));
  };
  const startDraw = () => {
    if (picks.length === 0 || chips < bet) return;
    setChips(c => c - bet);
    if (onBetPlaced) onBetPlaced(bet);
    setPhase("drawing");
    setDrawIndex(0);
    setMatches(0);
    const drawNums = [];
    while (drawNums.length < DRAW_COUNT) {
      const n = Math.floor(Math.random() * GRID_SIZE) + 1;
      if (!drawNums.includes(n)) drawNums.push(n);
    }
    let idx = 0;
    let matchCount = 0;
    const interval = setInterval(() => {
      const num = drawNums[idx];
      setDrawn(d => [...d, num]);
      setDrawIndex(idx + 1);
      if (picks.includes(num)) {
        matchCount++;
        setMatches(matchCount);
      }
      idx++;
      if (idx >= DRAW_COUNT) {
        clearInterval(interval);
        const payTable = KENO_PAYOUTS[picks.length];
        const mult = payTable && payTable[matchCount] ? payTable[matchCount] : 0;
        const winAmount = Math.floor(bet * mult);
        setPayout(winAmount);
        if (winAmount > 0) {
          if (applyWin) applyWin(winAmount); else setChips(c => c + winAmount);
          const profit = winAmount - bet;
          if (profit > 0) addFloatWin(profit, {x:50, y:30});
          triggerFlash();
          if (mult >= 500) { shake(800, "epic"); triggerLights("mega", 4000); setBigWin({type:"epic", amount:winAmount - bet}); setShowOverlay(true); }
          else if (mult >= 50) { shake(600, "heavy"); triggerLights("mega", 3000); setBigWin({type:"mega", amount:winAmount - bet}); setShowOverlay(true); }
          else if (mult >= 10) { shake(400, "normal"); triggerLights("big", 2500); setBigWin({type:"big", amount:winAmount - bet}); }
          else if (mult >= 3) { shake(200, "light"); triggerLights("win", 1500); softCoinRain(winStreak); }
          else { triggerLights("win"); softCoinRain(winStreak); }
          const nextMult = payTable && payTable[matchCount + 1] ? payTable[matchCount + 1] : 0;
          if (nextMult > mult * 3) {
            setNearMiss(`One more hit for ${nextMult}× payout!`);
          } else setNearMiss(null);
        } else {
          triggerLights("loss"); if (reportLoss) reportLoss(bet);
          const nextMult = payTable && payTable[matchCount + 1] ? payTable[matchCount + 1] : 0;
          if (nextMult > 0) {
            setNearMiss(`So close! One more hit for ${nextMult}× payout`);
          } else setNearMiss(null);
        }
        setTimeout(() => setPhase("result"), 400);
      }
    }, 200);
  };
  const reset = (keepPicks = false) => {
    fx.clearLights();
    setDrawn([]);
    setDrawIndex(0);
    setMatches(0);
    setPayout(0);
    setBet(b => Math.min(b, chips > 0 ? chips : 5));
    if (!keepPicks) setPicks([]);
    setPhase("picking");
  };
  const clearPicks = () => { if (phase === "picking") setPicks([]); };
  const handleKey = useCallback((key) => {
    if (key === " " || key === "Enter") {
      if (phase === "picking" && picks.length >= 1 && chips >= bet) startDraw();
      else if (phase === "result") reset();
    }
  }, [phase, picks.length, chips, bet, startDraw, reset]);
  const bg = "linear-gradient(180deg, #1a1a3e 0%, #12122e 50%, #0a0a20 100%)";
  const payTable = KENO_PAYOUTS[picks.length] || {};
  return (
    <GameShell bg={bg} title="Keno" chips={chips} onBack={onBack} {...shellEffects} startChips={startChips} winStreak={winStreak} vipPoints={vipPoints} achCount={achCount} skipOverlays={skipOverlays} skipEffects={skipEffects} onRebuy={onRebuy} theme={themeMode} skinTheme={skinTheme} skinId={skinId} activePowerUps={activePowerUps} onKeyAction={handleKey} nearMiss={nearMiss} rules={<>
        <p style={{marginTop:0}}>Pick numbers and hope they match the random draw!</p>
        <p><span style={{color:theme.accent}}>Pick Numbers:</span> Select 1 to 10 numbers from a grid of 40. Use Quick Pick buttons for random selections.</p>
        <p><span style={{color:theme.accent}}>The Draw:</span> 10 numbers are drawn randomly, one at a time. Matching numbers are "hits."</p>
        <p><span style={{color:theme.accent}}>Payouts:</span> Depend on how many numbers you picked and how many you hit. More picks = harder to hit all, but higher maximum payout.</p>
        <p><span style={{color:theme.accent}}>Example Payouts:</span> 1 pick/1 hit = 3.7×. 5 picks/5 hits = 200×. 10 picks/10 hits = 10,000×.</p>
        <p><span style={{color:theme.accent}}>Strategy:</span> Fewer picks give better odds of hitting but lower max payouts. More picks are lottery-style — unlikely but huge. The payout table updates based on your pick count.</p>
        <p style={{color:T.muted, fontSize:11}}>RTP: ~92%. High volatility with more picks.</p>
      </>}>
      <FloatingWins wins={floatWins} />
      {showOverlay && !skipOverlays && payout > 0 && phase === "result" && payout >= bet * 50 && (
        <BigWinOverlay type={payout >= bet * 200 ? "mega" : "big"} amount={payout - bet} onDone={() => { setShowOverlay(false); dismissAll(); }} />
      )}
      <div style={{ padding:"12px", position:"relative", zIndex:1, maxWidth:560, margin:"0 auto" }}>
        <EdgeLights mode={lightMode} color="#8b5cf6" />
        {}
        <div style={{ display:"flex", justifyContent:"center", gap:16, marginBottom:6, padding:"6px 12px",
          background:"rgba(255,240,220,0.03)", borderRadius:8, border:`1px solid ${theme.accent}14` }}>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:8, letterSpacing:2, color:T.dim, fontFamily:T.mono, textTransform:"uppercase" }}>Bet</div>
            <div style={{ fontSize:14, fontWeight:700, fontFamily:T.mono, color:theme.accent }}>${bet}</div>
          </div>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:8, letterSpacing:2, color:T.dim, fontFamily:T.mono, textTransform:"uppercase" }}>Picks</div>
            <div style={{ fontSize:14, fontWeight:700, fontFamily:T.mono, color: picks.length > 0 ? "#8b5cf6" : T.muted }}>{picks.length}/{MAX_PICKS}</div>
          </div>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:8, letterSpacing:2, color:T.dim, fontFamily:T.mono, textTransform:"uppercase" }}>Hits</div>
            <div key={matches} style={{ fontSize:14, fontWeight:700, fontFamily:T.mono, color: matches > 0 ? "#22c55e" : T.muted,
              animation: matches > 0 ? "kenoMatchCount 0.35s ease-out" : "none" }}>{matches}</div>
          </div>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:8, letterSpacing:2, color:T.dim, fontFamily:T.mono, textTransform:"uppercase" }}>Drawn</div>
            <div style={{ fontSize:14, fontWeight:700, fontFamily:T.mono, color:theme.accent }}>{drawIndex}/{DRAW_COUNT}</div>
          </div>
        </div>
        {}
        <div className="keno-grid" style={{ display:"grid", gridTemplateColumns:"repeat(8, 1fr)", gap:4, marginBottom:12 }}>
          {Array.from({ length: GRID_SIZE }, (_, i) => i + 1).map(num => {
            const isPicked = picks.includes(num);
            const isDrawn = drawn.includes(num);
            const isHit = isPicked && isDrawn;
            const isMiss = isPicked && !isDrawn && phase === "result";
            return (
              <button key={num} onClick={() => togglePick(num)}
                disabled={phase !== "picking" && !isPicked}
                style={{
                  aspectRatio:"1", display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:13, fontWeight:700, fontFamily:T.mono,
                  borderRadius:6, cursor: phase === "picking" ? "pointer" : "default",
                  transition:"all 0.15s", border:"1px solid",
                  background: isHit ? "rgba(34,197,94,0.3)"
                    : isDrawn ? `${theme.accent}26`
                    : isPicked ? "rgba(139,92,246,0.2)"
                    : "rgba(255,255,255,0.03)",
                  borderColor: isHit ? "#22c55e"
                    : isDrawn ? `${theme.accent}66`
                    : isPicked ? "#8b5cf6"
                    : "rgba(255,255,255,0.08)",
                  color: isHit ? "#22c55e"
                    : isMiss ? "#ef4444"
                    : isDrawn ? theme.accent
                    : isPicked ? "#8b5cf6"
                    : "#6a6050",
                  animation: isHit ? "kenoHitPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards" : isDrawn ? "kenoDrawPop 0.25s ease-out forwards" : undefined,
                  boxShadow: isHit ? "0 0 12px rgba(34,197,94,0.4)" : "none",
                }}>
                {num}
              </button>
            );
          })}
        </div>
        {}
        {phase === "picking" && (
          <div style={{ display:"flex", gap:6, justifyContent:"center", marginBottom:12, flexWrap:"wrap" }}>
            {[1,3,5,7,10].map(n => (
              <button key={n} onClick={() => quickPick(n)} style={{
                padding:"5px 10px", fontSize:10, fontWeight:600, fontFamily:T.mono,
                background:"rgba(139,92,246,0.1)", border:"1px solid rgba(139,92,246,0.3)",
                borderRadius:4, color:"#8b5cf6", cursor:"pointer", letterSpacing:1,
              }}>Quick {n}</button>
            ))}
            <button onClick={clearPicks} style={{
              padding:"5px 10px", fontSize:10, fontWeight:600, fontFamily:T.mono,
              background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)",
              borderRadius:4, color:T.muted, cursor:"pointer", letterSpacing:1,
            }}>Clear</button>
          </div>
        )}
        {}
        {picks.length > 0 && (
          <div style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(139,92,246,0.15)",
            borderRadius:8, padding:"8px 12px", marginBottom:12 }}>
            <div style={{ fontSize:9, letterSpacing:2, textTransform:"uppercase", color:T.dim,
              fontFamily:T.mono, marginBottom:6, textAlign:"center" }}>
              Payout Table ({picks.length} picks)
            </div>
            <div style={{ display:"flex", gap:6, justifyContent:"center", flexWrap:"wrap" }}>
              {Object.entries(payTable).map(([hits, mult]) => {
                const isActive = parseInt(hits) === matches && phase === "result";
                return (
                <div key={hits} style={{
                  padding:"3px 8px", borderRadius:4, fontSize:10, fontFamily:T.mono,
                  background: isActive ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.05)",
                  border: `1px solid ${isActive ? "#22c55e" : "rgba(255,255,255,0.08)"}`,
                  color: isActive ? "#22c55e" : "#8a8070",
                  animation: isActive ? "resultBadge 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards" : "none",
                  boxShadow: isActive ? "0 0 8px rgba(34,197,94,0.3)" : "none",
                }}>
                  {hits} hits = <span style={{ color: isActive ? "#22c55e" : theme.accent, fontWeight:600 }}>{mult}×</span>
                </div>
                );
              })}
            </div>
          </div>
        )}
        {}
        {phase === "picking" && picks.length > 0 && (
          <div style={{ textAlign:"center" }}>
            <BetControls bet={bet} setBet={setBet} chips={chips} presets={[1,2,5,10,25]} />
            <div style={{ marginTop:8 }}>
              <GoldButton onClick={startDraw} disabled={chips < bet} hint="⏎ draw">Draw Numbers</GoldButton>
            </div>
          </div>
        )}
        {phase === "picking" && picks.length === 0 && (
          <div style={{ textAlign:"center", fontSize:12, color:T.dim, fontFamily:T.mono,
            letterSpacing:1, padding:"8px 0" }}>
            Pick 1–10 numbers to play
          </div>
        )}
        {phase === "drawing" && (
          <div className="anim-spinner" style={{ textAlign:"center", fontSize:14, color:theme.accent, letterSpacing:3,
            fontFamily:T.mono }}>
            Drawing... {drawIndex}/{DRAW_COUNT}
          </div>
        )}
        {}
        {phase === "result" && (
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:18, fontWeight:700, marginBottom:12, display:"inline-block",
              fontFamily:T.serif, letterSpacing:2, padding:"5px 18px", borderRadius:8,
              color: payout > 0 ? "#22c55e" : "#ef4444",
              background: payout > 0 ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
              border: payout > 0 ? "1px solid rgba(34,197,94,0.25)" : "1px solid rgba(239,68,68,0.2)",
              textShadow: payout >= bet * 50 ? "0 0 12px rgba(34,197,94,0.4)" : "none",
              animation:"resultBadge 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards" }}>
              {payout > 0
                ? `${matches} HIT${matches > 1 ? "S" : ""} — WON $${payout.toLocaleString()}!`
                : `${matches} hit${matches !== 1 ? "s" : ""} — No payout`}
            </div>
            <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
              {bet <= chips && bet >= 1 && (
                <GoldButton onClick={() => { reset(true); setTimeout(startDraw, 50); }}>Rebet ${bet} </GoldButton>
              )}
              <GoldButton onClick={() => reset(true)} small>Same Numbers</GoldButton>
              <GoldButton onClick={() => reset(false)} small>New Numbers</GoldButton>
            </div>
          </div>
        )}
      </div>
      <div style={{ padding:"8px", fontSize:10, color:"#1a1a3e", letterSpacing:2, textTransform:"uppercase", zIndex:1 }}>
        Pick 1–10 numbers · 10 drawn · Up to 15,000× payout
      </div>
    </GameShell>
  );
}
