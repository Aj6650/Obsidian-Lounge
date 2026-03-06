import React, { useState, useEffect, useRef } from 'react';
import { theme } from '../../theme-globals.js';
import { T } from '../../constants/styles.js';

export function BigWinOverlay({ type, amount, onDone }) {
  const [phase, setPhase] = useState(0);
  const [dismissing, setDismissing] = useState(false);
  const [canDismiss, setCanDismiss] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [countDisplay, setCountDisplay] = useState(0);
  const particles = useRef(null);
  if (!particles.current) {
    const rand = () => Math.random();
    const isMobileBW = typeof window !== "undefined" && window.innerWidth < 480;
    const scale = isMobileBW ? 0.5 : 1;
    particles.current = {
      bokeh: Array.from({length:Math.round(18*scale)}, () => ({x:10+rand()*80,y:10+rand()*80,s:8+rand()*22,d:4+rand()*5,dl:rand()*2})),
      confetti: Array.from({length:Math.round(70*scale)}, () => ({x:rand()*100,w:4+rand()*8,h:4+rand()*8,round:rand()>0.5,c:Math.floor(rand()*8),d:1.2+rand()*2,dl:rand()*0.8})),
      fire: Array.from({length:Math.round(24*scale)}, () => ({x:8+rand()*84,w:3+rand()*8,h:8+rand()*18,even:rand()>0.5,d:1.5+rand()*2.5,dl:rand()*1.5})),
      orbit: Array.from({length:Math.round(18*scale)}, (_, i) => ({angle:(i/18)*Math.PI*2,s:3+(i%4)*1.5,even:i%2===0})),
      shatter: Array.from({length:Math.round(28*scale)}, (_, i) => {const a=(i/28)*Math.PI*2;return{a,dist:200+rand()*350,tx:Math.cos(a)*(200+rand()*350),ty:Math.sin(a)*(200+rand()*350),w:25+rand()*55,h:18+rand()*38,rot:rand()*720-360,c:i%3,dl:i*0.015};}),
      chips: Array.from({length:Math.round(14*scale)}, () => ({x:35+rand()*30,drift:-30+rand()*60,drift2:-60+rand()*120,rise:-180-rand()*220,rot:rand()*540,s:8+rand()*14,d:1+rand()*1.5,dl:rand()*0.8})),
    };
  }
  const p = particles.current;
  const isEpic = type === "epic";
  const isMega = type === "mega" || isEpic;
  const label = isEpic ? "EPIC WIN" : type === "mega" ? "MEGA WIN" : "BIG WIN";
  const blackoutMs = isEpic ? 900 : isMega ? 650 : 350;
  const shockMs = isMega ? blackoutMs + (isEpic ? 350 : 280) : 0;
  const contentMs = isMega ? shockMs + 400 : blackoutMs + 300;
  const countMs = contentMs + (isEpic ? 1000 : isMega ? 700 : 500);
  const dismissMs = contentMs + (isEpic ? 900 : isMega ? 600 : 400);
  const hintMs = isEpic ? 4000 : isMega ? 3200 : 2500;
  useEffect(() => {
    const t = [];
    if (isMega) t.push(setTimeout(() => setPhase(1), blackoutMs));
    t.push(setTimeout(() => setPhase(2), contentMs));
    t.push(setTimeout(() => setPhase(3), countMs));
    t.push(setTimeout(() => setCanDismiss(true), dismissMs));
    t.push(setTimeout(() => setShowHint(true), hintMs));
    return () => t.forEach(clearTimeout);
  }, []);
  useEffect(() => {
    if (phase < 3) return;
    const steps = isEpic ? 50 : isMega ? 40 : 30;
    const ms = isEpic ? 50 : isMega ? 40 : 35;
    let step = 0;
    const iv = setInterval(() => {
      step++;
      const t = step / steps;
      setCountDisplay(Math.round(amount * (1 - Math.pow(1-t,3))));
      if (step >= steps) { clearInterval(iv); setCountDisplay(amount); }
    }, ms);
    return () => clearInterval(iv);
  }, [phase, amount, type]);
  const handleDismiss = () => {
    if (!canDismiss) return;
    if (type === "big") { onDone(); return; }
    setDismissing(true);
    setTimeout(onDone, isEpic ? 550 : 380);
  };
  const confettiColors = ["#f1c40f","#e74c3c","#3b82f6","#22c55e","#ec4899","#a855f7","#ffd700","#ff4500"];
  if (dismissing && isEpic) {
    return (
      <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,zIndex:10000,pointerEvents:"none",overflow:"hidden"}}>
        {}
        <div style={{position:"absolute",top:"50%",left:"50%",width:400,height:400,borderRadius:"50%",
          animation:"goldenExplosion 0.55s ease-out forwards"}} />
        {p.shatter.map((s, i) => (
          <div key={i} style={{
            position:"absolute",top:"50%",left:"50%",
            width:s.w,height:s.h,
            background:s.c===0?"rgba(255,69,0,0.85)":s.c===1?"rgba(255,215,0,0.85)":"rgba(255,107,53,0.85)",
            borderRadius:3,boxShadow:`0 0 12px ${s.c===0?"rgba(255,69,0,0.5)":"rgba(255,215,0,0.5)"}`,
            animation:`shatterFly 0.55s ease-out ${s.dl}s forwards`,
            "--tx":`${s.tx}px`,"--ty":`${s.ty}px`,"--rot":`${s.rot}deg`,
          }} />
        ))}
      </div>
    );
  }
  if (dismissing && type === "mega") {
    return (
      <div style={{
        position:"fixed",top:0,left:0,right:0,bottom:0,zIndex:10000,
        display:"flex",alignItems:"center",justifyContent:"center",
        animation:"zoomFadeOut 0.38s ease-in forwards",pointerEvents:"none",
        background:"rgba(0,0,0,0.85)",
      }}>
        <div style={{fontSize:52,fontWeight:900,fontFamily:T.serif,
          background:"linear-gradient(90deg,#ff6b6b,#f1c40f,#22c55e,#3b82f6,#f1c40f,#ff6b6b)",
          backgroundSize:"200% auto",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
        }}>MEGA WIN</div>
      </div>
    );
  }
  return (
    <div onClick={handleDismiss} style={{
      position:"fixed",top:0,left:0,right:0,bottom:0,zIndex:10000,
      display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
      background: phase === 0 ? "rgba(0,0,0,1)" : isEpic ? "rgba(0,0,0,0.95)" : isMega ? "rgba(0,0,0,0.92)" : "rgba(0,0,0,0.85)",
      cursor:canDismiss?"pointer":"default",
      overflow:"hidden",
    }}>
      {}
      {phase >= 2 && (isEpic || isMega) && (
        <div style={{ position:"absolute", inset:0, pointerEvents:"none", zIndex:0,
          animation: isEpic ? "epicEntranceShake 0.7s ease-out" : "epicEntranceShake 0.5s ease-out" }} />
      )}
      {}
      {phase >= 1 && isMega && Array.from({length: isEpic ? 2 : 1}, (_, i) => (
        <div key={`sw${i}`} style={{
          position:"absolute",top:"50%",left:"50%",
          width:isEpic?550:420,height:isEpic?550:420,borderRadius:"50%",
          border:`${isEpic?3:2}px solid ${isEpic?"rgba(255,69,0,0.6)":"rgba(241,196,15,0.5)"}`,
          boxShadow:`0 0 40px ${isEpic?"rgba(255,69,0,0.3)":"rgba(241,196,15,0.25)"},inset 0 0 20px ${isEpic?"rgba(255,69,0,0.15)":"rgba(241,196,15,0.1)"}`,
          animation:`shockwaveRing 0.7s ease-out ${i*0.18}s forwards`,
          transform:"translate(-50%,-50%) scale(0)",
        }} />
      ))}
      {}
      {phase >= 2 && isMega && Array.from({length: isEpic ? 3 : 2}, (_, i) => (
        <div key={`beam${i}`} style={{
          position:"absolute",top:"50%",left:"50%",
          width:700,height:700,
          background:`conic-gradient(from ${i*(isEpic?120:180)}deg, transparent 0deg, ${
            isEpic ? "rgba(255,69,0,0.07)" : "rgba(241,196,15,0.05)"
          } 4deg, transparent 8deg)`,
          borderRadius:"50%",
          animation:`spin ${7-i*1.5}s linear infinite`,
          transform:"translate(-50%,-50%)",
        }} />
      ))}
      {}
      {type === "big" && phase >= 2 && p.bokeh.map((b, i) => (
        <div key={`bk${i}`} style={{
          position:"absolute",left:`${b.x}%`,top:`${b.y}%`,
          width:b.s,height:b.s,borderRadius:"50%",
          background:`radial-gradient(circle, ${theme.accent}5a, ${theme.accent}0d)`,
          animation:`bokehDrift ${b.d}s ease-in-out ${b.dl}s infinite`,
        }} />
      ))}
      {}
      {phase >= 2 && (
        <div style={{
          position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",
          width:isEpic?650:isMega?520:400, height:isEpic?650:isMega?520:400,
          background: isEpic
            ? "conic-gradient(from 0deg, transparent 0deg, rgba(255,69,0,0.14) 8deg, transparent 16deg, rgba(255,215,0,0.1) 24deg, transparent 32deg)"
            : isMega
            ? "conic-gradient(from 0deg, transparent 0deg, rgba(59,130,246,0.08) 10deg, transparent 20deg, rgba(241,196,15,0.08) 30deg, transparent 40deg)"
            : `conic-gradient(from 0deg, transparent 0deg, ${theme.accent}10 18deg, transparent 36deg)`,
          borderRadius:"50%",
          animation:`spin ${isEpic?4:isMega?6:12}s linear infinite`,
        }} />
      )}
      {}
      {isMega && phase >= 2 && (
        <div style={{
          position:"absolute",top:0,left:0,right:0,bottom:0,pointerEvents:"none",
          background:`radial-gradient(ellipse at center, transparent ${isEpic?"25%":"35%"}, rgba(0,0,0,${isEpic?0.7:0.5}) 100%)`,
          animation:`vignetteBreath ${isEpic?1.8:2.5}s ease-in-out infinite`,
        }} />
      )}
      {}
      {isEpic && phase >= 2 && p.fire.map((f, i) => (
        <div key={`fr${i}`} style={{
          position:"absolute",left:`${f.x}%`,bottom:-20,
          width:f.w,height:f.h,
          borderRadius:"50% 50% 50% 50% / 60% 60% 40% 40%",
          background:`radial-gradient(circle, ${f.even?"#ffd700":"#ff4500"}, transparent)`,
          animation:`fireRise ${f.d}s ease-out ${f.dl}s infinite`,
          opacity:0.6,
        }} />
      ))}
      {}
      {isEpic && phase >= 2 && p.chips.map((c, i) => (
        <div key={`cf${i}`} style={{
          position:"absolute",left:`${c.x}%`,bottom:-10,
          width:c.s,height:c.s,borderRadius:"50%",
          background:"radial-gradient(circle at 35% 35%, #ffd700, #b8860b)",
          border:"1px solid rgba(255,215,0,0.5)",
          boxShadow:"0 0 6px rgba(255,215,0,0.4)",
          animation:`chipFountain ${c.d}s ease-out ${c.dl}s infinite`,
          "--drift":`${c.drift}px`,"--drift2":`${c.drift2}px`,
          "--rise":`${c.rise}px`,"--rot":`${c.rot}deg`,
        }} />
      ))}
      {}
      {isEpic && phase >= 2 && (
        <div style={{
          position:"absolute",top:"50%",left:"50%",width:380,height:200,
          transform:"translate(-50%,-50%)",
          animation:"spin 5s linear infinite",
          zIndex:2,
        }}>
          {p.orbit.map((o, i) => (
            <div key={i} style={{
              position:"absolute",
              left:`${50+48*Math.cos(o.angle)}%`,top:`${50+48*Math.sin(o.angle)}%`,
              width:o.s,height:o.s,borderRadius:"50%",
              transform:"translate(-50%,-50%)",
              background:o.even?"#ff4500":"#ffd700",
              boxShadow:`0 0 10px ${o.even?"rgba(255,69,0,0.7)":"rgba(255,215,0,0.7)"}`,
            }} />
          ))}
        </div>
      )}
      {}
      {phase >= 2 && p.confetti.slice(0, isEpic?60:isMega?40:20).map((c, i) => (
        <div key={`cf${i}`} style={{
          position:"absolute",left:`${c.x}%`,top:-10,
          width:c.w,height:c.h,borderRadius:c.round?"50%":"2px",
          background:confettiColors[c.c],
          animation:`confettiFall ${c.d}s linear ${c.dl}s forwards`,
          opacity:0.9,
        }} />
      ))}
      {}
      {isMega && phase >= 2 && Array.from({length:isEpic?14:8}, (_, i) => (
        <div key={`st${i}`} style={{
          position:"absolute",
          left:`${50+28*Math.cos(i*Math.PI*2/(isEpic?14:8))}%`,
          top:`${45+28*Math.sin(i*Math.PI*2/(isEpic?14:8))}%`,
          width:isEpic?7:5,height:isEpic?7:5,borderRadius:"50%",
          background:isEpic?"#ff4500":"#f1c40f",
          boxShadow:`0 0 14px ${isEpic?"#ff4500":"#f1c40f"}`,
          animation:`starBurst 1.2s ease-out ${0.08*i}s forwards`,
        }} />
      ))}
      {}
      {phase >= 2 && (
        <div style={{position:"relative",zIndex:2,display:"flex",gap:3,flexWrap:"wrap",justifyContent:"center"}}>
          {label.split("").map((char, i) => (
            <span key={i} style={{
              fontSize:isEpic?62:isMega?54:42, fontWeight:900, fontFamily:T.serif,
              background: isEpic
                ? "linear-gradient(180deg, #ff4500, #ff6b35, #ffd700, #fff, #ffd700, #ff6b35, #ff4500)"
                : isMega
                ? "linear-gradient(90deg, #ff6b6b, #f1c40f, #22c55e, #3b82f6, #f1c40f, #ff6b6b)"
                : `linear-gradient(90deg, ${theme.accent}, ${theme.accent}cc, #fff, ${theme.accent}cc, ${theme.accent})`,
              backgroundSize:"200% auto",
              WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
              display:"inline-block",
              animation: `letterDrop ${isEpic?0.7:isMega?0.7:0.6}s ease-out ${i*(isEpic?0.09:isMega?0.09:0.07)}s both, shimmer ${isEpic?0.8:isMega?1.2:2}s linear ${0.8+i*0.09}s infinite`,
              textShadow:"none",
            }}>{char === " " ? "\u00A0" : char}</span>
          ))}
        </div>
      )}
      {}
      {type === "big" && phase >= 2 && (
        <div style={{
          position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",
          width:220,height:220,borderRadius:"50%",
          border:`2px solid ${theme.accent}35`,
          boxShadow:`0 0 40px ${theme.accent}25, inset 0 0 30px ${theme.accent}14`,
          animation:"glowBreath 2s ease-in-out infinite",
        }} />
      )}
      {}
      {phase >= 3 && (
        <div style={{
          fontSize:isEpic?46:isMega?38:28, fontWeight:800, marginTop:14,
          fontFamily:T.mono, position:"relative", zIndex:2,
          color: isEpic?"#ff6b35":isMega?"#f1c40f":theme.accent,
          textShadow: isEpic
            ? "0 0 40px rgba(255,107,53,0.8), 0 0 80px rgba(255,69,0,0.4), 0 0 120px rgba(255,69,0,0.2)"
            : isMega
            ? "0 0 30px rgba(241,196,15,0.6), 0 0 60px rgba(241,196,15,0.2)"
            : `0 0 15px ${theme.accent}66`,
          animation:"bounceIn 0.5s ease-out",
        }}>+${countDisplay.toLocaleString()}</div>
      )}
      {}
      {isEpic && phase >= 3 && (
        <div style={{
          fontSize:14, fontFamily:T.mono, color:"rgba(255,215,0,0.7)",
          letterSpacing:4, marginTop:12, position:"relative", zIndex:2,
          animation:"fadeIn 0.5s ease 0.3s both",
          textShadow:"0 0 12px rgba(255,215,0,0.3)",
        }}>LEGENDARY</div>
      )}
      {showHint && (
        <div style={{position:"absolute",bottom:40,fontSize:12,color:"rgba(255,255,255,0.5)",
          letterSpacing:3,fontFamily:T.mono,textTransform:"uppercase",zIndex:2,
          animation:"fadeIn 0.8s ease-out, hintPulse 2s ease-in-out 0.8s infinite"}}>tap anywhere to continue</div>
      )}
    </div>
  );
}
