import React from 'react';
import { theme } from '../../theme-globals.js';
import { T } from '../../constants/styles.js';
import { VIP_TIERS, ACH_POINTS, getVipTier, getNextVipTier } from '../../constants/vip.js';
import { ACHIEVEMENTS } from '../../constants/achievements.js';

export function VipDetailsModal({ vipPoints, stats, onClose, accent = theme.accent, modalBg, modalBorder }) {
  const achCount = (stats.achievements || []).length;
  const current = getVipTier(vipPoints, achCount);
  const next = getNextVipTier(vipPoints, achCount);
  const progress = next ? ((vipPoints - current.minPoints) / (next.minPoints - current.minPoints)) * 100 : 100;
  const achPoints = (stats.achievements || []).reduce((sum, id) => sum + (ACH_POINTS[id] || 0), 0);
  const wagerPoints = Math.floor((stats.totalWagered || 0) / 10000);
  return (
    <div style={{ position:"fixed", inset:0, zIndex:30000, display:"flex", alignItems:"center", justifyContent:"center",
      background:"rgba(0,0,0,0.7)", backdropFilter:"blur(6px)", animation:"fadeIn 0.2s ease" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: modalBg || "linear-gradient(180deg, #1e1e34, #15152a)", border:`1px solid ${modalBorder || current.border}`,
        borderRadius:T.radiusLg, padding:"20px 22px", maxWidth:380, width:"92%", maxHeight:"85vh", overflowY:"auto",
        boxShadow:`0 24px 64px rgba(0,0,0,0.6), 0 0 30px ${current.color}15`,
        animation:"fadeInScale 0.2s ease" }}>
        {}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <div style={{ fontSize:14, fontWeight:700, letterSpacing:3, color:accent, textTransform:"uppercase",
            fontFamily:T.serif }}>VIP Ranks</div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:T.muted, fontSize:20,
            cursor:"pointer", padding:"0 4px", lineHeight:1, transition:"color 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.color = T.text}
            onMouseLeave={e => e.currentTarget.style.color = T.muted}>×</button>
        </div>
        {}
        <div style={{
          display:"flex", alignItems:"center", gap:12, padding:"12px 14px", marginBottom:14,
          background:`${current.color}12`, border:`1px solid ${current.border}`, borderRadius:10,
        }}>
          <span style={{ fontSize:30 }}>{current.icon}</span>
          <div style={{ flex:1 }}>
            <div style={{
              fontSize:13, fontWeight:800, letterSpacing:3, fontFamily:T.mono,
              color:current.color, textTransform:"uppercase",
            }}>{current.label}</div>
            <div style={{ fontSize:9, color:T.muted, fontFamily:T.mono, marginTop:2 }}>
              {vipPoints.toLocaleString()} VIP points · Rebuy: ${current.rebuy.toLocaleString()}
            </div>
            {next && (
              <div style={{ marginTop:6 }}>
                <div style={{ height:4, borderRadius:2, background:"rgba(255,255,255,0.08)", overflow:"hidden" }}>
                  <div style={{ width:`${progress}%`, height:"100%", borderRadius:2,
                    background:`linear-gradient(90deg, ${current.color}, ${next.color})`, transition:"width 0.5s" }} />
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", marginTop:6, fontSize:8, color:T.dim, fontFamily:T.mono }}>
                  <span>★ {achPoints} from achievements</span>
                  <span>$ {wagerPoints} from wagering</span>
                </div>
                <div style={{ fontSize:8, color:T.dim, fontFamily:T.mono, marginTop:3 }}>
                  {(next.minPoints - vipPoints).toLocaleString()} pts to {next.icon} {next.label}
                </div>
              </div>
            )}
            {!next && (
              <div style={{ fontSize:9, color:current.color, fontFamily:T.mono, marginTop:3, fontWeight:700 }}>
                ★ MAX TIER REACHED ★
              </div>
            )}
          </div>
        </div>
        {}
        <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
          {VIP_TIERS.map((tier, i) => {
            const isCurrent = tier.id === current.id;
            const isUnlocked = tier.requiresAllAchievements
              ? achCount >= ACHIEVEMENTS.length - 3 && vipPoints >= tier.minPoints
              : vipPoints >= tier.minPoints;
            return (
              <div key={tier.id} style={{
                display:"flex", alignItems:"center", gap:10, padding:"8px 10px",
                borderRadius:8, transition:"all 0.2s",
                background: isCurrent ? `${tier.color}15` : "transparent",
                border: isCurrent ? `1px solid ${tier.border}` : "1px solid transparent",
                opacity: isUnlocked ? 1 : 0.45,
              }}>
                <span style={{ fontSize:20, width:28, textAlign:"center",
                  filter: isUnlocked ? "none" : "grayscale(1)" }}>{tier.icon}</span>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <span style={{
                      fontSize:11, fontWeight:700, letterSpacing:2, fontFamily:T.mono,
                      color: isUnlocked ? tier.color : T.dim, textTransform:"uppercase",
                    }}>{tier.label}</span>
                    {isCurrent && (
                      <span style={{ fontSize:7, letterSpacing:1, fontFamily:T.mono,
                        color:tier.color, background:`${tier.color}20`, padding:"1px 5px",
                        borderRadius:4, fontWeight:700 }}>CURRENT</span>
                    )}
                    {isUnlocked && !isCurrent && (
                      <span style={{ fontSize:7, letterSpacing:1, fontFamily:T.mono,
                        color:T.green, fontWeight:600 }}>✓</span>
                    )}
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:1 }}>
                    <span style={{ fontSize:9, color: isUnlocked ? T.muted : T.dim, fontFamily:T.mono }}>
                      {tier.minPoints === 0 ? "Starting rank" : tier.requiresAllAchievements ? `${ACHIEVEMENTS.length - 3}+ of ${ACHIEVEMENTS.length} achievements` : `${tier.minPoints.toLocaleString()} pts`}
                    </span>
                    <span style={{ fontSize:8, color: isUnlocked ? T.green : T.dim, fontFamily:T.mono }}>
                      Rebuy: ${tier.rebuy.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ textAlign:"center", marginTop:14, fontSize:9, color:T.dim,
          fontFamily:T.mono, letterSpacing:1 }}>
          Earn points from achievements + wagering ($10K = 1 pt)
        </div>
      </div>
    </div>
  );
}
