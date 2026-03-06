import React, { useState, useEffect } from 'react';
import { T } from '../constants/styles.js';
import { getActiveTheme } from '../constants/chips.js';
import { RARITY_COLORS } from '../constants/shop.js';
import { AmbientParticles } from './ui/AmbientParticles.jsx';
import { FloatingWins } from './ui/FloatingWins.jsx';
import { CoinRain } from './ui/CoinRain.jsx';
import { ScreenColorWash } from './ui/ScreenColorWash.jsx';
import { ConfettiCanvas } from './ui/ConfettiCanvas.jsx';
import { ChipEruption } from './ui/ChipEruption.jsx';
import { BigWinOverlay } from './ui/BigWinOverlay.jsx';
import { AnimatedChips } from './ui/AnimatedChips.jsx';
import { StreakIndicator } from './ui/StreakIndicator.jsx';
import { AchievementToast } from './ui/AchievementToast.jsx';
import { NearMissFlash } from './ui/NearMissFlash.jsx';
import { JackpotOverlay } from './ui/JackpotOverlay.jsx';
import { EdgeLights } from './ui/EdgeLights.jsx';
import { BankrollDisplay } from './ui/BankrollDisplay.jsx';
import { PokerChipIcon } from './ui/PokerChipIcon.jsx';
import { LightningBolts } from './ui/LightningBolts.jsx';
import { ChipSkinEffect } from './ui/ChipSkinEffect.jsx';

export function GameShell({ bg, title, chips, onBack, children, shaking, shakeIntensity = "normal", flash, lossFlash, rules, startChips, onKeyAction, winStreak = 0, vipPoints = 0, achCount = 0, nearMiss = null, coinRain = null, colorWash = null, confetti = null, eruption = false, onDismissEffects = null, skipOverlays = false, skipEffects = false, onRebuy, theme = "dark", skinTheme, skinId = "house", activePowerUps = [], sessionDetail = null }) {
  const st = skinTheme || getActiveTheme("house");
  const isRainbow = skinId === "completionist";
  const isJackpotSkin = skinId === "jackpot";
  const sessionProfit = chips - (startChips || chips);
  const [showRules, setShowRules] = useState(false);
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") { if (showRules) setShowRules(false); else onBack(); }
      if (showRules) return;
      if (onKeyAction) onKeyAction(e.key, e);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onBack, onKeyAction, showRules]);
  const shakeAnim = shaking
    ? shakeIntensity === "epic" ? "epicShake 0.8s ease-out"
    : shakeIntensity === "heavy" ? "screenShake 0.5s ease-out"
    : shakeIntensity === "light" ? "lossShake 0.3s ease-out"
    : "screenShake 0.4s ease-out"
    : "none";
  const glowShadow = flash
    ? `inset 0 0 80px ${st.accent}60, inset 0 0 120px ${st.accent}18`
    : lossFlash
    ? "inset 0 0 40px rgba(231,76,60,0.2)"
    : "none";
  return (
    <>
    {}
    {!skipEffects && coinRain && <CoinRain intensity={coinRain} />}
    {!skipEffects && colorWash && <ScreenColorWash type={colorWash} onDismiss={onDismissEffects} />}
    {!skipEffects && confetti && <ConfettiCanvas type={confetti.type} key={confetti.key} />}
    {!skipEffects && eruption && <ChipEruption count={16} />}
    <div style={{
      minHeight:"100vh",
      background: theme === "light"
        ? "radial-gradient(ellipse at center, #f0ebe0 0%, #e5ddd0 60%, #d8d0c0 100%)"
        : bg,
      display:"flex", flexDirection:"column", alignItems:"center",
      fontFamily:T.serif, color: theme === "light" ? "#2a1c12" : T.text, position:"relative", overflow:"hidden",
      boxShadow: skipEffects ? "none" : glowShadow,
      transition: "box-shadow 0.4s ease",
    }}>
      {}
      {theme !== "light" && st.accent !== "#d4af37" && (
        <div style={{ position:"absolute", inset:0, pointerEvents:"none", zIndex:0,
          background:`radial-gradient(ellipse at 50% 40%, transparent 30%, ${st.accent}0a 55%, ${st.accent}14 75%, ${st.accent}1e 100%)` }} />
      )}
      {}
      {shaking && !skipEffects && (
        <div style={{
          position:"fixed", inset:0, zIndex:9998, pointerEvents:"none",
          animation: shakeAnim,
          background:"transparent",
        }}>
          {}
          <div style={{ position:"absolute", inset:0,
            boxShadow: shakeIntensity === "epic" ? "inset 0 0 60px rgba(255,69,0,0.15)"
              : shakeIntensity === "heavy" ? `inset 0 0 40px ${st.accent}20`
              : "none",
          }} />
        </div>
      )}
      <BackButton onClick={onBack} accent={st.accent} />
      <BankrollDisplay chips={chips} animated
        winStreak={winStreak} vipPoints={vipPoints} achCount={achCount}
        skipOverlays={skipOverlays} onInlineRebuy={onRebuy} accent={st.accent} skinId={skinId} activePowerUps={activePowerUps} />
      {}
      {activePowerUps.length > 0 && (
        <div style={{ position:"absolute", top:52, left:6, zIndex:10, display:"flex", flexDirection:"column", gap:3,
          animation:"fadeIn 0.3s ease" }}>
          <div style={{ fontSize:7, fontFamily:T.mono, letterSpacing:2, color:T.dim, textTransform:"uppercase",
            padding:"0 2px", marginBottom:1 }}>ACTIVE</div>
          {activePowerUps.map((apu, i) => {
            const rarityCol = RARITY_COLORS[apu.item?.rarity] || st.accent;
            const remaining = apu.remaining != null ? apu.remaining : 0;
            const unitLabel = apu.item?.effect?.wins ? "wins" : apu.item?.effect?.bets ? "bets" : "uses";
            const maxUses = apu.item?.effect?.wins || apu.item?.effect?.bets || apu.item?.effect?.uses || 1;
            const pct = Math.max(0, Math.min(100, (remaining / maxUses) * 100));
            return (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:6, padding:"4px 8px 4px 5px",
                borderRadius:7, background:"rgba(8,6,4,0.8)", backdropFilter:"blur(6px)",
                border:`1px solid ${rarityCol}25`, whiteSpace:"nowrap", position:"relative", overflow:"hidden",
                minWidth:90 }}>
                {}
                <div style={{ position:"absolute", left:0, top:0, bottom:0, width:`${pct}%`,
                  background:`${rarityCol}0a`, transition:"width 0.3s" }} />
                {}
                <div style={{ position:"absolute", left:0, top:0, bottom:0, width:2, background:rarityCol, opacity:0.6 }} />
                {}
                <span style={{ fontSize:12, width:16, textAlign:"center", color:rarityCol, zIndex:1 }}>{apu.item?.icon}</span>
                {}
                <div style={{ flex:1, zIndex:1 }}>
                  <div style={{ fontSize:8, fontFamily:T.mono, fontWeight:700, color:T.text, letterSpacing:0.5 }}>
                    {apu.item?.tier}
                  </div>
                  <div style={{ fontSize:7, fontFamily:T.mono, color:T.dim }}>
                    {remaining} {unitLabel}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {}
      <div className="game-shell-spacer" style={{ width:"100%", minHeight:72 }} />
      <div className="game-content" style={{ padding:"6px 24px 0", textAlign:"center", zIndex:1, position:"relative" }}>
        {}
        {st.tableFelt && theme !== "light" && (
          <div style={{ position:"absolute", inset:-40, pointerEvents:"none", zIndex:0,
            background:`radial-gradient(ellipse at 50% 40%, ${st.tableFelt}55 0%, ${st.tableFelt}25 50%, transparent 80%)` }} />
        )}
        <div className={`game-shell-title${isRainbow ? " anim-rainbow" : isJackpotSkin ? " anim-gold-shimmer" : ""}`} style={{ fontSize:17, fontWeight:700, letterSpacing:5, textTransform:"uppercase",
          ...(isJackpotSkin ? {
            background:"linear-gradient(90deg, #b89a00, #ffd700, #fff8dc, #ffd700, #ffe87c, #ffd700, #b89a00)",
            backgroundSize:"400% auto", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", color:"transparent",
            textShadow:"none"
          } : { color:st.accent, textShadow:`0 2px 12px ${st.accent}30` })
        }}>{title}</div>
      </div>
      {nearMiss && <NearMissFlash message={nearMiss} />}
      <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", width:"100%" }}>
        {children}
      </div>
      {}
      <div style={{ width:"100%", padding:"8px 16px 10px", display:"flex", flexDirection:"column", alignItems:"center",
        gap:6, borderTop:`1px solid ${st.accent}10`, marginTop:8, zIndex:1 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ fontSize:9, letterSpacing:2, textTransform:"uppercase", color:T.dim, fontFamily:T.mono }}>Session</span>
          <span style={{ fontSize:13, fontWeight:700, fontFamily:T.mono,
            color: sessionProfit > 0 ? "#22c55e" : sessionProfit < 0 ? "#ef4444" : T.muted }}>
            {sessionProfit >= 0 ? "+" : ""}${sessionProfit.toLocaleString()}
          </span>
        </div>
        {sessionDetail}
      </div>
    </div>
    {rules && (
      <button onClick={() => setShowRules(true)} className="rules-btn" style={{
        position:"fixed", bottom:16, right:16, zIndex:15000,
        width:36, height:36, borderRadius:"50%", cursor:"pointer",
        background:"rgba(14,10,8,0.9)", border:`1px solid ${st.accent}55`,
        color:st.accent, fontSize:17, fontWeight:700, fontFamily:"Georgia",
        display:"flex", alignItems:"center", justifyContent:"center",
        transition:"all 0.2s", boxShadow:"0 2px 12px rgba(0,0,0,0.4)",
      }}
        onMouseEnter={e => { e.currentTarget.style.background=`${st.accent}35`; e.currentTarget.style.transform="scale(1.1)"; }}
        onMouseLeave={e => { e.currentTarget.style.background="rgba(26,26,46,0.9)"; e.currentTarget.style.transform="scale(1)"; }}>
        ?
      </button>
    )}
    {showRules && (
      <div style={{ position:"fixed", inset:0, zIndex:20000, display:"flex", alignItems:"center", justifyContent:"center",
        background:"rgba(0,0,0,0.75)", backdropFilter:"blur(6px)", animation:"fadeIn 0.2s ease" }}
        onClick={(e) => { if (e.target === e.currentTarget) setShowRules(false); }}>
        <div style={{ background:st.tier >= 3 ? st.modalBg : "linear-gradient(180deg, #1e1e34, #15152a)", border:`1px solid ${st.accent}33`,
          borderRadius:T.radiusLg, padding:24, maxWidth:400, width:"92%", maxHeight:"80vh", overflowY:"auto",
          boxShadow:"0 24px 64px rgba(0,0,0,0.6)", animation:"fadeInScale 0.2s ease" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <div style={{ fontSize:15, fontWeight:700, letterSpacing:3, color:st.accent, textTransform:"uppercase",
              fontFamily:T.serif }}>{title} Rules</div>
            <button onClick={() => setShowRules(false)} style={{
              background:"none", border:"none", color:T.muted, fontSize:20, cursor:"pointer",
              padding:"0 4px", lineHeight:1, transition:"color 0.15s",
            }}
              onMouseEnter={e => e.currentTarget.style.color = T.text}
              onMouseLeave={e => e.currentTarget.style.color = T.muted}>×</button>
          </div>
          <div style={{ fontSize:12, lineHeight:1.8, color:T.textMuted, fontFamily:T.mono, letterSpacing:0.2 }}>
            {rules}
          </div>
        </div>
      </div>
    )}
    </>
  );
}
