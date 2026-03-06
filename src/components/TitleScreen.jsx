import React, { useState } from 'react';
import { theme } from '../theme-globals.js';
import { T, S } from '../constants/styles.js';
import { cardVal } from '../constants/cards.js';
import { VAULT_YEAR_THRESHOLDS, ACH_POINTS, calcVipPoints, getVipTier, getNextVipTier } from '../constants/vip.js';
import { ACHIEVEMENTS } from '../constants/achievements.js';
import { CHIP_SKINS, getUnlockedSkins, getChipSkin, getActiveTheme } from '../constants/chips.js';
import { SHOP_ITEMS, MYSTERY_DROP_RATES, RARITY_COLORS, SHOP_CATEGORIES } from '../constants/shop.js';
import { AmbientParticles } from './ui/AmbientParticles.jsx';
import { ActionButton, actionBtnStyle } from './ui/ActionButton.jsx';
import { GoldButton } from './ui/GoldButton.jsx';
import { BetControls } from './ui/BetControls.jsx';
import { SessionTracker } from './ui/SessionTracker.jsx';
import { StatCard } from './ui/StatCard.jsx';
import { Sparkline } from './ui/Sparkline.jsx';
import { VipDetailsModal } from './ui/VipDetailsModal.jsx';
import { ChipSkinModal } from './ui/ChipSkinModal.jsx';
import { ChipSkinEffect } from './ui/ChipSkinEffect.jsx';
import { PokerChipIcon } from './ui/PokerChipIcon.jsx';
import { BankrollDisplay } from './ui/BankrollDisplay.jsx';
import { ChipStackVisual } from './ui/ChipStackVisual.jsx';
import { BackButton } from './ui/BackButton.jsx';
import { LightningBolts } from './ui/LightningBolts.jsx';
import { StreakIndicator } from './ui/StreakIndicator.jsx';
import { AnimatedChips } from './ui/AnimatedChips.jsx';
import { CoinRain } from './ui/CoinRain.jsx';
import { ScreenColorWash } from './ui/ScreenColorWash.jsx';
import { ConfettiCanvas } from './ui/ConfettiCanvas.jsx';
import { ChipEruption } from './ui/ChipEruption.jsx';
import { BigWinOverlay } from './ui/BigWinOverlay.jsx';
import { JackpotOverlay } from './ui/JackpotOverlay.jsx';
import { Card } from './ui/Card.jsx';
import { IconAceSpade, IconCards, IconWheel, IconCherry, IconPlinko, IconCrash, IconHighLow, IconDice, IconCraps, IconKeno, IconBaccarat, IconScratch } from './ui/GameIcons.jsx';

export const GAMES = [
  { id:"blackjack", name:"Blackjack", description:"Beat the dealer to 21", Icon: IconAceSpade, color:"#27ae60", rtp:"99.5%" },
  { id:"poker", name:"Video Poker", description:"Jacks or Better", Icon: IconCards, color:"#3b82f6", rtp:"99.5%" },
  { id:"roulette", name:"Roulette", description:"Spin the wheel", Icon: IconWheel, color:T.red, rtp:"97.3%" },
  { id:"slots", name:"Slots", description:"5-reel video slots", Icon: IconCherry, color:"#a855f7", rtp:"~95%" },
  { id:"plinko", name:"Plinko", description:"Drop the ball", Icon: IconPlinko, color:"#14b8a6", rtp:"98.7%" },
  { id:"crash", name:"Crash", description:"Cash out in time", Icon: IconCrash, color:T.green, rtp:"96%" },
  { id:"highlow", name:"Hi-Lo", description:"Higher or lower?", Icon: IconHighLow, color:"#f59e0b", rtp:"97%" },
  { id:"dice", name:"Dice", description:"Roll the bones", Icon: IconDice, color:"#ec4899", rtp:"97%" },
  { id:"craps", name:"Craps", description:"Pass line action", Icon: IconCraps, color:"#16a34a", rtp:"98.6%" },
  { id:"keno", name:"Keno", description:"Pick your numbers", Icon: IconKeno, color:"#8b5cf6", rtp:"~80%" },
  { id:"baccarat", name:"Baccarat", description:"Closest to 9 wins", Icon: IconBaccarat, color:"#dc2626", rtp:"98.9%" },
  { id:"scratch", name:"Scratch Cards", description:"Scratch to win", Icon: IconScratch, color:"#eab308", rtp:"~88%" },
];
export function TitleScreen({ chips, onSelectGame, onRebuy, stats, onResetStats, username, onSignOut, isGuest, userEmail, onManualSave, saveStatus, onAdminSetStats, onAdminSetChips, forceJackpot, setForceJackpot, sessionStart, sessionRounds, sessionChipsStart, settings = {}, setSettings, onVaultDeposit, onVaultWithdraw, onVaultRepayDebt }) {
  const [tab, setTab] = useState("games");
  const [featsSubTab, setFeatsSubTab] = useState("stats");
  const [showMysteryOdds, setShowMysteryOdds] = useState(null);
  const [selectedShopItem, setSelectedShopItem] = useState(null);
  const [selectedInvItem, setSelectedInvItem] = useState(null);
  const [seenAchCount, setSeenAchCount] = useState(stats.achievements?.length || 0);
  const vipPoints = calcVipPoints(stats);
  const achCount = (stats.achievements || []).length;
  const vipTier = getVipTier(vipPoints, achCount);
  const [confirmReset, setConfirmReset] = useState(false);
  const [showVipDetails, setShowVipDetails] = useState(false);
  const [vaultDepositAmt, setVaultDepositAmt] = useState("");
  const [vaultWithdrawAmt, setVaultWithdrawAmt] = useState("");
  const [vaultRepayAmt, setVaultRepayAmt] = useState("");
  const [showChipSkins, setShowChipSkins] = useState(false);
  const [shopToast, setShopToast] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminAuth, setAdminAuth] = useState(false);
  const [adminPw, setAdminPw] = useState("");
  const [adminPwError, setAdminPwError] = useState(false);
  const [adminChipAdd, setAdminChipAdd] = useState("");
  const [testOverlay, setTestOverlay] = useState(null);
  const [testCoinRain, setTestCoinRain] = useState(null);
  const [testConfetti, setTestConfetti] = useState(null);
  const [testEruption, setTestEruption] = useState(false);
  const [testWash, setTestWash] = useState(null);
  const [testShake, setTestShake] = useState(null);
  const totalGames = Object.values(stats.gamesPlayed).reduce((a,b) => a+b, 0);
  const mostPlayed = Object.entries(stats.gamesPlayed).sort((a,b) => b[1]-a[1])[0];
  const mostPlayedName = mostPlayed && mostPlayed[1] > 0
    ? GAMES.find(g => g.id === mostPlayed[0])?.name || mostPlayed[0]
    : "None yet";
  const isLight = (settings.theme || "dark") === "light";
  const activeTheme = getActiveTheme(settings.chipSkin);
  const isRainbow = settings.chipSkin === "completionist";
  const isJackpotSkin = settings.chipSkin === "jackpot";
  const lobbyBg = isLight
    ? "radial-gradient(ellipse at center, #f0ebe0 0%, #e5ddd0 60%, #d8d0c0 100%)"
    : activeTheme.bgGradient;
  const lobbyText = isLight ? "#2a1c12" : T.text;
  return (
    <div style={{ minHeight:"100vh", height:"100vh", background:lobbyBg, display:"flex", flexDirection:"column",
      fontFamily:T.serif, color:lobbyText, position:"relative", overflow:"hidden" }}>
      {shopToast && (
        <div style={{ position:"fixed", top:20, left:"50%", transform:"translateX(-50%)", zIndex:20000,
          background:"rgba(30,20,10,0.95)", border:"1px solid rgba(239,68,68,0.4)", borderRadius:10,
          padding:"10px 20px", color:"#ef4444", fontSize:12, fontFamily:T.mono, letterSpacing:1,
          boxShadow:"0 4px 20px rgba(0,0,0,0.5)", whiteSpace:"nowrap", animation:"fadeIn 0.2s ease" }}>
          {shopToast}
        </div>
      )}
      {}
      <div style={{ position:"absolute", inset:0, opacity:0.025,
        background:`repeating-linear-gradient(45deg, transparent, transparent 40px, ${activeTheme.accent} 40px, ${activeTheme.accent} 41px)`, pointerEvents:"none" }} />
      <div style={{ position:"absolute", top:"-20%", left:"-10%", width:"120%", height:"140%",
        background:`radial-gradient(ellipse at 25% 15%, ${activeTheme.accent}08 0%, transparent 45%), radial-gradient(ellipse at 75% 85%, ${activeTheme.accentDim}06 0%, transparent 40%)`,
        pointerEvents:"none" }} />
      {}
      {activeTheme.particles && !isLight && <AmbientParticles config={activeTheme.particles} />}
      {}
      {activeTheme.tier >= 3 && !isLight && (
        <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:2,
          background:`radial-gradient(ellipse at center, transparent 40%, ${activeTheme.accent}15 70%, ${activeTheme.accent}28 90%, ${activeTheme.accent}38 100%)` }} />
      )}
      {}
      {isJackpotSkin && !isLight && (
        <div style={{ position:"fixed", top:"15%", left:"50%", transform:"translateX(-50%)", width:"80%", height:"40%",
          pointerEvents:"none", zIndex:1, borderRadius:"50%",
          background:"radial-gradient(ellipse at center, rgba(255,215,0,0.08) 0%, rgba(255,200,0,0.03) 40%, transparent 70%)",
          animation:"goldPulseGlow 5s ease-in-out infinite" }} />
      )}
      {}
      {activeTheme.tier >= 4 && !isLight && (
        <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:3 }}>
          <LightningBolts color={activeTheme.accent} intensity={activeTheme.tier >= 5 ? 2 : 1} />
        </div>
      )}
      {}
      <div className={isRainbow ? "anim-rainbow-border" : ""} style={{ flexShrink:0, zIndex:10, padding:"10px 16px 8px", display:"flex", alignItems:"center", justifyContent:"space-between",
        borderBottom:`1px solid ${activeTheme.accent}15`, background: isJackpotSkin ? "rgba(18,14,4,0.7)" : "rgba(10,8,18,0.5)", backdropFilter:"blur(12px)", WebkitBackdropFilter:"blur(12px)",
        boxShadow: activeTheme.navTint !== "transparent" ? `inset 0 0 40px ${activeTheme.navTint}` : "none", position:"relative", overflow:"hidden" }}>
        {}
        {isJackpotSkin && (
          <div style={{ position:"absolute", top:0, bottom:0, width:"20%", pointerEvents:"none",
            background:"linear-gradient(90deg, transparent, rgba(255,215,0,0.12), rgba(255,248,200,0.18), rgba(255,215,0,0.12), transparent)",
            animation:"goldGlintSweep 4s ease-in-out infinite", zIndex:0 }} />
        )}
        {}
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <h1 key={`title-${settings.chipSkin}`} className={`anim-shimmer-title${settings.chipSkin === "completionist" ? " anim-rainbow" : isJackpotSkin ? " anim-gold-shimmer" : ""}`} style={{ fontSize:18, fontWeight:900, margin:0, letterSpacing:2,
            background: settings.chipSkin === "completionist" ? "linear-gradient(135deg, #ff6ec7 0%, #ff9a3c 20%, #f7e84e 40%, #4cff50 60%, #3cb8ff 80%, #c850f0 100%)"
              : isJackpotSkin ? "linear-gradient(90deg, #b89a00, #ffd700, #fff8dc, #ffd700, #ffe87c, #ffd700, #b89a00)"
              : `linear-gradient(135deg, ${activeTheme.accent} 0%, ${activeTheme.accent}cc 40%, ${activeTheme.accent} 60%, ${activeTheme.accentDim} 100%)`,
            backgroundSize: isJackpotSkin ? "400% auto" : "200% auto", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
            backgroundClip:"text", color:"transparent",
            fontFamily:"'Cormorant Garamond', 'Playfair Display', Georgia, serif",
            animation: isJackpotSkin ? "goldShimmer 4s linear infinite" : "titleReveal 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards" }}>OBSIDIAN LOUNGE</h1>
        </div>
        {}
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div onClick={() => setShowVipDetails(true)} style={{ cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
            width:30, height:30, borderRadius:15, border:"1px solid " + vipTier.border, background:vipTier.color + "10",
            boxShadow:`0 0 8px ${vipTier.color}25`, color:vipTier.color }}>
            <span style={{ fontSize:16, lineHeight:1 }}>{vipTier.icon}</span>
          </div>
          {(stats.vault || 0) > 0 && (
            <div onClick={() => setTab("vault")} style={{ display:"flex", alignItems:"center", gap:4, cursor:"pointer",
              fontSize:10, fontFamily:T.mono, color:activeTheme.accent, padding:"3px 7px",
              background:`${activeTheme.accent}15`, borderRadius:5, border:`1px solid ${activeTheme.accent}25`,
              letterSpacing:1, transition:"all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.background=`${activeTheme.accent}28`; }}
              onMouseLeave={e => { e.currentTarget.style.background=`${activeTheme.accent}15`; }}>
              <span>&#128274;</span>
              <span>${(stats.vault||0) >= 1e9 ? ((stats.vault||0)/1e9).toFixed(1)+"B" : (stats.vault||0) >= 1e6 ? ((stats.vault||0)/1e6).toFixed(1)+"M" : (stats.vault||0) >= 1e3 ? ((stats.vault||0)/1e3).toFixed(1)+"K" : (stats.vault||0).toLocaleString()}</span>
            </div>
          )}
          {(stats.totalDebt || 0) > 0 && (
            <div onClick={() => setTab("vault")} style={{ display:"flex", alignItems:"center", gap:4, cursor:"pointer",
              fontSize:9, fontFamily:T.mono, color:"#ef4444", padding:"3px 7px",
              background:"rgba(239,68,68,0.1)", borderRadius:5, border:"1px solid rgba(239,68,68,0.3)",
              letterSpacing:1 }}>
              <span>&#9888;</span>
              <span>${(stats.totalDebt||0) >= 1e6 ? ((stats.totalDebt||0)/1e6).toFixed(1)+"M" : (stats.totalDebt||0) >= 1e3 ? ((stats.totalDebt||0)/1e3).toFixed(1)+"K" : (stats.totalDebt||0).toLocaleString()}</span>
            </div>
          )}
          <div onClick={() => setShowChipSkins(true)} style={{ display:"flex", alignItems:"center", gap:6, cursor:"pointer", position:"relative" }}>
            {}
            {isJackpotSkin && (<>
              {}
              <div style={{ position:"absolute", top:-80, bottom:-40, left:"50%", transform:"translateX(-50%)", width:90, pointerEvents:"none", zIndex:0,
                background:"radial-gradient(ellipse at 50% 55%, rgba(255,215,0,0.3) 0%, rgba(255,215,0,0.12) 30%, rgba(255,200,80,0.04) 60%, transparent 80%)",
                animation:"etherealFloat 4s ease-in-out infinite" }} />
              {}
              <div style={{ position:"absolute", top:-60, bottom:-30, left:"50%", transform:"translateX(-50%)", width:30, pointerEvents:"none", zIndex:0,
                background:"linear-gradient(180deg, rgba(255,248,200,0.2) 0%, rgba(255,215,0,0.35) 40%, rgba(255,215,0,0.25) 60%, rgba(255,248,200,0.1) 100%)",
                animation:"goldPulseGlow 3s ease-in-out infinite", filter:"blur(6px)" }} />
            </>)}
            {getChipSkin(settings.chipSkin).effect && <ChipSkinEffect effect={getChipSkin(settings.chipSkin).effect} accent={getChipSkin(settings.chipSkin).accent} />}
            <ChipStackVisual chips={chips} skinId={settings.chipSkin} />
            <div style={{ fontSize:18, fontWeight:700, fontFamily:T.mono,
              color: chips > 500 ? activeTheme.accent : chips > 100 ? "#e8a735" : "#e74c3c" }}>
              <AnimatedChips chips={chips} />
            </div>
          </div>
        </div>
      </div>
      {}
      <div style={{ flex:1, overflow:"hidden", position:"relative", zIndex:1 }}>
        <div key={tab} style={{ position:"absolute", inset:0, overflowY:"auto", overflowX:"hidden",
          padding:"16px 16px 20px", animation:"fadeIn 0.25s ease",
          WebkitOverflowScrolling:"touch" }}>
          <div style={{ maxWidth:580, margin:"0 auto" }}>
        {tab === "games" && (<>
          {}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14, animation:"tabSlideIn 0.3s ease-out" }}>
            <div>
              <div style={{ fontSize:12, color:T.muted, fontFamily:T.mono, letterSpacing:1 }}>
                Welcome, <span style={{ color:activeTheme.accent }}>{username}</span>
              </div>
              {stats.winStreak >= 2 && <StreakIndicator streak={stats.winStreak || 0} />}
            </div>
            <button onClick={onSignOut}
              style={{ fontSize:9, padding:"3px 10px", fontFamily:T.mono, letterSpacing:1,
                background:"transparent", border:"1px solid rgba(255,255,255,0.1)", borderRadius:4,
                color:T.dim, cursor:"pointer", transition:"all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor=activeTheme.accent + "50"; e.currentTarget.style.color=activeTheme.accent; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor="rgba(255,255,255,0.1)"; e.currentTarget.style.color="#5a5040"; }}>
              Switch
            </button>
          </div>
          {}
          <div className="game-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
            {GAMES.map((game, idx) => (
              <button key={game.id} onClick={() => chips > 0 && onSelectGame(game.id)} disabled={chips <= 0}
                className="game-tile"
                style={{
                  background: isJackpotSkin ? "rgba(255,215,0,0.04)" : "rgba(255,240,220,0.03)",
                  border: isJackpotSkin ? "1px solid rgba(255,215,0,0.18)" : `1px solid ${activeTheme.accent}1a`,
                  borderRadius:12, padding:"16px 8px 12px", cursor: chips > 0 ? "pointer" : "not-allowed",
                  transition:"all 0.3s", textAlign:"center",
                  animation: isJackpotSkin
                    ? `lobbyTileIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${0.05+idx*0.04}s both, goldTileGlow 3s ease-in-out ${idx*0.3}s infinite`
                    : `lobbyTileIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${0.05+idx*0.04}s both`,
                  display:"flex", flexDirection:"column", alignItems:"center", position:"relative",
                  overflow:"hidden",
                }}
                onMouseEnter={e => { if(chips>0){
                  e.currentTarget.style.background=`${game.color}12`;
                  e.currentTarget.style.borderColor=game.color + "60";
                  e.currentTarget.style.transform="translateY(-4px) scale(1.02)";
                  e.currentTarget.style.boxShadow=`0 12px 28px rgba(0,0,0,0.35), 0 0 20px ${game.color}18`;
                }}}
                onMouseLeave={e => {
                  e.currentTarget.style.background="rgba(255,240,220,0.03)";
                  e.currentTarget.style.borderColor=`${activeTheme.accent}1a`;
                  e.currentTarget.style.transform="translateY(0) scale(1)";
                  e.currentTarget.style.boxShadow="none";
                }}>
                {}
                <div style={{ position:"absolute", top:0, left:"50%", transform:"translateX(-50%)",
                  width:"60%", height:2, background: isJackpotSkin ? "linear-gradient(90deg, transparent, rgba(255,215,0,0.5), rgba(255,248,200,0.7), rgba(255,215,0,0.5), transparent)" : `linear-gradient(90deg, transparent, ${game.color}88, transparent)`,
                  borderRadius:2 }} />
                {}
                {isJackpotSkin && (<>
                  <div style={{ position:"absolute", top:0, left:0, width:14, height:14, pointerEvents:"none",
                    borderTop:"1.5px solid rgba(255,215,0,0.4)", borderLeft:"1.5px solid rgba(255,215,0,0.4)", borderRadius:"12px 0 0 0" }} />
                  <div style={{ position:"absolute", top:0, right:0, width:14, height:14, pointerEvents:"none",
                    borderTop:"1.5px solid rgba(255,215,0,0.4)", borderRight:"1.5px solid rgba(255,215,0,0.4)", borderRadius:"0 12px 0 0" }} />
                  <div style={{ position:"absolute", bottom:0, left:0, width:14, height:14, pointerEvents:"none",
                    borderBottom:"1.5px solid rgba(255,215,0,0.25)", borderLeft:"1.5px solid rgba(255,215,0,0.25)", borderRadius:"0 0 0 12px" }} />
                  <div style={{ position:"absolute", bottom:0, right:0, width:14, height:14, pointerEvents:"none",
                    borderBottom:"1.5px solid rgba(255,215,0,0.25)", borderRight:"1.5px solid rgba(255,215,0,0.25)", borderRadius:"0 0 12px 0" }} />
                </>)}
                <div style={{ position:"absolute", bottom:0, right:0, width:40, height:40,
                  background:`radial-gradient(circle at 100% 100%, ${game.color}08 0%, transparent 70%)`,
                  pointerEvents:"none" }} />
                <div className="game-tile-icon" style={{ marginBottom:6,
                  animation:`lobbyIconFloat 3s ease-in-out ${idx * 0.4}s infinite` }}>
                  <game.Icon size={32} /></div>
                <div className="game-tile-name" style={{ fontSize:12, fontWeight:700, letterSpacing:1.5, textTransform:"uppercase",
                  color:T.text, fontFamily:T.serif, marginBottom:2,
                  textShadow:`0 0 20px ${game.color}15` }}>{game.name}</div>
                <div className="game-tile-desc" style={{ fontSize:9, color:T.dim, fontFamily:T.mono,
                  letterSpacing:0.5 }}>{game.description}</div>
                <div className="game-tile-rtp" style={{ fontSize:7, color:T.faint, fontFamily:T.mono,
                  letterSpacing:1, marginTop:2 }}>RTP {game.rtp}</div>
                {}
                {stats.gamesPlayed[game.id] > 0 && (() => {
                  const gw = (stats.winsPerGame || {})[game.id] || 0;
                  const gl = (stats.lossesPerGame || {})[game.id] || 0;
                  const profit = (stats.profitPerGame || {})[game.id] || 0;
                  const rh = (stats.resultHistory || {})[game.id] || [];
                  return (
                    <div style={{ marginTop:6, display:"flex", flexDirection:"column", alignItems:"center", gap:3, width:"100%" }}>
                      {rh.length >= 3 && <Sparkline results={rh} />}
                      <div style={{ fontSize:8, color:"#4a4a60", fontFamily:T.mono, display:"flex", gap:6 }}>
                        <span>{gw}W-{gl}L</span>
                        {profit !== 0 && <span style={{ color: profit > 0 ? T.green : "#ef4444" }}>
                          {profit > 0 ? "+" : ""}${profit.toLocaleString()}
                        </span>}
                      </div>
                    </div>
                  );
                })()}
              </button>
            ))}
          </div>
        </>)}
        {tab === "trophies" && (
          <div style={{ animation:"tabSlideIn 0.3s ease-out" }}>
            {}
            <div style={{ display:"flex", gap:0, marginBottom:14, borderRadius:8, overflow:"hidden",
              border:`1px solid ${activeTheme.accent}20` }}>
              {[{ id:"stats", label:"Stats" }, { id:"achievements", label:"Achievements" }].map(st => (
                <button key={st.id} onClick={() => { setFeatsSubTab(st.id); if (st.id === "achievements") setSeenAchCount(stats.achievements?.length || 0); }}
                  style={{ flex:1, padding:"8px 0", fontSize:10, fontWeight:700, letterSpacing:2,
                    textTransform:"uppercase", fontFamily:T.mono, cursor:"pointer", border:"none",
                    background: featsSubTab === st.id ? `${activeTheme.accent}20` : "transparent",
                    color: featsSubTab === st.id ? activeTheme.accent : T.dim,
                    borderBottom: featsSubTab === st.id ? `2px solid ${activeTheme.accent}` : "2px solid transparent",
                    transition:"all 0.2s" }}>
                  {st.label}
                  {st.id === "achievements" && (stats.achievements?.length || 0) > 0 && (
                    <span style={{ marginLeft:6, fontSize:9, opacity:0.6 }}>
                      {(stats.achievements || []).length}/{ACHIEVEMENTS.length}
                    </span>
                  )}
                </button>
              ))}
            </div>
            {}
            {featsSubTab === "achievements" && (<>
            {}
            <div onClick={() => setShowVipDetails(true)} style={{
              display:"flex", alignItems:"center", gap:12, padding:14, marginBottom:14,
              background:"rgba(255,255,255,0.03)", border:`1px solid ${vipTier.border}`,
              borderRadius:12, cursor:"pointer", transition:"all 0.2s",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = `${vipTier.color}12`; e.currentTarget.style.borderColor = vipTier.color + "66"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = vipTier.border; }}>
              <span style={{ fontSize:32 }}>{vipTier.icon}</span>
              <div style={{ flex:1 }}>
                <div style={{
                  fontSize:14, fontWeight:700, letterSpacing:3, fontFamily:T.mono,
                  color:vipTier.color, textTransform:"uppercase",
                }}>{vipTier.label} VIP</div>
                {(() => {
                  const next = getNextVipTier(vipPoints, achCount);
                  if (!next) return <div style={{ fontSize:9, color:T.dim, fontFamily:T.mono }}>MAX TIER REACHED</div>;
                  const progress = ((vipPoints - vipTier.minPoints) / (next.minPoints - vipTier.minPoints)) * 100;
                  return (<>
                    <div style={{ marginTop:4, height:4, borderRadius:2, background:"rgba(255,255,255,0.1)", overflow:"hidden" }}>
                      <div style={{ width:`${progress}%`, height:"100%", borderRadius:2, background:vipTier.color, transition:"width 0.5s" }} />
                    </div>
                    <div style={{ fontSize:9, color:T.dim, fontFamily:T.mono, marginTop:3 }}>
                      {vipPoints} / {next.minPoints.toLocaleString()} pts to {next.icon} {next.label} · Tap for details
                    </div>
                  </>);
                })()}
              </div>
            </div>
            {}
            <div style={{ display:"flex", gap:10, marginBottom:14 }}>
              <div style={{
                flex:1, textAlign:"center", padding:10,
                background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,150,0,0.15)", borderRadius:10,
              }}>
                <div style={{ ...S.label() }}>Current Streak</div>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:4, marginTop:4 }}>
                  {stats.winStreak >= 2 && <span style={{ fontSize:16 }}>▲</span>}
                  <span style={{ fontSize:22, fontWeight:700, fontFamily:T.mono,
                    color: stats.winStreak >= 5 ? "#ff4500" : stats.winStreak >= 2 ? "#ff9500" : T.muted
                  }}>{stats.winStreak}</span>
                </div>
              </div>
              <div style={{
                flex:1, textAlign:"center", padding:10,
                background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,150,0,0.15)", borderRadius:10,
              }}>
                <div style={{ ...S.label() }}>Best Streak</div>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:4, marginTop:4 }}>
                  <span style={{ fontSize:16 }}>⚡</span>
                  <span style={{ fontSize:22, fontWeight:700, fontFamily:T.mono, color:"#ff9500" }}>{stats.bestStreak}</span>
                </div>
              </div>
            </div>
            {}
            <div style={{
              padding:"12px 14px",
              background:"rgba(255,255,255,0.02)", border:`1px solid ${activeTheme.accent}18`, borderRadius:10,
            }}>
              <div style={{ ...S.label(), marginBottom:10 }}>
                Achievements ({(stats.achievements || []).length}/{ACHIEVEMENTS.length})
              </div>
              {[
                { name:"First Steps", color:"#22c55e" },
                { name:"Streaks",     color:"#f59e0b" },
                { name:"Bankroll",    color:"#3b82f6" },
                { name:"Big Wins",    color:"#f1c40f" },
                { name:"High Roller", color:"#a855f7" },
                { name:"Wagering",    color:"#ef4444" },
                { name:"Grind",       color:"#8b5cf6" },
                { name:"VIP",         color:"#d4af37" },
                { name:"Vault & Debt",color:"#10b981" },
                { name:"Misc",        color:"#6b7280" },
              ].map(grp => {
                const grpAchs = ACHIEVEMENTS.filter(a => a.group === grp.name);
                if (grpAchs.length === 0) return null;
                const unlockedCount = grpAchs.filter(a => (stats.achievements || []).includes(a.id)).length;
                return (
                  <div key={grp.name} style={{ marginBottom:10 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:5 }}>
                      <span style={{ fontSize:9, fontWeight:700, letterSpacing:2, textTransform:"uppercase",
                        fontFamily:T.mono, color:grp.color }}>{grp.name}</span>
                      <span style={{ fontSize:8, fontFamily:T.mono, color:T.dim, marginLeft:"auto" }}>{unlockedCount}/{grpAchs.length}</span>
                    </div>
                    <div className="ach-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
                      {grpAchs.map(a => {
                        const unlocked = (stats.achievements || []).includes(a.id);
                        return (
                          <div key={a.id} style={{
                            display:"flex", alignItems:"center", gap:8, padding:"6px 8px",
                            borderRadius:8, transition:"all 0.2s",
                            background: unlocked ? `${grp.color}10` : "rgba(0,0,0,0.15)",
                            border: unlocked ? `1px solid ${grp.color}33` : "1px solid rgba(255,255,255,0.04)",
                            opacity: unlocked ? 1 : 0.4,
                          }}>
                            <span style={{ fontSize:18, filter: unlocked ? "none" : "grayscale(1)" }}>{a.icon}</span>
                            <div>
                              <div style={{ fontSize:10, fontWeight:700, color: unlocked ? T.text : T.dim,
                                fontFamily:T.serif, letterSpacing:0.5 }}>{a.name}</div>
                              <div style={{ fontSize:8, color: unlocked ? T.muted : T.dim,
                                fontFamily:T.mono }}>{a.desc}</div>
                              <div style={{ fontSize:8, color: unlocked ? grp.color : T.dim,
                                fontFamily:T.mono, marginTop:2, opacity:0.8 }}>+{(ACH_POINTS[a.id]||0).toLocaleString()} pts</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            </>)}
            {}
            {featsSubTab === "stats" && (<>
            {}
            <div>
            <div className="stat-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
              <StatCard label="Peak Bankroll" value={`$${stats.peakBankroll.toLocaleString()}`}
                color={stats.peakBankroll > 1000 ? "#22c55e" : activeTheme.accent} accent={activeTheme.accent} />
              <StatCard label="Biggest Win" value={stats.biggestWin > 0 ? `+$${stats.biggestWin.toLocaleString()}` : "—"}
                color="#f1c40f" sub={stats.biggestWinGame ? `in ${GAMES.find(g=>g.id===stats.biggestWinGame)?.name || stats.biggestWinGame}` : ""} accent={activeTheme.accent} />
              <StatCard label="Total Wagered" value={`${stats.totalWagered.toLocaleString()}`} color="#8a8070" accent={activeTheme.accent} />
              <StatCard label="Net Profit" value={`${stats.netProfit >= 0 ? "+" : ""}$${stats.netProfit.toLocaleString()}`}
                color={stats.netProfit >= 0 ? "#22c55e" : "#ef4444"} accent={activeTheme.accent} />
              <StatCard label="Sessions" value={totalGames} color="#3b82f6"
                sub={totalGames > 0 ? `fav: ${mostPlayedName}` : ""} accent={activeTheme.accent} />
              <StatCard label="Record" value={(() => {
                const tw = Object.values(stats.winsPerGame || {}).reduce((a,b)=>a+b,0);
                const tl = Object.values(stats.lossesPerGame || {}).reduce((a,b)=>a+b,0);
                return (tw+tl) > 0 ? `${tw}W-${tl}L` : "—";
              })()} color="#8b5cf6"
                sub={stats.netProfit !== 0 ? `${stats.netProfit >= 0 ? "+" : ""}${stats.netProfit.toLocaleString()} net` : ""} accent={activeTheme.accent} />
              <StatCard label="Rebuys" value={stats.rebuys}
                color={stats.rebuys > 5 ? "#ef4444" : stats.rebuys > 0 ? "#f97316" : "#22c55e"}
                sub={stats.rebuys > 0 ? `$${(stats.totalRebuySpend || 0).toLocaleString()} rebought` : "clean run!"} accent={activeTheme.accent} />
              {(stats.totalVaulted || 0) > 0 && <StatCard label="Total Vaulted" value={`$${(stats.totalVaulted||0).toLocaleString()}`} color="#d4af37"
                sub={(stats.totalInterestEarned||0) > 0 ? `+$${(stats.totalInterestEarned||0).toLocaleString()} interest` : ""}  accent={activeTheme.accent} />}
              {(stats.totalDebtIncurred || 0) > 0 && <StatCard label="Debt Incurred" value={`$${(stats.totalDebtIncurred||0).toLocaleString()}`} color="#ef4444"
                sub={(stats.totalDebt||0) > 0 ? `$${(stats.totalDebt||0).toLocaleString()} remaining` : "fully repaid!"} accent={activeTheme.accent} />}
              {(stats.vaultLosses || 0) > 0 && <StatCard label="Vault Burned" value={`$${(stats.vaultLosses||0).toLocaleString()}`} color="#ef4444"
                sub="35% bust penalties" accent={activeTheme.accent} />}
              <StatCard label="Luck Rating" value={(() => {
                if (stats.totalWagered < 100) return "—";
                const expectedReturn = stats.totalWagered * 0.96;
                const actualReturn = stats.totalWagered + stats.netProfit;
                const luck = Math.round((actualReturn / expectedReturn) * 100);
                return luck >= 110 ? `▲ ${luck}%` : luck >= 100 ? `✦ ${luck}%` : luck >= 90 ? `${luck}%` : `✗ ${luck}%`;
              })()} color={stats.netProfit >= 0 ? "#f1c40f" : "#8a8070"}
                sub={stats.totalWagered >= 100 ? "vs expected return" : "play more to calculate"} accent={activeTheme.accent} />
            </div>
            {}
            <div style={{ background:"rgba(255,255,255,0.02)", border:`1px solid ${activeTheme.accent}18`,
              borderRadius:12, padding:"14px 16px" }}>
              <div style={{ fontSize:9, letterSpacing:2, textTransform:"uppercase", color:T.dim,
                fontFamily:T.mono, marginBottom:10, textAlign:"center" }}>Per Game Breakdown</div>
              {}
              {(() => {
                const gameWRs = GAMES.map(g => {
                  const gw = (stats.winsPerGame || {})[g.id] || 0;
                  const gl = (stats.lossesPerGame || {})[g.id] || 0;
                  const total = gw + gl;
                  return { ...g, wr: total >= 5 ? gw / total : -1, total };
                }).filter(g => g.wr >= 0);
                if (gameWRs.length < 2) return null;
                const hottest = gameWRs.reduce((a, b) => a.wr > b.wr ? a : b);
                const coldest = gameWRs.reduce((a, b) => a.wr < b.wr ? a : b);
                return (
                  <div style={{ display:"flex", gap:8, marginBottom:10, flexWrap:"wrap", justifyContent:"center" }}>
                    <div style={{ fontSize:9, fontFamily:T.mono, color:"#22c55e", padding:"3px 8px",
                      background:"rgba(34,197,94,0.08)", borderRadius:6, border:"1px solid rgba(34,197,94,0.15)" }}>
                      ▲ Hottest: {hottest.name} ({Math.round(hottest.wr * 100)}%)
                    </div>
                    <div style={{ fontSize:9, fontFamily:T.mono, color:"#3b82f6", padding:"3px 8px",
                      background:"rgba(59,130,246,0.08)", borderRadius:6, border:"1px solid rgba(59,130,246,0.15)" }}>
                      ▼ Coldest: {coldest.name} ({Math.round(coldest.wr * 100)}%)
                    </div>
                  </div>
                );
              })()}
              {GAMES.map(game => {
                const played = stats.gamesPlayed[game.id] || 0;
                const best = stats.biggestWinPerGame[game.id] || 0;
                const gw = (stats.winsPerGame || {})[game.id] || 0;
                const gl = (stats.lossesPerGame || {})[game.id] || 0;
                const wr = (gw + gl) > 0 ? Math.round(gw / (gw + gl) * 100) : 0;
                return (
                  <div key={game.id} className="breakdown-row" style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                    padding:"6px 0", borderBottom:"1px solid rgba(255,255,255,0.03)" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, minWidth:0, flex:"0 0 auto" }}>
                      <div style={{ width:6, height:6, borderRadius:"50%", background:game.color, opacity:played > 0 ? 1 : 0.3 }} />
                      <span style={{ fontSize:11, fontWeight:600, color: played > 0 ? "#e8e0d0" : "#4a4040",
                        letterSpacing:1 }}>{game.name}</span>
                    </div>
                    <div className="breakdown-stats" style={{ display:"flex", gap:8, fontFamily:T.mono, fontSize:9, alignItems:"center", flexWrap:"wrap", justifyContent:"flex-end" }}>
                      {played > 0 && (gw > 0 || gl > 0) && (
                        <span style={{ color: wr >= 50 ? "#22c55e" : wr > 0 ? "#f97316" : "#4a4040" }}>
                          {gw}W-{gl}L
                        </span>
                      )}
                      <span style={{ color:"#6a6050" }}>{played} sess</span>
                      {best > 0 && <span style={{ color:T.green }}>+${best.toLocaleString()}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
            {}
            <SessionTracker chips={chips} sessionStart={sessionStart} sessionRounds={sessionRounds}
              sessionChipsStart={sessionChipsStart} stats={stats} accent={activeTheme.accent} />
            {}
            <div style={{ textAlign:"center", marginTop:16 }}>
              {!confirmReset ? (
                <button onClick={() => setConfirmReset(true)}
                  style={{ padding:"8px 20px", fontSize:10, fontWeight:600, letterSpacing:2, textTransform:"uppercase",
                    fontFamily:T.mono,
                    background:"transparent", border:"1px solid rgba(239,68,68,0.3)", borderRadius:6,
                    color:T.red, cursor:"pointer", transition:"all 0.2s", opacity:0.6 }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.background = "rgba(239,68,68,0.1)"; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = "0.6"; e.currentTarget.style.background = "transparent"; }}>
                  Reset Progress
                </button>
              ) : (
                <div style={{ display:"flex", gap:8, justifyContent:"center", alignItems:"center", animation:"fadeIn 0.2s ease" }}>
                  <span style={{ fontSize:10, color:T.red, fontFamily:T.mono }}>Are you sure?</span>
                  <button onClick={() => { onResetStats(); setConfirmReset(false); }}
                    style={{ padding:"6px 16px", fontSize:10, fontWeight:700, letterSpacing:1,
                      fontFamily:T.mono, background:"rgba(239,68,68,0.2)",
                      border:"1px solid #ef4444", borderRadius:4, color:T.red, cursor:"pointer" }}>Yes</button>
                  <button onClick={() => setConfirmReset(false)}
                    style={{ padding:"6px 16px", fontSize:10, fontWeight:700, letterSpacing:1,
                      fontFamily:T.mono, background:"rgba(255,255,255,0.05)",
                      border:"1px solid rgba(255,255,255,0.2)", borderRadius:4, color:T.muted, cursor:"pointer" }}>Cancel</button>
                </div>
              )}
            </div>
            {}
            <div style={{ display:"none" }}>
              {false ? (
                <span />
              ) : !adminAuth ? (
                <div style={{ animation:"fadeIn 0.3s ease", background:"rgba(0,0,0,0.2)", borderRadius:10,
                  border:"1px solid rgba(255,255,255,0.08)", padding:16 }}>
                  <div style={{ fontSize:10, fontFamily:T.mono, color:T.muted, marginBottom:8, letterSpacing:1 }}>ADMIN PASSWORD</div>
                  <div style={{ display:"flex", gap:8, justifyContent:"center", alignItems:"center" }}>
                    <input type="password" value={adminPw} onChange={e => { setAdminPw(e.target.value); setAdminPwError(false); }}
                      onKeyDown={e => { if (e.key === "Enter") {
                        if (adminPw === "Ivy") { setAdminAuth(true); setAdminPwError(false); }
                        else setAdminPwError(true);
                      }}}
                      style={{ padding:"6px 12px", fontSize:12, fontFamily:T.mono, background:"rgba(0,0,0,0.3)",
                        border: adminPwError ? "1px solid #ef4444" : "1px solid rgba(255,255,255,0.15)",
                        borderRadius:6, color:T.text, width:120, outline:"none" }}
                      placeholder="Password" autoFocus />
                    <button onClick={() => {
                      if (adminPw === "Ivy") { setAdminAuth(true); setAdminPwError(false); }
                      else setAdminPwError(true);
                    }}
                      style={{ padding:"6px 14px", fontSize:10, fontWeight:700, fontFamily:T.mono,
                        background:`${activeTheme.accent}25`, border:`1px solid ${activeTheme.accent}50`,
                        borderRadius:6, color:activeTheme.accent, cursor:"pointer" }}>Enter</button>
                    <button onClick={() => { setShowAdmin(false); setAdminPw(""); setAdminPwError(false); }}
                      style={{ padding:"6px 10px", fontSize:10, fontFamily:T.mono, background:"transparent",
                        border:"1px solid rgba(255,255,255,0.1)", borderRadius:6, color:T.muted, cursor:"pointer" }}>✕</button>
                  </div>
                  {adminPwError && <div style={{ fontSize:9, color:"#ef4444", fontFamily:T.mono, marginTop:6 }}>Incorrect password</div>}
                </div>
              ) : (
                <div style={{ animation:"fadeIn 0.3s ease", background:"rgba(0,0,0,0.25)", borderRadius:12,
                  border:`1px solid ${activeTheme.accent}28`, padding:16, textAlign:"left" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                    <div style={{ fontSize:10, fontFamily:T.mono, color:activeTheme.accent, letterSpacing:2, fontWeight:700 }}>◈ ADMIN CONTROLS</div>
                    <button onClick={() => { setShowAdmin(false); setAdminAuth(false); setAdminPw(""); }}
                      style={{ padding:"4px 10px", fontSize:9, fontFamily:T.mono, background:"transparent",
                        border:"1px solid rgba(255,255,255,0.1)", borderRadius:4, color:T.muted, cursor:"pointer" }}>Close</button>
                  </div>
                  {}
                  <div style={{ marginBottom:16, padding:10, background:"rgba(255,255,255,0.03)", borderRadius:8,
                    border:"1px solid rgba(255,255,255,0.06)" }}>
                    <div style={{ fontSize:9, fontFamily:T.mono, color:T.muted, marginBottom:8, letterSpacing:1 }}>ADD CHIPS</div>
                    <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:8 }}>
                      {[1000, 10000, 100000, 1000000].map(amount => (
                        <button key={amount} onClick={() => onAdminSetChips(prev => prev + amount)}
                          style={{ padding:"5px 10px", fontSize:10, fontWeight:600, fontFamily:T.mono,
                            background:"rgba(34,197,94,0.12)", border:"1px solid rgba(34,197,94,0.3)",
                            borderRadius:5, color:"#22c55e", cursor:"pointer" }}>
                          +${amount >= 1000000 ? `${amount/1000000}M` : amount >= 1000 ? `${amount/1000}K` : amount}
                        </button>
                      ))}
                    </div>
                    <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                      <input type="number" value={adminChipAdd} onChange={e => setAdminChipAdd(e.target.value)}
                        placeholder="Custom amount"
                        style={{ padding:"5px 10px", fontSize:11, fontFamily:T.mono, background:"rgba(0,0,0,0.3)",
                          border:"1px solid rgba(255,255,255,0.12)", borderRadius:5, color:T.text, width:120, outline:"none" }} />
                      <button onClick={() => {
                        const amt = parseInt(adminChipAdd);
                        if (amt && amt > 0) { onAdminSetChips(prev => prev + amt); setAdminChipAdd(""); }
                      }}
                        style={{ padding:"5px 12px", fontSize:10, fontWeight:600, fontFamily:T.mono,
                          background:"rgba(34,197,94,0.15)", border:"1px solid rgba(34,197,94,0.3)",
                          borderRadius:5, color:"#22c55e", cursor:"pointer" }}>Add</button>
                    </div>
                  </div>
                  {}
                  <div style={{ padding:10, background:"rgba(255,255,255,0.03)", borderRadius:8,
                    border:"1px solid rgba(255,255,255,0.06)" }}>
                    <div style={{ fontSize:9, fontFamily:T.mono, color:T.muted, marginBottom:8, letterSpacing:1 }}>
                      ACHIEVEMENTS ({(stats.achievements || []).length}/{ACHIEVEMENTS.length})
                      <button onClick={() => {
                        const allIds = ACHIEVEMENTS.map(a => a.id);
                        const hasAll = allIds.every(id => (stats.achievements || []).includes(id));
                        if (hasAll) {
                          onAdminSetStats(s => ({ ...s, achievements: [] }));
                        } else {
                          onAdminSetStats(s => ({ ...s, achievements: [...allIds] }));
                        }
                      }}
                        style={{ marginLeft:8, padding:"2px 8px", fontSize:8, fontFamily:T.mono,
                          background:`${activeTheme.accent}1a`, border:`1px solid ${activeTheme.accent}35`,
                          borderRadius:3, color:activeTheme.accent, cursor:"pointer" }}>
                        {ACHIEVEMENTS.every(a => (stats.achievements || []).includes(a.id)) ? "Clear All" : "Unlock All"}
                      </button>
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:4, maxHeight:300, overflowY:"auto" }}>
                      {ACHIEVEMENTS.map(a => {
                        const unlocked = (stats.achievements || []).includes(a.id);
                        return (
                          <button key={a.id} onClick={() => {
                            onAdminSetStats(s => {
                              const achs = [...(s.achievements || [])];
                              if (unlocked) {
                                return { ...s, achievements: achs.filter(id => id !== a.id) };
                              } else {
                                return { ...s, achievements: [...achs, a.id] };
                              }
                            });
                          }}
                            style={{
                              display:"flex", alignItems:"center", gap:6, padding:"5px 6px",
                              borderRadius:6, cursor:"pointer", textAlign:"left",
                              background: unlocked ? "rgba(34,197,94,0.1)" : "rgba(0,0,0,0.2)",
                              border: unlocked ? "1px solid rgba(34,197,94,0.25)" : "1px solid rgba(255,255,255,0.06)",
                              transition:"all 0.15s",
                            }}>
                            <span style={{ fontSize:14, filter: unlocked ? "none" : "grayscale(1)", flexShrink:0 }}>{a.icon}</span>
                            <div style={{ minWidth:0 }}>
                              <div style={{ fontSize:9, fontWeight:700, color: unlocked ? "#22c55e" : T.dim,
                                fontFamily:T.mono, letterSpacing:0.3 }}>{a.name}</div>
                              <div style={{ fontSize:7, color: unlocked ? T.muted : T.dim,
                                fontFamily:T.mono }}>{ACH_POINTS[a.id] || 0} pts</div>
                            </div>
                            <span style={{ marginLeft:"auto", fontSize:10, flexShrink:0 }}>{unlocked ? "✅" : "⬜"}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  {}
                  <div style={{ marginTop:16, padding:10, background:"rgba(255,255,255,0.03)", borderRadius:8,
                    border:"1px solid rgba(255,255,255,0.06)" }}>
                    <div style={{ fontSize:9, fontFamily:T.mono, color:T.muted, marginBottom:8, letterSpacing:1 }}>OVERLAY PREVIEWS</div>
                    <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                      {[
                        { label:"BIG WIN", type:"big", color:"#f1c40f" },
                        { label:"MEGA WIN", type:"mega", color:"#ff6b6b" },
                        { label:"EPIC WIN", type:"epic", color:"#ff4500" },
                        { label:"JACKPOT!!!", type:"jackpot", color:"#ffd700" },
                      ].map(t => (
                        <button key={t.type} onClick={() => {
                          setTestOverlay(t.type);
                          if (t.type === "jackpot") {
                            setTestConfetti({type:"fireworks",key:Date.now()});
                            setTestCoinRain("extra_heavy");
                            setTestWash("jackpot");
                          } else if (t.type === "epic") {
                            setTestConfetti({type:"fireworks",key:Date.now()});
                            setTestCoinRain("heavy");
                            setTestEruption(true);
                            setTestWash("epic");
                          } else if (t.type === "mega") {
                            setTestConfetti({type:"confetti",key:Date.now()});
                            setTestCoinRain("medium");
                            setTestEruption(true);
                            setTestWash("mega");
                          } else {
                            setTestCoinRain("light");
                            setTestWash("big");
                          }
                        }}
                          style={{ padding:"5px 10px", fontSize:9, fontWeight:700, fontFamily:T.mono,
                            background:`${t.color}15`, border:`1px solid ${t.color}40`,
                            borderRadius:5, color:t.color, cursor:"pointer" }}>
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {}
                  <div style={{ marginTop:16, padding:10, background:"rgba(255,255,255,0.03)", borderRadius:8,
                    border: forceJackpot ? "1px solid rgba(255,69,0,0.4)" : "1px solid rgba(255,255,255,0.06)" }}>
                    <div style={{ fontSize:9, fontFamily:T.mono, color:T.muted, marginBottom:8, letterSpacing:1 }}>FORCE NEXT JACKPOT</div>
                    <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                      <button onClick={() => setForceJackpot(!forceJackpot)}
                        style={{ padding:"6px 14px", fontSize:10, fontWeight:700, fontFamily:T.mono,
                          background: forceJackpot ? "rgba(255,69,0,0.2)" : "rgba(255,255,255,0.05)",
                          border: forceJackpot ? "1px solid #ff4500" : "1px solid rgba(255,255,255,0.15)",
                          borderRadius:5, color: forceJackpot ? "#ff4500" : T.muted, cursor:"pointer",
                          transition:"all 0.2s" }}>
                        {forceJackpot ? "★ ARMED — Next scratch = JACKPOT" : "Arm Jackpot"}
                      </button>
                    </div>
                    {forceJackpot && (
                      <div style={{ fontSize:8, color:"#ff6b35", fontFamily:T.mono, marginTop:6 }}>
                        Go to Scratch Cards → buy any ticket → guaranteed jackpot with 2-3 matches + 10,000× multiplier
                      </div>
                    )}
                  </div>
                  {}
                  <div style={{ marginTop:16, padding:10, background:"rgba(255,255,255,0.03)", borderRadius:8,
                    border:"1px solid rgba(255,255,255,0.06)" }}>
                    <div style={{ fontSize:9, fontFamily:T.mono, color:T.muted, marginBottom:8, letterSpacing:1 }}>INDIVIDUAL EFFECTS</div>
                    <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                      {[
                        { label:"● Coins Light", fn:() => { setTestCoinRain("light"); setTimeout(()=>setTestCoinRain(null), 2000); }},
                        { label:"● Coins Heavy", fn:() => { setTestCoinRain("heavy"); setTimeout(()=>setTestCoinRain(null), 3000); }},
                        { label:"● Coins X-Heavy", fn:() => { setTestCoinRain("extra_heavy"); setTimeout(()=>setTestCoinRain(null), 5000); }},
                        { label:"✦ Confetti", fn:() => { setTestConfetti({type:"confetti",key:Date.now()}); setTimeout(()=>setTestConfetti(null), 3000); }},
                        { label:"✦ Fireworks", fn:() => { setTestConfetti({type:"fireworks",key:Date.now()}); setTimeout(()=>setTestConfetti(null), 4000); }},
                        { label:"▲ Eruption", fn:() => { setTestEruption(true); setTimeout(()=>setTestEruption(false), 1200); }},
                        { label:"✦ Wash Gold", fn:() => { setTestWash("gold"); setTimeout(()=>setTestWash(null), 500); }},
                        { label:"✦ Wash Big", fn:() => { setTestWash("big"); setTimeout(()=>setTestWash(null), 2000); }},
                        { label:"✦ Wash Mega", fn:() => { setTestWash("mega"); setTimeout(()=>setTestWash(null), 3000); }},
                        { label:"✦ Wash Epic", fn:() => { setTestWash("epic"); setTimeout(()=>setTestWash(null), 3000); }},
                        { label:"✦ Wash Jackpot", fn:() => { setTestWash("jackpot"); setTimeout(()=>setTestWash(null), 4000); }},
                        { label:"~ Shake Light", fn:() => { setTestShake("light"); setTimeout(()=>setTestShake(null), 400); }},
                        { label:"~ Shake Heavy", fn:() => { setTestShake("heavy"); setTimeout(()=>setTestShake(null), 600); }},
                        { label:"~ Shake Epic", fn:() => { setTestShake("epic"); setTimeout(()=>setTestShake(null), 800); }},
                      ].map((e, i) => (
                        <button key={i} onClick={e.fn}
                          style={{ padding:"4px 8px", fontSize:8, fontWeight:600, fontFamily:T.mono,
                            background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)",
                            borderRadius:4, color:T.muted, cursor:"pointer" }}>
                          {e.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            </div>
            </>)}
          </div>
        )}
        {}
        {tab === "shop" && (
          <div style={{ animation:"tabSlideIn 0.3s ease-out" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
              <div style={{ fontSize:14, fontWeight:700, letterSpacing:3, textTransform:"uppercase", fontFamily:T.serif, color:activeTheme.accent }}>Power-Up Shop</div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:12, fontFamily:T.mono, color: chips > 500 ? activeTheme.accent : "#e74c3c" }}>
                  ${chips.toLocaleString()}
                </div>
                <div style={{ fontSize:8, fontFamily:T.mono, color:T.dim }}>
                  Prices scale with {vipTier.label} tier (${vipTier.rebuy.toLocaleString()} base)
                </div>
              </div>
            </div>
            {}
            {SHOP_CATEGORIES.map(cat => {
              const items = SHOP_ITEMS.filter(i => i.cat === cat.id);
              return (
                <div key={cat.id} style={{ marginBottom:16 }}>
                  <div style={{ fontSize:11, letterSpacing:2, textTransform:"uppercase", color:T.muted, fontFamily:T.serif,
                    marginBottom:8, display:"flex", alignItems:"center", gap:6 }}>
                    <span>{cat.icon}</span>{cat.name}
                    {cat.id === "mystery" && (
                      <span onClick={() => setShowMysteryOdds(showMysteryOdds ? null : 1)} style={{
                        fontSize:8, fontFamily:T.mono, color:activeTheme.accent, cursor:"pointer",
                        marginLeft:"auto", letterSpacing:1, opacity:0.7 }}>
                        {showMysteryOdds ? "HIDE ODDS" : "VIEW ODDS"}
                      </span>
                    )}
                  </div>
                  {}
                  {cat.id === "mystery" && showMysteryOdds && (
                    <div style={{ marginBottom:10, padding:"10px 12px", borderRadius:8,
                      background:`${activeTheme.accent}06`, border:`1px solid ${activeTheme.accent}15` }}>
                      <div style={{ display:"flex", gap:4, marginBottom:8 }}>
                        {[{t:1,l:"Small"},{t:2,l:"Large"},{t:3,l:"Legendary"}].map(b => (
                          <button key={b.t} onClick={() => setShowMysteryOdds(b.t)} style={{
                            flex:1, padding:"4px 0", fontSize:9, fontWeight:700, fontFamily:T.mono,
                            background: showMysteryOdds === b.t ? `${activeTheme.accent}20` : "transparent",
                            border: showMysteryOdds === b.t ? `1px solid ${activeTheme.accent}40` : "1px solid transparent",
                            borderRadius:4, color: showMysteryOdds === b.t ? activeTheme.accent : T.dim,
                            cursor:"pointer", letterSpacing:1 }}>{b.l}</button>
                        ))}
                      </div>
                      {(() => {
                        const rates = MYSTERY_DROP_RATES[showMysteryOdds] || MYSTERY_DROP_RATES[1];
                        const total = Object.values(rates).reduce((a,b) => a+b, 0);
                        const rarities = ["common","uncommon","rare","epic","legendary","mythic"];
                        const labels = { common:"Common", uncommon:"Uncommon", rare:"Rare", epic:"Epic", legendary:"Legendary", mythic:"Mythic" };
                        return (
                          <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
                            {rarities.map(r => {
                              const pct = Math.round((rates[r] || 0) / total * 100);
                              if (pct === 0) return null;
                              const col = RARITY_COLORS[r] || T.dim;
                              return (
                                <div key={r} style={{ display:"flex", alignItems:"center", gap:8 }}>
                                  <div style={{ width:60, fontSize:9, fontFamily:T.mono, color:col, fontWeight:700, letterSpacing:1 }}>{labels[r]}</div>
                                  <div style={{ flex:1, height:6, borderRadius:3, background:"rgba(255,255,255,0.06)", overflow:"hidden" }}>
                                    <div style={{ width:`${pct}%`, height:"100%", borderRadius:3, background:col, transition:"width 0.3s" }} />
                                  </div>
                                  <div style={{ width:28, fontSize:9, fontFamily:T.mono, color:T.dim, textAlign:"right" }}>{pct}%</div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
                    {items.map(item => {
                      const rebuyFloor = vipTier.rebuy;
                      const itemPrice = Math.floor(rebuyFloor * item.costMulti);
                      const canAfford = chips - itemPrice >= 1;
                      return (
                        <button key={item.id} onClick={() => setSelectedShopItem({ ...item, price: itemPrice })}
                        style={{
                          padding:"10px 8px", borderRadius:8, textAlign:"center", cursor:"pointer",
                          background:`${activeTheme.accent}08`,
                          border:`1px solid ${activeTheme.accent}20`,
                          transition:"all 0.2s", position:"relative", overflow:"hidden",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background=`${activeTheme.accent}15`; e.currentTarget.style.borderColor=`${activeTheme.accent}40`; e.currentTarget.style.transform="translateY(-2px)"; }}
                        onMouseLeave={e => { e.currentTarget.style.background=`${activeTheme.accent}08`; e.currentTarget.style.borderColor=`${activeTheme.accent}20`; e.currentTarget.style.transform="translateY(0)"; }}>
                          {}
                          {item.rarity !== "mystery" && (
                            <div style={{ position:"absolute", top:0, left:0, right:0, height:2,
                              background:RARITY_COLORS[item.rarity] || T.dim, borderRadius:"8px 8px 0 0" }} />
                          )}
                          <div style={{ fontSize:20, marginBottom:4 }}>{item.icon}</div>
                          <div style={{ fontSize:10, fontWeight:700, fontFamily:T.serif, color:T.text, letterSpacing:1 }}>{item.tier}</div>
                          {item.rarity !== "mystery" && (
                            <div style={{ fontSize:7, fontFamily:T.mono, color:RARITY_COLORS[item.rarity] || T.dim,
                              letterSpacing:1, textTransform:"uppercase", marginTop:1 }}>{item.rarity}</div>
                          )}
                          <div style={{ fontSize:8, color:T.dim, fontFamily:T.mono, marginTop:2, lineHeight:1.3 }}>{item.desc}</div>
                          <div style={{ marginTop:6, fontSize:11, fontWeight:700, fontFamily:T.mono,
                            color: canAfford ? activeTheme.accent : "#555" }}>
                            ${itemPrice.toLocaleString()}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {}
        {selectedShopItem && (() => {
          const si = selectedShopItem;
          const isMystery = si.effect.type === "mystery";
          const rarityCol = RARITY_COLORS[si.rarity] || T.dim;
          const bulkOptions = isMystery ? [1, 3, 5, 10] : [1, 3, 5];
          const grantItems = (qty) => {
            for (let q = 0; q < qty; q++) {
              if (isMystery) {
                const boxTier = si.effect.tier;
                const rates = MYSTERY_DROP_RATES[boxTier] || MYSTERY_DROP_RATES[1];
                const totalWeight = Object.values(rates).reduce((a,b) => a+b, 0);
                let roll = Math.random() * totalWeight;
                let selectedRarity = "common";
                for (const [rarity, weight] of Object.entries(rates)) {
                  roll -= weight;
                  if (roll <= 0) { selectedRarity = rarity; break; }
                }
                const pool = SHOP_ITEMS.filter(s => s.rarity === selectedRarity);
                let rewardItem = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : null;
                if (!rewardItem) {
                  const fb = ["legendary","epic","rare","uncommon","common"];
                  for (const r of fb) { const p = SHOP_ITEMS.filter(s => s.rarity === r); if (p.length > 0) { rewardItem = p[Math.floor(Math.random() * p.length)]; break; } }
                }
                if (rewardItem) {
                  const pu = { itemId: rewardItem.id, ...rewardItem.effect,
                    remaining: rewardItem.effect.rounds || rewardItem.effect.wins || rewardItem.effect.bets || rewardItem.effect.uses || 1 };
                  setSettings(s => ({ ...s, powerUps: [...(s.powerUps || []), pu] }));
                }
              } else {
                const pu = { itemId: si.id, ...si.effect,
                  remaining: si.effect.rounds || si.effect.wins || si.effect.bets || si.effect.uses || 1 };
                setSettings(s => ({ ...s, powerUps: [...(s.powerUps || []), pu] }));
              }
            }
          };
          const doPurchase = (qty) => {
            const totalCost = si.price * qty;
            if (chips - totalCost < 1) return;
            onAdminSetChips(c => c - totalCost);
            grantItems(qty);
            setSelectedShopItem(null);
          };
          const doVaultPurchase = (qty) => {
            const totalCost = si.price * qty;
            if ((stats.vault || 0) < totalCost) return;
            onAdminSetStats(s => ({ ...s, vault: (s.vault || 0) - totalCost }));
            grantItems(qty);
            setSelectedShopItem(null);
          };
          return (
            <div onClick={() => setSelectedShopItem(null)} style={{
              position:"fixed", inset:0, zIndex:10000, background:"rgba(0,0,0,0.7)", backdropFilter:"blur(4px)",
              display:"flex", alignItems:"center", justifyContent:"center", padding:20,
              animation:"fadeIn 0.2s ease" }}>
              <div onClick={e => e.stopPropagation()} style={{
                width:"100%", maxWidth:340, borderRadius:14, overflow:"hidden",
                background:"linear-gradient(180deg, #1a1510 0%, #0e0a08 100%)",
                border:`1px solid ${rarityCol}30`, boxShadow:`0 20px 60px rgba(0,0,0,0.5), 0 0 30px ${rarityCol}10` }}>
                {}
                <div style={{ height:3, background:rarityCol }} />
                <div style={{ padding:"20px 24px" }}>
                  {}
                  <div style={{ textAlign:"center", marginBottom:16 }}>
                    <div style={{ fontSize:32, marginBottom:6 }}>{si.icon}</div>
                    <div style={{ fontSize:16, fontWeight:700, fontFamily:T.serif, color:T.text, letterSpacing:2 }}>{si.name}</div>
                    <div style={{ fontSize:11, fontFamily:T.mono, color:rarityCol, letterSpacing:2, textTransform:"uppercase", marginTop:4 }}>{si.rarity}</div>
                    <div style={{ fontSize:13, fontWeight:700, color:T.text, marginTop:4 }}>{si.tier}</div>
                  </div>
                  {}
                  <div style={{ fontSize:11, color:T.muted, fontFamily:T.mono, textAlign:"center", marginBottom:16, lineHeight:1.5 }}>
                    {si.desc}
                  </div>
                  {}
                  <div style={{ textAlign:"center", marginBottom:16 }}>
                    <span style={{ fontSize:10, color:T.dim, fontFamily:T.mono }}>Unit price: </span>
                    <span style={{ fontSize:14, fontWeight:700, color:activeTheme.accent, fontFamily:T.mono }}>${si.price.toLocaleString()}</span>
                  </div>
                  {}
                  <div style={{ fontSize:9, fontFamily:T.mono, color:T.dim, letterSpacing:2, textTransform:"uppercase", textAlign:"center", marginBottom:8 }}>Purchase With</div>
                  {(stats.vault || 0) > 0 && (
                    <div style={{ display:"flex", gap:6, marginBottom:6 }}>
                      <div style={{ flex:1, fontSize:12, fontWeight:700, color:T.text, fontFamily:T.serif, letterSpacing:1, textAlign:"center" }}>Bankroll</div>
                      <div style={{ flex:1, fontSize:12, fontWeight:700, color:"#d4af37", fontFamily:T.serif, letterSpacing:1, textAlign:"center" }}>◈ Vault</div>
                    </div>
                  )}
                  <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                    {bulkOptions.map(qty => {
                      const totalCost = si.price * qty;
                      const canBuy = chips - totalCost >= 1;
                      const canVault = (stats.vault || 0) >= totalCost;
                      return (
                        <div key={qty} style={{ display:"flex", gap:6 }}>
                          <button onClick={() => canBuy && doPurchase(qty)}
                            style={{
                              flex:1, padding:"10px 12px", borderRadius:8, cursor: canBuy ? "pointer" : "not-allowed",
                              background: canBuy ? `${activeTheme.accent}15` : "rgba(60,60,60,0.1)",
                              border: canBuy ? `1px solid ${activeTheme.accent}30` : "1px solid rgba(60,60,60,0.15)",
                              display:"flex", alignItems:"center", justifyContent:"center",
                              transition:"all 0.15s",
                            }}
                            onMouseEnter={e => { if(canBuy) { e.currentTarget.style.background=`${activeTheme.accent}25`; e.currentTarget.style.borderColor=`${activeTheme.accent}50`; }}}
                            onMouseLeave={e => { e.currentTarget.style.background=canBuy?`${activeTheme.accent}15`:"rgba(60,60,60,0.1)"; e.currentTarget.style.borderColor=canBuy?`${activeTheme.accent}30`:"rgba(60,60,60,0.15)"; }}>
                            <span style={{ fontSize:12, fontWeight:700, fontFamily:T.mono, color: canBuy ? activeTheme.accent : "#555" }}>
                              ×{qty} · ${totalCost.toLocaleString()}
                            </span>
                          </button>
                          {(stats.vault || 0) > 0 && (
                            <button onClick={() => canVault && doVaultPurchase(qty)}
                              style={{
                                flex:1, padding:"10px 12px", borderRadius:8, cursor: canVault ? "pointer" : "not-allowed",
                                background: canVault ? "rgba(212,175,55,0.12)" : "rgba(60,60,60,0.1)",
                                border: canVault ? "1px solid rgba(212,175,55,0.35)" : "1px solid rgba(60,60,60,0.15)",
                                display:"flex", alignItems:"center", justifyContent:"center",
                                transition:"all 0.15s",
                              }}
                              onMouseEnter={e => { if(canVault) { e.currentTarget.style.background="rgba(212,175,55,0.22)"; e.currentTarget.style.borderColor="rgba(212,175,55,0.6)"; }}}
                              onMouseLeave={e => { e.currentTarget.style.background=canVault?"rgba(212,175,55,0.12)":"rgba(60,60,60,0.1)"; e.currentTarget.style.borderColor=canVault?"rgba(212,175,55,0.35)":"rgba(60,60,60,0.15)"; }}>
                              <span style={{ fontSize:12, fontWeight:700, fontFamily:T.mono, color: canVault ? "#d4af37" : "#555" }}>
                                ×{qty} · ${totalCost.toLocaleString()}
                              </span>
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {}
                  <div style={{ textAlign:"center", marginTop:12, fontSize:10, fontFamily:T.mono, color:T.dim }}>
                    Cash: ${chips.toLocaleString()}{(stats.vault || 0) > 0 && <span style={{ color:"#d4af3780", marginLeft:8 }}>◈ ${(stats.vault||0).toLocaleString()}</span>}
                  </div>
                  {}
                  <button onClick={() => setSelectedShopItem(null)} style={{
                    width:"100%", marginTop:12, padding:"8px 0", fontSize:10, fontFamily:T.mono,
                    letterSpacing:2, color:T.dim, background:"transparent", border:"1px solid rgba(255,255,255,0.08)",
                    borderRadius:6, cursor:"pointer" }}>CLOSE</button>
                </div>
              </div>
            </div>
          );
        })()}
        {}
        {tab === "vault" && (() => {
          const vaultBal = stats.vault || 0;
          const totalDebt = stats.totalDebt || 0;
          const rebuyCount = stats.rebuyCount || 0;
          const isHardDebt = totalDebt > 0 && rebuyCount >= 3;
          const isSoftDebt = totalDebt > 0 && rebuyCount === 2;
          const pts = calcVipPoints(stats);
          const tier = getVipTier(pts, achCount);
          const threshold = VAULT_YEAR_THRESHOLDS[tier.id] || 100000;
          const cycleWagered = stats.vaultWageredThisCycle || 0;
          const cycleProgress = Math.min(100, (cycleWagered / threshold) * 100);
          const projectedInterest = Math.min(Math.floor(vaultBal * 0.10), threshold);
          const fmtShort = (n) => n >= 1e9 ? (n/1e9).toFixed(1)+"B" : n >= 1e6 ? (n/1e6).toFixed(1)+"M" : n >= 1e3 ? (n/1e3).toFixed(1)+"K" : n.toLocaleString();
          return (
          <div style={{ animation:"tabSlideIn 0.3s ease-out" }}>
            {/* Vault Balance Header */}
            <div style={{ textAlign:"center", marginBottom:16, padding:"18px 16px",
              background:`${activeTheme.accent}08`, border:`1px solid ${activeTheme.accent}20`,
              borderRadius:14, position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", inset:0, opacity:0.04,
                background:`repeating-linear-gradient(45deg, transparent, transparent 10px, ${activeTheme.accent} 10px, ${activeTheme.accent} 11px)`,
                pointerEvents:"none" }} />
              <div style={{ fontSize:9, letterSpacing:3, textTransform:"uppercase", color:T.dim, fontFamily:T.mono, marginBottom:4 }}>
                VAULT BALANCE
              </div>
              <div style={{ fontSize:32, fontWeight:900, fontFamily:T.mono,
                color: vaultBal > 0 ? activeTheme.accent : "#3a3428" }}>
                ${vaultBal.toLocaleString()}
              </div>
              {vaultBal === 0 && <div style={{ fontSize:9, color:T.dim, fontFamily:T.mono, marginTop:4, letterSpacing:1 }}>No funds secured</div>}
              {(stats.totalInterestEarned || 0) > 0 && (
                <div style={{ fontSize:9, color:T.muted, fontFamily:T.mono, marginTop:4 }}>
                  +${(stats.totalInterestEarned || 0).toLocaleString()} total interest earned
                </div>
              )}
            </div>

            {/* Deposit */}
            <div style={{ marginBottom:10, padding:"12px 14px", background:"rgba(255,255,255,0.02)",
              border:`1px solid ${activeTheme.accent}18`, borderRadius:10 }}>
              <div style={{ fontSize:9, letterSpacing:2, textTransform:"uppercase", color:T.muted, fontFamily:T.mono, marginBottom:8 }}>Deposit from Bankroll</div>
              {isHardDebt ? (
                <div style={{ fontSize:10, fontFamily:T.mono, color:"#ef4444", padding:"6px 0" }}>
                  Deposits blocked while in Hard Debt
                </div>
              ) : chips <= 1000 ? (
                <div style={{ fontSize:10, fontFamily:T.mono, color:T.muted, padding:"6px 0" }}>
                  Need more than $1,000 in bankroll to deposit
                </div>
              ) : (
                <div style={{ display:"flex", gap:6 }}>
                  <input type="number" value={vaultDepositAmt} onChange={e => setVaultDepositAmt(e.target.value)}
                    placeholder={`Max $${Math.max(0, chips - 1000).toLocaleString()}`} min={1} max={Math.max(0, chips - 1000)}
                    style={{ flex:1, padding:"8px 10px", fontSize:12, fontFamily:T.mono,
                      background:"rgba(255,255,255,0.05)", border:`1px solid ${activeTheme.accent}30`,
                      borderRadius:6, color:T.text, outline:"none" }} />
                  <button onClick={() => {
                    const amt = Math.min(parseInt(vaultDepositAmt)||0, chips - 1000);
                    if (amt > 0 && onVaultDeposit) { onVaultDeposit(amt); setVaultDepositAmt(""); }
                  }} style={{ padding:"8px 14px", fontSize:11, fontWeight:700, fontFamily:T.mono,
                    background:`${activeTheme.accent}20`, border:`1px solid ${activeTheme.accent}40`,
                    borderRadius:6, color:activeTheme.accent, cursor:"pointer", letterSpacing:1 }}>
                    LOCK IN
                  </button>
                  <button onClick={() => { const max = chips - 1000; if (max > 0 && onVaultDeposit) { onVaultDeposit(max); setVaultDepositAmt(""); } }}
                    style={{ padding:"8px 10px", fontSize:10, fontFamily:T.mono,
                      background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)",
                      borderRadius:6, color:T.dim, cursor:"pointer" }}>MAX</button>
                </div>
              )}
            </div>

            {/* Withdraw */}
            <div style={{ marginBottom:16, padding:"12px 14px", background:"rgba(255,255,255,0.02)",
              border:`1px solid ${activeTheme.accent}18`, borderRadius:10 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
                <div style={{ fontSize:9, letterSpacing:2, textTransform:"uppercase", color:T.muted, fontFamily:T.mono }}>Withdraw to Bankroll</div>
                <div style={{ fontSize:8, fontFamily:T.mono, color:T.dim }}>8% fee</div>
              </div>
              {vaultBal === 0 ? (
                <div style={{ fontSize:10, fontFamily:T.mono, color:T.dim, padding:"4px 0" }}>No funds to withdraw</div>
              ) : (
                <div style={{ display:"flex", gap:6 }}>
                  <input type="number" value={vaultWithdrawAmt} onChange={e => setVaultWithdrawAmt(e.target.value)}
                    placeholder={`Max $${vaultBal.toLocaleString()}`} min={1} max={vaultBal}
                    style={{ flex:1, padding:"8px 10px", fontSize:12, fontFamily:T.mono,
                      background:"rgba(255,255,255,0.05)", border:`1px solid ${activeTheme.accent}30`,
                      borderRadius:6, color:T.text, outline:"none" }} />
                  <button onClick={() => {
                    const amt = Math.min(parseInt(vaultWithdrawAmt)||0, vaultBal);
                    if (amt > 0 && onVaultWithdraw) {
                      const fee = Math.floor(amt * 0.08);
                      onVaultWithdraw(amt);
                      setVaultWithdrawAmt("");
                    }
                  }} style={{ padding:"8px 14px", fontSize:11, fontWeight:700, fontFamily:T.mono,
                    background:"rgba(255,255,255,0.06)", border:`1px solid ${activeTheme.accent}25`,
                    borderRadius:6, color:activeTheme.accent, cursor:"pointer", letterSpacing:1 }}>
                    CASH OUT
                  </button>
                </div>
              )}
              {vaultWithdrawAmt && parseInt(vaultWithdrawAmt) > 0 && (
                <div style={{ fontSize:9, fontFamily:T.mono, color:T.dim, marginTop:6 }}>
                  Receive: ${Math.floor((parseInt(vaultWithdrawAmt)||0) * 0.92).toLocaleString()} · Fee: ${Math.floor((parseInt(vaultWithdrawAmt)||0) * 0.08).toLocaleString()}
                </div>
              )}
            </div>

            {/* Interest Section */}
            <div style={{ marginBottom:16, padding:"12px 14px", background:"rgba(255,255,255,0.02)",
              border:`1px solid ${activeTheme.accent}18`, borderRadius:10 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
                <div style={{ fontSize:9, letterSpacing:2, textTransform:"uppercase", color:T.muted, fontFamily:T.mono }}>Annual Interest · Year {(stats.interestCycleNumber||0)+1}</div>
                <div style={{ fontSize:9, fontFamily:T.mono, color:activeTheme.accent }}>10% / year</div>
              </div>
              <div style={{ height:6, borderRadius:3, background:"rgba(255,255,255,0.06)", overflow:"hidden", marginBottom:6 }}>
                <div style={{ width:`${cycleProgress}%`, height:"100%", borderRadius:3,
                  background:`linear-gradient(90deg, ${activeTheme.accent}80, ${activeTheme.accent})`,
                  transition:"width 0.5s" }} />
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:9, fontFamily:T.mono, color:T.dim, marginBottom:6 }}>
                <span>${fmtShort(cycleWagered)} wagered</span>
                <span>Goal: ${fmtShort(threshold)} · {tier.label}</span>
              </div>
              {vaultBal > 0 && (
                <div style={{ fontSize:10, fontFamily:T.mono, color:T.muted }}>
                  Projected payout: <span style={{ color:activeTheme.accent }}>+${projectedInterest.toLocaleString()}</span>
                </div>
              )}
              {(stats.interestHistory || []).length > 0 && (
                <details style={{ marginTop:8 }}>
                  <summary style={{ fontSize:9, fontFamily:T.mono, color:T.dim, cursor:"pointer", letterSpacing:1 }}>
                    HISTORY ({(stats.interestCycleNumber || (stats.interestHistory||[]).length)} year{(stats.interestCycleNumber || (stats.interestHistory||[]).length) !== 1 ? "s" : ""})
                  </summary>
                  <div style={{ marginTop:6, display:"flex", flexDirection:"column", gap:4 }}>
                    {(() => {
                      const hist = stats.interestHistory || [];
                      const totalCycles = stats.interestCycleNumber || hist.length;
                      const isTrimmed = totalCycles > hist.length;
                      const reversed = [...hist].reverse();
                      const rows = [];
                      reversed.forEach((h, i) => {
                        rows.push(
                          <div key={h.year} style={{ display:"flex", justifyContent:"space-between", fontSize:9, fontFamily:T.mono,
                            padding:"4px 8px", borderRadius:4, background:"rgba(255,255,255,0.02)" }}>
                            <span style={{ color:T.dim }}>Year {h.year}</span>
                            <span style={{ color:activeTheme.accent }}>+${(h.interest||0).toLocaleString()}</span>
                            <span style={{ color:T.dim }}>${fmtShort(h.wagered||0)} wagered</span>
                          </div>
                        );
                        if (isTrimmed && i === 9 && reversed.length > 10) {
                          rows.push(
                            <div key="gap" style={{ textAlign:"center", fontSize:9, fontFamily:T.mono, color:T.muted, padding:"2px 0" }}>
                              · · · {totalCycles - 20} years not shown · · ·
                            </div>
                          );
                        }
                      });
                      return rows;
                    })()}
                  </div>
                </details>
              )}
            </div>

            {/* Debt Section */}
            {totalDebt > 0 && (
              <div style={{ marginBottom:16, padding:"12px 14px",
                background:"rgba(239,68,68,0.05)", border:"1px solid rgba(239,68,68,0.25)", borderRadius:10 }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
                  <div style={{ fontSize:9, letterSpacing:2, textTransform:"uppercase", fontFamily:T.mono,
                    color: isHardDebt ? "#ef4444" : "#f97316" }}>
                    {isHardDebt ? "Hard Debt" : isSoftDebt ? "Soft Debt" : "Grace Period"}
                  </div>
                  <div style={{ fontSize:12, fontWeight:700, fontFamily:T.mono, color:"#ef4444" }}>
                    ${totalDebt.toLocaleString()}
                  </div>
                </div>
                <div style={{ fontSize:9, fontFamily:T.mono, color:T.muted, marginBottom:8, lineHeight:1.6 }}>
                  {isHardDebt ? "VIP activity pts at 70% · 10% of wins auto-repay · 2% of bets auto-repay · Deposits blocked" :
                    isSoftDebt ? "VIP activity pts at 85% · Rebuy once more to enter Hard Debt" :
                    "No penalties yet · Repay before next rebuy to avoid Soft Debt"}
                </div>
                {vaultBal > 0 && onVaultRepayDebt && (
                  <div style={{ display:"flex", gap:6, marginTop:4 }}>
                    <input type="number" value={vaultRepayAmt} onChange={e => setVaultRepayAmt(e.target.value)}
                      placeholder={`Max $${Math.min(vaultBal, totalDebt).toLocaleString()}`}
                      min={1} max={Math.min(vaultBal, totalDebt)}
                      style={{ flex:1, padding:"7px 10px", fontSize:11, fontFamily:T.mono,
                        background:"rgba(255,255,255,0.04)", border:"1px solid rgba(239,68,68,0.3)",
                        borderRadius:6, color:T.text, outline:"none" }} />
                    <button onClick={() => {
                      const amt = Math.min(parseInt(vaultRepayAmt)||0, vaultBal, totalDebt);
                      if (amt > 0) { onVaultRepayDebt(amt); setVaultRepayAmt(""); }
                    }} style={{ padding:"7px 12px", fontSize:10, fontWeight:700, fontFamily:T.mono,
                      background:"rgba(239,68,68,0.15)", border:"1px solid rgba(239,68,68,0.4)",
                      borderRadius:6, color:"#ef4444", cursor:"pointer", letterSpacing:1 }}>REPAY</button>
                    <button onClick={() => {
                      const amt = Math.min(vaultBal, totalDebt);
                      if (amt > 0) { onVaultRepayDebt(amt); setVaultRepayAmt(""); }
                    }} style={{ padding:"7px 10px", fontSize:9, fontFamily:T.mono,
                      background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)",
                      borderRadius:6, color:T.dim, cursor:"pointer" }}>ALL</button>
                  </div>
                )}
              </div>
            )}

            {/* Owned Items */}
            <div style={{ marginTop:4 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                <div style={{ fontSize:11, letterSpacing:2, textTransform:"uppercase", color:T.muted, fontFamily:T.serif }}>Owned Items</div>
                <div style={{ fontSize:10, fontFamily:T.mono, color:T.dim }}>
                  {(settings.powerUps || []).length} stored{(settings.activePowerUps || []).length > 0 ? ` · ${(settings.activePowerUps || []).length} active` : ""}
                </div>
              </div>
              {(settings.activePowerUps || []).length > 0 && (
                <div style={{ marginBottom:10 }}>
                  <div style={{ fontSize:9, letterSpacing:2, textTransform:"uppercase", color:T.muted, fontFamily:T.mono, marginBottom:6 }}>Active</div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                    {(settings.activePowerUps || []).map((pu, i) => {
                      const item = SHOP_ITEMS.find(s => s.id === pu.itemId);
                      if (!item) return null;
                      const rarityCol = RARITY_COLORS[item.rarity] || activeTheme.accent;
                      const remaining = pu.remaining != null ? pu.remaining : 0;
                      const unit = item.effect.wins ? "w" : "b";
                      return (
                        <div key={i} style={{ padding:"5px 10px", borderRadius:6, display:"flex", alignItems:"center", gap:5,
                          background:`${rarityCol}12`, border:`1px solid ${rarityCol}35`, fontSize:10, fontFamily:T.mono }}>
                          <span style={{ color:rarityCol }}>{item.icon}</span>
                          <span style={{ color:T.text, fontWeight:700 }}>{remaining}{unit}</span>
                          <span style={{ color:rarityCol, fontSize:8 }}>{item.tier}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {(settings.powerUps || []).length === 0 && (settings.activePowerUps || []).length === 0 ? (
                <div style={{ textAlign:"center", padding:"24px 20px" }}>
                  <div style={{ fontSize:24, color:T.dim, marginBottom:8 }}>◇</div>
                  <div style={{ fontSize:12, color:T.muted, fontFamily:T.serif, marginBottom:4 }}>No power-ups</div>
                  <div style={{ fontSize:9, color:T.dim, fontFamily:T.mono }}>Visit the Shop to buy power-ups</div>
                </div>
              ) : (settings.powerUps || []).length === 0 ? (
                <div style={{ textAlign:"center", padding:"16px", fontSize:10, color:T.dim, fontFamily:T.mono }}>
                  No items in bag — all power-ups are active
                </div>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {(settings.powerUps || []).map((pu, i) => {
                    const item = SHOP_ITEMS.find(s => s.id === pu.itemId);
                    if (!item) return null;
                    const remaining = pu.remaining != null ? pu.remaining : 0;
                    const maxUses = item.effect.rounds || item.effect.wins || item.effect.bets || item.effect.uses || 1;
                    const pct = Math.max(0, Math.min(100, (remaining / maxUses) * 100));
                    const typeLabels = { winMulti:"Win Multiplier", vipMulti:"VIP Boost", insurance:"Loss Insurance", shield:"All-In Shield" };
                    const remainLabel = item.effect.wins ? `${remaining} wins` : item.effect.bets ? `${remaining} bets` : `${remaining} uses`;
                    const rarityCol = RARITY_COLORS[item.rarity] || activeTheme.accent;
                    return (
                      <div key={i} onClick={() => setSelectedInvItem(i)}
                        style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 14px",
                        background:`${activeTheme.accent}06`, border:`1px solid ${activeTheme.accent}15`,
                        borderRadius:10, position:"relative", overflow:"hidden", cursor:"pointer", transition:"all 0.2s" }}>
                        <div style={{ position:"absolute", left:0, top:0, bottom:0, width:`${pct}%`, background:`${activeTheme.accent}08`, transition:"width 0.3s" }} />
                        <div style={{ position:"absolute", left:0, top:0, bottom:0, width:3, background:rarityCol, opacity:0.5 }} />
                        <div style={{ width:36, height:36, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center",
                          background:`${rarityCol}18`, border:`1px solid ${rarityCol}30`,
                          fontSize:16, color:rarityCol, fontWeight:700, flexShrink:0, zIndex:1 }}>{item.icon}</div>
                        <div style={{ flex:1, zIndex:1 }}>
                          <div style={{ fontSize:12, fontWeight:700, fontFamily:T.serif, color:T.text, letterSpacing:1 }}>
                            {item.name} <span style={{ color:T.dim, fontWeight:400 }}>({item.tier})</span>
                          </div>
                          <div style={{ fontSize:9, color:T.muted, fontFamily:T.mono, marginTop:2 }}>
                            {typeLabels[item.effect.type] || item.effect.type}
                          </div>
                        </div>
                        <div style={{ textAlign:"right", flexShrink:0, zIndex:1 }}>
                          <div style={{ fontSize:14, fontWeight:700, fontFamily:T.mono, color:activeTheme.accent }}>{remaining}</div>
                          <div style={{ fontSize:8, color:T.dim, fontFamily:T.mono }}>{remainLabel}</div>
                        </div>
                      </div>
                    );
                  })}
                  {selectedInvItem != null && (settings.powerUps || [])[selectedInvItem] && (() => {
                    const idx = selectedInvItem;
                    const pu = settings.powerUps[idx];
                    const item = SHOP_ITEMS.find(s => s.id === pu.itemId);
                    if (!item) return null;
                    const rarityCol = RARITY_COLORS[item.rarity] || activeTheme.accent;
                    const remaining = pu.remaining != null ? pu.remaining : 0;
                    const remainLabel = item.effect.wins ? `${remaining} wins` : item.effect.bets ? `${remaining} bets` : `${remaining} uses`;
                    return (
                      <div onClick={() => setSelectedInvItem(null)} style={{
                        position:"fixed", inset:0, zIndex:10000, background:"rgba(0,0,0,0.7)", backdropFilter:"blur(4px)",
                        display:"flex", alignItems:"center", justifyContent:"center", padding:20, animation:"fadeIn 0.2s ease" }}>
                        <div onClick={e => e.stopPropagation()} style={{
                          width:"100%", maxWidth:300, borderRadius:14, overflow:"hidden",
                          background:"linear-gradient(180deg, #1a1510 0%, #0e0a08 100%)",
                          border:`1px solid ${rarityCol}30`, boxShadow:`0 20px 60px rgba(0,0,0,0.5), 0 0 30px ${rarityCol}10` }}>
                          <div style={{ height:3, background:rarityCol }} />
                          <div style={{ padding:"20px 24px", textAlign:"center" }}>
                            <div style={{ fontSize:32, marginBottom:6 }}>{item.icon}</div>
                            <div style={{ fontSize:16, fontWeight:700, fontFamily:T.serif, color:T.text, letterSpacing:2 }}>{item.name}</div>
                            <div style={{ fontSize:11, fontFamily:T.mono, color:rarityCol, letterSpacing:2, textTransform:"uppercase", marginTop:4 }}>{item.rarity}</div>
                            <div style={{ fontSize:13, fontWeight:700, color:T.text, marginTop:4 }}>{item.tier}</div>
                            <div style={{ fontSize:11, color:T.muted, fontFamily:T.mono, marginTop:8, lineHeight:1.5 }}>{item.desc}</div>
                            <div style={{ fontSize:12, fontFamily:T.mono, color:activeTheme.accent, marginTop:8 }}>
                              {remaining} {remainLabel.split(" ")[1]} remaining
                            </div>
                            <div style={{ display:"flex", flexDirection:"column", gap:8, marginTop:16 }}>
                              <button onClick={() => {
                                const effect = item.effect;
                                // Debt Eraser: instant effect — wipe debt and consume immediately
                                if (effect.type === "debtErase") {
                                  const wiped = Math.floor((stats.totalDebt || 0) * effect.percent);
                                  onAdminSetStats(s => ({ ...s, totalDebt: Math.max(0, (s.totalDebt || 0) - wiped) }));
                                  setSettings(s => ({ ...s, powerUps: s.powerUps.filter((_, j) => j !== idx) }));
                                  setSelectedInvItem(null);
                                  return;
                                }
                                // Anti-stack: only one active buff at a time
                                if ((settings.activePowerUps || []).length > 0) {
                                  setShopToast("A buff is already active. Wait for it to expire before activating another.");
                                  setTimeout(() => setShopToast(null), 3500);
                                  setSelectedInvItem(null);
                                  return;
                                }
                                const activePu = { ...pu };
                                setSettings(s => ({ ...s, powerUps: s.powerUps.filter((_, j) => j !== idx), activePowerUps: [...(s.activePowerUps || []), activePu] }));
                                setSelectedInvItem(null);
                              }} style={{ padding:"12px 16px", fontSize:12, fontWeight:700, fontFamily:T.mono,
                                letterSpacing:2, background:`${activeTheme.accent}20`, border:`1px solid ${activeTheme.accent}50`,
                                borderRadius:8, color:activeTheme.accent, cursor:"pointer" }}
                              onMouseEnter={e => { e.currentTarget.style.background=`${activeTheme.accent}35`; }}
                              onMouseLeave={e => { e.currentTarget.style.background=`${activeTheme.accent}20`; }}>
                                ACTIVATE
                              </button>
                              <button onClick={() => {
                                if (confirm("Discard this power-up?")) {
                                  setSettings(s => ({ ...s, powerUps: s.powerUps.filter((_, j) => j !== idx) }));
                                  setSelectedInvItem(null);
                                }
                              }} style={{ padding:"8px 16px", fontSize:9, fontFamily:T.mono, letterSpacing:1,
                                background:"transparent", border:"1px solid rgba(239,68,68,0.2)",
                                borderRadius:6, color:"#ef4444", cursor:"pointer", opacity:0.5 }}>DISCARD</button>
                              <button onClick={() => setSelectedInvItem(null)} style={{ padding:"6px 16px", fontSize:9, fontFamily:T.mono,
                                letterSpacing:2, color:T.dim, background:"transparent", border:"none", cursor:"pointer" }}>CLOSE</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                  <button onClick={() => {
                    if (confirm("Discard all power-ups? This cannot be undone.")) {
                      setSettings(s => ({ ...s, powerUps: [] }));
                    }
                  }} style={{ marginTop:8, padding:"8px 16px", fontSize:9, fontFamily:T.mono, letterSpacing:1,
                    background:"transparent", border:"1px solid rgba(239,68,68,0.2)", borderRadius:6,
                    color:"#ef4444", cursor:"pointer", opacity:0.6, transition:"all 0.2s", alignSelf:"center" }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.5)"; }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = "0.6"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.2)"; }}>
                    Discard All
                  </button>
                </div>
              )}
            </div>
          </div>
          );
        })()}
        {}
        {tab === "settings" && (
          <div style={{ animation:"tabSlideIn 0.3s ease-out" }}>
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:11, letterSpacing:3, textTransform:"uppercase", color:T.muted, fontFamily:T.serif, marginBottom:10 }}>Theme Skin</div>
              <button onClick={() => setShowChipSkins(true)}
                style={{
                  display:"flex", alignItems:"center", gap:10, width:"100%", padding:"10px 14px",
                  borderRadius:8, cursor:"pointer", transition:"all 0.2s",
                  background:`${getChipSkin(settings.chipSkin).accent}10`,
                  border:`1.5px solid ${getChipSkin(settings.chipSkin).accent}40`,
                }}>
                <span style={{ fontSize:16 }}>{getChipSkin(settings.chipSkin).icon}</span>
                <div style={{ textAlign:"left" }}>
                  <div style={{ fontSize:12, fontWeight:700, color:getChipSkin(settings.chipSkin).accent,
                    fontFamily:T.serif }}>{getChipSkin(settings.chipSkin).name}</div>
                  <div style={{ fontSize:9, color:T.dim, fontFamily:T.mono }}>
                    {getUnlockedSkins(stats, chips, vipTier.id).length}/{CHIP_SKINS.length} unlocked — tap to change
                  </div>
                </div>
              </button>
            </div>
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:11, letterSpacing:3, textTransform:"uppercase", color:T.muted, fontFamily:T.serif, marginBottom:10 }}>Animation Speed</div>
              <div style={{ display:"flex", gap:6 }}>
                {[["normal","Normal"],["fast","Fast"],["instant","Instant"]].map(([val, label]) => (
                  <button key={val} onClick={() => setSettings && setSettings(s => ({...s, animSpeed: val}))}
                    style={{
                      flex:1, padding:"10px 8px", borderRadius:8, fontSize:12, fontWeight:600,
                      fontFamily:T.mono, cursor:"pointer", transition:"all 0.2s",
                      background: settings.animSpeed === val ? `${activeTheme.accent}25` : "rgba(255,255,255,0.03)",
                      border: settings.animSpeed === val ? `1.5px solid ${activeTheme.accent}` : "1.5px solid rgba(255,255,255,0.08)",
                      color: settings.animSpeed === val ? activeTheme.accent : T.muted,
                    }}>
                    {label}
                  </button>
                ))}
              </div>
              <div style={{ fontSize:10, color:T.dim, marginTop:6, fontFamily:T.mono }}>
                {settings.animSpeed === "normal" ? "Full animations & dramatic reveals" : settings.animSpeed === "fast" ? "Snappier card deals & reel stops" : "Skip all animations for speed grinding"}
              </div>
            </div>
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:11, letterSpacing:3, textTransform:"uppercase", color:T.muted, fontFamily:T.serif, marginBottom:10 }}>Theme</div>
              <div style={{ display:"flex", gap:6 }}>
                {[["dark","● Dark"],["light","○ Light"]].map(([val, label]) => (
                  <button key={val} onClick={() => setSettings && setSettings(s => ({...s, theme: val}))}
                    style={{
                      flex:1, padding:"10px 8px", borderRadius:8, fontSize:12, fontWeight:600,
                      fontFamily:T.mono, cursor:"pointer", transition:"all 0.2s",
                      background: (settings.theme || "dark") === val ? `${activeTheme.accent}25` : "rgba(255,255,255,0.03)",
                      border: (settings.theme || "dark") === val ? `1.5px solid ${activeTheme.accent}` : "1.5px solid rgba(255,255,255,0.08)",
                      color: (settings.theme || "dark") === val ? activeTheme.accent : T.muted,
                    }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:11, letterSpacing:3, textTransform:"uppercase", color:T.muted, fontFamily:T.serif, marginBottom:10 }}>Win/Loss Overlays</div>
              <button onClick={() => setSettings && setSettings(s => ({...s, skipOverlays: !s.skipOverlays}))}
                style={{
                  padding:"10px 20px", borderRadius:8, fontSize:12, fontWeight:600,
                  fontFamily:T.mono, cursor:"pointer", transition:"all 0.2s",
                  background: !settings.skipOverlays ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.12)",
                  border: !settings.skipOverlays ? "1.5px solid #22c55e" : "1.5px solid rgba(239,68,68,0.3)",
                  color: !settings.skipOverlays ? "#22c55e" : "#ef4444",
                }}>
                {!settings.skipOverlays ? "✅ Overlays On" : "⏭ Overlays Off"}
              </button>
              <div style={{ fontSize:10, color:T.dim, marginTop:6, fontFamily:T.mono }}>
                {!settings.skipOverlays ? "Big Win, Mega Win, and Busted screens play normally" : "Skip all full-screen win/loss overlays — instant rebuy on bust"}
              </div>
            </div>
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:11, letterSpacing:3, textTransform:"uppercase", color:T.muted, fontFamily:T.serif, marginBottom:10 }}>Visual Effects</div>
              <button onClick={() => setSettings && setSettings(s => ({...s, skipEffects: !s.skipEffects}))}
                style={{
                  padding:"10px 20px", borderRadius:8, fontSize:12, fontWeight:600,
                  fontFamily:T.mono, cursor:"pointer", transition:"all 0.2s",
                  background: !settings.skipEffects ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.12)",
                  border: !settings.skipEffects ? "1.5px solid #22c55e" : "1.5px solid rgba(239,68,68,0.3)",
                  color: !settings.skipEffects ? "#22c55e" : "#ef4444",
                }}>
                {!settings.skipEffects ? "✅ Effects On" : "⏭ Effects Off"}
              </button>
              <div style={{ fontSize:10, color:T.dim, marginTop:6, fontFamily:T.mono }}>
                {!settings.skipEffects ? "Coin rain, confetti, screen shake, and color wash" : "Disable all particle effects for better performance"}
              </div>
            </div>
            <div style={{ padding:12, background:"rgba(255,255,255,0.02)", borderRadius:8, border:"1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                <div style={{ fontSize:11, letterSpacing:3, textTransform:"uppercase", color:T.muted, fontFamily:T.serif }}>Account</div>
                <button onClick={onSignOut}
                  style={{ padding:"4px 10px", fontSize:9, fontFamily:T.mono, background:"transparent",
                    border:"1px solid rgba(239,68,68,0.3)", borderRadius:4, color:"#ef4444", cursor:"pointer",
                    letterSpacing:1, textTransform:"uppercase" }}>Sign Out</button>
              </div>
              <div style={{ fontSize:13, color:activeTheme.accent, fontFamily:T.mono, fontWeight:700, marginBottom:2 }}>{username}</div>
              {userEmail && !isGuest && (
                <div style={{ fontSize:10, color:T.dim, fontFamily:T.mono, marginBottom:4 }}>{userEmail}</div>
              )}
              {isGuest && (
                <div style={{ fontSize:9, color:"#f59e0b", fontFamily:T.mono, marginBottom:4, letterSpacing:1 }}>
                  GUEST — progress saves locally only
                </div>
              )}
              <div style={{ fontSize:10, color:T.dim, fontFamily:T.mono, marginBottom:10 }}>
                {Object.values(stats.gamesPlayed).reduce((a,b)=>a+b,0)} rounds played · ${chips.toLocaleString()} chips
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <button onClick={onManualSave} disabled={saveStatus === "saving"}
                  style={{
                    padding:"7px 16px", fontSize:11, fontWeight:600, fontFamily:T.mono,
                    background: saveStatus === "saved" ? "rgba(34,197,94,0.15)" : `${activeTheme.accent}18`,
                    border: saveStatus === "saved" ? "1px solid rgba(34,197,94,0.4)" : `1px solid ${activeTheme.accent}40`,
                    borderRadius:6, color: saveStatus === "saved" ? "#22c55e" : activeTheme.accent,
                    cursor: saveStatus === "saving" ? "not-allowed" : "pointer", transition:"all 0.3s",
                    letterSpacing:1,
                  }}>
                  {saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "✓ Saved" : "Save Progress"}
                </button>
                <div style={{ fontSize:9, color:T.dim, fontFamily:T.mono }}>
                  {saveStatus === "idle" ? "Auto-saves every 5 min" : saveStatus === "saving" ? "Saving..." : "Saved!"}
                </div>
              </div>
            </div>
            {}
            <div style={{ marginTop:20 }}>
              <div style={{ fontSize:11, letterSpacing:3, textTransform:"uppercase", color:T.muted, fontFamily:T.serif, marginBottom:10 }}>Admin</div>
              {(settings.adminUnlocked || adminAuth) ? (
                <div style={{ animation:"fadeIn 0.3s ease", background:"rgba(0,0,0,0.25)", borderRadius:12,
                  border:`1px solid ${activeTheme.accent}28`, padding:16, textAlign:"left" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                    <div style={{ fontSize:10, fontFamily:T.mono, color:activeTheme.accent, letterSpacing:2, fontWeight:700 }}>◈ ADMIN CONTROLS</div>
                    <button onClick={() => { setAdminAuth(false); setAdminPw(""); setSettings(s => ({...s, adminUnlocked: false})); }}
                      style={{ padding:"4px 10px", fontSize:9, fontFamily:T.mono, background:"transparent",
                        border:"1px solid rgba(239,68,68,0.3)", borderRadius:4, color:"#ef4444", cursor:"pointer" }}>Disable</button>
                  </div>
                  {}
                  <div style={{ marginBottom:16, padding:10, background:"rgba(255,255,255,0.03)", borderRadius:8,
                    border:"1px solid rgba(255,255,255,0.06)" }}>
                    <div style={{ fontSize:9, fontFamily:T.mono, color:T.muted, marginBottom:8, letterSpacing:1 }}>ADD CHIPS</div>
                    <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:8 }}>
                      {[1000, 10000, 100000, 1000000].map(amount => (
                        <button key={amount} onClick={() => onAdminSetChips(prev => prev + amount)}
                          style={{ padding:"5px 10px", fontSize:10, fontWeight:600, fontFamily:T.mono,
                            background:"rgba(34,197,94,0.12)", border:"1px solid rgba(34,197,94,0.3)",
                            borderRadius:5, color:"#22c55e", cursor:"pointer" }}>
                          +${amount >= 1000000 ? `${amount/1000000}M` : amount >= 1000 ? `${amount/1000}K` : amount}
                        </button>
                      ))}
                    </div>
                    <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                      <input type="number" value={adminChipAdd} onChange={e => setAdminChipAdd(e.target.value)}
                        placeholder="Custom amount"
                        style={{ padding:"5px 10px", fontSize:11, fontFamily:T.mono, background:"rgba(0,0,0,0.3)",
                          border:"1px solid rgba(255,255,255,0.12)", borderRadius:5, color:T.text, width:120, outline:"none" }} />
                      <button onClick={() => {
                        const amt = parseInt(adminChipAdd);
                        if (amt && amt > 0) { onAdminSetChips(prev => prev + amt); setAdminChipAdd(""); }
                      }}
                        style={{ padding:"5px 12px", fontSize:10, fontWeight:600, fontFamily:T.mono,
                          background:"rgba(34,197,94,0.15)", border:"1px solid rgba(34,197,94,0.3)",
                          borderRadius:5, color:"#22c55e", cursor:"pointer" }}>Add</button>
                    </div>
                  </div>
                  {}
                  <div style={{ padding:10, background:"rgba(255,255,255,0.03)", borderRadius:8,
                    border:"1px solid rgba(255,255,255,0.06)" }}>
                    <div style={{ fontSize:9, fontFamily:T.mono, color:T.muted, marginBottom:8, letterSpacing:1 }}>
                      ACHIEVEMENTS ({(stats.achievements || []).length}/{ACHIEVEMENTS.length})
                      <button onClick={() => {
                        const allIds = ACHIEVEMENTS.map(a => a.id);
                        const hasAll = allIds.every(id => (stats.achievements || []).includes(id));
                        if (hasAll) {
                          onAdminSetStats(s => ({ ...s, achievements: [] }));
                        } else {
                          onAdminSetStats(s => ({ ...s, achievements: [...allIds] }));
                        }
                      }}
                        style={{ marginLeft:8, padding:"2px 8px", fontSize:8, fontFamily:T.mono,
                          background:`${activeTheme.accent}1a`, border:`1px solid ${activeTheme.accent}35`,
                          borderRadius:3, color:activeTheme.accent, cursor:"pointer" }}>
                        {ACHIEVEMENTS.every(a => (stats.achievements || []).includes(a.id)) ? "Clear All" : "Unlock All"}
                      </button>
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:4, maxHeight:200, overflowY:"auto" }}>
                      {ACHIEVEMENTS.map(a => {
                        const unlocked = (stats.achievements || []).includes(a.id);
                        return (
                          <button key={a.id} onClick={() => {
                            onAdminSetStats(s => {
                              const achs = [...(s.achievements || [])];
                              if (unlocked) {
                                return { ...s, achievements: achs.filter(id => id !== a.id) };
                              } else {
                                return { ...s, achievements: [...achs, a.id] };
                              }
                            });
                          }}
                            style={{ display:"flex", gap:6, alignItems:"center", padding:"5px 8px", borderRadius:5, cursor:"pointer",
                              background: unlocked ? "rgba(34,197,94,0.08)" : "rgba(255,255,255,0.02)",
                              border: unlocked ? "1px solid rgba(34,197,94,0.2)" : "1px solid rgba(255,255,255,0.05)",
                              textAlign:"left" }}>
                            <span style={{ fontSize:12, filter: unlocked ? "none" : "grayscale(1)", flexShrink:0 }}>{a.icon}</span>
                            <div style={{ minWidth:0 }}>
                              <div style={{ fontSize:9, fontWeight:700, color: unlocked ? "#22c55e" : T.dim,
                                fontFamily:T.mono, letterSpacing:0.3 }}>{a.name}</div>
                            </div>
                            <span style={{ marginLeft:"auto", fontSize:10, flexShrink:0 }}>{unlocked ? "✅" : "⬜"}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : !showAdmin ? (
                <button onClick={() => setShowAdmin(true)}
                  style={{ padding:"6px 16px", fontSize:9, fontWeight:600, letterSpacing:2, textTransform:"uppercase",
                    fontFamily:T.mono, background:"transparent", border:"1px solid rgba(255,255,255,0.08)", borderRadius:6,
                    color:"#3a3020", cursor:"pointer", transition:"all 0.2s", opacity:0.5 }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = "0.8"; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = "0.5"; }}>
                  ◈ Admin
                </button>
              ) : (
                <div style={{ animation:"fadeIn 0.3s ease", background:"rgba(0,0,0,0.2)", borderRadius:10,
                  border:"1px solid rgba(255,255,255,0.08)", padding:16 }}>
                  <div style={{ fontSize:10, fontFamily:T.mono, color:T.muted, marginBottom:8, letterSpacing:1 }}>ADMIN PASSWORD</div>
                  <div style={{ display:"flex", gap:8, justifyContent:"center", alignItems:"center" }}>
                    <input type="password" value={adminPw} onChange={e => { setAdminPw(e.target.value); setAdminPwError(false); }}
                      onKeyDown={e => { if (e.key === "Enter") {
                        if (adminPw === "Ivy") { setAdminAuth(true); setAdminPwError(false); setSettings(s => ({...s, adminUnlocked: true})); }
                        else setAdminPwError(true);
                      }}}
                      style={{ padding:"6px 12px", fontSize:12, fontFamily:T.mono, background:"rgba(0,0,0,0.3)",
                        border: adminPwError ? "1px solid #ef4444" : "1px solid rgba(255,255,255,0.15)",
                        borderRadius:6, color:T.text, width:120, outline:"none" }}
                      placeholder="Password" autoFocus />
                    <button onClick={() => {
                      if (adminPw === "Ivy") { setAdminAuth(true); setAdminPwError(false); setSettings(s => ({...s, adminUnlocked: true})); }
                      else setAdminPwError(true);
                    }}
                      style={{ padding:"6px 14px", fontSize:10, fontWeight:700, fontFamily:T.mono,
                        background:`${activeTheme.accent}25`, border:`1px solid ${activeTheme.accent}50`,
                        borderRadius:6, color:activeTheme.accent, cursor:"pointer" }}>Enter</button>
                    <button onClick={() => { setShowAdmin(false); setAdminPw(""); setAdminPwError(false); }}
                      style={{ padding:"6px 10px", fontSize:10, fontFamily:T.mono, background:"transparent",
                        border:"1px solid rgba(255,255,255,0.1)", borderRadius:6, color:T.muted, cursor:"pointer" }}>✕</button>
                  </div>
                  {adminPwError && <div style={{ fontSize:9, color:"#ef4444", fontFamily:T.mono, marginTop:6 }}>Incorrect password</div>}
                </div>
              )}
            </div>
          </div>
        )}
          </div>
        </div>
      </div>
      {}
      <div className={isRainbow ? "anim-rainbow-border" : ""} style={{ flexShrink:0, zIndex:10, display:"flex", justifyContent:"space-around", alignItems:"stretch",
        borderTop:`1px solid ${activeTheme.accent}18`, background: isJackpotSkin ? "rgba(18,14,4,0.7)" : "rgba(10,8,18,0.6)", backdropFilter:"blur(12px)", WebkitBackdropFilter:"blur(12px)",
        boxShadow: activeTheme.navTint !== "transparent" ? `inset 0 0 40px ${activeTheme.navTint}` : "none",
        paddingBottom:"env(safe-area-inset-bottom, 0px)", position:"relative", overflow:"hidden" }}>
        {}
        {isJackpotSkin && (
          <div style={{ position:"absolute", top:0, bottom:0, width:"20%", pointerEvents:"none",
            background:"linear-gradient(90deg, transparent, rgba(255,215,0,0.1), rgba(255,248,200,0.15), rgba(255,215,0,0.1), transparent)",
            animation:"goldGlintSweep 5s ease-in-out 2s infinite", zIndex:0 }} />
        )}
        {[
          { id:"games", icon:"♠", label:"Games" },
          { id:"shop", icon:"$", label:"Shop" },
          { id:"vault", icon:"◈", label:"Vault" },
          { id:"trophies", icon:"★", label:"Feats" },
          { id:"settings", icon:"⚙", label:"Settings" },
        ].map(t => {
          const isActive = tab === t.id;
          return (
            <button key={t.id} onClick={() => { setTab(t.id); if (t.id === "trophies") setSeenAchCount(stats.achievements?.length || 0); }} style={{
              flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
              gap:2, padding:"10px 4px 8px", cursor:"pointer", transition:"all 0.2s",
              background:"transparent", border:"none", position:"relative",
            }}>
              {}
              <div style={{ position:"absolute", top:0, left:"20%", right:"20%", height:2, borderRadius:1,
                background: isActive ? (isRainbow ? "linear-gradient(90deg, transparent, #ff6ec7, #f7e84e, #4cff50, #3cb8ff, transparent)" : `linear-gradient(90deg, transparent, ${activeTheme.accent}, transparent)`) : "transparent",
                transition:"all 0.3s", opacity: isActive ? 1 : 0 }} />
              <span style={{ fontSize:20, lineHeight:1,
                filter: isActive ? "none" : "grayscale(0.8) brightness(0.6)",
                transition:"all 0.2s",
                transform: isActive ? "scale(1.1)" : "scale(1)",
              }}>{t.icon}</span>
              <span style={{ fontSize:8, fontWeight:700, letterSpacing:1.5, textTransform:"uppercase",
                fontFamily:T.mono,
                color: isActive ? activeTheme.accent : T.dim,
                transition:"all 0.2s",
              }}>{t.label}</span>
              {t.id === "trophies" && tab !== "trophies" && (stats.achievements?.length || 0) > seenAchCount && (
                <div style={{ position:"absolute", top:6, right:"calc(50% - 18px)", width:14, height:14,
                  borderRadius:7, background:`${activeTheme.accent}cc`, display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:8, fontWeight:700, color:"#fff", fontFamily:T.mono }}>{(stats.achievements?.length || 0) - seenAchCount}</div>
              )}
            </button>
          );
        })}
      </div>
      {}
      {testCoinRain && <CoinRain intensity={testCoinRain} />}
      {testWash && <ScreenColorWash type={testWash} onDismiss={() => setTestWash(null)} />}
      {testConfetti && <ConfettiCanvas type={testConfetti.type} key={testConfetti.key} />}
      {testEruption && <ChipEruption count={16} />}
      {testShake && <div style={{
        position:"fixed", top:0, left:0, right:0, bottom:0, pointerEvents:"none", zIndex:99999,
        animation: testShake === "epic" ? "epicShake 0.8s ease-out" : testShake === "heavy" ? "screenShake 0.5s ease-out" : "lossShake 0.3s ease-out",
      }} />}
      {}
      {testOverlay === "big" && <BigWinOverlay type="big" amount={2500} onDone={() => { setTestOverlay(null); setTimeout(()=>setTestCoinRain(null), 15000); setTestWash(null); setTestConfetti(null); setTestEruption(false); }} />}
      {testOverlay === "mega" && <BigWinOverlay type="mega" amount={25000} onDone={() => { setTestOverlay(null); setTimeout(()=>setTestCoinRain(null), 15000); setTestWash(null); setTestConfetti(null); setTestEruption(false); }} />}
      {testOverlay === "epic" && <BigWinOverlay type="epic" amount={100000} onDone={() => { setTestOverlay(null); setTimeout(()=>setTestCoinRain(null), 15000); setTestWash(null); setTestConfetti(null); setTestEruption(false); }} />}
      {testOverlay === "jackpot" && <JackpotOverlay amount={5000000} onDone={() => { setTestOverlay(null); setTimeout(()=>setTestCoinRain(null), 15000); setTestWash(null); setTestConfetti(null); setTestEruption(false); }} />}
      {showVipDetails && <VipDetailsModal vipPoints={vipPoints} stats={stats} onClose={() => setShowVipDetails(false)} accent={activeTheme.accent} modalBg={activeTheme.modalBg} modalBorder={activeTheme.modalBorder} />}
      {showChipSkins && <ChipSkinModal stats={stats} chips={chips} vipTierId={vipTier.id}
        currentSkin={settings.chipSkin || "house"} activeTheme={activeTheme}
        onSelect={id => { setSettings(s => ({...s, chipSkin: id})); setShowChipSkins(false); }}
        onClose={() => setShowChipSkins(false)} />}
    </div>
  );
}
function HandDisplay({ cards, hideFirst = false, label, value, isActive = false, flipReveal = false }) {
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
