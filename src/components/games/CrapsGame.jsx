import React, { useState, useEffect, useCallback } from 'react';
import { theme } from '../../theme-globals.js';
import { T } from '../../constants/styles.js';
import { GameShell } from '../../components/GameShell.jsx';
import { GoldButton } from '../../components/ui/GoldButton.jsx';
import { BetControls } from '../../components/ui/BetControls.jsx';

export function CrapsGame({ chips, setChips, onBack, onRebuy, startChips, lastBets = {}, setLastBet, winStreak = 0, vipPoints = 0, achCount = 0, reportLoss, applyWin = null, applyChipsReturn = null, onBetPlaced = null, onRoundEnd, skipOverlays = false, skipEffects = false, theme: themeMode = "dark", skinTheme, skinId = "house", activePowerUps = [] }) {
  const [bet, setBet] = useState(() => Math.min(lastBets?.craps || 25, chips));
  useEffect(() => { if (setLastBet) setLastBet("craps", bet); }, [bet, setLastBet]);
  const [betType, setBetType] = useState("pass");
  const [comeBets, setComeBets] = useState([]);
  const [die1, setDie1] = useState(3);
  const [die2, setDie2] = useState(4);
  const [phase, setPhase] = useState("betting");
  const [point, setPoint] = useState(null);
  const [rollNum, setRollNum] = useState(0);
  const [resultMsg, setResultMsg] = useState("");
  useEffect(() => { if (phase === "result" && onRoundEnd) onRoundEnd(); }, [phase, onRoundEnd]);
  const [won, setWon] = useState(false);
  const [history, setHistory] = useState([]);
  const fx = useWinEffects();
  const { shaking, shake, shakeIntensity, floatWins, addFloatWin, flash, triggerFlash, lightMode, triggerLights,
    bigWin, setBigWin, dismissOverlay, dismissAll, celebrateWin, shellEffects, coinRainActive, triggerCoins, softCoinRain, washType, triggerWash,
    confetti, triggerConfetti, eruptionActive, triggerEruption } = fx;
  const processCome = (sum) => {
    let winPayout = 0, pushReturn = 0;
    const remaining = [];
    for (const cb of comeBets) {
      if (cb.point === null) {
        if (cb.type === "come") {
          if (sum === 7 || sum === 11) { winPayout += cb.amount * 2; }
          else if (sum === 2 || sum === 3 || sum === 12) {  }
          else { remaining.push({...cb, point: sum}); }
        } else {
          if (sum === 7 || sum === 11) {  }
          else if (sum === 2 || sum === 3) { winPayout += cb.amount * 2; }
          else if (sum === 12) { pushReturn += cb.amount;  }
          else { remaining.push({...cb, point: sum}); }
        }
      } else {
        if (cb.type === "come") {
          if (sum === cb.point) { winPayout += cb.amount * 2; }
          else if (sum === 7) {  }
          else { remaining.push(cb); }
        } else {
          if (sum === 7) { winPayout += cb.amount * 2; }
          else if (sum === cb.point) {  }
          else { remaining.push(cb); }
        }
      }
    }
    if (winPayout > 0) { if (applyWin) applyWin(winPayout); else setChips(c => c + winPayout); }
    if (pushReturn > 0) { if (applyChipsReturn) applyChipsReturn(pushReturn); else setChips(c => c + pushReturn); }
    setComeBets(remaining);
    return winPayout + pushReturn;
  };
  const animateRoll = (callback) => {
    let count = 0;
    const interval = setInterval(() => {
      setDie1(Math.floor(Math.random() * 6) + 1);
      setDie2(Math.floor(Math.random() * 6) + 1);
      count++;
      if (count >= 10) {
        clearInterval(interval);
        const d1 = Math.floor(Math.random() * 6) + 1;
        const d2 = Math.floor(Math.random() * 6) + 1;
        setDie1(d1);
        setDie2(d2);
        setTimeout(() => callback(d1, d2), 300);
      }
    }, 60);
  };
  const comeOutRoll = () => {
    if (chips < bet) return;
    setChips(c => c - bet);
    if (onBetPlaced) onBetPlaced(bet);
    setPhase("rolling");
    setResultMsg("");
    setRollNum(1);
    animateRoll((d1, d2) => {
      const sum = d1 + d2;
      if (betType === "pass") {
        if (sum === 7 || sum === 11) {
          const payout = bet * 2;
          if (applyWin) applyWin(payout); else setChips(c => c + payout);
          setWon(true);
          setResultMsg(`Natural ${sum}! Pass line wins!`);
          triggerFlash(); triggerLights("win"); softCoinRain(winStreak);
          addFloatWin(bet, {x:50, y:30});
          setHistory(h => [...h.slice(-14), { sum, type:"comeout", result:"win" }]);
          setPhase("result");
        } else if (sum === 2 || sum === 3 || sum === 12) {
          setWon(false);
          setResultMsg(`Craps ${sum}! Pass line loses.`);
          triggerLights("loss"); if (reportLoss) reportLoss(bet);
          setHistory(h => [...h.slice(-14), { sum, type:"comeout", result:"loss" }]);
          setPhase("result");
        } else {
          setPoint(sum);
          setResultMsg(`Point is ${sum}. Roll it again before a 7!`);
          triggerLights("win");
          setHistory(h => [...h.slice(-14), { sum, type:"comeout", result:"point" }]);
          setPhase("point");
        }
      } else {
        if (sum === 7 || sum === 11) {
          setWon(false);
          setResultMsg(`Natural ${sum}! Don't Pass loses.`);
          triggerLights("loss"); if (reportLoss) reportLoss(bet);
          setHistory(h => [...h.slice(-14), { sum, type:"comeout", result:"loss" }]);
          setPhase("result");
        } else if (sum === 2 || sum === 3) {
          const payout = bet * 2;
          if (applyWin) applyWin(payout); else setChips(c => c + payout);
          setWon(true);
          setResultMsg(`Craps ${sum}! Don't Pass wins!`);
          triggerFlash(); triggerLights("win"); softCoinRain(winStreak);
          addFloatWin(bet, {x:50, y:30});
          setHistory(h => [...h.slice(-14), { sum, type:"comeout", result:"win" }]);
          setPhase("result");
        } else if (sum === 12) {
          if (applyChipsReturn) applyChipsReturn(bet); else setChips(c => c + bet);
          setWon(false);
          setResultMsg(`12 — Push. Bet returned.`);
          triggerLights("push");
          setHistory(h => [...h.slice(-14), { sum, type:"comeout", result:"push" }]);
          setPhase("result");
        } else {
          setPoint(sum);
          setResultMsg(`Point is ${sum}. Hope for a 7 before ${sum}!`);
          triggerLights("win");
          setHistory(h => [...h.slice(-14), { sum, type:"comeout", result:"point" }]);
          setPhase("point");
        }
      }
    });
  };
  const pointRoll = () => {
    setPhase("pointRolling");
    setRollNum(r => r + 1);
    animateRoll((d1, d2) => {
      const sum = d1 + d2;
      const comePay = processCome(sum);
      const comeMsg = comePay > 0 ? ` Come bets: +$${comePay}` : "";
      if (betType === "pass") {
        if (sum === point) {
          const payout = bet * 2;
          if (applyWin) applyWin(payout); else setChips(c => c + payout);
          setWon(true);
          setResultMsg(`${sum}! Hit the point — Pass line wins!${comeMsg}`);
          triggerFlash(); triggerLights("win"); shake(200, "light"); softCoinRain(winStreak);
          addFloatWin(bet, {x:50, y:30});
          setHistory(h => [...h.slice(-14), { sum, type:"point", result:"win" }]);
          setPhase("result");
        } else if (sum === 7) {
          setWon(false);
          setResultMsg(`Seven out! Pass line loses.${comeMsg}`);
          triggerLights("loss"); if (reportLoss) reportLoss(bet);
          setHistory(h => [...h.slice(-14), { sum, type:"point", result:"loss" }]);
          setPhase("result");
        } else {
          setResultMsg(`Rolled ${sum}. Need ${point} to win, 7 loses.${comeMsg}`);
          setHistory(h => [...h.slice(-14), { sum, type:"point", result:"roll" }]);
          setPhase("point");
        }
      } else {
        if (sum === 7) {
          const payout = bet * 2;
          if (applyWin) applyWin(payout); else setChips(c => c + payout);
          setWon(true);
          setResultMsg(`Seven! Don't Pass wins!${comeMsg}`);
          triggerFlash(); triggerLights("win"); shake(200, "light"); softCoinRain(winStreak);
          addFloatWin(bet, {x:50, y:30});
          setHistory(h => [...h.slice(-14), { sum, type:"point", result:"win" }]);
          setPhase("result");
        } else if (sum === point) {
          setWon(false);
          setResultMsg(`${sum} — Point hit. Don't Pass loses.${comeMsg}`);
          triggerLights("loss"); if (reportLoss) reportLoss(bet);
          setHistory(h => [...h.slice(-14), { sum, type:"point", result:"loss" }]);
          setPhase("result");
        } else {
          setResultMsg(`Rolled ${sum}. Need 7 to win, ${point} loses.${comeMsg}`);
          setHistory(h => [...h.slice(-14), { sum, type:"point", result:"roll" }]);
          setPhase("point");
        }
      }
    });
  };
  const reset = () => {
    setBigWin(null);
    fx.clearLights();
    if (comeBets.length > 0) {
      const refund = comeBets.reduce((sum, cb) => sum + cb.amount, 0);
      if (refund > 0) { if (applyChipsReturn) applyChipsReturn(refund); else setChips(c => c + refund); }
    }
    setBet(b => Math.min(b, chips > 0 ? chips : 25));
    setPhase("betting");
    setPoint(null);
    setRollNum(0);
    setResultMsg("");
    setWon(false);
    setComeBets([]);
  };
  const handleKey = useCallback((key) => {
    if (key === " " || key === "Enter") {
      if (phase === "betting" && chips >= bet) comeOutRoll();
      else if (phase === "point") pointRoll();
      else if (phase === "result") reset();
    }
  }, [phase, chips, bet, comeOutRoll, pointRoll, reset]);
  const bg = "linear-gradient(180deg, #0d2818 0%, #0a1f12 50%, #061a0d 100%)";
  return (
    <GameShell bg={bg} title="Craps" chips={chips} onBack={onBack} {...shellEffects} startChips={startChips} winStreak={winStreak} vipPoints={vipPoints} achCount={achCount} skipOverlays={skipOverlays} skipEffects={skipEffects} onRebuy={onRebuy} theme={themeMode} skinTheme={skinTheme} skinId={skinId} activePowerUps={activePowerUps} onKeyAction={handleKey} rules={<>
        <p style={{marginTop:0}}>The classic dice game. Bet on the Pass Line or Don't Pass, then roll.</p>
        <p><span style={{color:theme.accent}}>Come-Out Roll:</span> The first roll of a new round determines what happens next.</p>
        <p><span style={{color:theme.accent}}>Pass Line:</span> Win on 7 or 11 (natural). Lose on 2, 3, or 12 (craps). Any other number sets the "point."</p>
        <p><span style={{color:theme.accent}}>Don't Pass:</span> The opposite — win on 2 or 3, lose on 7 or 11. 12 is a push (bet returned). Then root against the point.</p>
        <p><span style={{color:theme.accent}}>The Point:</span> Once a point is set (4, 5, 6, 8, 9, or 10), keep rolling. Pass wins if the point is hit before a 7. Don't Pass wins if 7 comes first.</p>
        <p><span style={{color:theme.accent}}>Payouts:</span> Even money (1:1) on all bets. The low house edge makes this one of the best bets in the casino.</p>
        <p><span style={{color:theme.accent}}>Come / Don&apos;t Come:</span> Available during the Point phase. Works like Pass/Don&apos;t Pass but establishes its own point. Multiple Come bets can be active at once.</p>
        <p style={{color:T.muted, fontSize:11}}>House edge: 1.41% (Pass) / 1.36% (Don&apos;t Pass).</p>
      </>}>
      <FloatingWins wins={floatWins} />
      {bigWin && !skipOverlays && <BigWinOverlay type={bigWin.type} amount={bigWin.amount} onDone={dismissOverlay} />}
      <div style={{ padding:"12px", position:"relative", zIndex:1, maxWidth:500, margin:"0 auto" }}>
        <EdgeLights mode={lightMode} color="#16a34a" />
        {}
        <div style={{ background:"linear-gradient(180deg, #1a6b35, #145a2c)", borderRadius:12,
          border: point ? "2px solid #f1c40f" : `2px solid ${theme.accent}`, padding:"16px", marginBottom:16, position:"relative",
          transition:"border-color 0.4s, box-shadow 0.4s",
          animation: point ? "crapsFeltGlow 2s ease-in-out infinite" : "none",
          boxShadow: point ? "0 0 15px rgba(241,196,15,0.1)" : "none" }}>
          {}
          {point && (
            <div style={{ position:"absolute", top:8, right:12, background:"#fff", borderRadius:"50%",
              width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center",
              fontWeight:900, fontSize:16, color:"#1a1a2e", fontFamily:T.mono,
              border:"3px solid #1a1a2e",
              animation:"crapsPointPulse 1.5s ease-in-out infinite" }}>
              {point}
            </div>
          )}
          {}
          <div style={{ display:"flex", justifyContent:"center", gap:12, marginBottom:12 }}>
            <div style={{ padding:"4px 16px", borderRadius:4, fontSize:11, fontWeight:700,
              fontFamily:T.serif, letterSpacing:2, textTransform:"uppercase",
              background: betType === "pass" ? "rgba(255,255,255,0.15)" : "transparent",
              color: betType === "pass" ? "#fff" : "rgba(255,255,255,0.4)",
              border:"1px solid rgba(255,255,255,0.2)" }}>
              Pass Line
            </div>
            <div style={{ padding:"4px 16px", borderRadius:4, fontSize:11, fontWeight:700,
              fontFamily:T.serif, letterSpacing:2, textTransform:"uppercase",
              background: betType === "dontpass" ? "rgba(255,255,255,0.15)" : "transparent",
              color: betType === "dontpass" ? "#fff" : "rgba(255,255,255,0.4)",
              border:"1px solid rgba(255,255,255,0.2)" }}>
              Don't Pass
            </div>
          </div>
          {}
          <div style={{ display:"flex", justifyContent:"center", gap:16, margin:"12px 0" }}>
            <div style={{ animation: (phase === "rolling" || phase === "pointRolling") ? "diceRoll 0.6s ease-out infinite"
              : (phase === "result" || phase === "point") ? "diceSlam 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)" : undefined,
              transition:"transform 0.3s",
              ...(phase === "result" && won ? { filter:"drop-shadow(0 0 6px rgba(34,197,94,0.4))" } : {}),
            }}>
              <DiceFace value={die1} size={52} rolling={phase === "rolling" || phase === "pointRolling"} />
            </div>
            <div style={{ animation: (phase === "rolling" || phase === "pointRolling") ? "diceRoll 0.6s ease-out infinite 0.15s"
              : (phase === "result" || phase === "point") ? "diceSlam 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) 0.08s both" : undefined,
              transition:"transform 0.3s",
              ...(phase === "result" && won ? { filter:"drop-shadow(0 0 6px rgba(34,197,94,0.4))" } : {}),
            }}>
              <DiceFace value={die2} size={52} rolling={phase === "rolling" || phase === "pointRolling"} />
            </div>
          </div>
          {}
          <div style={{ textAlign:"center", fontSize:13, fontFamily:T.mono,
            color:"rgba(255,255,255,0.7)", marginBottom:4 }}>
            {(phase !== "rolling" && phase !== "pointRolling") && (
              <span style={{ animation: (phase === "result" || phase === "point") ? "diceSumReveal 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards" : "none" }}>
                Sum: <span style={{ color: phase === "result" && won ? "#22c55e" : "#fff", fontWeight:700, fontSize:18,
                  textShadow: phase === "result" && won ? "0 0 8px rgba(34,197,94,0.3)" : "none" }}>{die1 + die2}</span>
              {rollNum > 0 && <span style={{ color:"rgba(255,255,255,0.4)", marginLeft:8 }}>Roll #{rollNum}</span>}</span>
            )}
          </div>
        </div>
        {}
        {resultMsg && (
          <div style={{ textAlign:"center", marginBottom:14 }}>
            <div style={{ fontSize:14, fontWeight:700, letterSpacing:1, display:"inline-block",
              fontFamily:T.serif, padding:"4px 14px", borderRadius:8,
              color: won ? "#22c55e" : phase === "point" ? theme.accent : "#ef4444",
              background: won ? "rgba(34,197,94,0.08)" : phase === "point" ? `${theme.accent}14` : "rgba(239,68,68,0.08)",
              border: won ? "1px solid rgba(34,197,94,0.25)" : phase === "point" ? `1px solid ${theme.accent}33` : "1px solid rgba(239,68,68,0.2)",
              animation: (phase === "result" || resultMsg.includes("Natural") || resultMsg.includes("Craps")) ? "crapsNatural 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards" : "fadeIn 0.3s ease" }}>
              {resultMsg}
            </div>
          </div>
        )}
        {}
        {phase === "betting" && (
          <>
            {}
            <div style={{ display:"flex", gap:6, justifyContent:"center", marginBottom:12, flexWrap:"wrap" }}>
              <button onClick={() => setBetType("pass")} style={{
                padding:"8px 14px", fontSize:12, fontWeight:700,
                fontFamily:T.serif, letterSpacing:1,
                background: betType === "pass" ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.05)",
                border: `1px solid ${betType === "pass" ? "#22c55e" : "rgba(255,255,255,0.1)"}`,
                borderRadius:8, color: betType === "pass" ? "#22c55e" : "#8a8070", cursor:"pointer",
                minWidth:0, flex:"1 1 auto", maxWidth:160,
              }}>
                Pass Line
                <div style={{ fontSize:8, color:"#6a6050", fontFamily:T.mono, marginTop:2 }}>1.41% edge</div>
              </button>
              <button onClick={() => setBetType("dontpass")} style={{
                padding:"8px 14px", fontSize:12, fontWeight:700,
                fontFamily:T.serif, letterSpacing:1,
                background: betType === "dontpass" ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.05)",
                border: `1px solid ${betType === "dontpass" ? "#ef4444" : "rgba(255,255,255,0.1)"}`,
                borderRadius:8, color: betType === "dontpass" ? "#ef4444" : "#8a8070", cursor:"pointer",
                minWidth:0, flex:"1 1 auto", maxWidth:160,
              }}>
                Don't Pass
                <div style={{ fontSize:8, color:"#6a6050", fontFamily:T.mono, marginTop:2 }}>1.36% edge</div>
              </button>
            </div>
            {}
            <BetControls bet={bet} setBet={setBet} chips={chips} presets={[5,10,25,50,100]} />
            <div style={{ textAlign:"center", marginTop:8 }}>
              <GoldButton onClick={comeOutRoll} disabled={chips < bet || bet <= 0} hint="⏎ roll">Come-Out Roll</GoldButton>
            </div>
          </>
        )}
        {}
        {(phase === "rolling" || phase === "pointRolling") && (
          <div style={{ textAlign:"center", fontSize:14, color:theme.accent, letterSpacing:3, fontFamily:T.mono }}>
            Rolling...
          </div>
        )}
        {}
        {phase === "point" && (
          <div style={{ textAlign:"center" }}>
            {comeBets.length > 0 && (
              <div style={{ marginBottom:10, fontSize:10, fontFamily:T.mono, color:T.muted }}>
                Come bets: {comeBets.map((cb, i) => (
                  <span key={i} style={{ color: cb.type==="come" ? "#22c55e" : "#ef4444", marginLeft:4 }}>
                    {cb.type==="come"?"C":"DC"}{cb.point ? `(${cb.point})` : ""} ${cb.amount}
                  </span>
                ))}
              </div>
            )}
            <div style={{ display:"flex", gap:6, justifyContent:"center", marginBottom:10, flexWrap:"wrap" }}>
              <button onClick={() => { if(chips>=bet){setChips(c=>c-bet);setComeBets(cb=>[...cb,{point:null,amount:bet,type:"come"}]);} }}
                disabled={chips<bet}
                style={{ padding:"6px 12px", fontSize:10, fontWeight:600, fontFamily:T.serif,
                  background:"rgba(34,197,94,0.15)", border:"1px solid rgba(34,197,94,0.4)", borderRadius:6,
                  color: chips>=bet ? "#22c55e" : "#555", cursor: chips>=bet ? "pointer" : "not-allowed", letterSpacing:1,
                  flex:"1 1 auto", minWidth:0, maxWidth:140 }}>
                Come ${bet}
              </button>
              <button onClick={() => { if(chips>=bet){setChips(c=>c-bet);setComeBets(cb=>[...cb,{point:null,amount:bet,type:"dontcome"}]);} }}
                disabled={chips<bet}
                style={{ padding:"6px 12px", fontSize:10, fontWeight:600, fontFamily:T.serif,
                  background:"rgba(239,68,68,0.15)", border:"1px solid rgba(239,68,68,0.4)", borderRadius:6,
                  color: chips>=bet ? "#ef4444" : "#555", cursor: chips>=bet ? "pointer" : "not-allowed", letterSpacing:1,
                  flex:"1 1 auto", minWidth:0, maxWidth:140 }}>
                Don&apos;t Come ${bet}
              </button>
            </div>
            <GoldButton onClick={pointRoll} hint="⏎ roll">Roll Again</GoldButton>
          </div>
        )}
        {}
        {phase === "result" && (
          <div style={{ display:"flex", gap:8, justifyContent:"center", flexWrap:"wrap" }}>
            <GoldButton onClick={reset} small>Change Bet</GoldButton>
            {bet <= chips && bet >= 1 && (
              <GoldButton onClick={() => { reset(); setTimeout(comeOutRoll, 50); }}>Rebet ${bet} </GoldButton>
            )}
          </div>
        )}
        {}
        {history.length > 0 && (
          <div style={{ marginTop:16, display:"flex", gap:4, justifyContent:"center", flexWrap:"wrap" }}>
            {history.map((h, i) => {
              const isLatest = i === history.length - 1;
              return (
              <div key={`${h.sum}-${h.result}-${i}`} style={{ fontSize:10, padding:"3px 6px", borderRadius:4,
                fontFamily:T.mono, fontWeight:600,
                background: h.result === "win" ? "rgba(34,197,94,0.15)" : h.result === "loss" ? "rgba(239,68,68,0.15)"
                  : h.result === "point" ? `${theme.accent}26` : "rgba(255,255,255,0.05)",
                color: h.result === "win" ? "#22c55e" : h.result === "loss" ? "#ef4444"
                  : h.result === "point" ? theme.accent : "#6a6050",
                border: `1px solid ${h.result === "win" ? "rgba(34,197,94,0.3)" : h.result === "loss" ? "rgba(239,68,68,0.3)"
                  : h.result === "point" ? `${theme.accent}4d` : "rgba(255,255,255,0.08)"}`,
                animation: isLatest ? "multBounceIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards" : "none",
              }}>
                {h.sum}
              </div>
              );
            })}
          </div>
        )}
      </div>
      <div style={{ padding:"8px", fontSize:10, color:"#0d2818", letterSpacing:2, textTransform:"uppercase", zIndex:1 }}>
        Pass line or don't pass · 1.4% house edge
      </div>
    </GameShell>
  );
}
