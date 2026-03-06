import React from 'react';

export const IconAceSpade = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <rect x="4" y="2" width="32" height="36" rx="4" fill="#f5f0e8" stroke="#c8b89a" strokeWidth="1.5"/>
    <path d="M20 8 C20 8 12 16 12 20 C12 24 16 26 20 22 C24 26 28 24 28 20 C28 16 20 8 20 8Z" fill="#1a1a2e"/>
    <path d="M18 22 Q20 28 16 30 L24 30 Q20 28 22 22" fill="#1a1a2e"/>
    <text x="8" y="12" fill="#1a1a2e" fontSize="8" fontWeight="bold" fontFamily="Georgia">A</text>
  </svg>
);
export const IconCards = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <rect x="2" y="6" width="22" height="30" rx="3" fill="#f5f0e8" stroke="#c8b89a" strokeWidth="1.2" transform="rotate(-12 13 21)"/>
    <rect x="16" y="6" width="22" height="30" rx="3" fill="#f5f0e8" stroke="#c8b89a" strokeWidth="1.2" transform="rotate(12 27 21)"/>
    <text x="8" y="22" fill="#c0392b" fontSize="12" fontWeight="bold" fontFamily="Georgia" transform="rotate(-12 13 21)">K</text>
    <text x="24" y="22" fill="#1a1a2e" fontSize="12" fontWeight="bold" fontFamily="Georgia" transform="rotate(12 27 21)">A</text>
  </svg>
);
export const IconWheel = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <circle cx="20" cy="20" r="17" fill="#1a1a2e" stroke="#d4af37" strokeWidth="2"/>
    {[0,1,2,3,4,5,6,7].map(i => {
      const a = (i * 45) * Math.PI / 180;
      return <line key={i} x1={20+8*Math.cos(a)} y1={20+8*Math.sin(a)} x2={20+16*Math.cos(a)} y2={20+16*Math.sin(a)} stroke={i%2===0?"#c0392b":"#1a1a2e"} strokeWidth="3" />;
    })}
    <circle cx="20" cy="20" r="5" fill="#27ae60" stroke="#d4af37" strokeWidth="1"/>
    <circle cx="20" cy="4" r="2.5" fill="#d4af37"/>
  </svg>
);
export const IconCherry = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <path d="M20 6 Q24 2 28 6 Q26 12 22 16" stroke="#27ae60" strokeWidth="2" fill="none" strokeLinecap="round"/>
    <path d="M20 6 Q16 2 12 6 Q14 12 18 16" stroke="#27ae60" strokeWidth="2" fill="none" strokeLinecap="round"/>
    <ellipse cx="24" cy="24" rx="8" ry="9" fill="url(#cherryGrad1)"/>
    <ellipse cx="14" cy="26" rx="7" ry="8" fill="url(#cherryGrad2)"/>
    <ellipse cx="22" cy="21" rx="2" ry="2.5" fill="rgba(255,255,255,0.3)"/>
    <ellipse cx="12" cy="23" rx="1.8" ry="2.2" fill="rgba(255,255,255,0.3)"/>
    <defs>
      <radialGradient id="cherryGrad1" cx="40%" cy="35%"><stop offset="0%" stopColor="#ff4444"/><stop offset="100%" stopColor="#aa1111"/></radialGradient>
      <radialGradient id="cherryGrad2" cx="40%" cy="35%"><stop offset="0%" stopColor="#ff3333"/><stop offset="100%" stopColor="#991111"/></radialGradient>
    </defs>
  </svg>
);
export const IconPlinko = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    {}
    {[[20,6],[15,14],[25,14],[10,22],[20,22],[30,22],[5,30],[15,30],[25,30],[35,30]].map(([x,y],i) => (
      <circle key={i} cx={x} cy={y} r="2.2" fill="#d4af37" opacity="0.8"/>
    ))}
    {}
    <circle cx="20" cy="10" r="3.5" fill="#ef4444">
      <animate attributeName="cy" values="6;14;22;30;30;6;6" keyTimes="0;0.2;0.4;0.6;0.75;0.76;1" dur="2s" repeatCount="indefinite"/>
      <animate attributeName="cx" values="20;25;20;25;25;20;20" keyTimes="0;0.2;0.4;0.6;0.75;0.76;1" dur="2s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="1;1;1;1;0;0;1" keyTimes="0;0.6;0.7;0.75;0.76;0.95;1" dur="2s" repeatCount="indefinite"/>
    </circle>
    {}
    <rect x="2" y="34" width="36" height="4" rx="1" fill="rgba(212,175,55,0.2)" stroke="#d4af37" strokeWidth="0.5"/>
  </svg>
);
export const IconCrash = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <path d="M4 36 Q12 34 18 24 Q22 16 26 12 Q30 6 34 4" stroke="#22c55e" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    <circle cx="34" cy="4" r="3" fill="#ef4444">
      <animate attributeName="opacity" values="1;0.3;1" dur="0.8s" repeatCount="indefinite"/>
    </circle>
    <line x1="4" y1="36" x2="38" y2="36" stroke="rgba(212,175,55,0.3)" strokeWidth="1"/>
    <line x1="4" y1="36" x2="4" y2="2" stroke="rgba(212,175,55,0.3)" strokeWidth="1"/>
    <text x="20" y="38" textAnchor="middle" fontSize="5" fill="#d4af37" fontFamily="monospace">×</text>
  </svg>
);
export const IconHighLow = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <polygon points="20,4 30,18 10,18" fill="#22c55e" opacity="0.9"/>
    <polygon points="20,36 30,22 10,22" fill="#ef4444" opacity="0.9"/>
    <rect x="14" y="16" width="12" height="8" rx="2" fill="#f5f0e8" stroke="#c8b89a" strokeWidth="1"/>
    <text x="20" y="23" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#1a1a2e" fontFamily="Georgia">?</text>
  </svg>
);
export const IconDice = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <rect x="2" y="8" width="20" height="20" rx="3" fill="#f5f0e8" stroke="#c8b89a" strokeWidth="1.2" transform="rotate(-8 12 18)"/>
    <circle cx="8" cy="14" r="1.8" fill="#1a1a2e" transform="rotate(-8 12 18)"/>
    <circle cx="16" cy="14" r="1.8" fill="#1a1a2e" transform="rotate(-8 12 18)"/>
    <circle cx="8" cy="22" r="1.8" fill="#1a1a2e" transform="rotate(-8 12 18)"/>
    <circle cx="16" cy="22" r="1.8" fill="#1a1a2e" transform="rotate(-8 12 18)"/>
    <rect x="18" y="12" width="20" height="20" rx="3" fill="#f5f0e8" stroke="#c8b89a" strokeWidth="1.2" transform="rotate(6 28 22)"/>
    <circle cx="24" cy="18" r="1.8" fill="#c0392b" transform="rotate(6 28 22)"/>
    <circle cx="32" cy="18" r="1.8" fill="#c0392b" transform="rotate(6 28 22)"/>
    <circle cx="28" cy="22" r="1.8" fill="#c0392b" transform="rotate(6 28 22)"/>
    <circle cx="24" cy="26" r="1.8" fill="#c0392b" transform="rotate(6 28 22)"/>
    <circle cx="32" cy="26" r="1.8" fill="#c0392b" transform="rotate(6 28 22)"/>
  </svg>
);
export const IconCraps = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <rect x="3" y="20" width="36" height="16" rx="3" fill="#1a6b35" stroke="#d4af37" strokeWidth="1.5"/>
    <text x="21" y="31" textAnchor="middle" fontSize="7" fill="#d4af37" fontFamily="Georgia" fontWeight="bold">PASS LINE</text>
    <rect x="6" y="6" width="12" height="12" rx="2" fill="#f5f0e8" stroke="#c8b89a" strokeWidth="1"/>
    <circle cx="9" cy="9" r="1.5" fill="#c0392b"/><circle cx="15" cy="9" r="1.5" fill="#c0392b"/>
    <circle cx="9" cy="15" r="1.5" fill="#c0392b"/><circle cx="15" cy="15" r="1.5" fill="#c0392b"/>
    <rect x="22" y="4" width="12" height="12" rx="2" fill="#f5f0e8" stroke="#c8b89a" strokeWidth="1" transform="rotate(12 28 10)"/>
    <circle cx="25" cy="7" r="1.5" fill="#1a1a2e" transform="rotate(12 28 10)"/>
    <circle cx="31" cy="7" r="1.5" fill="#1a1a2e" transform="rotate(12 28 10)"/>
    <circle cx="28" cy="10" r="1.5" fill="#1a1a2e" transform="rotate(12 28 10)"/>
    <circle cx="25" cy="13" r="1.5" fill="#1a1a2e" transform="rotate(12 28 10)"/>
    <circle cx="31" cy="13" r="1.5" fill="#1a1a2e" transform="rotate(12 28 10)"/>
  </svg>
);
export const IconKeno = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <rect x="3" y="3" width="34" height="34" rx="4" fill="#1a1a2e" stroke="#d4af37" strokeWidth="1.2"/>
    {[0,1,2,3,4].map(r => [0,1,2,3,4].map(c => {
      const hit = (r+c)%3===0;
      return <rect key={`${r}-${c}`} x={6+c*6.2} y={6+r*6.2} width="4.5" height="4.5" rx="0.8"
        fill={hit ? "#d4af37" : "rgba(255,255,255,0.1)"} opacity={hit ? 0.9 : 0.5}/>;
    }))}
  </svg>
);
export const IconBaccarat = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <rect x="2" y="6" width="16" height="24" rx="3" fill="#f5f0e8" stroke="#c8b89a" strokeWidth="1.2"/>
    <text x="10" y="22" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#1a1a2e" fontFamily="Georgia">9</text>
    <rect x="22" y="10" width="16" height="24" rx="3" fill="#f5f0e8" stroke="#c8b89a" strokeWidth="1.2"/>
    <text x="30" y="26" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#c0392b" fontFamily="Georgia">8</text>
    <text x="20" y="8" textAnchor="middle" fontSize="6" fill="#d4af37" fontFamily="Georgia" fontWeight="bold">VS</text>
  </svg>
);
export const IconScratch = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <rect x="4" y="4" width="32" height="32" rx="4" fill="#d4af37" stroke="#b8941e" strokeWidth="1.5"/>
    <rect x="8" y="8" width="24" height="24" rx="2" fill="#8a8070" opacity="0.7"/>
    <path d="M10 14 L18 14 L18 20 L10 20Z" fill="#f5f0e8" opacity="0.9"/>
    <text x="14" y="19" textAnchor="middle" fontSize="7" fill="#22c55e" fontWeight="bold" fontFamily="Georgia">$</text>
    <path d="M20 10 Q28 12 30 20 Q32 28 26 30" stroke="#f5f0e8" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5"/>
    <circle cx="28" cy="12" r="2" fill="#f5f0e8" opacity="0.6"/>
  </svg>
);
export const SlotCherry = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <path d="M20 6 Q24 2 27 7 Q25 13 22 17" stroke="#2d8a4e" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
    <path d="M20 6 Q16 2 13 7 Q15 13 18 17" stroke="#2d8a4e" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
    <ellipse cx="24" cy="25" rx="8" ry="9" fill="#dc2626"/><ellipse cx="22" cy="22" rx="2.5" ry="3" fill="rgba(255,255,255,0.25)"/>
    <ellipse cx="14" cy="27" rx="7" ry="8" fill="#b91c1c"/><ellipse cx="12" cy="24" rx="2" ry="2.5" fill="rgba(255,255,255,0.2)"/>
  </svg>
);
export const SlotLemon = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <ellipse cx="20" cy="21" rx="12" ry="10" fill="#facc15" transform="rotate(-15 20 21)"/>
    <ellipse cx="20" cy="21" rx="11" ry="9" fill="#fde047" transform="rotate(-15 20 21)"/>
    <path d="M12 18 Q20 15 28 18" stroke="#eab308" strokeWidth="1" fill="none" opacity="0.5"/>
    <ellipse cx="17" cy="19" rx="2" ry="3" fill="rgba(255,255,255,0.2)" transform="rotate(-15 17 19)"/>
    <path d="M30 18 Q33 16 32 14" stroke="#2d8a4e" strokeWidth="2" fill="none" strokeLinecap="round"/>
  </svg>
);
export const SlotOrange = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <circle cx="20" cy="22" r="12" fill="#ea580c"/>
    <circle cx="20" cy="22" r="11" fill="#f97316"/>
    <ellipse cx="17" cy="19" rx="3" ry="3.5" fill="rgba(255,255,255,0.2)"/>
    <circle cx="20" cy="22" r="7" fill="none" stroke="#ea580c" strokeWidth="0.5" opacity="0.4"/>
    <path d="M20 10 Q20 7 22 6" stroke="#2d8a4e" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
    <ellipse cx="22" cy="7" rx="3" ry="2" fill="#22c55e" transform="rotate(30 22 7)"/>
  </svg>
);
export const SlotGrape = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <path d="M20 4 L20 10" stroke="#2d8a4e" strokeWidth="2" strokeLinecap="round"/>
    <ellipse cx="23" cy="6" rx="4" ry="2.5" fill="#22c55e" transform="rotate(20 23 6)"/>
    {[[20,14],[15,18],[25,18],[12,23],[20,22],[28,23],[15,27],[25,27],[20,30]].map(([x,y],i) => (
      <g key={i}><circle cx={x} cy={y} r="4.2" fill="#7c3aed"/><circle cx={x-1} cy={y-1.5} r="1.2" fill="rgba(255,255,255,0.25)"/></g>
    ))}
  </svg>
);
export const SlotBell = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <path d="M10 28 Q10 12 20 8 Q30 12 30 28 Z" fill="#d4af37"/>
    <path d="M12 28 Q12 14 20 10 Q28 14 28 28 Z" fill="#f0d060"/>
    <ellipse cx="18" cy="16" rx="3" ry="4" fill="rgba(255,255,255,0.2)"/>
    <rect x="8" y="27" width="24" height="3" rx="1.5" fill="#d4af37"/>
    <circle cx="20" cy="33" r="3" fill="#b8941e"/>
    <circle cx="20" cy="5" r="2" fill="#d4af37"/>
  </svg>
);
export const SlotDiamond = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <polygon points="20,4 34,20 20,36 6,20" fill="#3b82f6"/>
    <polygon points="20,4 27,20 20,36 13,20" fill="#60a5fa"/>
    <polygon points="20,4 27,20 20,20" fill="#93c5fd" opacity="0.6"/>
    <polygon points="20,4 13,20 20,20" fill="#2563eb" opacity="0.4"/>
    <line x1="6" y1="20" x2="34" y2="20" stroke="#1d4ed8" strokeWidth="0.5" opacity="0.5"/>
    <polygon points="20,6 24,18 20,14" fill="rgba(255,255,255,0.25)"/>
  </svg>
);
export const SlotSeven = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <text x="20" y="33" textAnchor="middle" fill="url(#sevenGrad)" fontSize="34" fontWeight="900" fontFamily="Georgia" stroke="#8b0000" strokeWidth="1">7</text>
    <text x="20" y="33" textAnchor="middle" fill="url(#sevenGrad)" fontSize="34" fontWeight="900" fontFamily="Georgia">7</text>
    <defs><linearGradient id="sevenGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ff4444"/><stop offset="50%" stopColor="#ff0000"/><stop offset="100%" stopColor="#aa0000"/></linearGradient></defs>
  </svg>
);
export const SlotJoker = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <path d="M12 18 Q8 8 14 4 L17 10 L20 2 L23 10 L26 4 Q32 8 28 18" fill="#d4af37"/>
    <circle cx="14" cy="4" r="2.5" fill="#c0392b"/><circle cx="20" cy="2" r="2.5" fill="#3b82f6"/><circle cx="26" cy="4" r="2.5" fill="#22c55e"/>
    <circle cx="20" cy="24" r="10" fill="#f5f0e8" stroke="#d4af37" strokeWidth="1.5"/>
    <circle cx="16" cy="22" r="2" fill="#1a1a2e"/><circle cx="24" cy="22" r="2" fill="#1a1a2e"/>
    <path d="M15 28 Q20 32 25 28" stroke="#c0392b" strokeWidth="2" fill="none" strokeLinecap="round"/>
    <circle cx="14" cy="26" r="2" fill="#ff8888" opacity="0.4"/><circle cx="26" cy="26" r="2" fill="#ff8888" opacity="0.4"/>
  </svg>
);
export const SlotScatter = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <polygon points="20,2 24.5,14 37,14 27,22 30.5,35 20,27 9.5,35 13,22 3,14 15.5,14" fill="#f1c40f" stroke="#d4af37" strokeWidth="1.5"/>
    <text x="20" y="22" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#1a1a2e" fontFamily="sans-serif">FREE</text>
  </svg>
);
export const SLOT_ICON_MAP = { "cherry":<SlotCherry/>, "lemon":<SlotLemon/>, "orange":<SlotOrange/>, "grape":<SlotGrape/>, "bell":<SlotBell/>, "diamond":<SlotDiamond/>, "seven":<SlotSeven/>, "joker":<SlotJoker/>, "scatter":<SlotScatter/> };
export const SLOT_LABEL_MAP = { "cherry":"Cherry", "lemon":"Lemon", "orange":"Orange", "grape":"Grape", "bell":"Bell", "diamond":"Diamond", "seven":"Seven", "joker":"Wild", "scatter":"Scatter" };
