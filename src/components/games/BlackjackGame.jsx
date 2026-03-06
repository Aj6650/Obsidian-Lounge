import React, { useState, useCallback, useEffect, useRef } from 'react';
import { theme } from '../../theme-globals.js';
import { T, FELT_BG } from '../../constants/styles.js';
import { GameShell } from '../../components/GameShell.jsx';
import { ActionButton, actionBtnStyle } from '../../components/ui/ActionButton.jsx';
import { GoldButton } from '../../components/ui/GoldButton.jsx';
import { BetControls } from '../../components/ui/BetControls.jsx';
import { Card } from '../../components/ui/Card.jsx';

export function HandDisplay({ cards, hideFirst = false, label, value, isActive = false, flipReveal = false }) {
  const displayValue = hideFirst && cards.length >= 2 ? cardVal(cards[1]) : value;
  const isMobileH = typeof window !== "undefined" && window.innerWidth < 480;
  const cardOverlap = isMobileH ? (cards.length > 4 ? -24 : -18) : -12;
  const isBJHand = !hideFirst && cards.length === 2 && value === 21;
  return (
    <div style={{ textAlign:"center" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginBottom:10 }}>
        <span style={{ fontFamily:T.serif, fontSize:13, textTransform:"uppercase", letterSpacing:3, color:theme.accent, fontWeight:600 }}>{label}</span>
        <span style={{ background: isActive ? theme.accent : `${theme.accent}40`, color: isActive ? "#1a1a2e" : theme.accent, padding:"2px 10px", borderRadius:12, fontSize:13, fontWeight:"bold", fontFamily:T.mono,
          transition:"all 0.3s", animation: isActive ? "activeHandGlow 1.5s ease-in-out infinite" : "none" }}>
          {hideFirst ? `${displayValue}+?` : displayValue}
        </span>
      </div>
      <div style={{ display:"flex", justifyContent:"center", minHeight: isMobileH ? 100 : 134,
        padding:"4px 8px", borderRadius:12, transition:"all 0.3s",
        background: isActive ? `${theme.accent}0a` : "transparent",
        animation: isBJHand ? "bjCelebrate 0.8s ease-out forwards" : "none" }}>
        {cards.map((card, i) => (
          <div key={i} style={{ marginLeft: i > 0 ? cardOverlap : 0, zIndex:i, transform: isActive ? "translateY(-4px)" : "none", transition:"transform 0.2s" }}>
            <Card card={card} hidden={hideFirst && i === 0} index={i} flipping={flipReveal && i === 0} />
          </div>
        ))}
      </div>
    </div>
  );
}
export function BlackjackGame({ chips, setChips, onBack, onRebuy, startChips, lastBets = {}, setLastBet, winStreak = 0, vipPoints = 0, achCount = 0, reportLoss, applyWin = null, applyChipsReturn = null, onBetPlaced = null, onRoundEnd, skipOverlays = false, skipEffects = false, theme: themeMode = "dark", skinTheme, skinId = "house", activePowerUps = [] }) {
  const [deck, setDeck] = useState(() => createDeck(6));
  const [playerHands, setPlayerHands] = useState([[]]);
  const [activeHand, setActiveHand] = useState(0);
  const [dealerHand, setDealerHand] = useState([]);
  const [bet, setBet] = useState(() => Math.min(lastBets?.blackjack || 25, chips));
  useEffect(() => { if (setLastBet) setLastBet("blackjack", bet); }, [bet, setLastBet]);
  const [bets, setBets] = useState([0]);
  const [phase, setPhase] = useState("betting");
  useEffect(() => { if (phase === "resolved" && onRoundEnd) onRoundEnd(); }, [phase, onRoundEnd]);
  const [results, setResults] = useState([]);
  const [message, setMessage] = useState("Place your bet");
  const [stats, setStats] = useState({ wins:0, losses:0, pushes:0, blackjacks:0 });
  const fx = useWinEffects();
  const { shaking, shake, shakeIntensity, floatWins, addFloatWin, flash, triggerFlash, lightMode, triggerLights,
    bigWin, setBigWin, dismissOverlay, dismissAll, celebrateWin, shellEffects, coinRainActive, triggerCoins, softCoinRain, washType, triggerWash,
    confetti, triggerConfetti, eruptionActive, triggerEruption } = fx;
  const handVal = (hand) => {
    let t = 0, a = 0;
    for (const c of hand) { t += cardVal(c); if (c.rank === "A") a++; }
    while (t > 21 && a > 0) { t -= 10; a--; }
    return t;
  };
  const isBJ = (hand) => hand.length === 2 && handVal(hand) === 21;
  const deckRef = useRef(deck);
  useEffect(() => { deckRef.current = deck; }, [deck]);
  const drawCard = useCallback(() => {
    let d = [...deckRef.current];
    if (d.length < 20) d = createDeck(6);
    const card = d.pop();
    deckRef.current = d;
    setDeck(d);
    return card;
  }, []);
  const [insuranceOffered, setInsuranceOffered] = useState(false);
  const [insuranceBet, setInsuranceBet] = useState(0);
  const deal = () => {
    if (bet > chips) return;
    let d = [...deck];
    if (d.length < 20) d = createDeck(6);
    const p = [d.pop(), d.pop()], dl = [d.pop(), d.pop()];
    setDeck(d); setPlayerHands([p]); setDealerHand(dl);
    setChips(c => c - bet); if (onBetPlaced) onBetPlaced(bet); setBets([bet]); setResults([]);
    setActiveHand(0); setInsuranceOffered(false); setInsuranceBet(0);
    if (isBJ(p)) {
      if (isBJ(dl)) {
        setResults(["push"]); if (applyChipsReturn) applyChipsReturn(bet); else setChips(c => c + bet);
        setMessage("Both blackjack — Push!");
        setStats(s => ({ ...s, pushes: s.pushes + 1 }));
        setPhase("resolved"); triggerLights("push");
      } else {
        const w = Math.floor(bet * 2.5);
        setResults(["blackjack"]); if (applyWin) applyWin(w); else setChips(c => c + w);
        setMessage(`Blackjack! +$${w - bet}`);
        setStats(s => ({ ...s, wins: s.wins + 1, blackjacks: s.blackjacks + 1 }));
        setPhase("resolved"); triggerFlash(); shake();
        triggerLights("big"); addFloatWin(w - bet, { x: 50, y: 30 });
        softCoinRain(winStreak);
      }
    } else if (dl[1].rank === "A" && !isBJ(p)) {
      setInsuranceOffered(true); setPhase("insurance");
      setMessage("Dealer shows Ace — Insurance?");
    } else {
      setPhase("playing"); setMessage("Hit, Stand, or Double?");
    }
  };
  const takeInsurance = () => {
    const ins = Math.floor(bet / 2);
    setChips(c => c - ins); setInsuranceBet(ins); setInsuranceOffered(false);
    if (isBJ(dealerHand)) {
      setChips(c => c + ins * 3); setResults(["insurance"]);
      setMessage(`Dealer blackjack! Insurance pays +$${ins * 2}`);
      setStats(s => ({ ...s, pushes: s.pushes + 1 }));
      setPhase("resolved"); triggerFlash(); triggerLights("win"); softCoinRain(winStreak);
    } else {
      setPhase("playing"); setMessage("No blackjack. Hit, Stand, or Double?");
    }
  };
  const declineInsurance = () => {
    setInsuranceOffered(false);
    if (isBJ(dealerHand)) {
      setResults(["lose"]); setMessage("Dealer blackjack! You lose.");
      setStats(s => ({ ...s, losses: s.losses + 1 }));
      setPhase("resolved"); triggerLights("loss");
      if (reportLoss) reportLoss(bet);
    } else {
      setPhase("playing"); setMessage("Hit, Stand, or Double?");
    }
  };
  const surrender = () => {
    if (phase !== "playing" || playerHands[activeHand]?.length !== 2) return;
    const refund = Math.floor(bet / 2);
    if (applyChipsReturn) applyChipsReturn(refund); else setChips(c => c + refund); setResults(["surrender"]);
    setMessage(`Surrendered — $${refund} returned`);
    setStats(s => ({ ...s, losses: s.losses + 1 }));
    setPhase("resolved"); triggerLights("loss");
    if (reportLoss) reportLoss(bet - refund);
  };
  const hit = () => {
    const c = drawCard();
    const nh = [...playerHands];
    nh[activeHand] = [...nh[activeHand], c];
    setPlayerHands(nh);
    if (handVal(nh[activeHand]) > 21) nextHand(nh);
  };
  const stand = () => nextHand(playerHands);
  const betsRef = useRef(bets);
  useEffect(() => { betsRef.current = bets; }, [bets]);
  const dbl = () => {
    if (chips < bets[activeHand]) return;
    setChips(c => c - bets[activeHand]);
    const nb = [...bets]; nb[activeHand] *= 2; setBets(nb);
    betsRef.current = nb;
    const c = drawCard();
    const nh = [...playerHands];
    nh[activeHand] = [...nh[activeHand], c];
    setPlayerHands(nh); nextHand(nh);
  };
  const split = () => {
    const h = playerHands[activeHand];
    if (h.length !== 2 || h[0].rank !== h[1].rank) return;
    if (chips < bets[activeHand]) return;
    const isAces = h[0].rank === "A";
    setChips(c => c - bets[activeHand]);
    const c1 = drawCard(), c2 = drawCard();
    const nh = [...playerHands];
    nh.splice(activeHand, 1, [h[0], c1], [h[1], c2]);
    setPlayerHands(nh);
    const nb = [...bets];
    nb.splice(activeHand, 1, bets[activeHand], bets[activeHand]);
    setBets(nb);
    betsRef.current = nb;
    if (isAces) {
      setMessage(`Split Aces — one card each`);
      resolve(nh);
    } else {
      setMessage(`Hand ${activeHand + 1} of ${nh.length}`);
    }
  };
  const nextHand = (hands) => {
    if (activeHand < hands.length - 1) {
      setActiveHand(activeHand + 1);
      setMessage(`Hand ${activeHand + 2} of ${hands.length}`);
    } else {
      resolve(hands);
    }
  };
  const resolve = (hands) => {
    setPhase("dealer");
    let d = [...deck], dH = [...dealerHand];
    if (!hands.every(h => handVal(h) > 21)) {
      while (handVal(dH) < 17) {
        if (d.length < 5) d = createDeck(6);
        dH.push(d.pop());
      }
    }
    setDeck(d); setDealerHand(dH);
    const currentBets = betsRef.current;
    const dv = handVal(dH), db = dv > 21;
    const nr = []; let tw = 0; const ns = { ...stats };
    hands.forEach((h, i) => {
      const pv = handVal(h), b = currentBets[i] || bet;
      if (pv > 21) { nr.push("bust"); ns.losses++; }
      else if (db || pv > dv) { nr.push("win"); tw += b * 2; ns.wins++; }
      else if (pv === dv) { nr.push("push"); tw += b; ns.pushes++; }
      else { nr.push("lose"); ns.losses++; }
    });
    const net = tw - currentBets.reduce((a, b) => a + b, 0);
    if (net > 0) {
      if (applyWin) applyWin(tw); else setChips(c => c + tw);
    } else {
      if (applyChipsReturn) applyChipsReturn(tw); else setChips(c => c + tw);
    }
    setResults(nr); setStats(ns);
    if (net > 0) {
      triggerFlash(); triggerLights("win");
      addFloatWin(net, { x: 50, y: 30 });
      if (net >= bet * 3) { shake(); triggerLights("big"); softCoinRain(winStreak); }
      else { softCoinRain(winStreak); }
    } else if (net === 0) {
      triggerLights("push");
    } else {
      triggerLights("loss");
      if (reportLoss) reportLoss(Math.abs(net));
    }
    setMessage(tw === 0 ? "Dealer wins" : net > 0 ? `You win +$${net}!` : net === 0 ? "Push" : `You lose $${Math.abs(net)}`);
    setPhase("resolved");
  };
  const newRound = () => {
    setBigWin(null);
    fx.clearLights();
    setMessage("Place your bet");
    setPlayerHands([[]]); setDealerHand([]); setResults([]);
    setBets([0]); setActiveHand(0); setPhase("betting");
    setBet(b => Math.min(b, chips > 0 ? chips : 1000));
  };
  const canDbl = phase === "playing" && playerHands[activeHand]?.length === 2 && chips >= bets[activeHand];
  const canSpl = phase === "playing" && playerHands[activeHand]?.length === 2 && playerHands[activeHand][0].rank === playerHands[activeHand][1].rank;
  const handleKey = useCallback((key) => {
    if (phase === "betting" && (key === " " || key === "Enter")) deal();
    else if (phase === "playing") {
      if (key === "h") hit(); else if (key === "s") stand();
      else if (key === "d" && canDbl) dbl(); else if (key === "p" && canSpl) split();
      else if (key === "r") surrender();
    }
    else if (phase === "resolved" && (key === " " || key === "Enter")) newRound();
    else if (phase === "insurance") { if (key === "y") takeInsurance(); else if (key === "n") declineInsurance(); }
  }, [phase, canDbl, canSpl]);
  const msgColor = results.includes("blackjack") ? "#f1c40f" : results.includes("win") ? T.green
    : results.includes("bust") || results.includes("lose") ? T.red : theme.accent;
  const bjSessionDetail = (stats.wins + stats.losses + stats.pushes) > 0 ? (
    <div style={{ display:"flex", gap:16, fontFamily:T.mono, fontSize:10, color:T.muted }}>
      <span>W: <span style={{color:T.green}}>{stats.wins}</span></span>
      <span>L: <span style={{color:T.redDark}}>{stats.losses}</span></span>
      <span>P: <span style={{color:theme.accent}}>{stats.pushes}</span></span>
      <span>BJ: <span style={{color:"#f1c40f"}}>{stats.blackjacks}</span></span>
    </div>
  ) : null;
  return (
    <GameShell bg={FELT_BG} title="BLACKJACK" chips={chips} onBack={onBack} {...shellEffects} startChips={startChips} winStreak={winStreak} vipPoints={vipPoints} achCount={achCount} skipOverlays={skipOverlays} skipEffects={skipEffects} onRebuy={onRebuy} theme={themeMode} skinTheme={skinTheme} skinId={skinId} activePowerUps={activePowerUps} onKeyAction={handleKey} sessionDetail={bjSessionDetail} rules={<>
        <p style={{marginTop:0}}>Beat the dealer by getting closer to 21 without going over.</p>
        <p><span style={{color:theme.accent}}>Card Values:</span> Number cards are face value. Face cards (J/Q/K) = 10. Aces = 1 or 11.</p>
        <p><span style={{color:theme.accent}}>Gameplay:</span> You and the dealer each get 2 cards. One dealer card is face down. Hit to take another card, Stand to keep your hand.</p>
        <p><span style={{color:theme.accent}}>Double Down:</span> Double your bet and receive exactly one more card.</p>
        <p><span style={{color:theme.accent}}>Split:</span> If your first two cards match rank, split into two separate hands (each with its own bet).</p>
        <p><span style={{color:theme.accent}}>Blackjack:</span> An Ace + 10-value card on the initial deal pays 3:2.</p>
        <p><span style={{color:theme.accent}}>Dealer Rules:</span> Dealer must hit on 16 or less and stand on 17 or more.</p>
        <p><span style={{color:theme.accent}}>Insurance:</span> When dealer shows an Ace, you can pay half your bet as insurance. If dealer has blackjack, insurance pays 2:1.</p>
        <p><span style={{color:theme.accent}}>Surrender:</span> On your first two cards, give up half your bet to fold. Available before hitting.</p>
        <p><span style={{color:theme.accent}}>Bust:</span> Going over 21 is an automatic loss. If both bust, the dealer wins.</p>
        <p style={{color:T.muted, fontSize:11}}>House edge: ~0.5% with optimal play. Uses 6 decks.</p>
      </>}>
      {}
      <div style={{ display:"flex", flexDirection:"column",
        alignItems:"center", gap:16, width:"100%", maxWidth:520, padding:"0 16px", zIndex:1 }}>
        <div style={{ fontSize:16, fontWeight:600, textAlign:"center", minHeight:24,
          animation:"fadeIn 0.3s ease", letterSpacing:1, color:msgColor }}>{message}</div>
        {dealerHand.length > 0 && (
          <HandDisplay cards={dealerHand} hideFirst={phase === "playing"} label="Dealer" value={handVal(dealerHand)} flipReveal={phase !== "playing" && phase !== "betting"} />
        )}
        {playerHands[0].length > 0 && (
          <div style={{ display:"flex", gap:28, flexWrap:"wrap", justifyContent:"center" }}>
            {playerHands.map((hand, i) => (
              <div key={i} style={{ opacity: results[i] === "bust" ? 0.5 : 1, transition:"opacity 0.3s" }}>
                <HandDisplay cards={hand} label={playerHands.length > 1 ? `Hand ${i+1}` : "You"}
                  value={handVal(hand)} isActive={phase === "playing" && i === activeHand} />
                {results[i] && (
                  <div style={{ textAlign:"center", marginTop:8, fontSize:12, fontWeight:700,
                    letterSpacing:2, textTransform:"uppercase",
                    animation:"resultBadge 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
                    padding:"3px 12px", borderRadius:6, display:"inline-block",
                    background: results[i] === "win" || results[i] === "blackjack" ? "rgba(34,197,94,0.12)" : results[i] === "push" ? `${theme.accent}1f` : "rgba(239,68,68,0.12)",
                    border: `1px solid ${results[i] === "win" || results[i] === "blackjack" ? "rgba(34,197,94,0.3)" : results[i] === "push" ? `${theme.accent}4d` : "rgba(239,68,68,0.3)"}`,
                    color: results[i] === "win" || results[i] === "blackjack" ? T.green : results[i] === "push" ? theme.accent : T.red }}>
                    {results[i] === "blackjack" ? "♠ BLACKJACK ♠" : results[i]}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      {}
      <div style={{ padding:12, width:"100%", maxWidth:520, zIndex:1 }}>
        {phase === "betting" && (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:16 }}>
            <BetControls bet={bet} setBet={setBet} chips={chips} presets={[10,25,50,100,250]} />
            <GoldButton onClick={deal} disabled={bet > chips || bet < 1} hint="⏎ deal">Deal</GoldButton>
          </div>
        )}
        {phase === "insurance" && (
          <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap", animation:"fadeIn 0.3s ease" }}>
            <ActionButton label={`Insurance ($${Math.floor(bet/2)})`} onClick={takeInsurance} enabled={chips >= Math.floor(bet/2)} />
            <ActionButton label="No Insurance" onClick={declineInsurance} />
          </div>
        )}
        {phase === "playing" && (
          <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap", animation:"fadeIn 0.3s ease" }}>
            {[
              { l:"Hit", fn:hit, ok:true },
              { l:"Stand", fn:stand, ok:true },
              { l:"Double Down", fn:dbl, ok:canDbl },
              { l:"Split", fn:split, ok:canSpl },
              { l:"Surrender", fn:surrender, ok:playerHands[activeHand]?.length === 2 && playerHands.length === 1 },
            ].map(({ l, fn, ok }) => (
              <ActionButton key={l} label={l} onClick={fn} enabled={ok} />
            ))}
          </div>
        )}
        {phase === "resolved" && (
          <div style={{ display:"flex", gap:8, justifyContent:"center", flexWrap:"wrap" }}>
            <GoldButton onClick={newRound} small>Change Bet</GoldButton>
            {bet <= chips && bet >= 1 && (
              <GoldButton onClick={() => { newRound(); setTimeout(deal, 50); }}>Rebet ${bet} ♠</GoldButton>
            )}
          </div>
        )}
      </div>
      <div style={{ padding:12, fontSize:10, color:T.faint, letterSpacing:2, textTransform:"uppercase", zIndex:1 }}>
        6-Deck · Dealer Stands on 17 · Blackjack Pays 3:2
      </div>
      <FloatingWins wins={floatWins} />
    </GameShell>
  );
}
