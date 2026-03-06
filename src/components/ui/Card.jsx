import React from 'react';
import { theme } from '../../theme-globals.js';
import { isRed } from '../../constants/cards.js';

export function Card({ card, hidden = false, index = 0, dealt = true, small = false, flipping = false }) {
  const red = isRed(card?.suit);
  const isMobile = typeof window !== "undefined" && window.innerWidth < 480;
  const w = small ? 60 : isMobile ? 72 : 96;
  const h = small ? 84 : isMobile ? 100 : 134;
  const anim = dealt ? `cardSlideIn 0.4s cubic-bezier(0.22, 0.61, 0.36, 1) ${index * 0.15}s both` : "none";
  const cardBackBg = `linear-gradient(135deg, ${theme.accent}35 25%, ${theme.accent}50 25%, ${theme.accent}50 50%, ${theme.accent}35 50%, ${theme.accent}35 75%, ${theme.accent}50 75%)`;
  const cardBackBorder = `2px solid ${theme.accent}70`;
  const cardBackInner = `1.5px solid ${theme.accent}80`;
  const cardBackQColor = `${theme.accent}90`;
  const textColor2 = card ? (isRed(card.suit) ? "#c0392b" : "#1a1a2e") : "#1a1a2e";
  if (flipping) {
    return (
      <div className="card-deal" style={{ width:w, height:h, perspective:600, animation:anim }}>
        <div style={{ width:"100%", height:"100%", position:"relative", transformStyle:"preserve-3d",
          transition:"transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)", transform:hidden?"rotateY(0deg)":"rotateY(180deg)" }}>
          <div style={{ width:w, height:h, borderRadius:8, position:"absolute", top:0, left:0,
            background:cardBackBg, backgroundSize:"14px 14px", border:cardBackBorder, boxShadow:"2px 3px 8px rgba(0,0,0,0.4)",
            display:"flex", alignItems:"center", justifyContent:"center",
            backfaceVisibility:"hidden", WebkitBackfaceVisibility:"hidden" }}>
            <div style={{ width:w-24, height:h-24, border:cardBackInner, borderRadius:4,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:small?20:28, color:cardBackQColor, fontWeight:"bold" }}>?</div>
          </div>
          {card && <div style={{ width:w, height:h, borderRadius:8, background: theme.cardTint ? `linear-gradient(135deg, #f5f0e8, ${theme.cardTint} 50%, #f5f0e8)` : "#f5f0e8",
            border:"1.5px solid #c8b89a", boxShadow:`2px 3px 8px rgba(0,0,0,0.35), 0 0 20px ${theme.accent}25`,
            display:"flex", flexDirection:"column", padding:small?"3px 5px":"5px 7px",
            position:"absolute", top:0, left:0, fontFamily:"'Georgia', serif", userSelect:"none",
            backfaceVisibility:"hidden", WebkitBackfaceVisibility:"hidden", transform:"rotateY(180deg)" }}>
            {theme.cardTint && <div style={{ position:"absolute", inset:0, borderRadius:7, background:theme.cardTint, pointerEvents:"none" }} />}
            <div style={{ fontSize:small?12:17, fontWeight:"bold", color:textColor2, lineHeight:1 }}>{card.rank}</div>
            <div style={{ fontSize:small?10:15, color:textColor2, lineHeight:1, marginTop:1 }}>{card.suit}</div>
            <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", fontSize:small?24:38, color:textColor2, opacity:0.85 }}>{card.suit}</div>
            <div style={{ position:"absolute", bottom:small?3:6, right:small?5:8, fontSize:small?12:17, fontWeight:"bold", color:textColor2, transform:"rotate(180deg)", lineHeight:1 }}>
              {card.rank}<div style={{ fontSize:small?10:15, lineHeight:1, marginTop:1 }}>{card.suit}</div>
            </div>
          </div>}
        </div>
      </div>
    );
  }
  if (hidden) {
    return (
      <div className="card-deal" style={{
        width: w, height: h, borderRadius: 8,
        background: cardBackBg, backgroundSize: "14px 14px", border: cardBackBorder,
        boxShadow: "2px 3px 8px rgba(0,0,0,0.4)",
        display: "flex", alignItems: "center", justifyContent: "center",
        animation: anim,
      }}>
        <div style={{
          width: w - 24, height: h - 24, border: cardBackInner,
          borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: small ? 20 : 28, color: cardBackQColor, fontWeight: "bold",
        }}>?</div>
      </div>
    );
  }
  const textColor = red ? "#c0392b" : "#1a1a2e";
  return (
    <div className="card-deal" style={{
      width: w, height: h, borderRadius: 8, background: theme.cardTint ? `linear-gradient(135deg, #f5f0e8, ${theme.cardTint} 50%, #f5f0e8)` : "#f5f0e8",
      border: "1.5px solid #c8b89a", boxShadow: "2px 3px 8px rgba(0,0,0,0.35)",
      display: "flex", flexDirection: "column", padding: small ? "3px 5px" : "5px 7px",
      position: "relative", fontFamily: "'Georgia', serif",
      animation: anim, userSelect: "none",
    }}>
      {}
      {theme.cardTint && <div style={{ position:"absolute", inset:0, borderRadius:7, background:theme.cardTint, pointerEvents:"none" }} />}
      <div style={{ fontSize: small ? 12 : 17, fontWeight: "bold", color: textColor, lineHeight: 1 }}>{card.rank}</div>
      <div style={{ fontSize: small ? 10 : 15, color: textColor, lineHeight: 1, marginTop: 1 }}>{card.suit}</div>
      <div style={{
        position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        fontSize: small ? 24 : 38, color: textColor, opacity: 0.85,
      }}>{card.suit}</div>
      <div style={{
        position: "absolute", bottom: small ? 3 : 6, right: small ? 5 : 8,
        fontSize: small ? 12 : 17, fontWeight: "bold", color: textColor,
        transform: "rotate(180deg)", lineHeight: 1,
      }}>
        {card.rank}<div style={{ fontSize: small ? 10 : 15, lineHeight: 1, marginTop: 1 }}>{card.suit}</div>
      </div>
    </div>
  );
}
