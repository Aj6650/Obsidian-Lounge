import React, { useState, useCallback, useEffect } from 'react';
import { theme } from '../../theme-globals.js';
import { T, BLUE_BG } from '../../constants/styles.js';
import { GameShell } from '../../components/GameShell.jsx';
import { GoldButton } from '../../components/ui/GoldButton.jsx';
import { BetControls } from '../../components/ui/BetControls.jsx';
import { Card } from '../../components/ui/Card.jsx';

export const VP_PAY_TABLE = [
  { name:"Royal Flush", mult:801, rank:9 },
  { name:"Straight Flush", mult:51, rank:8 },
  { name:"Four of a Kind", mult:26, rank:7 },
  { name:"Full House", mult:9, rank:6 },
  { name:"Flush", mult:6, rank:5 },
  { name:"Straight", mult:5, rank:4 },
  { name:"Three of a Kind", mult:4, rank:3 },
  { name:"Two Pair", mult:3, rank:2 },
  { name:"Jacks or Better", mult:2, rank:1 },
];
export function evaluateVPHand(cards) {
  const RANK_VAL = {"2":2,"3":3,"4":4,"5":5,"6":6,"7":7,"8":8,"9":9,"10":10,"J":11,"Q":12,"K":13,"A":14};
  const vals = cards.map(c => RANK_VAL[c.rank]).sort((a,b) => a - b);
  const suits = cards.map(c => c.suit);
  const isFlush = suits.every(s => s === suits[0]);
  const isAceLowStraight = vals[0]===2 && vals[1]===3 && vals[2]===4 && vals[3]===5 && vals[4]===14;
  const isHighStraight = vals[4] - vals[0] === 4 && new Set(vals).size === 5;
  const isStraight = isHighStraight || isAceLowStraight;
  const counts = {};
  vals.forEach(v => counts[v] = (counts[v]||0) + 1);
  const freq = Object.values(counts).sort((a,b) => b - a);
  const isRoyal = isFlush && isStraight && vals[0] === 10;
  if (isRoyal) return { name:"Royal Flush", mult:801, rank:9 };
  if (isFlush && isStraight) return { name:"Straight Flush", mult:51, rank:8 };
  if (freq[0] === 4) return { name:"Four of a Kind", mult:26, rank:7 };
  if (freq[0] === 3 && freq[1] === 2) return { name:"Full House", mult:9, rank:6 };
  if (isFlush) return { name:"Flush", mult:6, rank:5 };
  if (isStraight) return { name:"Straight", mult:5, rank:4 };
  if (freq[0] === 3) return { name:"Three of a Kind", mult:4, rank:3 };
  if (freq[0] === 2 && freq[1] === 2) return { name:"Two Pair", mult:3, rank:2 };
  if (freq[0] === 2) {
    const pairVal = parseInt(Object.entries(counts).find(([k,v]) => v === 2)[0]);
    if (pairVal >= 11) return { name:"Jacks or Better", mult:2, rank:1 };
  }
  return { name:"No Win", mult:0, rank:0 };
}
export function VideoPokerGame({ chips, setChips, onBack, onRebuy, startChips, lastBets = {}, setLastBet, winStreak = 0, vipPoints = 0, achCount = 0, reportLoss, applyWin = null, onBetPlaced = null, onRoundEnd, skipOverlays = false, skipEffects = false, theme: themeMode = "dark", skinTheme, skinId = "house", activePowerUps = [] }) {
  const [deck, setDeck] = useState(() => createDeck(1));
  const [hand, setHand] = useState([null,null,null,null,null]);
  const [held, setHeld] = useState([false,false,false,false,false]);
  const [bet, setBet] = useState(() => Math.min(lastBets?.poker || 5, chips));
  useEffect(() => { if (setLastBet) setLastBet("poker", bet); }, [bet, setLastBet]);
  const [phase, setPhase] = useState("betting");
  const [result, setResult] = useState(null);
  const [winAmount, setWinAmount] = useState(0);
  const [showOverlay, setShowOverlay] = useState(false);
  const [replacedCards, setReplacedCards] = useState(new Set());
  const [drawKey, setDrawKey] = useState(0);
  const fx = useWinEffects();
  const { shaking, shake, shakeIntensity, floatWins, addFloatWin, flash, triggerFlash, lightMode, triggerLights,
    bigWin, setBigWin, dismissOverlay, dismissAll, celebrateWin, shellEffects, coinRainActive, triggerCoins, softCoinRain, washType, triggerWash,
    confetti, triggerConfetti, eruptionActive, triggerEruption } = fx;
  useEffect(() => { if (phase === "result" && onRoundEnd) onRoundEnd(); }, [phase, onRoundEnd]);
  const deal = () => {
    let d = createDeck(1);
    for (let i = d.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [d[i], d[j]] = [d[j], d[i]];
    }
    const newHand = d.splice(0, 5);
    setDeck(d);
    setHand(newHand);
    setHeld([false,false,false,false,false]);
    setChips(c => c - bet);
    if (onBetPlaced) onBetPlaced(bet);
    setResult(null);
    setWinAmount(0);
    setPhase("dealt");
  };
  const toggleHold = (idx) => {
    if (phase !== "dealt") return;
    setHeld(h => { const n = [...h]; n[idx] = !n[idx]; return n; });
  };
  const draw = () => {
    setPhase("drawing");
    const d = [...deck];
    const replaced = new Set();
    const newHand = hand.map((card, i) => {
      if (held[i]) return card;
      replaced.add(i);
      return d.pop();
    });
    setDeck(d);
    setReplacedCards(replaced);
    setDrawKey(k => k + 1);
    setTimeout(() => {
      setHand(newHand);
      const res = evaluateVPHand(newHand);
      setResult(res);
      if (res.mult > 0) {
        const payout = bet * res.mult;
        setWinAmount(payout);
        if (applyWin) applyWin(payout); else setChips(c => c + payout);
        const profit = payout - bet;
        if (profit > 0) addFloatWin(profit, {x:50, y:30});
        triggerFlash();
        if (res.rank >= 7) { shake(); triggerLights("mega"); softCoinRain(winStreak); }
        else if (res.rank >= 4) { shake(); triggerLights("big"); softCoinRain(winStreak); }
        else { triggerLights("win"); softCoinRain(winStreak); }
      } else {
        triggerLights("loss");
        if (reportLoss) reportLoss(bet);
      }
      setPhase("result");
    }, 400);
  };
  const newRound = () => {
    fx.clearLights();
    setBet(b => Math.min(b, chips > 0 ? chips : 5));
    setPhase("betting");
    setHand([null,null,null,null,null]);
    setHeld([false,false,false,false,false]);
    setResult(null);
    setWinAmount(0);
    setReplacedCards(new Set());
  };
  const BLUE_BG = "linear-gradient(180deg, #181310 0%, #0e0a08 50%, #080604 100%)";
  const handleKey = useCallback((key) => {
    if (phase==="betting" && (key===" "||key==="Enter")) deal();
    else if (phase==="dealt") { if(key>="1"&&key<="5") toggleHold(parseInt(key)-1); else if(key===" "||key==="Enter") draw(); }
    else if (phase==="result" && (key===" "||key==="Enter")) newRound();
  }, [phase]);
  return (
    <GameShell bg={BLUE_BG} title="VIDEO POKER" chips={chips} onBack={onBack} {...shellEffects} startChips={startChips} winStreak={winStreak} vipPoints={vipPoints} achCount={achCount} skipOverlays={skipOverlays} skipEffects={skipEffects} onRebuy={onRebuy} theme={themeMode} skinTheme={skinTheme} skinId={skinId} activePowerUps={activePowerUps} onKeyAction={handleKey} rules={<>
        <p style={{marginTop:0}}>Classic Jacks or Better video poker. Make the best 5-card hand.</p>
        <p><span style={{color:theme.accent}}>Deal:</span> Place a bet and receive 5 cards face up.</p>
        <p><span style={{color:theme.accent}}>Hold & Draw:</span> Click cards to hold them, then draw to replace the rest. Your final hand determines the payout.</p>
        <p><span style={{color:theme.accent}}>Minimum Win:</span> A pair of Jacks, Queens, Kings, or Aces pays 1:1. Lower pairs don't pay.</p>
        <p><span style={{color:theme.accent}}>Pay Table:</span> Two Pair 2×, Three of a Kind 3×, Straight 4×, Flush 6×, Full House 9×, Four of a Kind 25×, Straight Flush 50×, Royal Flush 800×.</p>
        <p><span style={{color:theme.accent}}>Strategy:</span> Always hold winning hands. Hold high cards (J+) for a chance at Jacks or Better. Hold suited connectors for straight/flush draws.</p>
        <p style={{color:T.muted, fontSize:11}}>RTP: ~99.5% with optimal play. Uses 1 deck.</p>
      </>}>
      <FloatingWins wins={floatWins} />
      <div style={{ padding:"12px", position:"relative", zIndex:1, maxWidth:480, margin:"0 auto" }}>
        {}
        <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(59,130,246,0.2)",
          borderRadius:10, padding:"8px 12px", marginBottom:14 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr auto", gap:"2px 12px", fontSize:11,
            fontFamily:T.mono }}>
            {VP_PAY_TABLE.map(row => {
              const isHit = result && result.rank === row.rank;
              return (
              <React.Fragment key={row.rank}>
                <div style={{ color: isHit ? (row.rank >= 8 ? "#f1c40f" : "#22c55e") : "#8a8070",
                  fontWeight: isHit ? 700 : 400,
                  transition:"all 0.3s",
                  textShadow: isHit && row.rank >= 8 ? "0 0 8px rgba(241,196,15,0.4)" : "none" }}>{row.name}</div>
                <div style={{ color: isHit ? (row.rank >= 8 ? "#f1c40f" : "#22c55e") : theme.accent,
                  fontWeight:600, textAlign:"right",
                  transition:"all 0.3s",
                  textShadow: isHit && row.rank >= 8 ? "0 0 8px rgba(241,196,15,0.4)" : "none" }}>{row.mult - 1}×</div>
              </React.Fragment>
              );
            })}
          </div>
        </div>
        {}
        <div style={{ display:"flex", justifyContent:"center", gap:6, marginBottom:8, minHeight:130 }}>
          {hand.map((card, i) => {
            const isReplaced = phase === "result" && replacedCards.has(i);
            const isWinCard = phase === "result" && result && result.mult > 0;
            const isRoyal = result && result.rank >= 8;
            return (
            <div key={i} onClick={() => toggleHold(i)} style={{
              cursor: phase === "dealt" ? "pointer" : "default",
              transform: held[i] ? "translateY(-10px)" : "none",
              transition:"transform 0.15s",
              position:"relative",
              perspective: 600,
            }}>
              {card ? (
                <div style={{
                  animation: isReplaced ? `pokerFlipIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 0.08}s both` : undefined,
                  borderRadius: 6,
                  ...(isWinCard ? {
                    animation: isRoyal ? `pokerRoyalCard 1.2s ease-in-out infinite` : `pokerWinCard 1.5s ease-in-out infinite`,
                    borderRadius: 6,
                  } : {}),
                }}>
                  <Card card={card} small key={`${drawKey}-${i}`} />
                </div>
              ) : (
                <div style={{ width:60, height:84, borderRadius:6, border:"2px dashed rgba(59,130,246,0.2)",
                  background:"rgba(255,255,255,0.02)" }} />
              )}
              {held[i] && (
                <div style={{ position:"absolute", top:-14, left:"50%", transform:"translateX(-50%)",
                  fontSize:9, fontWeight:700, fontFamily:T.mono,
                  color:"#3b82f6", letterSpacing:1, textTransform:"uppercase",
                  background:"rgba(59,130,246,0.15)", padding:"1px 6px", borderRadius:3,
                  animation:"holdBadgePulse 1.5s ease-in-out infinite",
                  boxShadow:"0 0 8px rgba(59,130,246,0.2)" }}>HELD</div>
              )}
            </div>
            );
          })}
        </div>
        {}
        {phase === "dealt" && (
          <div style={{ textAlign:"center", fontSize:11, color:T.muted, fontFamily:T.mono,
            letterSpacing:1, marginBottom:10 }}>
            Click cards to hold, then draw
          </div>
        )}
        {}
        {result && (
          <div style={{ textAlign:"center", marginBottom:12, animation:"resultBadge 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards" }}>
            <div style={{ fontSize: result.rank >= 8 ? 22 : 18, fontWeight:700, letterSpacing: result.rank >= 7 ? 3 : 2,
              fontFamily:T.serif, display:"inline-block",
              padding: result.mult > 0 ? "4px 16px" : "4px 12px", borderRadius:8,
              background: result.rank >= 8 ? "rgba(241,196,15,0.12)" : result.rank >= 5 ? "rgba(34,197,94,0.1)" : result.mult > 0 ? "rgba(34,197,94,0.06)" : "rgba(239,68,68,0.08)",
              border: result.rank >= 8 ? "1px solid rgba(241,196,15,0.4)" : result.rank >= 5 ? "1px solid rgba(34,197,94,0.3)" : "none",
              color: result.rank >= 8 ? "#f1c40f" : result.mult > 0 ? "#22c55e" : "#ef4444",
              textShadow: result.rank >= 8 ? "0 0 15px rgba(241,196,15,0.4)" : "none" }}>
              {result.rank >= 8 ? `✦ ${result.name} ✦` : result.name}{result.mult > 0 ? ` — ${result.mult === 1 ? "Push" : `+$${winAmount - bet}`}!` : ""}
            </div>
          </div>
        )}
        {}
        {phase === "betting" && (
          <div style={{ textAlign:"center" }}>
            <BetControls bet={bet} setBet={setBet} chips={chips} presets={[1,5,10,25,50]} />
            <div style={{ marginTop:8 }}>
              <GoldButton onClick={deal} disabled={chips < bet || bet <= 0} hint="⏎ deal">Deal</GoldButton>
            </div>
          </div>
        )}
        {}
        {phase === "dealt" && (
          <div style={{ textAlign:"center" }}>
            <GoldButton onClick={draw} hint="⏎ draw">Draw</GoldButton>
          </div>
        )}
        {phase === "drawing" && (
          <div style={{ textAlign:"center", fontSize:14, color:theme.accent, letterSpacing:3, fontFamily:T.mono }}>
            Drawing...
          </div>
        )}
        {}
        {phase === "result" && (
          <div style={{ display:"flex", gap:8, justifyContent:"center", flexWrap:"wrap" }}>
            <GoldButton onClick={newRound} small>Change Bet</GoldButton>
            {bet <= chips && bet >= 1 && (
              <GoldButton onClick={() => { newRound(); setTimeout(deal, 50); }}>Rebet ${bet} ♠</GoldButton>
            )}
          </div>
        )}
      </div>
      <div style={{ padding:"12px", fontSize:10, color:"#3a4060", letterSpacing:2, textTransform:"uppercase", zIndex:1 }}>Jacks or Better · Hold & Draw · 99.5% RTP</div>
    </GameShell>
  );
}
