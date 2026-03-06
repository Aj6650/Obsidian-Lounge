import React, { useState, useEffect, useCallback } from 'react';
import { theme } from '../../theme-globals.js';
import { T } from '../../constants/styles.js';
import { GameShell } from '../../components/GameShell.jsx';
import { GoldButton } from '../../components/ui/GoldButton.jsx';
import { BetControls } from '../../components/ui/BetControls.jsx';

export function DiceFace({ value, size = 64, color = "#f5f0e8", dotColor = "#1a1a2e", rolling = false }) {
  const dotPositions = {
    1: [[50,50]],
    2: [[28,28],[72,72]],
    3: [[28,28],[50,50],[72,72]],
    4: [[28,28],[72,28],[28,72],[72,72]],
    5: [[28,28],[72,28],[50,50],[28,72],[72,72]],
    6: [[28,28],[72,28],[28,50],[72,50],[28,72],[72,72]],
  };
  const dots = dotPositions[value] || [];
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={rolling ? { animation:"spin 0.3s linear infinite" } : {}}>
      <rect x="5" y="5" width="90" height="90" rx="16" fill={color} stroke="#c8b89a" strokeWidth="3"/>
      {dots.map(([cx,cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="9" fill={dotColor}/>
      ))}
    </svg>
  );
}
export const DICE_BETS = [
  { id:"over7", label:"Over 7", desc:"Sum > 7", payout:2.33, check: (s) => s > 7 },
  { id:"under7", label:"Under 7", desc:"Sum < 7", payout:2.33, check: (s) => s < 7 },
  { id:"seven", label:"Lucky 7", desc:"Sum = 7", payout:5.8, check: (s) => s === 7 },
  { id:"doubles", label:"Doubles", desc:"Same number", payout:5.8, check: (s,a,b) => a === b },
  { id:"high", label:"High Roll", desc:"Sum ≥ 10", payout:5.8, check: (s) => s >= 10 },
  { id:"snake", label:"Snake Eyes", desc:"Double 1s", payout:34, check: (s,a,b) => a === 1 && b === 1 },
];
export function DiceGame({ chips, setChips, onBack, onRebuy, startChips, lastBets = {}, setLastBet, winStreak = 0, vipPoints = 0, achCount = 0, reportLoss, applyWin = null, onBetPlaced = null, onRoundEnd, skipOverlays = false, skipEffects = false, theme: themeMode = "dark", skinTheme, skinId = "house", activePowerUps = [] }) {
  const [bet, setBet] = useState(() => Math.min(lastBets?.dice || 25, chips));
  useEffect(() => { if (setLastBet) setLastBet("dice", bet); }, [bet, setLastBet]);
  const [selectedBet, setSelectedBet] = useState("over7");
  const [die1, setDie1] = useState(1);
  const [die2, setDie2] = useState(6);
  const [phase, setPhase] = useState("betting");
  const [resultMsg, setResultMsg] = useState("");
  const [won, setWon] = useState(false);
  const [winAmount, setWinAmount] = useState(0);
  const [history, setHistory] = useState([]);
  useEffect(() => { if (phase === "result" && onRoundEnd) onRoundEnd(); }, [phase, onRoundEnd]);
  const fx = useWinEffects();
  const { shaking, shake, shakeIntensity, floatWins, addFloatWin, flash, triggerFlash, lightMode, triggerLights,
    bigWin, setBigWin, dismissOverlay, dismissAll, celebrateWin, shellEffects, coinRainActive, triggerCoins, softCoinRain, washType, triggerWash,
    confetti, triggerConfetti, eruptionActive, triggerEruption } = fx;
  const roll = () => {
    if (chips < bet) return;
    setChips(c => c - bet);
    if (onBetPlaced) onBetPlaced(bet);
    setPhase("rolling");
    setResultMsg("");
    let rollCount = 0;
    const rollInterval = setInterval(() => {
      setDie1(Math.floor(Math.random() * 6) + 1);
      setDie2(Math.floor(Math.random() * 6) + 1);
      rollCount++;
      if (rollCount >= 12) {
        clearInterval(rollInterval);
        const d1 = Math.floor(Math.random() * 6) + 1;
        const d2 = Math.floor(Math.random() * 6) + 1;
        setDie1(d1);
        setDie2(d2);
        const sum = d1 + d2;
        const betInfo = DICE_BETS.find(b => b.id === selectedBet);
        const isWin = betInfo.check(sum, d1, d2);
        if (isWin) {
          const payout = Math.floor(bet * betInfo.payout);
          if (applyWin) applyWin(payout); else setChips(c => c + payout);
          setWon(true);
          setWinAmount(payout);
          setResultMsg(`${betInfo.label}! ${d1} + ${d2} = ${sum} — Won +$${payout - bet}`);
          triggerFlash();
          const profit = payout - bet;
          if (profit > 0) addFloatWin(profit, {x:50, y:30});
          if (betInfo.payout >= 5) { shake(); triggerLights("big"); setBigWin({type:betInfo.payout>=20?"mega":"big",amount:profit}); }
          else { triggerLights("win"); softCoinRain(winStreak); }
        } else {
          setWon(false);
          setWinAmount(0);
          setResultMsg(`${d1} + ${d2} = ${sum} — ${betInfo.label} loses`);
          triggerLights("loss");
          if (reportLoss) reportLoss(bet);
        }
        setHistory(h => [...h.slice(-19), { d1, d2, sum, won: isWin }]);
        setPhase("result");
      }
    }, 60);
  };
  const reset = () => {
    setBigWin(null);
    fx.clearLights();
    setBet(b => Math.min(b, chips > 0 ? chips : 25));
    setPhase("betting");
    setResultMsg("");
  };
  const handleKey = useCallback((key) => {
    if (phase === "betting") {
      if ((key === " " || key === "Enter") && chips >= bet) roll();
    } else if (phase === "result") {
      if (key === " " || key === "Enter") reset();
    }
  }, [phase, chips, bet, roll, reset]);
  const bg = "linear-gradient(180deg, #2a1a2e 0%, #1a0d1f 50%, #140a1a 100%)";
  return (
    <GameShell bg={bg} title="Dice" chips={chips} onBack={onBack} {...shellEffects} startChips={startChips} winStreak={winStreak} vipPoints={vipPoints} achCount={achCount} skipOverlays={skipOverlays} skipEffects={skipEffects} onRebuy={onRebuy} theme={themeMode} skinTheme={skinTheme} skinId={skinId} activePowerUps={activePowerUps} onKeyAction={handleKey} rules={<>
        <p style={{marginTop:0}}>Choose a bet type, then roll two dice to see if you win.</p>
        <p><span style={{color:theme.accent}}>Over 7:</span> Sum of both dice is greater than 7. Pays 2.33×.</p>
        <p><span style={{color:theme.accent}}>Under 7:</span> Sum is less than 7. Pays 2.33×.</p>
        <p><span style={{color:theme.accent}}>Lucky 7:</span> Sum is exactly 7. Pays 5.8×.</p>
        <p><span style={{color:theme.accent}}>Doubles:</span> Both dice show the same number. Pays 5.8×.</p>
        <p><span style={{color:theme.accent}}>High Roll:</span> Sum is 10 or higher. Pays 5.8×.</p>
        <p><span style={{color:theme.accent}}>Snake Eyes:</span> Both dice show 1. Pays 34×.</p>
        <p><span style={{color:theme.accent}}>Odds:</span> Two dice produce sums from 2–12. 7 is the most common (6 ways), while 2 and 12 are rarest (1 way each).</p>
        <p style={{color:T.muted, fontSize:11}}>House edge: ~3% average across bet types.</p>
      </>}>
      <FloatingWins wins={floatWins} />
      {bigWin && !skipOverlays && <BigWinOverlay type={bigWin.type} amount={bigWin.amount} onDone={dismissOverlay} />}
      <div style={{ padding:"12px", position:"relative", zIndex:1, maxWidth:540, margin:"0 auto" }}>
        <EdgeLights mode={lightMode} color="#ec4899" />
        {}
        <div style={{ display:"flex", justifyContent:"center", gap:16, marginBottom:6, padding:"6px 12px",
          background:"rgba(255,240,220,0.03)", borderRadius:8, border:`1px solid ${theme.accent}14` }}>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:8, letterSpacing:2, color:T.dim, fontFamily:T.mono, textTransform:"uppercase" }}>Bet</div>
            <div style={{ fontSize:14, fontWeight:700, fontFamily:T.mono, color:theme.accent }}>${bet}</div>
          </div>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:8, letterSpacing:2, color:T.dim, fontFamily:T.mono, textTransform:"uppercase" }}>Type</div>
            <div style={{ fontSize:12, fontWeight:700, fontFamily:T.mono, color:"#ec4899" }}>{DICE_BETS.find(b=>b.id===selectedBet)?.label || "—"}</div>
          </div>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:8, letterSpacing:2, color:T.dim, fontFamily:T.mono, textTransform:"uppercase" }}>Payout</div>
            <div style={{ fontSize:14, fontWeight:700, fontFamily:T.mono, color:T.textMuted }}>{DICE_BETS.find(b=>b.id===selectedBet)?.payout || 0}×</div>
          </div>
          {history.length > 0 && <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:8, letterSpacing:2, color:T.dim, fontFamily:T.mono, textTransform:"uppercase" }}>Last</div>
            <div style={{ fontSize:14, fontWeight:700, fontFamily:T.mono, color: history[history.length-1]?.won ? "#22c55e" : "#e74c3c" }}>{history[history.length-1]?.sum || "—"}</div>
          </div>}
        </div>
        {}
        <div style={{ display:"flex", justifyContent:"center", gap:20, marginBottom:8, padding:"16px 0" }}>
          <div style={{ animation: phase === "rolling" ? "diceRoll 0.6s ease-out infinite" : phase === "result" ? "diceSlam 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)" : undefined,
            transition:"transform 0.3s",
            ...(phase === "result" && won ? { filter:"drop-shadow(0 0 8px rgba(34,197,94,0.4))" } : {}),
          }}>
            <DiceFace value={die1} size={88} rolling={phase === "rolling"} />
          </div>
          <div style={{ animation: phase === "rolling" ? "diceRoll 0.6s ease-out infinite 0.15s" : phase === "result" ? "diceSlam 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) 0.08s both" : undefined,
            transition:"transform 0.3s",
            ...(phase === "result" && won ? { filter:"drop-shadow(0 0 8px rgba(34,197,94,0.4))" } : {}),
          }}>
            <DiceFace value={die2} size={88} rolling={phase === "rolling"} />
          </div>
        </div>
        {(phase === "result" || phase === "betting") && (
          <div style={{ textAlign:"center", fontSize:13, fontFamily:T.mono,
            color:T.muted, marginBottom:12, letterSpacing:1,
            animation: phase === "result" ? "diceSumReveal 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards" : "none" }}>
            Sum: <span style={{ color: phase === "result" && won ? "#22c55e" : theme.accent, fontWeight:700, fontSize: phase === "result" ? 18 : 16,
              textShadow: phase === "result" && won ? "0 0 10px rgba(34,197,94,0.3)" : "none",
              transition:"font-size 0.3s" }}>{die1 + die2}</span>
          </div>
        )}
        {}
        {resultMsg && (
          <div style={{ textAlign:"center", marginBottom:14 }}>
            <div style={{ fontSize:15, fontWeight:700, letterSpacing:2,
              fontFamily:T.serif, display:"inline-block",
              padding:"4px 16px", borderRadius:8,
              color: won ? "#22c55e" : "#ef4444",
              background: won ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
              border: won ? "1px solid rgba(34,197,94,0.25)" : "1px solid rgba(239,68,68,0.2)",
              textShadow: won && winAmount >= bet * 5 ? "0 0 10px rgba(34,197,94,0.3)" : "none",
              animation:"resultBadge 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards" }}>
              {resultMsg}
            </div>
          </div>
        )}
        {}
        {phase === "betting" && (
          <>
            <div style={{ fontSize:9, letterSpacing:2, color:T.dim, fontFamily:T.mono,
              textTransform:"uppercase", textAlign:"center", marginBottom:8 }}>Choose your bet</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:6, marginBottom:14 }}>
              {DICE_BETS.map(b => {
                const isSel = selectedBet === b.id;
                return (
                <button key={b.id} onClick={() => setSelectedBet(b.id)} style={{
                  padding:"10px 6px", textAlign:"center", cursor:"pointer",
                  background: isSel ? "rgba(236,72,153,0.15)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${isSel ? "#ec4899" : "rgba(255,255,255,0.1)"}`,
                  borderRadius:8, transition:"all 0.2s",
                  animation: isSel ? "diceBetPick 0.25s ease-out" : "none",
                  boxShadow: isSel ? "0 0 12px rgba(236,72,153,0.15)" : "none",
                }}>
                  <div style={{ fontSize:12, fontWeight:700, color: isSel ? "#ec4899" : "#e8e0d0",
                    fontFamily:T.serif, letterSpacing:1 }}>{b.label}</div>
                  <div style={{ fontSize:9, color:"#6a6050", fontFamily:T.mono, marginTop:2 }}>{b.desc}</div>
                  <div style={{ fontSize:10, color:theme.accent, fontFamily:T.mono, marginTop:3, fontWeight:600 }}>{b.payout}×</div>
                </button>
                );
              })}
            </div>
            <BetControls bet={bet} setBet={setBet} chips={chips} presets={[5,10,25,50,100]} />
            <div style={{ textAlign:"center", marginTop:8 }}>
              <GoldButton onClick={roll} disabled={chips < bet || bet <= 0} hint="⏎ roll">Roll Dice</GoldButton>
            </div>
          </>
        )}
        {phase === "rolling" && (
          <div style={{ textAlign:"center", fontSize:14, color:theme.accent, letterSpacing:3, fontFamily:T.mono }}>
            Rolling...
          </div>
        )}
        {phase === "result" && (
          <div style={{ display:"flex", gap:8, justifyContent:"center", flexWrap:"wrap", marginTop:8 }}>
            <GoldButton onClick={reset} small>Change Bet</GoldButton>
            {bet <= chips && bet >= 1 && (
              <GoldButton onClick={() => { reset(); setTimeout(roll, 50); }}>Rebet ${bet} </GoldButton>
            )}
          </div>
        )}
        {}
        {history.length > 0 && (
          <div style={{ marginTop:16, display:"flex", gap:4, justifyContent:"center", flexWrap:"wrap" }}>
            {history.map((h, i) => {
              const isLatest = i === history.length - 1;
              return (
              <div key={`${h.d1}${h.d2}-${i}`} style={{ fontSize:10, padding:"3px 6px", borderRadius:4,
                fontFamily:T.mono, fontWeight:600,
                background: h.won ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.05)",
                color: h.won ? "#22c55e" : "#6a6050",
                border: `1px solid ${h.won ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.08)"}`,
                animation: isLatest ? "multBounceIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards" : "none",
                boxShadow: isLatest && h.won ? "0 0 6px rgba(34,197,94,0.25)" : "none",
              }}>
                {h.sum}
              </div>
              );
            })}
          </div>
        )}
      </div>
      <div style={{ padding:"8px", fontSize:10, color:"#2a1a2e", letterSpacing:2, textTransform:"uppercase", zIndex:1 }}>
        Pick a bet · Roll the dice · 3.5% house edge
      </div>
    </GameShell>
  );
}
