import React, { useState, useEffect, useCallback } from 'react';
import { theme } from '../../theme-globals.js';
import { T } from '../../constants/styles.js';
import { GameShell } from '../../components/GameShell.jsx';
import { GoldButton } from '../../components/ui/GoldButton.jsx';

export const SCRATCH_AMOUNTS = [1, 5, 10, 25, 50, 100, 250, 500, 1000, 10000];
export const SCRATCH_TIER_STYLE = (cost) => {
  if (cost >= 10000) return { label:"JACKPOT CITY", color:"#ff4500", accent:"#ff6b35", icon:"■" };
  if (cost >= 5000) return { label:"MEGA FORTUNE", color:"#ff3366", accent:"#ff6b8a", icon:"◆" };
  if (cost >= 1000) return { label:"HIGH ROLLER", color:T.red, accent:"#f87171", icon:"♠" };
  if (cost >= 500) return { label:"DIAMOND MINE", color:"#a855f7", accent:"#c084fc", icon:"⛏" };
  if (cost >= 250) return { label:"PLATINUM PASS", color:"#60a5fa", accent:"#93c5fd", icon:"✦" };
  if (cost >= 100) return { label:"GOLD RUSH", color:theme.accent, accent:"#f1c40f", icon:"●" };
  if (cost >= 50) return { label:"CASH BLAST", color:T.green, accent:"#4ade80", icon:"$" };
  if (cost >= 25) return { label:"SILVER STRIKE", color:"#c0c0c0", accent:"#e0e0e0", icon:"⚡" };
  if (cost >= 10) return { label:"BRONZE PICK", color:"#cd7f32", accent:"#e8a050", icon:"⚄" };
  if (cost >= 5) return { label:"COPPER CARD", color:"#b87333", accent:"#d4915c", icon:"♠" };
  return { label:"LUCKY PENNY", color:"#8b7355", accent:"#a08060", icon:"♣" };
};
export const PRIZE_POOL_WEIGHTS = [
  { mult: 1,    weight: 70   },
  { mult: 2,    weight: 10   },
  { mult: 3,    weight: 5    },
  { mult: 5,    weight: 4    },
  { mult: 10,   weight: 0.9  },
  { mult: 25,   weight: 0.4  },
  { mult: 50,   weight: 0.15 },
  { mult: 100,  weight: 0.04 },
  { mult: 500,  weight: 0.005},
];
export const PRIZE_TOTAL_W = PRIZE_POOL_WEIGHTS.reduce((a,b)=>a+b.weight,0);
function pickPrizeMult() {
  let r = Math.random() * PRIZE_TOTAL_W;
  for (const p of PRIZE_POOL_WEIGHTS) {
    r -= p.weight;
    if (r <= 0) return p.mult;
  }
  return 1;
}
export function generateScratchTicket(ticketCost, forceJackpotFlag = false) {
  const jackpot = forceJackpotFlag || Math.random() < 0.000001;
  const isWinner = jackpot ? true : Math.random() < 0.50;
  const matchCount = jackpot ? (2 + Math.floor(Math.random() * 2)) : isWinner ? (Math.random() < 0.65 ? 1 : Math.random() < 0.70 ? 2 : 3) : 0;
  const pool = Array.from({length:30},(_,i)=>i+1);
  const shuffle = arr => { for(let i=arr.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]];} return arr; };
  shuffle(pool);
  const winningNumbers = pool.slice(0,3).sort((a,b)=>a-b);
  const remaining = pool.slice(3);
  const yourNumbers = [];
  const matchPositions = new Set();
  if (matchCount > 0) {
    const positions = shuffle(Array.from({length:12},(_,i)=>i));
    for (let i = 0; i < matchCount; i++) matchPositions.add(positions[i]);
  }
  const usedNumbers = new Set(winningNumbers);
  for (let i = 0; i < 12; i++) {
    let num;
    if (matchPositions.has(i)) {
      const availableWins = winningNumbers.filter(n => !yourNumbers.some(y => y.number === n));
      num = availableWins.length > 0 ? availableWins[Math.floor(Math.random()*availableWins.length)] : winningNumbers[0];
    } else {
      let pick;
      do {
        pick = remaining[Math.floor(Math.random() * remaining.length)];
      } while (yourNumbers.some(y => y.number === pick));
      num = pick;
    }
    usedNumbers.add(num);
    const prizeMult = pickPrizeMult();
    const prize = Math.max(1, Math.round(ticketCost * prizeMult));
    let special = null;
    if (!matchPositions.has(i)) {
      if (Math.random() < 0.01) special = "moneybag";
    }
    if (!special && Math.random() < 0.04) special = "fire";
    yourNumbers.push({ number: num, prize, special, isMatch: matchPositions.has(i) });
  }
  const bonusWin = Math.random() < 0.12;
  const bonusMult = [1,1,1,2,2,3][Math.floor(Math.random()*6)];
  const bonus = { prize: Math.max(1, Math.round(ticketCost * bonusMult)), isWinner: bonusWin };
  return { winningNumbers, yourNumbers, bonus, jackpot, ticketCost };
}
export function calcTicketPayout(ticket) {
  let total = 0;
  const winDetails = [];
  const { winningNumbers, yourNumbers, bonus, jackpot } = ticket;
  const winSet = new Set(winningNumbers);
  yourNumbers.forEach((spot, i) => {
    let won = false;
    let prize = spot.prize;
    if (winSet.has(spot.number) || spot.special === "moneybag") {
      won = true;
      if (spot.special === "fire") prize *= 2;
      total += prize;
      winDetails.push({ index: i, prize, special: spot.special });
    }
  });
  if (bonus.isWinner) {
    total += bonus.prize;
    winDetails.push({ index: "bonus", prize: bonus.prize });
  }
  if (jackpot && total > 0) {
    total *= 10000;
    winDetails.forEach(w => w.prize *= 10000);
  } else if (jackpot) {
    const jackpotFallback = Math.max(10000, (ticket.ticketCost || 0) * 10000);
    total = jackpotFallback;
    winDetails.push({ index: "jackpot", prize: jackpotFallback });
  }
  return { total, winDetails, jackpot: jackpot };
}
export const TOTAL_SPOTS = 16;
export function ScratchCardGame({ chips, setChips, onBack, onRebuy, startChips, lastBets = {}, setLastBet, winStreak = 0, vipPoints = 0, achCount = 0, reportLoss, applyWin = null, onBetPlaced = null, reportJackpot, onRoundEnd, forceJackpot = false, onForceJackpotUsed, skipOverlays = false, skipEffects = false, theme: themeMode = "dark", skinTheme, skinId = "house", activePowerUps = [] }) {
  const [customAmount, setCustomAmount] = useState(() => Math.min(lastBets?.scratch || 10, chips));
  useEffect(() => { if (setLastBet) setLastBet("scratch", customAmount); }, [customAmount, setLastBet]);
  const [ticket, setTicket] = useState(null);
  const [scratched, setScratched] = useState(Array(TOTAL_SPOTS).fill(false));
  const [scratchAnim, setScratchAnim] = useState(Array(TOTAL_SPOTS).fill(false));
  const [phase, setPhase] = useState("buying");
  useEffect(() => { if (phase === "result" && onRoundEnd) onRoundEnd(); }, [phase, onRoundEnd]);
  const [payout, setPayout] = useState(0);
  const [winDetails, setWinDetails] = useState([]);
  const [isJackpot, setIsJackpot] = useState(false);
  const [cardCost, setCardCost] = useState(0);
  const [showOverlay, setShowOverlay] = useState(false);
  const [runningTotal, setRunningTotal] = useState(0);
  const fx = useWinEffects();
  const { shaking, shake, shakeIntensity, floatWins, addFloatWin, flash, triggerFlash, lightMode, triggerLights,
    bigWin, setBigWin, dismissOverlay, dismissAll, celebrateWin, shellEffects, coinRainActive, triggerCoins, softCoinRain, washType, triggerWash,
    confetti, triggerConfetti, eruptionActive, triggerEruption } = fx;
  const currentCost = Math.max(1, Math.min(customAmount, chips));
  const t = SCRATCH_TIER_STYLE(phase === "buying" ? currentCost : cardCost);
  const maxAffordable = Math.max(1, chips);
  const buyCard = () => {
    const cost = currentCost;
    if (cost <= 0 || chips < cost) return;
    setCardCost(cost);
    setChips(c => c - cost);
    if (onBetPlaced) onBetPlaced(cost);
    const newTicket = generateScratchTicket(cost, forceJackpot);
    if (forceJackpot && onForceJackpotUsed) onForceJackpotUsed();
    setTicket(newTicket);
    setScratched(Array(TOTAL_SPOTS).fill(false));
    setScratchAnim(Array(TOTAL_SPOTS).fill(false));
    setPayout(0);
    setWinDetails([]);
    setIsJackpot(false);
    setRunningTotal(0);
    setPhase("scratching");
  };
  const scratchSpot = (idx) => {
    if (phase !== "scratching" || scratched[idx]) return;
    setScratchAnim(prev => { const n = [...prev]; n[idx] = true; return n; });
    setTimeout(() => {
      setScratched(prev => {
        const ns = [...prev]; ns[idx] = true;
        if (ns.every(Boolean)) setTimeout(() => resolveCard(), 200);
        return ns;
      });
    }, 200);
  };
  const scratchAll = () => {
    if (phase !== "scratching") return;
    const unscratched = scratched.map((s, i) => s ? -1 : i).filter(i => i >= 0);
    unscratched.forEach((idx, i) => {
      setTimeout(() => {
        setScratchAnim(prev => { const n = [...prev]; n[idx] = true; return n; });
        setTimeout(() => {
          setScratched(prev => {
            const ns = [...prev]; ns[idx] = true;
            if (ns.every(Boolean)) setTimeout(() => resolveCard(), 200);
            return ns;
          });
        }, 150);
      }, i * 80);
    });
  };
  useEffect(() => {
    if (!ticket || phase !== "scratching") return;
    const winSet = new Set(ticket.winningNumbers);
    const winRevealed = scratched[0] && scratched[1] && scratched[2];
    if (!winRevealed) return;
    let running = 0;
    ticket.yourNumbers.forEach((spot, i) => {
      const spotIdx = 3 + i;
      if (!scratched[spotIdx]) return;
      if (winSet.has(spot.number) || spot.special === "moneybag") {
        let prize = spot.prize;
        if (spot.special === "fire" && winSet.has(spot.number)) prize *= 2;
        running += prize;
      }
    });
    if (scratched[15] && ticket.bonus.isWinner) running += ticket.bonus.prize;
    setRunningTotal(running);
  }, [scratched, ticket, phase]);
  const resolveCard = () => {
    if (!ticket) return;
    const result = calcTicketPayout(ticket);
    setPayout(result.total);
    setWinDetails(result.winDetails);
    setIsJackpot(result.jackpot);
    if (result.jackpot && reportJackpot) reportJackpot();
    if (result.total > 0) {
      if (applyWin) applyWin(result.total); else setChips(c => c + result.total);
      const profit = result.total - cardCost;
      if (profit > 0) addFloatWin(profit, {x:50, y:30});
      triggerFlash();
      if (result.jackpot) { shake(1000, "epic"); triggerLights("mega", 8000); triggerConfetti("fireworks"); triggerCoins("extra_heavy"); triggerWash("jackpot"); triggerEruption(); setShowOverlay(true); }
      else if (result.total >= cardCost * 50) { shake(800, "epic"); triggerLights("mega", 4000); triggerConfetti("fireworks"); triggerEruption(); setBigWin({type:"epic", amount:result.total}); setShowOverlay(true); }
      else if (result.total >= cardCost * 20) { shake(600, "heavy"); triggerLights("mega", 3000); triggerConfetti("confetti"); setBigWin({type:"mega", amount:result.total}); setShowOverlay(true); }
      else if (result.total >= cardCost * 5) { shake(400, "normal"); triggerLights("big", 2500); setBigWin({type:"big", amount:result.total}); setShowOverlay(true); }
      else { triggerLights("win"); softCoinRain(winStreak); }
    } else {
      triggerLights("loss");
      if (reportLoss) reportLoss(cardCost);
    }
    setPhase("result");
  };
  const reset = () => {
    fx.clearLights();
    setPhase("buying");
    setTicket(null);
    setScratched(Array(TOTAL_SPOTS).fill(false));
    setScratchAnim(Array(TOTAL_SPOTS).fill(false));
    setPayout(0);
    setWinDetails([]);
    setIsJackpot(false);
    setRunningTotal(0);
    setShowOverlay(false);
  };
  const handleKey = useCallback((key) => {
    if (key === " " || key === "Enter") {
      if (phase === "buying") { if (currentCost > 0 && chips >= currentCost) buyCard(); }
      else if (phase === "scratching") scratchAll();
      else if (phase === "result") reset();
    }
  }, [phase, currentCost, chips, buyCard, scratchAll, reset]);
  const bg = "linear-gradient(180deg, #2e2a1a 0%, #1f1a0d 50%, #1a1508 100%)";
  const unscratchedCell = (isAnimating) => ({
    background: isAnimating ? `${theme.accent}40` : `linear-gradient(145deg, #9a9080, #7a7060)`,
    backgroundSize: isAnimating ? undefined : "200% 100%",
    boxShadow: "inset 0 2px 4px rgba(0,0,0,0.3), inset 0 -1px 2px rgba(255,255,255,0.15), 0 1px 3px rgba(0,0,0,0.2)",
    animation: isAnimating ? "scratchBurst 0.3s ease-out" : "none",
    transform: isAnimating ? "scale(0.95)" : "none",
    cursor: phase === "scratching" ? "pointer" : "default",
  });
  const isSpotWinner = (spotIdx) => {
    if (!ticket) return false;
    return winDetails.some(w => w.index === spotIdx);
  };
  const winSet = ticket ? new Set(ticket.winningNumbers) : new Set();
  return (
    <GameShell bg={bg} title="SCRATCH CARDS" chips={chips} onBack={onBack} {...shellEffects} startChips={startChips} winStreak={winStreak} vipPoints={vipPoints} achCount={achCount} skipOverlays={skipOverlays} skipEffects={skipEffects} onRebuy={onRebuy} theme={themeMode} skinTheme={skinTheme} skinId={skinId} activePowerUps={activePowerUps} onKeyAction={handleKey} rules={<>
        <p style={{marginTop:0}}>Real scratch-off lottery tickets — just like at the gas station!</p>
        <p><span style={{color:theme.accent}}>How to Play:</span> Choose a ticket tier, then scratch to reveal. First scratch the 3 WINNING NUMBERS at the top, then scratch YOUR 12 NUMBERS below.</p>
        <p><span style={{color:theme.accent}}>Matching:</span> If any of YOUR NUMBERS matches a WINNING NUMBER, you win the PRIZE shown for that spot. Multiple wins per ticket are possible!</p>
        <p><span style={{color:theme.accent}}>Special Symbols:</span></p>
        <p>$ <span style={{color:T.green}}>Money Bag</span> — Auto-win that spot's prize, no match needed!</p>
        <p>▲ <span style={{color:"#f59e0b"}}>Fire</span> — If that spot matches, prize is DOUBLED!</p>
        <p><span style={{color:theme.accent}}>Bonus Spot:</span> An extra chance to win — scratch it for an instant prize!</p>
        <p><span style={{color:T.red}}>★ JACKPOT:</span> 1 in 1,000,000 chance — multiplies ALL winnings by 10,000×!</p>
        <p style={{color:T.muted, fontSize:11}}>Overall odds of winning: ~1 in 2. Most wins are break-even. RTP: ~88%.</p>
      </>}>
      <FloatingWins wins={floatWins} />
      {showOverlay && !skipOverlays && payout > 0 && phase === "result" && (
        isJackpot
          ? <JackpotOverlay amount={payout} onDone={() => { setShowOverlay(false); dismissAll(); }} />
          : <BigWinOverlay type={bigWin ? bigWin.type : "big"} amount={payout} onDone={() => { setShowOverlay(false); dismissAll(); }} />
      )}
      <div style={{ padding:"12px", position:"relative", zIndex:1, maxWidth:500, margin:"0 auto" }}>
        <EdgeLights mode={lightMode} color="#eab308" />
        {}
        {phase === "buying" && (
          <div>
            <div style={{ fontSize:11, letterSpacing:2, color:T.dim, fontFamily:T.mono,
              textTransform:"uppercase", marginBottom:10, textAlign:"center" }}>Choose your ticket</div>
            {}
            <div style={{ textAlign:"center", marginBottom:12 }}>
              <div style={{ fontSize:28, fontWeight:900, fontFamily:T.serif, color:t.color,
                letterSpacing:2, transition:"color 0.2s" }}>
                ${currentCost.toLocaleString()}
              </div>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6, marginTop:2 }}>
                <span style={{ fontSize:18 }}>{t.icon}</span>
                <span style={{ fontSize:12, fontWeight:700, color:t.accent, fontFamily:T.serif,
                  letterSpacing:2, transition:"color 0.2s" }}>{t.label}</span>
              </div>
            </div>
            {}
            <div style={{ padding:"0 8px", marginBottom:10 }}>
              <input type="range" min={1} max={maxAffordable} value={currentCost}
                onChange={e => setCustomAmount(parseInt(e.target.value))}
                style={{ width:"100%", accentColor:t.color, cursor:"pointer" }}
              />
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:8, color:T.dim,
                fontFamily:T.mono, marginTop:2 }}>
                <span>$1</span>
                <span>${maxAffordable.toLocaleString()}</span>
              </div>
            </div>
            {}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(5, 1fr)", gap:6, marginBottom:8 }}>
              {SCRATCH_AMOUNTS.map((amt) => {
                const canAfford = chips >= amt;
                const tier = SCRATCH_TIER_STYLE(amt);
                const isActive = currentCost === amt;
                return (
                  <button key={amt} onClick={() => { if (canAfford) setCustomAmount(amt); }}
                    disabled={!canAfford} style={{
                    padding:"8px 4px", fontSize:9, fontWeight:700, fontFamily:T.mono,
                    background: isActive ? `${tier.color}20` : "rgba(255,255,255,0.03)",
                    border: `1.5px solid ${isActive ? tier.color : "rgba(255,255,255,0.08)"}`,
                    borderRadius:10, color: isActive ? tier.color : canAfford ? T.muted : T.dim,
                    cursor: canAfford ? "pointer" : "not-allowed", transition:"all 0.15s",
                    opacity: canAfford ? 1 : 0.3, textAlign:"center",
                    boxShadow: isActive ? `0 0 12px ${tier.color}30` : "none",
                  }}>
                    <div style={{ fontSize:20, lineHeight:1, marginBottom:3 }}>{tier.icon}</div>
                    <div style={{ fontWeight:900, fontSize:10 }}>{amt >= 1000 ? `$${(amt/1000)}K` : `$${amt}`}</div>
                    <div style={{ fontSize:6, letterSpacing:0.3, opacity:0.65, marginTop:1, lineHeight:1.1 }}>{tier.label}</div>
                  </button>
                );
              })}
            </div>
            {}
            <div style={{ marginBottom:12, padding:"0 4px" }}>
              <button onClick={() => { if (chips > 0) setCustomAmount(chips); }}
                disabled={chips <= 0} style={{
                width:"100%", padding:"8px 10px", fontSize:12, fontWeight:900, fontFamily:T.mono,
                background: currentCost === chips ? "rgba(255,69,0,0.15)" : "rgba(255,69,0,0.04)",
                border: `1.5px solid ${currentCost === chips ? "#ff4500" : "rgba(255,69,0,0.15)"}`,
                borderRadius:10, color: currentCost === chips ? "#ff4500" : "#ff6b6b",
                cursor: chips > 0 ? "pointer" : "not-allowed", transition:"all 0.15s",
                letterSpacing:2,
                boxShadow: currentCost === chips ? "0 0 16px rgba(255,69,0,0.2)" : "none",
              }}>
                ★ ALL IN — ${chips.toLocaleString()} ▲
              </button>
            </div>
            {}
            <div style={{ background:"rgba(255,255,255,0.03)", border:`1px solid ${t.color}33`,
              borderRadius:10, padding:"10px 14px", marginBottom:14 }}>
              <div style={{ fontSize:9, letterSpacing:2, textTransform:"uppercase", color:T.dim,
                fontFamily:T.mono, marginBottom:6, textAlign:"center" }}>
                Prize Range — {t.label}
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"4px 12px", fontSize:11,
                fontFamily:T.mono, color:T.muted }}>
                {PRIZE_POOL_WEIGHTS.map(p => {
                  const val = Math.max(1, Math.round(currentCost * p.mult));
                  return (
                    <div key={p.mult} style={{ display:"flex", justifyContent:"space-between" }}>
                      <span style={{ color: p.mult >= 100 ? t.color : "#6a6050" }}>${val.toLocaleString()}</span>
                      <span style={{ color:"#4a4030", fontSize:9 }}>{p.mult}×</span>
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop:8, fontSize:9, color:T.dim, textAlign:"center",
                fontFamily:T.mono }}>
                $ Auto-win · ▲ 2× Prize · ★ Jackpot: 10,000×
              </div>
            </div>
            <div style={{ textAlign:"center" }}>
              <GoldButton onClick={buyCard} disabled={currentCost <= 0 || chips < currentCost}>
                {currentCost === chips && chips > 0 ? `ALL IN ($${chips.toLocaleString()})` : `Buy Ticket ($${currentCost.toLocaleString()})`}
              </GoldButton>
            </div>
          </div>
        )}
        {}
        {(phase === "scratching" || phase === "result") && ticket && (() => {
          const allWinRevealed = scratched[0] && scratched[1] && scratched[2];
          return (
          <>
            {}
            <div style={{ background:`linear-gradient(135deg, ${t.color}18, ${t.color}08)`,
              border:`2px solid ${t.color}55`, borderRadius:14, overflow:"hidden", marginBottom:10,
              position:"relative" }}>
              {}
              {phase === "scratching" && (
                <div style={{ position:"absolute", inset:0, pointerEvents:"none", zIndex:2,
                  background:`linear-gradient(105deg, transparent 40%, ${t.color}15 45%, ${t.color}30 50%, ${t.color}15 55%, transparent 60%)`,
                  backgroundSize:"200% 100%",
                  animation:"ticketShimmer 2s ease-in-out 0.3s 1 both",
                  borderRadius:14 }} />
              )}
              {}
              <div style={{ background:`linear-gradient(90deg, ${t.color}44, ${t.color}22)`,
                padding:"8px 14px", display:"flex", justifyContent:"space-between", alignItems:"center",
                position:"relative", overflow:"hidden" }}>
                <span style={{ fontSize:14, fontWeight:900, color:t.accent, fontFamily:T.serif,
                  letterSpacing:2 }}>{t.label}</span>
                <span style={{ fontSize:10, color:t.accent, fontFamily:T.mono, opacity:0.7 }}>
                  ${cardCost.toLocaleString()} ticket
                </span>
                {}
                {phase === "result" && isJackpot && (
                  <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center",
                    background:"linear-gradient(90deg, rgba(255,215,0,0.0), rgba(255,215,0,0.25), rgba(255,215,0,0.0))",
                    animation:"bigWinPulse 0.8s ease-in-out infinite", pointerEvents:"none" }}>
                    <span style={{ fontSize:18, fontWeight:900, letterSpacing:5, fontFamily:T.serif,
                      color:"#ffd700", textShadow:"0 0 15px rgba(255,215,0,0.8), 0 0 30px rgba(255,215,0,0.4)" }}>
                      ★ JACKPOT ★
                    </span>
                  </div>
                )}
              </div>
              <div style={{ padding:"14px 16px" }}>
                {}
                <div style={{ marginBottom:12 }}>
                  <div style={{ fontSize:9, letterSpacing:3, textTransform:"uppercase", color:T.muted,
                    fontFamily:T.mono, marginBottom:6, textAlign:"center", fontWeight:700 }}>
                    ⭐ Winning Numbers ⭐
                  </div>
                  <div style={{ display:"flex", justifyContent:"center", gap:10 }}>
                    {ticket.winningNumbers.map((num, i) => {
                      const isRevealed = scratched[i];
                      const isAnimating = scratchAnim[i] && !isRevealed;
                      return (
                        <button key={i} onClick={() => scratchSpot(i)} style={{
                          width:72, height:72, borderRadius:12, border:"none",
                          display:"flex", alignItems:"center", justifyContent:"center",
                          cursor: phase === "scratching" && !isRevealed ? "pointer" : "default",
                          transition:"all 0.2s",
                          ...(isRevealed ? {
                            background:"rgba(241,196,15,0.15)", border:"2px solid rgba(241,196,15,0.4)",
                            animation:"scratchBurst 0.4s ease-out",
                            boxShadow:"0 0 15px rgba(241,196,15,0.2)",
                          } : unscratchedCell(isAnimating)),
                        }}>
                          {isRevealed ? (
                            <span style={{ fontSize:26, fontWeight:900, color:"#f1c40f",
                              fontFamily:T.mono,
                              textShadow:"0 0 10px rgba(241,196,15,0.3)",
                              animation:"fadeInScale 0.3s ease-out" }}>{num}</span>
                          ) : (
                            <span style={{ fontSize:16, color:"rgba(255,255,255,0.3)", fontFamily:T.mono }}>?</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
                {}
                <div style={{ height:1, background:`linear-gradient(90deg, transparent, ${t.color}44, transparent)`, margin:"4px 0 10px" }} />
                {}
                <div style={{ marginBottom:12 }}>
                  <div style={{ fontSize:9, letterSpacing:3, textTransform:"uppercase", color:T.muted,
                    fontFamily:T.mono, marginBottom:6, textAlign:"center", fontWeight:700 }}>
                    Your Numbers
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:8 }}>
                    {ticket.yourNumbers.map((spot, i) => {
                      const spotIdx = 3 + i;
                      const isRevealed = scratched[spotIdx];
                      const isAnimating = scratchAnim[spotIdx] && !isRevealed;
                      const isMatch = isRevealed && allWinRevealed && (winSet.has(spot.number) || spot.special === "moneybag");
                      const displayPrize = spot.special === "fire" && winSet.has(spot.number) ? spot.prize * 2 : spot.prize;
                      return (
                        <button key={i} onClick={() => scratchSpot(spotIdx)} style={{
                          padding:"6px 2px", borderRadius:8, border:"none",
                          display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
                          cursor: phase === "scratching" && !isRevealed ? "pointer" : "default",
                          transition:"all 0.2s", minHeight:72,
                          ...(isRevealed ? {
                            background: isMatch ? (ticket.jackpot ? "rgba(255,215,0,0.18)" : "rgba(34,197,94,0.15)") : "rgba(255,255,255,0.04)",
                            border: isMatch ? (ticket.jackpot ? "2px solid rgba(255,215,0,0.6)" : "2px solid rgba(34,197,94,0.5)") : "1px solid rgba(255,255,255,0.06)",
                            boxShadow: isMatch ? (ticket.jackpot ? "0 0 20px rgba(255,215,0,0.4)" : "0 0 16px rgba(34,197,94,0.35)") : "none",
                            animation: isMatch ? "matchReveal 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards" : "scratchBurst 0.35s ease-out",
                          } : unscratchedCell(isAnimating)),
                        }}>
                          {isRevealed ? (<>
                            <div style={{ display:"flex", alignItems:"center", gap:2, marginBottom:2 }}>
                              {spot.special === "moneybag" && <span style={{ fontSize:10 }}>$</span>}
                              {spot.special === "fire" && <span style={{ fontSize:10 }}>▲</span>}
                              {isMatch && ticket.jackpot && <span style={{ fontSize:10 }}>♛</span>}
                              <span style={{ fontSize:20, fontWeight:800, color: isMatch ? (ticket.jackpot ? "#ffd700" : "#22c55e") : "#c8c0b0",
                                fontFamily:T.mono,
                                textShadow: isMatch ? (ticket.jackpot ? "0 0 12px rgba(255,215,0,0.6)" : "0 0 8px rgba(34,197,94,0.4)") : "none",
                                animation: isMatch ? "none" : "fadeInScale 0.25s ease-out" }}>
                                {spot.special === "moneybag" ? "$" : spot.number}
                              </span>
                            </div>
                            <span style={{ fontSize:10, fontWeight:700, color: isMatch ? (ticket.jackpot ? "#ffd700" : "#4ade80") : "#6a6050",
                              fontFamily:T.mono,
                              animation: isMatch ? "winAccumulate 0.4s ease-out" : "none" }}>
                              ${displayPrize.toLocaleString()}
                            </span>
                          </>) : (
                            <span style={{ fontSize:14, color:"rgba(255,255,255,0.3)", fontFamily:T.mono }}>?</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
                {}
                <div style={{ height:1, background:`linear-gradient(90deg, transparent, ${t.color}44, transparent)`, margin:"4px 0 10px" }} />
                {}
                <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:12 }}>
                  <span style={{ fontSize:9, letterSpacing:3, textTransform:"uppercase", color:T.muted,
                    fontFamily:T.mono, fontWeight:700 }}>Bonus</span>
                  {(() => {
                    const bIdx = 15;
                    const isRevealed = scratched[bIdx];
                    const isAnimating = scratchAnim[bIdx] && !isRevealed;
                    const bWin = ticket.bonus.isWinner;
                    return (
                      <button onClick={() => scratchSpot(bIdx)} style={{
                        width:80, height:44, borderRadius:8, border:"none",
                        display:"flex", alignItems:"center", justifyContent:"center",
                        cursor: phase === "scratching" && !isRevealed ? "pointer" : "default",
                        transition:"all 0.2s",
                        ...(isRevealed ? {
                          background: bWin ? "rgba(241,196,15,0.15)" : "rgba(255,255,255,0.04)",
                          border: bWin ? "2px solid rgba(241,196,15,0.5)" : "1px solid rgba(255,255,255,0.06)",
                          boxShadow: bWin ? "0 0 16px rgba(241,196,15,0.35)" : "none",
                          animation: bWin ? "matchReveal 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards" : "scratchBurst 0.35s ease-out",
                        } : {
                          ...unscratchedCell(isAnimating),
                          background: isAnimating ? `${theme.accent}40` : "linear-gradient(145deg, #a89878, #8a7858)",
                          border: "1px solid rgba(241,196,15,0.15)",
                        }),
                      }}>
                        {isRevealed ? (
                          bWin ? (
                            <span style={{ fontSize:14, fontWeight:800, color:"#f1c40f",
                              fontFamily:T.mono, animation:"fadeInScale 0.3s ease-out",
                              textShadow:"0 0 8px rgba(241,196,15,0.4)" }}>$ ${ticket.bonus.prize.toLocaleString()}</span>
                          ) : (
                            <span style={{ fontSize:16, color:T.dim }}>❌</span>
                          )
                        ) : (
                          <span style={{ fontSize:14, color:"rgba(255,255,255,0.3)", fontFamily:T.mono }}>★ ? ★</span>
                        )}
                      </button>
                    );
                  })()}
                </div>
              </div>
            </div>
            {}
            {phase === "scratching" && runningTotal > 0 && (
              <div style={{ textAlign:"center", marginBottom:8, animation:"winAccumulate 0.4s ease-out" }}>
                <span style={{ fontSize:16, fontWeight:700, color:T.green,
                  fontFamily:T.mono, padding:"4px 16px", borderRadius:8,
                  background:"rgba(34,197,94,0.08)", border:"1px solid rgba(34,197,94,0.2)",
                  display:"inline-block",
                  textShadow:"0 0 8px rgba(34,197,94,0.3)" }}>
                  Winnings: +${runningTotal.toLocaleString()}
                </span>
              </div>
            )}
            {}
            {phase === "scratching" && (
              <div style={{ textAlign:"center", marginBottom:8 }}>
                <button onClick={scratchAll} style={{
                  padding:"8px 24px", fontSize:11, fontWeight:700, fontFamily:T.mono,
                  letterSpacing:2, textTransform:"uppercase",
                  background:`${theme.accent}1a`, border:`1px solid ${theme.accent}4d`,
                  borderRadius:6, color:theme.accent, cursor:"pointer",
                }}>Scratch All</button>
              </div>
            )}
            {}
            {phase === "result" && (
              <div style={{ textAlign:"center" }}>
                {isJackpot && (
                  <div style={{ fontSize:20, fontWeight:900, color:"#f1c40f", marginBottom:6,
                    fontFamily:T.serif, letterSpacing:3,
                    animation:"bigWinPulse 0.6s ease-in-out infinite",
                    textShadow:"0 0 20px rgba(241,196,15,0.5)" }}>
                    ★ JACKPOT — 10,000× ♠
                  </div>
                )}
                <div style={{ fontSize:18, fontWeight:700, marginBottom:4,
                  fontFamily:T.serif, letterSpacing:2,
                  color: payout > 0 ? "#22c55e" : "#ef4444",
                  animation:"fadeIn 0.3s ease" }}>
                  {payout > 0
                    ? `WON $${payout.toLocaleString()}!`
                    : "No winners — try again!"}
                </div>
                {payout > 0 && winDetails.length > 0 && !isJackpot && (
                  <div style={{ fontSize:10, color:T.muted, marginBottom:8,
                    fontFamily:T.mono }}>
                    {winDetails.length} winning spot{winDetails.length > 1 ? "s" : ""}
                  </div>
                )}
                <GoldButton onClick={reset}>Buy Another</GoldButton>
              </div>
            )}
          </>
          );
        })()}
      </div>
      <div style={{ padding:"8px", fontSize:9, color:"#2e2a1a", letterSpacing:2, textTransform:"uppercase", zIndex:1 }}>
        Match your numbers to winning numbers · $ Auto-win · ▲ 2× Prize
      </div>
    </GameShell>
  );
}
