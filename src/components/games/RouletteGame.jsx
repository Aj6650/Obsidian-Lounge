import React, { useState, useCallback, useEffect, useRef } from 'react';
import { theme } from '../../theme-globals.js';
import { T, RED_BG } from '../../constants/styles.js';
import { GameShell } from '../../components/GameShell.jsx';
import { GoldButton } from '../../components/ui/GoldButton.jsx';
import { BetControls } from '../../components/ui/BetControls.jsx';

export const WHEEL_ORDER = [0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26];
export const RED_NUMS = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);
const numColor = (n) => n===0?"#15803d":RED_NUMS.has(n)?"#dc2626":"#1e1e2e";
const numColorLight = (n) => n===0?"#22c55e":RED_NUMS.has(n)?"#ef4444":"#e8e0d0";
export function RouletteWheel({ spinning, resultIdx, onFinish }) {
  const segAngle = 360 / WHEEL_ORDER.length;
  const S = 340, center = S / 2;
  const outerRim = 155;
  const trackOuter = 148;
  const trackCenter = 140;
  const trackInner = 132;
  const pocketOuter = 128;
  const pocketInner = 100;
  const innerR = 52;
  const ballR = 6;
  const [ballState, setBallState] = useState(null);
  const [launchPhase, setLaunchPhase] = useState("idle");
  const animRef = useRef(null);
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;
  useEffect(() => {
    if (spinning && resultIdx !== null) {
      const targetDeg = resultIdx * segAngle + segAngle / 2;
      const fullSpins = 5;
      const totalDeg = fullSpins * 360 + targetDeg;
      const spinDuration = 5500;
      const readyDelay = 500;
      const flickDelay = 400;
      setBallState({ angleDeg: 0, radius: trackCenter });
      setLaunchPhase("ready");
      const flickTimer = setTimeout(() => {
        setLaunchPhase("flick");
      }, readyDelay);
      let start = null;
      const animate = (ts) => {
        if (!start) start = ts;
        const t = Math.min((ts - start) / spinDuration, 1);
        if (t > 0.01) setLaunchPhase("spinning");
        let eased;
        if (t < 0.03) {
          eased = (t / 0.03) * (1 - Math.pow(1 - 0.03, 2.2));
        } else {
          eased = 1 - Math.pow(1 - t, 2.2);
        }
        const angleDeg = eased * totalDeg;
        let radius;
        if (t < 0.55) {
          const wobble = Math.sin(t * 80) * 1.2 * (1 - t / 0.55);
          radius = trackCenter + wobble;
        } else if (t < 0.72) {
          const dropT = (t - 0.55) / 0.17;
          const dropEased = dropT * dropT;
          radius = trackCenter + (pocketOuter - trackCenter) * dropEased;
          const bounce = Math.sin(dropT * Math.PI * 3) * 4 * (1 - dropT);
          radius += bounce;
        } else {
          const settleT = (t - 0.72) / 0.28;
          const settleEased = 1 - Math.pow(1 - settleT, 1.8);
          const pocketCenter = (pocketOuter + pocketInner) / 2;
          radius = pocketOuter + (pocketCenter - pocketOuter) * settleEased;
          const rattle = Math.sin(settleT * Math.PI * 5) * 2.5 * Math.pow(1 - settleT, 2.5);
          radius += rattle;
        }
        setBallState({ angleDeg, radius });
        if (t < 1) {
          animRef.current = requestAnimationFrame(animate);
        } else {
          setBallState({ angleDeg: totalDeg, radius: (pocketOuter + pocketInner) / 2 });
          setTimeout(() => { if (onFinishRef.current) onFinishRef.current(); }, 400);
        }
      };
      const launchTimer = setTimeout(() => {
        animRef.current = requestAnimationFrame(animate);
      }, readyDelay + flickDelay);
      return () => { clearTimeout(flickTimer); clearTimeout(launchTimer); if (animRef.current) cancelAnimationFrame(animRef.current); };
    }
    if (!spinning && resultIdx === null) { setBallState(null); setLaunchPhase("idle"); }
  }, [spinning, resultIdx]);
  let ballX = center, ballY = center - trackCenter;
  if (ballState) {
    const rad = (ballState.angleDeg - 90) * Math.PI / 180;
    ballX = center + ballState.radius * Math.cos(rad);
    ballY = center + ballState.radius * Math.sin(rad);
  }
  return (
    <div style={{ position:"relative", width:"100%", maxWidth:S, aspectRatio:"1/1" }}>
      <svg width="100%" height="100%" viewBox={`0 0 ${S} ${S}`}>
        <defs>
          <radialGradient id="ballGrad" cx="30%" cy="25%">
            <stop offset="0%" stopColor="#ffffff"/>
            <stop offset="25%" stopColor="#f0f0f0"/>
            <stop offset="55%" stopColor="#cccccc"/>
            <stop offset="80%" stopColor="#999999"/>
            <stop offset="100%" stopColor="#666666"/>
          </radialGradient>
          <linearGradient id="chromeRim" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e8e0c8"/>
            <stop offset="30%" stopColor={theme.accent}/>
            <stop offset="50%" stopColor="#f5e6a3"/>
            <stop offset="70%" stopColor={theme.accent}/>
            <stop offset="100%" stopColor="#b8941e"/>
          </linearGradient>
          <radialGradient id="woodCenter" cx="40%" cy="35%">
            <stop offset="0%" stopColor="#2a1a0a"/>
            <stop offset="50%" stopColor="#1a1008"/>
            <stop offset="100%" stopColor="#0a0804"/>
          </radialGradient>
          <radialGradient id="ballShadow" cx="50%" cy="50%">
            <stop offset="0%" stopColor="rgba(0,0,0,0.4)"/>
            <stop offset="100%" stopColor="rgba(0,0,0,0)"/>
          </radialGradient>
        </defs>
        {}
        <circle cx={center} cy={center} r={outerRim + 6} fill="none" stroke="url(#chromeRim)" strokeWidth="5"/>
        <circle cx={center} cy={center} r={outerRim + 2.5} fill="none" stroke="#b8941e" strokeWidth="0.5"/>
        {}
        <circle cx={center} cy={center} r={trackOuter} fill="none" stroke="rgba(60,50,30,0.4)" strokeWidth="1.5"/>
        <circle cx={center} cy={center} r={trackCenter} fill="none" stroke="rgba(30,20,10,0.25)" strokeWidth={trackOuter - trackInner} opacity="0.5"/>
        <circle cx={center} cy={center} r={trackInner} fill="none" stroke="rgba(100,80,40,0.35)" strokeWidth="1"/>
        <circle cx={center} cy={center} r={trackOuter - 0.5} fill="none" stroke="rgba(255,240,200,0.06)" strokeWidth="0.8"/>
        {}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
          const a = (deg - 90) * Math.PI / 180;
          const dx = center + (trackInner + 2) * Math.cos(a);
          const dy = center + (trackInner + 2) * Math.sin(a);
          return <polygon key={`def${i}`} points={`${dx},${dy-4} ${dx+2.5},${dy} ${dx},${dy+4} ${dx-2.5},${dy}`}
            fill={`${theme.accent}80`} stroke={`${theme.accent}b3`} strokeWidth="0.5"
            transform={`rotate(${deg},${dx},${dy})`}/>;
        })}
        {}
        <circle cx={center} cy={center} r={pocketOuter} fill="none" stroke="rgba(100,80,40,0.3)" strokeWidth="1"/>
        <circle cx={center} cy={center} r={pocketInner} fill="none" stroke="rgba(140,120,60,0.25)" strokeWidth="1"/>
        {}
        {WHEEL_ORDER.map((num, i) => {
          const sa = (i * segAngle - 90) * Math.PI / 180;
          const ea = ((i + 1) * segAngle - 90) * Math.PI / 180;
          const ox1 = center + pocketOuter * Math.cos(sa), oy1 = center + pocketOuter * Math.sin(sa);
          const ox2 = center + pocketOuter * Math.cos(ea), oy2 = center + pocketOuter * Math.sin(ea);
          const ix1 = center + pocketInner * Math.cos(sa), iy1 = center + pocketInner * Math.sin(sa);
          const ix2 = center + pocketInner * Math.cos(ea), iy2 = center + pocketInner * Math.sin(ea);
          const ma = ((i + 0.5) * segAngle - 90) * Math.PI / 180;
          const textR = (pocketOuter + pocketInner) / 2;
          const tx = center + textR * Math.cos(ma), ty = center + textR * Math.sin(ma);
          const isWinner = ballState && !spinning && resultIdx === i;
          return (
            <g key={i}>
              <path d={`M${ix1},${iy1} L${ox1},${oy1} A${pocketOuter},${pocketOuter} 0 0,1 ${ox2},${oy2} L${ix2},${iy2} A${pocketInner},${pocketInner} 0 0,0 ${ix1},${iy1}`}
                fill={numColor(num)} stroke={isWinner ? "rgba(255,255,255,0.6)" : `${theme.accent}33`} strokeWidth={isWinner ? 1.5 : 0.5}
                opacity={isWinner ? 1 : 0.85}/>
              {}
              <path d={`M${ix1},${iy1} L${ox1},${oy1} A${pocketOuter},${pocketOuter} 0 0,1 ${ox2},${oy2} L${ix2},${iy2} A${pocketInner},${pocketInner} 0 0,0 ${ix1},${iy1}`}
                fill={isWinner ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)"} opacity={isWinner ? 0.8 : 0.6}
                style={isWinner ? {animation:"pocketWinPulse 1s ease-in-out infinite"} : {}}/>
              <text x={tx} y={ty} fill={isWinner ? "#fff" : numColorLight(num)} fontSize={isWinner ? "10" : "9"} fontWeight="700"
                fontFamily="'JetBrains Mono', monospace" textAnchor="middle" dominantBaseline="central"
                transform={`rotate(${(i+0.5)*segAngle},${tx},${ty})`}
                style={isWinner ? {filter:"drop-shadow(0 0 3px rgba(255,255,255,0.6))"} : {}}>{num}</text>
            </g>
          );
        })}
        {}
        {WHEEL_ORDER.map((_, i) => {
          const a = (i * segAngle - 90) * Math.PI / 180;
          const fx1 = center + pocketInner * Math.cos(a), fy1 = center + pocketInner * Math.sin(a);
          const fx2 = center + pocketOuter * Math.cos(a), fy2 = center + pocketOuter * Math.sin(a);
          return <line key={`f${i}`} x1={fx1} y1={fy1} x2={fx2} y2={fy2}
            stroke={`${theme.accent}4d`} strokeWidth="1.2" strokeLinecap="round"/>;
        })}
        {WHEEL_ORDER.map((_, i) => {
          const a = (i * segAngle - 90) * Math.PI / 180;
          return <circle key={`fb${i}`} cx={center + pocketOuter * Math.cos(a)} cy={center + pocketOuter * Math.sin(a)}
            r={2} fill={`${theme.accent}40`} stroke="rgba(180,150,50,0.35)" strokeWidth="0.5"/>;
        })}
        {}
        <circle cx={center} cy={center} r={innerR + 3} fill="none" stroke={`${theme.accent}1f`} strokeWidth="2"/>
        <circle cx={center} cy={center} r={innerR} fill="url(#woodCenter)" stroke="url(#chromeRim)" strokeWidth="2.5"/>
        <circle cx={center} cy={center} r={innerR - 6} fill="none" stroke={`${theme.accent}1a`} strokeWidth="0.8"/>
        <circle cx={center} cy={center} r={innerR - 12} fill="none" stroke={`${theme.accent}0f`} strokeWidth="0.5"/>
        <text x={center} y={center - 3} fill={theme.accent} fontSize="10" fontWeight="700"
          fontFamily="'Playfair Display', Georgia, serif" textAnchor="middle" dominantBaseline="central"
          letterSpacing="3" opacity="0.7">{String.fromCharCode(10022)}</text>
        <text x={center} y={center + 9} fill={`${theme.accent}73`} fontSize="7" fontWeight="600"
          fontFamily="'JetBrains Mono', monospace" textAnchor="middle" dominantBaseline="central"
          letterSpacing="1.5">ROULETTE</text>
        {}
        {(launchPhase === "ready" || launchPhase === "flick") && (() => {
          const launcherDeg = launchPhase === "flick" ? -22 : -8;
          const launcherRad = (launcherDeg - 90) * Math.PI / 180;
          const armLen = 14;
          const baseX = center + (trackOuter + 2) * Math.cos(launcherRad);
          const baseY = center + (trackOuter + 2) * Math.sin(launcherRad);
          const tipRad = ((launcherDeg + (launchPhase === "flick" ? -12 : 0)) - 90) * Math.PI / 180;
          const tipX = baseX - armLen * Math.cos(tipRad);
          const tipY = baseY - armLen * Math.sin(tipRad);
          return (
            <g style={{ transition: "all 0.15s ease-out" }}>
              {}
              <line x1={baseX} y1={baseY} x2={tipX} y2={tipY}
                stroke={theme.accent} strokeWidth="2.5" strokeLinecap="round"/>
              {}
              <circle cx={baseX} cy={baseY} r={3} fill="#b8941e" stroke={theme.accent} strokeWidth="0.8"/>
              {}
              <circle cx={tipX} cy={tipY} r={2.2} fill="#f5e6a3" stroke={theme.accent} strokeWidth="0.6"/>
            </g>
          );
        })()}
        {}
        {ballState && (
          <g>
            <ellipse cx={ballX + 2} cy={ballY + 3} rx={ballR + 1} ry={ballR * 0.7} fill="url(#ballShadow)" opacity="0.5"/>
            <circle cx={ballX} cy={ballY} r={ballR} fill="url(#ballGrad)" stroke="rgba(255,255,255,0.5)" strokeWidth="0.8"/>
            <ellipse cx={ballX - 1.5} cy={ballY - 2} rx={2.5} ry={1.8} fill="rgba(255,255,255,0.55)"/>
            <circle cx={ballX + 1} cy={ballY + 1.5} r={1} fill="rgba(255,255,255,0.12)"/>
          </g>
        )}
      </svg>
    </div>
  );
}
export const BET_TYPES = [
  { id:"red", label:"Red", payout:2 },{ id:"black", label:"Black", payout:2 },
  { id:"odd", label:"Odd", payout:2 },{ id:"even", label:"Even", payout:2 },
  { id:"1-18", label:"1–18", payout:2 },{ id:"19-36", label:"19–36", payout:2 },
  { id:"1st12", label:"1st 12", payout:3 },{ id:"2nd12", label:"2nd 12", payout:3 },{ id:"3rd12", label:"3rd 12", payout:3 },
];
export function checkRouletteBet(betType, number) {
  if(/^\d+$/.test(betType)) return parseInt(betType) === number;
  if(number===0) return false;
  switch (betType) {
    case "red":   return RED_NUMS.has(number);
    case "black": return !RED_NUMS.has(number) && number !== 0;
    case "odd":   return number % 2 === 1;
    case "even":  return number % 2 === 0;
    case "1-18":  return number >= 1 && number <= 18;
    case "19-36": return number >= 19 && number <= 36;
    case "1st12": return number >= 1 && number <= 12;
    case "2nd12": return number >= 13 && number <= 24;
    case "3rd12": return number >= 25 && number <= 36;
    default:      return false;
  }
}
export function RouletteGame({ chips, setChips, onBack, onRebuy, startChips, lastBets = {}, setLastBet, winStreak = 0, vipPoints = 0, achCount = 0, reportLoss, applyWin = null, onBetPlaced = null, onRoundEnd, skipOverlays = false, skipEffects = false, theme: themeMode = "dark", skinTheme, skinId = "house", activePowerUps = [] }) {
  const [betAmount, setBetAmount] = useState(() => Math.min(lastBets?.roulette || 10, chips));
  useEffect(() => { if (setLastBet) setLastBet("roulette", betAmount); }, [betAmount, setLastBet]);
  const [bets, setBets] = useState([]);
  const [phase, setPhase] = useState("betting");
  const [result, setResult] = useState(null);
  const [resultIdx, setResultIdx] = useState(null);
  const [message, setMessage] = useState("Place your bets");
  const [spinning, setSpinning] = useState(false);
  const [history, setHistory] = useState([]);
  const [nearMiss, setNearMiss] = useState(null);
  const [winBreakdown, setWinBreakdown] = useState(null);
  const [betLog, setBetLog] = useState([]);
  const betsRef = useRef(bets);
  const resultIdxRef = useRef(resultIdx);
  betsRef.current = bets;
  resultIdxRef.current = resultIdx;
  const totalBet = bets.reduce((s, b) => s + b.amount, 0);
  const remaining = chips - totalBet;
  useEffect(() => {
    if (betAmount > remaining && remaining > 0) setBetAmount(remaining);
  }, [remaining, betAmount]);
  const addBet = (type) => {
    if (betAmount < 1 || betAmount > remaining) return;
    setBets(prev => {
      const existing = prev.find(b => b.type === type);
      if (existing) return prev.map(b => b.type === type ? { ...b, amount: b.amount + betAmount } : b);
      return [...prev, { type, amount: betAmount }];
    });
  };
  const removeBet = (type) => {
    setBets(prev => prev.filter(b => b.type !== type));
  };
  const clearBets = () => setBets([]);
  const fx = useWinEffects();
  useEffect(() => { if (phase === "resolved" && onRoundEnd) onRoundEnd(); }, [phase, onRoundEnd]);
  const { shaking, shake, shakeIntensity, floatWins, addFloatWin, flash, triggerFlash, lightMode, triggerLights,
    bigWin, setBigWin, dismissOverlay, dismissAll, celebrateWin, shellEffects, coinRainActive, triggerCoins, softCoinRain, washType, triggerWash,
    confetti, triggerConfetti, eruptionActive, triggerEruption } = fx;
  const spin = () => {
    if(bets.length === 0 || totalBet > chips || totalBet < 1) return;
    setChips(c=>c-totalBet); if (onBetPlaced) onBetPlaced(totalBet); setPhase("spinning"); setMessage("No more bets...");
    const idx = Math.floor(Math.random()*WHEEL_ORDER.length);
    resultIdxRef.current = idx;
    setResultIdx(idx); setSpinning(true); setResult(null); setWinBreakdown(null);
  };
  const onWheelFinish = useCallback(() => {
    const curBets = betsRef.current;
    const curResultIdx = resultIdxRef.current;
    const winNum = WHEEL_ORDER[curResultIdx];
    setResult(winNum); setSpinning(false);
    setHistory(h => [winNum,...h].slice(0,15));
    let totalWin = 0;
    const breakdown = [];
    for (const b of curBets) {
      const isNum = /^\d+$/.test(b.type);
      const payout = isNum ? 36 : BET_TYPES.find(bt=>bt.id===b.type)?.payout||2;
      const won = checkRouletteBet(b.type, winNum);
      if (won) {
        const w = b.amount * payout;
        totalWin += w;
        const label = isNum ? `#${b.type}` : BET_TYPES.find(bt=>bt.id===b.type)?.label || b.type;
        breakdown.push({ label, amount: w - b.amount });
      }
    }
    setNearMiss(null);
    const colorStr = winNum===0?"G Green":RED_NUMS.has(winNum)?"R Red":"⚫ Black";
    const totalBetAmount = curBets.reduce((s,b)=>s+b.amount, 0);
    const newEntries = curBets.map(b => {
      const isNum = /^\d+$/.test(b.type);
      const label = isNum ? `#${b.type}` : (BET_TYPES.find(bt=>bt.id===b.type)?.label || b.type);
      const won = checkRouletteBet(b.type, winNum);
      const payout = isNum ? 36 : BET_TYPES.find(bt=>bt.id===b.type)?.payout||2;
      return { label, amount: b.amount, won, net: won ? b.amount * payout - b.amount : -b.amount };
    });
    setBetLog(prev => [...prev, ...newEntries]);
    if(totalWin > 0) {
      if (applyWin) applyWin(totalWin); else setChips(c=>c+totalWin);
      const profit = totalWin - totalBetAmount;
      setMessage(`${winNum} — ${colorStr} — Won $${totalWin.toLocaleString()}!`);
      setWinBreakdown(breakdown);
      triggerFlash();triggerLights("win");addFloatWin(profit, {x:50, y:30});
      if(totalWin>=totalBetAmount*10){shake();setBigWin({type:totalWin>=totalBetAmount*20?"mega":"big",amount:profit});}
      else{softCoinRain(winStreak);}
    } else {
      setMessage(`${winNum} — ${colorStr} — No luck`); triggerLights("loss");
      if (reportLoss) reportLoss(totalBetAmount);
      for (const b of curBets) {
        if (/^\d+$/.test(b.type)) {
          const wheelIdx = WHEEL_ORDER.indexOf(winNum);
          const betIdx = WHEEL_ORDER.indexOf(parseInt(b.type));
          if (wheelIdx >= 0 && betIdx >= 0) {
            const dist = Math.min(Math.abs(wheelIdx - betIdx), WHEEL_ORDER.length - Math.abs(wheelIdx - betIdx));
            if (dist <= 2) { setNearMiss(`So close! ${b.type} was just ${dist === 1 ? "one pocket" : "two pockets"} away`); break; }
          }
        }
      }
    }
    setPhase("resolved");
  }, [shake, triggerFlash, triggerLights, addFloatWin, setBigWin, softCoinRain, reportLoss, applyWin]);
  const reset = () => { setBigWin(null);fx.clearLights();setPhase("betting");setResult(null);setResultIdx(null);setMessage("Place your bets");setWinBreakdown(null);setBetAmount(b=>Math.min(b,chips>0?chips:1000)); };
  const handleKey = useCallback((key) => {
    if (phase==="betting" && (key===" "||key==="Enter")) spin();
    else if (phase==="resolved" && (key===" "||key==="Enter")) { setBigWin(null);fx.clearLights();setResult(null);setResultIdx(null);setMessage("No more bets...");spin(); }
  }, [phase]);
  const chipBudget = chips - totalBet;
  const betBreakdown = betLog.length > 0 ? (
    <div style={{ display:"flex", gap:3, flexWrap:"wrap", justifyContent:"center",
      maxHeight:48, overflow:"hidden", width:"100%", maxWidth:520 }}>
      {betLog.map((entry, i) => (
        <span key={i} style={{ fontSize:8, fontFamily:T.mono, padding:"1px 4px", borderRadius:3, lineHeight:"14px",
          background: entry.won ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
          border: `1px solid ${entry.won ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.15)"}`,
          color: entry.won ? "#22c55e" : "#ef4444" }}>
          {entry.label} {entry.net >= 0 ? "+" : ""}{entry.net}
        </span>
      ))}
    </div>
  ) : null;
  return (
    <GameShell bg={RED_BG} title="ROULETTE" chips={chips} onBack={onBack} {...shellEffects} startChips={startChips} onKeyAction={handleKey} winStreak={winStreak} vipPoints={vipPoints} achCount={achCount} skipOverlays={skipOverlays} skipEffects={skipEffects} onRebuy={onRebuy} theme={themeMode} skinTheme={skinTheme} skinId={skinId} activePowerUps={activePowerUps} nearMiss={nearMiss} sessionDetail={betBreakdown} rules={<>
        <p style={{marginTop:0}}>Bet on where the ball will land on a 37-pocket wheel (0–36). You can place multiple bets!</p>
        <p><span style={{color:theme.accent}}>Multi-Bet:</span> Select a bet amount, then click bet types or numbers to add chips. Click a placed bet to remove it.</p>
        <p><span style={{color:theme.accent}}>Straight Up:</span> Bet on a single number (0–36). Pays 35:1.</p>
        <p><span style={{color:theme.accent}}>Red/Black:</span> Bet on the color. Pays 1:1.</p>
        <p><span style={{color:theme.accent}}>Odd/Even:</span> Bet on odd or even numbers. Pays 1:1. Zero is neither.</p>
        <p><span style={{color:theme.accent}}>1–18 / 19–36:</span> Bet on the low or high half. Pays 1:1.</p>
        <p><span style={{color:theme.accent}}>Dozens:</span> Bet on 1–12, 13–24, or 25–36. Pays 2:1.</p>
        <p style={{color:T.muted, fontSize:11}}>European single-zero roulette. House edge: 2.7%.</p>
      </>}>
      {history.length > 0 && (
        <div style={{ display:"flex", gap:4, margin:"10px 0", zIndex:1, flexWrap:"wrap",
          justifyContent:"center", maxWidth:480 }}>
          {history.map((n, i) => (
            <div key={`${n}-${i}-${history.length}`} style={{
              width:24, height:24, borderRadius:"50%", background:numColor(n),
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:10, fontWeight:700, color:"#fff", fontFamily:T.mono,
              opacity: 1 - i * 0.05, border: i === 0 ? "2px solid rgba(255,255,255,0.5)" : "1px solid rgba(255,255,255,0.2)",
              animation: i === 0 ? "historyBubbleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards" : "none",
              boxShadow: i === 0 ? `0 0 10px ${numColor(n)}88` : "none",
            }}>{n}</div>
          ))}
        </div>
      )}
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12,padding:"0 16px",zIndex:1,width:"100%",maxWidth:480}}>
        <div style={{fontSize:16,fontWeight:600,textAlign:"center",minHeight:24,letterSpacing:1,
          animation: phase==="resolved" ? "rouletteReveal 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards" : "fadeIn 0.3s ease",
          color:phase==="resolved"&&message.includes("Won")?"#27ae60":phase==="resolved"&&message.includes("No luck")?"#e74c3c":theme.accent,
          ...(phase==="resolved"&&message.includes("Won") ? { textShadow:"0 0 10px rgba(39,174,96,0.3)" } : {})
        }}>{message}</div>
        {}
        {winBreakdown && winBreakdown.length > 1 && (
          <div style={{ display:"flex", gap:6, flexWrap:"wrap", justifyContent:"center" }}>
            {winBreakdown.map((w, i) => (
              <span key={i} style={{ fontSize:10, fontFamily:T.mono, color:"#22c55e", background:"rgba(34,197,94,0.1)",
                padding:"2px 6px", borderRadius:4, border:"1px solid rgba(34,197,94,0.2)",
                animation:`resultBadge 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 0.1}s both` }}>
                {w.label} +${w.amount.toLocaleString()}
              </span>
            ))}
          </div>
        )}
        <RouletteWheel spinning={spinning} resultIdx={resultIdx} onFinish={onWheelFinish} />
        {phase==="betting"&&(
          <div style={{width:"100%",animation:"fadeIn 0.3s ease"}}>
            {}
            {bets.length > 0 && (
              <div style={{ marginBottom:10, padding:"6px 10px", background:`${theme.accent}0f`,
                border:`1px solid ${theme.accent}26`, borderRadius:8 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                  <span style={{ fontSize:9, letterSpacing:2, textTransform:"uppercase", color:T.muted }}>
                    Active Bets · ${totalBet.toLocaleString()} total
                  </span>
                  <button onClick={clearBets} style={{ fontSize:9, fontFamily:T.mono, color:"#ef4444",
                    background:"none", border:"none", cursor:"pointer", letterSpacing:1 }}>CLEAR ALL</button>
                </div>
                <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                  {bets.map(b => {
                    const isNum = /^\d+$/.test(b.type);
                    const label = isNum ? `#${b.type}` : BET_TYPES.find(bt=>bt.id===b.type)?.label || b.type;
                    return (
                      <button key={b.type} onClick={() => removeBet(b.type)}
                        style={{ fontSize:10, fontFamily:T.mono, padding:"3px 8px", borderRadius:4,
                          background:`${theme.accent}26`, border:`1px solid ${theme.accent}4d`,
                          color:theme.accent, cursor:"pointer", transition:"all 0.15s" }}>
                        {label} ${b.amount} ✕
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            <div style={{fontSize:11,letterSpacing:2,textTransform:"uppercase",color:T.muted,textAlign:"center",marginBottom:6}}>Click to add ${betAmount} chip{betAmount!==1?"s":""}</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3, 1fr)",gap:5,marginBottom:10}}>
              {BET_TYPES.map(b => {
                const placed = bets.find(pb => pb.type === b.id);
                return (
                  <button key={b.id} onClick={() => addBet(b.id)}
                    style={{
                      padding:"7px 4px", borderRadius:6, fontSize:11, fontWeight:600,
                      fontFamily:T.mono, cursor: chipBudget >= betAmount ? "pointer" : "not-allowed", transition:"all 0.2s",
                      background: placed ? `${theme.accent}33` : "rgba(255,255,255,0.03)",
                      border: placed ? `1.5px solid ${theme.accent}` : "1.5px solid rgba(255,255,255,0.1)",
                      color: placed ? theme.accent : T.muted, position:"relative",
                    }}>
                    {b.label} <span style={{ opacity:0.5 }}>({b.payout}x)</span>
                    {placed && <span style={{ position:"absolute", top:-6, right:-4, fontSize:8, fontFamily:T.mono,
                      background:theme.accent, color:"#0e0a08", padding:"0 4px", borderRadius:8, fontWeight:700 }}>${placed.amount}</span>}
                  </button>
                );
              })}
            </div>
            <div style={{fontSize:11,letterSpacing:2,textTransform:"uppercase",color:T.muted,textAlign:"center",marginBottom:4}}>Or pick a number (36x)</div>
            <div className="roulette-nums" style={{display:"flex",flexWrap:"wrap",gap:3,justifyContent:"center"}}>
              {Array.from({length:37}, (_, i) => i).map(n => {
                const placed = bets.find(b => b.type === String(n));
                const nc = numColor(n);
                return (
                  <button key={n} onClick={() => addBet(String(n))}
                    style={{
                      width:26, height:26, borderRadius:4, fontSize:9, fontWeight:700,
                      fontFamily:T.mono, cursor: chipBudget >= betAmount ? "pointer" : "not-allowed", transition:"all 0.15s",
                      background: placed ? nc : "rgba(255,255,255,0.05)",
                      border: placed ? `2px solid ${theme.accent}` : `1px solid ${nc}55`,
                      color: placed ? "#fff" : nc === "#1e1e2e" ? "#888" : numColorLight(n),
                      position:"relative",
                    }}>
                    {n}
                    {placed && <span style={{ position:"absolute", top:-7, right:-5, fontSize:7, fontFamily:T.mono,
                      background:theme.accent, color:"#0e0a08", padding:"0 3px", borderRadius:6, fontWeight:700, lineHeight:"14px" }}>${placed.amount}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
      <div style={{padding:"16px",width:"100%",maxWidth:560,zIndex:1}}>
        {phase==="betting"&&<div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:14}}>
          <BetControls bet={betAmount} setBet={setBetAmount} chips={Math.max(0, chips - totalBet)} presets={[5,10,25,50,100]}/>
          <GoldButton onClick={spin} disabled={bets.length===0||totalBet>chips||totalBet<1} hint="⏎ spin">Spin · ${totalBet}</GoldButton>
        </div>}
        {phase==="spinning"&&<div className="anim-spinner" style={{textAlign:"center",color:T.muted,fontSize:13,letterSpacing:2}}>Spinning...</div>}
        {phase==="resolved"&&<div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
          <GoldButton onClick={reset} small>Change Bets</GoldButton>
          {totalBet<=chips&&bets.length>0&&<GoldButton onClick={()=>{setBigWin(null);fx.clearLights();setResult(null);setResultIdx(null);setWinBreakdown(null);setMessage("No more bets...");spin();}}>Rebet ${totalBet}</GoldButton>}
        </div>}
      </div>
      <div style={{padding:"8px",fontSize:10,color:"#4a3030",letterSpacing:2,textTransform:"uppercase",zIndex:1}}>European · Single Zero · Multi-Bet</div>
      <FloatingWins wins={floatWins} />
      {bigWin && !skipOverlays && <BigWinOverlay type={bigWin.type} amount={bigWin.amount} onDone={dismissOverlay} />}
    </GameShell>
  );
}
