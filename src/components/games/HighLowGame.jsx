import React, { useState, useEffect, useCallback } from 'react';
import { theme } from '../../theme-globals.js';
import { T } from '../../constants/styles.js';
import { GameShell } from '../../components/GameShell.jsx';
import { GoldButton } from '../../components/ui/GoldButton.jsx';
import { BetControls } from '../../components/ui/BetControls.jsx';
import { Card } from '../../components/ui/Card.jsx';

export function HighLowGame({ chips, setChips, onBack, onRebuy, startChips, lastBets = {}, setLastBet, winStreak = 0, vipPoints = 0, achCount = 0, reportLoss, applyWin = null, onBetPlaced = null, onRoundEnd, skipOverlays = false, skipEffects = false, theme: themeMode = "dark", skinTheme, skinId = "house", activePowerUps = [] }) {
  const [deck, setDeck] = useState(() => createDeck(4));
  const [currentCard, setCurrentCard] = useState(null);
  const [nextCard, setNextCard] = useState(null);
  const [bet, setBet] = useState(() => Math.min(lastBets?.highlow || 25, chips));
  useEffect(() => { if (setLastBet) setLastBet("highlow", bet); }, [bet, setLastBet]);
  const [phase, setPhase] = useState("betting");
  const [hlStreak, setHlStreak] = useState(0);
  const [winnings, setWinnings] = useState(0);
  const [result, setResult] = useState("");
  const [history, setHistory] = useState([]);
  useEffect(() => { if (phase === "result" && onRoundEnd) onRoundEnd(); }, [phase, onRoundEnd]);
  const fx = useWinEffects();
  const { shaking, shake, shakeIntensity, floatWins, addFloatWin, flash, triggerFlash, lightMode, triggerLights,
    bigWin, setBigWin, dismissOverlay, dismissAll, celebrateWin, shellEffects, coinRainActive, triggerCoins, softCoinRain, washType, triggerWash,
    confetti, triggerConfetti, eruptionActive, triggerEruption } = fx;
  const RANK_ORDER = { "2":2,"3":3,"4":4,"5":5,"6":6,"7":7,"8":8,"9":9,"10":10,"J":11,"Q":12,"K":13,"A":14 };
  const rankVal = (card) => RANK_ORDER[card.rank];
  const HI_LO_PAYS = {
    2:  { high: 1.04, low: 0 },
    3:  { high: 1.06, low: 11.61 },
    4:  { high: 1.16, low: 5.81 },
    5:  { high: 1.29, low: 3.87 },
    6:  { high: 1.45, low: 2.9 },
    7:  { high: 1.66, low: 2.32 },
    8:  { high: 1.88, low: 1.88 },
    9:  { high: 2.32, low: 1.66 },
    10: { high: 2.9,  low: 1.45 },
    11: { high: 3.87, low: 1.29 },
    12: { high: 5.81, low: 1.16 },
    13: { high: 11.61, low: 1.06 },
    14: { high: 0,    low: 1.04 },
  };
  const getPayouts = (card) => {
    if (!card) return { high: 0, low: 0 };
    const r = rankVal(card);
    return HI_LO_PAYS[r] || { high: 1.8, low: 1.8 };
  };
  const payouts = getPayouts(currentCard);
  const deal = () => {
    let d = [...deck];
    if (d.length < 10) d = createDeck(4);
    const card = d.pop();
    setDeck(d);
    setCurrentCard(card);
    setNextCard(null);
    setChips(c => c - bet);
    if (onBetPlaced) onBetPlaced(bet);
    setWinnings(bet);
    setHlStreak(0);
    setResult("");
    setPhase("guessing");
  };
  const guess = (choice) => {
    let d = [...deck];
    if (d.length < 5) d = createDeck(4);
    const next = d.pop();
    setDeck(d);
    setNextCard(next);
    setPhase("revealing");
    const curr = rankVal(currentCard);
    const nxt = rankVal(next);
    const isHigher = nxt > curr;
    const isLower = nxt < curr;
    const isTie = nxt === curr;
    const correct = (choice === "higher" && isHigher) || (choice === "lower" && isLower);
    const roundPay = choice === "higher" ? payouts.high : payouts.low;
    setTimeout(() => {
      if (isTie) {
        setResult("tie");
        setHistory(h => [...h.slice(-11), { card: next, correct: null }]);
        triggerLights("push");
        setTimeout(() => {
          setCurrentCard(next);
          setNextCard(null);
          setPhase("guessing");
        }, 800);
      } else if (correct) {
        const newStreak = hlStreak + 1;
        setHlStreak(newStreak);
        const newWinnings = Math.floor(winnings * roundPay);
        setWinnings(newWinnings);
        setResult("correct");
        triggerFlash();
        triggerLights("win");
        if (roundPay >= 2.5 || newStreak >= 3) {
          shake();
          addFloatWin(newWinnings - bet, {x:50, y:30});
        }
        setHistory(h => [...h.slice(-11), { card: next, correct: true }]);
        setTimeout(() => {
          setCurrentCard(next);
          setNextCard(null);
          setPhase("guessing");
        }, 800);
      } else {
        setResult("wrong");
        setWinnings(0);
        triggerLights("loss");
        if (reportLoss) reportLoss(bet);
        setHistory(h => [...h.slice(-11), { card: next, correct: false }]);
        setTimeout(() => setPhase("result"), 600);
      }
    }, 500);
  };
  const cashOut = () => {
    if (applyWin) applyWin(winnings); else setChips(c => c + winnings);
    const profit = winnings - bet;
    if (profit > 0) {
      addFloatWin(profit, {x:50, y:30});
      triggerFlash();
      triggerLights(profit >= bet * 5 ? "big" : "win"); if(profit >= bet * 5){setBigWin({type:profit>=bet*15?"mega":"big",amount:profit});}else{softCoinRain(winStreak);}
      if (profit >= bet * 5) shake();
    }
    setResult("cashout");
    setPhase("result");
  };
  const newRound = () => {
    setBigWin(null);
    fx.clearLights();
    setBet(b => Math.min(b, chips > 0 ? chips : 10));
    setPhase("betting");
    setCurrentCard(null);
    setNextCard(null);
    setHlStreak(0);
    setWinnings(0);
    setResult("");
  };
  const handleKey = useCallback((key) => {
    if (phase === "betting") {
      if ((key === " " || key === "Enter") && chips >= bet) deal();
    } else if (phase === "guessing") {
      if (key === "h" || key === "H") { if (payouts.high > 0) guess("higher"); }
      else if (key === "l" || key === "L") { if (payouts.low > 0) guess("lower"); }
      else if ((key === " " || key === "Enter") && hlStreak >= 1) cashOut();
    } else if (phase === "result") {
      if (key === " " || key === "Enter") newRound();
    }
  }, [phase, chips, bet, payouts, hlStreak, deal, guess, cashOut, newRound]);
  const bg = "linear-gradient(180deg, #1a2a1a 0%, #0d1f0d 50%, #0a1a0a 100%)";
  return (
    <GameShell bg={bg} title="Hi-Lo" chips={chips} onBack={onBack} {...shellEffects} startChips={startChips} winStreak={hlStreak} vipPoints={vipPoints} achCount={achCount} skipOverlays={skipOverlays} skipEffects={skipEffects} onRebuy={onRebuy} theme={themeMode} skinTheme={skinTheme} skinId={skinId} activePowerUps={activePowerUps} onKeyAction={handleKey} rules={<>
        <p style={{marginTop:0}}>Guess whether the next card will be higher or lower than the current card.</p>
        <p><span style={{color:theme.accent}}>Card Order:</span> 2 (lowest) through Ace (highest). Suits don't matter.</p>
        <p><span style={{color:theme.accent}}>Payouts:</span> Each guess pays based on how likely it is. Guessing "higher" on a 2 is near-certain and pays only 1.08×. Guessing "lower" on a King is risky and pays 11×. Middle cards (7–8) pay ~1.8× either way.</p>
        <p><span style={{color:theme.accent}}>Ties:</span> If the next card is equal, it's a push — your pot is unchanged and you guess again.</p>
        <p><span style={{color:theme.accent}}>Cash Out:</span> After 1+ correct guesses, you can cash out at any time. If you guess wrong, you lose everything.</p>
        <p style={{color:T.muted, fontSize:11}}>House edge: ~3.5%. Uses 4 decks.</p>
      </>}>
      <FloatingWins wins={floatWins} />
      {bigWin && !skipOverlays && <BigWinOverlay type={bigWin.type} amount={bigWin.amount} onDone={dismissOverlay} />}
      <div style={{ padding:"12px", position:"relative", zIndex:1, maxWidth:540, margin:"0 auto" }}>
        <EdgeLights mode={lightMode} color="#f59e0b" />
        {}
        <div style={{ display:"flex", justifyContent:"center", gap:16, marginBottom:8, padding:"6px 12px",
          background:"rgba(255,240,220,0.03)", borderRadius:8, border:`1px solid ${theme.accent}14` }}>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:8, letterSpacing:2, color:T.dim, fontFamily:T.mono, textTransform:"uppercase" }}>Bet</div>
            <div style={{ fontSize:14, fontWeight:700, fontFamily:T.mono, color:theme.accent }}>${bet}</div>
          </div>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:8, letterSpacing:2, color:T.dim, fontFamily:T.mono, textTransform:"uppercase" }}>Streak</div>
            <div style={{ fontSize:14, fontWeight:700, fontFamily:T.mono, color: hlStreak > 0 ? "#22c55e" : T.muted }}>{hlStreak}</div>
          </div>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:8, letterSpacing:2, color:T.dim, fontFamily:T.mono, textTransform:"uppercase" }}>Pot</div>
            <div style={{ fontSize:14, fontWeight:700, fontFamily:T.mono, color: winnings > 0 ? "#f1c40f" : T.muted }}>${winnings.toLocaleString()}</div>
          </div>
          {history.length > 0 && <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:8, letterSpacing:2, color:T.dim, fontFamily:T.mono, textTransform:"uppercase" }}>Last</div>
            <div style={{ fontSize:14, fontWeight:700, fontFamily:T.mono, color:T.textMuted }}>{history.length > 0 ? history[history.length-1].card?.rank || "—" : "—"}</div>
          </div>}
        </div>
        {}
        {phase !== "betting" && phase !== "result" && (
          <div style={{ textAlign:"center", marginBottom:16 }}>
            <div style={{ display:"flex", justifyContent:"center", gap:20, marginBottom:8 }}>
              <div>
                <div style={{ fontSize:9, letterSpacing:2, color:T.dim, fontFamily:T.mono, textTransform:"uppercase" }}>Streak</div>
                <div style={{ fontSize:24, fontWeight:700, fontFamily:T.mono,
                  color: hlStreak >= 3 ? "#f59e0b" : hlStreak >= 1 ? theme.accent : "#8a8070",
                  animation: hlStreak >= 3 ? "hlStreakFire 1.2s ease-in-out infinite" : "none" }}>{hlStreak}</div>
              </div>
              <div>
                <div style={{ fontSize:9, letterSpacing:2, color:T.dim, fontFamily:T.mono, textTransform:"uppercase" }}>Pot</div>
                <div key={winnings} style={{ fontSize:24, fontWeight:700, fontFamily:T.mono, color:T.green,
                  animation: winnings > bet ? "hlPotPulse 0.3s ease-out" : "none" }}>${winnings}</div>
              </div>
              <div>
                <div style={{ fontSize:9, letterSpacing:2, color:T.dim, fontFamily:T.mono, textTransform:"uppercase" }}>Total ×</div>
                <div style={{ fontSize:24, fontWeight:700, fontFamily:T.mono, color:theme.accent }}>{(winnings / bet).toFixed(2)}×</div>
              </div>
            </div>
          </div>
        )}
        {}
        <div style={{ display:"flex", justifyContent:"center", alignItems:"center", gap:32, minHeight:170, marginBottom:16 }}>
          {currentCard && (
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:9, letterSpacing:2, color:T.dim, fontFamily:T.mono, marginBottom:6, textTransform:"uppercase" }}>Current</div>
              <Card card={currentCard} />
            </div>
          )}
          {(phase === "guessing" || phase === "revealing" || phase === "result") && (
            <div style={{ fontSize:20, color:theme.accent, fontWeight:700 }}>→</div>
          )}
          {nextCard ? (
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:9, letterSpacing:2, color:T.dim, fontFamily:T.mono, marginBottom:6, textTransform:"uppercase" }}>Next</div>
              <div style={{ animation: result === "wrong" ? "hlCardReveal 0.4s ease-out, hlWrong 0.5s ease-out 0.4s" : "hlCardReveal 0.4s ease-out",
                perspective:600, borderRadius:8,
                ...(result === "correct" ? { animation:"hlCardReveal 0.4s ease-out, hlCorrect 0.6s ease-out 0.3s" } : {}) }}>
                <Card card={nextCard} />
              </div>
            </div>
          ) : phase === "guessing" ? (
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:9, letterSpacing:2, color:T.dim, fontFamily:T.mono, marginBottom:6, textTransform:"uppercase" }}>Next</div>
              <div style={{ width:96, height:134, borderRadius:8, border:`2px dashed ${theme.accent}4d`,
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, color:`${theme.accent}4d`,
                background:`${theme.accent}05` }}>?</div>
            </div>
          ) : null}
        </div>
        {}
        {phase === "betting" && (
          <div style={{ textAlign:"center" }}>
            <BetControls bet={bet} setBet={setBet} chips={chips} presets={[5,10,25,50,100]} />
            <div style={{ marginTop:8, textAlign:"center" }}>
              <GoldButton onClick={deal} disabled={chips < bet || bet <= 0} hint="⏎ deal">Deal Card</GoldButton>
            </div>
          </div>
        )}
        {}
        {phase === "guessing" && (
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:11, letterSpacing:2, color:T.muted, fontFamily:T.mono, marginBottom:14, textTransform:"uppercase" }}>
              Will the next card be higher or lower?
            </div>
            <div style={{ display:"flex", gap:12, justifyContent:"center", marginBottom:12 }}>
              <button onClick={() => guess("higher")} disabled={payouts.high === 0} style={{
                padding:"14px 24px", fontSize:15, fontWeight:700, fontFamily:T.serif,
                letterSpacing:2, textTransform:"uppercase",
                background: payouts.high === 0 ? "rgba(100,100,100,0.3)" : "linear-gradient(180deg, #22c55e, #16a34a)", color:"#fff",
                border:"none", borderRadius:8, cursor: payouts.high === 0 ? "not-allowed" : "pointer",
                transition:"transform 0.15s", opacity: payouts.high === 0 ? 0.4 : 1,
                display:"flex", flexDirection:"column", alignItems:"center", gap:4,
              }}
                onMouseEnter={e => { if (payouts.high > 0) e.currentTarget.style.transform="scale(1.05)"; }}
                onMouseLeave={e => e.currentTarget.style.transform="scale(1)"}>
                <span>▲ Higher</span>
                {payouts.high > 0 && <span style={{ fontSize:11, opacity:0.85, fontFamily:T.mono }}>{payouts.high}×</span>}
              </button>
              <button onClick={() => guess("lower")} disabled={payouts.low === 0} style={{
                padding:"14px 24px", fontSize:15, fontWeight:700, fontFamily:T.serif,
                letterSpacing:2, textTransform:"uppercase",
                background: payouts.low === 0 ? "rgba(100,100,100,0.3)" : "linear-gradient(180deg, #ef4444, #dc2626)", color:"#fff",
                border:"none", borderRadius:8, cursor: payouts.low === 0 ? "not-allowed" : "pointer",
                transition:"transform 0.15s", opacity: payouts.low === 0 ? 0.4 : 1,
                display:"flex", flexDirection:"column", alignItems:"center", gap:4,
              }}
                onMouseEnter={e => { if (payouts.low > 0) e.currentTarget.style.transform="scale(1.05)"; }}
                onMouseLeave={e => e.currentTarget.style.transform="scale(1)"}>
                <span>▼ Lower</span>
                {payouts.low > 0 && <span style={{ fontSize:11, opacity:0.85, fontFamily:T.mono }}>{payouts.low}×</span>}
              </button>
            </div>
            {hlStreak >= 1 && (
              <button onClick={cashOut} style={{
                padding:"10px 24px", fontSize:12, fontWeight:700, fontFamily:T.mono,
                letterSpacing:2, textTransform:"uppercase",
                background:`${theme.accent}26`, border:`1px solid ${theme.accent}`,
                borderRadius:6, color:theme.accent, cursor:"pointer", transition:"all 0.2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.background=`${theme.accent}40`; }}
                onMouseLeave={e => { e.currentTarget.style.background=`${theme.accent}26`; }}>
                Cash Out ${winnings}
              </button>
            )}
          </div>
        )}
        {}
        {phase === "revealing" && (
          <div style={{ textAlign:"center", fontSize:14, color:theme.accent, letterSpacing:2, fontFamily:T.mono }}>
            Revealing...
          </div>
        )}
        {}
        {phase === "result" && (
          <div style={{ textAlign:"center" }}>
            {result === "wrong" && (
              <div style={{ fontSize:18, fontWeight:700, color:T.red, marginBottom:12,
                fontFamily:T.serif, letterSpacing:2,
                animation:"resultBadge 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
                display:"inline-block", padding:"4px 16px", borderRadius:8,
                background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)" }}>
                BUST! {hlStreak > 0 ? `Streak ended at ${hlStreak}` : "No streak"}
              </div>
            )}
            {result === "cashout" && (
              <div style={{ fontSize:18, fontWeight:700, color:T.green, marginBottom:12,
                fontFamily:T.serif, letterSpacing:2,
                animation:"resultBadge 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
                display:"inline-block", padding:"4px 16px", borderRadius:8,
                background:"rgba(34,197,94,0.1)", border:"1px solid rgba(34,197,94,0.3)",
                textShadow: winnings >= bet * 3 ? "0 0 10px rgba(34,197,94,0.3)" : "none" }}>
                CASHED OUT +${winnings - bet} (streak of {hlStreak})
              </div>
            )}
            <div style={{ display:"flex", gap:8, justifyContent:"center", flexWrap:"wrap" }}>
              <GoldButton onClick={newRound} small>Change Bet</GoldButton>
              {bet <= chips && bet >= 1 && (
                <GoldButton onClick={() => { newRound(); setTimeout(deal, 50); }}>Rebet ${bet} ♠</GoldButton>
              )}
            </div>
          </div>
        )}
        {}
        {history.length > 0 && (
          <div style={{ marginTop:20, display:"flex", gap:4, justifyContent:"center", flexWrap:"wrap" }}>
            {history.map((h, i) => {
              const isLatest = i === history.length - 1;
              return (
              <div key={`${h.card.rank}${h.card.suit}-${i}`} style={{ fontSize:11, padding:"3px 6px", borderRadius:4,
                fontFamily:T.mono, fontWeight:600,
                background: h.correct === null ? `${theme.accent}1a` : h.correct ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                color: h.correct === null ? theme.accent : h.correct ? "#22c55e" : "#ef4444",
                border: `1px solid ${h.correct === null ? `${theme.accent}40` : h.correct ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
                animation: isLatest ? "multBounceIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards" : "none",
              }}>
                {h.card.rank}{h.card.suit}
              </div>
              );
            })}
          </div>
        )}
      </div>
      <div style={{ padding:"8px", fontSize:10, color:"#1a3a1a", letterSpacing:2, textTransform:"uppercase", zIndex:1 }}>
        Guess higher or lower · Ties lose · Cash out anytime
      </div>
    </GameShell>
  );
}
