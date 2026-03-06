import React, { useState, useCallback } from 'react';
import { getChipSkin } from '../../constants/chips.js';

export function ChipStackVisual({ chips, skinId }) {
  const skin = getChipSkin(skinId);
  const CC = skin.colors;
  if (chips <= 0) return <svg width={28} height={20} style={{ display:"block" }} />;
  const phase = chips < 10000 ? 1 : chips < 50000 ? 2 : chips < 150000 ? 3
    : chips < 400000 ? 4 : chips < 800000 ? 5 : chips < 1500000 ? 6
    : chips < 3000000 ? 7 : chips < 5000000 ? 8 : chips < 8000000 ? 9
    : chips < 15000000 ? 10 : chips < 25000000 ? 11 : chips < 50000000 ? 12 : 13;
  const chipTable = [
    [100,1],[300,2],[700,3],[1500,4],[4000,5],[10000,6],
    [15000,7],[22000,8],[30000,9],[38000,10],[45000,11],[50000,12],
    [65000,13],[80000,14],[100000,15],[120000,16],[135000,17],[150000,18],
    [185000,19],[220000,20],[270000,21],[320000,22],[360000,23],[400000,24],
    [500000,25],[580000,26],[660000,27],[740000,28],[800000,29],[800001,30],
    [950000,31],[1100000,32],[1250000,33],[1400000,34],[1500000,35],[1500001,36],
    [1800000,37],[2100000,38],[2400000,39],[2700000,40],[3000000,41],[3000001,42],
    [3400000,43],[3700000,44],[4100000,45],[4500000,46],[5000000,47],[5000001,48],
    [5500000,49],[6000000,50],[6600000,51],[7200000,52],[8000000,53],[8000001,54],
    [9000000,55],[10000000,56],[11000000,57],[12500000,58],[14000000,59],[15000000,60],
    [16500000,61],[18000000,62],[20000000,63],[22000000,64],[25000000,65],[25000001,66],
    [28000000,67],[32000000,68],[36000000,69],[40000000,70],[45000000,71],[50000000,72],
    [55000000,73],[65000000,74],[80000000,75],[100000000,76],[200000000,77],
  ];
  let total = 78;
  for (const [threshold, count] of chipTable) {
    if (chips < threshold) { total = count - 1; break; }
  }
  total = Math.max(1, total);
  const rowChip = [
    { rx: 10, ry: 3.5, edge: 1.8, sp: 3, opacity: 1 },
    { rx: 9, ry: 3.2, edge: 1.5, sp: 2.8, opacity: 0.85 },
    { rx: 8, ry: 2.9, edge: 1.2, sp: 2.6, opacity: 0.72 },
  ];
  const rowBaseY = [0, 11, 20];
  const slotDefs = [
    { ox: 0,   row: 0 },
    { ox:-18,  row: 0 },
    { ox: 18,  row: 0 },
    { ox:-10,  row: 1 },
    { ox: 10,  row: 1 },
    { ox:-34,  row: 0 },
    { ox: 34,  row: 0 },
    { ox:-22,  row: 2 },
    { ox: 22,  row: 2 },
    { ox:-24,  row: 1 },
    { ox: 24,  row: 1 },
    { ox:-36,  row: 2 },
    { ox: 36,  row: 2 },
  ];
  const phaseSlots = [
    [0],[0,1],[0,1,2],[0,1,2,3],[0,1,2,3,4],
    [0,1,2,3,4,5],[0,1,2,3,4,5,6],[0,1,2,3,4,5,6,7],[0,1,2,3,4,5,6,7,8],
    [0,1,2,3,4,5,6,7,8,9],[0,1,2,3,4,5,6,7,8,9,10],
    [0,1,2,3,4,5,6,7,8,9,10,11],[0,1,2,3,4,5,6,7,8,9,10,11,12],
  ];
  const activeSlots = phaseSlots[phase - 1];
  const maxSpills = [0,1,1,2,2,3,3,3,4,4,4,5,5][phase - 1];
  const stacks = Array.from({ length: 13 }, () => []);
  const spilled = [];
  const seed = (n) => ((n * 9301 + 49297) % 233280) / 233280;
  let ci = 0;
  for (let i = 0; i < total; i++) {
    const color = CC[ci % CC.length];
    ci++;
    if (i > 3 && (i - 4) % 7 === 0 && spilled.length < maxSpills) {
      const si = spilled.length;
      const spread = phase >= 8 ? 80 : phase >= 5 ? 64 : phase >= 3 ? 48 : 28;
      const side = si % 2 === 0 ? 1 : -1;
      const sx = side * (spread * 0.3 + seed(si * 13 + 1) * spread * 0.35);
      const sy = -(seed(si * 17 + 5) * 3 + 1.5);
      const lean = side * (15 + seed(si * 7 + 3) * 20);
      const stackH = Math.min(2, 1 + Math.floor(seed(si * 11 + 9) * Math.min(2, phase * 0.3)));
      const colors = [color];
      for (let j = 1; j < stackH && i + j < total; j++) {
        colors.push(CC[(ci + j) % CC.length]);
      }
      ci += colors.length - 1;
      i += colors.length - 1;
      spilled.push({ colors, sx, sy, lean });
      continue;
    }
    let best = activeSlots[0];
    for (const s of activeSlots) {
      if (stacks[s].length < stacks[best].length) best = s;
    }
    stacks[best].push(color);
  }
  const maxH = Math.max(1, ...activeSlots.map(s => {
    const r = slotDefs[s].row;
    return stacks[s].length * rowChip[r].sp + rowBaseY[r];
  }));
  const svgW = phase >= 11 ? 112 : phase >= 8 ? 100 : phase >= 5 ? 88 : phase >= 3 ? 76 : phase >= 2 ? 52 : 32;
  const svgH = Math.max(22, maxH + 12 + (maxSpills > 0 ? 4 : 0));
  const cx = svgW / 2;
  const baseY = svgH - 3;
  const isLed = skin.neonCycle === true;
  const renderChip = (key, ox, cy, c, rx, ry, eh, delay, op, colorIdx) => {
    const ledDelay = isLed ? `${(colorIdx * 0.25) % 2.5}s` : "0s";
    const ledDur = "2.5s";
    return (
    <g key={key} style={{ animation:`chipBounce 0.25s ease ${delay}s both`, opacity: op,
      ...(isLed ? {filter:`drop-shadow(0 0 2px rgba(255,255,255,0.3))`} : {}) }}>
      <ellipse cx={ox} cy={cy + eh} rx={rx} ry={ry} fill={c.rim}
        style={isLed ? {animation:`chipLedRim ${ledDur} linear ${ledDelay} infinite`} : undefined} />
      <rect x={ox - rx} y={cy} width={rx * 2} height={eh} fill={c.rim}
        style={isLed ? {animation:`chipLedRim ${ledDur} linear ${ledDelay} infinite`} : undefined} />
      <ellipse cx={ox} cy={cy} rx={rx} ry={ry} fill={c.fill}
        style={isLed ? {animation:`chipLed ${ledDur} linear ${ledDelay} infinite`} : undefined} />
      <ellipse cx={ox} cy={cy} rx={rx * 0.6} ry={ry * 0.55} fill="none"
        stroke={isLed ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.16)"}
        strokeWidth={isLed ? 0.8 : 0.5} />
      {[0, 72, 144, 216, 288].map((deg, di) => {
        const a = (deg * Math.PI) / 180;
        return <ellipse key={di} cx={ox + Math.cos(a) * (rx - 1.3)} cy={cy + Math.sin(a) * (ry - 0.6)}
          rx={0.7} ry={0.35} fill={isLed ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.25)"} />;
      })}
      <ellipse cx={ox - 1} cy={cy - 0.8} rx={rx * 0.38} ry={ry * 0.28}
        fill={isLed ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.12)"} />
    </g>
  );
  };
  const drawOrder = [2, 1, 0, -1];
  const sr = rowChip[0].rx * 0.85, sry = rowChip[0].ry * 0.8, seh = 1.4, ssp = 2.4;
  return (
    <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} style={{ display:"block" }}>
      {drawOrder.map((rowIdx) => {
        if (rowIdx === -1) {
          return spilled.map((s, i) => {
            const ox = cx + s.sx;
            const cy = baseY - s.sy;
            return (
              <g key={`sp${i}`} style={{ animation:`chipBounce 0.2s ease ${0.06 + i * 0.05}s both` }}
                transform={`rotate(${s.lean} ${ox} ${cy})`}>
                {s.colors.map((c, j) => {
                  const chipY = cy - j * ssp;
                  return (
                    <g key={j}>
                      <ellipse cx={ox} cy={chipY + seh} rx={sr} ry={sry} fill={c.rim} opacity={0.7} />
                      {j === 0 ? null : <rect x={ox - sr} y={chipY} width={sr * 2} height={seh} fill={c.rim} opacity={0.6} />}
                      <ellipse cx={ox} cy={chipY} rx={sr} ry={sry} fill={c.fill} />
                      <ellipse cx={ox} cy={chipY} rx={sr * 0.55} ry={sry * 0.5} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={0.4} />
                      <ellipse cx={ox - 0.8} cy={chipY - 0.5} rx={sr * 0.28} ry={sry * 0.18} fill="rgba(255,255,255,0.1)" />
                    </g>
                  );
                })}
              </g>
            );
          });
        }
        return activeSlots.filter(s => slotDefs[s].row === rowIdx).map(slot => {
          const def = slotDefs[slot];
          const rc = rowChip[def.row];
          const ox = cx + def.ox;
          return stacks[slot].map((c, i) => {
            const cy = baseY - rowBaseY[def.row] - i * rc.sp;
            return renderChip(`s${slot}-${i}`, ox, cy, c, rc.rx, rc.ry, rc.edge, slot * 0.02 + i * 0.03, rc.opacity, slot * 7 + i);
          });
        });
      })}
    </svg>
  );
}
export function useWinFlash() {
  const [flash, setFlash] = useState(false);
  const triggerFlash = useCallback(() => {
    setFlash(true);
    setTimeout(() => setFlash(false), 600);
  }, []);
  return { flash, triggerFlash };
}
