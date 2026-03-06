import React, { useState, useEffect, useRef, useCallback } from 'react';
import { theme } from '../../theme-globals.js';
import { T } from '../../constants/styles.js';
import { GameShell } from '../../components/GameShell.jsx';
import { GoldButton } from '../../components/ui/GoldButton.jsx';
import { BetControls } from '../../components/ui/BetControls.jsx';

export const PLINKO_ROWS = 12;
export const PLINKO_SLOTS = PLINKO_ROWS + 1;
export const PLINKO_MULTS = [100, 20, 6, 2.2, 0.7, 0.4, 0.5, 0.4, 0.7, 2.2, 6, 20, 100];
export const PLINKO_COLORS = ["#dc2626","#ea580c","#f97316","#facc15","#84cc16","#22c55e","#15803d","#22c55e","#84cc16","#facc15","#f97316","#ea580c","#dc2626"];
export const TEAL_BG = "radial-gradient(ellipse at center, #14100c 0%, #0c0a08 60%, #080604 100%)";
export const PBW = 340, PBH = 420, PPX = 6, PPT = 40;
export const PRWH = (PBH - PPT - 55) / PLINKO_ROWS;
export const PSLY = PPT + PLINKO_ROWS * PRWH + 8;
export const PPEGR = 4;
export const PBALLR = 5.5;
export const PSLOT_TOTAL_W = PBW - PPX * 2;
export const PSLOT_W = PSLOT_TOTAL_W / PLINKO_SLOTS;
export const PSLOT_EDGES = [];
(() => {
  for (let i = 0; i <= PLINKO_SLOTS; i++) {
    PSLOT_EDGES.push(PPX + i * PSLOT_W);
  }
})();
export const PPEGS = [];
(() => {
  const botPegs = PLINKO_ROWS + 2;
  const totalW = PBW - PPX * 2;
  const hSpace = totalW / (botPegs - 1);
  for (let row = 0; row < PLINKO_ROWS; row++) {
    const n = row + 3;
    const rowW = (n - 1) * hSpace;
    const startX = PBW / 2 - rowW / 2;
    const y = PPT + row * PRWH;
    for (let col = 0; col < n; col++) {
      PPEGS.push({ x: startX + col * hSpace, y });
    }
  }
})();
let _pBallId = 0;
export function generatePlinkoPath() {
  const botPegs = PLINKO_ROWS + 2;
  const totalW = PBW - PPX * 2;
  const hSpace = totalW / (botPegs - 1);
  const choices = [];
  for (let i = 0; i < PLINKO_ROWS; i++) choices.push(Math.random() < 0.5 ? 0 : 1);
  const slot = choices.reduce((a, b) => a + b, 0);
  const waypoints = [];
  waypoints.push({ x: PBW / 2, y: PPT - 15 });
  let gap = 0;
  for (let row = 0; row < PLINKO_ROWS; row++) {
    gap += choices[row];
    const n = row + 3;
    const rowW = (n - 1) * hSpace;
    const startX = PBW / 2 - rowW / 2;
    const gx = startX + gap * hSpace + hSpace / 2;
    const gy = PPT + row * PRWH + PRWH * 0.6;
    waypoints.push({ x: gx + (Math.random() - 0.5) * 6, y: gy });
  }
  waypoints.push({ x: PSLOT_EDGES[slot] + PSLOT_W / 2, y: PSLY });
  return { waypoints, slot };
}
function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}
export function simPlinkoBall(b, dt) {
  if (b.landed) return b;
  const elapsed = b.elapsed + dt;
  const path = b.path;
  const maxIdx = path.length - 1;
  const segTimes = b.segTimes;
  const totalTime = segTimes[segTimes.length - 1];
  if (elapsed >= totalTime) {
    const final = path[maxIdx];
    return { ...b, x: final.x, y: final.y, elapsed, landed: true, slot: b.targetSlot, landTime: Date.now() };
  }
  let seg = 0;
  for (let i = 0; i < segTimes.length - 1; i++) {
    if (elapsed < segTimes[i + 1]) { seg = i; break; }
  }
  const segStart = segTimes[seg];
  const segEnd = segTimes[seg + 1];
  const segDur = segEnd - segStart;
  const localT = Math.min(1, (elapsed - segStart) / segDur);
  const from = path[seg];
  const to = path[seg + 1];
  const yT = localT * localT;
  const y = from.y + (to.y - from.y) * yT;
  const xRaw = easeInOut(localT);
  const bounce = localT > 0.85 ? Math.sin((localT - 0.85) / 0.15 * Math.PI) * 1.5 : 0;
  const x = from.x + (to.x - from.x) * xRaw + bounce * (to.x > from.x ? -1 : 1);
  return { ...b, x, y, elapsed };
}
export function PlinkoGame({ chips, setChips, onBack, onRebuy, startChips, lastBets = {}, setLastBet, winStreak = 0, vipPoints = 0, achCount = 0, reportLoss, applyWin = null, applyChipsReturn = null, onBetPlaced = null, onRoundEnd, skipOverlays = false, skipEffects = false, theme: themeMode = "dark", skinTheme, skinId = "house", activePowerUps = [] }) {
  const [bet, setBet] = useState(() => Math.min(lastBets?.plinko || 5, chips));
  useEffect(() => { if (setLastBet) setLastBet("plinko", bet); }, [bet, setLastBet]);
  const [message, setMessage] = useState("Drop the ball");
  const [resultColor, setResultColor] = useState(theme.accent);
  const [history, setHistory] = useState([]);
  const [slotFlashes, setSlotFlashes] = useState({});
  const [, forceRender] = useState(0);
  const fx = useWinEffects();
  const { shaking, shake, shakeIntensity, floatWins, addFloatWin, flash, triggerFlash, lightMode, triggerLights,
    bigWin, setBigWin, dismissOverlay, dismissAll, celebrateWin, shellEffects, coinRainActive, triggerCoins, softCoinRain, washType, triggerWash,
    confetti, triggerConfetti, eruptionActive, triggerEruption } = fx;
  const ballsRef = useRef([]);
  const rafRef = useRef(null);
  const lastTRef = useRef(0);
  const paidRef = useRef(new Set());
  useEffect(() => {
    const tick = (ts) => {
      const dt = lastTRef.current ? Math.min((ts - lastTRef.current) / 1000, 0.04) : 0.016;
      lastTRef.current = ts;
      let dirty = false;
      const now = Date.now();
      for (let i = 0; i < ballsRef.current.length; i++) {
        const b = ballsRef.current[i];
        if (!b.landed) {
          ballsRef.current[i] = simPlinkoBall(b, dt);
          dirty = true;
          if (ballsRef.current[i].landed && !paidRef.current.has(b.id)) {
            paidRef.current.add(b.id);
            const slot = ballsRef.current[i].slot;
            const mult = PLINKO_MULTS[slot] || 0.2;
            const win = Math.round(b.bet * mult);
            if (mult >= 1) { if (applyWin) applyWin(win); else setChips(c => c + win); }
            else { if (applyChipsReturn) applyChipsReturn(win); else setChips(c => c + win); }
            setHistory(h => [mult, ...h].slice(0, 12));
            setSlotFlashes(f => ({ ...f, [slot]: now }));
            if (mult >= 26) {
              shake(600, "heavy");
              triggerFlash();
              addFloatWin(win, { x: 50, y: 40, bigThreshold: 0, megaThreshold: b.bet * 20 });
              setBigWin({ type: "mega", amount: win - b.bet });
              triggerLights("mega", 3000);
            } else if (mult >= 9) {
              shake(500, "normal");
              triggerFlash();
              addFloatWin(win, { x: 50, y: 40, bigThreshold: 0, megaThreshold: b.bet * 20 });
              setBigWin({ type: "big", amount: win - b.bet });
              triggerLights("big", 3000);
            } else if (mult >= 4) {
              shake(300, "light");
              triggerFlash();
              addFloatWin(win, { x: 40 + Math.random()*20, y: 50 });
              triggerLights("win", 1500);
              softCoinRain(winStreak);
            } else if (mult >= 1) {
              const profit = win - b.bet;
              if (profit > 0) { addFloatWin(profit, { x: 40 + Math.random()*20, y: 55 }); softCoinRain(winStreak); }
              triggerLights("win", 1000);
            }
            if (mult >= 1) { setMessage(`${mult}x — +$${win - b.bet}!`); setResultColor(mult >= 3 ? "#f1c40f" : "#27ae60"); }
            else { setMessage(`${mult}x — $${win} back`); setResultColor("#e74c3c"); if (reportLoss) reportLoss(b.bet); }
            const allDone = ballsRef.current.every(bb => bb.landed);
            if (allDone && onRoundEnd) onRoundEnd();
          }
        }
      }
      const len = ballsRef.current.length;
      ballsRef.current = ballsRef.current.filter(b => !b.landed || now - b.landTime < 1500);
      if (ballsRef.current.length !== len) dirty = true;
      if (dirty) forceRender(n => n + 1);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);
  const drop = () => {
    if (bet > chips || bet < 1) return;
    setChips(c => c - bet);
    if (onBetPlaced) onBetPlaced(bet);
    setBigWin(null);
    const { waypoints, slot } = generatePlinkoPath();
    const segTimes = [0];
    let cumT = 0;
    for (let i = 0; i < waypoints.length - 1; i++) {
      const dy = Math.max(5, waypoints[i + 1].y - waypoints[i].y);
      const segDur = 0.06 + Math.sqrt(dy / 800);
      cumT += segDur;
      segTimes.push(cumT);
    }
    ballsRef.current.push({
      id: ++_pBallId,
      x: waypoints[0].x,
      y: waypoints[0].y,
      path: waypoints,
      segTimes,
      elapsed: 0,
      targetSlot: slot,
      bet,
      landed: false,
      slot: -1,
      landTime: 0,
      spawnTime: Date.now(),
    });
    setMessage("Dropping...");
    setResultColor(theme.accent);
  };
  const handleKey = useCallback((key) => {
    if ((key === " " || key === "Enter") && bet <= chips && bet >= 1) drop();
  }, [bet, chips, drop]);
  const balls = ballsRef.current;
  const activeBalls = balls.filter(b => !b.landed);
  return (
    <GameShell bg={TEAL_BG} title="PLINKO" chips={chips} onBack={onBack} {...shellEffects} startChips={startChips} winStreak={winStreak} vipPoints={vipPoints} achCount={achCount} skipOverlays={skipOverlays} skipEffects={skipEffects} onRebuy={onRebuy} theme={themeMode} skinTheme={skinTheme} skinId={skinId} activePowerUps={activePowerUps} onKeyAction={handleKey} rules={<>
        <p style={{marginTop:0}}>Drop a ball from the top and watch it bounce through 12 rows of pegs into a payout slot.</p>
        <p><span style={{color:theme.accent}}>How It Works:</span> The ball bounces left or right at each peg with roughly 50/50 probability. The final slot determines your payout multiplier.</p>
        <p><span style={{color:theme.accent}}>Payouts:</span> Center slots pay 0.3×–1.0× (most likely). Edge slots pay up to 26× your bet (least likely).</p>
        <p><span style={{color:theme.accent}}>Slot Values:</span> From edge to center: 26×, 9×, 4×, 2×, 1.4×, 1.0×, 0.3× — then mirrors back out.</p>
        <p><span style={{color:theme.accent}}>Strategy:</span> No strategy — it's pure probability. The ball's path is random. Edge hits are rare but rewarding.</p>
        <p style={{color:T.muted, fontSize:11}}>RTP: ~93.6%. Medium volatility.</p>
      </>}>
      <FloatingWins wins={floatWins} />
      {bigWin && !skipOverlays && <BigWinOverlay type={bigWin.type} amount={bigWin.amount} onDone={dismissOverlay} />}
      {history.length > 0 && (
        <div style={{ display: "flex", gap: 4, margin: "8px 0", zIndex: 1, flexWrap: "wrap", justifyContent: "center" }}>
          {history.map((m, i) => (
            <div key={`${m}-${i}-${history.length}`} style={{
              padding: "2px 8px", borderRadius: 10, fontSize: 10, fontWeight: 700,
              fontFamily: T.mono,
              background: m >= 3 ? "rgba(220,38,38,0.3)" : m >= 1 ? "rgba(132,204,22,0.2)" : "rgba(100,100,100,0.2)",
              color: m >= 3 ? "#ef4444" : m >= 1 ? "#84cc16" : "#888",
              opacity: 1 - i * 0.06,
              animation: i === 0 ? "multBounceIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards" : "none",
              boxShadow: i === 0 && m >= 3 ? "0 0 8px rgba(239,68,68,0.3)" : "none",
            }}>{m}x</div>
          ))}
        </div>
      )}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 12, padding: "0 16px", zIndex: 1 }}>
        <div style={{ fontSize: 16, fontWeight: 600, textAlign: "center", minHeight: 24, letterSpacing: 1, color: resultColor, animation: "fadeIn 0.3s ease" }}>{message}</div>
        <div className="plinko-board" style={{ position:"relative", padding:8, maxWidth:"100%", width: PBW + 16 }}>
          <EdgeLights mode={lightMode} color="#22c55e" />
          <svg viewBox={`0 0 ${PBW} ${PBH}`} style={{ overflow: "visible", width:"100%", height:"auto", maxHeight:"55vh" }}>
            <rect x="0" y="0" width={PBW} height={PBH} rx="12" fill="rgba(0,0,0,0.3)" stroke={`${theme.accent}26`} strokeWidth="1" />
          {}
          {PPEGS.map((peg, i) => {
            let lit = false;
            let closest = Infinity;
            for (const b of balls) {
              if (b.landed) continue;
              const dx = b.x - peg.x, dy = b.y - peg.y;
              const dist = dx * dx + dy * dy;
              if (dist < 500) { lit = true; }
              if (dist < closest) closest = dist;
            }
            const nearGlow = closest < 2000 && !lit ? Math.max(0, 1 - closest / 2000) : 0;
            return (
              <g key={i}>
                {lit && <circle cx={peg.x} cy={peg.y} r={PPEGR + 4} fill="none" stroke={`${theme.accent}66`} strokeWidth="2" opacity="0.6">
                  <animate attributeName="opacity" from="0.6" to="0" dur="0.4s" fill="freeze"/>
                  <animate attributeName="r" from={PPEGR + 2} to={PPEGR + 8} dur="0.4s" fill="freeze"/>
                </circle>}
                <circle cx={peg.x} cy={peg.y} r={PPEGR} fill={theme.accent}
                  opacity={lit ? 1 : 0.45 + nearGlow * 0.3}
                  style={{ transition: "opacity 0.15s", filter: lit ? `drop-shadow(0 0 4px ${theme.accent}99)` : "none" }} />
              </g>
            );
          })}
          {}
          {PLINKO_MULTS.map((mult, i) => {
            const sx = PSLOT_EDGES[i];
            const sw = PSLOT_W;
            const flashTime = slotFlashes[i] || 0;
            const isFlash = Date.now() - flashTime < 500;
            const fs = mult >= 10 ? 7 : 8;
            return (
              <g key={i}>
                <rect x={sx + 0.5} y={PSLY} width={sw - 1} height={22} rx="3"
                  fill={isFlash ? PLINKO_COLORS[i] : `${PLINKO_COLORS[i]}33`}
                  stroke={isFlash ? "#fff" : `${PLINKO_COLORS[i]}66`} strokeWidth={isFlash ? 2 : 0.5}
                  style={{ transition: "all 0.2s" }}>
                  {isFlash && <animate attributeName="opacity" values="1;0.7;1" dur="0.4s" repeatCount="2"/>}
                </rect>
                <text x={sx + sw / 2} y={PSLY + 14} fill={isFlash ? "#fff" : PLINKO_COLORS[i]}
                  fontSize={fs} fontWeight="700" fontFamily="'JetBrains Mono', monospace"
                  textAnchor="middle" dominantBaseline="central" opacity={isFlash ? 1 : 0.7}
                  style={isFlash ? {filter:`drop-shadow(0 0 4px ${PLINKO_COLORS[i]})`} : {}}>{mult}x</text>
                {}
                {isFlash && (
                  <circle cx={sx + sw/2} cy={PSLY + 11} r="5" fill="none"
                    stroke={PLINKO_COLORS[i]} strokeWidth="2" opacity="0.8">
                    <animate attributeName="r" from="5" to="25" dur="0.5s" fill="freeze"/>
                    <animate attributeName="opacity" from="0.8" to="0" dur="0.5s" fill="freeze"/>
                    <animate attributeName="stroke-width" from="2.5" to="0.3" dur="0.5s" fill="freeze"/>
                  </circle>
                )}
                {}
                {isFlash && mult >= 4 && Array.from({length:6}, (_, j) => (
                  <circle key={`sp${j}`} cx={sx + sw/2 + (Math.random()-0.5)*20} cy={PSLY + (Math.random()-0.5)*10}
                    r={2 + Math.random()*2} fill={PLINKO_COLORS[i]} opacity={0.8}>
                    <animate attributeName="opacity" from="0.8" to="0" dur="0.5s" fill="freeze"/>
                    <animate attributeName="cy" from={PSLY} to={PSLY - 15 - Math.random()*20} dur="0.5s" fill="freeze"/>
                  </circle>
                ))}
              </g>
            );
          })}
          {}
          {balls.map(b => {
            const fade = b.landed ? Math.max(0, 1 - (Date.now() - b.landTime) / 1500) : 1;
            if (fade <= 0) return null;
            const centerDist = Math.abs(b.x - PBW/2) / (PBW/2);
            const glowIntensity = Math.min(1, centerDist * 1.5);
            const glowColor = `rgba(239,68,68,${0.2 + glowIntensity * 0.5})`;
            return (
              <g key={b.id} opacity={fade}>
                {}
                {!b.landed && glowIntensity > 0.2 && (
                  <circle cx={b.x} cy={b.y} r={PBALLR + 4 + glowIntensity * 6} fill="none"
                    stroke={glowColor} strokeWidth={1 + glowIntensity * 2} opacity={glowIntensity * 0.6}/>
                )}
                {}
                {!b.landed && b.elapsed > 0.1 && (
                  <>
                    <circle cx={b.x + (Math.random()-0.5)*2} cy={b.y - 8} r={2} fill="#ef4444" opacity={0.3}/>
                    <circle cx={b.x + (Math.random()-0.5)*3} cy={b.y - 16} r={1.5} fill="#ef4444" opacity={0.15}/>
                  </>
                )}
                <ellipse cx={b.x} cy={b.y + 5} rx={PBALLR - 1} ry="2.5" fill="rgba(0,0,0,0.25)" />
                <circle cx={b.x} cy={b.y} r={PBALLR} fill="#ef4444" stroke="#fff" strokeWidth="1.5" />
                <circle cx={b.x - 1.8} cy={b.y - 1.8} r="2" fill="rgba(255,255,255,0.3)" />
              </g>
            );
          })}
          {}
          {balls.length === 0 && (
            <g opacity="0.35">
              <line x1={PBW / 2} y1="6" x2={PBW / 2} y2="24" stroke={theme.accent} strokeWidth="1" strokeDasharray="3,3" />
              <polygon points={`${PBW/2-6},8 ${PBW/2+6},8 ${PBW/2},18`} fill={theme.accent} />
            </g>
          )}
        </svg>
        </div>
      </div>
      <div style={{ padding: "16px", width: "100%", maxWidth: 500, zIndex: 1 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          <BetControls bet={bet} setBet={setBet} chips={chips} presets={[1, 5, 10, 25, 50]} />
          <GoldButton onClick={drop} disabled={bet > chips || bet < 1} hint="⏎ drop">Drop</GoldButton>
        </div>
      </div>
      <div style={{ padding: "8px", fontSize: 10, color: "#2a4040", letterSpacing: 2, textTransform: "uppercase", zIndex: 1 }}>{PLINKO_ROWS} Rows · Edge Pays 26x · 94% RTP</div>
    </GameShell>
  );
}
export const CRASH_BG = "radial-gradient(ellipse at center, #1a2e1a 0%, #0f1a0f 60%, #081008 100%)";
function generateCrashPoint() {
  const r = Math.random();
  return Math.max(1.0, 0.96 / r);
}
