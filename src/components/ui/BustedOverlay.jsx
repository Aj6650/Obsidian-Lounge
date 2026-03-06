import React, { useState, useEffect, useRef } from 'react';
import { T } from '../../constants/styles.js';

export function BustedOverlay({ peakBalance, onRebuy, rebuys, rebuyAmount = 1000, vaultBalance = 0, onWithdrawFromVault, totalDebt = 0, rebuyCount = 0 }) {
  const [phase, setPhase] = useState(0);
  const [drainDisplay, setDrainDisplay] = useState(peakBalance);
  const [tagline] = useState(() => BUSTED_TAGLINES[Math.floor(Math.random() * BUSTED_TAGLINES.length)]);
  const parts = useRef(null);
  if (!parts.current) {
    const r = () => Math.random();
    parts.current = {
      rain: Array.from({length:60}, () => ({x:r()*100,w:1.5+r()*2,h:10+r()*18,d:0.8+r()*1.5,dl:r()*2,o:0.15+r()*0.25})),
      cracks: Array.from({length:18}, (_, i) => {
        const angle = (i/18)*Math.PI*2 + (r()-0.5)*0.5;
        const len = 60+r()*220;
        const segCount = 3+Math.floor(r()*5);
        const segs = Array.from({length:segCount}, (_, j) => {
          const frac = (j+1)/segCount;
          return { x:Math.cos(angle)*len*frac + (r()-0.5)*35, y:Math.sin(angle)*len*frac + (r()-0.5)*35 };
        });
        const branchAngle = angle + (r()-0.5)*1.2;
        const branchLen = 30+r()*80;
        const lastSeg = segs[segs.length-1];
        const branch = Array.from({length:2+Math.floor(r()*3)}, (_, j) => {
          const frac = (j+1)/(2+Math.floor(r()*3));
          return { x:lastSeg.x+Math.cos(branchAngle)*branchLen*frac+(r()-0.5)*15, y:lastSeg.y+Math.sin(branchAngle)*branchLen*frac+(r()-0.5)*15 };
        });
        return { segs, branch, w:0.8+r()*2.2 };
      }),
    };
  }
  const pp = parts.current;
  useEffect(() => {
    const t = [];
    t.push(setTimeout(() => setPhase(1), 800));
    t.push(setTimeout(() => setPhase(2), 1400));
    t.push(setTimeout(() => setPhase(3), 2800));
    t.push(setTimeout(() => setPhase(4), 4600));
    return () => t.forEach(clearTimeout);
  }, []);
  const drainedRef = useRef(false);
  useEffect(() => {
    if (phase !== 3 || peakBalance <= 0 || drainedRef.current) return;
    drainedRef.current = true;
    const steps = 50;
    let step = 0;
    const iv = setInterval(() => {
      step++;
      const t = step / steps;
      const eased = t * t;
      setDrainDisplay(Math.max(0, Math.round(peakBalance * (1 - eased))));
      if (step >= steps) { clearInterval(iv); setDrainDisplay(0); }
    }, 30);
    return () => clearInterval(iv);
  }, [phase, peakBalance]);
  const label = "BUSTED";
  return (
    <div style={{
      position:"fixed",top:0,left:0,right:0,bottom:0,zIndex:10010,
      display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
      background:"rgba(0,0,0,1)",
      overflow:"hidden",
      animation: phase >= 1 ? "bustedShake 0.8s ease-out" : "none",
    }}>
      {}
      {phase === 0 && (
        <div style={{
          position:"absolute",top:0,left:0,right:0,bottom:0,
          background:"radial-gradient(ellipse at center, rgba(50,20,20,0.6), rgba(0,0,0,0.95))",
          animation:"flickerDie 0.8s ease-out forwards",
        }} />
      )}
      {}
      {phase >= 1 && (
        <svg style={{
          position:"absolute",top:0,left:0,width:"100%",height:"100%",
          pointerEvents:"none",zIndex:1,
          animation:"crackSpread 0.6s ease-out forwards",
        }} viewBox="0 0 100 100" preserveAspectRatio="none">
          {pp.cracks.map((crack, ci) => (
            <g key={ci}>
              {}
              <polyline
                points={`50,50 ${crack.segs.map(s => `${50+s.x/4},${50+s.y/4}`).join(" ")}`}
                fill="none"
                stroke={`rgba(${180+ci*4},${30+ci*3},${30+ci*3},${0.4+ci*0.02})`}
                strokeWidth={crack.w * 0.15}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {}
              {crack.branch && crack.branch.length > 0 && (
                <polyline
                  points={`${50+crack.segs[crack.segs.length-1].x/4},${50+crack.segs[crack.segs.length-1].y/4} ${crack.branch.map(s => `${50+s.x/4},${50+s.y/4}`).join(" ")}`}
                  fill="none"
                  stroke={`rgba(${150+ci*3},${25+ci*2},${25+ci*2},${0.3+ci*0.01})`}
                  strokeWidth={crack.w * 0.1}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </g>
          ))}
        </svg>
      )}
      {}
      {phase >= 1 && pp.rain.map((r, i) => (
        <div key={`rain${i}`} style={{
          position:"absolute",left:`${r.x}%`,top:-20,
          width:r.w,height:r.h,
          borderRadius:1,
          background:"linear-gradient(180deg, rgba(120,120,130,0.4), rgba(80,80,90,0.1))",
          animation:`greyRainFall ${r.d}s linear ${r.dl}s infinite`,
          opacity:r.o,
        }} />
      ))}
      {}
      {phase >= 1 && (
        <div style={{
          position:"absolute",top:0,left:0,right:0,bottom:0,pointerEvents:"none",
          background:"radial-gradient(ellipse at center, transparent 20%, rgba(80,10,10,0.5) 70%, rgba(40,0,0,0.7) 100%)",
          animation:"redVignetteBreath 2.5s ease-in-out infinite",
        }} />
      )}
      {}
      {phase >= 2 && (
        <div style={{position:"relative",zIndex:3,display:"flex",gap:6}}>
          {label.split("").map((char, i) => (
            <span key={i} style={{
              fontSize:72, fontWeight:900, fontFamily:T.serif,
              color:"transparent",
              background:"linear-gradient(180deg, #ef4444, #991b1b, #450a0a, #991b1b, #ef4444)",
              backgroundSize:"200% auto",
              WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
              display:"inline-block",
              animation:`bustedLetterSlam 0.8s ease-out ${i*0.12}s both, bustedPulse 2s ease-in-out ${1+i*0.12}s infinite`,
              filter:"drop-shadow(0 0 20px rgba(239,68,68,0.4))",
            }}>{char}</span>
          ))}
        </div>
      )}
      {}
      {phase >= 3 && (
        <div style={{
          marginTop:20,position:"relative",zIndex:3,textAlign:"center",
          animation:"slideUp 0.5s ease-out",
        }}>
          <div style={{ fontSize:11, fontFamily:T.mono, color:"rgba(255,255,255,0.35)",
            letterSpacing:3, textTransform:"uppercase", marginBottom:6 }}>
            {drainDisplay > 0 ? "BALANCE DRAINING..." : "BALANCE"}
          </div>
          <div style={{
            fontSize:drainDisplay > 0 ? 38 : 44, fontWeight:900, fontFamily:T.mono,
            color: drainDisplay > 0 ? "#ef4444" : "#666",
            textShadow: drainDisplay > 0 ? "0 0 30px rgba(239,68,68,0.5)" : "none",
            transition:"font-size 0.3s, color 0.3s",
          }}>
            ${drainDisplay.toLocaleString()}
          </div>
        </div>
      )}
      {}
      {phase >= 4 && (
        <div style={{
          marginTop:28,position:"relative",zIndex:3,textAlign:"center",
          animation:"slideUp 0.6s ease-out",
        }}>
          <div style={{
            fontSize:13, fontFamily:T.serif, fontStyle:"italic",
            color:"rgba(255,255,255,0.4)", letterSpacing:1,
            maxWidth:300, lineHeight:1.5, marginBottom:24,
          }}>
            "{tagline}"
          </div>
          {vaultBalance > 0 && (
            <div style={{ marginBottom:10, padding:"8px 14px", borderRadius:8,
              background:"rgba(212,175,55,0.08)", border:"1px solid rgba(212,175,55,0.25)",
              fontSize:9, fontFamily:T.mono, color:"rgba(212,175,55,0.6)", letterSpacing:1, textAlign:"center" }}>
              VAULT PENALTY APPLIED — 35% BURNED
            </div>
          )}
          <button onClick={onRebuy} style={{
            padding:"14px 40px", fontSize:15, fontWeight:900, fontFamily:T.serif,
            background:"linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.05))",
            border:"2px solid rgba(239,68,68,0.4)",
            borderRadius:14, color:"#ef4444", letterSpacing:3,
            cursor:"pointer", transition:"all 0.2s",
            boxShadow:"0 0 20px rgba(239,68,68,0.15)",
            textTransform:"uppercase",
          }}
          onMouseEnter={e => { e.target.style.background="linear-gradient(135deg, rgba(239,68,68,0.25), rgba(239,68,68,0.1))"; e.target.style.boxShadow="0 0 30px rgba(239,68,68,0.3)"; }}
          onMouseLeave={e => { e.target.style.background="linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.05))"; e.target.style.boxShadow="0 0 20px rgba(239,68,68,0.15)"; }}
          >
            Rebuy ${rebuyAmount.toLocaleString()}
          </button>
          <div style={{ fontSize:9, fontFamily:T.mono, color:"rgba(255,255,255,0.2)",
            marginTop:8, letterSpacing:2 }}>
            REBUY #{rebuys + 1}{totalDebt > 0 ? ` · $${totalDebt.toLocaleString()} DEBT` : ""}
          </div>
          {vaultBalance > 0 && onWithdrawFromVault && (
            <div style={{ marginTop:16, textAlign:"center" }}>
              <div style={{ fontSize:9, fontFamily:T.mono, color:"rgba(255,255,255,0.2)", letterSpacing:2, marginBottom:10 }}>— OR —</div>
              <button onClick={onWithdrawFromVault} style={{
                padding:"12px 32px", fontSize:13, fontWeight:700, fontFamily:T.serif,
                background:"linear-gradient(135deg, rgba(212,175,55,0.15), rgba(212,175,55,0.05))",
                border:"2px solid rgba(212,175,55,0.35)",
                borderRadius:14, color:"#d4af37", letterSpacing:2,
                cursor:"pointer", transition:"all 0.2s", textTransform:"uppercase",
              }}
              onMouseEnter={e => { e.target.style.background="linear-gradient(135deg, rgba(212,175,55,0.25), rgba(212,175,55,0.1))"; }}
              onMouseLeave={e => { e.target.style.background="linear-gradient(135deg, rgba(212,175,55,0.15), rgba(212,175,55,0.05))"; }}>
                Withdraw Vault ${vaultBalance.toLocaleString()}
              </button>
              <div style={{ fontSize:8, fontFamily:T.mono, color:"rgba(255,255,255,0.15)", marginTop:6, letterSpacing:1 }}>
                NO FEE ON BUST WITHDRAWAL
              </div>
            </div>
          )}
        </div>
      )}
      {}
      {phase >= 2 && (
        <div style={{
          position:"absolute",bottom:30,
          fontSize:10,fontFamily:T.mono,color:"rgba(255,255,255,0.12)",
          letterSpacing:4,zIndex:3,
          animation:"slideUp 0.5s ease-out 1.5s both",
        }}>
          ×
        </div>
      )}
    </div>
  );
}
