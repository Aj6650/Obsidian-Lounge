import React, { useState, useEffect, useCallback } from 'react';
import { theme } from '../../theme-globals.js';
import { T } from '../../constants/styles.js';
import { GameShell } from '../../components/GameShell.jsx';
import { GoldButton } from '../../components/ui/GoldButton.jsx';
import { BetControls } from '../../components/ui/BetControls.jsx';
import { Card } from '../../components/ui/Card.jsx';

export function baccaratVal(card) {
  const r = card.rank;
  if (r === "A") return 1;
  if (["10","J","Q","K"].includes(r)) return 0;
  return parseInt(r);
}
export function baccaratTotal(cards) {
  return cards.reduce((sum, c) => sum + baccaratVal(c), 0) % 10;
}
export function BaccaratGame({ chips, setChips, onBack, onRebuy, startChips, lastBets = {}, setLastBet, winStreak = 0, vipPoints = 0, achCount = 0, reportLoss, applyWin = null, applyChipsReturn = null, onBetPlaced = null, onRoundEnd, skipOverlays = false, skipEffects = false, theme: themeMode = "dark", skinTheme, skinId = "house", activePowerUps = [] }) {
  const [bet, setBet] = useState(() => Math.min(lastBets?.baccarat || 25, chips));
  useEffect(() => { if (setLastBet) setLastBet("baccarat", bet); }, [bet, setLastBet]);
  const [betType, setBetType] = useState("player");
  const [playerCards, setPlayerCards] = useState([]);
  const [bankerCards, setBankerCards] = useState([]);
  const [phase, setPhase] = useState("betting");
  const [resultMsg, setResultMsg] = useState("");
  useEffect(() => { if (phase === "result" && onRoundEnd) onRoundEnd(); }, [phase, onRoundEnd]);
  const [won, setWon] = useState(false);
  const [winAmount, setWinAmount] = useState(0);
  const [history, setHistory] = useState([]);
  const fx = useWinEffects();
  const { shaking, shake, shakeIntensity, floatWins, addFloatWin, flash, triggerFlash, lightMode, triggerLights,
    bigWin, setBigWin, dismissOverlay, dismissAll, celebrateWin, shellEffects, coinRainActive, triggerCoins, softCoinRain, washType, triggerWash,
    confetti, triggerConfetti, eruptionActive, triggerEruption } = fx;
  const deal = () => {
    if (chips < bet) return;
    setChips(c => c - bet);
    if (onBetPlaced) onBetPlaced(bet);
    setPhase("dealing");
    const d = createDeck(8);
    const pc = [d.pop(), d.pop()];
    const bc = [d.pop(), d.pop()];
    let pTotal = baccaratTotal(pc);
    let bTotal = baccaratTotal(bc);
    const pNatural = pTotal >= 8;
    const bNatural = bTotal >= 8;
    if (!pNatural && !bNatural) {
      let playerThird = null;
      if (pTotal <= 5) {
        playerThird = d.pop();
        pc.push(playerThird);
        pTotal = baccaratTotal(pc);
      }
      if (playerThird === null) {
        if (bTotal <= 5) { bc.push(d.pop()); bTotal = baccaratTotal(bc); }
      } else {
        const pThirdVal = baccaratVal(playerThird);
        let bankerDraws = false;
        if (bTotal <= 2) bankerDraws = true;
        else if (bTotal === 3 && pThirdVal !== 8) bankerDraws = true;
        else if (bTotal === 4 && pThirdVal >= 2 && pThirdVal <= 7) bankerDraws = true;
        else if (bTotal === 5 && pThirdVal >= 4 && pThirdVal <= 7) bankerDraws = true;
        else if (bTotal === 6 && (pThirdVal === 6 || pThirdVal === 7)) bankerDraws = true;
        if (bankerDraws) { bc.push(d.pop()); bTotal = baccaratTotal(bc); }
      }
    }
    setTimeout(() => {
      setPlayerCards(pc);
      setBankerCards(bc);
      let winner, msg;
      if (pTotal > bTotal) { winner = "player"; msg = `Player ${pTotal} vs Banker ${bTotal}`; }
      else if (bTotal > pTotal) { winner = "banker"; msg = `Banker ${bTotal} vs Player ${pTotal}`; }
      else { winner = "tie"; msg = `Tie at ${pTotal}`; }
      let payout = 0;
      let isWin = false;
      if (betType === winner) {
        isWin = true;
        if (betType === "player") payout = bet * 2;
        else if (betType === "banker") payout = bet + Math.floor(bet * 0.95);
        else if (betType === "tie") payout = bet * 10;
      } else if (winner === "tie" && betType !== "tie") {
        payout = bet;
        msg += " — Push";
      }
      if (payout > 0) {
        if (isWin) { if (applyWin) applyWin(payout); else setChips(c => c + payout); }
        else { if (applyChipsReturn) applyChipsReturn(payout); else setChips(c => c + payout); }
        if (isWin) {
          const profit = payout - bet;
          setWinAmount(payout);
          setWon(true);
          if (profit > 0) addFloatWin(profit, {x:50, y:30});
          triggerFlash();
          if (betType === "tie") { shake(); triggerLights("big"); setBigWin({type:"big",amount:profit}); }
          else { triggerLights("win"); softCoinRain(winStreak); }
          msg += ` — Won $${profit}${betType === "banker" ? " (5% comm.)" : ""}!`;
        } else {
          setWon(false);
          setWinAmount(0);
          triggerLights("push");
          msg += " — Bet returned";
        }
      } else {
        setWon(false);
        setWinAmount(0);
        triggerLights("loss"); if (reportLoss) reportLoss(bet);
        msg += " — Lost";
      }
      setResultMsg(msg);
      setHistory(h => [...h.slice(-14), { winner, p: pTotal, b: bTotal }]);
      setPhase("result");
    }, 600);
  };
  const reset = () => {
    setBigWin(null);
    fx.clearLights();
    setBet(b => Math.min(b, chips > 0 ? chips : 25));
    setPhase("betting");
    setPlayerCards([]);
    setBankerCards([]);
    setResultMsg("");
    setWon(false);
    setWinAmount(0);
  };
  const handleKey = useCallback((key) => {
    if (phase === "betting") {
      if (key === " " || key === "Enter") { if (chips >= bet) deal(); }
      else if (key === "p" || key === "P") setBetType("player");
      else if (key === "b" || key === "B") setBetType("banker");
      else if (key === "t" || key === "T") setBetType("tie");
    } else if (phase === "result") {
      if (key === " " || key === "Enter") reset();
    }
  }, [phase, chips, bet, deal, reset]);
  const bg = "linear-gradient(180deg, #2e1a1a 0%, #1f0d0d 50%, #1a0808 100%)";
  return (
    <GameShell bg={bg} title="BACCARAT" chips={chips} onBack={onBack} {...shellEffects} startChips={startChips} winStreak={winStreak} vipPoints={vipPoints} achCount={achCount} skipOverlays={skipOverlays} skipEffects={skipEffects} onRebuy={onRebuy} theme={themeMode} skinTheme={skinTheme} skinId={skinId} activePowerUps={activePowerUps} onKeyAction={handleKey} rules={<>
        <p style={{marginTop:0}}>Bet on Player, Banker, or Tie. Closest to 9 wins.</p>
        <p><span style={{color:theme.accent}}>Card Values:</span> Ace = 1. Cards 2–9 = face value. 10, J, Q, K = 0. Only the last digit of the total counts (e.g. 15 = 5).</p>
        <p><span style={{color:theme.accent}}>Natural:</span> If either hand totals 8 or 9 on the first two cards, it's a "natural" and no more cards are drawn.</p>
        <p><span style={{color:theme.accent}}>Player Rule:</span> Player draws a third card on 0–5, stands on 6–7.</p>
        <p><span style={{color:theme.accent}}>Banker Rule:</span> Banker's draw depends on the Player's third card (complex rule handled automatically).</p>
        <p><span style={{color:theme.accent}}>Payouts:</span> Player bet pays 1:1. Banker bet pays 0.95:1 (5% commission). Tie bet pays 9:1. Player/Banker bets push on a tie.</p>
        <p style={{color:T.muted, fontSize:11}}>House edge: 1.06% (Banker), 1.24% (Player), 4.8% (Tie). Uses 8 decks.</p>
      </>}>
      <FloatingWins wins={floatWins} />
      {bigWin && !skipOverlays && <BigWinOverlay type={bigWin.type} amount={bigWin.amount} onDone={dismissOverlay} />}
      <div style={{ padding:"12px", position:"relative", zIndex:1, maxWidth:540, margin:"0 auto" }}>
        <EdgeLights mode={lightMode} color="#dc2626" />
        {}
        <div style={{ display:"flex", justifyContent:"center", gap:16, marginBottom:8, padding:"6px 12px",
          background:"rgba(255,240,220,0.03)", borderRadius:8, border:`1px solid ${theme.accent}14` }}>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:8, letterSpacing:2, color:T.dim, fontFamily:T.mono, textTransform:"uppercase" }}>Bet</div>
            <div style={{ fontSize:14, fontWeight:700, fontFamily:T.mono, color:theme.accent }}>${bet}</div>
          </div>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:8, letterSpacing:2, color:T.dim, fontFamily:T.mono, textTransform:"uppercase" }}>On</div>
            <div style={{ fontSize:12, fontWeight:700, fontFamily:T.mono, color: betType==="player"?"#3b82f6":betType==="banker"?"#dc2626":"#22c55e" }}>{betType.charAt(0).toUpperCase()+betType.slice(1)}</div>
          </div>
          {history.length > 0 && <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:8, letterSpacing:2, color:T.dim, fontFamily:T.mono, textTransform:"uppercase" }}>History</div>
            <div style={{ display:"flex", gap:3, alignItems:"center" }}>{history.slice(-6).map((h,i) => (
              <span key={i} style={{ width:8, height:8, borderRadius:"50%", display:"inline-block",
                background: h.winner==="player"?"#3b82f6":h.winner==="banker"?"#dc2626":"#22c55e" }} />
            ))}</div>
          </div>}
        </div>
        {}
        {playerCards.length > 0 && (() => {
          const pTotal = baccaratTotal(playerCards);
          const bTotal = baccaratTotal(bankerCards);
          const pWins = phase === "result" && pTotal > bTotal;
          const bWins = phase === "result" && bTotal > pTotal;
          const pNat = pTotal >= 8 && playerCards.length === 2;
          const bNat = bTotal >= 8 && bankerCards.length === 2;
          return (
          <div style={{ display:"flex", justifyContent:"space-around", marginBottom:16, animation:"fadeIn 0.4s ease" }}>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:10, letterSpacing:2, textTransform:"uppercase", marginBottom:6,
                fontFamily:T.mono,
                color: pWins ? "#22c55e" : "#8a8070",
                animation: pNat && phase === "result" ? "bacNatural 1.2s ease-in-out infinite" : "none" }}>
                Player <span style={{ fontWeight:700, fontSize:14, color: pWins ? "#22c55e" : theme.accent }}>{pTotal}</span>
                {pNat && <span style={{ fontSize:8, color:"#f1c40f", marginLeft:4 }}>NATURAL</span>}
              </div>
              <div style={{ display:"flex", gap:4, justifyContent:"center",
                borderRadius:8, padding:4,
                animation: pWins ? "bacWinHand 1.5s ease-in-out infinite" : "none" }}>
                {playerCards.map((c,i) => <div key={i} style={{ animation: `bacDealIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) ${i*0.15}s both` }}><Card card={c} /></div>)}
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"center", fontSize:14, color:T.dim, fontWeight:700 }}>VS</div>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:10, letterSpacing:2, textTransform:"uppercase", marginBottom:6,
                fontFamily:T.mono,
                color: bWins ? "#22c55e" : "#8a8070",
                animation: bNat && phase === "result" ? "bacNatural 1.2s ease-in-out infinite" : "none" }}>
                Banker <span style={{ fontWeight:700, fontSize:14, color: bWins ? "#22c55e" : theme.accent }}>{bTotal}</span>
                {bNat && <span style={{ fontSize:8, color:"#f1c40f", marginLeft:4 }}>NATURAL</span>}
              </div>
              <div style={{ display:"flex", gap:4, justifyContent:"center",
                borderRadius:8, padding:4,
                animation: bWins ? "bacWinHand 1.5s ease-in-out infinite" : "none" }}>
                {bankerCards.map((c,i) => <div key={i} style={{ animation: `bacDealIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) ${0.3+i*0.15}s both` }}><Card card={c} /></div>)}
              </div>
            </div>
          </div>
          );
        })()}
        {}
        {resultMsg && (
          <div style={{ textAlign:"center", marginBottom:14 }}>
            <div style={{ fontSize:14, fontWeight:700, letterSpacing:1, display:"inline-block",
              fontFamily:T.serif, padding:"4px 14px", borderRadius:8,
              color: won ? "#22c55e" : resultMsg.includes("Push") ? theme.accent : "#ef4444",
              background: won ? "rgba(34,197,94,0.08)" : resultMsg.includes("Push") ? `${theme.accent}14` : "rgba(239,68,68,0.08)",
              border: won ? "1px solid rgba(34,197,94,0.25)" : resultMsg.includes("Push") ? `1px solid ${theme.accent}33` : "1px solid rgba(239,68,68,0.2)",
              animation:"resultBadge 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards" }}>
              {resultMsg}
            </div>
          </div>
        )}
        {}
        {phase === "betting" && (
          <>
            <div style={{ display:"flex", gap:8, justifyContent:"center", marginBottom:14 }}>
              {[
                { id:"player", label:"Player", sub:"1:1", color:"#3b82f6" },
                { id:"tie", label:"Tie", sub:"9:1", color:theme.accent },
                { id:"banker", label:"Banker", sub:"0.95:1", color:"#dc2626" },
              ].map(b => {
                const isSel = betType === b.id;
                return (
                <button key={b.id} onClick={() => setBetType(b.id)} style={{
                  padding:"12px 18px", fontSize:14, fontWeight:700, flex:1,
                  fontFamily:T.serif, letterSpacing:1,
                  background: isSel ? `${b.color}22` : "rgba(255,255,255,0.03)",
                  border: `2px solid ${isSel ? b.color : "rgba(255,255,255,0.1)"}`,
                  borderRadius:10, color: isSel ? b.color : "#8a8070", cursor:"pointer",
                  transition:"all 0.2s", textAlign:"center",
                  animation: isSel ? "bacBetSelect 0.25s ease-out" : "none",
                  boxShadow: isSel ? `0 0 12px ${b.color}25` : "none",
                }}>
                  {b.label}
                  <div style={{ fontSize:10, color:T.dim, fontFamily:T.mono, marginTop:2 }}>{b.sub}</div>
                </button>
                );
              })}
            </div>
            <BetControls bet={bet} setBet={setBet} chips={chips} presets={[5,10,25,50,100]} />
            <div style={{ textAlign:"center", marginTop:8 }}>
              <GoldButton onClick={deal} disabled={chips < bet || bet <= 0} hint="⏎ deal">Deal</GoldButton>
            </div>
          </>
        )}
        {phase === "dealing" && (
          <div className="anim-spinner" style={{ textAlign:"center", fontSize:14, color:theme.accent, letterSpacing:3, fontFamily:T.mono }}>
            Dealing...
          </div>
        )}
        {phase === "result" && (
          <div style={{ display:"flex", gap:8, justifyContent:"center", flexWrap:"wrap" }}>
            <GoldButton onClick={reset} small>Change Bet</GoldButton>
            {bet <= chips && bet >= 1 && (
              <GoldButton onClick={() => { reset(); setTimeout(deal, 50); }}>Rebet ${bet} on {betType} ♠</GoldButton>
            )}
          </div>
        )}
        {}
        {history.length > 0 && (
          <div style={{ marginTop:16, display:"flex", gap:4, justifyContent:"center", flexWrap:"wrap" }}>
            {history.map((h, i) => {
              const isLatest = i === history.length - 1;
              return (
              <div key={`${h.winner}-${h.p}-${h.b}-${i}`} style={{ fontSize:10, padding:"3px 6px", borderRadius:4,
                fontFamily:T.mono, fontWeight:600,
                background: h.winner === "player" ? "rgba(59,130,246,0.15)" : h.winner === "banker" ? "rgba(220,38,38,0.15)" : `${theme.accent}26`,
                color: h.winner === "player" ? "#3b82f6" : h.winner === "banker" ? "#dc2626" : theme.accent,
                border: `1px solid ${h.winner === "player" ? "rgba(59,130,246,0.3)" : h.winner === "banker" ? "rgba(220,38,38,0.3)" : `${theme.accent}4d`}`,
                animation: isLatest ? "multBounceIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards" : "none",
                boxShadow: isLatest ? `0 0 6px ${h.winner === "player" ? "rgba(59,130,246,0.25)" : h.winner === "banker" ? "rgba(220,38,38,0.25)" : `${theme.accent}40`}` : "none",
              }}>
                {h.winner === "tie" ? "T" : h.winner === "player" ? "P" : "B"} {h.p}–{h.b}
              </div>
              );
            })}
          </div>
        )}
      </div>
      <div style={{ padding:"8px", fontSize:10, color:"#2e1a1a", letterSpacing:2, textTransform:"uppercase", zIndex:1 }}>
        Player · Banker · Tie · 8 Decks
      </div>
    </GameShell>
  );
}
