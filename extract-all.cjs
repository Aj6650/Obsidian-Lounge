const fs = require('fs');

// Read the current casino_1_.jsx
const lines = fs.readFileSync('casino_1_.jsx', 'utf8').split('\n');

function extract(start, end) {
  return lines.slice(start-1, end).join('\n');
}

function reactImports(code) {
  const hooks = ['useState','useCallback','useEffect','useRef','useMemo'];
  const used = hooks.filter(h => new RegExp('\\b' + h + '\\b').test(code));
  return used.length ? `import React, { ${used.join(', ')} } from 'react';` : "import React from 'react';";
}

function themeImport(code, depth) {
  return code.includes('theme.') ? `import { theme } from '${depth}theme-globals.js';` : '';
}

function stylesImport(code, depth) {
  const vars = ['GLOBAL_STYLES','FELT_BG','DARK_BG','BLUE_BG','RED_BG','PURPLE_BG'].filter(v => code.includes(v));
  const ts = /\bT\./.test(code) ? 'T' : '';
  const ss = /\bS\./.test(code) ? 'S' : '';
  const all = [...(ts?[ts]:[]), ...(ss?[ss]:[]), ...vars];
  return all.length ? `import { ${all.join(', ')} } from '${depth}constants/styles.js';` : '';
}

function vipImport(code, depth) {
  const vars = ['VIP_TIERS','VAULT_YEAR_THRESHOLDS','ACH_POINTS','calcVipPoints','getVipTier','getNextVipTier'].filter(v => code.includes(v));
  return vars.length ? `import { ${vars.join(', ')} } from '${depth}constants/vip.js';` : '';
}

function achImport(code, depth) {
  return code.includes('ACHIEVEMENTS') ? `import { ACHIEVEMENTS } from '${depth}constants/achievements.js';` : '';
}

function chipsImport(code, depth) {
  const vars = ['CHIP_SKINS','INSANE_ACHS','isSkinUnlocked','getUnlockedSkins','getChipSkin','SKIN_THEMES','getActiveTheme'].filter(v => code.includes(v));
  return vars.length ? `import { ${vars.join(', ')} } from '${depth}constants/chips.js';` : '';
}

function shopImport(code, depth) {
  const vars = ['SHOP_ITEMS','MYSTERY_DROP_RATES','RARITY_COLORS','SHOP_CATEGORIES'].filter(v => code.includes(v));
  return vars.length ? `import { ${vars.join(', ')} } from '${depth}constants/shop.js';` : '';
}

function cardsImport(code, depth) {
  const vars = ['SUITS','RANKS','isRed','createDeck','cardVal','rankNum'].filter(v => new RegExp('\\b' + v + '\\b').test(code));
  return vars.length ? `import { ${vars.join(', ')} } from '${depth}constants/cards.js';` : '';
}

function makeImports(code, depth, extras) {
  return [
    reactImports(code),
    themeImport(code, depth),
    stylesImport(code, depth),
    cardsImport(code, depth),
    vipImport(code, depth),
    achImport(code, depth),
    chipsImport(code, depth),
    shopImport(code, depth),
    ...extras,
  ].filter(Boolean).join('\n');
}

// UI imports for game files
function uiImports(code, depth) {
  const uiComponents = {
    'GameShell': `import { GameShell } from '${depth}components/GameShell.jsx';`,
    'ActionButton': `import { ActionButton, actionBtnStyle } from '${depth}components/ui/ActionButton.jsx';`,
    'GoldButton': `import { GoldButton } from '${depth}components/ui/GoldButton.jsx';`,
    'BetControls': `import { BetControls } from '${depth}components/ui/BetControls.jsx';`,
    'Card': `import { Card } from '${depth}components/ui/Card.jsx';`,
    'BackButton': `import { BackButton } from '${depth}components/ui/BackButton.jsx';`,
    'DiceFace': null, // defined inline in DiceGame
  };
  const results = [];
  for (const [comp, imp] of Object.entries(uiComponents)) {
    if (imp && code.includes(comp)) results.push(imp);
  }
  return results;
}

// ─── Extract Game Files ─────────────────────────────────────────────────────

// Game component ranges (1-indexed, in updated casino_1_.jsx)
const gameRanges = [
  // Find what's between TitleScreen end (4845) and BlackjackGame start (4846)
  // HandDisplay starts just before BlackjackGame
  [4846, 5187, 'src/components/games/BlackjackGame.jsx', 'BlackjackGame'],
  [5188, 5644, 'src/components/games/VideoPokerGame.jsx', 'VideoPokerGame'],
  [5645, 6037, 'src/components/games/RouletteGame.jsx', 'RouletteGame'],
  [6038, 6561, 'src/components/games/SlotsGame.jsx', 'SlotsGame'],
  [6562, 6816, 'src/components/games/PlinkoGame.jsx', 'PlinkoGame'],
  [6817, 7220, 'src/components/games/CrashGame.jsx', 'CrashGame'],
  [7221, 7579, 'src/components/games/HighLowGame.jsx', 'HighLowGame'],
  [7580, 7792, 'src/components/games/DiceGame.jsx', 'DiceGame'],
  [7793, 8204, 'src/components/games/CrapsGame.jsx', 'CrapsGame'],
  [8205, 8483, 'src/components/games/KenoGame.jsx', 'KenoGame'],
  [8484, 8858, 'src/components/games/BaccaratGame.jsx', 'BaccaratGame'],
  [8859, 9349, 'src/components/games/ScratchCardGame.jsx', 'ScratchCardGame'],
];

// Check for HandDisplay (it's before BlackjackGame)
const handDisplayIdx = lines.findIndex(l => l.startsWith('function HandDisplay'));
console.log('HandDisplay at line:', handDisplayIdx+1);
if (handDisplayIdx > 0 && handDisplayIdx < 4845) {
  gameRanges[0][0] = handDisplayIdx + 1;
  console.log('Adjusted BlackjackGame start to:', gameRanges[0][0]);
}

for (const [start, end, filePath, gameName] of gameRanges) {
  let code = extract(start, end);
  const depth = '../../';
  const extras = uiImports(code, depth);
  const header = makeImports(code, depth, extras);

  // Export the main game function
  code = code.replace(new RegExp(`^function ${gameName}\\b`, 'm'), `export function ${gameName}`);
  // Also export any other top-level functions (like helper functions)
  code = code.replace(/^(function [A-Z])/gm, (m, p1) => {
    if (m.includes(`export`)) return m;
    return 'export ' + p1;
  });
  // Export top-level const arrays/objects
  code = code.replace(/^(const [A-Z_]+\s*=)/gm, 'export $1');

  const finalContent = header + '\n\n' + code + '\n';
  fs.writeFileSync(filePath, finalContent);
  console.log('Created:', filePath, `(${end-start+1} lines)`);
}

// ─── Extract TitleScreen ────────────────────────────────────────────────────

// Find where TitleScreen ends
const titleScreenStart = 3155;
const titleScreenEnd = 4845;
// Also get GAMES array (3036-3049) to include inline in TitleScreen
const gamesStart = 3036;
const gamesEnd = 3049;

// Get GAMES code + TitleScreen code
// First find where GAMES is and include it with TitleScreen
let gamesCode = extract(gamesStart, gamesEnd);
let titleCode = extract(titleScreenStart, titleScreenEnd);

// Combine: GAMES + TitleScreen
let fullTitleCode = gamesCode + '\n' + titleCode;
const depth = '../';

// TitleScreen also needs all the UI components
const titleScreenExtras = [
  "import { AmbientParticles } from './ui/AmbientParticles.jsx';",
  "import { ActionButton, actionBtnStyle } from './ui/ActionButton.jsx';",
  "import { GoldButton } from './ui/GoldButton.jsx';",
  "import { BetControls } from './ui/BetControls.jsx';",
  "import { SessionTracker } from './ui/SessionTracker.jsx';",
  "import { StatCard } from './ui/StatCard.jsx';",
  "import { Sparkline } from './ui/Sparkline.jsx';",
  "import { VipDetailsModal } from './ui/VipDetailsModal.jsx';",
  "import { ChipSkinModal } from './ui/ChipSkinModal.jsx';",
  "import { ChipSkinEffect } from './ui/ChipSkinEffect.jsx';",
  "import { PokerChipIcon } from './ui/PokerChipIcon.jsx';",
  "import { BankrollDisplay } from './ui/BankrollDisplay.jsx';",
  "import { ChipStackVisual } from './ui/ChipStackVisual.jsx';",
  "import { BackButton } from './ui/BackButton.jsx';",
  "import { LightningBolts } from './ui/LightningBolts.jsx';",
  "import { StreakIndicator } from './ui/StreakIndicator.jsx';",
];

const titleHeader = makeImports(fullTitleCode, depth, titleScreenExtras);

// Export GAMES and TitleScreen
fullTitleCode = fullTitleCode.replace(/^const GAMES\s*=/, 'export const GAMES =');
fullTitleCode = fullTitleCode.replace(/^function TitleScreen\b/, 'export function TitleScreen');

fs.writeFileSync('src/components/TitleScreen.jsx', titleHeader + '\n\n' + fullTitleCode + '\n');
console.log('Created: src/components/TitleScreen.jsx');

// ─── Extract FirstTimePrompt ────────────────────────────────────────────────

const ftpStart = 9381;
const ftpEnd = 9421;
let ftpCode = extract(ftpStart, ftpEnd);

const ftpHeader = makeImports(ftpCode, depth, []);
ftpCode = ftpCode.replace(/^function FirstTimePrompt\b/, 'export function FirstTimePrompt');

fs.writeFileSync('src/components/FirstTimePrompt.jsx', ftpHeader + '\n\n' + ftpCode + '\n');
console.log('Created: src/components/FirstTimePrompt.jsx');

// ─── Build new casino_1_.jsx (Casino.jsx) ──────────────────────────────────

// What stays in casino_1_.jsx: lines 9422-end (Casino default export + INITIAL_STATS)
// But INITIAL_STATS is at 9350-9380 (check)
const initialStatsIdx = lines.findIndex(l => l.startsWith('const INITIAL_STATS'));
console.log('INITIAL_STATS at line:', initialStatsIdx+1);

// Casino.jsx content: INITIAL_STATS + Casino function
const casinoStart = initialStatsIdx + 1;
let casinoCode = lines.slice(casinoStart - 1).join('\n'); // from INITIAL_STATS to end

// Figure out what Casino.jsx needs to import
const casinoDepth = './';

// All game components
const gameImports = gameRanges.map(([,, fp, name]) => {
  const relPath = fp.replace('src/', './');
  return `import { ${name} } from '${relPath}';`;
});

// All UI component imports
const casinoExtras = [
  "import { theme } from './theme-globals.js';",
  "import { AmbientParticles } from './components/ui/AmbientParticles.jsx';",
  "import { FloatingWins } from './components/ui/FloatingWins.jsx';",
  "import { ScreenColorWash } from './components/ui/ScreenColorWash.jsx';",
  "import { CoinRain } from './components/ui/CoinRain.jsx';",
  "import { ConfettiCanvas } from './components/ui/ConfettiCanvas.jsx';",
  "import { ChipEruption } from './components/ui/ChipEruption.jsx';",
  "import { BigWinOverlay } from './components/ui/BigWinOverlay.jsx';",
  "import { AnimatedChips } from './components/ui/AnimatedChips.jsx';",
  "import { StreakIndicator } from './components/ui/StreakIndicator.jsx';",
  "import { AchievementToast } from './components/ui/AchievementToast.jsx';",
  "import { NearMissFlash } from './components/ui/NearMissFlash.jsx';",
  "import { JackpotOverlay } from './components/ui/JackpotOverlay.jsx';",
  "import { BustedOverlay } from './components/ui/BustedOverlay.jsx';",
  "import { ChipStackVisual } from './components/ui/ChipStackVisual.jsx';",
  "import { EdgeLights } from './components/ui/EdgeLights.jsx';",
  "import { useWinEffects } from './components/ui/WinEffects.jsx';",
  "import { LightningBolts } from './components/ui/LightningBolts.jsx';",
  "import { ChipSkinEffect } from './components/ui/ChipSkinEffect.jsx';",
  "import { ChipSkinModal } from './components/ui/ChipSkinModal.jsx';",
  "import { PokerChipIcon } from './components/ui/PokerChipIcon.jsx';",
  "import { BankrollDisplay } from './components/ui/BankrollDisplay.jsx';",
  "import { VipDetailsModal } from './components/ui/VipDetailsModal.jsx';",
  "import { BackButton } from './components/ui/BackButton.jsx';",
  "import { GoldButton } from './components/ui/GoldButton.jsx';",
  "import { BetControls } from './components/ui/BetControls.jsx';",
  "import { Card } from './components/ui/Card.jsx';",
  "import { SessionTracker } from './components/ui/SessionTracker.jsx';",
  "import { StatCard } from './components/ui/StatCard.jsx';",
  "import { Sparkline } from './components/ui/Sparkline.jsx';",
  "import { GameShell } from './components/GameShell.jsx';",
  "import { TitleScreen } from './components/TitleScreen.jsx';",
  "import { FirstTimePrompt } from './components/FirstTimePrompt.jsx';",
  ...gameImports,
];

const casinoHeader = [
  "import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';",
  "import { theme } from './theme-globals.js';",
  "import { GLOBAL_STYLES, T, S, FELT_BG, DARK_BG } from './constants/styles.js';",
  "import { CHIP_SKINS, INSANE_ACHS, isSkinUnlocked, getUnlockedSkins, getChipSkin, SKIN_THEMES, getActiveTheme } from './constants/chips.js';",
  "import { VIP_TIERS, VAULT_YEAR_THRESHOLDS, ACH_POINTS, calcVipPoints, getVipTier, getNextVipTier } from './constants/vip.js';",
  "import { ACHIEVEMENTS } from './constants/achievements.js';",
  "import { SHOP_ITEMS, MYSTERY_DROP_RATES, RARITY_COLORS, SHOP_CATEGORIES } from './constants/shop.js';",
  ...casinoExtras,
].filter(Boolean).join('\n');

const casinoContent = casinoHeader + '\n\n' + casinoCode + '\n';
fs.writeFileSync('src/Casino.jsx', casinoContent);
console.log('Created: src/Casino.jsx');

console.log('\nAll extraction complete!');
