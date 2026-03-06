export const SHOP_ITEMS = [
  // ── DOUBLE ──────────────────────────────────────────────────
  { id:"dd_2x1",   cat:"double",  name:"Double Down",       tier:"2× · 1 win",  desc:"Next win pays 2×",             icon:"×2", costMulti:1.5, rarity:"common",   effect:{ type:"winMulti", multi:2, wins:1 } },
  { id:"dd_2x3",   cat:"double",  name:"Double Down",       tier:"2× · 3 wins", desc:"Next 3 wins pay 2×",           icon:"×2", costMulti:3.5, rarity:"rare",     effect:{ type:"winMulti", multi:2, wins:3 } },
  { id:"dd_5x1",   cat:"double",  name:"Double Down",       tier:"5× · 1 win",  desc:"Next win pays 5×",             icon:"×5", costMulti:5.0, rarity:"epic",     effect:{ type:"winMulti", multi:5, wins:1 } },
  { id:"dd_10x1",  cat:"double",  name:"Double Down",       tier:"10× · 1 win", desc:"Next win pays 10×",            icon:"×10",costMulti:8.0, rarity:"legendary",effect:{ type:"winMulti", multi:10, wins:1 } },
  // ── VIP ─────────────────────────────────────────────────────
  { id:"vip_2x25", cat:"vip",     name:"VIP Express",       tier:"2× · 25 bets",desc:"2× VIP pts for 25 bets",       icon:"★",  costMulti:1.5, rarity:"common",   effect:{ type:"vipMulti", multi:2, bets:25 } },
  { id:"vip_3x50", cat:"vip",     name:"VIP Express",       tier:"3× · 50 bets",desc:"3× VIP pts for 50 bets",       icon:"★",  costMulti:2.0, rarity:"uncommon", effect:{ type:"vipMulti", multi:3, bets:50 } },
  { id:"vip_5x25", cat:"vip",     name:"VIP Express",       tier:"5× · 25 bets",desc:"5× VIP pts for 25 bets",       icon:"★",  costMulti:3.5, rarity:"rare",     effect:{ type:"vipMulti", multi:5, bets:25 } },
  // ── INSURANCE ───────────────────────────────────────────────
  { id:"ins_1",    cat:"insure",  name:"Insurance",         tier:"1 bet",        desc:"Next lost bet fully refunded", icon:"◈",  costMulti:5.0, rarity:"legendary",effect:{ type:"insurance", bets:1 } },
  { id:"ins_3",    cat:"_mythic", name:"Insurance",         tier:"3 bets",       desc:"Next 3 lost bets refunded",    icon:"◈",  costMulti:8.0, rarity:"mythic",   effect:{ type:"insurance", bets:3 } },
  // ── SHIELD ──────────────────────────────────────────────────
  { id:"shield_30",cat:"shield",  name:"Profit Shield",     tier:"30%",          desc:"Keep 30% if next bet loses",   icon:"◇",  costMulti:0.5, rarity:"common",   effect:{ type:"shield", keep:0.3, uses:1 } },
  { id:"shield_50",cat:"shield",  name:"Profit Shield",     tier:"50%",          desc:"Keep 50% if next bet loses",   icon:"◇",  costMulti:2.0, rarity:"rare",     effect:{ type:"shield", keep:0.5, uses:1 } },
  { id:"streak_shield",  cat:"shield",  name:"Streak Shield",     tier:"1 loss",  desc:"Next loss does not reset win streak",    icon:"⚡", costMulti:3.0, rarity:"epic",      effect:{ type:"streakShield", uses:1 } },
  { id:"shield_80",cat:"shield",  name:"Profit Shield",     tier:"80%",          desc:"Keep 80% if next bet loses",   icon:"◆",  costMulti:4.0, rarity:"epic",     effect:{ type:"shield", keep:0.8, uses:1 } },
  // ── VAULT ───────────────────────────────────────────────────
  { id:"vault_guard_s",  cat:"vault",   name:"Vault Guard",       tier:"Partial · 1 bust",  desc:"Vault bust burn: 35% → 20%",            icon:"🛡", costMulti:0.8, rarity:"common",    effect:{ type:"vaultGuard", reduceTo:0.20, uses:1 } },
  { id:"interest_cat_2x",cat:"vault",   name:"Interest Catalyst", tier:"2× · next payout",  desc:"Next vault interest payment ×2",        icon:"↑", costMulti:2.0, rarity:"uncommon",  effect:{ type:"interestCatalyst", multi:2, uses:1 } },
  { id:"vault_guard_m",  cat:"vault",   name:"Vault Guard",       tier:"Major · 1 bust",    desc:"Vault bust burn: 35% → 10%",            icon:"🛡", costMulti:2.0, rarity:"rare",      effect:{ type:"vaultGuard", reduceTo:0.10, uses:1 } },
  { id:"interest_cat_3x",cat:"vault",   name:"Interest Catalyst", tier:"3× · next payout",  desc:"Next vault interest payment ×3",        icon:"↑", costMulti:3.5, rarity:"rare",      effect:{ type:"interestCatalyst", multi:3, uses:1 } },
  { id:"vault_guard_l",  cat:"vault",   name:"Vault Guard",       tier:"Full · 1 bust",     desc:"Vault bust burn: 35% → 0% (full waive)",icon:"🛡", costMulti:5.0, rarity:"legendary", effect:{ type:"vaultGuard", reduceTo:0.00, uses:1 } },
  // ── DEBT ────────────────────────────────────────────────────
  { id:"debt_erase_h",   cat:"debt",    name:"Debt Eraser",       tier:"50% · instant",     desc:"Instantly wipe 50% of current debt",    icon:"✕", costMulti:2.5, rarity:"rare",      effect:{ type:"debtErase", percent:0.50, uses:1 } },
  { id:"debt_erase_f",   cat:"debt",    name:"Debt Eraser",       tier:"Full · instant",    desc:"Instantly wipe 100% of current debt",   icon:"✕", costMulti:5.5, rarity:"legendary", effect:{ type:"debtErase", percent:1.00, uses:1 } },
  // ── MYSTERY ─────────────────────────────────────────────────
  { id:"mbox_s",   cat:"mystery", name:"Mystery Box",       tier:"Small",        desc:"Mostly common/uncommon drops", icon:"?",  costMulti:2.5, rarity:"mystery",  effect:{ type:"mystery", tier:1 } },
  { id:"mbox_l",   cat:"mystery", name:"Mystery Box",       tier:"Large",        desc:"Better odds at rare+ drops",   icon:"??", costMulti:4.0, rarity:"mystery",  effect:{ type:"mystery", tier:2 } },
  { id:"mbox_leg", cat:"mystery", name:"Mystery Box",       tier:"Legendary",    desc:"Best odds at epic+ drops",     icon:"???",costMulti:6.0, rarity:"mystery",  effect:{ type:"mystery", tier:3 } },
];

export const MYSTERY_DROP_RATES = {
  1: { common:42, uncommon:27, rare:16, epic:10, legendary:5, mythic:0 },
  2: { common:0, uncommon:30, rare:37, epic:20, legendary:10, mythic:3 },
  3: { common:0, uncommon:0, rare:28, epic:35, legendary:27, mythic:10 },
};

export const RARITY_COLORS = { common:"#9ca3af", uncommon:"#22c55e", rare:"#3b82f6", epic:"#a855f7", legendary:"#f59e0b", mythic:"#ff4500" };

export const SHOP_CATEGORIES = [
  { id:"double",  name:"Double Down",  icon:"×2" },
  { id:"vip",     name:"VIP Express",  icon:"★" },
  { id:"insure",  name:"Insurance",    icon:"◈" },
  { id:"shield",  name:"Profit Shield",icon:"◇" },
  { id:"vault",   name:"Vault",        icon:"◈" },
  { id:"debt",    name:"Debt Eraser",  icon:"✕" },
  { id:"mystery", name:"Mystery Box",  icon:"?" },
];
