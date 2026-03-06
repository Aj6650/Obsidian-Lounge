const fs = require('fs');
const lines = fs.readFileSync('casino_1_.jsx', 'utf8').split('\n');

function extract(start, end) {
  return lines.slice(start-1, end).join('\n');
}

function uses(code, ...names) {
  return names.some(n => code.includes(n));
}

function reactImports(code) {
  const hooks = ['useState','useCallback','useEffect','useRef','useMemo'];
  const used = hooks.filter(h => {
    // Match hook usage (not just in strings)
    const re = new RegExp('\\b' + h + '\\b');
    return re.test(code);
  });
  return used.length ? `import React, { ${used.join(', ')} } from 'react';` : "import React from 'react';";
}

function themeImport(code, depth) {
  if (code.includes('theme.')) return `import { theme } from '${depth}theme-globals.js';`;
  return '';
}

function stylesImport(code, depth) {
  const vars = ['GLOBAL_STYLES','FELT_BG','DARK_BG','BLUE_BG','RED_BG','PURPLE_BG'].filter(v => code.includes(v));
  const ts = /\bT\./.test(code) ? 'T' : '';
  const ss = /\bS\./.test(code) ? 'S' : '';
  const all = [...(ts?[ts]:[]), ...(ss?[ss]:[]), ...vars];
  if (!all.length) return '';
  return `import { ${all.join(', ')} } from '${depth}constants/styles.js';`;
}

function cardsImport(code, depth) {
  const vars = ['SUITS','RANKS','isRed','createDeck','cardVal','rankNum'].filter(v => {
    return new RegExp('\\b' + v + '\\b').test(code);
  });
  if (!vars.length) return '';
  return `import { ${vars.join(', ')} } from '${depth}constants/cards.js';`;
}

function vipImport(code, depth) {
  const vars = ['VIP_TIERS','VAULT_YEAR_THRESHOLDS','ACH_POINTS','calcVipPoints','getVipTier','getNextVipTier'].filter(v => code.includes(v));
  if (!vars.length) return '';
  return `import { ${vars.join(', ')} } from '${depth}constants/vip.js';`;
}

function achImport(code, depth) {
  if (code.includes('ACHIEVEMENTS')) return `import { ACHIEVEMENTS } from '${depth}constants/achievements.js';`;
  return '';
}

function chipsImport(code, depth) {
  const vars = ['CHIP_SKINS','INSANE_ACHS','isSkinUnlocked','getUnlockedSkins','getChipSkin','SKIN_THEMES','getActiveTheme'].filter(v => code.includes(v));
  if (!vars.length) return '';
  return `import { ${vars.join(', ')} } from '${depth}constants/chips.js';`;
}

function shopImport(code, depth) {
  const vars = ['SHOP_ITEMS','MYSTERY_DROP_RATES','RARITY_COLORS','SHOP_CATEGORIES'].filter(v => code.includes(v));
  if (!vars.length) return '';
  return `import { ${vars.join(', ')} } from '${depth}constants/shop.js';`;
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

// WinEffects needs cross-imports from other ui files
const winEffectsExtras = [
  "import { useScreenShake, actionBtnStyle } from './ActionButton.jsx';",
  "import { useFloatingWins, FloatingWins } from './FloatingWins.jsx';",
  "import { useCoinRain, CoinRain } from './CoinRain.jsx';",
  "import { useScreenColorWash, ScreenColorWash } from './ScreenColorWash.jsx';",
  "import { useConfetti, ConfettiCanvas } from './ConfettiCanvas.jsx';",
  "import { useChipEruption, ChipEruption } from './ChipEruption.jsx';",
  "import { useEdgeLights } from './EdgeLights.jsx';",
  "import { BigWinOverlay } from './BigWinOverlay.jsx';",
];

// GameShell needs UI components
const gameShellExtras = [
  "import { AmbientParticles } from './ui/AmbientParticles.jsx';",
  "import { FloatingWins } from './ui/FloatingWins.jsx';",
  "import { CoinRain } from './ui/CoinRain.jsx';",
  "import { ScreenColorWash } from './ui/ScreenColorWash.jsx';",
  "import { ConfettiCanvas } from './ui/ConfettiCanvas.jsx';",
  "import { ChipEruption } from './ui/ChipEruption.jsx';",
  "import { BigWinOverlay } from './ui/BigWinOverlay.jsx';",
  "import { AnimatedChips } from './ui/AnimatedChips.jsx';",
  "import { StreakIndicator } from './ui/StreakIndicator.jsx';",
  "import { AchievementToast } from './ui/AchievementToast.jsx';",
  "import { NearMissFlash } from './ui/NearMissFlash.jsx';",
  "import { JackpotOverlay } from './ui/JackpotOverlay.jsx';",
  "import { EdgeLights } from './ui/EdgeLights.jsx';",
  "import { BankrollDisplay } from './ui/BankrollDisplay.jsx';",
  "import { PokerChipIcon } from './ui/PokerChipIcon.jsx';",
  "import { LightningBolts } from './ui/LightningBolts.jsx';",
  "import { ChipSkinEffect } from './ui/ChipSkinEffect.jsx';",
];

// BustedOverlay needs VIP imports
const bustedExtras = [
  "import { getVipTier } from '../../constants/vip.js';",
];

const components = [
  // [startLine, endLine, filePath, firstExport, extraImports]
  [9, 217, 'src/components/ui/AmbientParticles.jsx', 'function AmbientParticles', []],
  [218, 243, 'src/components/ui/ActionButton.jsx', 'const actionBtnStyle', []],
  [244, 284, 'src/components/ui/FloatingWins.jsx', 'function FloatingWins', []],
  [285, 322, 'src/components/ui/CoinRain.jsx', 'function CoinRain', []],
  [323, 360, 'src/components/ui/ScreenColorWash.jsx', 'function ScreenColorWash', []],
  [361, 471, 'src/components/ui/ConfettiCanvas.jsx', 'function ConfettiCanvas', []],
  [472, 514, 'src/components/ui/ChipEruption.jsx', 'function ChipEruption', []],
  [515, 802, 'src/components/ui/BigWinOverlay.jsx', 'function BigWinOverlay', []],
  [803, 852, 'src/components/ui/AnimatedChips.jsx', 'function AnimatedChips', []],
  [853, 900, 'src/components/ui/StreakIndicator.jsx', 'function StreakIndicator', []],
  [901, 932, 'src/components/ui/AchievementToast.jsx', 'function AchievementToast', []],
  [933, 943, 'src/components/ui/NearMissFlash.jsx', 'function NearMissFlash', []],
  [944, 1303, 'src/components/ui/JackpotOverlay.jsx', 'function JackpotOverlay', []],
  [1304, 1534, 'src/components/ui/BustedOverlay.jsx', 'function BustedOverlay', bustedExtras],
  [1535, 1704, 'src/components/ui/ChipStackVisual.jsx', 'function ChipStackVisual', []],
  [1705, 1801, 'src/components/ui/EdgeLights.jsx', 'const LIGHT_COUNT', []],
  [1802, 1920, 'src/components/ui/WinEffects.jsx', 'function useWinEffects', winEffectsExtras],
  [1921, 2136, 'src/components/ui/GameIcons.jsx', 'const IconAceSpade', []],
  [2137, 2151, 'src/components/ui/BackButton.jsx', 'function BackButton', []],
  [2152, 2265, 'src/components/ui/VipDetailsModal.jsx', 'function VipDetailsModal', []],
  [2266, 2342, 'src/components/ui/ChipSkinEffect.jsx', 'function ChipSkinEffect', []],
  [2343, 2462, 'src/components/ui/LightningBolts.jsx', 'function LightningBolts', []],
  [2463, 2543, 'src/components/ui/ChipSkinModal.jsx', 'function ChipSkinModal', []],
  [2544, 2582, 'src/components/ui/PokerChipIcon.jsx', 'function PokerChipIcon', []],
  [2583, 2669, 'src/components/ui/BankrollDisplay.jsx', 'function BankrollDisplay', []],
  [2670, 2845, 'src/components/GameShell.jsx', 'function GameShell', gameShellExtras],
  [2846, 2879, 'src/components/ui/GoldButton.jsx', 'function GoldButton', []],
  [2880, 2950, 'src/components/ui/BetControls.jsx', 'function BetControls', []],
  [2951, 3035, 'src/components/ui/Card.jsx', 'function Card', []],
  [3050, 3121, 'src/components/ui/SessionTracker.jsx', 'function SessionTracker', []],
  [3122, 3135, 'src/components/ui/StatCard.jsx', 'function StatCard', []],
  [3136, 3154, 'src/components/ui/Sparkline.jsx', 'function Sparkline', []],
];

for (const [start, end, filePath, firstExport, extraImports] of components) {
  let code = extract(start, end);

  const depth = filePath.startsWith('src/components/ui/') ? '../../' : '../';

  // For extras, avoid duplicate vip imports if already auto-detected
  const filteredExtras = extraImports.filter(e => {
    if (e.includes('constants/vip')) return false; // auto-detected
    return true;
  });

  const header = makeImports(code, depth, filteredExtras);

  // Add exports to all top-level function/const/let declarations
  // BUT not things inside function bodies (they won't match ^)
  code = code.replace(/^(function )/gm, 'export $1');
  code = code.replace(/^(const )/gm, 'export $1');

  const finalContent = header + '\n\n' + code + '\n';
  fs.writeFileSync(filePath, finalContent);
  console.log('Created:', filePath, `(${end-start+1} lines)`);
}
