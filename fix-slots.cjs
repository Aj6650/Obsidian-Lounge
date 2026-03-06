const fs = require('fs');
const lines = fs.readFileSync('casino_1_.jsx', 'utf8').split('\n');

// Re-extract SlotsGame with correct range (includes SLOT constants + SlotReel5)
const start = 5900, end = 6561;
let code = lines.slice(start-1, end).join('\n');

const hooks = ['useState','useCallback','useEffect','useRef','useMemo'];
const used = hooks.filter(h => new RegExp('\\b'+h+'\\b').test(code));
const reactImp = `import React, { ${used.join(', ')} } from 'react';`;

const extras = [];
if(code.includes('theme.')) extras.push("import { theme } from '../../theme-globals.js';");
const tvars = [];
if(/\bT\./.test(code)) tvars.push('T');
if(/\bS\./.test(code)) tvars.push('S');
['FELT_BG','DARK_BG'].forEach(v => { if(code.includes(v)) tvars.push(v); });
if(tvars.length) extras.push(`import { ${tvars.join(', ')} } from '../../constants/styles.js';`);
if(code.includes('GameShell')) extras.push("import { GameShell } from '../../components/GameShell.jsx';");
if(code.includes('ActionButton')) extras.push("import { ActionButton, actionBtnStyle } from '../../components/ui/ActionButton.jsx';");
if(code.includes('GoldButton')) extras.push("import { GoldButton } from '../../components/ui/GoldButton.jsx';");
if(code.includes('SLOT_LABEL_MAP') || code.includes('SLOT_ICON_MAP')) {
  extras.push("import { SLOT_ICON_MAP, SLOT_LABEL_MAP } from '../../components/ui/GameIcons.jsx';");
}

const header = [reactImp, ...extras].join('\n');

// Export top-level declarations
code = code.replace(/^(const SLOT_)/gm, 'export $1');
code = code.replace(/^function weightedRandom/m, 'export function weightedRandom');
code = code.replace(/^function checkSlot5Wins/m, 'export function checkSlot5Wins');
code = code.replace(/^function SlotReel5/m, 'export function SlotReel5');
code = code.replace(/^function SlotsGame/m, 'export function SlotsGame');

fs.writeFileSync('src/components/games/SlotsGame.jsx', header + '\n\n' + code + '\n');
console.log('Re-extracted SlotsGame.jsx:', end-start+1, 'lines');

// Also fix: check other games for similar issues
// Check Blackjack for HandDisplay
const bjLines = fs.readFileSync('src/components/games/BlackjackGame.jsx', 'utf8').split('\n');
const hasHandDisplay = bjLines.some(l => l.includes('function HandDisplay'));
console.log('BlackjackGame has HandDisplay:', hasHandDisplay);

// Check other games for any missing helper functions
const games = ['RouletteGame', 'PlinkoGame', 'CrashGame', 'HighLowGame', 'DiceGame', 'CrapsGame', 'KenoGame', 'BaccaratGame'];
games.forEach(g => {
  const content = fs.readFileSync(`src/components/games/${g}.jsx`, 'utf8');
  const firstLine = content.split('\n').find(l => l.includes('export function ' + g));
  console.log(g, firstLine ? '✓ exported' : '✗ NOT exported');
});
