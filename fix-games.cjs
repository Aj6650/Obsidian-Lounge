const fs = require('fs');
const lines = fs.readFileSync('casino_1_.jsx', 'utf8').split('\n');

function extract(start, end) {
  return lines.slice(start-1, end).join('\n');
}

function buildHeader(code, depth, extraImports) {
  const hooks = ['useState','useCallback','useEffect','useRef','useMemo'];
  const used = hooks.filter(h => new RegExp('\\b'+h+'\\b').test(code));
  const parts = [`import React, { ${used.join(', ')} } from 'react';`];
  if (code.includes('theme.')) parts.push(`import { theme } from '${depth}theme-globals.js';`);
  const tvars = [];
  if (/\bT\./.test(code)) tvars.push('T');
  if (/\bS\./.test(code)) tvars.push('S');
  ['FELT_BG','DARK_BG','BLUE_BG','RED_BG','PURPLE_BG'].forEach(v => { if(code.includes(v)) tvars.push(v); });
  if (tvars.length) parts.push(`import { ${tvars.join(', ')} } from '${depth}constants/styles.js';`);
  if (code.includes('ACHIEVEMENTS')) parts.push(`import { ACHIEVEMENTS } from '${depth}constants/achievements.js';`);
  const cvars = ['CHIP_SKINS','isSkinUnlocked','getChipSkin'].filter(v => code.includes(v));
  if (cvars.length) parts.push(`import { ${cvars.join(', ')} } from '${depth}constants/chips.js';`);
  if (code.includes('GameShell')) parts.push(`import { GameShell } from '${depth}components/GameShell.jsx';`);
  if (code.includes('ActionButton')) parts.push(`import { ActionButton, actionBtnStyle } from '${depth}components/ui/ActionButton.jsx';`);
  if (code.includes('GoldButton')) parts.push(`import { GoldButton } from '${depth}components/ui/GoldButton.jsx';`);
  if (code.includes('BetControls')) parts.push(`import { BetControls } from '${depth}components/ui/BetControls.jsx';`);
  if (code.includes('<Card')) parts.push(`import { Card } from '${depth}components/ui/Card.jsx';`);
  if (code.includes('SLOT_LABEL_MAP') || code.includes('SLOT_ICON_MAP')) {
    parts.push(`import { SLOT_ICON_MAP, SLOT_LABEL_MAP } from '${depth}components/ui/GameIcons.jsx';`);
  }
  if (code.includes('isRed')) parts.push(`import { isRed } from '${depth}constants/cards.js';`);
  parts.push(...extraImports);
  return parts.join('\n');
}

function exportTopLevel(code, gameName, helpers) {
  // Export the game function
  code = code.replace(new RegExp(`^function ${gameName}\\b`, 'm'), `export function ${gameName}`);
  // Export helpers
  for (const h of helpers) {
    const isConst = /^[A-Z_]/.test(h.split(' ')[0]);
    if (h.startsWith('const ') || h.startsWith('function ') || /^[A-Z_]+$/.test(h)) {
      // exported via regex below
    }
  }
  // Export all top-level const/function that start with uppercase or are in helpers list
  code = code.replace(/^(const [A-Z_])/gm, 'export $1');
  code = code.replace(/^(function [A-Z][a-zA-Z]*|function [a-z][a-zA-Z]*Val|function [a-z][a-zA-Z]*Total|function baccaratVal|function baccaratTotal|function checkRoulette|function weightedRandom|function checkSlot|function generatePlinko|function simPlinko|function generateScratch|function calcTicket)/gm, 'export $1');
  return code;
}

// Game ranges with corrected starts
const games = [
  // [start, end, file, gameName]
  [4819, 5150, 'src/components/games/BlackjackGame.jsx', 'BlackjackGame'],
  [5151, 5644, 'src/components/games/VideoPokerGame.jsx', 'VideoPokerGame'],
  [5404, 6037, 'src/components/games/RouletteGame.jsx', 'RouletteGame'],
  [5900, 6561, 'src/components/games/SlotsGame.jsx', 'SlotsGame'],
  [6475, 6816, 'src/components/games/PlinkoGame.jsx', 'PlinkoGame'],
  [6817, 7220, 'src/components/games/CrashGame.jsx', 'CrashGame'],
  [7221, 7579, 'src/components/games/HighLowGame.jsx', 'HighLowGame'],
  [7553, 7792, 'src/components/games/DiceGame.jsx', 'DiceGame'],
  [7793, 8204, 'src/components/games/CrapsGame.jsx', 'CrapsGame'],
  [8193, 8483, 'src/components/games/KenoGame.jsx', 'KenoGame'],
  [8475, 8858, 'src/components/games/BaccaratGame.jsx', 'BaccaratGame'],
  [8752, 9341, 'src/components/games/ScratchCardGame.jsx', 'ScratchCardGame'],
];

// Check for overlaps
for (let i = 0; i < games.length - 1; i++) {
  if (games[i][1] >= games[i+1][0]) {
    console.log(`WARNING: Overlap between ${games[i][3]} (end ${games[i][1]}) and ${games[i+1][3]} (start ${games[i+1][0]})`);
  }
}

for (const [start, end, filePath, gameName] of games) {
  let code = extract(start, end);
  const depth = '../../';
  const header = buildHeader(code, depth, []);
  code = exportTopLevel(code, gameName, []);
  fs.writeFileSync(filePath, header + '\n\n' + code + '\n');
  console.log(`${gameName}: lines ${start}-${end} (${end-start+1} lines) → ${filePath}`);
}

// Verify each game is exported
games.forEach(([,, fp, name]) => {
  const content = fs.readFileSync(fp, 'utf8');
  const exported = content.includes(`export function ${name}`);
  console.log(name, exported ? '✓' : '✗ MISSING EXPORT');
});
