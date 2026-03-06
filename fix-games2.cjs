const fs = require('fs');
const lines = fs.readFileSync('casino_1_.jsx', 'utf8').split('\n');

function extract(start, end) {
  return lines.slice(start-1, end).join('\n');
}

function buildHeader(code, depth) {
  const hooks = ['useState','useCallback','useEffect','useRef','useMemo'];
  const used = hooks.filter(h => new RegExp('\\b'+h+'\\b').test(code));
  const parts = [`import React, { ${used.join(', ')} } from 'react';`];
  if (code.includes('theme.')) parts.push(`import { theme } from '${depth}theme-globals.js';`);
  const tvars = [];
  if (/\bT\./.test(code)) tvars.push('T');
  if (/\bS\./.test(code)) tvars.push('S');
  ['FELT_BG','DARK_BG','BLUE_BG','RED_BG','PURPLE_BG'].forEach(v => { if(code.includes(v)) tvars.push(v); });
  if (tvars.length) parts.push(`import { ${tvars.join(', ')} } from '${depth}constants/styles.js';`);
  if (code.includes('isRed')) parts.push(`import { isRed } from '${depth}constants/cards.js';`);
  if (code.includes('GameShell')) parts.push(`import { GameShell } from '${depth}components/GameShell.jsx';`);
  if (code.includes('ActionButton')) parts.push(`import { ActionButton, actionBtnStyle } from '${depth}components/ui/ActionButton.jsx';`);
  if (code.includes('GoldButton')) parts.push(`import { GoldButton } from '${depth}components/ui/GoldButton.jsx';`);
  if (code.includes('BetControls')) parts.push(`import { BetControls } from '${depth}components/ui/BetControls.jsx';`);
  if (code.includes('<Card')) parts.push(`import { Card } from '${depth}components/ui/Card.jsx';`);
  if (code.includes('SLOT_LABEL_MAP') || code.includes('SLOT_ICON_MAP')) {
    parts.push(`import { SLOT_ICON_MAP, SLOT_LABEL_MAP } from '${depth}components/ui/GameIcons.jsx';`);
  }
  return parts.join('\n');
}

// CORRECT game section ranges (1-indexed, verified against casino_1_.jsx structure)
const games = [
  // [start, end, file, gameName]
  [4819, 5150, 'src/components/games/BlackjackGame.jsx', 'BlackjackGame'],
  [5151, 5403, 'src/components/games/VideoPokerGame.jsx', 'VideoPokerGame'],
  [5404, 5899, 'src/components/games/RouletteGame.jsx', 'RouletteGame'],
  [5900, 6474, 'src/components/games/SlotsGame.jsx', 'SlotsGame'],
  [6475, 6816, 'src/components/games/PlinkoGame.jsx', 'PlinkoGame'],
  [6817, 7220, 'src/components/games/CrashGame.jsx', 'CrashGame'],
  [7221, 7552, 'src/components/games/HighLowGame.jsx', 'HighLowGame'],
  [7553, 7792, 'src/components/games/DiceGame.jsx', 'DiceGame'],
  [7793, 8192, 'src/components/games/CrapsGame.jsx', 'CrapsGame'],
  [8193, 8474, 'src/components/games/KenoGame.jsx', 'KenoGame'],
  [8475, 8751, 'src/components/games/BaccaratGame.jsx', 'BaccaratGame'],
  [8752, 9341, 'src/components/games/ScratchCardGame.jsx', 'ScratchCardGame'],
];

// Verify no overlaps
for (let i = 0; i < games.length - 1; i++) {
  if (games[i][1] >= games[i+1][0]) {
    console.log(`ERROR: Overlap between ${games[i][3]} (end ${games[i][1]}) and ${games[i+1][3]} (start ${games[i+1][0]})`);
  }
}

for (const [start, end, filePath, gameName] of games) {
  let code = extract(start, end);
  const depth = '../../';
  const header = buildHeader(code, depth);

  // Export top-level declarations
  // Export the main game function
  code = code.replace(new RegExp(`^function ${gameName}\\b`, 'm'), `export function ${gameName}`);
  // Export all uppercase-starting constants and helper functions
  code = code.replace(/^(const [A-Z_][A-Z0-9_]*\s*=)/gm, 'export $1');
  code = code.replace(/^(const [A-Z][a-zA-Z]*\s*=)/gm, 'export $1'); // CamelCase consts
  // Export helper functions
  const helperFns = ['HandDisplay','evaluateVPHand','RouletteWheel','checkRouletteBet',
    'weightedRandom','checkSlot5Wins','SlotReel5','generatePlinkoPath','simPlinkoBall',
    'DiceFace','baccaratVal','baccaratTotal','generateScratchTicket','calcTicketPayout'];
  for (const fn of helperFns) {
    code = code.replace(new RegExp(`^function ${fn}\\b`, 'm'), `export function ${fn}`);
  }

  const finalContent = header + '\n\n' + code + '\n';
  fs.writeFileSync(filePath, finalContent);

  // Verify
  const exported = finalContent.includes(`export function ${gameName}`);
  const lineCount = end - start + 1;
  console.log(`${gameName} [${start}-${end}] (${lineCount} lines): ${exported ? '✓' : '✗ MISSING EXPORT'}`);
}
