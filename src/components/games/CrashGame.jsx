import React, { useState, useCallback, useEffect, useRef } from 'react';
import { theme } from '../../theme-globals.js';
import { T } from '../../constants/styles.js';
import { GameShell } from '../../components/GameShell.jsx';
import { GoldButton } from '../../components/ui/GoldButton.jsx';
import { BetControls } from '../../components/ui/BetControls.jsx';

export function CrashGame({ chips, setChips, onBack, onRebuy, startChips, lastBets = {}, setLastBet, winStreak = 0, vipPoints = 0, achCount = 0, reportLoss, applyWin = null, onBetPlaced = null, onRoundEnd, skipOverlays = false, skipEffects = false, theme: themeMode = "dark", skinTheme, skinId = "house", activePowerUps = [] }) {
  const [bet, setBet] = useState(() => Math.min(lastBets?.crash || 10, chips));
  useEffect(() => { if (setLastBet) setLastBet("crash", bet); }, [bet, setLastBet]);
  const [phase, setPhase] = useState("betting");
  const [multiplier, setMultiplier] = useState(1.0);
  const [crashPoint, setCrashPoint] = useState(0);
  const [cashOutAt, setCashOutAt] = useState(0);
  const [message, setMessage] = useState("Place your bet and launch!");
  const [history, setHistory] = useState([]);
  useEffect(() => { if (phase === "crashed" && onRoundEnd) onRoundEnd(); }, [phase, onRoundEnd]);
  const [autoCashOut, setAutoCashOut] = useState(0);
  const [nearMiss, setNearMiss] = useState(null);
  const animRef = useRef(null);
  const startTimeRef = useRef(0);
  const crashRef = useRef(0);
  const cashedRef = useRef(false);
  const cashOutMultRef = useRef(0);
  const betRef = useRef(0);
  const multRef = useRef(1.0);
  const canvasRef = useRef(null);
  const gdRef = useRef({ pts: [], coIdx: -1, coMult: 0, crashed: false, crashPt: 0 });
  const isMobileC = typeof window !== "undefined" && window.innerWidth < 480;
  const GW = isMobileC ? Math.min(340, window.innerWidth - 48) : 380, GH = isMobileC ? 200 : 280;
  useEffect(() => {
    if (phase !== "running" && phase !== "watching") return;
    const iv = setInterval(() => setMultiplier(Math.floor(multRef.current * 100) / 100), 50);
    return () => clearInterval(iv);
  }, [phase]);
  const fx = useWinEffects();
  const { shaking, shake, shakeIntensity, floatWins, addFloatWin, flash, triggerFlash, lightMode, triggerLights,
    bigWin, setBigWin, dismissOverlay, dismissAll, celebrateWin, shellEffects, coinRainActive, triggerCoins, softCoinRain, washType, triggerWash,
    confetti, triggerConfetti, eruptionActive, triggerEruption } = fx;
  function drawCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const needW = Math.round(GW * dpr), needH = Math.round(GH * dpr);
    if (canvas.width !== needW || canvas.height !== needH) {
      canvas.width = needW;
      canvas.height = needH;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, GW, GH);
    const d = gdRef.current;
    const pts = d.pts;
    const peakM = pts.length > 0 ? pts[pts.length - 1].m : 1;
    const maxMult = Math.max(1.3, peakM * 1.15, d.crashed ? d.crashPt * 1.1 : 1.3);
    const maxTime = pts.length > 0 ? Math.max(4, pts[pts.length - 1].t * 1.15) : 4;
    const toX = (t) => 30 + (t / maxTime) * (GW - 40);
    const toY = (m) => maxMult > 1 ? GH - 20 - ((m - 1) / (maxMult - 1)) * (GH - 35) : GH - 20;
    ctx.strokeStyle = `${theme.accent}14`; ctx.lineWidth = 1;
    ctx.font = "9px 'JetBrains Mono', monospace";
    ctx.fillStyle = `${theme.accent}4d`; ctx.textAlign = "right";
    for (const m of [1, 1.5, 2, 3, 5, 10, 20, 50, 100]) {
      if (m > maxMult) break;
      const y = toY(m);
      ctx.beginPath(); ctx.moveTo(30, y); ctx.lineTo(GW - 10, y); ctx.stroke();
      ctx.fillText(m + "×", 26, y + 3);
    }
    ctx.strokeStyle = `${theme.accent}33`;
    ctx.beginPath(); ctx.moveTo(30, GH - 20); ctx.lineTo(GW - 10, GH - 20); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(30, 15); ctx.lineTo(30, GH - 20); ctx.stroke();
    if (pts.length < 2) {
      const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 200);
      ctx.beginPath(); ctx.arc(toX(0), toY(1), 4 + pulse * 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(34,197,94,${0.4 + pulse * 0.4})`; ctx.fill();
      return;
    }
    const co = d.coIdx >= 0 ? d.coIdx : pts.length;
    const pre = pts.slice(0, Math.min(co + 1, pts.length));
    const post = d.coIdx >= 0 ? pts.slice(d.coIdx) : [];
    if (pre.length > 1) {
      ctx.beginPath();
      ctx.moveTo(toX(pre[0].t), toY(pre[0].m));
      for (let i = 1; i < pre.length; i++) ctx.lineTo(toX(pre[i].t), toY(pre[i].m));
      ctx.lineTo(toX(pre[pre.length - 1].t), GH - 20);
      ctx.lineTo(toX(pre[0].t), GH - 20);
      ctx.closePath();
      ctx.fillStyle = d.crashed && d.coIdx < 0 ? "rgba(239,68,68,0.06)" : "rgba(34,197,94,0.08)";
      ctx.fill();
    }
    if (pre.length > 1) {
      ctx.beginPath();
      ctx.moveTo(toX(pre[0].t), toY(pre[0].m));
      for (let i = 1; i < pre.length; i++) ctx.lineTo(toX(pre[i].t), toY(pre[i].m));
      ctx.strokeStyle = d.crashed && d.coIdx < 0 ? "#ef4444" : "#22c55e";
      ctx.lineWidth = 2.5; ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.setLineDash([]); ctx.stroke();
    }
    if (post.length > 1) {
      ctx.beginPath();
      ctx.moveTo(toX(post[0].t), toY(post[0].m));
      for (let i = 1; i < post.length; i++) ctx.lineTo(toX(post[i].t), toY(post[i].m));
      ctx.strokeStyle = d.crashed ? "#ef4444" : "rgba(34,197,94,0.4)";
      ctx.lineWidth = 2; ctx.setLineDash([6, 4]); ctx.stroke(); ctx.setLineDash([]);
    }
    if (!d.crashed && pts.length > 0) {
      const tip = pts[pts.length - 1];
      const inten = Math.min(1, (peakM - 1) / 9);
      const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 150);
      ctx.beginPath(); ctx.arc(toX(tip.t), toY(tip.m), 4 + inten * 4 + pulse * 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(34,197,94,${0.15 + pulse * 0.15})`; ctx.fill();
      ctx.beginPath(); ctx.arc(toX(tip.t), toY(tip.m), 3, 0, Math.PI * 2);
      ctx.fillStyle = "#22c55e"; ctx.fill();
    }
    if (d.coIdx >= 0 && d.coIdx < pts.length) {
      const cp = pts[d.coIdx];
      const cx = toX(cp.t), cy = toY(d.coMult);
      ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx.fillStyle = "#22c55e"; ctx.fill();
      ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.font = "bold 11px 'JetBrains Mono', monospace";
      ctx.fillStyle = "#22c55e"; ctx.textAlign = "center";
      ctx.fillText(d.coMult.toFixed(2) + "×", cx, cy - 12);
    }
    if (d.crashed && pts.length > 0) {
      const last = pts[pts.length - 1];
      const cx = toX(last.t), cy = toY(d.crashPt);
      const age = (Date.now() % 1800) / 1800;
      ctx.beginPath(); ctx.arc(cx, cy, 6 + age * 24, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(239,68,68,${0.6 - age * 0.6})`; ctx.lineWidth = 2; ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx.fillStyle = "#ef4444"; ctx.fill();
      ctx.font = "bold 11px 'JetBrains Mono', monospace";
      ctx.fillStyle = "#ef4444"; ctx.textAlign = "center";
      ctx.fillText(d.crashPt.toFixed(2) + "×", cx, cy - 12);
    }
  }
  const launch = () => {
    if (bet > chips || bet < 1) return;
    if (animRef.current) cancelAnimationFrame(animRef.current);
    setChips(c => c - bet);
    if (onBetPlaced) onBetPlaced(bet);
    betRef.current = bet;
    const cp = generateCrashPoint();
    setCrashPoint(cp); crashRef.current = cp;
    cashedRef.current = false; cashOutMultRef.current = 0;
    setCashOutAt(0);
    gdRef.current = { pts: [], coIdx: -1, coMult: 0, crashed: false, crashPt: 0 };
    setBigWin(null); setNearMiss(null);
    fx.clearCoins(); fx.clearConfetti(); fx.clearEruption(); fx.clearLights();
    multRef.current = 1.0; setMultiplier(1.0);
    setPhase("running");
    setMessage("Cash out before it crashes!");
    startTimeRef.current = performance.now();
    const animate = (now) => {
      const elapsed = (now - startTimeRef.current) / 1000;
      const mult = Math.pow(Math.E, 0.06 * Math.pow(elapsed, 1.55));
      if (mult >= crashRef.current) {
        multRef.current = crashRef.current;
        setMultiplier(Math.floor(crashRef.current * 100) / 100);
        gdRef.current.pts.push({ t: elapsed, m: crashRef.current });
        gdRef.current.crashed = true;
        gdRef.current.crashPt = crashRef.current;
        drawCanvas();
        setPhase("crashed");
        shake(500);
        if (cashedRef.current) {
          const profit = Math.floor(betRef.current * cashOutMultRef.current) - betRef.current;
          setMessage(`Crashed at ${crashRef.current.toFixed(2)}× — you got out at ${cashOutMultRef.current.toFixed(2)}× (+$${profit})`);
          if (crashRef.current >= cashOutMultRef.current * 2.5 && crashRef.current >= 5)
            setNearMiss(`It went to ${crashRef.current.toFixed(2)}×! Could've been $${Math.floor(betRef.current * crashRef.current) - betRef.current}...`);
          else setNearMiss(null);
        } else {
          setMessage(`Crashed at ${crashRef.current.toFixed(2)}×! Lost $${betRef.current}`);
          triggerLights("loss");
          if (reportLoss) reportLoss(betRef.current);
          const milestones = [2, 3, 5, 10, 20, 50];
          const nearMile = milestones.find(m => crashRef.current >= m * 0.85 && crashRef.current < m);
          if (nearMile) setNearMiss(`So close to ${nearMile}×! Crashed at ${crashRef.current.toFixed(2)}×`);
          else setNearMiss(null);
        }
        setHistory(h => [{ point: crashRef.current, won: cashedRef.current, cashAt: cashedRef.current ? cashOutMultRef.current : 0 }, ...h].slice(0, 20));
        return;
      }
      const rounded = Math.floor(mult * 100) / 100;
      if (autoCashOut > 0 && !cashedRef.current && rounded >= autoCashOut) {
        const winnings = Math.floor(betRef.current * autoCashOut);
        if (applyWin) applyWin(winnings); else setChips(c => c + winnings);
        setCashOutAt(autoCashOut);
        cashOutMultRef.current = autoCashOut;
        cashedRef.current = true;
        gdRef.current.coIdx = gdRef.current.pts.length;
        gdRef.current.coMult = autoCashOut;
        setPhase("watching");
        const profit = winnings - betRef.current;
        triggerFlash();
        if (profit > 0) addFloatWin(profit, { x: 50, y: 30 });
        if (autoCashOut >= 25) { shake(800, "epic"); setBigWin({ type:"epic", amount: profit }); triggerLights("mega"); }
        else if (autoCashOut >= 10) { shake(600, "heavy"); setBigWin({ type:"mega", amount: profit }); triggerLights("mega"); }
        else if (autoCashOut >= 5) { shake(400, "normal"); setBigWin({ type:"big", amount: profit }); triggerLights("big"); }
        else { triggerLights("win"); softCoinRain(winStreak); }
        setMessage(`Auto cashed out at ${autoCashOut.toFixed(2)}× (+$${profit}) — watching...`);
      }
      multRef.current = mult;
      gdRef.current.pts.push({ t: elapsed, m: mult });
      drawCanvas();
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
  };
  const cashOut = () => {
    if (phase !== "running" || cashedRef.current) return;
    const currentMult = Math.floor(multRef.current * 100) / 100;
    const winnings = Math.floor(bet * currentMult);
    if (applyWin) applyWin(winnings); else setChips(c => c + winnings);
    setMultiplier(currentMult);
    setCashOutAt(currentMult);
    cashOutMultRef.current = currentMult;
    cashedRef.current = true;
    gdRef.current.coIdx = gdRef.current.pts.length;
    gdRef.current.coMult = currentMult;
    setPhase("watching");
    const profit = winnings - bet;
    triggerFlash();
    if (profit > 0) addFloatWin(profit, { x: 50, y: 30 });
    if (currentMult >= 25) { shake(800, "epic"); setBigWin({ type:"epic", amount: profit }); triggerLights("mega"); }
    else if (currentMult >= 10) { shake(600, "heavy"); setBigWin({ type:"mega", amount: profit }); triggerLights("mega"); }
    else if (currentMult >= 5) { shake(400, "normal"); setBigWin({ type:"big", amount: profit }); triggerLights("big"); }
    else if (currentMult >= 2) { shake(200, "light"); triggerLights("win"); softCoinRain(winStreak); }
    else { triggerLights("win"); softCoinRain(winStreak); }
    setMessage(`Cashed out at ${currentMult.toFixed(2)}× (+$${profit}) — watching...`);
  };
  const reset = () => {
    cancelAnimationFrame(animRef.current);
    setPhase("betting"); setMultiplier(1.0); multRef.current = 1.0;
    setCrashPoint(0); setCashOutAt(0);
    gdRef.current = { pts: [], coIdx: -1, coMult: 0, crashed: false, crashPt: 0 };
    setBigWin(null); fx.clearLights();
    setMessage("Place your bet and launch!");
    setBet(b => Math.min(b, chips > 0 ? chips : 1000));
    drawCanvas();
  };
  useEffect(() => () => cancelAnimationFrame(animRef.current), []);
  useEffect(() => {
    if (phase !== "crashed") return;
    let active = true;
    const tick = () => { if (active) { drawCanvas(); requestAnimationFrame(tick); } };
    requestAnimationFrame(tick);
    return () => { active = false; };
  }, [phase]);
  const handleKey = useCallback((key) => {
    if (phase === "betting" && (key === " " || key === "Enter")) launch();
    else if (phase === "running" && (key === " " || key === "Enter")) cashOut();
    else if (phase === "crashed" && (key === " " || key === "Enter")) reset();
  }, [phase]);
  const intensity = Math.min(1, (multiplier - 1) / 9);
  const pulseSpeed = Math.max(0.3, 1.2 - intensity * 0.9);
  const multColor = phase === "crashed" ? "#ef4444" : phase === "watching" ? "#22c55e" : multiplier >= 2 ? "#22c55e" : theme.accent;
  const bgShift = phase === "running" || phase === "watching"
    ? `radial-gradient(ellipse at center, rgba(${26 + intensity * 20},${46 + intensity * 40},${26},1) 0%, #0f1a0f 60%, #081008 100%)`
    : CRASH_BG;
  const showGame = phase !== "betting";
  return (
    <GameShell bg={bgShift} title="CRASH" chips={chips} onBack={onBack} {...shellEffects} startChips={startChips} winStreak={winStreak} vipPoints={vipPoints} achCount={achCount} skipOverlays={skipOverlays} skipEffects={skipEffects} onRebuy={onRebuy} theme={themeMode} skinTheme={skinTheme} skinId={skinId} activePowerUps={activePowerUps} onKeyAction={handleKey} nearMiss={nearMiss} rules={<>
        <p style={{marginTop:0}}>Place a bet and watch the multiplier climb. Cash out before it crashes!</p>
        <p><span style={{color:theme.accent}}>Gameplay:</span> After betting, a multiplier starts at 1.00× and rises exponentially. Click "Cash Out" at any time to win your bet × the current multiplier.</p>
        <p><span style={{color:theme.accent}}>The Crash:</span> At a random point, the multiplier crashes to zero. If you haven't cashed out, you lose your bet entirely.</p>
        <p><span style={{color:theme.accent}}>Watch Mode:</span> If you cash out, you can watch the multiplier continue climbing (or crash) for the rest of the round.</p>
        <p><span style={{color:theme.accent}}>Strategy:</span> Lower cash-out targets are safer but less rewarding. The crash point is random each round — there's no pattern to predict.</p>
        <p style={{color:T.muted, fontSize:11}}>House edge: 4%. The crash point is determined before each round starts.</p>
      </>}>
      <FloatingWins wins={floatWins} />
      {bigWin && !skipOverlays && <BigWinOverlay type={bigWin.type} amount={bigWin.amount} onDone={dismissOverlay} />}
      {history.length > 0 && (
        <div style={{ display:"flex", gap:4, flexWrap:"wrap", justifyContent:"center", padding:"6px 12px", zIndex:1, maxWidth:400 }}>
          {history.slice(0, 12).map((h, i) => (
            <span key={`${h.point}-${i}-${history.length}`} style={{
              fontSize:10, fontFamily:T.mono, fontWeight:600,
              padding:"2px 6px", borderRadius:4,
              background: h.won ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
              color: h.won ? "#22c55e" : "#ef4444",
              border: `1px solid ${h.won ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
              animation: i === 0 ? "crashHistoryIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards" : "none",
              boxShadow: i === 0 ? `0 0 8px ${h.won ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}` : "none",
            }}>{h.point.toFixed(2)}×</span>
          ))}
        </div>
      )}
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:12, padding:"0 12px", zIndex:1 }}>
        <div style={{ fontSize:14, fontWeight:600, textAlign:"center", letterSpacing:1, color: phase === "crashed" ? "#ef4444" : phase === "watching" ? "#22c55e" : theme.accent }}>
          {message}
        </div>
        {}
        <div style={{ textAlign:"center", display: showGame ? "block" : "none" }}>
          <div style={{ fontSize:32, marginBottom:4, position:"relative", display:"inline-block",
            animation: phase === "crashed" ? "none" : `float ${Math.max(0.5, 2 - intensity * 1.5)}s ease-in-out infinite`,
            transform: phase === "crashed" ? "rotate(90deg) scale(1.2)" : "none",
            transition: "transform 0.3s",
            filter: phase === "crashed" ? "grayscale(0.5)" : "none",
          }}>
            {phase === "crashed" ? "×" : "▲"}
            {}
            {(phase === "running" || phase === "watching") && (
              <div style={{ position:"absolute", left:"50%", top:"50%", transform:"translate(-50%,-50%)",
                width: 40 + intensity * 30, height: 40 + intensity * 30, borderRadius:"50%",
                background:`radial-gradient(circle, rgba(34,197,94,${0.1 + intensity * 0.15}) 0%, transparent 70%)`,
                pointerEvents:"none", animation:`rocketTrail ${Math.max(0.4, 1.2 - intensity * 0.8)}s ease-in-out infinite` }} />
            )}
            {}
            {phase === "crashed" && (
              <div style={{ position:"absolute", left:"50%", top:"50%", transform:"translate(-50%,-50%)",
                width:20, height:20, borderRadius:"50%",
                border:"3px solid rgba(239,68,68,0.6)",
                animation:"crashShockwave 0.6s ease-out forwards", pointerEvents:"none" }} />
            )}
          </div>
          <div style={{
            fontSize: multiplier >= 10 ? 44 : multiplier >= 5 ? 50 : 56,
            fontWeight:800,
            fontFamily:T.mono, color: multColor,
            textShadow: (phase === "running" || phase === "watching")
              ? `0 0 ${20 + intensity * 40}px ${multColor}, 0 0 ${8 + intensity * 20}px ${multColor}`
              : phase === "crashed" ? "0 0 30px #ef4444, 0 0 60px rgba(239,68,68,0.3)" : "none",
            letterSpacing: 2,
            transition: "font-size 0.3s, text-shadow 0.2s",
          }}>
            {phase === "watching" ? `${cashOutAt.toFixed(2)}×` : `${multiplier.toFixed(2)}×`}
            {phase === "watching" && <span style={{ fontSize:20, color:T.muted, marginLeft:8 }}>({multiplier.toFixed(2)}×)</span>}
          </div>
          {}
          {phase === "crashed" && (
            <div style={{ position:"absolute", inset:0, borderRadius:8, pointerEvents:"none",
              animation:"crashFadeRed 0.5s ease-out forwards" }} />
          )}
        </div>
        <div style={{ position:"relative", padding:8, width:"100%", maxWidth: GW + 36 }}>
          <EdgeLights mode={lightMode} color="#22c55e" />
          <div style={{
            background:"rgba(0,0,0,0.4)", borderRadius:12, padding:10,
            border: phase === "running" ? `1px solid rgba(34,197,94,${0.15 + intensity * 0.3})` : phase === "crashed" ? "1px solid rgba(239,68,68,0.4)" : `1px solid ${theme.accent}26`,
            boxShadow: phase === "running"
              ? `inset 0 0 20px rgba(0,0,0,0.3), 0 0 ${intensity * 20}px rgba(34,197,94,${intensity * 0.2}), 0 0 ${intensity * 40}px rgba(34,197,94,${intensity * 0.08})`
              : phase === "crashed" ? "inset 0 0 30px rgba(239,68,68,0.15), 0 0 20px rgba(239,68,68,0.1)" : "inset 0 0 20px rgba(0,0,0,0.3)",
            width:"100%", maxWidth: GW + 20,
            transition: "border-color 0.3s, box-shadow 0.3s",
            animation: phase === "running" ? `borderGlow ${pulseSpeed}s ease-in-out infinite` : "none",
          }}>
            <canvas ref={canvasRef} width={GW} height={GH} style={{ width: "100%", maxWidth: GW, height: "auto", aspectRatio: `${GW}/${GH}`, display:"block", margin:"0 auto" }} />
          </div>
        </div>
        <div style={{ fontFamily:T.mono, fontSize:11, color:"#7a7070", textAlign:"center", display: showGame ? "block" : "none" }}>
          Bet: ${bet}{phase === "watching" && ` · Won: $${Math.floor(bet * cashOutAt)}`}
          {phase === "crashed" && !cashedRef.current && ` · Crash: ${crashPoint.toFixed(2)}×`}
          {phase === "crashed" && cashedRef.current && ` · Won: $${Math.floor(bet * cashOutAt)} · Crash: ${crashPoint.toFixed(2)}×`}
        </div>
      </div>
      <div style={{ padding:"16px", width:"100%", maxWidth:500, zIndex:1 }}>
        {phase === "betting" && (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:14 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
              <span style={{ fontSize:10, letterSpacing:2, color:T.dim, fontFamily:T.mono, textTransform:"uppercase" }}>Auto Cash-Out</span>
              <div style={{ display:"flex", gap:4 }}>
                {[0, 1.5, 2, 3, 5, 10].map(v => (
                  <button key={v} onClick={() => setAutoCashOut(v)} style={{
                    padding:"4px 8px", fontSize:10, fontWeight:600, fontFamily:T.mono,
                    background: autoCashOut === v ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.05)",
                    border: `1px solid ${autoCashOut === v ? "#22c55e" : "rgba(255,255,255,0.1)"}`,
                    borderRadius:4, color: autoCashOut === v ? "#22c55e" : "#6a6050", cursor:"pointer",
                  }}>{v === 0 ? "Off" : `${v}×`}</button>
                ))}
              </div>
            </div>
            <BetControls bet={bet} setBet={setBet} chips={chips} presets={[5,10,25,50,100]} />
            <GoldButton onClick={launch} disabled={bet > chips || bet < 1} hint="⏎ launch">Launch</GoldButton>
          </div>
        )}
        {phase === "running" && (
          <div style={{ display:"flex", justifyContent:"center" }}>
            <button onClick={cashOut} style={{
              padding:"16px 48px", fontSize:18, fontWeight:800,
              fontFamily:T.serif,
              letterSpacing:3, textTransform:"uppercase",
              background:`linear-gradient(180deg, hsl(${142 + intensity * 10}, ${72 + intensity * 10}%, ${45 + intensity * 10}%), #16a34a)`,
              color:"#fff", border:"2px solid #4ade80",
              borderRadius:8, cursor:"pointer",
              boxShadow:`0 0 ${20 + intensity * 30}px rgba(34,197,94,${0.4 + intensity * 0.3})`,
              animation: `pulse ${pulseSpeed}s infinite`,
              transition: "box-shadow 0.3s",
            }}>
              Cash Out ${Math.floor(bet * multiplier)}
            </button>
          </div>
        )}
        {phase === "watching" && (
          <div style={{ textAlign:"center", color:T.muted, fontSize:13, letterSpacing:2 }}>
            Watching... {multiplier.toFixed(2)}× and climbing
          </div>
        )}
        {phase === "crashed" && (
          <div style={{ display:"flex", gap:8, justifyContent:"center", flexWrap:"wrap" }}>
            <GoldButton onClick={reset} small>Change Bet</GoldButton>
            {bet <= chips && bet >= 1 && (
              <GoldButton onClick={() => { reset(); setTimeout(launch, 50); }}>Rebet ${bet} ▲</GoldButton>
            )}
          </div>
        )}
      </div>
      <div style={{ padding:"8px", fontSize:10, color:"#1a3a1a", letterSpacing:2, textTransform:"uppercase", zIndex:1 }}>Cash out before the crash · 4% house edge</div>
    </GameShell>
  );
}
