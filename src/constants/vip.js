import { ACHIEVEMENTS } from "./achievements.js";

export const VIP_TIERS = [
  { id:"bronze",    label:"Bronze",    minPoints:0,       color:"#cd7f32", icon:"III", border:"rgba(205,127,50,0.4)",  rebuy:1000 },
  { id:"silver",    label:"Silver",    minPoints:2000,    color:"#c0c0c0", icon:"II", border:"rgba(192,192,192,0.4)", rebuy:5000 },
  { id:"gold",      label:"Gold",      minPoints:5000,    color:"#d4af37", icon:"I", border:"rgba(212,175,55,0.5)",  rebuy:25000 },
  { id:"platinum",  label:"Platinum",  minPoints:10000,   color:"#b0c4de", icon:"◆", border:"rgba(176,196,222,0.5)", rebuy:100000 },
  { id:"emerald",   label:"Emerald",   minPoints:20000,   color:"#10b981", icon:"●", border:"rgba(16,185,129,0.5)",  rebuy:500000 },
  { id:"diamond",   label:"Diamond",   minPoints:40000,   color:"#e0e7ff", icon:"♛", border:"rgba(224,231,255,0.6)", rebuy:2000000 },
  { id:"celestial", label:"Celestial", minPoints:90000,   color:"#f59e0b", icon:"★", border:"rgba(245,158,11,0.6)",  rebuy:10000000 },
  { id:"royale",    label:"Royale",    minPoints:120000,  color:"#ff4500", icon:"♠", border:"rgba(255,69,0,0.6)",    rebuy:100000000, requiresAllAchievements:true },
];

export const VAULT_YEAR_THRESHOLDS = {
  bronze:100000, silver:500000, gold:2500000, platinum:10000000,
  emerald:50000000, diamond:200000000, celestial:1000000000, royale:7500000000,
};

export const ACH_POINTS = {
  // Tier 1 — 150 pts (easy / first-time)
  first_win:150, streak_5:150, played_all:150, bankroll_10k:150, rounds_1k:150,
  vault_first:150, vault_10k:150,

  // Tier 2 — 400 pts (uncommon)
  wins_100:400, high_roller:400, wagered_100k:400, streak_10:400, bankroll_25k:400,
  vip_silver:400, rounds_5k:400, wins_1k:400, comeback:400,
  interest_first:400, vault_bust:400,

  // Tier 3 — 750 pts (rare, mid-game)
  all_in_25:750, big_win_10k_j:750, wagered_1m:750, vip_gold:750, bankroll_100k:750,
  high_roller_50k:750, rounds_10k:750, vault_1m:750, debt_cleared:750, loss_10:750,

  // Tier 4 — 1,500 pts (hard, late-game)
  high_roller_250k:1500, big_win_100k:1500, big_win_1m:1500, vip_platinum:1500,
  wagered_100m:1500, rebuy_100:1500, bankroll_1m:1500, vault_100m:1500, interest_10:1500,

  // Tier 5 — 2,500 pts (very hard)
  high_roller_1m:2500, high_roller_100m:2500, big_win_100m:2500,
  vip_emerald:2500, vip_diamond:2500, vip_celestial:2500, bankroll_10m:2500,

  // Tier 6 — 4,000 pts (endgame)
  streak_20:4000, bankroll_1b:4000, big_win_1b:4000, wagered_5b:4000, wins_5k:4000,
};

export const calcVipPoints = (stats) => {
  let pts = 0;
  (stats.achievements || []).forEach(id => { pts += ACH_POINTS[id] || 0; });
  let activityPts = Math.floor(Math.sqrt(stats.totalWagered || 0))
    + (stats.totalRounds || 0) * 2
    + (stats.totalWins || 0)
    + (stats.vipBonusPoints || 0);
  const rebuyCount = stats.rebuyCount || 0;
  if ((stats.totalDebt || 0) > 0 && rebuyCount >= 3) {
    activityPts = Math.floor(activityPts * 0.70);
  } else if ((stats.totalDebt || 0) > 0 && rebuyCount >= 2) {
    activityPts = Math.floor(activityPts * 0.85);
  }
  pts += activityPts;
  pts -= (stats.vipPenaltyPoints || 0);
  return Math.max(0, pts);
};

export const getVipTier = (points, achievementCount = 0) => {
  for (let i = VIP_TIERS.length - 1; i >= 0; i--) {
    const t = VIP_TIERS[i];
    if (t.requiresAllAchievements && achievementCount < ACHIEVEMENTS.length - 3) continue;
    if (points >= t.minPoints) return t;
  }
  return VIP_TIERS[0];
};

export const getNextVipTier = (points, achievementCount = 0) => {
  const current = getVipTier(points, achievementCount);
  const currentIdx = VIP_TIERS.indexOf(current);
  if (currentIdx < VIP_TIERS.length - 1) return VIP_TIERS[currentIdx + 1];
  return null;
};
