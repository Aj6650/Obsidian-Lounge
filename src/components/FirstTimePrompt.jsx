import React, { useState } from 'react';
import { theme } from '../theme-globals.js';
import { T, DARK_BG } from '../constants/styles.js';

export function FirstTimePrompt({ onSignIn }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) { setError("Please enter a name"); return; }
    if (trimmed.length > 20) { setError("20 characters max"); return; }
    if (/['"\\\/]/.test(trimmed)) { setError("No quotes or slashes"); return; }
    onSignIn(trimmed);
  };
  return (
    <div style={{ minHeight:"100vh", background:DARK_BG, display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center", fontFamily:T.serif, color:T.text }}>
      <div style={{ textAlign:"center", animation:"fadeIn 0.5s ease" }}>
        <h1 className="anim-shimmer-title" style={{ fontSize:32, fontWeight:900, margin:"0 0 8px", letterSpacing:4,
          background:`linear-gradient(135deg, ${theme.accent}, ${theme.accent}cc, ${theme.accent})`,
          backgroundSize:"200% auto", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
          backgroundClip:"text", color:"transparent",
          fontFamily:"'Cormorant Garamond', 'Playfair Display', Georgia, serif" }}>OBSIDIAN LOUNGE</h1>
        <div style={{ fontSize:10, letterSpacing:3, color:T.dim, fontFamily:T.mono, marginBottom:28 }}>CHOOSE A NAME TO BEGIN</div>
        <input type="text" value={name} onChange={e => { setName(e.target.value); setError(""); }}
          onKeyDown={e => e.key === "Enter" && handleSubmit()} placeholder="Your name" maxLength={20} autoFocus
          style={{ width:200, padding:"10px 14px", fontSize:15, fontWeight:600, textAlign:"center",
            fontFamily:T.serif, letterSpacing:2, background:"rgba(255,255,255,0.05)",
            border:`1px solid ${theme.accent}4d`, borderRadius:8, color:T.text, outline:"none" }}
          onFocus={e => e.target.style.borderColor = `${theme.accent}99`}
          onBlur={e => e.target.style.borderColor = `${theme.accent}4d`} />
        {error && <div style={{ marginTop:6, fontSize:10, color:T.red, fontFamily:T.mono }}>{error}</div>}
        <div style={{ marginTop:14 }}>
          <button onClick={handleSubmit} style={{ padding:"10px 36px", fontSize:12, fontWeight:700,
            letterSpacing:3, textTransform:"uppercase", fontFamily:T.serif,
            background:`linear-gradient(135deg, ${theme.accent}, ${theme.accent}cc)`, color:"#1a1a2e",
            border:"none", borderRadius:7, cursor:"pointer" }}>Play</button>
        </div>
        <div style={{ marginTop:16, fontSize:8, color:"#3a3020", fontFamily:T.mono, letterSpacing:1 }}>
          Your progress saves to this name
        </div>
      </div>
    </div>
  );
}
