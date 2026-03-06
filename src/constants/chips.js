import { DARK_BG } from "./styles.js";
import { ACH_POINTS } from "./vip.js";

export const CHIP_SKINS = [
  { id:"house", name:"House Chips", desc:"Standard casino floor", icon:"♠", type:"default", req:null, effect:null,
    colors:[{fill:"#c0392b",rim:"#961d13"},{fill:"#2980b9",rim:"#1a5a80"},{fill:"#27ae60",rim:"#1a7a40"},{fill:"#8e44ad",rim:"#632e7a"},{fill:"#d4af37",rim:"#a07c10"},{fill:"#e67e22",rim:"#a85510"},{fill:"#1abc9c",rim:"#128068"},{fill:"#f39c12",rim:"#b07008"}],
    accent:"#d4af37" },
  { id:"luckystreak", name:"Lucky Streak", desc:"Win 10 in a row", icon:"♣", type:"achievement", req:"streak_10", effect:"subtleglow",
    colors:[{fill:"#10b981",rim:"#087a55"},{fill:"#22d394",rim:"#10a06a"},{fill:"#d4af37",rim:"#a07c10"},{fill:"#16c788",rim:"#0c8a5a"},{fill:"#10b981",rim:"#087a55"},{fill:"#d4af37",rim:"#a07c10"},{fill:"#22d394",rim:"#10a06a"},{fill:"#16c788",rim:"#0c8a5a"}],
    accent:"#22d394" },
  { id:"shark", name:"Shark", desc:"Win 1,000 rounds", icon:"▸", type:"achievement", req:"wins_1k", effect:"subtleglow",
    colors:[{fill:"#4a5568",rim:"#2d3748"},{fill:"#38504a",rim:"#1e3830"},{fill:"#c0392b",rim:"#8a2018"},{fill:"#4a5568",rim:"#2d3748"},{fill:"#3a5a50",rim:"#1e3830"},{fill:"#4a5568",rim:"#2d3748"},{fill:"#38504a",rim:"#1e3830"},{fill:"#c0392b",rim:"#8a2018"}],
    accent:"#4a5568" },
  { id:"whale", name:"Whale", desc:"Wager $10,000,000 total", icon:"$$", type:"stat", req:{stat:"totalWagered",val:10000000}, effect:"subtleglow",
    colors:[{fill:"#1e3a5f",rim:"#0f2440"},{fill:"#2a5080",rim:"#183460"},{fill:"#e8e0d0",rim:"#c0b8a8"},{fill:"#1e3a5f",rim:"#0f2440"},{fill:"#2a5080",rim:"#183460"},{fill:"#e8e0d0",rim:"#c0b8a8"},{fill:"#1e4a6f",rim:"#0f2e50"},{fill:"#2a5080",rim:"#183460"}],
    accent:"#2a5080" },
  { id:"degenerate", name:"Degenerate", desc:"Go broke 100 times", icon:"✗", type:"achievement", req:"rebuy_100", effect:"subtleglow",
    colors:[{fill:"#8b4513",rim:"#5a2d0a"},{fill:"#6b3a10",rim:"#4a2508"},{fill:"#a0522d",rim:"#6b3518"},{fill:"#7a3b12",rim:"#52280c"},{fill:"#8b4513",rim:"#5a2d0a"},{fill:"#6b3a10",rim:"#4a2508"},{fill:"#a0522d",rim:"#6b3518"},{fill:"#7a3b12",rim:"#52280c"}],
    accent:"#8b4513" },
  { id:"unstoppable", name:"Unstoppable", desc:"Win 20 in a row", icon:"⚡", type:"achievement", req:"streak_20", effect:"lightning",
    colors:[{fill:"#1e40af",rim:"#142e7a"},{fill:"#3b82f6",rim:"#2060c0"},{fill:"#e0f0ff",rim:"#a0c0e0"},{fill:"#2563eb",rim:"#1a4aB0"},{fill:"#1e40af",rim:"#142e7a"},{fill:"#e0f0ff",rim:"#a0c0e0"},{fill:"#3b82f6",rim:"#2060c0"},{fill:"#2563eb",rim:"#1a4aB0"}],
    accent:"#3b82f6" },
  { id:"onepercent", name:"One Percent", desc:"Reach $1B bankroll", icon:"◆", type:"achievement", req:"bankroll_1b", effect:"prismatic",
    colors:[{fill:"#e8e8f0",rim:"#b0b0c0"},{fill:"#f0e8ff",rim:"#c0b0d8"},{fill:"#e0f0f8",rim:"#a8c8d8"},{fill:"#f8f0e8",rim:"#d0c0a8"},{fill:"#f0e8f0",rim:"#c0b0c0"},{fill:"#e8f0e8",rim:"#b0c8b0"},{fill:"#f0f0e0",rim:"#c0c0a0"},{fill:"#e8e8f0",rim:"#b0b0c0"}],
    accent:"#e0e0f0" },
  { id:"billiondollar", name:"Billion Dollar", desc:"Win $1B in one bet", icon:"▲", type:"achievement", req:"big_win_1b", effect:"ember",
    colors:[{fill:"#ffd700",rim:"#b89a00"},{fill:"#ff4500",rim:"#b83000"},{fill:"#1a0a00",rim:"#0a0500"},{fill:"#ff6a00",rim:"#b84a00"},{fill:"#ffd700",rim:"#b89a00"},{fill:"#1a0a00",rim:"#0a0500"},{fill:"#ff4500",rim:"#b83000"},{fill:"#ff6a00",rim:"#b84a00"}],
    accent:"#ff6a00" },
  { id:"degenlord", name:"Degen Lord", desc:"Wager $5B total", icon:"☣", type:"achievement", req:"wagered_5b", effect:"toxic",
    colors:[{fill:"#39ff14",rim:"#20b00a"},{fill:"#1a0a30",rim:"#0a0518"},{fill:"#bf00ff",rim:"#8000aa"},{fill:"#39ff14",rim:"#20b00a"},{fill:"#1a0a30",rim:"#0a0518"},{fill:"#bf00ff",rim:"#8000aa"},{fill:"#39ff14",rim:"#20b00a"},{fill:"#1a0a30",rim:"#0a0518"}],
    accent:"#39ff14" },
  { id:"legend", name:"Legend", desc:"Win 5,000 bets", icon:"★", type:"achievement", req:"wins_5k", effect:"radiance",
    colors:[{fill:"#b8860b",rim:"#7a5a08"},{fill:"#8b0000",rim:"#5a0000"},{fill:"#fffff0",rim:"#d0d0c0"},{fill:"#b8860b",rim:"#7a5a08"},{fill:"#8b0000",rim:"#5a0000"},{fill:"#fffff0",rim:"#d0d0c0"},{fill:"#b8860b",rim:"#7a5a08"},{fill:"#8b0000",rim:"#5a0000"}],
    accent:"#b8860b" },
  { id:"vip_bronze", name:"Bronze Glow", desc:"Reach Bronze VIP", icon:"III", type:"vip", req:"bronze", effect:null,
    colors:[{fill:"#cd7f32",rim:"#8a5520"},{fill:"#b87333",rim:"#7a4a1a"},{fill:"#da8a40",rim:"#9a6020"},{fill:"#c07830",rim:"#82501a"},{fill:"#cd7f32",rim:"#8a5520"},{fill:"#b87333",rim:"#7a4a1a"},{fill:"#da8a40",rim:"#9a6020"},{fill:"#c07830",rim:"#82501a"}],
    accent:"#cd7f32" },
  { id:"vip_silver", name:"Silver Mist", desc:"Reach Silver VIP", icon:"II", type:"vip", req:"silver", effect:"mist",
    colors:[{fill:"#c0c0c0",rim:"#8a8a8a"},{fill:"#d0d0d0",rim:"#9a9a9a"},{fill:"#a8a8b8",rim:"#787888"},{fill:"#b8b8c8",rim:"#888898"},{fill:"#c8c8c8",rim:"#929292"},{fill:"#d0d0d0",rim:"#9a9a9a"},{fill:"#b0b0c0",rim:"#808090"},{fill:"#c0c0c0",rim:"#8a8a8a"}],
    accent:"#c0c0c0" },
  { id:"vip_gold", name:"Neon Vegas", desc:"Reach Gold VIP", icon:"I", type:"vip", req:"gold", effect:"neonpulse",
    colors:[{fill:"#ff1493",rim:"#b80d6a"},{fill:"#00e5ff",rim:"#009ab0"},{fill:"#bf00ff",rim:"#8000aa"},{fill:"#ff1493",rim:"#b80d6a"},{fill:"#00e5ff",rim:"#009ab0"},{fill:"#bf00ff",rim:"#8000aa"},{fill:"#ff1493",rim:"#b80d6a"},{fill:"#00e5ff",rim:"#009ab0"}],
    accent:"#ff1493" },
  { id:"vip_platinum", name:"Frost Crystal", desc:"Reach Platinum VIP", icon:"❄", type:"vip", req:"platinum", effect:"frost",
    colors:[{fill:"#a8d8ea",rim:"#6aa0b8"},{fill:"#b0d4e8",rim:"#78a8c8"},{fill:"#e0f0ff",rim:"#a0c0d8"},{fill:"#90c8e0",rim:"#5a98b0"},{fill:"#c0e0f0",rim:"#88b0c8"},{fill:"#a8d8ea",rim:"#6aa0b8"},{fill:"#b0d4e8",rim:"#78a8c8"},{fill:"#e0f0ff",rim:"#a0c0d8"}],
    accent:"#a8d8ea" },
  { id:"vip_emerald", name:"Emerald Fire", desc:"Reach Emerald VIP", icon:"●", type:"vip", req:"emerald", effect:"greenflame",
    colors:[{fill:"#10b981",rim:"#087a55"},{fill:"#0d9668",rim:"#066840"},{fill:"#14d494",rim:"#0aa070"},{fill:"#10b981",rim:"#087a55"},{fill:"#ff6b35",rim:"#c04a20"},{fill:"#10b981",rim:"#087a55"},{fill:"#0d9668",rim:"#066840"},{fill:"#ff6b35",rim:"#c04a20"}],
    accent:"#10b981" },
  { id:"vip_diamond", name:"Obsidian", desc:"Reach Diamond VIP", icon:"◼", type:"vip", req:"diamond", effect:"smoke",
    colors:[{fill:"#1a1a2e",rim:"#0a0a18"},{fill:"#0f0f20",rim:"#050510"},{fill:"#c2185b",rim:"#8a1040"},{fill:"#1a1a2e",rim:"#0a0a18"},{fill:"#0f0f20",rim:"#050510"},{fill:"#c2185b",rim:"#8a1040"},{fill:"#1a1a2e",rim:"#0a0a18"},{fill:"#0f0f20",rim:"#050510"}],
    accent:"#c2185b" },
  { id:"vip_celestial", name:"Celestial", desc:"Reach Celestial VIP", icon:"★", type:"vip", req:"celestial", effect:"stars",
    colors:[{fill:"#1e1b4b",rim:"#0e0b30"},{fill:"#312e81",rim:"#1e1b5a"},{fill:"#f59e0b",rim:"#b87308"},{fill:"#1e1b4b",rim:"#0e0b30"},{fill:"#f59e0b",rim:"#b87308"},{fill:"#312e81",rim:"#1e1b5a"},{fill:"#f59e0b",rim:"#b87308"},{fill:"#1e1b4b",rim:"#0e0b30"}],
    accent:"#f59e0b" },
  { id:"vip_royale", name:"Royale", desc:"Reach Royale VIP", icon:"♠", type:"vip", req:"royale", effect:"royalflame",
    colors:[{fill:"#ff4500",rim:"#b83000"},{fill:"#1a0a00",rim:"#0a0500"},{fill:"#ff4500",rim:"#b83000"},{fill:"#ffd700",rim:"#b89a00"},{fill:"#1a0a00",rim:"#0a0500"},{fill:"#ff4500",rim:"#b83000"},{fill:"#ffd700",rim:"#b89a00"},{fill:"#1a0a00",rim:"#0a0500"}],
    accent:"#ff4500" },
  { id:"jackpot", name:"Jackpot", desc:"Hit a scratch card jackpot", icon:"$", type:"secret", req:"jackpot_hit", effect:"divineaureole",
    colors:[{fill:"#ffd700",rim:"#b89a00"},{fill:"#ffea00",rim:"#c0a800"},{fill:"#ffc400",rim:"#a88800"},{fill:"#ffe040",rim:"#b8a020"},{fill:"#ffd700",rim:"#b89a00"},{fill:"#ffea00",rim:"#c0a800"},{fill:"#ffc400",rim:"#a88800"},{fill:"#ffe040",rim:"#b8a020"}],
    accent:"#ffd700" },
  { id:"completionist", name:"Completionist", desc:"Unlock every achievement", icon:"∞", type:"secret", req:"_all_achievements", effect:"rainbow",
    colors:[{fill:"#ff0055",rim:"#cc0044"},{fill:"#ff6600",rim:"#cc5200"},{fill:"#ffdd00",rim:"#ccb100"},{fill:"#00ff66",rim:"#00cc52"},{fill:"#00ccff",rim:"#00a3cc"},{fill:"#6600ff",rim:"#5200cc"},{fill:"#ff00cc",rim:"#cc00a3"},{fill:"#ffffff",rim:"#cccccc"}],
    accent:"#ff6ec7", neonCycle:true },
];

export const INSANE_ACHS = ["streak_20","bankroll_1b","big_win_1b","wagered_5b","wins_5k"];

export const isSkinUnlocked = (skin, stats, chips, vipTierId) => {
  if (skin.type === "default") return true;
  if (skin.type === "achievement") return (stats.achievements || []).includes(skin.req);
  if (skin.type === "stat") return (stats[skin.req.stat] || 0) >= skin.req.val;
  if (skin.type === "vip") {
    const tierOrder = ["bronze","silver","gold","platinum","emerald","diamond","celestial","royale"];
    return tierOrder.indexOf(vipTierId) >= tierOrder.indexOf(skin.req);
  }
  if (skin.type === "secret") {
    if (skin.req === "_all_achievements") {
      const allAchs = Object.keys(ACH_POINTS);
      return allAchs.every(a => (stats.achievements || []).includes(a));
    }
    return (stats.achievements || []).includes(skin.req) || (stats.secretUnlocks || []).includes(skin.req);
  }
  return false;
};

export const getUnlockedSkins = (stats, chips, vipTierId) =>
  CHIP_SKINS.filter(s => isSkinUnlocked(s, stats, chips, vipTierId)).map(s => s.id);

export const getChipSkin = (skinId) => CHIP_SKINS.find(s => s.id === skinId) || CHIP_SKINS[0];

export const SKIN_THEMES = {
  house: { tier:0, accent:"#d4af37", accentDim:"#b8941e", navTint:"transparent",
    modalBg:"linear-gradient(180deg, #1e1e34, #15152a)", modalBorder:"rgba(212,175,55,0.2)",
    bgGradient:"d", tableFelt:"d", cardTint:"d", particles:null },
  luckystreak: { tier:1, accent:"#22d394", accentDim:"#10a06a", navTint:"rgba(16,185,129,0.06)",
    modalBg:"linear-gradient(180deg, #162a22, #10201a)", modalBorder:"rgba(34,211,148,0.2)",
    bgGradient:"d", tableFelt:"d", cardTint:"d", particles:null },
  shark: { tier:1, accent:"#6b8090", accentDim:"#4a5568", navTint:"rgba(74,85,104,0.06)",
    modalBg:"linear-gradient(180deg, #1a2028, #14181e)", modalBorder:"rgba(74,85,104,0.2)",
    bgGradient:"d", tableFelt:"d", cardTint:"d", particles:null },
  whale: { tier:1, accent:"#4a90c0", accentDim:"#2a5080", navTint:"rgba(42,80,128,0.06)",
    modalBg:"linear-gradient(180deg, #14202e, #0e1822)", modalBorder:"rgba(42,80,128,0.2)",
    bgGradient:"d", tableFelt:"d", cardTint:"d", particles:null },
  degenerate: { tier:1, accent:"#a0724a", accentDim:"#8b4513", navTint:"rgba(139,69,19,0.06)",
    modalBg:"linear-gradient(180deg, #221a12, #1a140e)", modalBorder:"rgba(139,69,19,0.2)",
    bgGradient:"d", tableFelt:"d", cardTint:"d", particles:null },
  vip_bronze: { tier:1, accent:"#cd7f32", accentDim:"#8a5520", navTint:"rgba(205,127,50,0.06)",
    modalBg:"linear-gradient(180deg, #22180e, #1a1208)", modalBorder:"rgba(205,127,50,0.2)",
    bgGradient:"d", tableFelt:"d", cardTint:"d", particles:null },
  vip_silver: { tier:2, accent:"#c0c0c0", accentDim:"#8a8a8a", navTint:"rgba(192,192,192,0.07)",
    modalBg:"linear-gradient(180deg, #1e1e24, #16161c)", modalBorder:"rgba(192,192,192,0.2)",
    bgGradient:"d", tableFelt:"d", cardTint:"d", particles:null },
  vip_gold: { tier:2, accent:"#ff1493", accentDim:"#b80d6a", navTint:"rgba(255,20,147,0.06)",
    modalBg:"linear-gradient(180deg, #28102a, #1e0a1e)", modalBorder:"rgba(255,20,147,0.2)",
    bgGradient:"d", tableFelt:"d", cardTint:"d", particles:null },
  vip_platinum: { tier:2, accent:"#a8d8ea", accentDim:"#6aa0b8", navTint:"rgba(168,216,234,0.06)",
    modalBg:"linear-gradient(180deg, #141e28, #0e1620)", modalBorder:"rgba(168,216,234,0.2)",
    bgGradient:"d", tableFelt:"d", cardTint:"d", particles:null },
  vip_emerald: { tier:2, accent:"#10b981", accentDim:"#087a55", navTint:"rgba(16,185,129,0.06)",
    modalBg:"linear-gradient(180deg, #0e221a, #081a14)", modalBorder:"rgba(16,185,129,0.2)",
    bgGradient:"d", tableFelt:"d", cardTint:"d", particles:null },
  vip_diamond: { tier:3, accent:"#c2185b", accentDim:"#8a1040", navTint:"rgba(194,24,91,0.08)",
    modalBg:"linear-gradient(180deg, #1a0a18, #100810)", modalBorder:"rgba(194,24,91,0.25)",
    bgGradient:"radial-gradient(ellipse at center, #18081a 0%, #0e050f 60%, #080308 100%)",
    tableFelt:"#1a0a1e", cardTint:"rgba(194,24,91,0.05)",
    particles:{ type:"smoke", color:"#c2185b", count:22, speed:0.3, tier:3 } },
  vip_celestial: { tier:3, accent:"#f59e0b", accentDim:"#b87308", navTint:"rgba(245,158,11,0.08)",
    modalBg:"linear-gradient(180deg, #12102e, #0a081e)", modalBorder:"rgba(245,158,11,0.25)",
    bgGradient:"radial-gradient(ellipse at center, #0e0c28 0%, #080620 60%, #04030e 100%)",
    tableFelt:"#0e0a28", cardTint:"rgba(245,158,11,0.05)",
    particles:{ type:"stars", color:"#f59e0b", count:25, speed:0.2, tier:3 } },
  legend: { tier:3, accent:"#c8a020", accentDim:"#8a6d0b", navTint:"rgba(184,134,11,0.08)",
    modalBg:"linear-gradient(180deg, #221a0e, #1a1208)", modalBorder:"rgba(184,134,11,0.25)",
    bgGradient:"radial-gradient(ellipse at center, #1a140a 0%, #120e06 60%, #0a0804 100%)",
    tableFelt:"#1a100a", cardTint:"rgba(184,134,11,0.05)",
    particles:{ type:"motes", color:"#d4af37", count:22, speed:0.25, tier:3 } },
  unstoppable: { tier:4, accent:"#3b82f6", accentDim:"#2060c0", navTint:"rgba(59,130,246,0.10)",
    modalBg:"linear-gradient(180deg, #0e1830, #081020)", modalBorder:"rgba(59,130,246,0.3)",
    bgGradient:"radial-gradient(ellipse at center, #0c1428 0%, #060e1e 60%, #020810 100%)",
    tableFelt:"#0a1228", cardTint:"rgba(59,130,246,0.06)",
    particles:{ type:"sparks", color:"#3b82f6", count:32, speed:0.6, tier:4 } },
  onepercent: { tier:4, accent:"#c8b8e8", accentDim:"#9080b8", navTint:"rgba(200,184,232,0.08)",
    modalBg:"linear-gradient(180deg, #1a162e, #121020)", modalBorder:"rgba(200,184,232,0.3)",
    bgGradient:"radial-gradient(ellipse at center, #16122a 0%, #0e0a20 60%, #06040e 100%)",
    tableFelt:"#14102a", cardTint:"rgba(200,184,232,0.05)",
    particles:{ type:"sparkle", color:"#e0d0ff", count:35, speed:0.15, tier:4 } },
  billiondollar: { tier:4, accent:"#ff6a00", accentDim:"#b84a00", navTint:"rgba(255,106,0,0.10)",
    modalBg:"linear-gradient(180deg, #261008, #1a0a04)", modalBorder:"rgba(255,106,0,0.3)",
    bgGradient:"radial-gradient(ellipse at center, #1e0e06 0%, #140804 60%, #0a0402 100%)",
    tableFelt:"#1c0a08", cardTint:"rgba(255,69,0,0.06)",
    particles:{ type:"embers", color:"#ff6a00", count:30, speed:0.4, tier:4 } },
  degenlord: { tier:4, accent:"#39ff14", accentDim:"#20b00a", navTint:"rgba(57,255,20,0.08)",
    modalBg:"linear-gradient(180deg, #0a1e0a, #061406)", modalBorder:"rgba(57,255,20,0.3)",
    bgGradient:"radial-gradient(ellipse at center, #081a0c 0%, #041008 60%, #020804 100%)",
    tableFelt:"#0a160e", cardTint:"rgba(57,255,20,0.05)",
    particles:{ type:"bubbles", color:"#39ff14", count:30, speed:0.35, tier:4 } },
  vip_royale: { tier:4, accent:"#ff4500", accentDim:"#b83000", navTint:"rgba(255,69,0,0.10)",
    modalBg:"linear-gradient(180deg, #261008, #1a0804)", modalBorder:"rgba(255,69,0,0.3)",
    bgGradient:"radial-gradient(ellipse at center, #1c0c06 0%, #120804 60%, #0a0402 100%)",
    tableFelt:"#1a0808", cardTint:"rgba(255,69,0,0.06)",
    particles:{ type:"sparks", color:"#ff6a00", count:32, speed:0.5, tier:4 } },
  jackpot: { tier:5, accent:"#ffd700", accentDim:"#b89a00", navTint:"rgba(255,215,0,0.15)",
    modalBg:"linear-gradient(180deg, #1e1608 0%, #120e04 50%, #0a0802 100%)", modalBorder:"rgba(255,215,0,0.4)",
    bgGradient:"radial-gradient(ellipse at 50% 30%, #2a1e08 0%, #18120a 35%, #0e0a04 65%, #060402 100%)",
    tableFelt:"#1e1608", cardTint:"rgba(255,215,0,0.06)",
    particles:{ type:"goldenergy", color:"#ffd700", count:40, speed:0.3, tier:5 } },
  completionist: { tier:5, accent:"#ff6ec7", accentDim:"#c850a0", navTint:"rgba(255,110,199,0.1)",
    modalBg:"linear-gradient(180deg, #1e1028, #140a20)", modalBorder:"rgba(255,110,199,0.3)",
    bgGradient:"linear-gradient(135deg, #0a0618 0%, #140820 25%, #0e0618 50%, #10061a 75%, #0a0418 100%)",
    tableFelt:"#120e1e", cardTint:"rgba(255,200,255,0.04)",
    particles:{ type:"rainbow", color:"#ffffff", count:50, speed:0.26, tier:5 } },
};

export const getActiveTheme = (skinId) => {
  const st = SKIN_THEMES[skinId] || SKIN_THEMES.house;
  return {
    ...st,
    bgGradient: st.bgGradient === "d" ? DARK_BG : st.bgGradient,
    tableFelt: st.tableFelt === "d" ? null : st.tableFelt,
    cardTint: st.cardTint === "d" ? null : st.cardTint,
  };
};
