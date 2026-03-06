import React, { useState, useEffect, useRef } from 'react';
import { T } from '../../constants/styles.js';

export function JackpotOverlay({ amount, onDone }) {
  const [countDisplay, setCountDisplay] = useState(0);
  const [phase, setPhase] = useState(0);
  const [canDismiss, setCanDismiss] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [dismissing, setDismissing] = useState(false);
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const parts = useRef(null);
  if (!parts.current) {
    const r = () => Math.random();
    const isMobileJ = typeof window !== "undefined" && window.innerWidth < 480;
    const js = isMobileJ ? 0.5 : 1;
    parts.current = {
      stars: Array.from({length:Math.round(50*js)}, () => {
        const angle = r()*Math.PI*2;
        const dist = 40+r()*360;
        return {sx:"0px",sy:"0px",tx:`${Math.cos(angle)*dist}px`,ty:`${Math.sin(angle)*dist}px`,s:1+r()*3,d:2+r()*3,dl:r()*2,o:0.4+r()*0.5};
      }),
      confetti: Array.from({length:Math.round(80*js)}, () => ({x:r()*100,w:4+r()*9,h:4+r()*9,round:r()>0.5,c:Math.floor(r()*8),d:1.2+r()*2.5,dl:r()*1})),
      fire: Array.from({length:Math.round(30*js)}, () => ({x:5+r()*90,w:3+r()*10,h:10+r()*22,even:r()>0.5,d:1.5+r()*2.5,dl:r()*2})),
      chips: Array.from({length:Math.round(20*js)}, () => ({x:30+r()*40,drift:-40+r()*80,drift2:-80+r()*160,rise:-200-r()*280,rot:r()*720,s:9+r()*16,d:1.2+r()*1.8,dl:r()*1})),
      orbit1: Array.from({length:Math.round(20*js)}, (_, i) => ({angle:(i/20)*Math.PI*2,s:3+(i%4)*1.5,even:i%2===0})),
      orbit2: Array.from({length:Math.round(14*js)}, (_, i) => ({angle:(i/14)*Math.PI*2,s:2+(i%3)*1.2,even:i%2===0})),
      shatter: Array.from({length:Math.round(36*js)}, (_, i) => {const a=(i/36)*Math.PI*2;const d=250+r()*400;return{tx:Math.cos(a)*d,ty:Math.sin(a)*d,w:30+r()*60,h:20+r()*45,rot:r()*900-450,c:i%4,dl:i*0.012};}),
    };
  }
  const pp = parts.current;
  useEffect(() => {
    const t = [];
    t.push(setTimeout(() => setPhase(1), 1200));
    t.push(setTimeout(() => setPhase(2), 2000));
    t.push(setTimeout(() => setPhase(3), 3200));
    t.push(setTimeout(() => setCanDismiss(true), 3400));
    t.push(setTimeout(() => setShowHint(true), 4500));
    return () => t.forEach(clearTimeout);
  }, []);
  useEffect(() => {
    if (phase < 3) return;
    const steps = 70;
    let step = 0;
    const iv = setInterval(() => {
      step++;
      const t = step / steps;
      const eased = 1 - Math.pow(1 - t, 4);
      setCountDisplay(Math.round(amount * eased));
      if (step >= steps) { clearInterval(iv); setCountDisplay(amount); }
    }, 45);
    return () => clearInterval(iv);
  }, [amount, phase]);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const particles = [];
    const colors = ["#ff4500","#ffd700","#ff6b35","#fff","#ff0","#f1c40f","#ff3333","#ffaa00","#ff6600","#00ffcc","#ff00ff","#4488ff"];
    let running = true;
    const burst = () => {
      if (!running) return;
      const cx = Math.random() * canvas.width;
      const cy = canvas.height * (0.1 + Math.random() * 0.55);
      const count = 30 + Math.floor(Math.random() * 30);
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 10;
        particles.push({
          x: cx, y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2.5,
          size: 1.5 + Math.random() * 3.5,
          color: colors[Math.floor(Math.random() * colors.length)],
          gravity: 0.05 + Math.random() * 0.04,
          life: 1,
          decay: 0.01 + Math.random() * 0.008,
        });
      }
      setTimeout(burst, 350 + Math.random() * 500);
    };
    burst();
    const animate = () => {
      if (!running) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;
        if (p.life <= 0) { particles.splice(i, 1); continue; }
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => { running = false; cancelAnimationFrame(animRef.current); };
  }, []);
  const handleDismiss = () => {
    if (!canDismiss) return;
    setDismissing(true);
    setTimeout(onDone, 650);
  };
  const confettiColors = ["#f1c40f","#e74c3c","#3b82f6","#22c55e","#ec4899","#a855f7","#ffd700","#ff4500"];
  const jackpotLabel = "JACKPOT!!!";
  if (dismissing) {
    return (
      <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,zIndex:10002,pointerEvents:"none",overflow:"hidden"}}>
        {}
        <div style={{position:"absolute",top:"50%",left:"50%",width:500,height:500,borderRadius:"50%",
          animation:"goldenExplosion 0.65s ease-out forwards"}} />
        {}
        <div style={{position:"absolute",top:"50%",left:"50%",width:300,height:300,borderRadius:"50%",
          border:"4px solid rgba(255,215,0,0.6)",
          boxShadow:"0 0 60px rgba(255,215,0,0.5), 0 0 120px rgba(255,69,0,0.3)",
          animation:"shockwaveRing 0.6s ease-out 0.05s forwards",
          transform:"translate(-50%,-50%) scale(0)"}} />
        {}
        {pp.shatter.map((s, i) => (
          <div key={i} style={{
            position:"absolute",top:"50%",left:"50%",
            width:s.w,height:s.h,
            background:s.c===0?"rgba(255,69,0,0.9)":s.c===1?"rgba(255,215,0,0.9)":s.c===2?"rgba(255,107,53,0.9)":"rgba(255,255,255,0.8)",
            borderRadius:3,
            boxShadow:`0 0 15px ${s.c===0?"rgba(255,69,0,0.6)":s.c===1?"rgba(255,215,0,0.6)":"rgba(255,255,255,0.4)"}`,
            animation:`shatterFly 0.65s ease-out ${s.dl}s forwards`,
            "--tx":`${s.tx}px`,"--ty":`${s.ty}px`,"--rot":`${s.rot}deg`,
          }} />
        ))}
      </div>
    );
  }
  return (
    <div onClick={handleDismiss} style={{
      position:"fixed",top:0,left:0,right:0,bottom:0,zIndex:10002,
      display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
      background: phase === 0 ? "rgba(0,0,0,1)" : "rgba(0,0,0,0.95)",
      cursor:canDismiss?"pointer":"default",
      overflow:"hidden",
    }}>
      {}
      {phase >= 1 && (
        <div style={{ position:"absolute", inset:0, pointerEvents:"none", zIndex:0,
          animation:"jackpotEntranceQuake 1s ease-out" }} />
      )}
      {}
      <canvas ref={canvasRef} style={{
        position:"absolute",top:0,left:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:1,
      }} />
      {}
      {phase >= 2 && (
        <div style={{
          position:"absolute",top:0,left:0,right:0,bottom:0,
          background:"linear-gradient(45deg, rgba(255,69,0,0.06), rgba(255,215,0,0.08), rgba(255,107,53,0.06), rgba(255,215,0,0.04), rgba(255,69,0,0.06))",
          backgroundSize:"400% 400%",
          animation:"auroraShift 6s ease-in-out infinite",
          pointerEvents:"none",
        }} />
      )}
      {}
      {phase >= 1 && Array.from({length:3}, (_, i) => (
        <div key={`sw${i}`} style={{
          position:"absolute",top:"50%",left:"50%",
          width:600,height:600,borderRadius:"50%",
          border:`${3-i}px solid rgba(255,215,0,${0.6-i*0.15})`,
          boxShadow:`0 0 50px rgba(255,215,0,${0.35-i*0.08}), inset 0 0 30px rgba(255,69,0,${0.15-i*0.03})`,
          animation:`shockwaveRing 0.9s ease-out ${i*0.2}s forwards`,
          transform:"translate(-50%,-50%) scale(0)",
        }} />
      ))}
      {}
      {phase >= 2 && Array.from({length:4}, (_, i) => (
        <div key={`beam${i}`} style={{
          position:"absolute",top:"50%",left:"50%",
          width:800,height:800,
          background:`conic-gradient(from ${i*90}deg, transparent 0deg, rgba(255,215,0,0.06) 3deg, rgba(255,69,0,0.04) 5deg, transparent 8deg)`,
          borderRadius:"50%",
          animation:`spin ${6-i*0.8}s linear infinite ${i%2===0?"":"reverse"}`,
          transform:"translate(-50%,-50%)",
        }} />
      ))}
      {}
      {phase >= 2 && pp.stars.map((s, i) => (
        <div key={`star${i}`} style={{
          position:"absolute",top:"50%",left:"50%",
          width:s.s,height:s.s,borderRadius:"50%",
          background:i%3===0?"#ffd700":i%3===1?"#fff":"#ff6b35",
          boxShadow:`0 0 4px ${i%3===0?"rgba(255,215,0,0.6)":"rgba(255,255,255,0.5)"}`,
          animation:`starZoom ${s.d}s linear ${s.dl}s infinite`,
          "--sx":s.sx,"--sy":s.sy,"--tx":s.tx,"--ty":s.ty,
          opacity:s.o,
        }} />
      ))}
      {}
      {phase >= 2 && (
        <div style={{
          position:"absolute",top:0,left:0,right:0,bottom:0,pointerEvents:"none",
          background:"radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.65) 100%)",
          animation:"vignetteBreath 1.5s ease-in-out infinite",
        }} />
      )}
      {}
      {phase >= 2 && pp.fire.map((f, i) => (
        <div key={`fr${i}`} style={{
          position:"absolute",left:`${f.x}%`,bottom:-20,
          width:f.w,height:f.h,
          borderRadius:"50% 50% 50% 50% / 60% 60% 40% 40%",
          background:`radial-gradient(circle, ${f.even?"#ffd700":"#ff4500"}, transparent)`,
          animation:`fireRise ${f.d}s ease-out ${f.dl}s infinite`,
          opacity:0.7, zIndex:1,
        }} />
      ))}
      {}
      {phase >= 2 && pp.chips.map((c, i) => (
        <div key={`chip${i}`} style={{
          position:"absolute",left:`${c.x}%`,bottom:-10,
          width:c.s,height:c.s,borderRadius:"50%",
          background:"radial-gradient(circle at 35% 35%, #ffd700, #b8860b)",
          border:"1px solid rgba(255,215,0,0.5)",
          boxShadow:"0 0 8px rgba(255,215,0,0.5)",
          animation:`chipFountain ${c.d}s ease-out ${c.dl}s infinite`,
          "--drift":`${c.drift}px`,"--drift2":`${c.drift2}px`,
          "--rise":`${c.rise}px`,"--rot":`${c.rot}deg`,
          zIndex:1,
        }} />
      ))}
      {}
      {phase >= 2 && (<>
        <div style={{
          position:"absolute",top:"50%",left:"50%",width:480,height:240,
          transform:"translate(-50%,-50%)",
          animation:"spin 5s linear infinite",zIndex:2,
        }}>
          {pp.orbit1.map((o, i) => (
            <div key={i} style={{
              position:"absolute",
              left:`${50+48*Math.cos(o.angle)}%`,top:`${50+48*Math.sin(o.angle)}%`,
              width:o.s,height:o.s,borderRadius:"50%",
              transform:"translate(-50%,-50%)",
              background:o.even?"#ff4500":"#ffd700",
              boxShadow:`0 0 12px ${o.even?"rgba(255,69,0,0.8)":"rgba(255,215,0,0.8)"}`,
            }} />
          ))}
        </div>
        <div style={{
          position:"absolute",top:"50%",left:"50%",width:360,height:180,
          transform:"translate(-50%,-50%)",
          animation:"spin 3.5s linear infinite reverse",zIndex:2,
        }}>
          {pp.orbit2.map((o, i) => (
            <div key={i} style={{
              position:"absolute",
              left:`${50+46*Math.cos(o.angle)}%`,top:`${50+46*Math.sin(o.angle)}%`,
              width:o.s,height:o.s,borderRadius:"50%",
              transform:"translate(-50%,-50%)",
              background:o.even?"#fff":"#00ffcc",
              boxShadow:`0 0 8px ${o.even?"rgba(255,255,255,0.6)":"rgba(0,255,204,0.6)"}`,
            }} />
          ))}
        </div>
      </>)}
      {}
      {phase >= 2 && (
        <div style={{
          position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",
          width:750,height:750,
          background:"conic-gradient(from 0deg, transparent 0deg, rgba(255,69,0,0.12) 6deg, transparent 12deg, rgba(255,215,0,0.1) 18deg, transparent 24deg, rgba(255,255,255,0.04) 30deg, transparent 36deg)",
          borderRadius:"50%",
          animation:"spin 3s linear infinite",
        }} />
      )}
      {}
      {phase >= 2 && (
        <div style={{
          position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",
          width:380,height:380,borderRadius:"50%",
          border:"3px solid rgba(255,215,0,0.35)",
          boxShadow:"0 0 60px rgba(255,215,0,0.25), inset 0 0 60px rgba(255,215,0,0.1), 0 0 120px rgba(255,69,0,0.1)",
          animation:"glowBreath 1.2s ease-in-out infinite",
          zIndex:2,
        }} />
      )}
      {}
      {phase >= 2 && pp.confetti.map((c, i) => (
        <div key={`cc${i}`} style={{
          position:"absolute",left:`${c.x}%`,top:-10,
          width:c.w,height:c.h,borderRadius:c.round?"50%":"2px",
          background:confettiColors[c.c],
          animation:`confettiFall ${c.d}s linear ${c.dl}s forwards`,
          opacity:0.9,zIndex:1,
        }} />
      ))}
      {}
      {phase >= 2 && (
        <div style={{position:"relative",zIndex:3,display:"flex",gap:4}}>
          {jackpotLabel.split("").map((char, i) => (
            <span key={i} style={{
              fontSize:74, fontWeight:900, fontFamily:T.serif,
              background:"linear-gradient(180deg, #ff4500, #ff6b35, #ffd700, #fff, #ffd700, #ff6b35, #ff4500)",
              backgroundSize:"200% auto",
              WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
              display:"inline-block",
              animation:`jackpotLetterDrop 0.85s ease-out ${i*0.12}s both, shimmer 0.8s linear ${1.2+i*0.12}s infinite, letterBounce ${1.5+i*0.1}s ease-in-out ${1.5+i*0.12}s infinite`,
              textShadow:"none",
            }}>{char}</span>
          ))}
        </div>
      )}
      {}
      {phase >= 2 && (
        <div style={{
          fontSize:20, fontFamily:T.mono, fontWeight:700,
          color:"#ff6b35", letterSpacing:6,
          marginTop:10,position:"relative",zIndex:3,
          opacity:0,
          animation: phase >= 2 ? "fadeIn 0.5s ease 0.7s both" : "none",
          textShadow:"0 0 20px rgba(255,107,53,0.6), 0 0 40px rgba(255,69,0,0.3)",
        }}>10,000× MULTIPLIER</div>
      )}
      {}
      {phase >= 3 && (
        <div style={{
          fontSize:56, fontWeight:900, fontFamily:T.mono,
          color:"#ffd700",position:"relative",zIndex:3,
          textShadow:"0 0 40px rgba(255,215,0,0.7), 0 0 80px rgba(255,215,0,0.3), 0 0 120px rgba(255,215,0,0.15)",
          marginTop:20,
          animation:"bounceIn 0.6s ease-out",
        }}>+${countDisplay.toLocaleString()}</div>
      )}
      {}
      {showHint && (
        <div style={{
          position:"absolute",bottom:50,fontSize:13,color:"rgba(255,255,255,0.5)",
          letterSpacing:3,fontFamily:T.mono,textTransform:"uppercase",zIndex:3,
          animation:"fadeIn 0.8s ease-out, hintPulse 2s ease-in-out 0.8s infinite",
        }}>tap anywhere to continue</div>
      )}
    </div>
  );
}
export const BUSTED_TAGLINES = [
  "The house always wins... eventually.",
  "That's what they call a learning experience.",
  "Your wallet sends its regards.",
  "Rock bottom has a casino, apparently.",
  "Time to check between the couch cushions.",
  "The ATM called. It's worried about you.",
  "Statistically, this was inevitable.",
  "Every gambler's origin story starts here.",
  "Your accountant just felt a disturbance.",
  "Plot twist: the chips were the friends we lost along the way.",
];
