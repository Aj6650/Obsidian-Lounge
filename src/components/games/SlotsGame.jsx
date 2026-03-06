import React, { useState, useCallback, useEffect, useRef } from 'react';
import { theme } from '../../theme-globals.js';
import { T, PURPLE_BG } from '../../constants/styles.js';
import { GameShell } from '../../components/GameShell.jsx';
import { GoldButton } from '../../components/ui/GoldButton.jsx';
import { BetControls } from '../../components/ui/BetControls.jsx';
import { SLOT_ICON_MAP, SLOT_LABEL_MAP } from '../../components/ui/GameIcons.jsx';

export const SLOT_SYMBOLS = [
  { id:"cherry", weight:22 },{ id:"lemon", weight:20 },{ id:"orange", weight:18 },
  { id:"grape", weight:15 },{ id:"bell", weight:12 },{ id:"diamond", weight:9 },
  { id:"seven", weight:6 },{ id:"joker", weight:5 },{ id:"scatter", weight:4 },
];
export const WILD_ID = "joker";
export const SCAT_ID = "scatter";
export const SLOT_PAY = {
  cherry:[5,15,50], lemon:[5,18,65], orange:[7,24,90],
  grape:[12,36,140], bell:[18,65,260], diamond:[30,115,460],
  seven:[48,230,880], joker:[70,460,1750],
};
export const SLOT_PAY_ORDER = ["joker","seven","diamond","bell","grape","orange","lemon","cherry"];
export const SCAT_AWARDS = { 3:{mult:2,spins:6}, 4:{mult:5,spins:8}, 5:{mult:15,spins:10} };
export const FREE_SPIN_MULT = 2;
export const PAYLINES = [
  [1,1,1,1,1],
  [0,0,0,0,0],
  [2,2,2,2,2],
  [0,1,2,1,0],
  [2,1,0,1,2],
  [0,0,1,2,2],
  [2,2,1,0,0],
  [1,0,0,0,1],
  [1,2,2,2,1],
  [0,1,1,1,0],
  [2,1,1,1,2],
  [1,0,1,0,1],
  [1,2,1,2,1],
  [0,1,0,1,0],
  [2,1,2,1,2],
  [1,1,0,1,1],
  [1,1,2,1,1],
  [0,2,0,2,0],
  [2,0,2,0,2],
  [0,2,1,2,0],
];
export function weightedRandom() {
  const tw = SLOT_SYMBOLS.reduce((s,sym)=>s+sym.weight,0);
  let r = Math.random()*tw;
  for(const sym of SLOT_SYMBOLS){r-=sym.weight;if(r<=0)return sym.id;}
  return SLOT_SYMBOLS[0].id;
}
export function checkSlot5Wins(grid, betPerLine, totalBet, isFree) {
  const mult = isFree ? FREE_SPIN_MULT : 1;
  const wins = [];
  let scatCount = 0;
  for(let r=0;r<5;r++) for(let row=0;row<3;row++) if(grid[r][row]===SCAT_ID) scatCount++;
  if(scatCount >= 3) {
    const sa = SCAT_AWARDS[scatCount];
    wins.push({ line:-1, sym:SCAT_ID, count:scatCount, mult:sa.mult, payout:totalBet*sa.mult*mult, spins:sa.spins, positions:null });
  }
  PAYLINES.forEach((line, li) => {
    const syms = line.map((row, reel) => grid[reel][row]);
    let baseSym = null;
    for(const s of syms){ if(s!==WILD_ID && s!==SCAT_ID){ baseSym=s; break; } }
    if(!baseSym && syms.some(s=>s===WILD_ID)) baseSym = WILD_ID;
    if(!baseSym) return;
    let count = 0;
    for(let i=0;i<5;i++){
      if(syms[i]===baseSym || syms[i]===WILD_ID) count++; else break;
    }
    if(count >= 3) {
      const pay = SLOT_PAY[baseSym];
      if(pay){
        const m = pay[count-3];
        wins.push({ line:li, sym:baseSym, count, mult:m, payout:betPerLine*m*mult, positions:line });
      }
    }
  });
  return wins;
}
export function SlotReel5({ symbols, spinning, winRows, justStopped }) {
  const isMobileS = typeof window !== "undefined" && window.innerWidth < 480;
  const isNarrow = typeof window !== "undefined" && window.innerWidth < 380;
  const CELL_H = isNarrow ? 50 : isMobileS ? 58 : 82;
  const REEL_W = isNarrow ? 50 : isMobileS ? 58 : 82;
  const stripRef = useRef(null);
  if (!stripRef.current) {
    stripRef.current = Array.from({ length: 12 }, () => {
      const syms = Object.keys(SLOT_ICON_MAP);
      return syms[Math.floor(Math.random() * syms.length)];
    });
  }
  return (
    <div style={{ width:REEL_W, minWidth:REEL_W, flexShrink:0, borderRadius:8, border:`1px solid ${theme.accent}26`, overflow:"hidden", position:"relative",
      background:"rgba(0,0,0,0.4)",
      animation: justStopped ? "slotClunk 0.25s cubic-bezier(0.36, 0, 0.66, -0.56)" : "none" }}>
      {spinning ? (
        <div style={{ height: CELL_H * 3, overflow:"hidden", position:"relative" }}>
          <div className="reel-strip spinning">
            <div className="reel-strip-inner" style={{ display:"flex", flexDirection:"column" }}>
              {[...stripRef.current, ...stripRef.current].map((sym, i) => (
                <div key={i} style={{
                  height: CELL_H, display:"flex", alignItems:"center", justifyContent:"center",
                  borderTop: i > 0 ? "1px solid rgba(255,255,255,0.04)" : "none",
                  filter: "blur(0.5px)", opacity: 0.7,
                }}>
                  {SLOT_ICON_MAP[sym] || <span style={{color:"#333",fontSize:22}}>—</span>}
                </div>
              ))}
            </div>
          </div>
          {}
          <div style={{ position:"absolute", top:0, left:0, right:0, height:20,
            background:"linear-gradient(180deg, rgba(26,14,24,0.8), transparent)", pointerEvents:"none" }} />
          <div style={{ position:"absolute", bottom:0, left:0, right:0, height:20,
            background:"linear-gradient(0deg, rgba(26,14,24,0.8), transparent)", pointerEvents:"none" }} />
        </div>
      ) : (
        symbols.map((sym, row) => {
          const isWin = winRows.includes(row);
          const isScat = sym === "scatter";
          return (
            <div key={row} style={{
              height: CELL_H, display:"flex", alignItems:"center", justifyContent:"center",
              transition: "all 0.3s",
              background: isScat ? "rgba(241,196,15,0.18)" : isWin ? `${theme.accent}1f` : "transparent",
              borderTop: row > 0 ? "1px solid rgba(255,255,255,0.04)" : "none",
              boxShadow: isScat ? "inset 0 0 20px rgba(241,196,15,0.3)" : isWin ? `inset 0 0 15px ${theme.accent}33` : "none",
              animation: isScat ? "pulse 1s infinite" : "none",
            }}>
              <div style={{
                animation: justStopped ? `symbolLand 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) ${row * 0.05}s both`
                  : isWin ? "symbolWinGlow 1.2s ease-in-out infinite"
                  : "none",
                transform: isWin && !justStopped ? "scale(1.2)" : isScat ? "scale(1.15)" : "scale(1.0)",
                transition:"transform 0.3s",
              }}>
                {sym ? SLOT_ICON_MAP[sym] : <span style={{color:"#333",fontSize:22}}>—</span>}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
export function SlotsGame({ chips, setChips, onBack, onRebuy, startChips, lastBets = {}, setLastBet, winStreak = 0, vipPoints = 0, achCount = 0, reportLoss, applyWin = null, onBetPlaced = null, onRoundEnd, skipOverlays = false, skipEffects = false, theme: themeMode = "dark", skinTheme, skinId = "house", activePowerUps = [] }) {
  const REELS = 5, ROWS = 3;
  const SLOT_SYMS = Object.keys(SLOT_PAY);
  const emptyGrid = () => Array.from({length:REELS}, () => Array.from({length:ROWS}, () => SLOT_SYMS[Math.floor(Math.random() * SLOT_SYMS.length)]));
  const [displayReels, setDisplayReels] = useState(emptyGrid);
  const [bet, setBet] = useState(() => Math.min(lastBets?.slots || 20, chips));
  useEffect(() => { if (setLastBet) setLastBet("slots", bet); }, [bet, setLastBet]);
  const [phase, setPhase] = useState("betting");
  const [wins, setWins] = useState([]);
  const [totalWin, setTotalWin] = useState(0);
  const [message, setMessage] = useState("Spin to play — 20 paylines");
  const [spinning, setSpinning] = useState(Array(REELS).fill(false));
  const [reelJustStopped, setReelJustStopped] = useState(Array(REELS).fill(false));
  const [winHighlight, setWinHighlight] = useState("");
  const [activePayline, setActivePayline] = useState(-1);
  const cycleRef = useRef(null);
  useEffect(() => { if (phase === "resolved" && onRoundEnd) onRoundEnd(); }, [phase, onRoundEnd]);
  const [freeSpins, setFreeSpins] = useState(0);
  const [freeSpinTotal, setFreeSpinTotal] = useState(0);
  const [slotLastBet, setSlotLastBet] = useState(0);
  const [nearMiss, setNearMiss] = useState(null);
  const [showPaylines, setShowPaylines] = useState(false);
  const intervals = useRef([]);
  const fx = useWinEffects();
  const { shaking, shake, shakeIntensity, floatWins, addFloatWin, flash, triggerFlash, lightMode, triggerLights,
    bigWin, setBigWin, dismissOverlay, dismissAll, celebrateWin, shellEffects, coinRainActive, triggerCoins, softCoinRain, washType, triggerWash,
    confetti, triggerConfetti, eruptionActive, triggerEruption } = fx;
  const isFree = freeSpins > 0;
  const betPerLine = Math.max(1, Math.round(bet / 20));
  const actualBet = bet;
  useEffect(() => {
    if (freeSpins > 0 && phase === "resolved" && !bigWin) {
      const timer = setTimeout(() => {
        doSpin(slotLastBet || actualBet);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [freeSpins, phase, bigWin]);
  useEffect(() => {
    return () => {
      if(cycleRef.current) { clearInterval(cycleRef.current); cycleRef.current = null; }
      intervals.current.forEach(i=>clearInterval(i));
    };
  }, []);
  const doSpin = (freeBet) => {
    const useBet = freeBet || actualBet;
    const bpl = Math.max(1, Math.round(useBet / 20));
    if(!freeBet) { if(useBet>chips||bet<1) return; setChips(c=>c-useBet); if (onBetPlaced) onBetPlaced(useBet); setSlotLastBet(useBet); }
    setPhase("spinning"); setWins([]); setTotalWin(0);
    setWinHighlight(""); setActivePayline(-1); setBigWin(null); setNearMiss(null);
    if(cycleRef.current) { clearInterval(cycleRef.current); cycleRef.current = null; }
    setReelJustStopped(Array(REELS).fill(false));
    setMessage(isFree ? `Free Spin (${freeSpins} left) — 2× multiplier!` : "Spinning...");
    const finalGrid = Array.from({length:REELS}, () =>
      Array.from({length:ROWS}, () => weightedRandom())
    );
    setSpinning(Array(REELS).fill(true));
    for(let r=0;r<REELS;r++){
      intervals.current[r]=setInterval(()=>{
        setDisplayReels(prev=>{
          const n=[...prev]; n[r]=Array.from({length:ROWS},()=>weightedRandom()); return n;
        });
      },80);
    }
    const previewWins = checkSlot5Wins(finalGrid, bpl, useBet, !!freeBet);
    const hasBigPotential = previewWins.some(w => w.count >= 4 && w.payout >= useBet * 5);
    const reelDelays = hasBigPotential ? [500,700,900,1300,2000] : [500,700,900,1100,1400];
    reelDelays.forEach((delay,r)=>{
      setTimeout(()=>{
        clearInterval(intervals.current[r]);
        setDisplayReels(prev=>{const n=[...prev];n[r]=finalGrid[r];return n;});
        setSpinning(prev=>{const n=[...prev];n[r]=false;return n;});
        setReelJustStopped(prev=>{const n=[...prev];n[r]=true;return n;});
        setTimeout(()=>setReelJustStopped(prev=>{const n=[...prev];n[r]=false;return n;}), 250);
        if(hasBigPotential && r === 3) setMessage("✦ Come on... ✦");
        if(r===REELS-1){
          const w = checkSlot5Wins(finalGrid, bpl, useBet, !!freeBet);
          const tw = w.reduce((s,win)=>s+win.payout, 0);
          const newSpins = w.reduce((s,win)=>s+(win.spins||0), 0);
          setWins(w); setTotalWin(tw);
          if(tw > 0) { if (applyWin) applyWin(tw); else setChips(c=>c+tw); }
          if(newSpins > 0){
            setFreeSpins(f=>f+newSpins);
            setFreeSpinTotal(t=>t+newSpins);
          }
          if(freeBet) {
            setFreeSpins(f=>f-1);
          }
          let scatOnGrid = 0;
          for(let rr=0;rr<5;rr++) for(let ro=0;ro<3;ro++) if(finalGrid[rr][ro]===SCAT_ID) scatOnGrid++;
          if(tw > 0){
            triggerFlash();
            addFloatWin(tw, { bigThreshold: useBet * 2, megaThreshold: useBet * 10 });
            const ratio = tw / useBet;
            const slotProfit = freeBet ? tw : tw - useBet;
            const epicThresh = freeBet ? 100 : 50;
            const megaThresh = freeBet ? 30 : 15;
            const bigThresh = freeBet ? 15 : 5;
            if(ratio >= epicThresh) { shake(800, "epic"); setBigWin({ type:"epic", amount:slotProfit }); triggerLights("mega", 4000); }
            else if(ratio >= megaThresh) { shake(600, "heavy"); setBigWin({ type:"mega", amount:slotProfit }); triggerLights("mega", 3000); }
            else if(ratio >= bigThresh) { shake(400, "normal"); setBigWin({ type:"big", amount:slotProfit }); triggerLights("big", 2500); }
            else if(ratio >= 1) { shake(200, "light"); triggerLights("win", 1500); softCoinRain(winStreak); }
            else { triggerLights("win", 1000); softCoinRain(winStreak); }
            const scatWin = w.find(x=>x.sym===SCAT_ID);
            if(scatWin){
              setMessage(`⭐ ${scatWin.count} SCATTERS! +$${tw} + ${scatWin.spins} FREE SPINS! ⭐`);
            } else if(w.length===1){
              setMessage(`${w[0].count}× ${SLOT_LABEL_MAP[w[0].sym]} — +$${tw}!`);
              setWinHighlight(w[0].sym);
              if(w[0].line >= 0) setActivePayline(w[0].line);
            } else {
              setMessage(`${w.length} wins! +$${tw}${newSpins>0?` + ${newSpins} FREE SPINS!`:""}`);
              setWinHighlight("multi");
              const payWins = w.filter(x=>x.line>=0);
              if(payWins.length>0){
                setActivePayline(payWins[0].line);
                let ci = 0;
                cycleRef.current = setInterval(() => { ci=(ci+1)%payWins.length; setActivePayline(payWins[ci].line); }, 1400);
              }
            }
          } else {
            const scatMsg = scatOnGrid > 0 ? ` (${scatOnGrid}/3 scatters)` : "";
            setMessage(freeBet ? `No win — free spins continue${scatMsg}` : `No win${scatMsg}`);
            if (!freeBet && reportLoss) reportLoss(useBet);
            if (!freeBet) {
              setNearMiss(null);
              const highSyms = ["seven","diamond","bell","joker"];
              for (let li = 0; li < PAYLINES.length; li++) {
                const line = PAYLINES[li];
                const syms = line.map((row, reel) => finalGrid[reel][row]);
                let baseSym = null;
                for (const s of syms) { if (s !== WILD_ID && s !== SCAT_ID) { baseSym = s; break; } }
                if (!baseSym) continue;
                let count = 0;
                for (let i = 0; i < 5; i++) { if (syms[i] === baseSym || syms[i] === WILD_ID) count++; else break; }
                if (count === 2 && highSyms.includes(baseSym)) {
                  setNearMiss(`Almost! 2× ${SLOT_LABEL_MAP[baseSym]} on line ${li+1} — one more!`);
                  break;
                }
              }
              if (scatOnGrid === 2) setNearMiss("2 scatters on the board — one more for free spins!");
            }
          }
          setPhase("resolved");
        }
      },delay);
    });
  };
  const spin = () => doSpin(null);
  const spinFree = () => doSpin(slotLastBet);
  useEffect(()=>{return()=>{
    intervals.current.forEach(i=>clearInterval(i));
      };},[]);
  const reset = () => {
    fx.clearLights();
    setPhase("betting");setWins([]);setTotalWin(0);setMessage("Spin to play — 20 paylines");
    setWinHighlight(""); setActivePayline(-1); setBigWin(null);
    if(cycleRef.current) { clearInterval(cycleRef.current); cycleRef.current = null; }
        setFreeSpins(0);setFreeSpinTotal(0);
    setBet(b=>Math.min(b,chips>0?chips:1000));
  };
  const handleKey = useCallback((key) => {
    if (phase==="betting" && (key===" "||key==="Enter") && !isFree) doSpin();
    else if (phase==="resolved" && !isFree && (key===" "||key==="Enter")) reset();
  }, [phase, isFree]);
  return (
    <GameShell bg={PURPLE_BG} title="VIDEO SLOTS" chips={chips} onBack={onBack} {...shellEffects} startChips={startChips} winStreak={winStreak} vipPoints={vipPoints} achCount={achCount} skipOverlays={skipOverlays} skipEffects={skipEffects} onRebuy={onRebuy} theme={themeMode} skinTheme={skinTheme} skinId={skinId} activePowerUps={activePowerUps} onKeyAction={handleKey} nearMiss={nearMiss} rules={<>
        <p style={{marginTop:0}}>5-reel, 3-row video slot machine with 20 paylines.</p>
        <p><span style={{color:theme.accent}}>Symbols:</span> Cherry, Lemon, Orange, Grape, Bell, Diamond, Seven, and Wild (Joker). Higher symbols pay more.</p>
        <p><span style={{color:theme.accent}}>Paylines:</span> 20 fixed lines. Wins count left-to-right starting from reel 1 only — matching symbols must begin on the leftmost reel. 3+ in a row on any payline pays.</p>
        <p><span style={{color:theme.accent}}>Wild (Joker):</span> Substitutes for any symbol except Scatter on any reel.</p>
        <p><span style={{color:theme.accent}}>Scatter (Star):</span> 3+ Scatters anywhere triggers Free Spins. 3 = 6 spins (2× bet), 4 = 8 spins (5× bet), 5 = 10 spins (15× bet). Free spins use a 2× win multiplier.</p>
        <p><span style={{color:theme.accent}}>Bet:</span> Your total bet is split across all 20 lines. Payouts are multiplied by your per-line bet (total ÷ 20).</p>
        <p style={{color:T.muted, fontSize:11}}>RTP: ~95%. Volatile — big wins are rare but large.</p>
      </>}>
      <FloatingWins wins={floatWins} />
      {bigWin && !skipOverlays && <BigWinOverlay type={bigWin.type} amount={bigWin.amount} onDone={dismissOverlay} />}
      {}
      <div style={{margin:"8px 0",padding:"6px 12px",background:"rgba(0,0,0,0.3)",borderRadius:8,border:`1px solid ${theme.accent}26`,zIndex:1,maxWidth:380,width:"92%"}}>
        <div style={{fontSize:9,letterSpacing:2,textTransform:"uppercase",color:"#6a6a80",textAlign:"center",marginBottom:3}}>
          Payouts (per line){isFree && <span style={{color:"#f1c40f"}}> · 2× FREE SPIN</span>}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1px 12px"}}>
          {SLOT_PAY_ORDER.map(sym=>{const p=SLOT_PAY[sym]; return (
            <div key={sym} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"2px 0",fontSize:9,fontFamily:T.mono,
              color:winHighlight===sym||winHighlight==="multi"?"#f1c40f":"#7a7070",fontWeight:winHighlight===sym?700:400}}>
              <span style={{textTransform:"capitalize"}}>{sym==="joker"?"Wild ★":sym}</span>
              <span>{p[0]}/{p[1]}/{p[2]}x</span>
            </div>
          );})}
        </div>
        <div style={{fontSize:8,color:"#4a4a60",textAlign:"center",marginTop:2}}>
          3/4/5 of a kind · Wild subs all · Scatter: 3+=Free Spins
        </div>
      </div>
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:10,padding:"0 12px",zIndex:1}}>
        {phase === "spinning" ? (
          <div style={{fontSize:15,fontWeight:600,textAlign:"center",minHeight:24,letterSpacing:1,animation:"fadeIn 0.3s ease",
            color:theme.accent}}>{isFree ? "Free Spin..." : "Good luck..."}</div>
        ) : phase === "resolved" && totalWin > 0 ? (
          <div style={{fontSize:15,fontWeight:600,textAlign:"center",minHeight:24,letterSpacing:1,animation:"fadeIn 0.3s ease",
            color:"#f1c40f"}}>+${totalWin.toLocaleString()} <span style={{fontSize:11,color:"#22c55e",fontWeight:400}}>= {isFree ? `+${totalWin.toLocaleString()} free` : `${(totalWin - bet) >= 0 ? "+" : ""}${(totalWin - bet).toLocaleString()} net`}</span></div>
        ) : phase === "resolved" ? (
          <div style={{fontSize:15,fontWeight:600,textAlign:"center",minHeight:24,letterSpacing:1,animation:"fadeIn 0.3s ease",
            color:"#e74c3c"}}>No win</div>
        ) : (
          <div style={{minHeight:24}} />
        )}
        <EdgeLights mode={lightMode} color="#a855f7" />
        {}
        {(() => {
          const activeWin = activePayline >= 0 ? wins.find(w => w.line === activePayline) : null;
          const winRowsByReel = Array.from({length:REELS}, ()=> new Set());
          if(activePayline >= 0 && activeWin) {
            const line = PAYLINES[activePayline];
            line.forEach((row, reel) => { if(reel < activeWin.count) winRowsByReel[reel].add(row); });
          }
          const isMobileSG = typeof window !== "undefined" && window.innerWidth < 480;
          const isNarrowSG = typeof window !== "undefined" && window.innerWidth < 380;
          const reelW = isNarrowSG ? 50 : isMobileSG ? 58 : 82, cellH = isNarrowSG ? 50 : isMobileSG ? 58 : 82, gap = 6;
          const gridW = REELS * reelW + (REELS-1) * gap;
          const gridH = 3 * cellH;
          return (
        <div style={{background:"linear-gradient(180deg, #1a0e18, #0e0610)",borderRadius:16,padding:"16px 14px",
          border: isFree ? "3px solid rgba(241,196,15,0.5)" : "3px solid rgba(42,26,62,0.8)",
          boxShadow: isFree
            ? "0 0 40px rgba(241,196,15,0.25), 0 0 80px rgba(241,196,15,0.1), inset 0 0 30px rgba(241,196,15,0.05)"
            : totalWin > 0
            ? "0 0 40px rgba(241,196,15,0.3), inset 0 0 30px rgba(0,0,0,0.5)"
            : `0 0 40px ${theme.accent}26, inset 0 0 30px rgba(0,0,0,0.5)`,
          position:"relative", transition:"box-shadow 0.5s, border-color 0.5s",
          width: gridW + 28, maxWidth:"95vw"}}>
          <div style={{display:"flex",gap:6,width:gridW,minWidth:gridW,flexShrink:0}}>
            {Array.from({length:REELS},(_, r)=>(
              <SlotReel5 key={r} symbols={displayReels[r]} spinning={spinning[r]}
                winRows={[...winRowsByReel[r]]} justStopped={reelJustStopped[r]}/>
            ))}
          </div>
          {}
          {activePayline >= 0 && activeWin && !spinning.some(Boolean) && (
            <svg style={{position:"absolute",top:16,left:14,width:gridW,height:gridH,pointerEvents:"none",overflow:"visible"}}
              viewBox={`0 0 ${gridW} ${gridH}`}>
              {(() => {
                const line = PAYLINES[activePayline];
                const pts = line.slice(0, activeWin.count).map((row, reel) => ({
                  x: reel * (reelW + gap) + reelW / 2,
                  y: row * cellH + cellH / 2,
                }));
                if(pts.length < 2) return null;
                let d = `M ${pts[0].x} ${pts[0].y}`;
                for(let i = 1; i < pts.length; i++) {
                  const prev = pts[i-1];
                  const curr = pts[i];
                  const cpx = (prev.x + curr.x) / 2;
                  d += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`;
                }
                const circles = pts.map((p, i) => (
                  <ellipse key={i} cx={p.x} cy={p.y} rx={28} ry={28}
                    fill="none" stroke="rgba(241,196,15,0.5)" strokeWidth="2.5"
                    style={{animation:"pulse 1.2s ease-in-out infinite"}} />
                ));
                return (
                  <g>
                    {}
                    <path d={d} fill="none" stroke="rgba(241,196,15,0.2)" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
                    {}
                    <path d={d} fill="none" stroke="rgba(241,196,15,0.7)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                    {circles}
                  </g>
                );
              })()}
            </svg>
          )}
          {}
          {wins.length > 0 && phase === "resolved" && !spinning.some(Boolean) && (() => {
            const items = wins.map((w, i) => {
              const label = `${w.count}× ${SLOT_LABEL_MAP[w.sym] || "Scatter"}${w.line >= 0 ? ` L${w.line+1}` : ""} +$${w.payout}`;
              return label;
            });
            const summary = items.length <= 3
              ? items.join("  ·  ")
              : items.join("  ·  ") + "  ·  ";
            const needsScroll = items.length > 3;
            return (
              <div style={{
                marginTop:10, overflow:"hidden", borderRadius:6, height:28,
                background:"rgba(241,196,15,0.08)",
                border:"1px solid rgba(241,196,15,0.15)",
                display:"flex", alignItems:"center", position:"relative",
              }}>
                <div style={{
                  whiteSpace:"nowrap", fontFamily:T.mono, fontSize:10, color:"#f1c40f",
                  paddingLeft: needsScroll ? "100%" : 0,
                  textAlign: needsScroll ? undefined : "center",
                  width: needsScroll ? undefined : "100%",
                  animation: needsScroll ? `slotTicker ${Math.max(8, items.length * 2.5)}s linear infinite` : "none",
                }}>
                  {needsScroll ? summary + summary : summary}
                </div>
                {needsScroll && <style>{`@keyframes slotTicker { 0% { transform:translateX(0); } 100% { transform:translateX(-50%); } }`}</style>}
              </div>
            );
          })()}
        </div>
          );
        })()}
      </div>
      <div style={{padding:"16px",width:"100%",maxWidth:560,zIndex:1}}>
        {phase==="betting"&&<div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:14}}>
          <BetControls bet={bet} setBet={setBet} chips={chips} presets={[20,40,100,200,500]}/>
          <GoldButton onClick={spin} disabled={actualBet>chips||bet<1} hint="⏎ spin">Spin</GoldButton>
        </div>}
        {phase==="spinning"&&<div style={{minHeight:30}}/>}
        {phase==="resolved"&&<div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
          {freeSpins > 0 ? (
            <>
              <div style={{fontSize:12,color:"#f1c40f",letterSpacing:1,fontWeight:600}}>
                {freeSpins} Free Spin{freeSpins!==1?"s":""} Remaining · 2× Multiplier
              </div>
              <GoldButton onClick={spinFree} hint="⏎ spin">Free Spin!</GoldButton>
            </>
          ) : (
            <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
              <GoldButton onClick={reset} small>Change Bet</GoldButton>
              {bet <= chips && bet >= 1 && (
                <GoldButton onClick={() => { reset(); setTimeout(spin, 50); }}>Rebet ${bet}</GoldButton>
              )}
            </div>
          )}
        </div>}
      </div>
      <div style={{padding:"8px",fontSize:10,color:"#3a2050",letterSpacing:2,textTransform:"uppercase",zIndex:1}}>5×3 · 20 Lines · Wild + Scatter</div>
      {}
      <button onClick={() => setShowPaylines(true)} style={{
        background:"none", border:"1px solid rgba(168,85,247,0.3)", borderRadius:8, padding:"6px 16px",
        color:"#a855f7", fontSize:11, fontFamily:T.mono, cursor:"pointer", letterSpacing:1,
        transition:"all 0.2s", marginBottom:8, zIndex:1,
      }}
        onMouseEnter={e => { e.currentTarget.style.borderColor="rgba(168,85,247,0.6)"; e.currentTarget.style.background="rgba(168,85,247,0.08)"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor="rgba(168,85,247,0.3)"; e.currentTarget.style.background="none"; }}>
        View All 20 Paylines
      </button>
      {}
      {showPaylines && (
        <div style={{position:"fixed",inset:0,zIndex:20000,display:"flex",alignItems:"center",justifyContent:"center",
          background:"rgba(0,0,0,0.8)",backdropFilter:"blur(6px)",animation:"fadeIn 0.2s ease"}}
          onClick={e => { if(e.target===e.currentTarget) setShowPaylines(false); }}>
          <div style={{background:"linear-gradient(180deg,#1e1e34,#15152a)",border:`1px solid ${theme.accent}33`,
            borderRadius:T.radiusLg,padding:"20px 16px",maxWidth:420,width:"94%",maxHeight:"85vh",
            boxShadow:"0 24px 64px rgba(0,0,0,0.6)",animation:"fadeInScale 0.2s ease",
            display:"flex",flexDirection:"column"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,flexShrink:0}}>
              <div style={{fontSize:14,fontWeight:700,letterSpacing:2,color:theme.accent,textTransform:"uppercase",fontFamily:T.serif}}>
                Payline Guide
              </div>
              <button onClick={() => setShowPaylines(false)} style={{
                background:"none",border:"none",color:T.muted,fontSize:20,cursor:"pointer",padding:"0 4px",lineHeight:1,
              }}
                onMouseEnter={e=>e.currentTarget.style.color=T.text}
                onMouseLeave={e=>e.currentTarget.style.color=T.muted}>×</button>
            </div>
            <div style={{fontSize:10,color:T.textMuted,marginBottom:12,fontFamily:T.mono,lineHeight:1.5,flexShrink:0}}>
              Wins count left→right from reel 1. 3+ matching symbols on a line pays.
              Wilds (Joker) substitute for any symbol except Scatter.
            </div>
            <div style={{overflowY:"auto",flex:1,display:"flex",flexDirection:"column",gap:6,paddingRight:4}}>
              {PAYLINES.map((line, li) => {
                const names = [
                  "Straight Middle","Straight Top","Straight Bottom","V Shape","Inverted V",
                  "Diagonal Down","Diagonal Up","U Top","U Bottom","Mild V",
                  "Mild Inverted V","Zigzag High","Zigzag Low","W Top","W Bottom",
                  "Bump Top","Bump Bottom","Big Zigzag","Big Zigzag Inv","Diamond"
                ];
                const cw = 14, ch = 14, gapX = 1;
                const gridW = 5*cw + 4*gapX;
                const gridH = 3*ch;
                const renderMiniGrid = (matchCount) => (
                  <svg width={gridW} height={gridH} viewBox={`0 0 ${gridW} ${gridH}`} style={{flexShrink:0}}>
                    {Array.from({length:5},(_, r) =>
                      Array.from({length:3},(_, row) => {
                        const x = r*(cw+gapX), y = row*ch;
                        const isActive = line[r] === row && r < matchCount;
                        const isDim = line[r] === row && r >= matchCount;
                        return <rect key={`${r}-${row}`} x={x} y={y} width={cw} height={ch} rx={2}
                          fill={isActive ? "rgba(241,196,15,0.35)" : "rgba(255,255,255,0.03)"}
                          stroke={isActive ? "rgba(241,196,15,0.7)" : isDim ? "rgba(241,196,15,0.15)" : "rgba(255,255,255,0.04)"}
                          strokeWidth={isActive?1.2:0.5} strokeDasharray={isDim?"2 2":"none"}/>;
                      })
                    )}
                    {(() => {
                      const pts = line.slice(0, matchCount).map((row, reel) => ({
                        x: reel*(cw+gapX) + cw/2, y: row*ch + ch/2,
                      }));
                      if(pts.length<2) return null;
                      let d = `M ${pts[0].x} ${pts[0].y}`;
                      for(let i=1;i<pts.length;i++){
                        const prev=pts[i-1], curr=pts[i], cpx=(prev.x+curr.x)/2;
                        d += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`;
                      }
                      return <>
                        <path d={d} fill="none" stroke="rgba(241,196,15,0.15)" strokeWidth="5" strokeLinecap="round"/>
                        <path d={d} fill="none" stroke="rgba(241,196,15,0.8)" strokeWidth="1.5" strokeLinecap="round"/>
                      </>;
                    })()}
                    {line.slice(0, matchCount).map((row, reel) => (
                      <circle key={reel} cx={reel*(cw+gapX)+cw/2} cy={row*ch+ch/2} r={2.5} fill="#f1c40f" opacity={0.9}/>
                    ))}
                  </svg>
                );
                return (
                  <div key={li} style={{padding:"8px 10px",background:"rgba(0,0,0,0.25)",borderRadius:8,
                    border:`1px solid ${theme.accent}14`,flexShrink:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                      <span style={{fontSize:11,fontFamily:T.mono,color:theme.accent,fontWeight:700}}>L{li+1}</span>
                      <span style={{fontSize:10,fontFamily:T.mono,color:T.textMuted}}>{names[li]}</span>
                      <span style={{fontSize:9,fontFamily:T.mono,color:"#4a4060",marginLeft:"auto"}}>
                        {line.map(r=>r===0?"T":r===1?"M":"B").join("·")}
                      </span>
                    </div>
                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                      {[3,4,5].map(n => (
                        <div key={n} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                          {renderMiniGrid(n)}
                          <span style={{fontSize:8,fontFamily:T.mono,color:"#6a6080"}}>{n}×</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </GameShell>
  );
}
