import React, { useState, useEffect, useRef } from 'react';
import { theme } from '../../theme-globals.js';
import { T } from '../../constants/styles.js';
import { getVipTier } from '../../constants/vip.js';
import { getChipSkin } from '../../constants/chips.js';

export function BankrollDisplay({ chips, animated, winStreak = 0, vipPoints = 0, achCount = 0, skipOverlays = false, onInlineRebuy, accent = theme.accent, skinId = "house", activePowerUps = [] }) {
  const [lastDelta, setLastDelta] = useState(null);
  const [deltaVisible, setDeltaVisible] = useState(false);
  const [showVipDetails, setShowVipDetails] = useState(false);
  const [glowing, setGlowing] = useState(false);
  const prevChips = useRef(chips);
  const timerRef = useRef(null);
  const tier = getVipTier(vipPoints, achCount);
  useEffect(() => {
    const diff = chips - prevChips.current;
    prevChips.current = chips;
    if (diff === 0) return;
    setLastDelta(diff);
    setDeltaVisible(true);
    if (diff > 0) {
      setGlowing(true);
      setTimeout(() => setGlowing(false), 1000);
    }
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setDeltaVisible(false), 1800);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [chips]);
  return (
    <div style={{
      position:"absolute", top:16, right:16, textAlign:"right", fontFamily:T.mono, zIndex:10,
      padding:"6px 10px", borderRadius:12,
      background: glowing ? `${accent}10` : "transparent",
      boxShadow: glowing ? `0 0 20px ${accent}35, 0 0 40px ${accent}12` : "none",
      transition: "background 0.4s, box-shadow 0.4s",
    }}>
      {winStreak >= 2 && (
        <div style={{ display:"flex", justifyContent:"flex-end", alignItems:"center", gap:5, marginBottom:3 }}>
          <StreakIndicator streak={winStreak} />
          <div onClick={() => setShowVipDetails(true)} style={{
            cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
            width:22, height:22, borderRadius:11, border:"1px solid " + tier.color + "44",
            background:tier.color + "10", transition:"all 0.2s",
          }}>
            <span style={{ fontSize:12, lineHeight:1 }}>{tier.icon}</span>
          </div>
        </div>
      )}
      {(winStreak < 2) && (
        <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:3 }}>
          <div onClick={() => setShowVipDetails(true)} style={{
            cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
            width:22, height:22, borderRadius:11, border:"1px solid " + tier.color + "44",
            background:tier.color + "10", transition:"all 0.2s",
          }}>
            <span style={{ fontSize:12, lineHeight:1 }}>{tier.icon}</span>
          </div>
        </div>
      )}
      <div className={`bankroll-chips${theme.isRainbow ? " anim-rainbow" : theme.isJackpotSkin ? " anim-gold-shimmer" : ""}`} style={{
        fontSize:22, fontWeight:600, transition:"color 0.4s, text-shadow 0.4s",
        color: chips > 500 ? accent : chips > 100 ? "#e8a735" : T.red,
        textShadow: glowing ? `0 0 12px ${accent}60` : "none",
        display:"flex", alignItems:"center", justifyContent:"flex-end", gap:4,
      }}>
        <div style={{ position:"relative", display:"inline-flex", alignItems:"center", justifyContent:"center", overflow:"visible", width:24, height:24, flexShrink:0, zIndex:1 }}>
          {getChipSkin(skinId).effect && <ChipSkinEffect effect={getChipSkin(skinId).effect} accent={accent} />}
          <PokerChipIcon size={24} skinId={skinId} activePowerUps={activePowerUps} color={accent} />
        </div>
        {animated ? <AnimatedChips chips={chips} /> : `$${chips.toLocaleString()}`}
        {chips <= 0 && skipOverlays && onInlineRebuy && (
          <button onClick={onInlineRebuy} style={{
            marginLeft:6, padding:"3px 10px", borderRadius:6, fontSize:10, fontWeight:700,
            fontFamily:T.mono, letterSpacing:1, textTransform:"uppercase",
            background:`${accent}25`, border:`1px solid ${accent}66`, color:accent,
            cursor:"pointer", animation:"pulse 1.5s infinite",
          }}>Rebuy</button>
        )}
      </div>
      {lastDelta != null && lastDelta !== 0 && (
        <div style={{
          fontSize:11, fontWeight:600, letterSpacing:0.5, marginTop:1,
          color: lastDelta > 0 ? T.green : T.red,
          opacity: deltaVisible ? 1 : 0,
          transition: deltaVisible ? "opacity 0.1s ease" : "opacity 0.6s ease 0.4s",
        }}>
          {lastDelta > 0 ? "+" : "\u2212"}${Math.abs(lastDelta).toLocaleString()}
        </div>
      )}
      {showVipDetails && <VipDetailsModal vipPoints={vipPoints} stats={{achievements:[], totalWagered:0}} onClose={() => setShowVipDetails(false)} accent={accent} />}
    </div>
  );
}
