import React from 'react';
import { T } from '../../constants/styles.js';
import { CHIP_SKINS, INSANE_ACHS, isSkinUnlocked, getUnlockedSkins, SKIN_THEMES, getActiveTheme } from '../../constants/chips.js';

export function ChipSkinModal({ stats, chips, vipTierId, currentSkin, onSelect, onClose, activeTheme }) {
  const at = activeTheme || getActiveTheme("house");
  const categories = [
    { label:"Standard", skins: CHIP_SKINS.filter(s => s.type === "default" || (s.type === "achievement" && !INSANE_ACHS.includes(s.req)) || s.type === "stat") },
    { label:"Insane", skins: CHIP_SKINS.filter(s => s.type === "achievement" && INSANE_ACHS.includes(s.req)) },
    { label:"VIP", skins: CHIP_SKINS.filter(s => s.type === "vip") },
    { label:"Secret", skins: CHIP_SKINS.filter(s => s.type === "secret") },
  ];
  return (
    <div style={{ position:"fixed", inset:0, zIndex:30000, display:"flex", alignItems:"center", justifyContent:"center",
      background:"rgba(0,0,0,0.75)", backdropFilter:"blur(6px)", animation:"fadeIn 0.2s ease" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background:at.modalBg, border:`1px solid ${at.modalBorder}`,
        borderRadius:16, padding:"20px 18px", maxWidth:420, width:"92%", maxHeight:"85vh", overflowY:"auto",
        boxShadow:`0 24px 64px rgba(0,0,0,0.6), 0 0 30px ${at.accent}08`, animation:"fadeInScale 0.2s ease" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <div style={{ fontSize:14, fontWeight:700, letterSpacing:3, color:at.accent, textTransform:"uppercase",
            fontFamily:T.serif }}>Theme Collection</div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:T.muted, fontSize:20,
            cursor:"pointer", lineHeight:1 }}>×</button>
        </div>
        {categories.map(cat => {
          if (cat.skins.length === 0) return null;
          return (
            <div key={cat.label} style={{ marginBottom:16 }}>
              <div style={{ fontSize:9, fontWeight:700, letterSpacing:2, textTransform:"uppercase",
                color:T.dim, fontFamily:T.mono, marginBottom:8 }}>{cat.label}</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                {cat.skins.map(skin => {
                  const unlocked = isSkinUnlocked(skin, stats, chips, vipTierId);
                  const selected = currentSkin === skin.id;
                  const isSecret = skin.type === "secret" && !unlocked;
                  return (
                    <button key={skin.id} onClick={() => unlocked && onSelect(skin.id)}
                      style={{
                        padding:"10px 8px", borderRadius:10, cursor: unlocked ? "pointer" : "not-allowed",
                        background: selected ? `${skin.accent}15` : "rgba(255,255,255,0.02)",
                        border: selected ? `1.5px solid ${skin.accent}60` : "1px solid rgba(255,255,255,0.06)",
                        opacity: unlocked ? 1 : 0.45, transition:"all 0.2s", textAlign:"center",
                        position:"relative", overflow:"hidden",
                      }}>
                      {}
                      {unlocked && SKIN_THEMES[skin.id]?.bgGradient && SKIN_THEMES[skin.id].bgGradient !== "d" && (
                        <div style={{ position:"absolute", inset:0, borderRadius:10,
                          background:SKIN_THEMES[skin.id].bgGradient, opacity:0.5, pointerEvents:"none" }} />
                      )}
                      {}
                      <div style={{ display:"flex", justifyContent:"center", gap:2, marginBottom:6, position:"relative" }}>
                        {skin.effect && unlocked && <ChipSkinEffect effect={skin.effect} accent={skin.accent} />}
                        {skin.colors.slice(0, 3).map((c, i) => (
                          <svg key={i} width={20} height={20} viewBox="0 0 20 20">
                            <ellipse cx={10} cy={11} rx={8} ry={3} fill={unlocked ? c.rim : "#333"} />
                            <ellipse cx={10} cy={10} rx={8} ry={3} fill={unlocked ? c.fill : "#444"} />
                            <ellipse cx={10} cy={10} rx={5} ry={1.8} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={0.4} />
                          </svg>
                        ))}
                      </div>
                      <div style={{ fontSize:10, fontWeight:700, color: unlocked ? (selected ? skin.accent : T.text) : T.dim,
                        fontFamily:T.serif, letterSpacing:0.5, marginBottom:2 }}>
                        {isSecret ? "???" : skin.icon + " " + skin.name}
                      </div>
                      <div style={{ fontSize:8, color: unlocked ? T.muted : T.dim, fontFamily:T.mono }}>
                        {unlocked ? (selected ? "✓ EQUIPPED" : "Tap to equip") : (isSecret ? "Hidden unlock" : skin.desc)}
                      </div>
                      {selected && <div style={{ position:"absolute", top:4, right:6, fontSize:8, fontWeight:700,
                        color:skin.accent, fontFamily:T.mono }}>✓</div>}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
        <div style={{ textAlign:"center", marginTop:10, fontSize:9, color:T.dim,
          fontFamily:T.mono, letterSpacing:1 }}>
          {getUnlockedSkins(stats, chips, vipTierId).length} / {CHIP_SKINS.length} unlocked
        </div>
      </div>
    </div>
  );
}
