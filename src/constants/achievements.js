export const ACHIEVEMENTS = [
  // First Steps
  { id:"first_win",      group:"First Steps",   name:"First Blood",        desc:"Win your first bet", icon:"◎" },
  { id:"played_all",     group:"First Steps",   name:"Well Rounded",        desc:"Play all 12 games", icon:"⚄" },
  // Streaks
  { id:"streak_5",       group:"Streaks",       name:"Hot Hand",            desc:"Win 5 in a row (excl. Slots/Plinko)", icon:"▲" },
  { id:"streak_10",      group:"Streaks",       name:"On Fire",             desc:"Win 10 in a row (excl. Slots/Plinko)", icon:"▲" },
  { id:"streak_20",      group:"Streaks",       name:"Unstoppable",         desc:"Win 20 in a row (excl. Slots/Plinko)", icon:"⚡" },
  { id:"comeback",       group:"Streaks",       name:"Comeback Kid",        desc:"Win after 5+ loss streak", icon:"↺" },
  { id:"loss_10",        group:"Streaks",       name:"Unlucky Expert",      desc:"Lose 10 in a row", icon:"×" },
  // Bankroll
  { id:"bankroll_10k",   group:"Bankroll",      name:"Moving Up",           desc:"Reach $10,000 bankroll", icon:"↑" },
  { id:"bankroll_25k",   group:"Bankroll",      name:"Big Stack",           desc:"Reach $25,000 bankroll", icon:"$" },
  { id:"bankroll_100k",  group:"Bankroll",      name:"High Society",        desc:"Reach $100,000 bankroll", icon:"$" },
  { id:"bankroll_1m",    group:"Bankroll",      name:"Whale Status",        desc:"Reach $1,000,000 bankroll", icon:"$$" },
  { id:"bankroll_10m",   group:"Bankroll",      name:"Casino Royale",       desc:"Reach $10,000,000 bankroll", icon:"♛" },
  { id:"bankroll_1b",    group:"Bankroll",      name:"The One Percent",     desc:"Reach $1,000,000,000 bankroll", icon:"◆" },
  // Big Wins
  { id:"big_win_10k_j",  group:"Big Wins",      name:"Jackpot!",            desc:"Win $10,000+ in a single bet", icon:"♠" },
  { id:"big_win_100k",   group:"Big Wins",      name:"Mega Win",            desc:"Win $100,000+ in a single bet", icon:"◆" },
  { id:"big_win_1m",     group:"Big Wins",      name:"Millionaire Moment",  desc:"Win $1,000,000+ in a single bet", icon:"$!" },
  { id:"big_win_100m",   group:"Big Wins",      name:"Hundred Million",     desc:"Win $100,000,000+ in a single bet", icon:"✦" },
  { id:"big_win_1b",     group:"Big Wins",      name:"Billion Dollar Bet",  desc:"Win $1,000,000,000+ in a single bet", icon:"★" },
  // High Roller
  { id:"high_roller",    group:"High Roller",   name:"High Roller",         desc:"Place a $10,000+ bet", icon:"♠" },
  { id:"high_roller_50k", group:"High Roller",  name:"Big Spender",        desc:"Place a $50,000+ bet", icon:"✗" },
  { id:"high_roller_250k",group:"High Roller",  name:"Quarter Million",    desc:"Place a $250,000+ bet", icon:"$" },
  { id:"high_roller_1m", group:"High Roller",   name:"Seven Figures",       desc:"Place a $1,000,000+ bet", icon:"◆" },
  { id:"high_roller_100m",group:"High Roller",  name:"Insane Wager",       desc:"Place a $100,000,000+ bet", icon:"!" },
  { id:"all_in_25",      group:"High Roller",   name:"Nerves of Steel",     desc:"Win 25 all-in bets", icon:"▲" },
  // Wagering
  { id:"wagered_100k",   group:"Wagering",      name:"Seasoned Gambler",    desc:"Wager $100,000 total", icon:"♠" },
  { id:"wagered_1m",     group:"Wagering",      name:"VIP Treatment",       desc:"Wager $1,000,000 total", icon:"✦" },
  { id:"wagered_100m",   group:"Wagering",      name:"Hundred Million Club",desc:"Wager $100,000,000 total", icon:"♛" },
  { id:"wagered_5b",     group:"Wagering",      name:"Degenerate",          desc:"Wager $5,000,000,000 total", icon:"◉" },
  // Grind
  { id:"wins_100",       group:"Grind",         name:"Centurion",           desc:"Win 100 bets", icon:"C" },
  { id:"wins_1k",        group:"Grind",         name:"Veteran",             desc:"Win 1,000 bets", icon:"✧" },
  { id:"wins_5k",        group:"Grind",         name:"Legend",              desc:"Win 5,000 bets", icon:"★" },
  { id:"rounds_1k",      group:"Grind",         name:"Iron Hands",          desc:"Play 1,000 rounds", icon:"▬" },
  { id:"rounds_5k",      group:"Grind",         name:"Grinder",             desc:"Play 5,000 rounds", icon:"⚙" },
  { id:"rounds_10k",     group:"Grind",         name:"Marathon",            desc:"Play 10,000 rounds", icon:"»" },
  // VIP Milestones
  { id:"vip_silver",     group:"VIP",           name:"Silver Lining",       desc:"Reach Silver VIP tier", icon:"II" },
  { id:"vip_gold",       group:"VIP",           name:"Gold Member",         desc:"Reach Gold VIP tier", icon:"I" },
  { id:"vip_platinum",   group:"VIP",           name:"Platinum Status",     desc:"Reach Platinum VIP tier", icon:"◆" },
  { id:"vip_emerald",    group:"VIP",           name:"Emerald City",        desc:"Reach Emerald VIP tier", icon:"●" },
  { id:"vip_diamond",    group:"VIP",           name:"Diamond Hands",       desc:"Reach Diamond VIP tier", icon:"♛" },
  { id:"vip_celestial",  group:"VIP",           name:"Among The Stars",     desc:"Reach Celestial VIP tier", icon:"★" },
  // Vault & Debt
  { id:"vault_first",    group:"Vault & Debt",  name:"Safe Keeper",         desc:"Deposit into the vault for the first time", icon:"◈" },
  { id:"vault_10k",      group:"Vault & Debt",  name:"Nest Egg",            desc:"Vault balance reaches $10,000", icon:"◈" },
  { id:"vault_1m",       group:"Vault & Debt",  name:"Fort Knox",           desc:"Vault balance reaches $1,000,000", icon:"◈" },
  { id:"vault_100m",     group:"Vault & Debt",  name:"Untouchable",         desc:"Vault balance reaches $100,000,000", icon:"◈" },
  { id:"interest_first", group:"Vault & Debt",  name:"Compound Effect",     desc:"Earn vault interest for the first time", icon:"$" },
  { id:"interest_10",    group:"Vault & Debt",  name:"Patience Pays",       desc:"Complete 10 interest cycles", icon:"$" },
  { id:"debt_cleared",   group:"Vault & Debt",  name:"Debt Free",           desc:"Fully repay all debt at least once", icon:"↺" },
  { id:"vault_bust",     group:"Vault & Debt",  name:"Penalty Box",         desc:"Lose funds to a vault bust penalty", icon:"×" },
  // Misc
  { id:"rebuy_100",      group:"Misc",          name:"Loser",               desc:"Rebuy 100 times", icon:"↻" },
];
