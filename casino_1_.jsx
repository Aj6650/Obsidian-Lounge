import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";
const SUITS = ["♠", "♥", "♦", "♣"];
const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const isRed = (suit) => suit === "♥" || suit === "♦";
function createDeck(numDecks = 1) {
  const deck = [];
  for (let i = 0; i < numDecks; i++)
    for (const suit of SUITS)
      for (const rank of RANKS)
        deck.push({ suit, rank });
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}
const cardVal = (c) => { if (["J","Q","K"].includes(c.rank)) return 10; if (c.rank === "A") return 11; return parseInt(c.rank); };
const rankNum = (r) => ({ "A":14,"K":13,"Q":12,"J":11,"10":10,"9":9,"8":8,"7":7,"6":6,"5":5,"4":4,"3":3,"2":2 }[r]);
const GLOBAL_STYLES = ` html,body,#root,[data-theme]{background:#080604 !important;}@keyframes dealCard{0%{opacity:0;transform:translateY(-60px) translateX(20px) rotate(-12deg) scale(0.8);}60%{opacity:1;transform:translateY(4px) translateX(-2px) rotate(1deg) scale(1.02);}100%{opacity:1;transform:translateY(0) translateX(0) rotate(0deg) scale(1);}}@keyframes cardSlideIn{0%{opacity:0;transform:translateX(80px) translateY(-30px) rotate(8deg) scale(0.7);}50%{opacity:1;transform:translateX(-4px) translateY(2px) rotate(-1deg) scale(1.03);}100%{opacity:1;transform:translateX(0) translateY(0) rotate(0deg) scale(1);}}@keyframes bjReveal{0%{transform:rotateY(90deg) scale(0.85);filter:brightness(2);}50%{transform:rotateY(-10deg) scale(1.05);filter:brightness(1.3);}100%{transform:rotateY(0deg) scale(1);filter:brightness(1);}}@keyframes bjCelebrate{0%{box-shadow:0 0 0px rgba(241,196,15,0);}30%{box-shadow:0 0 30px rgba(241,196,15,0.6),0 0 60px rgba(241,196,15,0.2);}100%{box-shadow:0 0 15px rgba(241,196,15,0.3);}}@keyframes resultBadge{0%{transform:scale(0) rotate(-10deg);opacity:0;}60%{transform:scale(1.2) rotate(2deg);}100%{transform:scale(1) rotate(0deg);opacity:1;}}@keyframes activeHandGlow{0%,100%{box-shadow:0 0 8px currentColor;opacity:0.85;}50%{box-shadow:0 0 20px currentColor,0 0 40px currentColor;opacity:1;}}@keyframes symbolLand{0%{transform:scale(1.3) translateY(-8px);opacity:0.6;}50%{transform:scale(0.92) translateY(2px);}100%{transform:scale(1) translateY(0);opacity:1;}}@keyframes symbolWinGlow{0%,100%{filter:brightness(1) drop-shadow(0 0 4px rgba(241,196,15,0.3));}50%{filter:brightness(1.3) drop-shadow(0 0 12px rgba(241,196,15,0.8));}}@keyframes freeSpinBg{0%,100%{background-position:0% 50%;}50%{background-position:100% 50%;}}@keyframes scratchBurst{0%{transform:scale(0.5);opacity:1;box-shadow:0 0 0 0 rgba(212,175,55,0.6);}50%{transform:scale(1.08);box-shadow:0 0 20px 4px rgba(212,175,55,0.3);}100%{transform:scale(1);opacity:1;box-shadow:0 0 0 0 rgba(212,175,55,0);}}@keyframes matchReveal{0%{transform:scale(0.5) rotate(-5deg);filter:brightness(2);}40%{transform:scale(1.15) rotate(2deg);filter:brightness(1.4);}100%{transform:scale(1) rotate(0deg);filter:brightness(1);}}@keyframes ticketShimmer{0%{background-position:-200% center;}100%{background-position:200% center;}}@keyframes winAccumulate{0%{transform:translateY(0) scale(1);}25%{transform:translateY(-3px) scale(1.08);}100%{transform:translateY(0) scale(1);}}@keyframes pokerFlipIn{0%{transform:rotateY(90deg) scale(0.8);opacity:0.3;filter:brightness(1.8);}50%{transform:rotateY(-8deg) scale(1.04);filter:brightness(1.2);}100%{transform:rotateY(0deg) scale(1);opacity:1;filter:brightness(1);}}@keyframes pokerWinCard{0%,100%{box-shadow:0 0 6px rgba(34,197,94,0.2);}50%{box-shadow:0 0 18px rgba(34,197,94,0.5),0 0 30px rgba(34,197,94,0.15);}}@keyframes pokerRoyalCard{0%,100%{box-shadow:0 0 8px rgba(241,196,15,0.3);}50%{box-shadow:0 0 24px rgba(241,196,15,0.6),0 0 40px rgba(241,196,15,0.2);}}@keyframes holdBadgePulse{0%,100%{opacity:1;}50%{opacity:0.65;}}@keyframes rouletteReveal{0%{transform:scale(0.5);opacity:0;filter:blur(4px);}50%{transform:scale(1.15);filter:blur(0);}100%{transform:scale(1);opacity:1;}}@keyframes historyBubbleIn{0%{transform:scale(0) translateY(8px);opacity:0;}60%{transform:scale(1.15) translateY(-2px);}100%{transform:scale(1) translateY(0);opacity:1;}}@keyframes pocketWinPulse{0%,100%{opacity:0.4;}50%{opacity:0.85;}}@keyframes slotLandRing{0%{r:3;opacity:0.9;stroke-width:3;}100%{r:22;opacity:0;stroke-width:0.5;}}@keyframes pegTrailGlow{0%{opacity:0.9;r:6;}100%{opacity:0;r:2;}}@keyframes multBounceIn{0%{transform:translateY(12px) scale(0.7);opacity:0;}60%{transform:translateY(-2px) scale(1.1);}100%{transform:translateY(0) scale(1);opacity:1;}}@keyframes crashShockwave{0%{transform:scale(0.3);opacity:1;}100%{transform:scale(3);opacity:0;}}@keyframes crashFadeRed{0%{background:rgba(239,68,68,0.25);}100%{background:rgba(239,68,68,0);}}@keyframes rocketTrail{0%,100%{text-shadow:0 0 8px rgba(34,197,94,0.3);}50%{text-shadow:0 0 20px rgba(34,197,94,0.7),0 4px 12px rgba(255,165,0,0.4);}}@keyframes crashHistoryIn{0%{transform:scale(0) translateX(8px);opacity:0;}60%{transform:scale(1.12) translateX(-1px);}100%{transform:scale(1) translateX(0);opacity:1;}}@keyframes hlCardReveal{0%{transform:rotateY(90deg) scale(0.85);filter:brightness(1.6);}50%{transform:rotateY(-6deg) scale(1.03);}100%{transform:rotateY(0) scale(1);filter:brightness(1);}}@keyframes hlCorrect{0%{box-shadow:0 0 0 rgba(34,197,94,0);}50%{box-shadow:0 0 25px rgba(34,197,94,0.5);}100%{box-shadow:0 0 8px rgba(34,197,94,0.2);}}@keyframes hlWrong{0%{transform:translateX(0);}15%{transform:translateX(-6px);}30%{transform:translateX(5px);}45%{transform:translateX(-4px);}60%{transform:translateX(3px);}75%{transform:translateX(-1px);}100%{transform:translateX(0);}}@keyframes hlPotPulse{0%,100%{transform:scale(1);}50%{transform:scale(1.08);}}@keyframes hlStreakFire{0%,100%{text-shadow:0 0 4px rgba(245,158,11,0.3);}50%{text-shadow:0 0 16px rgba(245,158,11,0.7),0 0 30px rgba(239,68,68,0.3);}}@keyframes diceSlam{0%{transform:translateY(-30px) rotate(180deg) scale(0.6);opacity:0.3;}60%{transform:translateY(4px) rotate(-8deg) scale(1.05);}80%{transform:translateY(-2px) rotate(3deg) scale(0.98);}100%{transform:translateY(0) rotate(0deg) scale(1);opacity:1;}}@keyframes diceSumReveal{0%{transform:scale(0.5);opacity:0;filter:blur(3px);}50%{transform:scale(1.2);filter:blur(0);}100%{transform:scale(1);opacity:1;}}@keyframes diceWinGlow{0%,100%{box-shadow:0 0 6px rgba(34,197,94,0.2);}50%{box-shadow:0 0 20px rgba(34,197,94,0.5),0 0 35px rgba(34,197,94,0.15);}}@keyframes diceBetPick{0%{transform:scale(0.95);}50%{transform:scale(1.03);}100%{transform:scale(1);}}@keyframes crapsPointPulse{0%,100%{box-shadow:0 2px 8px rgba(0,0,0,0.3);}50%{box-shadow:0 2px 8px rgba(0,0,0,0.3),0 0 12px rgba(255,255,255,0.3);}}@keyframes crapsNatural{0%{transform:scale(0.7);opacity:0;}50%{transform:scale(1.1);}100%{transform:scale(1);opacity:1;}}@keyframes crapsFeltGlow{0%,100%{box-shadow:inset 0 0 15px rgba(34,197,94,0.08);}50%{box-shadow:inset 0 0 30px rgba(34,197,94,0.2);}}@keyframes kenoHitPop{0%{transform:scale(0.5);box-shadow:0 0 0 rgba(34,197,94,0);}40%{transform:scale(1.25);box-shadow:0 0 18px rgba(34,197,94,0.6);}100%{transform:scale(1);box-shadow:0 0 12px rgba(34,197,94,0.4);}}@keyframes kenoDrawPop{0%{transform:scale(0.7) rotate(-5deg);opacity:0.3;}60%{transform:scale(1.08) rotate(2deg);}100%{transform:scale(1) rotate(0deg);opacity:1;}}@keyframes kenoMatchCount{0%{transform:scale(1);}50%{transform:scale(1.3);color:#22c55e;}100%{transform:scale(1);}}@keyframes bacDealIn{0%{transform:translateX(30px) rotateY(60deg) scale(0.8);opacity:0;filter:brightness(1.5);}50%{transform:translateX(-3px) rotateY(-5deg) scale(1.02);}100%{transform:translateX(0) rotateY(0) scale(1);opacity:1;filter:brightness(1);}}@keyframes bacWinHand{0%,100%{box-shadow:0 0 8px rgba(34,197,94,0.2);}50%{box-shadow:0 0 20px rgba(34,197,94,0.5),0 0 35px rgba(34,197,94,0.15);}}@keyframes bacNatural{0%,100%{text-shadow:0 0 6px rgba(241,196,15,0.3);}50%{text-shadow:0 0 18px rgba(241,196,15,0.7),0 0 30px rgba(241,196,15,0.3);}}@keyframes bacBetSelect{0%{transform:scale(0.96);}40%{transform:scale(1.04);}100%{transform:scale(1);}}@keyframes lobbyTileIn{0%{transform:translateY(20px) scale(0.92);opacity:0;filter:blur(2px);}60%{transform:translateY(-3px) scale(1.02);filter:blur(0);}100%{transform:translateY(0) scale(1);opacity:1;}}@keyframes lobbyIconFloat{0%,100%{transform:translateY(0);}50%{transform:translateY(-3px);}}@keyframes lobbyIconSpin{0%{transform:rotateY(0deg);}100%{transform:rotateY(360deg);}}@keyframes titleReveal{0%{opacity:0;transform:translateY(-12px) scale(0.95);letter-spacing:10px;filter:blur(3px);}60%{filter:blur(0);}100%{opacity:1;transform:translateY(0) scale(1);letter-spacing:4px;}}@keyframes titleDivider{0%{width:0;opacity:0;}100%{width:100px;opacity:1;}}@keyframes suitsReveal{0%{opacity:0;letter-spacing:20px;}100%{opacity:1;letter-spacing:8px;}}@keyframes bankrollReveal{0%{transform:scale(0.8);opacity:0;filter:blur(3px);}50%{transform:scale(1.05);}100%{transform:scale(1);opacity:1;filter:blur(0);}}@keyframes tabSlideIn{0%{transform:translateY(10px);opacity:0;}100%{transform:translateY(0);opacity:1;}}@keyframes vipBadgeGlow{0%,100%{box-shadow:0 0 4px currentColor;}50%{box-shadow:0 0 14px currentColor,0 0 28px rgba(212,175,55,0.1);}}@keyframes signInPulse{0%,100%{box-shadow:0 4px 12px currentColor;opacity:0.8;}50%{box-shadow:0 6px 24px currentColor,0 0 40px currentColor;opacity:1;}}@keyframes fadeIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}@keyframes fadeInScale{from{opacity:0;transform:scale(0.95);}to{opacity:1;transform:scale(1);}}@keyframes shimmer{0%{background-position:-100% center;}100%{background-position:100% center;}}@keyframes float{0%,100%{transform:translateY(0px);}50%{transform:translateY(-3px);}}@keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.7;}}@keyframes hintPulse{0%,100%{opacity:0.5;}50%{opacity:0.25;}}@keyframes bounceIn{0%{transform:scale(0);}60%{transform:scale(1.1);}100%{transform:scale(1);}}@keyframes screenShake{0%,100%{transform:translate(0,0);}10%{transform:translate(-4px,2px);}20%{transform:translate(4px,-2px);}30%{transform:translate(-3px,3px);}40%{transform:translate(3px,-1px);}50%{transform:translate(-2px,2px);}60%{transform:translate(2px,-2px);}70%{transform:translate(-1px,1px);}}@keyframes bigWinPulse{0%,100%{transform:scale(1);text-shadow:0 0 20px rgba(241,196,15,0.5);}50%{transform:scale(1.08);text-shadow:0 0 60px rgba(241,196,15,0.9);}}@keyframes floatUp{0%{opacity:1;transform:translateY(0) scale(1);}100%{opacity:0;transform:translateY(-80px) scale(1.3);}}@keyframes confettiFall{0%{transform:translateY(-10px) rotate(0deg);opacity:1;}100%{transform:translateY(120vh) rotate(720deg);opacity:0.8;}}@keyframes borderGlow{0%,100%{box-shadow:inset 0 0 20px transparent;}50%{box-shadow:inset 0 0 40px currentColor;}}@keyframes slotClunk{0%{transform:translateY(0);}30%{transform:translateY(3px);}60%{transform:translateY(-2px);}100%{transform:translateY(0);}}@keyframes spin{0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}@keyframes shake{0%,100%{transform:translate(0,0) rotate(0);}25%{transform:translate(-3px,2px) rotate(-5deg);}50%{transform:translate(3px,-2px) rotate(3deg);}75%{transform:translate(-2px,1px) rotate(-3deg);}}@keyframes cardFlip{0%{transform:rotateY(90deg) scale(0.9);}100%{transform:rotateY(0deg) scale(1);}}@keyframes lossShake{0%,100%{transform:translate(0,0);}15%{transform:translate(-2px,1px);}30%{transform:translate(2px,-1px);}45%{transform:translate(-1px,1px);}60%{transform:translate(1px,0);}}@keyframes diceRoll{0%{transform:rotate(0deg) scale(0.8);opacity:0.5;}40%{transform:rotate(360deg) scale(1.1);}100%{transform:rotate(720deg) scale(1);opacity:1;}}@keyframes revealPop{0%{transform:scale(0);opacity:0;}70%{transform:scale(1.15);}100%{transform:scale(1);opacity:1;}}@keyframes glowPulse{0%,100%{box-shadow:0 0 5px currentColor;}50%{box-shadow:0 0 20px currentColor;}}input[type='range']::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:20px;height:20px;border-radius:50%;background:var(--accent-gradient,radial-gradient(circle,#d4af37,#b8941e));border:2px solid var(--accent-light,#f0d060);cursor:pointer;box-shadow:0 0 8px var(--accent-glow,rgba(212,175,55,0.5));}input[type='range']::-moz-range-thumb{width:20px;height:20px;border-radius:50%;background:var(--accent-gradient,radial-gradient(circle,#d4af37,#b8941e));border:2px solid var(--accent-light,#f0d060);cursor:pointer;box-shadow:0 0 8px var(--accent-glow,rgba(212,175,55,0.5));}button{transition:all 0.15s cubic-bezier(0.4,0,0.2,1);}button:not(:disabled):active{transform:scale(0.97);}.game-tile-icon{animation:float 3s ease-in-out infinite !important;}.anim-shimmer-title{animation:shimmer 4s linear infinite !important;}@keyframes rainbowCycle{0%{filter:hue-rotate(0deg);}100%{filter:hue-rotate(360deg);}}.anim-rainbow{animation:rainbowCycle 3s linear infinite !important;}@keyframes goldGlintSweep{0%{left:-30%;opacity:0;}15%{opacity:1;}85%{opacity:1;}100%{left:130%;opacity:0;}}@keyframes goldPulseGlow{0%,100%{opacity:0.4;filter:blur(30px);}50%{opacity:0.7;filter:blur(40px);}}@keyframes goldShimmer{0%{background-position:-200% center;}100%{background-position:200% center;}}.anim-gold-shimmer{animation:goldShimmer 3s linear infinite !important;}@keyframes etherealFloat{0%,100%{transform:translateY(0) scale(1);opacity:0.6;}50%{transform:translateY(-8px) scale(1.02);opacity:0.9;}}@keyframes goldTileGlow{0%,100%{box-shadow:0 4px 16px rgba(0,0,0,0.3),0 0 0px rgba(255,215,0,0);}50%{box-shadow:0 4px 16px rgba(0,0,0,0.3),0 0 12px rgba(255,215,0,0.15);}}@keyframes divineBreath{0%,100%{transform:scale(1);opacity:0.7;}50%{transform:scale(1.15);opacity:1;}}@keyframes divineBreathOuter{0%,100%{transform:scale(1);opacity:0.3;}50%{transform:scale(1.25);opacity:0.55;}}@keyframes divineWispA{0%{transform:scale(0.5) rotate(0deg);opacity:0.5;}50%{transform:scale(1.3) rotate(90deg);opacity:0.15;}100%{transform:scale(1.8) rotate(180deg);opacity:0;}}@keyframes divineWispB{0%{transform:scale(0.5) rotate(45deg);opacity:0.4;}50%{transform:scale(1.2) rotate(135deg);opacity:0.12;}100%{transform:scale(1.7) rotate(225deg);opacity:0;}}@keyframes divineRingPulse{0%,100%{transform:scale(1);opacity:0.15;box-shadow:0 0 12px rgba(255,215,0,0.15);}50%{transform:scale(1.08);opacity:0.3;box-shadow:0 0 24px rgba(255,215,0,0.25);}}@keyframes rainbowBorder{0%{border-color:#ff6ec7;box-shadow:inset 0 0 40px rgba(255,110,199,0.1),0 0 8px rgba(255,110,199,0.1);}16%{border-color:#ff9a3c;box-shadow:inset 0 0 40px rgba(255,154,60,0.1),0 0 8px rgba(255,154,60,0.1);}33%{border-color:#f7e84e;box-shadow:inset 0 0 40px rgba(247,232,78,0.1),0 0 8px rgba(247,232,78,0.1);}50%{border-color:#4cff50;box-shadow:inset 0 0 40px rgba(76,255,80,0.1),0 0 8px rgba(76,255,80,0.1);}66%{border-color:#3cb8ff;box-shadow:inset 0 0 40px rgba(60,184,255,0.1),0 0 8px rgba(60,184,255,0.1);}83%{border-color:#c850f0;box-shadow:inset 0 0 40px rgba(200,80,240,0.1),0 0 8px rgba(200,80,240,0.1);}100%{border-color:#ff6ec7;box-shadow:inset 0 0 40px rgba(255,110,199,0.1),0 0 8px rgba(255,110,199,0.1);}}.anim-rainbow-border{animation:rainbowBorder 4s linear infinite;}.anim-coin{animation-name:coinFall !important;animation-timing-function:ease-in !important;animation-iteration-count:infinite !important;}.anim-float-win{animation:floatUp 1.8s ease-out forwards !important;}.anim-pulse-slow{animation:pulse 1.2s ease-in-out infinite !important;}.anim-pulse-spinner{animation:pulse 0.5s ease-in-out infinite !important;}.anim-coin-rain{animation-name:coinFall !important;animation-timing-function:ease-in !important;animation-iteration-count:infinite !important;}.anim-streak-glow-fast{animation:streakGlow 0.8s ease-in-out infinite !important;}.anim-streak-glow-slow{animation:streakGlow 1.5s ease-in-out infinite !important;}.anim-fire-fast{animation:fireFlicker 0.3s ease-in-out infinite !important;}.anim-fire-slow{animation:fireFlicker 0.6s ease-in-out infinite !important;}.anim-confetti{animation-name:confettiFall !important;animation-timing-function:linear !important;animation-fill-mode:forwards !important;}.anim-grey-rain{animation-name:greyRainFall !important;animation-timing-function:linear !important;animation-iteration-count:infinite !important;}.anim-bokeh{animation-name:bokehDrift !important;animation-timing-function:ease-in-out !important;animation-iteration-count:infinite !important;}.anim-spinner{animation:pulse 0.5s ease-in-out infinite !important;}.anim-vignette-breath{animation:vignetteBreath 1.5s ease-in-out infinite !important;}.anim-glow-breath{animation:glowBreath 1.2s ease-in-out infinite !important;}.anim-big-win-pulse{animation:bigWinPulse 0.8s ease-in-out infinite !important;}::selection{background:var(--accent-glow,rgba(212,175,55,0.25));color:var(--accent-light,#f0d060);}::-webkit-scrollbar{width:6px;}::-webkit-scrollbar-track{background:transparent;}::-webkit-scrollbar-thumb{background:var(--accent-glow,rgba(212,175,55,0.2));border-radius:3px;}::-webkit-scrollbar-thumb:hover{background:var(--accent-light,rgba(212,175,55,0.35));}@keyframes fireFlicker{0%,100%{transform:scale(1) rotate(-2deg);opacity:0.9;}25%{transform:scale(1.05) rotate(1deg);opacity:1;}50%{transform:scale(0.97) rotate(-1deg);opacity:0.85;}75%{transform:scale(1.03) rotate(2deg);opacity:0.95;}}@keyframes streakGlow{0%,100%{text-shadow:0 0 8px rgba(255,150,0,0.4);}50%{text-shadow:0 0 20px rgba(255,150,0,0.8);}}@keyframes toastSlide{0%{transform:translateX(120%);opacity:0;}15%{transform:translateX(-4%);opacity:1;}20%{transform:translateX(0);}85%{transform:translateX(0);opacity:1;}100%{transform:translateX(120%);opacity:0;}}@keyframes nearMissPulse{0%{transform:scale(1);}30%{transform:scale(1.06);}60%{transform:scale(0.98);}100%{transform:scale(1);}}@keyframes chipBounce{0%{transform:translateY(0);}40%{transform:translateY(-3px);}100%{transform:translateY(0);}}@keyframes chipFxPulse{0%,100%{opacity:0.6;transform:scale(1);}50%{opacity:1;transform:scale(1.03);}}@keyframes chipFxFloat{0%,100%{opacity:0.5;transform:translateY(0);}50%{opacity:0.8;transform:translateY(-2px);}}@keyframes chipFxSpin{0%{filter:hue-rotate(0deg);}100%{filter:hue-rotate(360deg);}}@keyframes chipFxRainbow{0%{filter:hue-rotate(0deg) brightness(1);}50%{filter:hue-rotate(180deg) brightness(1.1);}100%{filter:hue-rotate(360deg) brightness(1);}}@keyframes chipFxFlicker{0%{opacity:0.1;}20%{opacity:0.55;}40%{opacity:0.08;}60%{opacity:0.65;}80%{opacity:0.12;}100%{opacity:0.5;}}@keyframes chipLed{0%{fill:#ff0040;}8%{fill:#ff4400;}16%{fill:#ff9900;}24%{fill:#ffdd00;}32%{fill:#88ff00;}40%{fill:#00ff44;}48%{fill:#00ffaa;}56%{fill:#00ddff;}64%{fill:#0088ff;}72%{fill:#4400ff;}80%{fill:#9900ff;}88%{fill:#ff00bb;}100%{fill:#ff0040;}}@keyframes chipLedRim{0%{fill:#cc0030;}8%{fill:#cc3500;}16%{fill:#cc7a00;}24%{fill:#ccb100;}32%{fill:#6acc00;}40%{fill:#00cc35;}48%{fill:#00cc88;}56%{fill:#00b1cc;}64%{fill:#006acc;}72%{fill:#3500cc;}80%{fill:#7a00cc;}88%{fill:#cc0095;}100%{fill:#cc0030;}}@keyframes chipLedGlow{0%{filter:drop-shadow(0 0 3px #ff004080);}16%{filter:drop-shadow(0 0 3px #ffdd0080);}32%{filter:drop-shadow(0 0 3px #00ff4480);}48%{filter:drop-shadow(0 0 3px #00ddff80);}64%{filter:drop-shadow(0 0 3px #0088ff80);}80%{filter:drop-shadow(0 0 3px #9900ff80);}100%{filter:drop-shadow(0 0 3px #ff004080);}}@keyframes coinFall{0%{transform:translateY(-20px) rotate(0deg);opacity:1;}100%{transform:translateY(120vh) rotate(720deg);opacity:0.9;}}@keyframes colorWash{0%{opacity:0;}15%{opacity:1;}100%{opacity:0;}}@keyframes colorWashHold{0%{opacity:0;}100%{opacity:1;}}@keyframes colorWashPulse{0%{opacity:0;}10%{opacity:1;}30%{opacity:0.6;}50%{opacity:1;}70%{opacity:0.6;}100%{opacity:1;}}@keyframes colorShift{0%{filter:hue-rotate(0deg);opacity:0;}8%{opacity:1;}33%{filter:hue-rotate(40deg);}66%{filter:hue-rotate(80deg);}100%{filter:hue-rotate(120deg);opacity:1;}}@keyframes jackpotWash{0%{opacity:0;background:rgba(255,215,0,0.15);}8%{opacity:1;}25%{background:rgba(255,100,0,0.18);}50%{background:rgba(255,215,0,0.2);}75%{background:rgba(255,255,255,0.12);}100%{background:rgba(255,215,0,0.15);opacity:1;}}@keyframes jackpotWashLoop{0%{background:rgba(255,215,0,0.15);}25%{background:rgba(255,100,0,0.18);}50%{background:rgba(255,215,0,0.2);}75%{background:rgba(255,255,255,0.12);}100%{background:rgba(255,215,0,0.15);}}@keyframes chipPop{0%{transform:scale(1);}20%{transform:scale(1.25);}50%{transform:scale(0.95);}100%{transform:scale(1);}}@keyframes megaPop{0%{transform:scale(1);}15%{transform:scale(1.4);}40%{transform:scale(0.92);}60%{transform:scale(1.08);}100%{transform:scale(1);}}@keyframes chipErupt{0%{transform:translate(0,0) scale(1);opacity:1;}100%{opacity:0;}}@keyframes epicShake{0%,100%{transform:translate(0,0) rotate(0);}5%{transform:translate(-6px,4px) rotate(-2deg);}10%{transform:translate(6px,-4px) rotate(2deg);}15%{transform:translate(-5px,3px) rotate(-1.5deg);}20%{transform:translate(5px,-2px) rotate(1.5deg);}25%{transform:translate(-4px,2px) rotate(-1deg);}30%{transform:translate(3px,-1px) rotate(0.5deg);}35%{transform:translate(-2px,1px) rotate(-0.5deg);}40%{transform:translate(1px,0) rotate(0);}}@keyframes fireParticle{0%{transform:translateY(0) scale(1);opacity:1;}100%{transform:translateY(-20px) scale(0);opacity:0;}}@keyframes starBurst{0%{transform:scale(0) rotate(0deg);opacity:1;}50%{opacity:0.8;}100%{transform:scale(2) rotate(360deg);opacity:0;}}@keyframes glowBreath{0%,100%{box-shadow:0 0 8px currentColor;opacity:0.7;}50%{box-shadow:0 0 24px currentColor;opacity:1;}}@keyframes shockwaveRing{0%{transform:translate(-50%,-50%) scale(0);opacity:0.9;}100%{transform:translate(-50%,-50%) scale(1);opacity:0;}}@keyframes letterDrop{0%{transform:translateY(-120px) scale(1.5);opacity:0;filter:blur(6px);}45%{transform:translateY(8px) scale(0.93);opacity:1;filter:blur(0);}65%{transform:translateY(-5px) scale(1.04);}80%{transform:translateY(2px) scale(0.99);}100%{transform:translateY(0) scale(1);}}@keyframes jackpotLetterDrop{0%{transform:translateY(-180px) scale(1.8) rotate(-8deg);opacity:0;filter:blur(8px);}35%{transform:translateY(14px) scale(0.88) rotate(2deg);opacity:1;filter:blur(0);}55%{transform:translateY(-10px) scale(1.08) rotate(-1deg);}75%{transform:translateY(4px) scale(0.97) rotate(0.5deg);}100%{transform:translateY(0) scale(1) rotate(0deg);}}@keyframes bokehDrift{0%,100%{transform:translate(0,0) scale(1);opacity:0.4;}33%{transform:translate(12px,-18px) scale(1.15);opacity:0.7;}66%{transform:translate(-10px,12px) scale(0.85);opacity:0.35;}}@keyframes vignetteBreath{0%,100%{opacity:0.65;}50%{opacity:0.3;}}@keyframes fireRise{0%{transform:translateY(0) scale(1);opacity:0.7;}100%{transform:translateY(-220px) scale(0.2);opacity:0;}}@keyframes shatterFly{0%{transform:translate(-50%,-50%) rotate(0deg) scale(1);opacity:1;}100%{transform:translate(calc(-50% + var(--tx)),calc(-50% + var(--ty))) rotate(var(--rot)) scale(0.1);opacity:0;}}@keyframes zoomFadeOut{0%{transform:scale(1);opacity:1;}100%{transform:scale(2.5);opacity:0;}}@keyframes auroraShift{0%,100%{background-position:0% 50%;filter:hue-rotate(0deg);}50%{background-position:100% 50%;filter:hue-rotate(30deg);}}@keyframes starZoom{0%{transform:translate(var(--sx),var(--sy)) scale(0);opacity:0;}15%{opacity:0.8;}100%{transform:translate(var(--tx),var(--ty)) scale(1.5);opacity:0;}}@keyframes chipFountain{0%{transform:translateY(0) translateX(var(--drift)) rotate(0deg);opacity:1;}40%{opacity:0.9;}100%{transform:translateY(var(--rise)) translateX(var(--drift2)) rotate(var(--rot));opacity:0;}}@keyframes epicEntranceShake{0%,100%{transform:translate(0,0);}8%{transform:translate(-7px,5px);}16%{transform:translate(7px,-5px);}24%{transform:translate(-6px,4px);}32%{transform:translate(5px,-3px);}40%{transform:translate(-3px,2px);}48%{transform:translate(2px,-1px);}56%{transform:translate(0,0);}}@keyframes jackpotEntranceQuake{0%,100%{transform:translate(0,0);}5%{transform:translate(-10px,7px);}10%{transform:translate(10px,-7px);}15%{transform:translate(-9px,6px);}20%{transform:translate(8px,-5px);}25%{transform:translate(-7px,4px);}30%{transform:translate(6px,-3px);}40%{transform:translate(-4px,2px);}50%{transform:translate(3px,-1px);}60%{transform:translate(-1px,1px);}70%{transform:translate(0,0);}}@keyframes letterBounce{0%,100%{transform:translateY(0);}50%{transform:translateY(-4px);}}@keyframes goldenExplosion{0%{transform:translate(-50%,-50%) scale(0);opacity:1;background:radial-gradient(circle,rgba(255,215,0,0.8),rgba(255,69,0,0.4),transparent);}100%{transform:translate(-50%,-50%) scale(4);opacity:0;background:radial-gradient(circle,rgba(255,215,0,0),rgba(255,69,0,0),transparent);}}@keyframes greyRainFall{0%{transform:translateY(-20px);opacity:0.6;}100%{transform:translateY(120vh);opacity:0.3;}}@keyframes crackSpread{0%{clip-path:inset(48% 48% 48% 48%);opacity:0;}30%{opacity:0.8;}100%{clip-path:inset(0% 0% 0% 0%);opacity:0.6;}}@keyframes bustedLetterSlam{0%{transform:translateY(-200px) scale(2);opacity:0;filter:blur(8px);}40%{transform:translateY(12px) scale(0.85);opacity:1;filter:blur(0);}55%{transform:translateY(-8px) scale(1.08);}70%{transform:translateY(4px) scale(0.97);}100%{transform:translateY(0) scale(1);}}@keyframes bustedPulse{0%,100%{text-shadow:0 0 20px rgba(239,68,68,0.5);}50%{text-shadow:0 0 50px rgba(239,68,68,0.8),0 0 80px rgba(239,68,68,0.3);}}@keyframes flickerDie{0%{opacity:1;}5%{opacity:0.1;}10%{opacity:0.8;}15%{opacity:0.05;}20%{opacity:0.7;}30%{opacity:0;}35%{opacity:0.5;}40%{opacity:0;}50%{opacity:0.3;}55%{opacity:0;}65%{opacity:0.15;}70%{opacity:0;}100%{opacity:0;}}@keyframes redVignetteBreath{0%,100%{opacity:0.6;}50%{opacity:0.35;}}@keyframes bustedShake{0%,100%{transform:translate(0,0);}8%{transform:translate(-8px,6px);}16%{transform:translate(8px,-6px);}24%{transform:translate(-7px,5px);}32%{transform:translate(6px,-4px);}40%{transform:translate(-5px,3px);}48%{transform:translate(4px,-2px);}56%{transform:translate(-2px,1px);}64%{transform:translate(0,0);}}@keyframes slideUp{0%{transform:translateY(30px);opacity:0;}100%{transform:translateY(0);opacity:1;}}@keyframes screenFadeIn{0%{opacity:1;}100%{opacity:1;}}@keyframes overlayFadeOut{0%{opacity:1;}100%{opacity:0;}}@keyframes transitionFade{0%{opacity:0;}40%{opacity:1;}60%{opacity:1;}100%{opacity:0;}}html,body{overscroll-behavior:none;-webkit-tap-highlight-color:transparent;touch-action:manipulation;}*{-webkit-touch-callout:none;}@media (max-width:480px){.casino-title{font-size:30px !important;letter-spacing:2px !important;}.game-grid{grid-template-columns:1fr 1fr !important;gap:8px !important;}.game-tile{padding:12px 6px 10px !important;}.game-tile-name{font-size:11px !important;}.game-tile-desc{font-size:8px !important;}.game-tile-rtp{font-size:6px !important;}.game-tile-icon{transform:scale(0.85);}.tab-btn{padding:7px 12px !important;font-size:9px !important;letter-spacing:1.5px !important;}.stat-grid{gap:8px !important;}.stat-card{padding:10px 8px !important;}.stat-value{font-size:17px !important;}.game-shell-title{font-size:14px !important;letter-spacing:3px !important;}.game-shell-spacer{min-height:60px !important;}.game-content{padding:4px 8px 0 !important;}.bankroll-chips{font-size:18px !important;}.ach-grid{grid-template-columns:1fr !important;}.breakdown-row{flex-direction:column !important;align-items:flex-start !important;gap:2px !important;}.breakdown-stats{justify-content:flex-start !important;}.session-bar{flex-direction:row !important;flex-wrap:wrap !important;justify-content:center !important;gap:6px !important;}.session-bar > div{min-width:60px;}.bet-chip-row{gap:4px !important;}.bet-chip-row button{width:40px !important;height:40px !important;font-size:10px !important;}.roulette-nums{gap:2px !important;}.roulette-nums button{width:28px !important;height:28px !important;font-size:9px !important;}.keno-grid{gap:3px !important;grid-template-columns:repeat(6,1fr) !important;}.keno-grid button{font-size:11px !important;min-height:34px !important;}.rules-btn{bottom:10px !important;right:10px !important;width:32px !important;height:32px !important;font-size:15px !important;}.back-btn{padding:6px 12px !important;font-size:11px !important;}.plinko-board{transform:scale(0.85);transform-origin:top center;}.crash-graph{max-height:200px !important;}.gold-btn{padding:10px 28px !important;font-size:13px !important;letter-spacing:2px !important;}.gold-btn-small{padding:7px 18px !important;font-size:11px !important;}}@media (max-width:360px){.casino-title{font-size:24px !important;}.game-grid{gap:6px !important;}.game-tile-name{font-size:10px !important;}.bankroll-chips{font-size:16px !important;}.stat-grid{grid-template-columns:1fr !important;}.bet-chip-row button{width:36px !important;height:36px !important;font-size:9px !important;}.roulette-nums button{width:24px !important;height:24px !important;font-size:8px !important;}.keno-grid{grid-template-columns:repeat(5,1fr) !important;}.tab-btn{padding:6px 10px !important;font-size:8px !important;letter-spacing:1px !important;}.plinko-board{transform:scale(0.72);}}@supports (padding-top:env(safe-area-inset-top)){.game-shell-spacer{padding-top:env(safe-area-inset-top) !important;}.back-btn{top:max(12px,env(safe-area-inset-top)) !important;}}@media (pointer:coarse){button{min-height:40px;}.roulette-nums button{min-height:30px !important;min-width:30px !important;}.keno-grid button{min-height:38px !important;}input[type='range']{height:24px !important;}input[type='range']::-webkit-slider-thumb{width:28px !important;height:28px !important;}input[type='range']::-moz-range-thumb{width:28px !important;height:28px !important;}}.game-tile,.bet-chip-row button,.roulette-nums button,.keno-grid button,.tab-btn,.gold-btn{user-select:none;-webkit-user-select:none;}.card-deal,.reel-strip-inner,.plinko-board svg{will-change:transform;transform:translateZ(0);}@media (prefers-reduced-motion:reduce){*{animation-duration:0.01ms !important;transition-duration:0.01ms !important;}}@keyframes reelScroll{0%{transform:translateY(0);}100%{transform:translateY(-100%);}}.reel-strip{display:flex;flex-direction:column;}.reel-strip.spinning .reel-strip-inner{animation:reelScroll 0.12s linear infinite;}@keyframes ballOrbit{0%{transform:rotate(0deg) translateX(var(--ball-r)) rotate(0deg);opacity:1;}100%{transform:rotate(calc(var(--ball-spins) * 360deg)) translateX(var(--ball-r)) rotate(calc(var(--ball-spins) * -360deg));opacity:1;}}@keyframes ballSettle{0%{transform:rotate(var(--settle-start)) translateX(var(--ball-r)) rotate(calc(-1 * var(--settle-start)));}30%{transform:rotate(calc(var(--settle-start) + 40deg)) translateX(calc(var(--ball-r) - 6px)) rotate(calc(-1 * (var(--settle-start) + 40deg)));}60%{transform:rotate(calc(var(--settle-start) + 20deg)) translateX(calc(var(--ball-r) - 2px)) rotate(calc(-1 * (var(--settle-start) + 20deg)));}100%{transform:rotate(var(--settle-end)) translateX(calc(var(--ball-r) - 4px)) rotate(calc(-1 * var(--settle-end)));}}.anim-fast .card-deal{animation-duration:0.15s !important;}.anim-fast .reel-strip.spinning .reel-strip-inner{animation-duration:0.08s !important;}.anim-instant .card-deal{animation-duration:0s !important;animation-delay:0s !important;}.anim-instant .reel-strip.spinning .reel-strip-inner{animation-duration:0.04s !important;}.theme-light{background:#f5f0e5 !important;color:#2a2018 !important;}.theme-light .bankroll-chips{color:#8b7424 !important;text-shadow:none !important;}.theme-light .tab-btn{border-color:rgba(0,0,0,0.15) !important;}`;
const FELT_BG = "radial-gradient(ellipse at center, #1a1510 0%, #0f0c08 50%, #080604 100%)";
const DARK_BG = "radial-gradient(ellipse at center, #150f0c 0%, #0e0a08 60%, #080604 100%)";
const BLUE_BG = "radial-gradient(ellipse at center, #18140e 0%, #0e0a08 60%, #080604 100%)";
const RED_BG = "radial-gradient(ellipse at center, #1a110e 0%, #0e0908 60%, #080604 100%)";
const PURPLE_BG = "radial-gradient(ellipse at center, #1a1018 0%, #0e080c 60%, #080508 100%)";
let _themeAccent = "#d4af37";
let _isRainbow = false;
let _isJackpotSkin = false;
let _cardTint = null;
const T = {
  gold: "#d4af37", goldLight: "#f0d060", goldDark: "#b8941e",
  magenta: "#c2185b", magentaLight: "#e91e63", magentaDark: "#880e4f",
  green: "#22c55e", greenDark: "#15803d",
  red: "#ef4444", redDark: "#c0392b",
  blue: "#3b82f6",
  panel: "rgba(255,240,220,0.03)", panelBorder: "rgba(212,175,55,0.1)",
  muted: "#8a7a68", dim: "#5a4e3e", faint: "#3e3428",
  text: "#e8dcc8", textMuted: "#c8b8a0",
  bg: "#150f0c", bgDark: "#0a0704",
  serif: "'Playfair Display', Georgia, serif",
  mono: "'JetBrains Mono', monospace",
  radius: 8, radiusLg: 14,
};
const S = {
  label: (color = T.muted) => ({
    fontSize: 9, letterSpacing: 3, textTransform: "uppercase",
    fontFamily: T.mono, fontWeight: 700, color, textAlign: "center",
  }),
  mono: (size = 11, color = T.muted) => ({
    fontSize: size, fontFamily: T.mono, fontWeight: 600, color,
  }),
  heading: (size = 18, color = T.text) => ({
    fontSize: size, fontWeight: 700, fontFamily: T.serif, letterSpacing: 2, color,
  }),
  panel: (borderColor = T.panelBorder) => ({
    background: T.panel, border: `1px solid ${borderColor}`,
    borderRadius: T.radius, padding: "10px 14px",
  }),
  result: (won) => ({
    fontSize: 18, fontWeight: 700, fontFamily: T.serif, letterSpacing: 2,
    color: won ? T.green : T.red, animation: "fadeIn 0.3s ease", textAlign: "center",
  }),
  message: {
    fontSize: 13, fontWeight: 600, fontFamily: T.serif,
    color: T.textMuted, textAlign: "center", letterSpacing: 1,
    minHeight: 20, padding: "8px 0",
  },
  center: { display: "flex", alignItems: "center", justifyContent: "center" },
  col: { display: "flex", flexDirection: "column", alignItems: "center" },
  fadeIn: { animation: "fadeIn 0.3s ease" },
  gap: (n = 10) => ({ display: "flex", gap: n }),
};
const CHIP_SKINS = [
  { id:"house", name:"House Chips", desc:"Standard casino floor", icon:"♠", type:"default", req:null, effect:null,
    colors:[{fill:"#c0392b",rim:"#961d13"},{fill:"#2980b9",rim:"#1a5a80"},{fill:"#27ae60",rim:"#1a7a40"},{fill:"#8e44ad",rim:"#632e7a"},{fill:"#d4af37",rim:"#a07c10"},{fill:"#e67e22",rim:"#a85510"},{fill:"#1abc9c",rim:"#128068"},{fill:"#f39c12",rim:"#b07008"}],
    accent:"#d4af37" },
  { id:"luckystreak", name:"Lucky Streak", desc:"Win 10 in a row", icon:"♣", type:"achievement", req:"streak_10", effect:"subtleglow",
    colors:[{fill:"#10b981",rim:"#087a55"},{fill:"#22d394",rim:"#10a06a"},{fill:"#d4af37",rim:"#a07c10"},{fill:"#16c788",rim:"#0c8a5a"},{fill:"#10b981",rim:"#087a55"},{fill:"#d4af37",rim:"#a07c10"},{fill:"#22d394",rim:"#10a06a"},{fill:"#16c788",rim:"#0c8a5a"}],
    accent:"#22d394" },
  { id:"shark", name:"Shark", desc:"Win 1,000 rounds", icon:"▸", type:"achievement", req:"wins_1k", effect:"subtleglow",
    colors:[{fill:"#4a5568",rim:"#2d3748"},{fill:"#38504a",rim:"#1e3830"},{fill:"#c0392b",rim:"#8a2018"},{fill:"#4a5568",rim:"#2d3748"},{fill:"#3a5a50",rim:"#1e3830"},{fill:"#4a5568",rim:"#2d3748"},{fill:"#38504a",rim:"#1e3830"},{fill:"#c0392b",rim:"#8a2018"}],
    accent:"#4a5568" },
  { id:"whale", name:"Whale", desc:"Wager $10,000,000 total", icon:"$$", type:"stat", req:{stat:"totalWagered",val:10000000}, effect:"subtleglow",
    colors:[{fill:"#1e3a5f",rim:"#0f2440"},{fill:"#2a5080",rim:"#183460"},{fill:"#e8e0d0",rim:"#c0b8a8"},{fill:"#1e3a5f",rim:"#0f2440"},{fill:"#2a5080",rim:"#183460"},{fill:"#e8e0d0",rim:"#c0b8a8"},{fill:"#1e4a6f",rim:"#0f2e50"},{fill:"#2a5080",rim:"#183460"}],
    accent:"#2a5080" },
  { id:"degenerate", name:"Degenerate", desc:"Go broke 100 times", icon:"✗", type:"achievement", req:"rebuy_100", effect:"subtleglow",
    colors:[{fill:"#8b4513",rim:"#5a2d0a"},{fill:"#6b3a10",rim:"#4a2508"},{fill:"#a0522d",rim:"#6b3518"},{fill:"#7a3b12",rim:"#52280c"},{fill:"#8b4513",rim:"#5a2d0a"},{fill:"#6b3a10",rim:"#4a2508"},{fill:"#a0522d",rim:"#6b3518"},{fill:"#7a3b12",rim:"#52280c"}],
    accent:"#8b4513" },
  { id:"unstoppable", name:"Unstoppable", desc:"Win 20 in a row", icon:"⚡", type:"achievement", req:"streak_20", effect:"lightning",
    colors:[{fill:"#1e40af",rim:"#142e7a"},{fill:"#3b82f6",rim:"#2060c0"},{fill:"#e0f0ff",rim:"#a0c0e0"},{fill:"#2563eb",rim:"#1a4aB0"},{fill:"#1e40af",rim:"#142e7a"},{fill:"#e0f0ff",rim:"#a0c0e0"},{fill:"#3b82f6",rim:"#2060c0"},{fill:"#2563eb",rim:"#1a4aB0"}],
    accent:"#3b82f6" },
  { id:"onepercent", name:"One Percent", desc:"Reach $1B bankroll", icon:"◆", type:"achievement", req:"bankroll_1b", effect:"prismatic",
    colors:[{fill:"#e8e8f0",rim:"#b0b0c0"},{fill:"#f0e8ff",rim:"#c0b0d8"},{fill:"#e0f0f8",rim:"#a8c8d8"},{fill:"#f8f0e8",rim:"#d0c0a8"},{fill:"#f0e8f0",rim:"#c0b0c0"},{fill:"#e8f0e8",rim:"#b0c8b0"},{fill:"#f0f0e0",rim:"#c0c0a0"},{fill:"#e8e8f0",rim:"#b0b0c0"}],
    accent:"#e0e0f0" },
  { id:"billiondollar", name:"Billion Dollar", desc:"Win $1B in one bet", icon:"▲", type:"achievement", req:"big_win_1b", effect:"ember",
    colors:[{fill:"#ffd700",rim:"#b89a00"},{fill:"#ff4500",rim:"#b83000"},{fill:"#1a0a00",rim:"#0a0500"},{fill:"#ff6a00",rim:"#b84a00"},{fill:"#ffd700",rim:"#b89a00"},{fill:"#1a0a00",rim:"#0a0500"},{fill:"#ff4500",rim:"#b83000"},{fill:"#ff6a00",rim:"#b84a00"}],
    accent:"#ff6a00" },
  { id:"degenlord", name:"Degen Lord", desc:"Wager $5B total", icon:"☣", type:"achievement", req:"wagered_5b", effect:"toxic",
    colors:[{fill:"#39ff14",rim:"#20b00a"},{fill:"#1a0a30",rim:"#0a0518"},{fill:"#bf00ff",rim:"#8000aa"},{fill:"#39ff14",rim:"#20b00a"},{fill:"#1a0a30",rim:"#0a0518"},{fill:"#bf00ff",rim:"#8000aa"},{fill:"#39ff14",rim:"#20b00a"},{fill:"#1a0a30",rim:"#0a0518"}],
    accent:"#39ff14" },
  { id:"legend", name:"Legend", desc:"Win 5,000 bets", icon:"★", type:"achievement", req:"wins_5k", effect:"radiance",
    colors:[{fill:"#b8860b",rim:"#7a5a08"},{fill:"#8b0000",rim:"#5a0000"},{fill:"#fffff0",rim:"#d0d0c0"},{fill:"#b8860b",rim:"#7a5a08"},{fill:"#8b0000",rim:"#5a0000"},{fill:"#fffff0",rim:"#d0d0c0"},{fill:"#b8860b",rim:"#7a5a08"},{fill:"#8b0000",rim:"#5a0000"}],
    accent:"#b8860b" },
  { id:"vip_bronze", name:"Bronze Glow", desc:"Reach Bronze VIP", icon:"III", type:"vip", req:"bronze", effect:null,
    colors:[{fill:"#cd7f32",rim:"#8a5520"},{fill:"#b87333",rim:"#7a4a1a"},{fill:"#da8a40",rim:"#9a6020"},{fill:"#c07830",rim:"#82501a"},{fill:"#cd7f32",rim:"#8a5520"},{fill:"#b87333",rim:"#7a4a1a"},{fill:"#da8a40",rim:"#9a6020"},{fill:"#c07830",rim:"#82501a"}],
    accent:"#cd7f32" },
  { id:"vip_silver", name:"Silver Mist", desc:"Reach Silver VIP", icon:"II", type:"vip", req:"silver", effect:"mist",
    colors:[{fill:"#c0c0c0",rim:"#8a8a8a"},{fill:"#d0d0d0",rim:"#9a9a9a"},{fill:"#a8a8b8",rim:"#787888"},{fill:"#b8b8c8",rim:"#888898"},{fill:"#c8c8c8",rim:"#929292"},{fill:"#d0d0d0",rim:"#9a9a9a"},{fill:"#b0b0c0",rim:"#808090"},{fill:"#c0c0c0",rim:"#8a8a8a"}],
    accent:"#c0c0c0" },
  { id:"vip_gold", name:"Neon Vegas", desc:"Reach Gold VIP", icon:"I", type:"vip", req:"gold", effect:"neonpulse",
    colors:[{fill:"#ff1493",rim:"#b80d6a"},{fill:"#00e5ff",rim:"#009ab0"},{fill:"#bf00ff",rim:"#8000aa"},{fill:"#ff1493",rim:"#b80d6a"},{fill:"#00e5ff",rim:"#009ab0"},{fill:"#bf00ff",rim:"#8000aa"},{fill:"#ff1493",rim:"#b80d6a"},{fill:"#00e5ff",rim:"#009ab0"}],
    accent:"#ff1493" },
  { id:"vip_platinum", name:"Frost Crystal", desc:"Reach Platinum VIP", icon:"❄", type:"vip", req:"platinum", effect:"frost",
    colors:[{fill:"#a8d8ea",rim:"#6aa0b8"},{fill:"#b0d4e8",rim:"#78a8c8"},{fill:"#e0f0ff",rim:"#a0c0d8"},{fill:"#90c8e0",rim:"#5a98b0"},{fill:"#c0e0f0",rim:"#88b0c8"},{fill:"#a8d8ea",rim:"#6aa0b8"},{fill:"#b0d4e8",rim:"#78a8c8"},{fill:"#e0f0ff",rim:"#a0c0d8"}],
    accent:"#a8d8ea" },
  { id:"vip_emerald", name:"Emerald Fire", desc:"Reach Emerald VIP", icon:"●", type:"vip", req:"emerald", effect:"greenflame",
    colors:[{fill:"#10b981",rim:"#087a55"},{fill:"#0d9668",rim:"#066840"},{fill:"#14d494",rim:"#0aa070"},{fill:"#10b981",rim:"#087a55"},{fill:"#ff6b35",rim:"#c04a20"},{fill:"#10b981",rim:"#087a55"},{fill:"#0d9668",rim:"#066840"},{fill:"#ff6b35",rim:"#c04a20"}],
    accent:"#10b981" },
  { id:"vip_diamond", name:"Obsidian", desc:"Reach Diamond VIP", icon:"◼", type:"vip", req:"diamond", effect:"smoke",
    colors:[{fill:"#1a1a2e",rim:"#0a0a18"},{fill:"#0f0f20",rim:"#050510"},{fill:"#c2185b",rim:"#8a1040"},{fill:"#1a1a2e",rim:"#0a0a18"},{fill:"#0f0f20",rim:"#050510"},{fill:"#c2185b",rim:"#8a1040"},{fill:"#1a1a2e",rim:"#0a0a18"},{fill:"#0f0f20",rim:"#050510"}],
    accent:"#c2185b" },
  { id:"vip_celestial", name:"Celestial", desc:"Reach Celestial VIP", icon:"★", type:"vip", req:"celestial", effect:"stars",
    colors:[{fill:"#1e1b4b",rim:"#0e0b30"},{fill:"#312e81",rim:"#1e1b5a"},{fill:"#f59e0b",rim:"#b87308"},{fill:"#1e1b4b",rim:"#0e0b30"},{fill:"#f59e0b",rim:"#b87308"},{fill:"#312e81",rim:"#1e1b5a"},{fill:"#f59e0b",rim:"#b87308"},{fill:"#1e1b4b",rim:"#0e0b30"}],
    accent:"#f59e0b" },
  { id:"vip_royale", name:"Royale", desc:"Reach Royale VIP", icon:"♠", type:"vip", req:"royale", effect:"royalflame",
    colors:[{fill:"#ff4500",rim:"#b83000"},{fill:"#1a0a00",rim:"#0a0500"},{fill:"#ff4500",rim:"#b83000"},{fill:"#ffd700",rim:"#b89a00"},{fill:"#1a0a00",rim:"#0a0500"},{fill:"#ff4500",rim:"#b83000"},{fill:"#ffd700",rim:"#b89a00"},{fill:"#1a0a00",rim:"#0a0500"}],
    accent:"#ff4500" },
  { id:"jackpot", name:"Jackpot", desc:"Hit a scratch card jackpot", icon:"$", type:"secret", req:"jackpot_hit", effect:"divineaureole",
    colors:[{fill:"#ffd700",rim:"#b89a00"},{fill:"#ffea00",rim:"#c0a800"},{fill:"#ffc400",rim:"#a88800"},{fill:"#ffe040",rim:"#b8a020"},{fill:"#ffd700",rim:"#b89a00"},{fill:"#ffea00",rim:"#c0a800"},{fill:"#ffc400",rim:"#a88800"},{fill:"#ffe040",rim:"#b8a020"}],
    accent:"#ffd700" },
  { id:"completionist", name:"Completionist", desc:"Unlock every achievement", icon:"∞", type:"secret", req:"_all_achievements", effect:"rainbow",
    colors:[{fill:"#ff0055",rim:"#cc0044"},{fill:"#ff6600",rim:"#cc5200"},{fill:"#ffdd00",rim:"#ccb100"},{fill:"#00ff66",rim:"#00cc52"},{fill:"#00ccff",rim:"#00a3cc"},{fill:"#6600ff",rim:"#5200cc"},{fill:"#ff00cc",rim:"#cc00a3"},{fill:"#ffffff",rim:"#cccccc"}],
    accent:"#ff6ec7", neonCycle:true },
];
const INSANE_ACHS = ["streak_20","bankroll_1b","big_win_1b","wagered_5b","wins_5k"];
const isSkinUnlocked = (skin, stats, chips, vipTierId) => {
  if (skin.type === "default") return true;
  if (skin.type === "achievement") return (stats.achievements || []).includes(skin.req);
  if (skin.type === "stat") return (stats[skin.req.stat] || 0) >= skin.req.val;
  if (skin.type === "vip") {
    const tierOrder = ["bronze","silver","gold","platinum","emerald","diamond","celestial","royale"];
    return tierOrder.indexOf(vipTierId) >= tierOrder.indexOf(skin.req);
  }
  if (skin.type === "secret") {
    if (skin.req === "_all_achievements") {
      const allAchs = Object.keys(ACH_POINTS);
      return allAchs.every(a => (stats.achievements || []).includes(a));
    }
    return (stats.achievements || []).includes(skin.req) || (stats.secretUnlocks || []).includes(skin.req);
  }
  return false;
};
const getUnlockedSkins = (stats, chips, vipTierId) =>
  CHIP_SKINS.filter(s => isSkinUnlocked(s, stats, chips, vipTierId)).map(s => s.id);
const getChipSkin = (skinId) => CHIP_SKINS.find(s => s.id === skinId) || CHIP_SKINS[0];
const SKIN_THEMES = {
  house: { tier:0, accent:"#d4af37", accentDim:"#b8941e", navTint:"transparent",
    modalBg:"linear-gradient(180deg, #1e1e34, #15152a)", modalBorder:"rgba(212,175,55,0.2)",
    bgGradient:"d", tableFelt:"d", cardTint:"d", particles:null },
  luckystreak: { tier:1, accent:"#22d394", accentDim:"#10a06a", navTint:"rgba(16,185,129,0.06)",
    modalBg:"linear-gradient(180deg, #162a22, #10201a)", modalBorder:"rgba(34,211,148,0.2)",
    bgGradient:"d", tableFelt:"d", cardTint:"d", particles:null },
  shark: { tier:1, accent:"#6b8090", accentDim:"#4a5568", navTint:"rgba(74,85,104,0.06)",
    modalBg:"linear-gradient(180deg, #1a2028, #14181e)", modalBorder:"rgba(74,85,104,0.2)",
    bgGradient:"d", tableFelt:"d", cardTint:"d", particles:null },
  whale: { tier:1, accent:"#4a90c0", accentDim:"#2a5080", navTint:"rgba(42,80,128,0.06)",
    modalBg:"linear-gradient(180deg, #14202e, #0e1822)", modalBorder:"rgba(42,80,128,0.2)",
    bgGradient:"d", tableFelt:"d", cardTint:"d", particles:null },
  degenerate: { tier:1, accent:"#a0724a", accentDim:"#8b4513", navTint:"rgba(139,69,19,0.06)",
    modalBg:"linear-gradient(180deg, #221a12, #1a140e)", modalBorder:"rgba(139,69,19,0.2)",
    bgGradient:"d", tableFelt:"d", cardTint:"d", particles:null },
  vip_bronze: { tier:1, accent:"#cd7f32", accentDim:"#8a5520", navTint:"rgba(205,127,50,0.06)",
    modalBg:"linear-gradient(180deg, #22180e, #1a1208)", modalBorder:"rgba(205,127,50,0.2)",
    bgGradient:"d", tableFelt:"d", cardTint:"d", particles:null },
  vip_silver: { tier:2, accent:"#c0c0c0", accentDim:"#8a8a8a", navTint:"rgba(192,192,192,0.07)",
    modalBg:"linear-gradient(180deg, #1e1e24, #16161c)", modalBorder:"rgba(192,192,192,0.2)",
    bgGradient:"d", tableFelt:"d", cardTint:"d", particles:null },
  vip_gold: { tier:2, accent:"#ff1493", accentDim:"#b80d6a", navTint:"rgba(255,20,147,0.06)",
    modalBg:"linear-gradient(180deg, #28102a, #1e0a1e)", modalBorder:"rgba(255,20,147,0.2)",
    bgGradient:"d", tableFelt:"d", cardTint:"d", particles:null },
  vip_platinum: { tier:2, accent:"#a8d8ea", accentDim:"#6aa0b8", navTint:"rgba(168,216,234,0.06)",
    modalBg:"linear-gradient(180deg, #141e28, #0e1620)", modalBorder:"rgba(168,216,234,0.2)",
    bgGradient:"d", tableFelt:"d", cardTint:"d", particles:null },
  vip_emerald: { tier:2, accent:"#10b981", accentDim:"#087a55", navTint:"rgba(16,185,129,0.06)",
    modalBg:"linear-gradient(180deg, #0e221a, #081a14)", modalBorder:"rgba(16,185,129,0.2)",
    bgGradient:"d", tableFelt:"d", cardTint:"d", particles:null },
  vip_diamond: { tier:3, accent:"#c2185b", accentDim:"#8a1040", navTint:"rgba(194,24,91,0.08)",
    modalBg:"linear-gradient(180deg, #1a0a18, #100810)", modalBorder:"rgba(194,24,91,0.25)",
    bgGradient:"radial-gradient(ellipse at center, #18081a 0%, #0e050f 60%, #080308 100%)",
    tableFelt:"#1a0a1e", cardTint:"rgba(194,24,91,0.05)",
    particles:{ type:"smoke", color:"#c2185b", count:22, speed:0.3, tier:3 } },
  vip_celestial: { tier:3, accent:"#f59e0b", accentDim:"#b87308", navTint:"rgba(245,158,11,0.08)",
    modalBg:"linear-gradient(180deg, #12102e, #0a081e)", modalBorder:"rgba(245,158,11,0.25)",
    bgGradient:"radial-gradient(ellipse at center, #0e0c28 0%, #080620 60%, #04030e 100%)",
    tableFelt:"#0e0a28", cardTint:"rgba(245,158,11,0.05)",
    particles:{ type:"stars", color:"#f59e0b", count:25, speed:0.2, tier:3 } },
  legend: { tier:3, accent:"#c8a020", accentDim:"#8a6d0b", navTint:"rgba(184,134,11,0.08)",
    modalBg:"linear-gradient(180deg, #221a0e, #1a1208)", modalBorder:"rgba(184,134,11,0.25)",
    bgGradient:"radial-gradient(ellipse at center, #1a140a 0%, #120e06 60%, #0a0804 100%)",
    tableFelt:"#1a100a", cardTint:"rgba(184,134,11,0.05)",
    particles:{ type:"motes", color:"#d4af37", count:22, speed:0.25, tier:3 } },
  unstoppable: { tier:4, accent:"#3b82f6", accentDim:"#2060c0", navTint:"rgba(59,130,246,0.10)",
    modalBg:"linear-gradient(180deg, #0e1830, #081020)", modalBorder:"rgba(59,130,246,0.3)",
    bgGradient:"radial-gradient(ellipse at center, #0c1428 0%, #060e1e 60%, #020810 100%)",
    tableFelt:"#0a1228", cardTint:"rgba(59,130,246,0.06)",
    particles:{ type:"sparks", color:"#3b82f6", count:32, speed:0.6, tier:4 } },
  onepercent: { tier:4, accent:"#c8b8e8", accentDim:"#9080b8", navTint:"rgba(200,184,232,0.08)",
    modalBg:"linear-gradient(180deg, #1a162e, #121020)", modalBorder:"rgba(200,184,232,0.3)",
    bgGradient:"radial-gradient(ellipse at center, #16122a 0%, #0e0a20 60%, #06040e 100%)",
    tableFelt:"#14102a", cardTint:"rgba(200,184,232,0.05)",
    particles:{ type:"sparkle", color:"#e0d0ff", count:35, speed:0.15, tier:4 } },
  billiondollar: { tier:4, accent:"#ff6a00", accentDim:"#b84a00", navTint:"rgba(255,106,0,0.10)",
    modalBg:"linear-gradient(180deg, #261008, #1a0a04)", modalBorder:"rgba(255,106,0,0.3)",
    bgGradient:"radial-gradient(ellipse at center, #1e0e06 0%, #140804 60%, #0a0402 100%)",
    tableFelt:"#1c0a08", cardTint:"rgba(255,69,0,0.06)",
    particles:{ type:"embers", color:"#ff6a00", count:30, speed:0.4, tier:4 } },
  degenlord: { tier:4, accent:"#39ff14", accentDim:"#20b00a", navTint:"rgba(57,255,20,0.08)",
    modalBg:"linear-gradient(180deg, #0a1e0a, #061406)", modalBorder:"rgba(57,255,20,0.3)",
    bgGradient:"radial-gradient(ellipse at center, #081a0c 0%, #041008 60%, #020804 100%)",
    tableFelt:"#0a160e", cardTint:"rgba(57,255,20,0.05)",
    particles:{ type:"bubbles", color:"#39ff14", count:30, speed:0.35, tier:4 } },
  vip_royale: { tier:4, accent:"#ff4500", accentDim:"#b83000", navTint:"rgba(255,69,0,0.10)",
    modalBg:"linear-gradient(180deg, #261008, #1a0804)", modalBorder:"rgba(255,69,0,0.3)",
    bgGradient:"radial-gradient(ellipse at center, #1c0c06 0%, #120804 60%, #0a0402 100%)",
    tableFelt:"#1a0808", cardTint:"rgba(255,69,0,0.06)",
    particles:{ type:"sparks", color:"#ff6a00", count:32, speed:0.5, tier:4 } },
  jackpot: { tier:5, accent:"#ffd700", accentDim:"#b89a00", navTint:"rgba(255,215,0,0.15)",
    modalBg:"linear-gradient(180deg, #1e1608 0%, #120e04 50%, #0a0802 100%)", modalBorder:"rgba(255,215,0,0.4)",
    bgGradient:"radial-gradient(ellipse at 50% 30%, #2a1e08 0%, #18120a 35%, #0e0a04 65%, #060402 100%)",
    tableFelt:"#1e1608", cardTint:"rgba(255,215,0,0.06)",
    particles:{ type:"goldenergy", color:"#ffd700", count:40, speed:0.3, tier:5 } },
  completionist: { tier:5, accent:"#ff6ec7", accentDim:"#c850a0", navTint:"rgba(255,110,199,0.1)",
    modalBg:"linear-gradient(180deg, #1e1028, #140a20)", modalBorder:"rgba(255,110,199,0.3)",
    bgGradient:"linear-gradient(135deg, #0a0618 0%, #140820 25%, #0e0618 50%, #10061a 75%, #0a0418 100%)",
    tableFelt:"#120e1e", cardTint:"rgba(255,200,255,0.04)",
    particles:{ type:"rainbow", color:"#ffffff", count:50, speed:0.26, tier:5 } },
};
const getActiveTheme = (skinId) => {
  const st = SKIN_THEMES[skinId] || SKIN_THEMES.house;
  return {
    ...st,
    bgGradient: st.bgGradient === "d" ? DARK_BG : st.bgGradient,
    tableFelt: st.tableFelt === "d" ? null : st.tableFelt,
    cardTint: st.cardTint === "d" ? null : st.cardTint,
  };
};
function AmbientParticles({ config }) {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const frameRef = useRef(null);
  useEffect(() => {
    if (!config) return;
    const tier = config.tier || 3;
    const sizeMin = tier >= 5 ? 3 : tier >= 4 ? 2.5 : 2;
    const sizeRange = tier >= 5 ? 6 : tier >= 4 ? 5 : 4;
    const opMin = tier >= 5 ? 0.3 : tier >= 4 ? 0.22 : 0.15;
    const opRange = tier >= 5 ? 0.5 : tier >= 4 ? 0.4 : 0.3;
    particlesRef.current = Array.from({ length: config.count }, (_, i) => ({
      x: Math.random(), y: Math.random(),
      size: sizeMin + Math.random() * sizeRange,
      baseOp: opMin + Math.random() * opRange,
      speed: (0.3 + Math.random() * 0.7) * config.speed,
      drift: (Math.random() - 0.5) * 0.003,
      phase: Math.random() * Math.PI * 2,
      flickerFreq: 0.002 + Math.random() * (tier >= 5 ? 0.006 : tier >= 4 ? 0.004 : 0.002),
      flickerAmp: tier >= 5 ? 0.5 + Math.random() * 0.4 : tier >= 4 ? 0.35 + Math.random() * 0.3 : 0.2 + Math.random() * 0.2,
    }));
    const hexToRgb = (hex) => {
      const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
      return [r, g, b];
    };
    const rgb = hexToRgb(config.color);
    const isRainbow = config.type === "rainbow";
    const isSmoke = config.type === "smoke";
    const isSpark = config.type === "sparks";
    const isCoin = config.type === "coins";
    const isGoldEnergy = config.type === "goldenergy";
    const isBubble = config.type === "bubbles";
    const hasglow = tier >= 4;
    let lastTime = performance.now();
    const animate = (time) => {
      const canvas = canvasRef.current;
      if (!canvas) { frameRef.current = requestAnimationFrame(animate); return; }
      const ctx = canvas.getContext("2d");
      const w = canvas.width, h = canvas.height;
      const dt = (time - lastTime) / 1000;
      lastTime = time;
      ctx.clearRect(0, 0, w, h);
      for (const p of particlesRef.current) {
        p.y -= p.speed * dt * 0.015;
        p.x += p.drift + Math.sin(p.phase + time * 0.001) * 0.0015;
        if (p.y < -0.05) { p.y = 1.05; p.x = Math.random(); }
        if (p.x < -0.05) p.x = 1.05;
        if (p.x > 1.05) p.x = -0.05;
        const px = p.x * w, py = p.y * h;
        const flicker = 1 + Math.sin(p.phase + time * p.flickerFreq) * p.flickerAmp;
        const op = Math.min(1, p.baseOp * flicker);
        if (isRainbow) {
          const hue = (p.phase * 57.3 + time * 0.06) % 360;
          const lightness = 55 + flicker * 15;
          const col = `hsla(${hue},100%,${lightness}%,${op * 0.75})`;
          if (hasglow) {
            ctx.shadowColor = `hsl(${hue},100%,${lightness}%)`;
            ctx.shadowBlur = p.size * (tier >= 5 ? 4 : 2);
          }
          ctx.beginPath();
          ctx.arc(px, py, p.size * 0.5, 0, Math.PI * 2);
          ctx.fillStyle = col;
          ctx.fill();
          ctx.shadowBlur = 0;
        } else if (isSmoke) {
          const r = p.size * (tier >= 5 ? 2 : tier >= 4 ? 1.6 : 1.2);
          ctx.beginPath();
          ctx.arc(px, py, r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${op * 0.25})`;
          ctx.fill();
        } else if (isSpark) {
          ctx.save();
          ctx.translate(px, py);
          ctx.rotate(p.drift * 120 * Math.PI / 180);
          if (hasglow) { ctx.shadowColor = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.8)`; ctx.shadowBlur = p.size * (tier >= 5 ? 4 : 2); }
          ctx.fillStyle = `rgba(255,255,255,${op})`;
          ctx.fillRect(-p.size * 0.15, -p.size * 0.6, p.size * 0.3, p.size * 1.2);
          ctx.shadowBlur = 0;
          ctx.restore();
        } else if (isCoin) {
          ctx.save();
          ctx.translate(px, py);
          const coinRot = p.drift * 180 * Math.PI / 180 + time * 0.001 * p.speed;
          ctx.rotate(coinRot);
          const trailGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size * 1.5);
          trailGrad.addColorStop(0, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${op * 0.3})`);
          trailGrad.addColorStop(0.5, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${op * 0.08})`);
          trailGrad.addColorStop(1, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0)`);
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 1.5, 0, Math.PI * 2);
          ctx.fillStyle = trailGrad;
          ctx.fill();
          if (hasglow) { ctx.shadowColor = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.8)`; ctx.shadowBlur = p.size * (tier >= 5 ? 4 : 2); }
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size * 0.5, p.size * 0.3, 0, 0, Math.PI * 2);
          const coinGrad = ctx.createLinearGradient(-p.size * 0.4, -p.size * 0.2, p.size * 0.4, p.size * 0.2);
          coinGrad.addColorStop(0, `rgba(255,248,200,${op * 0.9})`);
          coinGrad.addColorStop(0.5, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${op * 0.85})`);
          coinGrad.addColorStop(1, `rgba(${Math.floor(rgb[0]*0.7)},${Math.floor(rgb[1]*0.6)},${Math.floor(rgb[2]*0.3)},${op * 0.9})`);
          ctx.fillStyle = coinGrad;
          ctx.fill();
          ctx.beginPath();
          ctx.ellipse(-p.size * 0.1, -p.size * 0.06, p.size * 0.2, p.size * 0.12, 0, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${op * 0.35})`;
          ctx.fill();
          if (p.size > 5) {
            ctx.shadowBlur = 0;
            ctx.font = `bold ${Math.round(p.size * 0.35)}px Georgia`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = `rgba(180,140,0,${op * 0.7})`;
            ctx.fillText("$", 0, 1);
          }
          ctx.shadowBlur = 0;
          ctx.restore();
        } else if (isGoldEnergy) {
          ctx.save();
          ctx.translate(px, py);
          const pulse = 0.7 + Math.sin(p.phase + time * 0.003) * 0.3;
          const orbSize = p.size * 0.6 * pulse;
          const trailLen = p.size * 3;
          const trailGrad = ctx.createLinearGradient(0, 0, 0, trailLen);
          trailGrad.addColorStop(0, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${op * 0.25})`);
          trailGrad.addColorStop(0.4, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${op * 0.08})`);
          trailGrad.addColorStop(1, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0)`);
          ctx.fillStyle = trailGrad;
          ctx.fillRect(-orbSize * 0.4, 0, orbSize * 0.8, trailLen);
          const haloGrad = ctx.createRadialGradient(0, 0, orbSize * 0.3, 0, 0, orbSize * 2.5);
          haloGrad.addColorStop(0, `rgba(255,248,200,${op * 0.15 * pulse})`);
          haloGrad.addColorStop(0.3, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${op * 0.1 * pulse})`);
          haloGrad.addColorStop(1, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0)`);
          ctx.beginPath();
          ctx.arc(0, 0, orbSize * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = haloGrad;
          ctx.fill();
          ctx.shadowColor = `rgba(255,230,100,0.9)`;
          ctx.shadowBlur = orbSize * 4;
          const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, orbSize);
          coreGrad.addColorStop(0, `rgba(255,255,230,${op * 0.95})`);
          coreGrad.addColorStop(0.35, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${op * 0.8})`);
          coreGrad.addColorStop(0.7, `rgba(${rgb[0]},${rgb[1]},${Math.floor(rgb[2] * 0.5)},${op * 0.5})`);
          coreGrad.addColorStop(1, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0)`);
          ctx.beginPath();
          ctx.arc(0, 0, orbSize, 0, Math.PI * 2);
          ctx.fillStyle = coreGrad;
          ctx.fill();
          if (Math.sin(p.phase + time * 0.005) > 0.7) {
            const sparkAngle = (p.phase * 3 + time * 0.002) % (Math.PI * 2);
            const sparkDist = orbSize * (1.2 + Math.random());
            const sx = Math.cos(sparkAngle) * sparkDist;
            const sy = Math.sin(sparkAngle) * sparkDist;
            ctx.beginPath();
            ctx.arc(sx, sy, orbSize * 0.15, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,255,200,${op * 0.6})`;
            ctx.fill();
          }
          ctx.shadowBlur = 0;
          ctx.restore();
        } else if (isBubble) {
          if (hasglow) { ctx.shadowColor = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.5)`; ctx.shadowBlur = p.size * (tier >= 5 ? 3 : 1.5); }
          ctx.beginPath();
          ctx.arc(px, py, p.size * 0.55, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${op * 0.7})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
          if (tier >= 4) {
            ctx.beginPath();
            ctx.arc(px, py, p.size * 0.2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${op * 0.3})`;
            ctx.fill();
          }
          ctx.shadowBlur = 0;
        } else {
          if (hasglow) { ctx.shadowColor = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.6)`; ctx.shadowBlur = p.size * (tier >= 5 ? 4 : 2); }
          ctx.beginPath();
          const r = p.size * (config.type === "stars" ? 0.3 : 0.4);
          ctx.arc(px, py, r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${op * 0.8})`;
          ctx.fill();
          if (config.type === "stars") {
            ctx.strokeStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${op * 0.5})`;
            ctx.lineWidth = 0.4;
            ctx.beginPath(); ctx.moveTo(px - p.size * 0.6, py); ctx.lineTo(px + p.size * 0.6, py); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(px, py - p.size * 0.6); ctx.lineTo(px, py + p.size * 0.6); ctx.stroke();
            if (tier >= 4) {
              ctx.lineWidth = 0.25;
              ctx.beginPath(); ctx.moveTo(px - p.size * 0.4, py - p.size * 0.4); ctx.lineTo(px + p.size * 0.4, py + p.size * 0.4); ctx.stroke();
              ctx.beginPath(); ctx.moveTo(px + p.size * 0.4, py - p.size * 0.4); ctx.lineTo(px - p.size * 0.4, py + p.size * 0.4); ctx.stroke();
            }
          }
          ctx.shadowBlur = 0;
        }
      }
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [config?.type, config?.count, config?.speed, config?.tier]);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);
  if (!config) return null;
  return <canvas ref={canvasRef} style={{ position:"fixed", inset:0, width:"100%", height:"100%", pointerEvents:"none", zIndex:0 }} />;
}
const VIP_TIERS = [
  { id:"bronze",    label:"Bronze",    minPoints:0,       color:"#cd7f32", icon:"III", border:"rgba(205,127,50,0.4)",  rebuy:1000 },
  { id:"silver",    label:"Silver",    minPoints:2000,    color:"#c0c0c0", icon:"II", border:"rgba(192,192,192,0.4)", rebuy:5000 },
  { id:"gold",      label:"Gold",      minPoints:5000,    color:"#d4af37", icon:"I", border:"rgba(212,175,55,0.5)",  rebuy:25000 },
  { id:"platinum",  label:"Platinum",  minPoints:10000,   color:"#b0c4de", icon:"◆", border:"rgba(176,196,222,0.5)", rebuy:100000 },
  { id:"emerald",   label:"Emerald",   minPoints:20000,   color:"#10b981", icon:"●", border:"rgba(16,185,129,0.5)",  rebuy:500000 },
  { id:"diamond",   label:"Diamond",   minPoints:40000,   color:"#e0e7ff", icon:"♛", border:"rgba(224,231,255,0.6)", rebuy:2000000 },
  { id:"celestial", label:"Celestial", minPoints:75000,   color:"#f59e0b", icon:"★", border:"rgba(245,158,11,0.6)",  rebuy:10000000 },
  { id:"royale",    label:"Royale",    minPoints:75000,   color:"#ff4500", icon:"♠", border:"rgba(255,69,0,0.6)",    rebuy:100000000, requiresAllAchievements:true },
];
const ACH_POINTS = {
  first_win:150, streak_5:150, played_all:150, bankroll_10k:150, rounds_1k:150,
  wins_100:450, high_roller:450, wagered_100k:450, streak_10:450, bankroll_25k:450, vip_silver:450, rounds_5k:450, wins_1k:450, comeback:450,
  all_in_25:750, big_win_10k_j:750, wagered_1m:750, vip_gold:750, bankroll_100k:750, high_roller_50k:750, rounds_10k:750,
  high_roller_250k:1500, big_win_100k:1500, big_win_1m:1500, vip_platinum:1500, wagered_100m:1500, rebuy_100:1500, bankroll_1m:1500, loss_10:1500,
  high_roller_1m:2250, high_roller_100m:2250, big_win_100m:2250, vip_emerald:2250, vip_diamond:2250, vip_celestial:2250, bankroll_10m:2250,
  streak_20:3000, bankroll_1b:3000, big_win_1b:3000, wagered_5b:3000, wins_5k:3000,
};
const calcVipPoints = (stats) => {
  let pts = 0;
  (stats.achievements || []).forEach(id => { pts += ACH_POINTS[id] || 0; });
  pts += Math.floor((stats.totalWagered || 0) / 500);
  pts += (stats.totalRounds || 0) * 2;
  pts += (stats.totalWins || 0);
  pts += (stats.vipBonusPoints || 0);
  return pts;
};
const getVipTier = (points, achievementCount = 0) => {
  for (let i = VIP_TIERS.length - 1; i >= 0; i--) {
    const t = VIP_TIERS[i];
    if (t.requiresAllAchievements && achievementCount < ACHIEVEMENTS.length - 3) continue;
    if (points >= t.minPoints) return t;
  }
  return VIP_TIERS[0];
};
const getNextVipTier = (points, achievementCount = 0) => {
  const current = getVipTier(points, achievementCount);
  const currentIdx = VIP_TIERS.indexOf(current);
  if (currentIdx < VIP_TIERS.length - 1) return VIP_TIERS[currentIdx + 1];
  return null;
};
const ACHIEVEMENTS = [
  { id:"first_win",      name:"First Blood",       desc:"Win your first bet", icon:"◎" },
  { id:"streak_5",       name:"Hot Hand",           desc:"Win 5 in a row (excl. Slots/Plinko)", icon:"▲" },
  { id:"streak_10",      name:"On Fire",            desc:"Win 10 in a row (excl. Slots/Plinko)", icon:"▲" },
  { id:"streak_20",      name:"Unstoppable",        desc:"Win 20 in a row (excl. Slots/Plinko)", icon:"⚡" },
  { id:"high_roller",    name:"High Roller",        desc:"Place a $10,000+ bet", icon:"♠" },
  { id:"high_roller_50k", name:"Big Spender",       desc:"Place a $50,000+ bet", icon:"✗" },
  { id:"high_roller_250k",name:"Quarter Million",   desc:"Place a $250,000+ bet", icon:"$" },
  { id:"high_roller_1m", name:"Seven Figures",      desc:"Place a $1,000,000+ bet", icon:"◆" },
  { id:"high_roller_100m",name:"Insane Wager",      desc:"Place a $100,000,000+ bet", icon:"!" },
  { id:"all_in_25",      name:"Nerves of Steel",    desc:"Win 25 all-in bets", icon:"▲" },
  { id:"bankroll_10k",   name:"Moving Up",          desc:"Reach $10,000 bankroll", icon:"↑" },
  { id:"bankroll_25k",   name:"Big Stack",          desc:"Reach $25,000 bankroll", icon:"$" },
  { id:"bankroll_100k",  name:"High Society",       desc:"Reach $100,000 bankroll", icon:"$" },
  { id:"bankroll_1m",    name:"Whale Status",       desc:"Reach $1,000,000 bankroll", icon:"$$" },
  { id:"bankroll_10m",   name:"Casino Royale",      desc:"Reach $10,000,000 bankroll", icon:"♛" },
  { id:"bankroll_1b",    name:"The One Percent",    desc:"Reach $1,000,000,000 bankroll", icon:"◆" },
  { id:"big_win_10k_j",  name:"Jackpot!",           desc:"Win $10,000+ in a single bet", icon:"♠" },
  { id:"big_win_100k",   name:"Mega Win",           desc:"Win $100,000+ in a single bet", icon:"◆" },
  { id:"big_win_1m",     name:"Millionaire Moment", desc:"Win $1,000,000+ in a single bet", icon:"$!" },
  { id:"big_win_100m",   name:"Hundred Million",    desc:"Win $100,000,000+ in a single bet", icon:"✦" },
  { id:"big_win_1b",     name:"Billion Dollar Bet",  desc:"Win $1,000,000,000+ in a single bet", icon:"★" },
  { id:"played_all",     name:"Well Rounded",       desc:"Play all 12 games", icon:"⚄" },
  { id:"wagered_100k",   name:"Seasoned Gambler",   desc:"Wager $100,000 total", icon:"♠" },
  { id:"wagered_1m",     name:"VIP Treatment",      desc:"Wager $1,000,000 total", icon:"✦" },
  { id:"wagered_100m",   name:"Hundred Million Club",desc:"Wager $100,000,000 total", icon:"♛" },
  { id:"wagered_5b",     name:"Degenerate",         desc:"Wager $5,000,000,000 total", icon:"◉" },
  { id:"comeback",       name:"Comeback Kid",       desc:"Win after 5+ loss streak", icon:"↺" },
  { id:"loss_10",        name:"Unlucky Expert",     desc:"Lose 10 in a row", icon:"×" },
  { id:"vip_silver",     name:"Silver Lining",      desc:"Reach Silver VIP tier", icon:"II" },
  { id:"vip_gold",       name:"Gold Member",        desc:"Reach Gold VIP tier", icon:"I" },
  { id:"vip_platinum",   name:"Platinum Status",    desc:"Reach Platinum VIP tier", icon:"◆" },
  { id:"vip_emerald",    name:"Emerald City",       desc:"Reach Emerald VIP tier", icon:"●" },
  { id:"vip_diamond",    name:"Diamond Hands",      desc:"Reach Diamond VIP tier", icon:"♛" },
  { id:"vip_celestial",  name:"Among The Stars",    desc:"Reach Celestial VIP tier", icon:"★" },
  { id:"rebuy_100",      name:"Loser",              desc:"Rebuy 100 times", icon:"↻" },
  { id:"wins_100",       name:"Centurion",          desc:"Win 100 bets", icon:"C" },
  { id:"wins_1k",        name:"Veteran",            desc:"Win 1,000 bets", icon:"✧" },
  { id:"wins_5k",        name:"Legend",             desc:"Win 5,000 bets", icon:"★" },
  { id:"rounds_1k",      name:"Iron Hands",         desc:"Play 1,000 rounds", icon:"▬" },
  { id:"rounds_5k",      name:"Grinder",            desc:"Play 5,000 rounds", icon:"⚙" },
  { id:"rounds_10k",     name:"Marathon",            desc:"Play 10,000 rounds", icon:"»" },
];
const SHOP_ITEMS = [
  { id:"dd_2x1",   cat:"double",  name:"Double Down",       tier:"2× · 1 win",  desc:"Next win pays 2×",             icon:"×2", costMulti:1.5, rarity:"common",   effect:{ type:"winMulti", multi:2, wins:1 } },
  { id:"vip_2x25", cat:"vip",     name:"VIP Express",       tier:"2× · 25 bets",desc:"2× VIP pts for 25 bets",       icon:"★",  costMulti:1.5, rarity:"common",   effect:{ type:"vipMulti", multi:2, bets:25 } },
  { id:"shield_30",cat:"shield",  name:"Profit Shield",     tier:"30%",          desc:"Keep 30% if next bet loses",   icon:"◇",  costMulti:0.5, rarity:"common",   effect:{ type:"shield", keep:0.3, uses:1 } },
  { id:"vip_3x50", cat:"vip",     name:"VIP Express",       tier:"3× · 50 bets",desc:"3× VIP pts for 50 bets",       icon:"★",  costMulti:2.0, rarity:"uncommon", effect:{ type:"vipMulti", multi:3, bets:50 } },
  { id:"dd_2x3",   cat:"double",  name:"Double Down",       tier:"2× · 3 wins", desc:"Next 3 wins pay 2×",           icon:"×2", costMulti:3.5, rarity:"rare",     effect:{ type:"winMulti", multi:2, wins:3 } },
  { id:"shield_50",cat:"shield",  name:"Profit Shield",     tier:"50%",          desc:"Keep 50% if next bet loses",   icon:"◇",  costMulti:1.0, rarity:"rare",     effect:{ type:"shield", keep:0.5, uses:1 } },
  { id:"vip_5x25", cat:"vip",     name:"VIP Express",       tier:"5× · 25 bets",desc:"5× VIP pts for 25 bets",       icon:"★",  costMulti:3.5, rarity:"rare",     effect:{ type:"vipMulti", multi:5, bets:25 } },
  { id:"dd_5x1",   cat:"double",  name:"Double Down",       tier:"5× · 1 win",  desc:"Next win pays 5×",             icon:"×5", costMulti:5.0, rarity:"epic",     effect:{ type:"winMulti", multi:5, wins:1 } },
  { id:"shield_80",cat:"shield",  name:"Profit Shield",     tier:"80%",          desc:"Keep 80% if next bet loses",   icon:"◆",  costMulti:2.0, rarity:"epic",     effect:{ type:"shield", keep:0.8, uses:1 } },
  { id:"dd_10x1",  cat:"double",  name:"Double Down",       tier:"10× · 1 win", desc:"Next win pays 10×",            icon:"×10",costMulti:8.0, rarity:"legendary",effect:{ type:"winMulti", multi:10, wins:1 } },
  { id:"ins_1",    cat:"insure",  name:"Insurance",         tier:"1 bet",        desc:"Next lost bet fully refunded", icon:"◈",  costMulti:3.0, rarity:"legendary",effect:{ type:"insurance", bets:1 } },
  { id:"ins_3",    cat:"_mythic", name:"Insurance",         tier:"3 bets",       desc:"Next 3 lost bets refunded",    icon:"◈",  costMulti:8.0, rarity:"mythic",   effect:{ type:"insurance", bets:3 } },
  { id:"mbox_s",   cat:"mystery", name:"Mystery Box",       tier:"Small",        desc:"Mostly common/uncommon drops", icon:"?",  costMulti:2.0, rarity:"mystery",  effect:{ type:"mystery", tier:1 } },
  { id:"mbox_l",   cat:"mystery", name:"Mystery Box",       tier:"Large",        desc:"Better odds at rare+ drops",   icon:"??", costMulti:5.0, rarity:"mystery",  effect:{ type:"mystery", tier:2 } },
  { id:"mbox_leg", cat:"mystery", name:"Mystery Box",       tier:"Legendary",    desc:"Best odds at epic+ drops",     icon:"???",costMulti:8.0, rarity:"mystery",  effect:{ type:"mystery", tier:3 } },
];
const MYSTERY_DROP_RATES = {
  1: { common:42, uncommon:27, rare:16, epic:10, legendary:5, mythic:0 },
  2: { common:0, uncommon:30, rare:37, epic:20, legendary:10, mythic:3 },
  3: { common:0, uncommon:0, rare:28, epic:35, legendary:27, mythic:10 },
};
const RARITY_COLORS = { common:"#9ca3af", uncommon:"#22c55e", rare:"#3b82f6", epic:"#a855f7", legendary:"#f59e0b", mythic:"#ff4500" };
const SHOP_CATEGORIES = [
  { id:"double",  name:"Double Down",  icon:"×2" },
  { id:"vip",     name:"VIP Express",  icon:"★" },
  { id:"insure",  name:"Insurance",    icon:"◈" },
  { id:"shield",  name:"Profit Shield",icon:"◇" },
  { id:"mystery", name:"Mystery Box",  icon:"?" },
];
const actionBtnStyle = (enabled) => ({
  padding: "10px 28px", fontSize: 13, fontWeight: 600,
  fontFamily: T.serif, letterSpacing: 2, textTransform: "uppercase",
  background: enabled ? `${_themeAccent}25` : "rgba(100,100,100,0.1)",
  color: enabled ? _themeAccent : "#555",
  border: enabled ? `1.5px solid ${_themeAccent}66` : "1.5px solid rgba(100,100,100,0.2)",
  borderRadius: 6, cursor: enabled ? "pointer" : "not-allowed",
  transition: "all 0.15s",
});
function ActionButton({ label, onClick, enabled = true }) {
  return (
    <button onClick={onClick} disabled={!enabled} className={_isRainbow ? "anim-rainbow" : _isJackpotSkin ? "anim-gold-shimmer" : ""} style={actionBtnStyle(enabled)}>
      {label}
    </button>
  );
}
function useScreenShake() {
  const [shaking, setShaking] = useState(false);
  const [intensity, setIntensity] = useState("normal");
  const shake = useCallback((duration = 400, level = "normal") => {
    setIntensity(level);
    setShaking(true);
    setTimeout(() => setShaking(false), duration);
  }, []);
  return { shaking, shake, shakeIntensity: intensity };
}
function FloatingWins({ wins }) {
  return (
    <div style={{ position:"fixed", top:0, left:0, right:0, bottom:0, pointerEvents:"none", overflow:"hidden", zIndex:10005 }}>
      {wins.map(w => (
        <div key={w.id} style={{
          position:"absolute", left:`${w.x}%`, top:`${w.y}%`,
          fontSize: w.mega ? 32 : w.big ? 26 : 18,
          fontWeight:900, fontFamily:T.mono,
          color: w.mega ? "#ff6b6b" : w.big ? "#f1c40f" : "#22c55e",
          textShadow: w.mega ? "0 0 30px #ff6b6b, 0 0 60px rgba(255,107,107,0.5)"
            : w.big ? "0 0 20px #f1c40f, 0 0 40px rgba(241,196,15,0.4)"
            : "0 0 12px rgba(34,197,94,0.6)",
          animation: "floatUp 1.8s ease-out forwards",
          whiteSpace:"nowrap",
        }}>+${w.amount.toLocaleString()}</div>
      ))}
    </div>
  );
}
function useFloatingWins() {
  const [wins, setWins] = useState([]);
  const idRef = useRef(0);
  const addWin = useCallback((amount, opts = {}) => {
    const id = ++idRef.current;
    const count = amount >= (opts.megaThreshold ?? 500) ? 3 : amount >= (opts.bigThreshold ?? 100) ? 2 : 1;
    for (let i = 0; i < count; i++) {
      const wid = id * 100 + i;
      setTimeout(() => {
        setWins(prev => [...prev, {
          id: wid, amount,
          x: (opts.x ?? (35 + Math.random() * 30)) + (i * 8 - (count-1)*4),
          y: (opts.y ?? (30 + Math.random() * 20)) + (i * 5),
          big: amount >= (opts.bigThreshold ?? 100),
          mega: amount >= (opts.megaThreshold ?? 500),
        }]);
        setTimeout(() => setWins(prev => prev.filter(w => w.id !== wid)), 2000);
      }, i * 200);
    }
  }, []);
  return { wins, addWin };
}
function CoinRain({ intensity = "light" }) {
  const isMobileP = typeof window !== "undefined" && window.innerWidth < 480;
  const baseCount = intensity === "extra_heavy" ? 60 : intensity === "heavy" ? 30 : intensity === "medium" ? 16 : 8;
  const count = isMobileP ? Math.ceil(baseCount * 0.5) : baseCount;
  const maxDuration = intensity === "extra_heavy" ? 2.5 : 1.5;
  const coins = useMemo(() => Array.from({length:count}, (_, i) => ({
    size: intensity === "extra_heavy" ? (10 + Math.random() * 14) : (8 + Math.random() * 10),
    left: Math.random() * 100,
    delay: Math.random() * (intensity === "extra_heavy" ? 1.5 : 0.8),
    duration: 1.2 + Math.random() * maxDuration,
  })), [count, intensity, maxDuration]);
  return (
    <div style={{ position:"fixed", top:0, left:0, right:0, bottom:0, pointerEvents:"none", zIndex:10003, overflow:"hidden" }}>
      {coins.map((coin, i) => (
          <div key={i} className="anim-coin-rain" style={{
            position:"absolute", left:`${coin.left}%`, top:-20,
            width:coin.size, height:coin.size, borderRadius:"50%",
            background:`radial-gradient(circle at 35% 35%, #ffd700, #b8860b)`,
            border:"1px solid rgba(255,215,0,0.5)",
            boxShadow: intensity === "extra_heavy"
              ? "0 0 10px rgba(255,215,0,0.6), 0 0 20px rgba(255,215,0,0.2)"
              : "0 0 6px rgba(255,215,0,0.4), inset 0 -2px 4px rgba(0,0,0,0.2)",
            animationDuration:`${coin.duration}s`,
            animationDelay:`${coin.delay}s`,
            opacity:0.9,
          }} />
      ))}
    </div>
  );
}
function useCoinRain() {
  const [active, setActive] = useState(null);
  const triggerCoins = useCallback((intensity = "light") => {
    setActive(intensity);
  }, []);
  const clearCoins = useCallback(() => setActive(null), []);
  return { coinRainActive: active, triggerCoins, clearCoins };
}
function ScreenColorWash({ type, onDismiss }) {
  if (!type) return null;
  const persistent = ["big","mega","epic","jackpot"].includes(type);
  const config = {
    gold:    { bg:"rgba(212,175,55,0.13)", anim:"colorWash 0.5s ease-out forwards" },
    big:     { bg:"rgba(241,196,15,0.14)", anim:"colorWashHold 0.4s ease-out forwards" },
    mega:    { bg:"rgba(255,80,80,0.14)", anim:"colorWashPulse 1.6s ease-out forwards" },
    epic:    { bg:"rgba(255,69,0,0.16)", anim:"colorShift 2s ease-out forwards" },
    jackpot: { bg:"rgba(255,215,0,0.15)", anim:"jackpotWash 2.5s ease-out forwards, jackpotWashLoop 3s ease-in-out 2.5s infinite" },
    loss:    { bg:"rgba(231,76,60,0.1)", anim:"colorWash 0.4s ease-out forwards" },
  };
  const c = config[type] || config.gold;
  return (
    <div style={{
      position:"fixed", top:0, left:0, right:0, bottom:0, zIndex:10004,
      pointerEvents: "none",
      background: c.bg,
      animation: c.anim,
    }} />
  );
}
function useScreenColorWash() {
  const [wash, setWash] = useState(null);
  const timerRef = useRef(null);
  const triggerWash = useCallback((type = "gold") => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    setWash(type);
    if (!["big","mega","epic","jackpot"].includes(type)) {
      const autoDur = { gold:500, loss:400 };
      timerRef.current = setTimeout(() => { setWash(null); timerRef.current = null; }, autoDur[type] || 500);
    }
  }, []);
  const clearWash = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    setWash(null);
  }, []);
  return { washType: wash, triggerWash, clearWash };
}
function ConfettiCanvas({ type = "confetti" }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const particles = [];
    const colors = type === "fireworks"
      ? ["#ff6b6b","#f1c40f","#22c55e","#3b82f6","#ec4899","#a855f7","#ff4500","#ffd700","#fff"]
      : ["#f1c40f","#d4af37","#ffd700","#22c55e","#3b82f6","#ec4899","#e74c3c","#fff"];
    const spawnBurst = () => {
      const isMobileConf = window.innerWidth < 480;
      const count = isMobileConf ? (type === "fireworks" ? 25 : 18) : (type === "fireworks" ? 60 : 40);
      const cx = canvas.width * (0.2 + Math.random() * 0.6);
      const cy = canvas.height * (0.15 + Math.random() * 0.35);
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = type === "fireworks" ? (4 + Math.random() * 12) : (2 + Math.random() * 6);
        particles.push({
          x: cx + (Math.random() - 0.5) * 60,
          y: cy + (Math.random() - 0.5) * 40,
          vx: Math.cos(angle) * speed * (type === "fireworks" ? 1.5 : 1),
          vy: Math.sin(angle) * speed - (type === "fireworks" ? 4 : 2),
          size: type === "fireworks" ? (2 + Math.random() * 4) : (3 + Math.random() * 5),
          color: colors[Math.floor(Math.random() * colors.length)],
          gravity: 0.06 + Math.random() * 0.06,
          friction: 0.985,
          rotation: Math.random() * 360,
          rotSpeed: (Math.random() - 0.5) * 12,
          shape: Math.random() > 0.4 ? "rect" : "circle",
          trail: type === "fireworks" ? [] : null,
        });
      }
    };
    spawnBurst();
    const burstInterval = setInterval(spawnBurst, type === "fireworks" ? 800 : 1200);
    let running = true;
    const animate = () => {
      if (!running) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = particles.length - 1; i >= 0; i--) {
        if (particles[i].y > canvas.height + 40 || particles[i].x < -40 || particles[i].x > canvas.width + 40) {
          particles.splice(i, 1);
        }
      }
      for (const p of particles) {
        p.vy += p.gravity;
        p.vx *= p.friction;
        p.vy *= p.friction;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotSpeed;
        const screenRatio = Math.min(1, Math.max(0.3, 1 - (p.y / canvas.height) * 0.4));
        if (p.trail) {
          p.trail.push({ x: p.x, y: p.y, alpha: screenRatio });
          if (p.trail.length > 5) p.trail.shift();
          for (const t of p.trail) {
            ctx.globalAlpha = t.alpha * 0.3;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(t.x, t.y, p.size * 0.4, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.globalAlpha = screenRatio;
        ctx.fillStyle = p.color;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation * Math.PI / 180);
        if (p.shape === "rect") {
          ctx.fillRect(-p.size/2, -p.size/4, p.size, p.size/2);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        if (type === "fireworks" && screenRatio > 0.6) {
          ctx.globalAlpha = screenRatio * 0.3;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 15;
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
        ctx.restore();
      }
      ctx.globalAlpha = 1;
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => { running = false; clearInterval(burstInterval); cancelAnimationFrame(animRef.current); };
  }, [type]);
  return (
    <canvas ref={canvasRef} style={{
      position:"fixed", top:0, left:0, width:"100%", height:"100%",
      pointerEvents:"none", zIndex:10004,
    }} />
  );
}
function useConfetti() {
  const [confetti, setConfetti] = useState(null);
  const triggerConfetti = useCallback((type = "confetti") => {
    setConfetti({ type, key: Date.now() });
  }, []);
  const clearConfetti = useCallback(() => setConfetti(null), []);
  return { confetti, triggerConfetti, clearConfetti };
}
function ChipEruption({ count = 12 }) {
  return (
    <div style={{ position:"fixed", top:0, left:0, right:0, bottom:0, pointerEvents:"none", zIndex:10003, overflow:"hidden" }}>
      {Array.from({length:count}, (_, i) => {
        const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
        const dist = 120 + Math.random() * 200;
        const tx = Math.cos(angle) * dist;
        const ty = Math.sin(angle) * dist - 80;
        const size = 10 + Math.random() * 8;
        const chipColors = ["#c0392b","#2980b9","#27ae60","#8e44ad","#d4af37","#e67e22"];
        return (
          <div key={i} style={{
            position:"absolute", left:"50%", top:"40%",
            width:size, height:size, borderRadius:"50%",
            background:`radial-gradient(circle at 35% 35%, ${chipColors[i % chipColors.length]}, ${chipColors[(i+1) % chipColors.length]})`,
            border:`1.5px solid rgba(255,255,255,0.3)`,
            boxShadow:`0 2px 8px rgba(0,0,0,0.3)`,
            animation:`chipErupt 0.8s ease-out ${i * 0.03}s forwards`,
            transform:`translate(${tx}px, ${ty}px)`,
            opacity:0,
          }}
          ref={el => {
            if (el) {
              el.animate([
                { transform:"translate(0,0) scale(1)", opacity:1 },
                { transform:`translate(${tx}px, ${ty}px) scale(0.3)`, opacity:0 },
              ], { duration:800 + Math.random() * 400, delay:i * 30, easing:"cubic-bezier(0,.7,.3,1)", fill:"forwards" });
            }
          }}
          />
        );
      })}
    </div>
  );
}
function useChipEruption() {
  const [active, setActive] = useState(false);
  const triggerEruption = useCallback(() => {
    setActive(true);
  }, []);
  const clearEruption = useCallback(() => setActive(false), []);
  return { eruptionActive: active, triggerEruption, clearEruption };
}
function BigWinOverlay({ type, amount, onDone }) {
  const [phase, setPhase] = useState(0);
  const [dismissing, setDismissing] = useState(false);
  const [canDismiss, setCanDismiss] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [countDisplay, setCountDisplay] = useState(0);
  const particles = useRef(null);
  if (!particles.current) {
    const rand = () => Math.random();
    const isMobileBW = typeof window !== "undefined" && window.innerWidth < 480;
    const scale = isMobileBW ? 0.5 : 1;
    particles.current = {
      bokeh: Array.from({length:Math.round(18*scale)}, () => ({x:10+rand()*80,y:10+rand()*80,s:8+rand()*22,d:4+rand()*5,dl:rand()*2})),
      confetti: Array.from({length:Math.round(70*scale)}, () => ({x:rand()*100,w:4+rand()*8,h:4+rand()*8,round:rand()>0.5,c:Math.floor(rand()*8),d:1.2+rand()*2,dl:rand()*0.8})),
      fire: Array.from({length:Math.round(24*scale)}, () => ({x:8+rand()*84,w:3+rand()*8,h:8+rand()*18,even:rand()>0.5,d:1.5+rand()*2.5,dl:rand()*1.5})),
      orbit: Array.from({length:Math.round(18*scale)}, (_, i) => ({angle:(i/18)*Math.PI*2,s:3+(i%4)*1.5,even:i%2===0})),
      shatter: Array.from({length:Math.round(28*scale)}, (_, i) => {const a=(i/28)*Math.PI*2;return{a,dist:200+rand()*350,tx:Math.cos(a)*(200+rand()*350),ty:Math.sin(a)*(200+rand()*350),w:25+rand()*55,h:18+rand()*38,rot:rand()*720-360,c:i%3,dl:i*0.015};}),
      chips: Array.from({length:Math.round(14*scale)}, () => ({x:35+rand()*30,drift:-30+rand()*60,drift2:-60+rand()*120,rise:-180-rand()*220,rot:rand()*540,s:8+rand()*14,d:1+rand()*1.5,dl:rand()*0.8})),
    };
  }
  const p = particles.current;
  const isEpic = type === "epic";
  const isMega = type === "mega" || isEpic;
  const label = isEpic ? "EPIC WIN" : type === "mega" ? "MEGA WIN" : "BIG WIN";
  const blackoutMs = isEpic ? 900 : isMega ? 650 : 350;
  const shockMs = isMega ? blackoutMs + (isEpic ? 350 : 280) : 0;
  const contentMs = isMega ? shockMs + 400 : blackoutMs + 300;
  const countMs = contentMs + (isEpic ? 1000 : isMega ? 700 : 500);
  const dismissMs = contentMs + (isEpic ? 900 : isMega ? 600 : 400);
  const hintMs = isEpic ? 4000 : isMega ? 3200 : 2500;
  useEffect(() => {
    const t = [];
    if (isMega) t.push(setTimeout(() => setPhase(1), blackoutMs));
    t.push(setTimeout(() => setPhase(2), contentMs));
    t.push(setTimeout(() => setPhase(3), countMs));
    t.push(setTimeout(() => setCanDismiss(true), dismissMs));
    t.push(setTimeout(() => setShowHint(true), hintMs));
    return () => t.forEach(clearTimeout);
  }, []);
  useEffect(() => {
    if (phase < 3) return;
    const steps = isEpic ? 50 : isMega ? 40 : 30;
    const ms = isEpic ? 50 : isMega ? 40 : 35;
    let step = 0;
    const iv = setInterval(() => {
      step++;
      const t = step / steps;
      setCountDisplay(Math.round(amount * (1 - Math.pow(1-t,3))));
      if (step >= steps) { clearInterval(iv); setCountDisplay(amount); }
    }, ms);
    return () => clearInterval(iv);
  }, [phase, amount, type]);
  const handleDismiss = () => {
    if (!canDismiss) return;
    if (type === "big") { onDone(); return; }
    setDismissing(true);
    setTimeout(onDone, isEpic ? 550 : 380);
  };
  const confettiColors = ["#f1c40f","#e74c3c","#3b82f6","#22c55e","#ec4899","#a855f7","#ffd700","#ff4500"];
  if (dismissing && isEpic) {
    return (
      <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,zIndex:10000,pointerEvents:"none",overflow:"hidden"}}>
        {}
        <div style={{position:"absolute",top:"50%",left:"50%",width:400,height:400,borderRadius:"50%",
          animation:"goldenExplosion 0.55s ease-out forwards"}} />
        {p.shatter.map((s, i) => (
          <div key={i} style={{
            position:"absolute",top:"50%",left:"50%",
            width:s.w,height:s.h,
            background:s.c===0?"rgba(255,69,0,0.85)":s.c===1?"rgba(255,215,0,0.85)":"rgba(255,107,53,0.85)",
            borderRadius:3,boxShadow:`0 0 12px ${s.c===0?"rgba(255,69,0,0.5)":"rgba(255,215,0,0.5)"}`,
            animation:`shatterFly 0.55s ease-out ${s.dl}s forwards`,
            "--tx":`${s.tx}px`,"--ty":`${s.ty}px`,"--rot":`${s.rot}deg`,
          }} />
        ))}
      </div>
    );
  }
  if (dismissing && type === "mega") {
    return (
      <div style={{
        position:"fixed",top:0,left:0,right:0,bottom:0,zIndex:10000,
        display:"flex",alignItems:"center",justifyContent:"center",
        animation:"zoomFadeOut 0.38s ease-in forwards",pointerEvents:"none",
        background:"rgba(0,0,0,0.85)",
      }}>
        <div style={{fontSize:52,fontWeight:900,fontFamily:T.serif,
          background:"linear-gradient(90deg,#ff6b6b,#f1c40f,#22c55e,#3b82f6,#f1c40f,#ff6b6b)",
          backgroundSize:"200% auto",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
        }}>MEGA WIN</div>
      </div>
    );
  }
  return (
    <div onClick={handleDismiss} style={{
      position:"fixed",top:0,left:0,right:0,bottom:0,zIndex:10000,
      display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
      background: phase === 0 ? "rgba(0,0,0,1)" : isEpic ? "rgba(0,0,0,0.95)" : isMega ? "rgba(0,0,0,0.92)" : "rgba(0,0,0,0.85)",
      cursor:canDismiss?"pointer":"default",
      overflow:"hidden",
    }}>
      {}
      {phase >= 2 && (isEpic || isMega) && (
        <div style={{ position:"absolute", inset:0, pointerEvents:"none", zIndex:0,
          animation: isEpic ? "epicEntranceShake 0.7s ease-out" : "epicEntranceShake 0.5s ease-out" }} />
      )}
      {}
      {phase >= 1 && isMega && Array.from({length: isEpic ? 2 : 1}, (_, i) => (
        <div key={`sw${i}`} style={{
          position:"absolute",top:"50%",left:"50%",
          width:isEpic?550:420,height:isEpic?550:420,borderRadius:"50%",
          border:`${isEpic?3:2}px solid ${isEpic?"rgba(255,69,0,0.6)":"rgba(241,196,15,0.5)"}`,
          boxShadow:`0 0 40px ${isEpic?"rgba(255,69,0,0.3)":"rgba(241,196,15,0.25)"},inset 0 0 20px ${isEpic?"rgba(255,69,0,0.15)":"rgba(241,196,15,0.1)"}`,
          animation:`shockwaveRing 0.7s ease-out ${i*0.18}s forwards`,
          transform:"translate(-50%,-50%) scale(0)",
        }} />
      ))}
      {}
      {phase >= 2 && isMega && Array.from({length: isEpic ? 3 : 2}, (_, i) => (
        <div key={`beam${i}`} style={{
          position:"absolute",top:"50%",left:"50%",
          width:700,height:700,
          background:`conic-gradient(from ${i*(isEpic?120:180)}deg, transparent 0deg, ${
            isEpic ? "rgba(255,69,0,0.07)" : "rgba(241,196,15,0.05)"
          } 4deg, transparent 8deg)`,
          borderRadius:"50%",
          animation:`spin ${7-i*1.5}s linear infinite`,
          transform:"translate(-50%,-50%)",
        }} />
      ))}
      {}
      {type === "big" && phase >= 2 && p.bokeh.map((b, i) => (
        <div key={`bk${i}`} style={{
          position:"absolute",left:`${b.x}%`,top:`${b.y}%`,
          width:b.s,height:b.s,borderRadius:"50%",
          background:`radial-gradient(circle, ${_themeAccent}5a, ${_themeAccent}0d)`,
          animation:`bokehDrift ${b.d}s ease-in-out ${b.dl}s infinite`,
        }} />
      ))}
      {}
      {phase >= 2 && (
        <div style={{
          position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",
          width:isEpic?650:isMega?520:400, height:isEpic?650:isMega?520:400,
          background: isEpic
            ? "conic-gradient(from 0deg, transparent 0deg, rgba(255,69,0,0.14) 8deg, transparent 16deg, rgba(255,215,0,0.1) 24deg, transparent 32deg)"
            : isMega
            ? "conic-gradient(from 0deg, transparent 0deg, rgba(59,130,246,0.08) 10deg, transparent 20deg, rgba(241,196,15,0.08) 30deg, transparent 40deg)"
            : `conic-gradient(from 0deg, transparent 0deg, ${_themeAccent}10 18deg, transparent 36deg)`,
          borderRadius:"50%",
          animation:`spin ${isEpic?4:isMega?6:12}s linear infinite`,
        }} />
      )}
      {}
      {isMega && phase >= 2 && (
        <div style={{
          position:"absolute",top:0,left:0,right:0,bottom:0,pointerEvents:"none",
          background:`radial-gradient(ellipse at center, transparent ${isEpic?"25%":"35%"}, rgba(0,0,0,${isEpic?0.7:0.5}) 100%)`,
          animation:`vignetteBreath ${isEpic?1.8:2.5}s ease-in-out infinite`,
        }} />
      )}
      {}
      {isEpic && phase >= 2 && p.fire.map((f, i) => (
        <div key={`fr${i}`} style={{
          position:"absolute",left:`${f.x}%`,bottom:-20,
          width:f.w,height:f.h,
          borderRadius:"50% 50% 50% 50% / 60% 60% 40% 40%",
          background:`radial-gradient(circle, ${f.even?"#ffd700":"#ff4500"}, transparent)`,
          animation:`fireRise ${f.d}s ease-out ${f.dl}s infinite`,
          opacity:0.6,
        }} />
      ))}
      {}
      {isEpic && phase >= 2 && p.chips.map((c, i) => (
        <div key={`cf${i}`} style={{
          position:"absolute",left:`${c.x}%`,bottom:-10,
          width:c.s,height:c.s,borderRadius:"50%",
          background:"radial-gradient(circle at 35% 35%, #ffd700, #b8860b)",
          border:"1px solid rgba(255,215,0,0.5)",
          boxShadow:"0 0 6px rgba(255,215,0,0.4)",
          animation:`chipFountain ${c.d}s ease-out ${c.dl}s infinite`,
          "--drift":`${c.drift}px`,"--drift2":`${c.drift2}px`,
          "--rise":`${c.rise}px`,"--rot":`${c.rot}deg`,
        }} />
      ))}
      {}
      {isEpic && phase >= 2 && (
        <div style={{
          position:"absolute",top:"50%",left:"50%",width:380,height:200,
          transform:"translate(-50%,-50%)",
          animation:"spin 5s linear infinite",
          zIndex:2,
        }}>
          {p.orbit.map((o, i) => (
            <div key={i} style={{
              position:"absolute",
              left:`${50+48*Math.cos(o.angle)}%`,top:`${50+48*Math.sin(o.angle)}%`,
              width:o.s,height:o.s,borderRadius:"50%",
              transform:"translate(-50%,-50%)",
              background:o.even?"#ff4500":"#ffd700",
              boxShadow:`0 0 10px ${o.even?"rgba(255,69,0,0.7)":"rgba(255,215,0,0.7)"}`,
            }} />
          ))}
        </div>
      )}
      {}
      {phase >= 2 && p.confetti.slice(0, isEpic?60:isMega?40:20).map((c, i) => (
        <div key={`cf${i}`} style={{
          position:"absolute",left:`${c.x}%`,top:-10,
          width:c.w,height:c.h,borderRadius:c.round?"50%":"2px",
          background:confettiColors[c.c],
          animation:`confettiFall ${c.d}s linear ${c.dl}s forwards`,
          opacity:0.9,
        }} />
      ))}
      {}
      {isMega && phase >= 2 && Array.from({length:isEpic?14:8}, (_, i) => (
        <div key={`st${i}`} style={{
          position:"absolute",
          left:`${50+28*Math.cos(i*Math.PI*2/(isEpic?14:8))}%`,
          top:`${45+28*Math.sin(i*Math.PI*2/(isEpic?14:8))}%`,
          width:isEpic?7:5,height:isEpic?7:5,borderRadius:"50%",
          background:isEpic?"#ff4500":"#f1c40f",
          boxShadow:`0 0 14px ${isEpic?"#ff4500":"#f1c40f"}`,
          animation:`starBurst 1.2s ease-out ${0.08*i}s forwards`,
        }} />
      ))}
      {}
      {phase >= 2 && (
        <div style={{position:"relative",zIndex:2,display:"flex",gap:3,flexWrap:"wrap",justifyContent:"center"}}>
          {label.split("").map((char, i) => (
            <span key={i} style={{
              fontSize:isEpic?62:isMega?54:42, fontWeight:900, fontFamily:T.serif,
              background: isEpic
                ? "linear-gradient(180deg, #ff4500, #ff6b35, #ffd700, #fff, #ffd700, #ff6b35, #ff4500)"
                : isMega
                ? "linear-gradient(90deg, #ff6b6b, #f1c40f, #22c55e, #3b82f6, #f1c40f, #ff6b6b)"
                : `linear-gradient(90deg, ${_themeAccent}, ${_themeAccent}cc, #fff, ${_themeAccent}cc, ${_themeAccent})`,
              backgroundSize:"200% auto",
              WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
              display:"inline-block",
              animation: `letterDrop ${isEpic?0.7:isMega?0.7:0.6}s ease-out ${i*(isEpic?0.09:isMega?0.09:0.07)}s both, shimmer ${isEpic?0.8:isMega?1.2:2}s linear ${0.8+i*0.09}s infinite`,
              textShadow:"none",
            }}>{char === " " ? "\u00A0" : char}</span>
          ))}
        </div>
      )}
      {}
      {type === "big" && phase >= 2 && (
        <div style={{
          position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",
          width:220,height:220,borderRadius:"50%",
          border:`2px solid ${_themeAccent}35`,
          boxShadow:`0 0 40px ${_themeAccent}25, inset 0 0 30px ${_themeAccent}14`,
          animation:"glowBreath 2s ease-in-out infinite",
        }} />
      )}
      {}
      {phase >= 3 && (
        <div style={{
          fontSize:isEpic?46:isMega?38:28, fontWeight:800, marginTop:14,
          fontFamily:T.mono, position:"relative", zIndex:2,
          color: isEpic?"#ff6b35":isMega?"#f1c40f":_themeAccent,
          textShadow: isEpic
            ? "0 0 40px rgba(255,107,53,0.8), 0 0 80px rgba(255,69,0,0.4), 0 0 120px rgba(255,69,0,0.2)"
            : isMega
            ? "0 0 30px rgba(241,196,15,0.6), 0 0 60px rgba(241,196,15,0.2)"
            : `0 0 15px ${_themeAccent}66`,
          animation:"bounceIn 0.5s ease-out",
        }}>+${countDisplay.toLocaleString()}</div>
      )}
      {}
      {isEpic && phase >= 3 && (
        <div style={{
          fontSize:14, fontFamily:T.mono, color:"rgba(255,215,0,0.7)",
          letterSpacing:4, marginTop:12, position:"relative", zIndex:2,
          animation:"fadeIn 0.5s ease 0.3s both",
          textShadow:"0 0 12px rgba(255,215,0,0.3)",
        }}>LEGENDARY</div>
      )}
      {showHint && (
        <div style={{position:"absolute",bottom:40,fontSize:12,color:"rgba(255,255,255,0.5)",
          letterSpacing:3,fontFamily:T.mono,textTransform:"uppercase",zIndex:2,
          animation:"fadeIn 0.8s ease-out, hintPulse 2s ease-in-out 0.8s infinite"}}>tap anywhere to continue</div>
      )}
    </div>
  );
}
function AnimatedChips({ chips }) {
  const [display, setDisplay] = useState(chips);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState(0);
  const [popClass, setPopClass] = useState("none");
  const [glowIntensity, setGlowIntensity] = useState(0);
  const prevRef = useRef(chips);
  useEffect(() => {
    if (chips === prevRef.current) return;
    const diff = chips - prevRef.current;
    const start = prevRef.current;
    prevRef.current = chips;
    const absDiff = Math.abs(diff);
    setAnimating(true);
    setDirection(diff > 0 ? 1 : -1);
    if (diff > 0) {
      if (absDiff >= 5000) { setPopClass("mega"); setGlowIntensity(3); }
      else if (absDiff >= 500) { setPopClass("big"); setGlowIntensity(2); }
      else { setPopClass("normal"); setGlowIntensity(1); }
    } else {
      setPopClass("none"); setGlowIntensity(0);
    }
    const steps = absDiff >= 1000 ? 30 : 20;
    let step = 0;
    const iv = setInterval(() => {
      step++;
      const t = step / steps;
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(start + diff * eased));
      if (step >= steps) { clearInterval(iv); setDisplay(chips); setAnimating(false); setPopClass("none"); setGlowIntensity(0); }
    }, absDiff >= 1000 ? 30 : 25);
    return () => clearInterval(iv);
  }, [chips]);
  const glowShadow = glowIntensity === 3
    ? "0 0 30px rgba(255,200,50,0.6), 0 0 60px rgba(255,150,0,0.3)"
    : glowIntensity === 2
    ? "0 0 20px rgba(241,196,15,0.5), 0 0 40px rgba(241,196,15,0.2)"
    : glowIntensity === 1
    ? "0 0 10px rgba(34,197,94,0.4)"
    : "none";
  return (
    <span style={{
      transition: "color 0.3s",
      color: animating ? (direction > 0 ? "#22c55e" : "#ef4444") : undefined,
      animation: popClass === "mega" ? "megaPop 0.5s ease-out" : popClass === "big" ? "chipPop 0.4s ease-out" : popClass === "normal" ? "chipPop 0.3s ease-out" : "none",
      textShadow: glowShadow,
      display: "inline-block",
    }}>${display.toLocaleString()}</span>
  );
}
function StreakIndicator({ streak }) {
  if (streak < 2) return null;
  const intensity = Math.min(streak, 15);
  const fireSize = 14 + intensity * 1.5;
  const glowColor = streak >= 10 ? "#ff4500" : streak >= 5 ? "#ff6b00" : "#ff9500";
  const fireCount = streak >= 10 ? 5 : streak >= 5 ? 3 : 0;
  return (
    <div className={streak >= 10 ? "anim-streak-glow-fast" : streak >= 5 ? "anim-streak-glow-slow" : ""} style={{
      display:"flex", alignItems:"center", gap:4, position:"relative",
      padding:"3px 10px 3px 6px", borderRadius:16,
      background:`rgba(255,${Math.max(50, 150 - intensity * 10)},0,${0.08 + intensity * 0.02})`,
      border: streak >= 10
        ? `2px solid rgba(255,69,0,0.6)`
        : streak >= 5
        ? `1.5px solid rgba(255,107,0,0.5)`
        : `1px solid rgba(255,${150 - intensity * 10},0,0.3)`,
      boxShadow: streak >= 10
        ? "0 0 16px rgba(255,69,0,0.4), 0 0 32px rgba(255,69,0,0.15)"
        : streak >= 5
        ? "0 0 10px rgba(255,107,0,0.3)"
        : "none",
    }}>
      {}
      {Array.from({length:fireCount}, (_, i) => (
        <div key={i} style={{
          position:"absolute",
          left: `${20 + Math.random() * 60}%`,
          top: -4,
          width: 3 + Math.random() * 3,
          height: 6 + Math.random() * 6,
          borderRadius:"50% 50% 50% 50% / 60% 60% 40% 40%",
          background: `radial-gradient(circle, ${i % 2 === 0 ? "#ffd700" : "#ff4500"}, transparent)`,
          animation:`fireParticle ${0.5 + Math.random() * 0.5}s ease-out ${Math.random() * 0.5}s infinite`,
          opacity:0.7,
        }} />
      ))}
      <span className={streak >= 10 ? "anim-fire-fast" : "anim-fire-slow"} style={{
        fontSize:fireSize, lineHeight:1,
        filter: `drop-shadow(0 0 ${intensity * 1.5}px ${glowColor})`,
      }}>▲</span>
      <span style={{
        fontSize: streak >= 10 ? 15 : 12, fontWeight:900, fontFamily:T.mono,
        color:glowColor, letterSpacing:1,
        textShadow: streak >= 10 ? `0 0 10px ${glowColor}` : "none",
      }}>{streak}</span>
    </div>
  );
}
function AchievementToast({ achievement, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 4000);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div style={{
      position:"fixed", top:16, right:16, zIndex:45000,
      display:"flex", alignItems:"center", gap:10,
      padding:"10px 16px 10px 12px", borderRadius:12,
      background:"linear-gradient(135deg, rgba(26,26,46,0.95), rgba(15,15,26,0.95))",
      border:`1px solid ${_themeAccent}66`,
      boxShadow:`0 8px 32px rgba(0,0,0,0.5), 0 0 20px ${_themeAccent}1a`,
      animation:"toastSlide 4s ease-in-out both",
      backdropFilter:"blur(10px)",
      maxWidth:280,
    }}>
      <span style={{ fontSize:28, lineHeight:1 }}>{achievement.icon}</span>
      <div>
        <div style={{ fontSize:8, letterSpacing:3, textTransform:"uppercase",
          color:_themeAccent, fontFamily:T.mono, fontWeight:700, marginBottom:2 }}>
          ACHIEVEMENT UNLOCKED
        </div>
        <div style={{ fontSize:13, fontWeight:700, color:T.text, fontFamily:T.serif,
          letterSpacing:1 }}>{achievement.name}</div>
        <div style={{ fontSize:9, color:T.muted, fontFamily:T.mono, marginTop:1 }}>
          {achievement.desc}
        </div>
      </div>
    </div>
  );
}
function NearMissFlash({ message }) {
  return (
    <div style={{
      textAlign:"center", padding:"4px 14px", borderRadius:8,
      background:"rgba(255,165,0,0.1)", border:"1px solid rgba(255,165,0,0.25)",
      animation:"nearMissPulse 0.4s ease-out, fadeIn 0.3s ease",
      fontSize:11, fontWeight:600, fontFamily:T.mono, letterSpacing:1,
      color:"#ffa500",
    }}>{message}</div>
  );
}
function JackpotOverlay({ amount, onDone }) {
  const [countDisplay, setCountDisplay] = useState(0);
  const [phase, setPhase] = useState(0);
  const [canDismiss, setCanDismiss] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [dismissing, setDismissing] = useState(false);
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const parts = useRef(null);
  if (!parts.current) {
    const r = () => Math.random();
    const isMobileJ = typeof window !== "undefined" && window.innerWidth < 480;
    const js = isMobileJ ? 0.5 : 1;
    parts.current = {
      stars: Array.from({length:Math.round(50*js)}, () => {
        const angle = r()*Math.PI*2;
        const dist = 40+r()*360;
        return {sx:"0px",sy:"0px",tx:`${Math.cos(angle)*dist}px`,ty:`${Math.sin(angle)*dist}px`,s:1+r()*3,d:2+r()*3,dl:r()*2,o:0.4+r()*0.5};
      }),
      confetti: Array.from({length:Math.round(80*js)}, () => ({x:r()*100,w:4+r()*9,h:4+r()*9,round:r()>0.5,c:Math.floor(r()*8),d:1.2+r()*2.5,dl:r()*1})),
      fire: Array.from({length:Math.round(30*js)}, () => ({x:5+r()*90,w:3+r()*10,h:10+r()*22,even:r()>0.5,d:1.5+r()*2.5,dl:r()*2})),
      chips: Array.from({length:Math.round(20*js)}, () => ({x:30+r()*40,drift:-40+r()*80,drift2:-80+r()*160,rise:-200-r()*280,rot:r()*720,s:9+r()*16,d:1.2+r()*1.8,dl:r()*1})),
      orbit1: Array.from({length:Math.round(20*js)}, (_, i) => ({angle:(i/20)*Math.PI*2,s:3+(i%4)*1.5,even:i%2===0})),
      orbit2: Array.from({length:Math.round(14*js)}, (_, i) => ({angle:(i/14)*Math.PI*2,s:2+(i%3)*1.2,even:i%2===0})),
      shatter: Array.from({length:Math.round(36*js)}, (_, i) => {const a=(i/36)*Math.PI*2;const d=250+r()*400;return{tx:Math.cos(a)*d,ty:Math.sin(a)*d,w:30+r()*60,h:20+r()*45,rot:r()*900-450,c:i%4,dl:i*0.012};}),
    };
  }
  const pp = parts.current;
  useEffect(() => {
    const t = [];
    t.push(setTimeout(() => setPhase(1), 1200));
    t.push(setTimeout(() => setPhase(2), 2000));
    t.push(setTimeout(() => setPhase(3), 3200));
    t.push(setTimeout(() => setCanDismiss(true), 3400));
    t.push(setTimeout(() => setShowHint(true), 4500));
    return () => t.forEach(clearTimeout);
  }, []);
  useEffect(() => {
    if (phase < 3) return;
    const steps = 70;
    let step = 0;
    const iv = setInterval(() => {
      step++;
      const t = step / steps;
      const eased = 1 - Math.pow(1 - t, 4);
      setCountDisplay(Math.round(amount * eased));
      if (step >= steps) { clearInterval(iv); setCountDisplay(amount); }
    }, 45);
    return () => clearInterval(iv);
  }, [amount, phase]);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const particles = [];
    const colors = ["#ff4500","#ffd700","#ff6b35","#fff","#ff0","#f1c40f","#ff3333","#ffaa00","#ff6600","#00ffcc","#ff00ff","#4488ff"];
    let running = true;
    const burst = () => {
      if (!running) return;
      const cx = Math.random() * canvas.width;
      const cy = canvas.height * (0.1 + Math.random() * 0.55);
      const count = 30 + Math.floor(Math.random() * 30);
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 10;
        particles.push({
          x: cx, y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2.5,
          size: 1.5 + Math.random() * 3.5,
          color: colors[Math.floor(Math.random() * colors.length)],
          gravity: 0.05 + Math.random() * 0.04,
          life: 1,
          decay: 0.01 + Math.random() * 0.008,
        });
      }
      setTimeout(burst, 350 + Math.random() * 500);
    };
    burst();
    const animate = () => {
      if (!running) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;
        if (p.life <= 0) { particles.splice(i, 1); continue; }
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => { running = false; cancelAnimationFrame(animRef.current); };
  }, []);
  const handleDismiss = () => {
    if (!canDismiss) return;
    setDismissing(true);
    setTimeout(onDone, 650);
  };
  const confettiColors = ["#f1c40f","#e74c3c","#3b82f6","#22c55e","#ec4899","#a855f7","#ffd700","#ff4500"];
  const jackpotLabel = "JACKPOT!!!";
  if (dismissing) {
    return (
      <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,zIndex:10002,pointerEvents:"none",overflow:"hidden"}}>
        {}
        <div style={{position:"absolute",top:"50%",left:"50%",width:500,height:500,borderRadius:"50%",
          animation:"goldenExplosion 0.65s ease-out forwards"}} />
        {}
        <div style={{position:"absolute",top:"50%",left:"50%",width:300,height:300,borderRadius:"50%",
          border:"4px solid rgba(255,215,0,0.6)",
          boxShadow:"0 0 60px rgba(255,215,0,0.5), 0 0 120px rgba(255,69,0,0.3)",
          animation:"shockwaveRing 0.6s ease-out 0.05s forwards",
          transform:"translate(-50%,-50%) scale(0)"}} />
        {}
        {pp.shatter.map((s, i) => (
          <div key={i} style={{
            position:"absolute",top:"50%",left:"50%",
            width:s.w,height:s.h,
            background:s.c===0?"rgba(255,69,0,0.9)":s.c===1?"rgba(255,215,0,0.9)":s.c===2?"rgba(255,107,53,0.9)":"rgba(255,255,255,0.8)",
            borderRadius:3,
            boxShadow:`0 0 15px ${s.c===0?"rgba(255,69,0,0.6)":s.c===1?"rgba(255,215,0,0.6)":"rgba(255,255,255,0.4)"}`,
            animation:`shatterFly 0.65s ease-out ${s.dl}s forwards`,
            "--tx":`${s.tx}px`,"--ty":`${s.ty}px`,"--rot":`${s.rot}deg`,
          }} />
        ))}
      </div>
    );
  }
  return (
    <div onClick={handleDismiss} style={{
      position:"fixed",top:0,left:0,right:0,bottom:0,zIndex:10002,
      display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
      background: phase === 0 ? "rgba(0,0,0,1)" : "rgba(0,0,0,0.95)",
      cursor:canDismiss?"pointer":"default",
      overflow:"hidden",
    }}>
      {}
      {phase >= 1 && (
        <div style={{ position:"absolute", inset:0, pointerEvents:"none", zIndex:0,
          animation:"jackpotEntranceQuake 1s ease-out" }} />
      )}
      {}
      <canvas ref={canvasRef} style={{
        position:"absolute",top:0,left:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:1,
      }} />
      {}
      {phase >= 2 && (
        <div style={{
          position:"absolute",top:0,left:0,right:0,bottom:0,
          background:"linear-gradient(45deg, rgba(255,69,0,0.06), rgba(255,215,0,0.08), rgba(255,107,53,0.06), rgba(255,215,0,0.04), rgba(255,69,0,0.06))",
          backgroundSize:"400% 400%",
          animation:"auroraShift 6s ease-in-out infinite",
          pointerEvents:"none",
        }} />
      )}
      {}
      {phase >= 1 && Array.from({length:3}, (_, i) => (
        <div key={`sw${i}`} style={{
          position:"absolute",top:"50%",left:"50%",
          width:600,height:600,borderRadius:"50%",
          border:`${3-i}px solid rgba(255,215,0,${0.6-i*0.15})`,
          boxShadow:`0 0 50px rgba(255,215,0,${0.35-i*0.08}), inset 0 0 30px rgba(255,69,0,${0.15-i*0.03})`,
          animation:`shockwaveRing 0.9s ease-out ${i*0.2}s forwards`,
          transform:"translate(-50%,-50%) scale(0)",
        }} />
      ))}
      {}
      {phase >= 2 && Array.from({length:4}, (_, i) => (
        <div key={`beam${i}`} style={{
          position:"absolute",top:"50%",left:"50%",
          width:800,height:800,
          background:`conic-gradient(from ${i*90}deg, transparent 0deg, rgba(255,215,0,0.06) 3deg, rgba(255,69,0,0.04) 5deg, transparent 8deg)`,
          borderRadius:"50%",
          animation:`spin ${6-i*0.8}s linear infinite ${i%2===0?"":"reverse"}`,
          transform:"translate(-50%,-50%)",
        }} />
      ))}
      {}
      {phase >= 2 && pp.stars.map((s, i) => (
        <div key={`star${i}`} style={{
          position:"absolute",top:"50%",left:"50%",
          width:s.s,height:s.s,borderRadius:"50%",
          background:i%3===0?"#ffd700":i%3===1?"#fff":"#ff6b35",
          boxShadow:`0 0 4px ${i%3===0?"rgba(255,215,0,0.6)":"rgba(255,255,255,0.5)"}`,
          animation:`starZoom ${s.d}s linear ${s.dl}s infinite`,
          "--sx":s.sx,"--sy":s.sy,"--tx":s.tx,"--ty":s.ty,
          opacity:s.o,
        }} />
      ))}
      {}
      {phase >= 2 && (
        <div style={{
          position:"absolute",top:0,left:0,right:0,bottom:0,pointerEvents:"none",
          background:"radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.65) 100%)",
          animation:"vignetteBreath 1.5s ease-in-out infinite",
        }} />
      )}
      {}
      {phase >= 2 && pp.fire.map((f, i) => (
        <div key={`fr${i}`} style={{
          position:"absolute",left:`${f.x}%`,bottom:-20,
          width:f.w,height:f.h,
          borderRadius:"50% 50% 50% 50% / 60% 60% 40% 40%",
          background:`radial-gradient(circle, ${f.even?"#ffd700":"#ff4500"}, transparent)`,
          animation:`fireRise ${f.d}s ease-out ${f.dl}s infinite`,
          opacity:0.7, zIndex:1,
        }} />
      ))}
      {}
      {phase >= 2 && pp.chips.map((c, i) => (
        <div key={`chip${i}`} style={{
          position:"absolute",left:`${c.x}%`,bottom:-10,
          width:c.s,height:c.s,borderRadius:"50%",
          background:"radial-gradient(circle at 35% 35%, #ffd700, #b8860b)",
          border:"1px solid rgba(255,215,0,0.5)",
          boxShadow:"0 0 8px rgba(255,215,0,0.5)",
          animation:`chipFountain ${c.d}s ease-out ${c.dl}s infinite`,
          "--drift":`${c.drift}px`,"--drift2":`${c.drift2}px`,
          "--rise":`${c.rise}px`,"--rot":`${c.rot}deg`,
          zIndex:1,
        }} />
      ))}
      {}
      {phase >= 2 && (<>
        <div style={{
          position:"absolute",top:"50%",left:"50%",width:480,height:240,
          transform:"translate(-50%,-50%)",
          animation:"spin 5s linear infinite",zIndex:2,
        }}>
          {pp.orbit1.map((o, i) => (
            <div key={i} style={{
              position:"absolute",
              left:`${50+48*Math.cos(o.angle)}%`,top:`${50+48*Math.sin(o.angle)}%`,
              width:o.s,height:o.s,borderRadius:"50%",
              transform:"translate(-50%,-50%)",
              background:o.even?"#ff4500":"#ffd700",
              boxShadow:`0 0 12px ${o.even?"rgba(255,69,0,0.8)":"rgba(255,215,0,0.8)"}`,
            }} />
          ))}
        </div>
        <div style={{
          position:"absolute",top:"50%",left:"50%",width:360,height:180,
          transform:"translate(-50%,-50%)",
          animation:"spin 3.5s linear infinite reverse",zIndex:2,
        }}>
          {pp.orbit2.map((o, i) => (
            <div key={i} style={{
              position:"absolute",
              left:`${50+46*Math.cos(o.angle)}%`,top:`${50+46*Math.sin(o.angle)}%`,
              width:o.s,height:o.s,borderRadius:"50%",
              transform:"translate(-50%,-50%)",
              background:o.even?"#fff":"#00ffcc",
              boxShadow:`0 0 8px ${o.even?"rgba(255,255,255,0.6)":"rgba(0,255,204,0.6)"}`,
            }} />
          ))}
        </div>
      </>)}
      {}
      {phase >= 2 && (
        <div style={{
          position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",
          width:750,height:750,
          background:"conic-gradient(from 0deg, transparent 0deg, rgba(255,69,0,0.12) 6deg, transparent 12deg, rgba(255,215,0,0.1) 18deg, transparent 24deg, rgba(255,255,255,0.04) 30deg, transparent 36deg)",
          borderRadius:"50%",
          animation:"spin 3s linear infinite",
        }} />
      )}
      {}
      {phase >= 2 && (
        <div style={{
          position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",
          width:380,height:380,borderRadius:"50%",
          border:"3px solid rgba(255,215,0,0.35)",
          boxShadow:"0 0 60px rgba(255,215,0,0.25), inset 0 0 60px rgba(255,215,0,0.1), 0 0 120px rgba(255,69,0,0.1)",
          animation:"glowBreath 1.2s ease-in-out infinite",
          zIndex:2,
        }} />
      )}
      {}
      {phase >= 2 && pp.confetti.map((c, i) => (
        <div key={`cc${i}`} style={{
          position:"absolute",left:`${c.x}%`,top:-10,
          width:c.w,height:c.h,borderRadius:c.round?"50%":"2px",
          background:confettiColors[c.c],
          animation:`confettiFall ${c.d}s linear ${c.dl}s forwards`,
          opacity:0.9,zIndex:1,
        }} />
      ))}
      {}
      {phase >= 2 && (
        <div style={{position:"relative",zIndex:3,display:"flex",gap:4}}>
          {jackpotLabel.split("").map((char, i) => (
            <span key={i} style={{
              fontSize:74, fontWeight:900, fontFamily:T.serif,
              background:"linear-gradient(180deg, #ff4500, #ff6b35, #ffd700, #fff, #ffd700, #ff6b35, #ff4500)",
              backgroundSize:"200% auto",
              WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
              display:"inline-block",
              animation:`jackpotLetterDrop 0.85s ease-out ${i*0.12}s both, shimmer 0.8s linear ${1.2+i*0.12}s infinite, letterBounce ${1.5+i*0.1}s ease-in-out ${1.5+i*0.12}s infinite`,
              textShadow:"none",
            }}>{char}</span>
          ))}
        </div>
      )}
      {}
      {phase >= 2 && (
        <div style={{
          fontSize:20, fontFamily:T.mono, fontWeight:700,
          color:"#ff6b35", letterSpacing:6,
          marginTop:10,position:"relative",zIndex:3,
          opacity:0,
          animation: phase >= 2 ? "fadeIn 0.5s ease 0.7s both" : "none",
          textShadow:"0 0 20px rgba(255,107,53,0.6), 0 0 40px rgba(255,69,0,0.3)",
        }}>10,000× MULTIPLIER</div>
      )}
      {}
      {phase >= 3 && (
        <div style={{
          fontSize:56, fontWeight:900, fontFamily:T.mono,
          color:"#ffd700",position:"relative",zIndex:3,
          textShadow:"0 0 40px rgba(255,215,0,0.7), 0 0 80px rgba(255,215,0,0.3), 0 0 120px rgba(255,215,0,0.15)",
          marginTop:20,
          animation:"bounceIn 0.6s ease-out",
        }}>+${countDisplay.toLocaleString()}</div>
      )}
      {}
      {showHint && (
        <div style={{
          position:"absolute",bottom:50,fontSize:13,color:"rgba(255,255,255,0.5)",
          letterSpacing:3,fontFamily:T.mono,textTransform:"uppercase",zIndex:3,
          animation:"fadeIn 0.8s ease-out, hintPulse 2s ease-in-out 0.8s infinite",
        }}>tap anywhere to continue</div>
      )}
    </div>
  );
}
const BUSTED_TAGLINES = [
  "The house always wins... eventually.",
  "That's what they call a learning experience.",
  "Your wallet sends its regards.",
  "Rock bottom has a casino, apparently.",
  "Time to check between the couch cushions.",
  "The ATM called. It's worried about you.",
  "Statistically, this was inevitable.",
  "Every gambler's origin story starts here.",
  "Your accountant just felt a disturbance.",
  "Plot twist: the chips were the friends we lost along the way.",
];
function BustedOverlay({ peakBalance, onRebuy, rebuys, rebuyAmount = 1000 }) {
  const [phase, setPhase] = useState(0);
  const [drainDisplay, setDrainDisplay] = useState(peakBalance);
  const [tagline] = useState(() => BUSTED_TAGLINES[Math.floor(Math.random() * BUSTED_TAGLINES.length)]);
  const parts = useRef(null);
  if (!parts.current) {
    const r = () => Math.random();
    parts.current = {
      rain: Array.from({length:60}, () => ({x:r()*100,w:1.5+r()*2,h:10+r()*18,d:0.8+r()*1.5,dl:r()*2,o:0.15+r()*0.25})),
      cracks: Array.from({length:18}, (_, i) => {
        const angle = (i/18)*Math.PI*2 + (r()-0.5)*0.5;
        const len = 60+r()*220;
        const segCount = 3+Math.floor(r()*5);
        const segs = Array.from({length:segCount}, (_, j) => {
          const frac = (j+1)/segCount;
          return { x:Math.cos(angle)*len*frac + (r()-0.5)*35, y:Math.sin(angle)*len*frac + (r()-0.5)*35 };
        });
        const branchAngle = angle + (r()-0.5)*1.2;
        const branchLen = 30+r()*80;
        const lastSeg = segs[segs.length-1];
        const branch = Array.from({length:2+Math.floor(r()*3)}, (_, j) => {
          const frac = (j+1)/(2+Math.floor(r()*3));
          return { x:lastSeg.x+Math.cos(branchAngle)*branchLen*frac+(r()-0.5)*15, y:lastSeg.y+Math.sin(branchAngle)*branchLen*frac+(r()-0.5)*15 };
        });
        return { segs, branch, w:0.8+r()*2.2 };
      }),
    };
  }
  const pp = parts.current;
  useEffect(() => {
    const t = [];
    t.push(setTimeout(() => setPhase(1), 800));
    t.push(setTimeout(() => setPhase(2), 1400));
    t.push(setTimeout(() => setPhase(3), 2800));
    t.push(setTimeout(() => setPhase(4), 4600));
    return () => t.forEach(clearTimeout);
  }, []);
  const drainedRef = useRef(false);
  useEffect(() => {
    if (phase !== 3 || peakBalance <= 0 || drainedRef.current) return;
    drainedRef.current = true;
    const steps = 50;
    let step = 0;
    const iv = setInterval(() => {
      step++;
      const t = step / steps;
      const eased = t * t;
      setDrainDisplay(Math.max(0, Math.round(peakBalance * (1 - eased))));
      if (step >= steps) { clearInterval(iv); setDrainDisplay(0); }
    }, 30);
    return () => clearInterval(iv);
  }, [phase, peakBalance]);
  const label = "BUSTED";
  return (
    <div style={{
      position:"fixed",top:0,left:0,right:0,bottom:0,zIndex:10010,
      display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
      background:"rgba(0,0,0,1)",
      overflow:"hidden",
      animation: phase >= 1 ? "bustedShake 0.8s ease-out" : "none",
    }}>
      {}
      {phase === 0 && (
        <div style={{
          position:"absolute",top:0,left:0,right:0,bottom:0,
          background:"radial-gradient(ellipse at center, rgba(50,20,20,0.6), rgba(0,0,0,0.95))",
          animation:"flickerDie 0.8s ease-out forwards",
        }} />
      )}
      {}
      {phase >= 1 && (
        <svg style={{
          position:"absolute",top:0,left:0,width:"100%",height:"100%",
          pointerEvents:"none",zIndex:1,
          animation:"crackSpread 0.6s ease-out forwards",
        }} viewBox="0 0 100 100" preserveAspectRatio="none">
          {pp.cracks.map((crack, ci) => (
            <g key={ci}>
              {}
              <polyline
                points={`50,50 ${crack.segs.map(s => `${50+s.x/4},${50+s.y/4}`).join(" ")}`}
                fill="none"
                stroke={`rgba(${180+ci*4},${30+ci*3},${30+ci*3},${0.4+ci*0.02})`}
                strokeWidth={crack.w * 0.15}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {}
              {crack.branch && crack.branch.length > 0 && (
                <polyline
                  points={`${50+crack.segs[crack.segs.length-1].x/4},${50+crack.segs[crack.segs.length-1].y/4} ${crack.branch.map(s => `${50+s.x/4},${50+s.y/4}`).join(" ")}`}
                  fill="none"
                  stroke={`rgba(${150+ci*3},${25+ci*2},${25+ci*2},${0.3+ci*0.01})`}
                  strokeWidth={crack.w * 0.1}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </g>
          ))}
        </svg>
      )}
      {}
      {phase >= 1 && pp.rain.map((r, i) => (
        <div key={`rain${i}`} style={{
          position:"absolute",left:`${r.x}%`,top:-20,
          width:r.w,height:r.h,
          borderRadius:1,
          background:"linear-gradient(180deg, rgba(120,120,130,0.4), rgba(80,80,90,0.1))",
          animation:`greyRainFall ${r.d}s linear ${r.dl}s infinite`,
          opacity:r.o,
        }} />
      ))}
      {}
      {phase >= 1 && (
        <div style={{
          position:"absolute",top:0,left:0,right:0,bottom:0,pointerEvents:"none",
          background:"radial-gradient(ellipse at center, transparent 20%, rgba(80,10,10,0.5) 70%, rgba(40,0,0,0.7) 100%)",
          animation:"redVignetteBreath 2.5s ease-in-out infinite",
        }} />
      )}
      {}
      {phase >= 2 && (
        <div style={{position:"relative",zIndex:3,display:"flex",gap:6}}>
          {label.split("").map((char, i) => (
            <span key={i} style={{
              fontSize:72, fontWeight:900, fontFamily:T.serif,
              color:"transparent",
              background:"linear-gradient(180deg, #ef4444, #991b1b, #450a0a, #991b1b, #ef4444)",
              backgroundSize:"200% auto",
              WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
              display:"inline-block",
              animation:`bustedLetterSlam 0.8s ease-out ${i*0.12}s both, bustedPulse 2s ease-in-out ${1+i*0.12}s infinite`,
              filter:"drop-shadow(0 0 20px rgba(239,68,68,0.4))",
            }}>{char}</span>
          ))}
        </div>
      )}
      {}
      {phase >= 3 && (
        <div style={{
          marginTop:20,position:"relative",zIndex:3,textAlign:"center",
          animation:"slideUp 0.5s ease-out",
        }}>
          <div style={{ fontSize:11, fontFamily:T.mono, color:"rgba(255,255,255,0.35)",
            letterSpacing:3, textTransform:"uppercase", marginBottom:6 }}>
            {drainDisplay > 0 ? "BALANCE DRAINING..." : "BALANCE"}
          </div>
          <div style={{
            fontSize:drainDisplay > 0 ? 38 : 44, fontWeight:900, fontFamily:T.mono,
            color: drainDisplay > 0 ? "#ef4444" : "#666",
            textShadow: drainDisplay > 0 ? "0 0 30px rgba(239,68,68,0.5)" : "none",
            transition:"font-size 0.3s, color 0.3s",
          }}>
            ${drainDisplay.toLocaleString()}
          </div>
        </div>
      )}
      {}
      {phase >= 4 && (
        <div style={{
          marginTop:28,position:"relative",zIndex:3,textAlign:"center",
          animation:"slideUp 0.6s ease-out",
        }}>
          <div style={{
            fontSize:13, fontFamily:T.serif, fontStyle:"italic",
            color:"rgba(255,255,255,0.4)", letterSpacing:1,
            maxWidth:300, lineHeight:1.5, marginBottom:24,
          }}>
            "{tagline}"
          </div>
          <button onClick={onRebuy} style={{
            padding:"14px 40px", fontSize:15, fontWeight:900, fontFamily:T.serif,
            background:"linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.05))",
            border:"2px solid rgba(239,68,68,0.4)",
            borderRadius:14, color:"#ef4444", letterSpacing:3,
            cursor:"pointer", transition:"all 0.2s",
            boxShadow:"0 0 20px rgba(239,68,68,0.15)",
            textTransform:"uppercase",
          }}
          onMouseEnter={e => { e.target.style.background="linear-gradient(135deg, rgba(239,68,68,0.25), rgba(239,68,68,0.1))"; e.target.style.boxShadow="0 0 30px rgba(239,68,68,0.3)"; }}
          onMouseLeave={e => { e.target.style.background="linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.05))"; e.target.style.boxShadow="0 0 20px rgba(239,68,68,0.15)"; }}
          >
            Rebuy ${rebuyAmount.toLocaleString()}
          </button>
          <div style={{ fontSize:9, fontFamily:T.mono, color:"rgba(255,255,255,0.2)",
            marginTop:10, letterSpacing:2 }}>
            REBUY #{rebuys + 1}
          </div>
        </div>
      )}
      {}
      {phase >= 2 && (
        <div style={{
          position:"absolute",bottom:30,
          fontSize:10,fontFamily:T.mono,color:"rgba(255,255,255,0.12)",
          letterSpacing:4,zIndex:3,
          animation:"slideUp 0.5s ease-out 1.5s both",
        }}>
          ×
        </div>
      )}
    </div>
  );
}
function ChipStackVisual({ chips, skinId }) {
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
function useWinFlash() {
  const [flash, setFlash] = useState(false);
  const triggerFlash = useCallback(() => {
    setFlash(true);
    setTimeout(() => setFlash(false), 600);
  }, []);
  return { flash, triggerFlash };
}
const LIGHT_COUNT = 48;
function EdgeLights({ mode = "idle", color = _themeAccent }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const speed = mode === "idle" ? 150 : 400;
    const iv = setInterval(() => setTick(t => t + 1), speed);
    return () => clearInterval(iv);
  }, [mode]);
  const lights = useMemo(() => {
    const result = [];
    const perSide = Math.floor(LIGHT_COUNT / 4);
    for (let i = 1; i <= perSide; i++) result.push({ x: `${(i / (perSide + 1)) * 100}%`, y: "0%", side: "top" });
    for (let i = 1; i <= perSide; i++) result.push({ x: "100%", y: `${(i / (perSide + 1)) * 100}%`, side: "right" });
    for (let i = perSide; i >= 1; i--) result.push({ x: `${(i / (perSide + 1)) * 100}%`, y: "100%", side: "bottom" });
    for (let i = perSide; i >= 1; i--) result.push({ x: "0%", y: `${(i / (perSide + 1)) * 100}%`, side: "left" });
    return result;
  }, []);
  const megaColors = ["#ef4444","#f97316","#facc15","#22c55e","#3b82f6","#a855f7","#ec4899"];
  return (
    <div style={{ position:"absolute", top:0, left:0, right:0, bottom:0, pointerEvents:"none", zIndex:5 }}>
      {lights.map((l, i) => {
        let opacity, bulbColor, size, glow;
        if (mode === "mega") {
          const on = (i + tick) % 2 === 0;
          bulbColor = megaColors[i % megaColors.length];
          opacity = on ? 1 : 0.15;
          size = on ? 7 : 3;
          glow = on ? `0 0 14px ${bulbColor}` : "none";
        } else if (mode === "big") {
          const on = (i + tick) % 2 === 0;
          bulbColor = "#22c55e";
          opacity = on ? 1 : 0.1;
          size = on ? 7 : 3;
          glow = on ? "0 0 14px #22c55e" : "none";
        } else if (mode === "win") {
          const on = (i + tick) % 2 === 0;
          bulbColor = "#22c55e";
          opacity = on ? 0.9 : 0.08;
          size = on ? 6 : 3;
          glow = on ? "0 0 10px #22c55e" : "none";
        } else if (mode === "loss") {
          const on = (i + tick) % 2 === 0;
          bulbColor = "#e74c3c";
          opacity = on ? 0.85 : 0.08;
          size = on ? 6 : 3;
          glow = on ? "0 0 10px #e74c3c" : "none";
        } else if (mode === "push") {
          const on = (i + tick) % 2 === 0;
          bulbColor = "#f1c40f";
          opacity = on ? 0.8 : 0.08;
          size = on ? 5 : 3;
          glow = on ? "0 0 8px #f1c40f" : "none";
        } else {
          const chasePos = tick % lights.length;
          const dist = Math.min(Math.abs(i - chasePos), lights.length - Math.abs(i - chasePos));
          const isChasing = dist < 3;
          bulbColor = color;
          opacity = isChasing ? 0.7 : 0.15;
          size = isChasing ? 5 : 3;
          glow = isChasing ? `0 0 6px ${color}` : "none";
        }
        return (
          <div key={i} style={{
            position:"absolute",
            left: l.x, top: l.y,
            transform: "translate(-50%, -50%)",
            width: size, height: size,
            borderRadius: "50%",
            background: bulbColor,
            opacity,
            boxShadow: glow,
            transition: mode === "idle" ? "opacity 0.15s, width 0.15s, height 0.15s" : "none",
          }} />
        );
      })}
    </div>
  );
}
function useEdgeLights() {
  const [lightMode, setLightMode] = useState("idle");
  const timerRef = useRef(null);
  const triggerLights = useCallback((mode, duration = 0) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setLightMode(mode);
    if (duration > 0) {
      timerRef.current = setTimeout(() => setLightMode("idle"), duration);
    }
  }, []);
  const clearLights = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    setLightMode("idle");
  }, []);
  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);
  return { lightMode, triggerLights, clearLights };
}
function useWinEffects() {
  const { shaking, shake, shakeIntensity } = useScreenShake();
  const { wins: floatWins, addWin: addFloatWin } = useFloatingWins();
  const { flash, triggerFlash: _triggerFlash } = useWinFlash();
  const { lightMode, triggerLights, clearLights } = useEdgeLights();
  const { coinRainActive, triggerCoins, clearCoins } = useCoinRain();
  const { washType, triggerWash, clearWash } = useScreenColorWash();
  const { confetti, triggerConfetti, clearConfetti } = useConfetti();
  const { eruptionActive, triggerEruption, clearEruption } = useChipEruption();
  const triggerFlash = useCallback(() => {
    _triggerFlash();
    triggerWash("gold");
  }, [_triggerFlash, triggerWash]);
  const [bigWin, _setBigWin] = useState(null);
  const coinTimerRef = useRef(null);
  const dismissAll = useCallback(() => {
    clearWash();
    clearConfetti();
    clearEruption();
    if (coinTimerRef.current) clearTimeout(coinTimerRef.current);
    coinTimerRef.current = setTimeout(() => { clearCoins(); coinTimerRef.current = null; }, 15000);
  }, [clearCoins, clearWash, clearConfetti, clearEruption]);
  const dismissOverlay = useCallback(() => {
    _setBigWin(null);
    dismissAll();
  }, [dismissAll]);
  const setBigWin = useCallback((val) => {
    if (coinTimerRef.current) { clearTimeout(coinTimerRef.current); coinTimerRef.current = null; }
    _setBigWin(val);
    if (val) {
      if (val.type === "epic") {
        triggerCoins("extra_heavy");
        triggerWash("epic");
        triggerConfetti("fireworks");
        triggerEruption();
      } else if (val.type === "mega") {
        triggerCoins("medium");
        triggerWash("mega");
        triggerConfetti("confetti");
        triggerEruption();
      } else if (val.type === "big") {
        triggerCoins("light");
        triggerWash("big");
      }
    }
  }, [triggerCoins, triggerWash, triggerConfetti, triggerEruption]);
  const softCoinRain = useCallback((streak = 0) => {
    if (streak < 3) return;
    triggerCoins("light");
    if (coinTimerRef.current) clearTimeout(coinTimerRef.current);
    coinTimerRef.current = setTimeout(() => { clearCoins(); coinTimerRef.current = null; }, 15000);
  }, [triggerCoins, clearCoins]);
  const celebrateWin = useCallback((amount, bet, opts = {}) => {
    const ratio = bet > 0 ? amount / bet : 0;
    const profit = amount - (opts.isProfit ? 0 : bet);
    addFloatWin(profit > 0 ? profit : amount, {
      bigThreshold: bet * 2,
      megaThreshold: bet * 10,
      ...opts,
    });
    triggerFlash();
    if (ratio >= 20 || amount >= 50000) {
      shake(800, "epic");
      triggerLights("mega", 4000);
      triggerCoins("extra_heavy");
      triggerWash("epic");
      triggerConfetti("fireworks");
      triggerEruption();
      setBigWin({ type: "epic", amount: profit > 0 ? profit : amount });
    } else if (ratio >= 5 || amount >= 10000) {
      shake(600, "heavy");
      triggerLights("mega", 3000);
      triggerCoins("medium");
      triggerWash("mega");
      triggerConfetti("confetti");
      triggerEruption();
      setBigWin({ type: "mega", amount: profit > 0 ? profit : amount });
    } else if (ratio >= 2 || amount >= 1000) {
      shake(400, "normal");
      triggerLights("big", 2500);
      triggerCoins("light");
      triggerWash("big");
      setBigWin({ type: "big", amount: profit > 0 ? profit : amount });
    } else if (ratio >= 1 || amount >= 100) {
      shake(200, "light");
      triggerLights("win", 1500);
      softCoinRain(3);
      triggerWash("gold");
    } else {
      triggerLights("win", 1000);
      softCoinRain(3);
      triggerWash("gold");
    }
  }, [shake, addFloatWin, triggerFlash, triggerLights, triggerCoins, clearCoins, softCoinRain, triggerWash, triggerConfetti, triggerEruption]);
  const shellEffects = {
    shaking,
    shakeIntensity,
    flash,
    coinRain: coinRainActive,
    colorWash: washType,
    confetti,
    eruption: eruptionActive,
    onDismissEffects: dismissOverlay,
  };
  return {
    shaking, shake, shakeIntensity,
    floatWins, addFloatWin,
    flash, triggerFlash,
    lightMode, triggerLights, clearLights,
    coinRainActive, triggerCoins, clearCoins, softCoinRain,
    washType, triggerWash, clearWash,
    confetti, triggerConfetti, clearConfetti,
    eruptionActive, triggerEruption, clearEruption,
    bigWin, setBigWin,
    dismissAll, dismissOverlay,
    celebrateWin,
    shellEffects,
  };
}
const IconAceSpade = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <rect x="4" y="2" width="32" height="36" rx="4" fill="#f5f0e8" stroke="#c8b89a" strokeWidth="1.5"/>
    <path d="M20 8 C20 8 12 16 12 20 C12 24 16 26 20 22 C24 26 28 24 28 20 C28 16 20 8 20 8Z" fill="#1a1a2e"/>
    <path d="M18 22 Q20 28 16 30 L24 30 Q20 28 22 22" fill="#1a1a2e"/>
    <text x="8" y="12" fill="#1a1a2e" fontSize="8" fontWeight="bold" fontFamily="Georgia">A</text>
  </svg>
);
const IconCards = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <rect x="2" y="6" width="22" height="30" rx="3" fill="#f5f0e8" stroke="#c8b89a" strokeWidth="1.2" transform="rotate(-12 13 21)"/>
    <rect x="16" y="6" width="22" height="30" rx="3" fill="#f5f0e8" stroke="#c8b89a" strokeWidth="1.2" transform="rotate(12 27 21)"/>
    <text x="8" y="22" fill="#c0392b" fontSize="12" fontWeight="bold" fontFamily="Georgia" transform="rotate(-12 13 21)">K</text>
    <text x="24" y="22" fill="#1a1a2e" fontSize="12" fontWeight="bold" fontFamily="Georgia" transform="rotate(12 27 21)">A</text>
  </svg>
);
const IconWheel = ({ size = 36 }) => (
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
const IconCherry = ({ size = 36 }) => (
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
const IconPlinko = ({ size = 36 }) => (
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
const IconCrash = ({ size = 36 }) => (
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
const IconHighLow = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <polygon points="20,4 30,18 10,18" fill="#22c55e" opacity="0.9"/>
    <polygon points="20,36 30,22 10,22" fill="#ef4444" opacity="0.9"/>
    <rect x="14" y="16" width="12" height="8" rx="2" fill="#f5f0e8" stroke="#c8b89a" strokeWidth="1"/>
    <text x="20" y="23" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#1a1a2e" fontFamily="Georgia">?</text>
  </svg>
);
const IconDice = ({ size = 36 }) => (
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
const IconCraps = ({ size = 36 }) => (
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
const IconKeno = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <rect x="3" y="3" width="34" height="34" rx="4" fill="#1a1a2e" stroke="#d4af37" strokeWidth="1.2"/>
    {[0,1,2,3,4].map(r => [0,1,2,3,4].map(c => {
      const hit = (r+c)%3===0;
      return <rect key={`${r}-${c}`} x={6+c*6.2} y={6+r*6.2} width="4.5" height="4.5" rx="0.8"
        fill={hit ? "#d4af37" : "rgba(255,255,255,0.1)"} opacity={hit ? 0.9 : 0.5}/>;
    }))}
  </svg>
);
const IconBaccarat = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <rect x="2" y="6" width="16" height="24" rx="3" fill="#f5f0e8" stroke="#c8b89a" strokeWidth="1.2"/>
    <text x="10" y="22" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#1a1a2e" fontFamily="Georgia">9</text>
    <rect x="22" y="10" width="16" height="24" rx="3" fill="#f5f0e8" stroke="#c8b89a" strokeWidth="1.2"/>
    <text x="30" y="26" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#c0392b" fontFamily="Georgia">8</text>
    <text x="20" y="8" textAnchor="middle" fontSize="6" fill="#d4af37" fontFamily="Georgia" fontWeight="bold">VS</text>
  </svg>
);
const IconScratch = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <rect x="4" y="4" width="32" height="32" rx="4" fill="#d4af37" stroke="#b8941e" strokeWidth="1.5"/>
    <rect x="8" y="8" width="24" height="24" rx="2" fill="#8a8070" opacity="0.7"/>
    <path d="M10 14 L18 14 L18 20 L10 20Z" fill="#f5f0e8" opacity="0.9"/>
    <text x="14" y="19" textAnchor="middle" fontSize="7" fill="#22c55e" fontWeight="bold" fontFamily="Georgia">$</text>
    <path d="M20 10 Q28 12 30 20 Q32 28 26 30" stroke="#f5f0e8" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5"/>
    <circle cx="28" cy="12" r="2" fill="#f5f0e8" opacity="0.6"/>
  </svg>
);
const SlotCherry = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <path d="M20 6 Q24 2 27 7 Q25 13 22 17" stroke="#2d8a4e" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
    <path d="M20 6 Q16 2 13 7 Q15 13 18 17" stroke="#2d8a4e" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
    <ellipse cx="24" cy="25" rx="8" ry="9" fill="#dc2626"/><ellipse cx="22" cy="22" rx="2.5" ry="3" fill="rgba(255,255,255,0.25)"/>
    <ellipse cx="14" cy="27" rx="7" ry="8" fill="#b91c1c"/><ellipse cx="12" cy="24" rx="2" ry="2.5" fill="rgba(255,255,255,0.2)"/>
  </svg>
);
const SlotLemon = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <ellipse cx="20" cy="21" rx="12" ry="10" fill="#facc15" transform="rotate(-15 20 21)"/>
    <ellipse cx="20" cy="21" rx="11" ry="9" fill="#fde047" transform="rotate(-15 20 21)"/>
    <path d="M12 18 Q20 15 28 18" stroke="#eab308" strokeWidth="1" fill="none" opacity="0.5"/>
    <ellipse cx="17" cy="19" rx="2" ry="3" fill="rgba(255,255,255,0.2)" transform="rotate(-15 17 19)"/>
    <path d="M30 18 Q33 16 32 14" stroke="#2d8a4e" strokeWidth="2" fill="none" strokeLinecap="round"/>
  </svg>
);
const SlotOrange = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <circle cx="20" cy="22" r="12" fill="#ea580c"/>
    <circle cx="20" cy="22" r="11" fill="#f97316"/>
    <ellipse cx="17" cy="19" rx="3" ry="3.5" fill="rgba(255,255,255,0.2)"/>
    <circle cx="20" cy="22" r="7" fill="none" stroke="#ea580c" strokeWidth="0.5" opacity="0.4"/>
    <path d="M20 10 Q20 7 22 6" stroke="#2d8a4e" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
    <ellipse cx="22" cy="7" rx="3" ry="2" fill="#22c55e" transform="rotate(30 22 7)"/>
  </svg>
);
const SlotGrape = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <path d="M20 4 L20 10" stroke="#2d8a4e" strokeWidth="2" strokeLinecap="round"/>
    <ellipse cx="23" cy="6" rx="4" ry="2.5" fill="#22c55e" transform="rotate(20 23 6)"/>
    {[[20,14],[15,18],[25,18],[12,23],[20,22],[28,23],[15,27],[25,27],[20,30]].map(([x,y],i) => (
      <g key={i}><circle cx={x} cy={y} r="4.2" fill="#7c3aed"/><circle cx={x-1} cy={y-1.5} r="1.2" fill="rgba(255,255,255,0.25)"/></g>
    ))}
  </svg>
);
const SlotBell = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <path d="M10 28 Q10 12 20 8 Q30 12 30 28 Z" fill="#d4af37"/>
    <path d="M12 28 Q12 14 20 10 Q28 14 28 28 Z" fill="#f0d060"/>
    <ellipse cx="18" cy="16" rx="3" ry="4" fill="rgba(255,255,255,0.2)"/>
    <rect x="8" y="27" width="24" height="3" rx="1.5" fill="#d4af37"/>
    <circle cx="20" cy="33" r="3" fill="#b8941e"/>
    <circle cx="20" cy="5" r="2" fill="#d4af37"/>
  </svg>
);
const SlotDiamond = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <polygon points="20,4 34,20 20,36 6,20" fill="#3b82f6"/>
    <polygon points="20,4 27,20 20,36 13,20" fill="#60a5fa"/>
    <polygon points="20,4 27,20 20,20" fill="#93c5fd" opacity="0.6"/>
    <polygon points="20,4 13,20 20,20" fill="#2563eb" opacity="0.4"/>
    <line x1="6" y1="20" x2="34" y2="20" stroke="#1d4ed8" strokeWidth="0.5" opacity="0.5"/>
    <polygon points="20,6 24,18 20,14" fill="rgba(255,255,255,0.25)"/>
  </svg>
);
const SlotSeven = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <text x="20" y="33" textAnchor="middle" fill="url(#sevenGrad)" fontSize="34" fontWeight="900" fontFamily="Georgia" stroke="#8b0000" strokeWidth="1">7</text>
    <text x="20" y="33" textAnchor="middle" fill="url(#sevenGrad)" fontSize="34" fontWeight="900" fontFamily="Georgia">7</text>
    <defs><linearGradient id="sevenGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ff4444"/><stop offset="50%" stopColor="#ff0000"/><stop offset="100%" stopColor="#aa0000"/></linearGradient></defs>
  </svg>
);
const SlotJoker = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <path d="M12 18 Q8 8 14 4 L17 10 L20 2 L23 10 L26 4 Q32 8 28 18" fill="#d4af37"/>
    <circle cx="14" cy="4" r="2.5" fill="#c0392b"/><circle cx="20" cy="2" r="2.5" fill="#3b82f6"/><circle cx="26" cy="4" r="2.5" fill="#22c55e"/>
    <circle cx="20" cy="24" r="10" fill="#f5f0e8" stroke="#d4af37" strokeWidth="1.5"/>
    <circle cx="16" cy="22" r="2" fill="#1a1a2e"/><circle cx="24" cy="22" r="2" fill="#1a1a2e"/>
    <path d="M15 28 Q20 32 25 28" stroke="#c0392b" strokeWidth="2" fill="none" strokeLinecap="round"/>
    <circle cx="14" cy="26" r="2" fill="#ff8888" opacity="0.4"/><circle cx="26" cy="26" r="2" fill="#ff8888" opacity="0.4"/>
  </svg>
);
const SlotScatter = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <polygon points="20,2 24.5,14 37,14 27,22 30.5,35 20,27 9.5,35 13,22 3,14 15.5,14" fill="#f1c40f" stroke="#d4af37" strokeWidth="1.5"/>
    <text x="20" y="22" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#1a1a2e" fontFamily="sans-serif">FREE</text>
  </svg>
);
const SLOT_ICON_MAP = { "cherry":<SlotCherry/>, "lemon":<SlotLemon/>, "orange":<SlotOrange/>, "grape":<SlotGrape/>, "bell":<SlotBell/>, "diamond":<SlotDiamond/>, "seven":<SlotSeven/>, "joker":<SlotJoker/>, "scatter":<SlotScatter/> };
const SLOT_LABEL_MAP = { "cherry":"Cherry", "lemon":"Lemon", "orange":"Orange", "grape":"Grape", "bell":"Bell", "diamond":"Diamond", "seven":"Seven", "joker":"Wild", "scatter":"Scatter" };
function BackButton({ onClick, accent = _themeAccent }) {
  return (
    <button onClick={onClick} className={`back-btn${_isRainbow ? " anim-rainbow" : _isJackpotSkin ? " anim-gold-shimmer" : ""}`} style={{
      position:"absolute", top:16, left:16, background:`${accent}14`,
      border:`1px solid ${accent}33`, color:accent, padding:"7px 16px",
      borderRadius:T.radius, fontSize:12, fontFamily:T.serif,
      letterSpacing:2, textTransform:"uppercase", cursor:"pointer", zIndex:10,
      transition:"all 0.2s",
    }}
      onMouseEnter={e => { e.currentTarget.style.background = `${accent}30`; e.currentTarget.style.borderColor = accent + "66"; }}
      onMouseLeave={e => { e.currentTarget.style.background = `${accent}14`; e.currentTarget.style.borderColor = accent + "33"; }}>
      ← Lobby
    </button>
  );
}
function VipDetailsModal({ vipPoints, stats, onClose, accent = _themeAccent, modalBg, modalBorder }) {
  const achCount = (stats.achievements || []).length;
  const current = getVipTier(vipPoints, achCount);
  const next = getNextVipTier(vipPoints, achCount);
  const progress = next ? ((vipPoints - current.minPoints) / (next.minPoints - current.minPoints)) * 100 : 100;
  const achPoints = (stats.achievements || []).reduce((sum, id) => sum + (ACH_POINTS[id] || 0), 0);
  const wagerPoints = Math.floor((stats.totalWagered || 0) / 10000);
  return (
    <div style={{ position:"fixed", inset:0, zIndex:30000, display:"flex", alignItems:"center", justifyContent:"center",
      background:"rgba(0,0,0,0.7)", backdropFilter:"blur(6px)", animation:"fadeIn 0.2s ease" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: modalBg || "linear-gradient(180deg, #1e1e34, #15152a)", border:`1px solid ${modalBorder || current.border}`,
        borderRadius:T.radiusLg, padding:"20px 22px", maxWidth:380, width:"92%", maxHeight:"85vh", overflowY:"auto",
        boxShadow:`0 24px 64px rgba(0,0,0,0.6), 0 0 30px ${current.color}15`,
        animation:"fadeInScale 0.2s ease" }}>
        {}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <div style={{ fontSize:14, fontWeight:700, letterSpacing:3, color:accent, textTransform:"uppercase",
            fontFamily:T.serif }}>VIP Ranks</div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:T.muted, fontSize:20,
            cursor:"pointer", padding:"0 4px", lineHeight:1, transition:"color 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.color = T.text}
            onMouseLeave={e => e.currentTarget.style.color = T.muted}>×</button>
        </div>
        {}
        <div style={{
          display:"flex", alignItems:"center", gap:12, padding:"12px 14px", marginBottom:14,
          background:`${current.color}12`, border:`1px solid ${current.border}`, borderRadius:10,
        }}>
          <span style={{ fontSize:30 }}>{current.icon}</span>
          <div style={{ flex:1 }}>
            <div style={{
              fontSize:13, fontWeight:800, letterSpacing:3, fontFamily:T.mono,
              color:current.color, textTransform:"uppercase",
            }}>{current.label}</div>
            <div style={{ fontSize:9, color:T.muted, fontFamily:T.mono, marginTop:2 }}>
              {vipPoints.toLocaleString()} VIP points · Rebuy: ${current.rebuy.toLocaleString()}
            </div>
            {next && (
              <div style={{ marginTop:6 }}>
                <div style={{ height:4, borderRadius:2, background:"rgba(255,255,255,0.08)", overflow:"hidden" }}>
                  <div style={{ width:`${progress}%`, height:"100%", borderRadius:2,
                    background:`linear-gradient(90deg, ${current.color}, ${next.color})`, transition:"width 0.5s" }} />
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", marginTop:6, fontSize:8, color:T.dim, fontFamily:T.mono }}>
                  <span>★ {achPoints} from achievements</span>
                  <span>$ {wagerPoints} from wagering</span>
                </div>
                <div style={{ fontSize:8, color:T.dim, fontFamily:T.mono, marginTop:3 }}>
                  {(next.minPoints - vipPoints).toLocaleString()} pts to {next.icon} {next.label}
                </div>
              </div>
            )}
            {!next && (
              <div style={{ fontSize:9, color:current.color, fontFamily:T.mono, marginTop:3, fontWeight:700 }}>
                ★ MAX TIER REACHED ★
              </div>
            )}
          </div>
        </div>
        {}
        <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
          {VIP_TIERS.map((tier, i) => {
            const isCurrent = tier.id === current.id;
            const isUnlocked = tier.requiresAllAchievements
              ? achCount >= ACHIEVEMENTS.length - 3 && vipPoints >= tier.minPoints
              : vipPoints >= tier.minPoints;
            return (
              <div key={tier.id} style={{
                display:"flex", alignItems:"center", gap:10, padding:"8px 10px",
                borderRadius:8, transition:"all 0.2s",
                background: isCurrent ? `${tier.color}15` : "transparent",
                border: isCurrent ? `1px solid ${tier.border}` : "1px solid transparent",
                opacity: isUnlocked ? 1 : 0.45,
              }}>
                <span style={{ fontSize:20, width:28, textAlign:"center",
                  filter: isUnlocked ? "none" : "grayscale(1)" }}>{tier.icon}</span>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <span style={{
                      fontSize:11, fontWeight:700, letterSpacing:2, fontFamily:T.mono,
                      color: isUnlocked ? tier.color : T.dim, textTransform:"uppercase",
                    }}>{tier.label}</span>
                    {isCurrent && (
                      <span style={{ fontSize:7, letterSpacing:1, fontFamily:T.mono,
                        color:tier.color, background:`${tier.color}20`, padding:"1px 5px",
                        borderRadius:4, fontWeight:700 }}>CURRENT</span>
                    )}
                    {isUnlocked && !isCurrent && (
                      <span style={{ fontSize:7, letterSpacing:1, fontFamily:T.mono,
                        color:T.green, fontWeight:600 }}>✓</span>
                    )}
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:1 }}>
                    <span style={{ fontSize:9, color: isUnlocked ? T.muted : T.dim, fontFamily:T.mono }}>
                      {tier.minPoints === 0 ? "Starting rank" : tier.requiresAllAchievements ? `${ACHIEVEMENTS.length - 3}+ of ${ACHIEVEMENTS.length} achievements` : `${tier.minPoints.toLocaleString()} pts`}
                    </span>
                    <span style={{ fontSize:8, color: isUnlocked ? T.green : T.dim, fontFamily:T.mono }}>
                      Rebuy: ${tier.rebuy.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ textAlign:"center", marginTop:14, fontSize:9, color:T.dim,
          fontFamily:T.mono, letterSpacing:1 }}>
          Earn points from achievements + wagering ($10K = 1 pt)
        </div>
      </div>
    </div>
  );
}
function ChipSkinEffect({ effect, accent }) {
  if (!effect) return null;
  const effects = {
    subtleglow: { tier:1, shadow:`0 0 8px ${accent}25, 0 0 16px ${accent}10` },
    mist: { tier:1, shadow:`0 0 10px ${accent}30, 0 0 20px ${accent}12` },
    neonpulse: { tier:2, shadow:`0 0 14px #ff149350, 0 0 28px #00e5ff25, 0 0 40px #bf00ff12` },
    frost: { tier:2, shadow:`0 0 14px ${accent}45, 0 0 28px #e0f0ff20, 0 0 40px ${accent}10` },
    greenflame: { tier:2, shadow:`0 0 16px ${accent}50, 0 0 30px #ff6b3525, 0 0 42px ${accent}12` },
    smoke: { tier:3, shadow:`0 0 24px ${accent}60, 0 0 48px #0f0f2035, 0 0 72px ${accent}18, 0 0 96px ${accent}08` },
    stars: { tier:3, shadow:`0 0 24px ${accent}60, 0 0 48px #1e1b4b35, 0 0 72px ${accent}20, 0 0 96px ${accent}08` },
    radiance: { tier:3, shadow:`0 0 24px ${accent}55, 0 0 48px ${accent}28, 0 0 72px ${accent}14, 0 0 96px ${accent}06` },
    lightning: { tier:4, shadow:`0 0 28px ${accent}75, 0 0 52px ${accent}40, 0 0 80px ${accent}20, 0 0 110px ${accent}08`, fc:accent },
    prismatic: { tier:4, shadow:`0 0 28px rgba(200,180,255,0.55), 0 0 52px rgba(180,200,255,0.3), 0 0 80px rgba(220,180,255,0.15), 0 0 110px rgba(200,180,255,0.06)`, fc:"#c8b0ff" },
    ember: { tier:4, shadow:`0 0 30px ${accent}70, 0 0 56px #ff450040, 0 0 84px #ff000018, 0 0 110px ${accent}06`, fc:"#ff4500" },
    toxic: { tier:4, shadow:`0 0 28px ${accent}65, 0 0 52px #bf00ff30, 0 0 80px ${accent}15, 0 0 110px #bf00ff06`, fc:"#39ff14" },
    royalflame: { tier:4, shadow:`0 0 30px ${accent}75, 0 0 56px #ffd70035, 0 0 84px ${accent}18, 0 0 110px #ffd70008`, fc:"#ff6a00" },
    goldstorm: { tier:5, shadow:`0 0 34px #ffd70080, 0 0 64px #ffaa0045, 0 0 96px #ff880022, 0 0 130px #ffd70010`, fc:"#ffd700" },
    rainbow: { tier:5, shadow:`0 0 34px rgba(255,0,80,0.6), 0 0 56px rgba(0,255,100,0.4), 0 0 80px rgba(0,150,255,0.3), 0 0 108px rgba(255,255,0,0.2), 0 0 140px rgba(255,0,255,0.12)`, fc:"#ffffff" },
  };
  const fx = effects[effect];
  if (effect === "divineaureole") {
    return (
      <>
        {}
        <div style={{ position:"absolute", inset:-14, borderRadius:26, pointerEvents:"none", zIndex:0,
          background:`radial-gradient(ellipse at center, rgba(255,215,0,0.25) 0%, rgba(255,180,0,0.1) 40%, rgba(184,154,0,0.04) 70%, transparent 100%)`,
          animation:"divineBreathOuter 4s ease-in-out infinite" }} />
        {}
        <div style={{ position:"absolute", inset:-6, borderRadius:18, pointerEvents:"none", zIndex:1,
          boxShadow:"0 0 20px rgba(255,215,0,0.5), 0 0 40px rgba(255,200,0,0.25), 0 0 60px rgba(255,215,0,0.1)",
          animation:"divineBreath 3s ease-in-out infinite",
          filter:"drop-shadow(0 0 8px rgba(255,248,200,0.4))" }} />
        {}
        <div style={{ position:"absolute", inset:-10, borderRadius:22, pointerEvents:"none", zIndex:0,
          border:"1px solid rgba(255,215,0,0.12)",
          boxShadow:"0 0 16px rgba(255,215,0,0.12), inset 0 0 12px rgba(255,215,0,0.06)",
          animation:"divineRingPulse 3.5s ease-in-out 0.5s infinite" }} />
        {}
        <div style={{ position:"absolute", inset:-20, pointerEvents:"none", zIndex:0,
          background:`radial-gradient(ellipse at 30% 40%, rgba(255,215,0,0.08) 0%, transparent 60%)`,
          animation:"divineWispA 5s ease-out infinite" }} />
        <div style={{ position:"absolute", inset:-18, pointerEvents:"none", zIndex:0,
          background:`radial-gradient(ellipse at 70% 60%, rgba(255,230,100,0.06) 0%, transparent 55%)`,
          animation:"divineWispB 6s ease-out 1.5s infinite" }} />
        <div style={{ position:"absolute", inset:-22, pointerEvents:"none", zIndex:0,
          background:`radial-gradient(ellipse at 50% 30%, rgba(255,248,200,0.05) 0%, transparent 50%)`,
          animation:"divineWispA 7s ease-out 3s infinite" }} />
      </>
    );
  }
  if (!fx) return null;
  const t = fx.tier;
  const pulseSpeed = t <= 1 ? 4 : t === 2 ? 2.5 : t === 3 ? 1.8 : t === 4 ? 1.2 : 0.8;
  const mainAnim = t <= 1 ? `chipFxFloat ${pulseSpeed}s ease-in-out infinite`
    : t <= 3 ? `chipFxPulse ${pulseSpeed}s ease-in-out infinite`
    : t === 4 ? `chipFxPulse ${pulseSpeed}s ease-in-out infinite`
    : `chipFxPulse ${pulseSpeed}s ease-in-out infinite, chipFxRainbow 2s linear infinite`;
  const mainOpacity = t <= 1 ? 0.55 : t === 2 ? 0.7 : t === 3 ? 0.85 : t === 4 ? 0.95 : 1;
  const mainFilter = t <= 2 ? "none" : t === 3 ? `drop-shadow(0 0 4px ${accent}50)`
    : `drop-shadow(0 0 6px ${fx.fc || accent}80) drop-shadow(0 0 14px ${fx.fc || accent}30)`;
  return (
    <>
      {}
      <div style={{ position:"absolute", inset: t >= 4 ? -8 : -5, borderRadius:16, pointerEvents:"none", zIndex:1,
        animation:mainAnim, boxShadow:fx.shadow, filter:mainFilter, opacity:mainOpacity }} />
      {}
      {t >= 5 && (
        <div style={{ position:"absolute", inset:-14, borderRadius:22, pointerEvents:"none", zIndex:0,
          animation:`chipFxPulse 1.5s ease-in-out infinite`,
          background:`radial-gradient(ellipse at center, transparent 40%, ${fx.fc}06 70%, transparent 100%)`,
          boxShadow:`0 0 28px ${fx.fc}20, 0 0 56px ${fx.fc}10, 0 0 84px ${fx.fc}05`,
          border:`1px solid ${fx.fc}18`,
          opacity:0.5 }} />
      )}
    </>
  );
}
function LightningBolts({ color, intensity = 1 }) {
  const [bolts, setBolts] = useState([]);
  const boltId = useRef(0);
  useEffect(() => {
    const spawnRate = intensity >= 2 ? 1200 : 2000;
    const maxBolts = intensity >= 2 ? 2 : 1;
    const isTier5 = intensity >= 2;
    const spawn = () => {
      const id = boltId.current++;
      const isStretch = isTier5 && Math.random() < 0.25;
      const startSide = Math.random();
      let sx, sy;
      if (startSide < 0.25) { sx = Math.random() * 100; sy = 0; }
      else if (startSide < 0.5) { sx = 100; sy = Math.random() * 100; }
      else if (startSide < 0.75) { sx = Math.random() * 100; sy = 100; }
      else { sx = 0; sy = Math.random() * 100; }
      let tx, ty;
      if (isStretch) {
        if (startSide < 0.25) { tx = Math.random() * 100; ty = 100; }
        else if (startSide < 0.5) { tx = 0; ty = Math.random() * 100; }
        else if (startSide < 0.75) { tx = Math.random() * 100; ty = 0; }
        else { tx = 100; ty = Math.random() * 100; }
      } else {
        tx = 35 + Math.random() * 30;
        ty = 30 + Math.random() * 40;
      }
      const segments = isStretch ? (6 + Math.floor(Math.random() * 4)) : (4 + Math.floor(Math.random() * 4));
      let path = `M${sx.toFixed(1)},${sy.toFixed(1)}`;
      const points = [[sx, sy]];
      for (let i = 1; i <= segments; i++) {
        const progress = i / segments;
        const baseX = sx + (tx - sx) * progress;
        const baseY = sy + (ty - sy) * progress;
        const jagMag = Math.sin(progress * Math.PI) * (10 + Math.random() * 15);
        const jagAngle = (Math.random() - 0.5) * 2;
        const px = baseX + jagAngle * jagMag;
        const py = baseY + (Math.random() - 0.5) * jagMag * 0.5;
        path += ` L${px.toFixed(1)},${py.toFixed(1)}`;
        points.push([px, py]);
      }
      const filaments = [];
      for (let i = 1; i < points.length - 1; i++) {
        if (Math.random() < 0.6) {
          const [px, py] = points[i];
          const angle = Math.random() * Math.PI * 2;
          const len = 4 + Math.random() * 8;
          const mx = px + Math.cos(angle) * len * 0.5 + (Math.random() - 0.5) * 3;
          const my = py + Math.sin(angle) * len * 0.5 + (Math.random() - 0.5) * 3;
          const ex = px + Math.cos(angle) * len;
          const ey = py + Math.sin(angle) * len;
          filaments.push(`M${px.toFixed(1)},${py.toFixed(1)} L${mx.toFixed(1)},${my.toFixed(1)} L${ex.toFixed(1)},${ey.toFixed(1)}`);
        }
      }
      let fork = null;
      if (isTier5 && Math.random() > 0.4) {
        const forkIdx = 1 + Math.floor(Math.random() * (points.length - 2));
        const [fbx, fby] = points[forkIdx];
        const fex = fbx + (Math.random() - 0.5) * 40;
        const fey = fby + (Math.random() - 0.5) * 30;
        fork = `M${fbx.toFixed(1)},${fby.toFixed(1)} L${((fbx + fex) / 2 + (Math.random() - 0.5) * 10).toFixed(1)},${((fby + fey) / 2 + (Math.random() - 0.5) * 8).toFixed(1)} L${fex.toFixed(1)},${fey.toFixed(1)}`;
      }
      const lifetime = 100 + Math.random() * 120;
      setBolts(prev => {
        const next = [...prev, { id, path, fork, filaments, isStretch, lifetime }];
        return next.length > maxBolts ? next.slice(-maxBolts) : next;
      });
      setTimeout(() => {
        setBolts(prev => prev.filter(b => b.id !== id));
      }, lifetime);
    };
    spawn();
    const interval = setInterval(() => {
      if (Math.random() < 0.7) spawn();
    }, spawnRate);
    return () => clearInterval(interval);
  }, [intensity]);
  if (bolts.length === 0) return null;
  const outerW = intensity >= 2 ? 1.6 : 0.8;
  const coreW = intensity >= 2 ? 0.6 : 0.3;
  const tintW = intensity >= 2 ? 0.35 : 0.15;
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none"
      style={{ position:"absolute", inset:0, width:"100%", height:"100%",
        pointerEvents:"none", zIndex:4, overflow:"visible" }}>
      <defs>
        <filter id="boltGlow">
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      {bolts.map(b => (
        <g key={b.id} filter="url(#boltGlow)" style={{ animation:`chipFxFlicker 0.05s steps(2) 1` }}>
          {}
          <path d={b.path} fill="none" stroke={color} strokeWidth={b.isStretch ? outerW * 1.4 : outerW} opacity={0.3}
            strokeLinecap="round" strokeLinejoin="round" />
          {}
          <path d={b.path} fill="none" stroke="#ffffff" strokeWidth={b.isStretch ? coreW * 1.3 : coreW} opacity={0.9}
            strokeLinecap="round" strokeLinejoin="round" />
          {}
          <path d={b.path} fill="none" stroke={color} strokeWidth={tintW} opacity={0.7}
            strokeLinecap="round" strokeLinejoin="round" />
          {}
          {b.filaments && b.filaments.map((f, fi) => (
            <path key={fi} d={f} fill="none" stroke={color} strokeWidth={intensity >= 2 ? 0.3 : 0.15} opacity={intensity >= 2 ? 0.4 : 0.3}
              strokeLinecap="round" strokeLinejoin="round" />
          ))}
          {}
          {b.fork && (
            <>
              <path d={b.fork} fill="none" stroke={color} strokeWidth={outerW * 0.7} opacity={0.25}
                strokeLinecap="round" strokeLinejoin="round" />
              <path d={b.fork} fill="none" stroke="#ffffff" strokeWidth={coreW * 0.6} opacity={0.7}
                strokeLinecap="round" strokeLinejoin="round" />
            </>
          )}
        </g>
      ))}
    </svg>
  );
}
function ChipSkinModal({ stats, chips, vipTierId, currentSkin, onSelect, onClose, activeTheme }) {
  const at = activeTheme || getActiveTheme("house");
  const categories = [
    { label:"Standard", skins: CHIP_SKINS.filter(s => s.type === "default" || (s.type === "achievement" && !INSANE_ACHS.includes(s.req)) || s.type === "stat") },
    { label:"Insane", skins: CHIP_SKINS.filter(s => s.type === "achievement" && INSANE_ACHS.includes(s.req)) },
    { label:"VIP", skins: CHIP_SKINS.filter(s => s.type === "vip") },
    { label:"Secret", skins: CHIP_SKINS.filter(s => s.type === "secret") },
  ];
  return (
    <div style={{ position:"fixed", inset:0, zIndex:30000, display:"flex", alignItems:"center", justifyContent:"center",
      background:"rgba(0,0,0,0.75)", backdropFilter:"blur(6px)", animation:"fadeIn 0.2s ease" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background:at.modalBg, border:`1px solid ${at.modalBorder}`,
        borderRadius:16, padding:"20px 18px", maxWidth:420, width:"92%", maxHeight:"85vh", overflowY:"auto",
        boxShadow:`0 24px 64px rgba(0,0,0,0.6), 0 0 30px ${at.accent}08`, animation:"fadeInScale 0.2s ease" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <div style={{ fontSize:14, fontWeight:700, letterSpacing:3, color:at.accent, textTransform:"uppercase",
            fontFamily:T.serif }}>Theme Collection</div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:T.muted, fontSize:20,
            cursor:"pointer", lineHeight:1 }}>×</button>
        </div>
        {categories.map(cat => {
          if (cat.skins.length === 0) return null;
          return (
            <div key={cat.label} style={{ marginBottom:16 }}>
              <div style={{ fontSize:9, fontWeight:700, letterSpacing:2, textTransform:"uppercase",
                color:T.dim, fontFamily:T.mono, marginBottom:8 }}>{cat.label}</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                {cat.skins.map(skin => {
                  const unlocked = isSkinUnlocked(skin, stats, chips, vipTierId);
                  const selected = currentSkin === skin.id;
                  const isSecret = skin.type === "secret" && !unlocked;
                  return (
                    <button key={skin.id} onClick={() => unlocked && onSelect(skin.id)}
                      style={{
                        padding:"10px 8px", borderRadius:10, cursor: unlocked ? "pointer" : "not-allowed",
                        background: selected ? `${skin.accent}15` : "rgba(255,255,255,0.02)",
                        border: selected ? `1.5px solid ${skin.accent}60` : "1px solid rgba(255,255,255,0.06)",
                        opacity: unlocked ? 1 : 0.45, transition:"all 0.2s", textAlign:"center",
                        position:"relative", overflow:"hidden",
                      }}>
                      {}
                      {unlocked && SKIN_THEMES[skin.id]?.bgGradient && SKIN_THEMES[skin.id].bgGradient !== "d" && (
                        <div style={{ position:"absolute", inset:0, borderRadius:10,
                          background:SKIN_THEMES[skin.id].bgGradient, opacity:0.5, pointerEvents:"none" }} />
                      )}
                      {}
                      <div style={{ display:"flex", justifyContent:"center", gap:2, marginBottom:6, position:"relative" }}>
                        {skin.effect && unlocked && <ChipSkinEffect effect={skin.effect} accent={skin.accent} />}
                        {skin.colors.slice(0, 3).map((c, i) => (
                          <svg key={i} width={20} height={20} viewBox="0 0 20 20">
                            <ellipse cx={10} cy={11} rx={8} ry={3} fill={unlocked ? c.rim : "#333"} />
                            <ellipse cx={10} cy={10} rx={8} ry={3} fill={unlocked ? c.fill : "#444"} />
                            <ellipse cx={10} cy={10} rx={5} ry={1.8} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={0.4} />
                          </svg>
                        ))}
                      </div>
                      <div style={{ fontSize:10, fontWeight:700, color: unlocked ? (selected ? skin.accent : T.text) : T.dim,
                        fontFamily:T.serif, letterSpacing:0.5, marginBottom:2 }}>
                        {isSecret ? "???" : skin.icon + " " + skin.name}
                      </div>
                      <div style={{ fontSize:8, color: unlocked ? T.muted : T.dim, fontFamily:T.mono }}>
                        {unlocked ? (selected ? "✓ EQUIPPED" : "Tap to equip") : (isSecret ? "Hidden unlock" : skin.desc)}
                      </div>
                      {selected && <div style={{ position:"absolute", top:4, right:6, fontSize:8, fontWeight:700,
                        color:skin.accent, fontFamily:T.mono }}>✓</div>}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
        <div style={{ textAlign:"center", marginTop:10, fontSize:9, color:T.dim,
          fontFamily:T.mono, letterSpacing:1 }}>
          {getUnlockedSkins(stats, chips, vipTierId).length} / {CHIP_SKINS.length} unlocked
        </div>
      </div>
    </div>
  );
}
function PokerChipIcon({ size = 22, color = _themeAccent, skinId }) {
  const skin = skinId ? getChipSkin(skinId) : null;
  const chipFill = skin && skin.colors?.[0] ? skin.colors[0].fill : color;
  const chipRim = skin && skin.colors?.[0] ? skin.colors[0].rim : null;
  const c = chipFill;
  const dark = chipRim || `${c}88`;
  const light = "#fff";
  const edgeLight = "rgba(255,255,255,0.85)";
  const uid = c.replace('#','') + (skinId||'');
  return (
    <svg width={size} height={size} viewBox="0 0 36 36">
      <defs>
        <radialGradient id={`cg_${uid}`} cx="45%" cy="40%" r="55%">
          <stop offset="0%" stopColor={light} stopOpacity="0.3" />
          <stop offset="50%" stopColor={c} />
          <stop offset="100%" stopColor={dark} />
        </radialGradient>
      </defs>
      <ellipse cx={18} cy={19.5} rx={15} ry={14.5} fill="rgba(0,0,0,0.3)" />
      <circle cx={18} cy={18} r={15} fill={`url(#cg_${uid})`} />
      {Array.from({length:12}, (_, i) => {
        const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
        const x1 = 18 + Math.cos(a) * 12.2, y1 = 18 + Math.sin(a) * 12.2;
        const x2 = 18 + Math.cos(a) * 15, y2 = 18 + Math.sin(a) * 15;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={edgeLight} strokeWidth={2} strokeLinecap="round" opacity={i % 2 === 0 ? 0.9 : 0.5} />;
      })}
      <circle cx={18} cy={18} r={11.5} fill="none" stroke={dark} strokeWidth={0.8} opacity={0.5} />
      <circle cx={18} cy={18} r={10.5} fill={c} opacity={0.3} />
      <circle cx={18} cy={18} r={7} fill={c} />
      <circle cx={18} cy={18} r={7} fill="none" stroke={light} strokeWidth={0.5} opacity={0.35} />
      <circle cx={18} cy={18} r={5.2} fill="none" stroke={light} strokeWidth={0.3} opacity={0.2} />
      <text x={18} y={22} textAnchor="middle" fontSize={11} fontWeight="900" fontFamily="Georgia, serif" fill={light} opacity={0.95}>$</text>
      {}
      <ellipse cx={14.5} cy={12} rx={6} ry={3.5} fill="rgba(255,255,255,0.18)" transform="rotate(-15 14.5 12)" />
      {}
      <path d="M 8 24 A 15 15 0 0 0 28 24" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={1.5} />
    </svg>
  );
}
function BankrollDisplay({ chips, animated, winStreak = 0, vipPoints = 0, achCount = 0, skipOverlays = false, onInlineRebuy, accent = _themeAccent, skinId = "house", activePowerUps = [] }) {
  const [lastDelta, setLastDelta] = useState(null);
  const [deltaVisible, setDeltaVisible] = useState(false);
  const [showVipDetails, setShowVipDetails] = useState(false);
  const [glowing, setGlowing] = useState(false);
  const prevChips = useRef(chips);
  const timerRef = useRef(null);
  const tier = getVipTier(vipPoints, achCount);
  useEffect(() => {
    const diff = chips - prevChips.current;
    prevChips.current = chips;
    if (diff === 0) return;
    setLastDelta(diff);
    setDeltaVisible(true);
    if (diff > 0) {
      setGlowing(true);
      setTimeout(() => setGlowing(false), 1000);
    }
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setDeltaVisible(false), 1800);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [chips]);
  return (
    <div style={{
      position:"absolute", top:16, right:16, textAlign:"right", fontFamily:T.mono, zIndex:10,
      padding:"6px 10px", borderRadius:12,
      background: glowing ? `${accent}10` : "transparent",
      boxShadow: glowing ? `0 0 20px ${accent}35, 0 0 40px ${accent}12` : "none",
      transition: "background 0.4s, box-shadow 0.4s",
    }}>
      {winStreak >= 2 && (
        <div style={{ display:"flex", justifyContent:"flex-end", alignItems:"center", gap:5, marginBottom:3 }}>
          <StreakIndicator streak={winStreak} />
          <div onClick={() => setShowVipDetails(true)} style={{
            cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
            width:22, height:22, borderRadius:11, border:"1px solid " + tier.color + "44",
            background:tier.color + "10", transition:"all 0.2s",
          }}>
            <span style={{ fontSize:12, lineHeight:1 }}>{tier.icon}</span>
          </div>
        </div>
      )}
      {(winStreak < 2) && (
        <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:3 }}>
          <div onClick={() => setShowVipDetails(true)} style={{
            cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
            width:22, height:22, borderRadius:11, border:"1px solid " + tier.color + "44",
            background:tier.color + "10", transition:"all 0.2s",
          }}>
            <span style={{ fontSize:12, lineHeight:1 }}>{tier.icon}</span>
          </div>
        </div>
      )}
      <div className={`bankroll-chips${_isRainbow ? " anim-rainbow" : _isJackpotSkin ? " anim-gold-shimmer" : ""}`} style={{
        fontSize:22, fontWeight:600, transition:"color 0.4s, text-shadow 0.4s",
        color: chips > 500 ? accent : chips > 100 ? "#e8a735" : T.red,
        textShadow: glowing ? `0 0 12px ${accent}60` : "none",
        display:"flex", alignItems:"center", justifyContent:"flex-end", gap:4,
      }}>
        <div style={{ position:"relative", display:"inline-flex", alignItems:"center", justifyContent:"center", overflow:"visible", width:24, height:24, flexShrink:0, zIndex:1 }}>
          {getChipSkin(skinId).effect && <ChipSkinEffect effect={getChipSkin(skinId).effect} accent={accent} />}
          <PokerChipIcon size={24} skinId={skinId} activePowerUps={activePowerUps} color={accent} />
        </div>
        {animated ? <AnimatedChips chips={chips} /> : `$${chips.toLocaleString()}`}
        {chips <= 0 && skipOverlays && onInlineRebuy && (
          <button onClick={onInlineRebuy} style={{
            marginLeft:6, padding:"3px 10px", borderRadius:6, fontSize:10, fontWeight:700,
            fontFamily:T.mono, letterSpacing:1, textTransform:"uppercase",
            background:`${accent}25`, border:`1px solid ${accent}66`, color:accent,
            cursor:"pointer", animation:"pulse 1.5s infinite",
          }}>Rebuy</button>
        )}
      </div>
      {lastDelta != null && lastDelta !== 0 && (
        <div style={{
          fontSize:11, fontWeight:600, letterSpacing:0.5, marginTop:1,
          color: lastDelta > 0 ? T.green : T.red,
          opacity: deltaVisible ? 1 : 0,
          transition: deltaVisible ? "opacity 0.1s ease" : "opacity 0.6s ease 0.4s",
        }}>
          {lastDelta > 0 ? "+" : "\u2212"}${Math.abs(lastDelta).toLocaleString()}
        </div>
      )}
      {showVipDetails && <VipDetailsModal vipPoints={vipPoints} stats={{achievements:[], totalWagered:0}} onClose={() => setShowVipDetails(false)} accent={accent} />}
    </div>
  );
}
function GameShell({ bg, title, chips, onBack, children, shaking, shakeIntensity = "normal", flash, lossFlash, rules, startChips, onKeyAction, winStreak = 0, vipPoints = 0, achCount = 0, nearMiss = null, coinRain = null, colorWash = null, confetti = null, eruption = false, onDismissEffects = null, skipOverlays = false, skipEffects = false, onRebuy, theme = "dark", skinTheme, skinId = "house", activePowerUps = [], sessionDetail = null }) {
  const st = skinTheme || getActiveTheme("house");
  const sessionProfit = chips - (startChips || chips);
  const [showRules, setShowRules] = useState(false);
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") { if (showRules) setShowRules(false); else onBack(); }
      if (showRules) return;
      if (onKeyAction) onKeyAction(e.key, e);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onBack, onKeyAction, showRules]);
  const shakeAnim = shaking
    ? shakeIntensity === "epic" ? "epicShake 0.8s ease-out"
    : shakeIntensity === "heavy" ? "screenShake 0.5s ease-out"
    : shakeIntensity === "light" ? "lossShake 0.3s ease-out"
    : "screenShake 0.4s ease-out"
    : "none";
  const glowShadow = flash
    ? `inset 0 0 80px ${st.accent}60, inset 0 0 120px ${st.accent}18`
    : lossFlash
    ? "inset 0 0 40px rgba(231,76,60,0.2)"
    : "none";
  return (
    <>
    {}
    {!skipEffects && coinRain && <CoinRain intensity={coinRain} />}
    {!skipEffects && colorWash && <ScreenColorWash type={colorWash} onDismiss={onDismissEffects} />}
    {!skipEffects && confetti && <ConfettiCanvas type={confetti.type} key={confetti.key} />}
    {!skipEffects && eruption && <ChipEruption count={16} />}
    <div style={{
      minHeight:"100vh",
      background: theme === "light"
        ? "radial-gradient(ellipse at center, #f0ebe0 0%, #e5ddd0 60%, #d8d0c0 100%)"
        : bg,
      display:"flex", flexDirection:"column", alignItems:"center",
      fontFamily:T.serif, color: theme === "light" ? "#2a1c12" : T.text, position:"relative", overflow:"hidden",
      boxShadow: skipEffects ? "none" : glowShadow,
      transition: "box-shadow 0.4s ease",
    }}>
      {}
      {theme !== "light" && st.accent !== "#d4af37" && (
        <div style={{ position:"absolute", inset:0, pointerEvents:"none", zIndex:0,
          background:`radial-gradient(ellipse at 50% 40%, transparent 30%, ${st.accent}0a 55%, ${st.accent}14 75%, ${st.accent}1e 100%)` }} />
      )}
      {}
      {shaking && !skipEffects && (
        <div style={{
          position:"fixed", inset:0, zIndex:9998, pointerEvents:"none",
          animation: shakeAnim,
          background:"transparent",
        }}>
          {}
          <div style={{ position:"absolute", inset:0,
            boxShadow: shakeIntensity === "epic" ? "inset 0 0 60px rgba(255,69,0,0.15)"
              : shakeIntensity === "heavy" ? `inset 0 0 40px ${st.accent}20`
              : "none",
          }} />
        </div>
      )}
      <BackButton onClick={onBack} accent={st.accent} />
      <BankrollDisplay chips={chips} animated
        winStreak={winStreak} vipPoints={vipPoints} achCount={achCount}
        skipOverlays={skipOverlays} onInlineRebuy={onRebuy} accent={st.accent} skinId={skinId} activePowerUps={activePowerUps} />
      {}
      {activePowerUps.length > 0 && (
        <div style={{ position:"absolute", top:52, left:6, zIndex:10, display:"flex", flexDirection:"column", gap:3,
          animation:"fadeIn 0.3s ease" }}>
          <div style={{ fontSize:7, fontFamily:T.mono, letterSpacing:2, color:T.dim, textTransform:"uppercase",
            padding:"0 2px", marginBottom:1 }}>ACTIVE</div>
          {activePowerUps.map((apu, i) => {
            const rarityCol = RARITY_COLORS[apu.item?.rarity] || st.accent;
            const remaining = apu.remaining != null ? apu.remaining : 0;
            const unitLabel = apu.item?.effect?.wins ? "wins" : apu.item?.effect?.bets ? "bets" : "uses";
            const maxUses = apu.item?.effect?.wins || apu.item?.effect?.bets || apu.item?.effect?.uses || 1;
            const pct = Math.max(0, Math.min(100, (remaining / maxUses) * 100));
            return (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:6, padding:"4px 8px 4px 5px",
                borderRadius:7, background:"rgba(8,6,4,0.8)", backdropFilter:"blur(6px)",
                border:`1px solid ${rarityCol}25`, whiteSpace:"nowrap", position:"relative", overflow:"hidden",
                minWidth:90 }}>
                {}
                <div style={{ position:"absolute", left:0, top:0, bottom:0, width:`${pct}%`,
                  background:`${rarityCol}0a`, transition:"width 0.3s" }} />
                {}
                <div style={{ position:"absolute", left:0, top:0, bottom:0, width:2, background:rarityCol, opacity:0.6 }} />
                {}
                <span style={{ fontSize:12, width:16, textAlign:"center", color:rarityCol, zIndex:1 }}>{apu.item?.icon}</span>
                {}
                <div style={{ flex:1, zIndex:1 }}>
                  <div style={{ fontSize:8, fontFamily:T.mono, fontWeight:700, color:T.text, letterSpacing:0.5 }}>
                    {apu.item?.tier}
                  </div>
                  <div style={{ fontSize:7, fontFamily:T.mono, color:T.dim }}>
                    {remaining} {unitLabel}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {}
      <div className="game-shell-spacer" style={{ width:"100%", minHeight:72 }} />
      <div className="game-content" style={{ padding:"6px 24px 0", textAlign:"center", zIndex:1, position:"relative" }}>
        {}
        {st.tableFelt && theme !== "light" && (
          <div style={{ position:"absolute", inset:-40, pointerEvents:"none", zIndex:0,
            background:`radial-gradient(ellipse at 50% 40%, ${st.tableFelt}55 0%, ${st.tableFelt}25 50%, transparent 80%)` }} />
        )}
        <div className={`game-shell-title${_isRainbow ? " anim-rainbow" : _isJackpotSkin ? " anim-gold-shimmer" : ""}`} style={{ fontSize:17, fontWeight:700, letterSpacing:5, textTransform:"uppercase",
          ...(_isJackpotSkin ? {
            background:"linear-gradient(90deg, #b89a00, #ffd700, #fff8dc, #ffd700, #ffe87c, #ffd700, #b89a00)",
            backgroundSize:"400% auto", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", color:"transparent",
            textShadow:"none"
          } : { color:st.accent, textShadow:`0 2px 12px ${st.accent}30` })
        }}>{title}</div>
      </div>
      {nearMiss && <NearMissFlash message={nearMiss} />}
      <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", width:"100%" }}>
        {children}
      </div>
      {}
      <div style={{ width:"100%", padding:"8px 16px 10px", display:"flex", flexDirection:"column", alignItems:"center",
        gap:6, borderTop:`1px solid ${st.accent}10`, marginTop:8, zIndex:1 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ fontSize:9, letterSpacing:2, textTransform:"uppercase", color:T.dim, fontFamily:T.mono }}>Session</span>
          <span style={{ fontSize:13, fontWeight:700, fontFamily:T.mono,
            color: sessionProfit > 0 ? "#22c55e" : sessionProfit < 0 ? "#ef4444" : T.muted }}>
            {sessionProfit >= 0 ? "+" : ""}${sessionProfit.toLocaleString()}
          </span>
        </div>
        {sessionDetail}
      </div>
    </div>
    {rules && (
      <button onClick={() => setShowRules(true)} className="rules-btn" style={{
        position:"fixed", bottom:16, right:16, zIndex:15000,
        width:36, height:36, borderRadius:"50%", cursor:"pointer",
        background:"rgba(14,10,8,0.9)", border:`1px solid ${st.accent}55`,
        color:st.accent, fontSize:17, fontWeight:700, fontFamily:"Georgia",
        display:"flex", alignItems:"center", justifyContent:"center",
        transition:"all 0.2s", boxShadow:"0 2px 12px rgba(0,0,0,0.4)",
      }}
        onMouseEnter={e => { e.currentTarget.style.background=`${st.accent}35`; e.currentTarget.style.transform="scale(1.1)"; }}
        onMouseLeave={e => { e.currentTarget.style.background="rgba(26,26,46,0.9)"; e.currentTarget.style.transform="scale(1)"; }}>
        ?
      </button>
    )}
    {showRules && (
      <div style={{ position:"fixed", inset:0, zIndex:20000, display:"flex", alignItems:"center", justifyContent:"center",
        background:"rgba(0,0,0,0.75)", backdropFilter:"blur(6px)", animation:"fadeIn 0.2s ease" }}
        onClick={(e) => { if (e.target === e.currentTarget) setShowRules(false); }}>
        <div style={{ background:st.tier >= 3 ? st.modalBg : "linear-gradient(180deg, #1e1e34, #15152a)", border:`1px solid ${st.accent}33`,
          borderRadius:T.radiusLg, padding:24, maxWidth:400, width:"92%", maxHeight:"80vh", overflowY:"auto",
          boxShadow:"0 24px 64px rgba(0,0,0,0.6)", animation:"fadeInScale 0.2s ease" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <div style={{ fontSize:15, fontWeight:700, letterSpacing:3, color:st.accent, textTransform:"uppercase",
              fontFamily:T.serif }}>{title} Rules</div>
            <button onClick={() => setShowRules(false)} style={{
              background:"none", border:"none", color:T.muted, fontSize:20, cursor:"pointer",
              padding:"0 4px", lineHeight:1, transition:"color 0.15s",
            }}
              onMouseEnter={e => e.currentTarget.style.color = T.text}
              onMouseLeave={e => e.currentTarget.style.color = T.muted}>×</button>
          </div>
          <div style={{ fontSize:12, lineHeight:1.8, color:T.textMuted, fontFamily:T.mono, letterSpacing:0.2 }}>
            {rules}
          </div>
        </div>
      </div>
    )}
    </>
  );
}
function GoldButton({ onClick, disabled, children, style: extraStyle = {}, small = false, hint = null, accent = _themeAccent }) {
  const [hover, setHover] = useState(false);
  const [pressed, setPressed] = useState(false);
  const pad = small ? "8px 24px" : "12px 48px";
  const fs = small ? 12 : 15;
  const accentLight = accent + "cc";
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={() => !disabled && setHover(true)}
      onMouseLeave={() => { setHover(false); setPressed(false); }}
      onMouseDown={() => !disabled && setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        padding: pad, fontSize: fs, fontWeight: 700, fontFamily: T.serif,
        letterSpacing: 3, textTransform: "uppercase", position:"relative",
        background: disabled ? "rgba(80,60,40,0.3)"
          : _isJackpotSkin ? `linear-gradient(90deg, ${accent}, #fff8dc, ${accent}, #ffe87c, ${accent})`
          : hover ? `linear-gradient(135deg, ${accentLight} 0%, ${accent}ee 50%, ${accent} 100%)`
          : `linear-gradient(135deg, ${accent} 0%, ${accent}cc 100%)`,
        backgroundSize: _isJackpotSkin ? "300% auto" : "auto",
        color: disabled ? "#554a3a" : "#0e0a08",
        border: disabled ? "1px solid rgba(80,60,40,0.2)" : `1px solid ${accent}50`,
        borderRadius: 8, cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.2s cubic-bezier(0.4,0,0.2,1)",
        boxShadow: disabled ? "none"
          : hover ? `0 6px 24px ${accent}70, 0 0 40px ${accent}25`
          : "0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)",
        transform: pressed ? "scale(0.96) translateY(1px)" : hover ? "translateY(-2px)" : "none",
        ...extraStyle,
      }}
      className={`${small ? "gold-btn gold-btn-small" : "gold-btn"}${_isRainbow ? " anim-rainbow" : ""}${_isJackpotSkin ? " anim-gold-shimmer" : ""}`}
      >{children}{hint && !disabled && <span style={{ position:"absolute", bottom:-14, left:"50%", transform:"translateX(-50%)", fontSize:8, fontFamily:T.mono, color:`${accent}60`, letterSpacing:1, whiteSpace:"nowrap", textTransform:"none", fontWeight:400 }}>{hint}</span>}</button>
  );
}
function BetControls({ bet, setBet, chips, presets = [5,10,25,50,100], accent = _themeAccent }) {
  const dynamicPresets = useMemo(() => {
    if (chips <= 500) return presets.filter(p => p <= chips);
    const targets = [0.01, 0.05, 0.1, 0.25, 0.5];
    return targets.map(pct => {
      const raw = Math.round(chips * pct);
      if (raw >= 1000) return Math.round(raw / 100) * 100;
      if (raw >= 100) return Math.round(raw / 25) * 25;
      if (raw >= 10) return Math.round(raw / 5) * 5;
      return Math.max(1, raw);
    }).filter((v, i, a) => v > 0 && a.indexOf(v) === i);
  }, [chips, presets]);
  const isDynamic = chips > 500;
  const pctLabels = [0.01, 0.05, 0.1, 0.25, 0.5];
  return (
    <div className={_isRainbow ? "anim-rainbow" : _isJackpotSkin ? "anim-gold-shimmer" : ""} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:14, width:"100%" }}>
      <div className="bet-chip-row" style={{ display:"flex", gap:6, flexWrap:"wrap", justifyContent:"center", alignItems:"center" }}>
        <button onClick={() => setBet(Math.max(1, Math.floor(bet / 2)))}
          style={{
            width:36, height:36, borderRadius:"50%",
            border:`1.5px solid ${accent}40`, background:`${accent}0F`,
            color:accent, fontSize:13, fontWeight:700, fontFamily:T.mono,
            cursor:"pointer", transition:"all 0.2s", display:"flex", alignItems:"center", justifyContent:"center",
          }}>½</button>
        {dynamicPresets.map((amount, idx) => (
          <button key={amount} onClick={() => setBet(Math.min(amount, chips))} disabled={amount > chips}
            style={{
              width:48, height:48, borderRadius:"50%", position:"relative",
              border: bet === amount ? `2px solid ${accent}` : `2px solid ${accent}50`,
              background: amount > chips ? "rgba(60,60,60,0.2)" : bet === amount ? `radial-gradient(circle, ${accent} 0%, ${accent}cc 100%)` : `radial-gradient(circle, ${accent}25 0%, ${accent}0d 100%)`,
              color: amount > chips ? "#555" : bet === amount ? "#1a1a2e" : accent,
              fontSize: amount >= 10000 ? 8 : amount >= 1000 ? 9 : 12, fontWeight:700, fontFamily:T.mono,
              cursor: amount > chips ? "not-allowed" : "pointer", transition:"all 0.2s",
              boxShadow: bet === amount ? `0 0 12px ${accent}60` : "none",
            }}>{amount >= 1000 ? `${(amount/1000).toFixed(amount%1000===0?0:1)}k` : `${amount}`}
            {isDynamic && pctLabels[idx] && <span style={{ position:"absolute", bottom:-10, left:"50%", transform:"translateX(-50%)",
              fontSize:7, color:`${accent}60`, fontFamily:T.mono, whiteSpace:"nowrap" }}>{Math.round(pctLabels[idx]*100)}%</span>}
          </button>
        ))}
        <button onClick={() => setBet(chips)}
          style={{
            height:48, padding:"0 14px", borderRadius:24,
            border: bet === chips ? "2px solid #c0392b" : "2px solid rgba(192,57,43,0.4)",
            background: bet === chips ? "radial-gradient(circle, #c0392b 0%, #962d22 100%)" : "radial-gradient(circle, rgba(192,57,43,0.15) 0%, rgba(192,57,43,0.05) 100%)",
            color: bet === chips ? "#fff" : "#c0392b",
            fontSize:10, fontWeight:700, fontFamily:T.mono,
            cursor:"pointer", transition:"all 0.2s", letterSpacing:1,
            boxShadow: bet === chips ? "0 0 12px rgba(192,57,43,0.4)" : "none",
          }}>ALL IN</button>
        <button onClick={() => setBet(Math.min(chips, bet * 2))}
          style={{
            width:36, height:36, borderRadius:"50%",
            border:`1.5px solid ${accent}40`, background:`${accent}0F`,
            color:accent, fontSize:13, fontWeight:700, fontFamily:T.mono,
            cursor:"pointer", transition:"all 0.2s", display:"flex", alignItems:"center", justifyContent:"center",
          }}>2×</button>
      </div>
      <div style={{ width:"100%", maxWidth:320, padding:"0 8px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:6 }}>
          <span style={{ fontSize:11, letterSpacing:2, textTransform:"uppercase", color:T.muted }}>Wager</span>
          <span style={{ fontFamily:T.mono, fontSize:20, fontWeight:600, color:accent }}>${bet.toLocaleString()}</span>
        </div>
        <input type="range" min={1} max={Math.max(1, chips)} step={chips > 1000 ? Math.max(1, Math.floor(chips/200)) : 1} value={bet} onChange={e => setBet(Number(e.target.value))}
          style={{ width:"100%", height:6, appearance:"none", WebkitAppearance:"none", background:`linear-gradient(to right, ${accent} 0%, ${accent} ${(bet/chips)*100}%, ${accent}35 ${(bet/chips)*100}%, ${accent}35 100%)`, borderRadius:3, outline:"none", cursor:"pointer" }} />
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:3, fontFamily:T.mono, fontSize:10, color:T.dim }}>
          <span>$1</span><span>${chips.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
function Card({ card, hidden = false, index = 0, dealt = true, small = false, flipping = false }) {
  const red = isRed(card?.suit);
  const isMobile = typeof window !== "undefined" && window.innerWidth < 480;
  const w = small ? 60 : isMobile ? 72 : 96;
  const h = small ? 84 : isMobile ? 100 : 134;
  const anim = dealt ? `cardSlideIn 0.4s cubic-bezier(0.22, 0.61, 0.36, 1) ${index * 0.15}s both` : "none";
  const cardBackBg = `linear-gradient(135deg, ${_themeAccent}35 25%, ${_themeAccent}50 25%, ${_themeAccent}50 50%, ${_themeAccent}35 50%, ${_themeAccent}35 75%, ${_themeAccent}50 75%)`;
  const cardBackBorder = `2px solid ${_themeAccent}70`;
  const cardBackInner = `1.5px solid ${_themeAccent}80`;
  const cardBackQColor = `${_themeAccent}90`;
  const textColor2 = card ? (isRed(card.suit) ? "#c0392b" : "#1a1a2e") : "#1a1a2e";
  if (flipping) {
    return (
      <div className="card-deal" style={{ width:w, height:h, perspective:600, animation:anim }}>
        <div style={{ width:"100%", height:"100%", position:"relative", transformStyle:"preserve-3d",
          transition:"transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)", transform:hidden?"rotateY(0deg)":"rotateY(180deg)" }}>
          <div style={{ width:w, height:h, borderRadius:8, position:"absolute", top:0, left:0,
            background:cardBackBg, backgroundSize:"14px 14px", border:cardBackBorder, boxShadow:"2px 3px 8px rgba(0,0,0,0.4)",
            display:"flex", alignItems:"center", justifyContent:"center",
            backfaceVisibility:"hidden", WebkitBackfaceVisibility:"hidden" }}>
            <div style={{ width:w-24, height:h-24, border:cardBackInner, borderRadius:4,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:small?20:28, color:cardBackQColor, fontWeight:"bold" }}>?</div>
          </div>
          {card && <div style={{ width:w, height:h, borderRadius:8, background: _cardTint ? `linear-gradient(135deg, #f5f0e8, ${_cardTint} 50%, #f5f0e8)` : "#f5f0e8",
            border:"1.5px solid #c8b89a", boxShadow:`2px 3px 8px rgba(0,0,0,0.35), 0 0 20px ${_themeAccent}25`,
            display:"flex", flexDirection:"column", padding:small?"3px 5px":"5px 7px",
            position:"absolute", top:0, left:0, fontFamily:"'Georgia', serif", userSelect:"none",
            backfaceVisibility:"hidden", WebkitBackfaceVisibility:"hidden", transform:"rotateY(180deg)" }}>
            {_cardTint && <div style={{ position:"absolute", inset:0, borderRadius:7, background:_cardTint, pointerEvents:"none" }} />}
            <div style={{ fontSize:small?12:17, fontWeight:"bold", color:textColor2, lineHeight:1 }}>{card.rank}</div>
            <div style={{ fontSize:small?10:15, color:textColor2, lineHeight:1, marginTop:1 }}>{card.suit}</div>
            <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", fontSize:small?24:38, color:textColor2, opacity:0.85 }}>{card.suit}</div>
            <div style={{ position:"absolute", bottom:small?3:6, right:small?5:8, fontSize:small?12:17, fontWeight:"bold", color:textColor2, transform:"rotate(180deg)", lineHeight:1 }}>
              {card.rank}<div style={{ fontSize:small?10:15, lineHeight:1, marginTop:1 }}>{card.suit}</div>
            </div>
          </div>}
        </div>
      </div>
    );
  }
  if (hidden) {
    return (
      <div className="card-deal" style={{
        width: w, height: h, borderRadius: 8,
        background: cardBackBg, backgroundSize: "14px 14px", border: cardBackBorder,
        boxShadow: "2px 3px 8px rgba(0,0,0,0.4)",
        display: "flex", alignItems: "center", justifyContent: "center",
        animation: anim,
      }}>
        <div style={{
          width: w - 24, height: h - 24, border: cardBackInner,
          borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: small ? 20 : 28, color: cardBackQColor, fontWeight: "bold",
        }}>?</div>
      </div>
    );
  }
  const textColor = red ? "#c0392b" : "#1a1a2e";
  return (
    <div className="card-deal" style={{
      width: w, height: h, borderRadius: 8, background: _cardTint ? `linear-gradient(135deg, #f5f0e8, ${_cardTint} 50%, #f5f0e8)` : "#f5f0e8",
      border: "1.5px solid #c8b89a", boxShadow: "2px 3px 8px rgba(0,0,0,0.35)",
      display: "flex", flexDirection: "column", padding: small ? "3px 5px" : "5px 7px",
      position: "relative", fontFamily: "'Georgia', serif",
      animation: anim, userSelect: "none",
    }}>
      {}
      {_cardTint && <div style={{ position:"absolute", inset:0, borderRadius:7, background:_cardTint, pointerEvents:"none" }} />}
      <div style={{ fontSize: small ? 12 : 17, fontWeight: "bold", color: textColor, lineHeight: 1 }}>{card.rank}</div>
      <div style={{ fontSize: small ? 10 : 15, color: textColor, lineHeight: 1, marginTop: 1 }}>{card.suit}</div>
      <div style={{
        position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        fontSize: small ? 24 : 38, color: textColor, opacity: 0.85,
      }}>{card.suit}</div>
      <div style={{
        position: "absolute", bottom: small ? 3 : 6, right: small ? 5 : 8,
        fontSize: small ? 12 : 17, fontWeight: "bold", color: textColor,
        transform: "rotate(180deg)", lineHeight: 1,
      }}>
        {card.rank}<div style={{ fontSize: small ? 10 : 15, lineHeight: 1, marginTop: 1 }}>{card.suit}</div>
      </div>
    </div>
  );
}
const GAMES = [
  { id:"blackjack", name:"Blackjack", description:"Beat the dealer to 21", Icon: IconAceSpade, color:"#27ae60", rtp:"99.5%" },
  { id:"poker", name:"Video Poker", description:"Jacks or Better", Icon: IconCards, color:"#3b82f6", rtp:"99.5%" },
  { id:"roulette", name:"Roulette", description:"Spin the wheel", Icon: IconWheel, color:T.red, rtp:"97.3%" },
  { id:"slots", name:"Slots", description:"5-reel video slots", Icon: IconCherry, color:"#a855f7", rtp:"~95%" },
  { id:"plinko", name:"Plinko", description:"Drop the ball", Icon: IconPlinko, color:"#14b8a6", rtp:"98.7%" },
  { id:"crash", name:"Crash", description:"Cash out in time", Icon: IconCrash, color:T.green, rtp:"96%" },
  { id:"highlow", name:"Hi-Lo", description:"Higher or lower?", Icon: IconHighLow, color:"#f59e0b", rtp:"97%" },
  { id:"dice", name:"Dice", description:"Roll the bones", Icon: IconDice, color:"#ec4899", rtp:"97%" },
  { id:"craps", name:"Craps", description:"Pass line action", Icon: IconCraps, color:"#16a34a", rtp:"98.6%" },
  { id:"keno", name:"Keno", description:"Pick your numbers", Icon: IconKeno, color:"#8b5cf6", rtp:"~80%" },
  { id:"baccarat", name:"Baccarat", description:"Closest to 9 wins", Icon: IconBaccarat, color:"#dc2626", rtp:"98.9%" },
  { id:"scratch", name:"Scratch Cards", description:"Scratch to win", Icon: IconScratch, color:"#eab308", rtp:"~76%" },
];
function SessionTracker({ chips, sessionStart, sessionRounds, sessionChipsStart, stats, accent = _themeAccent }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setElapsed(Math.floor((Date.now() - sessionStart) / 1000)), 1000);
    return () => clearInterval(interval);
  }, [sessionStart]);
  const hrs = Math.floor(elapsed / 3600);
  const mins = Math.floor((elapsed % 3600) / 60);
  const secs = elapsed % 60;
  const timeStr = hrs > 0 ? `${hrs}h ${mins}m` : mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  const sessionProfit = chips - sessionChipsStart;
  const profitPerRound = sessionRounds > 0 ? Math.round(sessionProfit / sessionRounds) : 0;
  const profitPerMin = elapsed >= 60 ? Math.round(sessionProfit / (elapsed / 60)) : null;
  const tw = Object.values(stats.winsPerGame || {}).reduce((a, b) => a + b, 0);
  const tl = Object.values(stats.lossesPerGame || {}).reduce((a, b) => a + b, 0);
  const wr = (tw + tl) > 0 ? Math.round(tw / (tw + tl) * 100) : 0;
  const profitColor = sessionProfit > 0 ? "#22c55e" : sessionProfit < 0 ? "#ef4444" : T.muted;
  return (
    <div style={{ marginTop:16, background:"rgba(255,255,255,0.02)", border:`1px solid ${accent}18`,
      borderRadius:12, padding:"14px 16px", overflow:"hidden" }}>
      <div style={{ fontSize:9, letterSpacing:2, textTransform:"uppercase", color:T.dim,
        fontFamily:T.mono, marginBottom:10, textAlign:"center" }}>This Session</div>
      <div className="session-bar" style={{ display:"flex", justifyContent:"space-around", alignItems:"center",
        gap:12, flexWrap:"wrap" }}>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:8, color:T.dim, fontFamily:T.mono, letterSpacing:1 }}>TIME</div>
          <div style={{ fontSize:16, fontWeight:700, fontFamily:T.mono, color:"#3b82f6" }}>{timeStr}</div>
        </div>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:8, color:T.dim, fontFamily:T.mono, letterSpacing:1 }}>ROUNDS</div>
          <div style={{ fontSize:16, fontWeight:700, fontFamily:T.mono, color:"#a855f7" }}>{sessionRounds}</div>
        </div>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:8, color:T.dim, fontFamily:T.mono, letterSpacing:1 }}>SESSION P/L</div>
          <div style={{ fontSize:16, fontWeight:700, fontFamily:T.mono, color:profitColor }}>
            {sessionProfit >= 0 ? "+" : ""}${sessionProfit.toLocaleString()}
          </div>
        </div>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:8, color:T.dim, fontFamily:T.mono, letterSpacing:1 }}>PER ROUND</div>
          <div style={{ fontSize:14, fontWeight:700, fontFamily:T.mono,
            color: profitPerRound > 0 ? "#22c55e" : profitPerRound < 0 ? "#ef4444" : T.muted }}>
            {sessionRounds > 0 ? `${profitPerRound >= 0 ? "+" : ""}$${profitPerRound.toLocaleString()}` : "—"}
          </div>
        </div>
      </div>
      {}
      {sessionRounds > 0 && (
        <div style={{ marginTop:10, display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:8, color:T.dim, fontFamily:T.mono, flexShrink:0 }}>{sessionChipsStart.toLocaleString()}</span>
          <div style={{ flex:1, height:4, borderRadius:2, background:"rgba(255,255,255,0.06)", overflow:"hidden", position:"relative" }}>
            {(() => {
              const range = Math.max(Math.abs(sessionProfit), sessionChipsStart * 0.1);
              const pct = Math.min(100, Math.max(0, ((chips - sessionChipsStart + range) / (range * 2)) * 100));
              return (
                <>
                  <div style={{ position:"absolute", left:"50%", top:0, width:1, height:"100%", background:"rgba(255,255,255,0.15)" }} />
                  <div style={{ position:"absolute", left: sessionProfit >= 0 ? "50%" : `${pct}%`,
                    width: sessionProfit >= 0 ? `${pct - 50}%` : `${50 - pct}%`,
                    height:"100%", borderRadius:2,
                    background: sessionProfit >= 0 ? "linear-gradient(90deg, #22c55e, #4ade80)" : "linear-gradient(90deg, #ef4444, #f87171)",
                    transition:"all 0.5s" }} />
                </>
              );
            })()}
          </div>
          <span style={{ fontSize:8, color:profitColor, fontFamily:T.mono, flexShrink:0 }}>{chips.toLocaleString()}</span>
        </div>
      )}
    </div>
  );
}
function StatCard({ label, value, sub, color = "#d4af37", accent = _themeAccent }) {
  return (
    <div className="stat-card" style={{
      background:"rgba(255,255,255,0.03)", border:`1px solid ${accent}1a`,
      borderRadius:10, padding:"12px 14px", textAlign:"center", minWidth:0,
    }}>
      <div style={{ fontSize:9, letterSpacing:2, textTransform:"uppercase", color:T.dim,
        fontFamily:T.mono, marginBottom:4 }}>{label}</div>
      <div className="stat-value" style={{ fontSize:20, fontWeight:700, fontFamily:T.mono,
        color, lineHeight:1.2 }}>{value}</div>
      {sub && <div style={{ fontSize:9, color:"#4a4030", fontFamily:T.mono, marginTop:3 }}>{sub}</div>}
    </div>
  );
}
function Sparkline({ results, width = 44, height = 14 }) {
  if (!results || results.length < 2) return null;
  const n = results.length;
  const barW = Math.min(3, (width - n + 1) / n);
  const gap = 1;
  const totalW = n * (barW + gap) - gap;
  return (
    <svg width={totalW} height={height} style={{ display:"block" }}>
      {results.map((r, i) => {
        const isWin = r > 0;
        const barH = Math.max(2, Math.min(height, isWin ? Math.min(height, 3 + Math.log10(Math.max(1,r)) * 3) : Math.min(height * 0.6, 3)));
        const y = isWin ? (height / 2) - barH : height / 2;
        return <rect key={i} x={i * (barW + gap)} y={y} width={barW} height={barH} rx={0.5}
          fill={isWin ? "#22c55e" : "#ef4444"} opacity={0.4 + (i / n) * 0.6} />;
      })}
      <line x1={0} y1={height/2} x2={totalW} y2={height/2} stroke="rgba(255,255,255,0.08)" strokeWidth={0.5} />
    </svg>
  );
}
function TitleScreen({ chips, onSelectGame, onRebuy, stats, onResetStats, username, onSignOut, onAdminSetStats, onAdminSetChips, forceJackpot, setForceJackpot, sessionStart, sessionRounds, sessionChipsStart, settings = {}, setSettings }) {
  const [tab, setTab] = useState("games");
  const [featsSubTab, setFeatsSubTab] = useState("stats");
  const [showMysteryOdds, setShowMysteryOdds] = useState(null);
  const [selectedShopItem, setSelectedShopItem] = useState(null);
  const [selectedInvItem, setSelectedInvItem] = useState(null);
  const [seenAchCount, setSeenAchCount] = useState(stats.achievements?.length || 0);
  const vipPoints = calcVipPoints(stats);
  const achCount = (stats.achievements || []).length;
  const vipTier = getVipTier(vipPoints, achCount);
  const [confirmReset, setConfirmReset] = useState(false);
  const [showVipDetails, setShowVipDetails] = useState(false);
  const [showChipSkins, setShowChipSkins] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminAuth, setAdminAuth] = useState(false);
  const [adminPw, setAdminPw] = useState("");
  const [adminPwError, setAdminPwError] = useState(false);
  const [adminChipAdd, setAdminChipAdd] = useState("");
  const [testOverlay, setTestOverlay] = useState(null);
  const [testCoinRain, setTestCoinRain] = useState(null);
  const [testConfetti, setTestConfetti] = useState(null);
  const [testEruption, setTestEruption] = useState(false);
  const [testWash, setTestWash] = useState(null);
  const [testShake, setTestShake] = useState(null);
  const totalGames = Object.values(stats.gamesPlayed).reduce((a,b) => a+b, 0);
  const mostPlayed = Object.entries(stats.gamesPlayed).sort((a,b) => b[1]-a[1])[0];
  const mostPlayedName = mostPlayed && mostPlayed[1] > 0
    ? GAMES.find(g => g.id === mostPlayed[0])?.name || mostPlayed[0]
    : "None yet";
  const isLight = (settings.theme || "dark") === "light";
  const activeTheme = getActiveTheme(settings.chipSkin);
  const isRainbow = settings.chipSkin === "completionist";
  const isJackpotSkin = settings.chipSkin === "jackpot";
  const lobbyBg = isLight
    ? "radial-gradient(ellipse at center, #f0ebe0 0%, #e5ddd0 60%, #d8d0c0 100%)"
    : activeTheme.bgGradient;
  const lobbyText = isLight ? "#2a1c12" : T.text;
  return (
    <div style={{ minHeight:"100vh", height:"100vh", background:lobbyBg, display:"flex", flexDirection:"column",
      fontFamily:T.serif, color:lobbyText, position:"relative", overflow:"hidden" }}>
      {}
      <div style={{ position:"absolute", inset:0, opacity:0.025,
        background:`repeating-linear-gradient(45deg, transparent, transparent 40px, ${activeTheme.accent} 40px, ${activeTheme.accent} 41px)`, pointerEvents:"none" }} />
      <div style={{ position:"absolute", top:"-20%", left:"-10%", width:"120%", height:"140%",
        background:`radial-gradient(ellipse at 25% 15%, ${activeTheme.accent}08 0%, transparent 45%), radial-gradient(ellipse at 75% 85%, ${activeTheme.accentDim}06 0%, transparent 40%)`,
        pointerEvents:"none" }} />
      {}
      {activeTheme.particles && !isLight && <AmbientParticles config={activeTheme.particles} />}
      {}
      {activeTheme.tier >= 3 && !isLight && (
        <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:2,
          background:`radial-gradient(ellipse at center, transparent 40%, ${activeTheme.accent}15 70%, ${activeTheme.accent}28 90%, ${activeTheme.accent}38 100%)` }} />
      )}
      {}
      {isJackpotSkin && !isLight && (
        <div style={{ position:"fixed", top:"15%", left:"50%", transform:"translateX(-50%)", width:"80%", height:"40%",
          pointerEvents:"none", zIndex:1, borderRadius:"50%",
          background:"radial-gradient(ellipse at center, rgba(255,215,0,0.08) 0%, rgba(255,200,0,0.03) 40%, transparent 70%)",
          animation:"goldPulseGlow 5s ease-in-out infinite" }} />
      )}
      {}
      {activeTheme.tier >= 4 && !isLight && (
        <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:3 }}>
          <LightningBolts color={activeTheme.accent} intensity={activeTheme.tier >= 5 ? 2 : 1} />
        </div>
      )}
      {}
      <div className={isRainbow ? "anim-rainbow-border" : ""} style={{ flexShrink:0, zIndex:10, padding:"10px 16px 8px", display:"flex", alignItems:"center", justifyContent:"space-between",
        borderBottom:`1px solid ${activeTheme.accent}15`, background: isJackpotSkin ? "rgba(18,14,4,0.7)" : "rgba(10,8,18,0.5)", backdropFilter:"blur(12px)", WebkitBackdropFilter:"blur(12px)",
        boxShadow: activeTheme.navTint !== "transparent" ? `inset 0 0 40px ${activeTheme.navTint}` : "none", position:"relative", overflow:"hidden" }}>
        {}
        {isJackpotSkin && (
          <div style={{ position:"absolute", top:0, bottom:0, width:"20%", pointerEvents:"none",
            background:"linear-gradient(90deg, transparent, rgba(255,215,0,0.12), rgba(255,248,200,0.18), rgba(255,215,0,0.12), transparent)",
            animation:"goldGlintSweep 4s ease-in-out infinite", zIndex:0 }} />
        )}
        {}
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <h1 key={`title-${settings.chipSkin}`} className={`anim-shimmer-title${settings.chipSkin === "completionist" ? " anim-rainbow" : isJackpotSkin ? " anim-gold-shimmer" : ""}`} style={{ fontSize:18, fontWeight:900, margin:0, letterSpacing:2,
            background: settings.chipSkin === "completionist" ? "linear-gradient(135deg, #ff6ec7 0%, #ff9a3c 20%, #f7e84e 40%, #4cff50 60%, #3cb8ff 80%, #c850f0 100%)"
              : isJackpotSkin ? "linear-gradient(90deg, #b89a00, #ffd700, #fff8dc, #ffd700, #ffe87c, #ffd700, #b89a00)"
              : `linear-gradient(135deg, ${activeTheme.accent} 0%, ${activeTheme.accent}cc 40%, ${activeTheme.accent} 60%, ${activeTheme.accentDim} 100%)`,
            backgroundSize: isJackpotSkin ? "400% auto" : "200% auto", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
            backgroundClip:"text", color:"transparent",
            fontFamily:"'Cormorant Garamond', 'Playfair Display', Georgia, serif",
            animation: isJackpotSkin ? "goldShimmer 4s linear infinite" : "titleReveal 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards" }}>OBSIDIAN LOUNGE</h1>
        </div>
        {}
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div onClick={() => setShowVipDetails(true)} style={{ cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
            width:30, height:30, borderRadius:15, border:"1px solid " + vipTier.border, background:vipTier.color + "10",
            boxShadow:`0 0 8px ${vipTier.color}25`, color:vipTier.color }}>
            <span style={{ fontSize:16, lineHeight:1 }}>{vipTier.icon}</span>
          </div>
          <div onClick={() => setShowChipSkins(true)} style={{ display:"flex", alignItems:"center", gap:6, cursor:"pointer", position:"relative" }}>
            {}
            {isJackpotSkin && (<>
              {}
              <div style={{ position:"absolute", top:-80, bottom:-40, left:"50%", transform:"translateX(-50%)", width:90, pointerEvents:"none", zIndex:0,
                background:"radial-gradient(ellipse at 50% 55%, rgba(255,215,0,0.3) 0%, rgba(255,215,0,0.12) 30%, rgba(255,200,80,0.04) 60%, transparent 80%)",
                animation:"etherealFloat 4s ease-in-out infinite" }} />
              {}
              <div style={{ position:"absolute", top:-60, bottom:-30, left:"50%", transform:"translateX(-50%)", width:30, pointerEvents:"none", zIndex:0,
                background:"linear-gradient(180deg, rgba(255,248,200,0.2) 0%, rgba(255,215,0,0.35) 40%, rgba(255,215,0,0.25) 60%, rgba(255,248,200,0.1) 100%)",
                animation:"goldPulseGlow 3s ease-in-out infinite", filter:"blur(6px)" }} />
            </>)}
            {getChipSkin(settings.chipSkin).effect && <ChipSkinEffect effect={getChipSkin(settings.chipSkin).effect} accent={getChipSkin(settings.chipSkin).accent} />}
            <ChipStackVisual chips={chips} skinId={settings.chipSkin} />
            <div style={{ fontSize:18, fontWeight:700, fontFamily:T.mono,
              color: chips > 500 ? activeTheme.accent : chips > 100 ? "#e8a735" : "#e74c3c" }}>
              <AnimatedChips chips={chips} />
            </div>
          </div>
        </div>
      </div>
      {}
      <div style={{ flex:1, overflow:"hidden", position:"relative", zIndex:1 }}>
        <div key={tab} style={{ position:"absolute", inset:0, overflowY:"auto", overflowX:"hidden",
          padding:"16px 16px 20px", animation:"fadeIn 0.25s ease",
          WebkitOverflowScrolling:"touch" }}>
          <div style={{ maxWidth:580, margin:"0 auto" }}>
        {tab === "games" && (<>
          {}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14, animation:"tabSlideIn 0.3s ease-out" }}>
            <div>
              <div style={{ fontSize:12, color:T.muted, fontFamily:T.mono, letterSpacing:1 }}>
                Welcome, <span style={{ color:activeTheme.accent }}>{username}</span>
              </div>
              {stats.winStreak >= 2 && <StreakIndicator streak={stats.winStreak || 0} />}
            </div>
            <button onClick={onSignOut}
              style={{ fontSize:9, padding:"3px 10px", fontFamily:T.mono, letterSpacing:1,
                background:"transparent", border:"1px solid rgba(255,255,255,0.1)", borderRadius:4,
                color:T.dim, cursor:"pointer", transition:"all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor=activeTheme.accent + "50"; e.currentTarget.style.color=activeTheme.accent; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor="rgba(255,255,255,0.1)"; e.currentTarget.style.color="#5a5040"; }}>
              Switch
            </button>
          </div>
          {}
          <div className="game-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
            {GAMES.map((game, idx) => (
              <button key={game.id} onClick={() => chips > 0 && onSelectGame(game.id)} disabled={chips <= 0}
                className="game-tile"
                style={{
                  background: isJackpotSkin ? "rgba(255,215,0,0.04)" : "rgba(255,240,220,0.03)",
                  border: isJackpotSkin ? "1px solid rgba(255,215,0,0.18)" : `1px solid ${activeTheme.accent}1a`,
                  borderRadius:12, padding:"16px 8px 12px", cursor: chips > 0 ? "pointer" : "not-allowed",
                  transition:"all 0.3s", textAlign:"center",
                  animation: isJackpotSkin
                    ? `lobbyTileIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${0.05+idx*0.04}s both, goldTileGlow 3s ease-in-out ${idx*0.3}s infinite`
                    : `lobbyTileIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${0.05+idx*0.04}s both`,
                  display:"flex", flexDirection:"column", alignItems:"center", position:"relative",
                  overflow:"hidden",
                }}
                onMouseEnter={e => { if(chips>0){
                  e.currentTarget.style.background=`${game.color}12`;
                  e.currentTarget.style.borderColor=game.color + "60";
                  e.currentTarget.style.transform="translateY(-4px) scale(1.02)";
                  e.currentTarget.style.boxShadow=`0 12px 28px rgba(0,0,0,0.35), 0 0 20px ${game.color}18`;
                }}}
                onMouseLeave={e => {
                  e.currentTarget.style.background="rgba(255,240,220,0.03)";
                  e.currentTarget.style.borderColor=`${activeTheme.accent}1a`;
                  e.currentTarget.style.transform="translateY(0) scale(1)";
                  e.currentTarget.style.boxShadow="none";
                }}>
                {}
                <div style={{ position:"absolute", top:0, left:"50%", transform:"translateX(-50%)",
                  width:"60%", height:2, background: isJackpotSkin ? "linear-gradient(90deg, transparent, rgba(255,215,0,0.5), rgba(255,248,200,0.7), rgba(255,215,0,0.5), transparent)" : `linear-gradient(90deg, transparent, ${game.color}88, transparent)`,
                  borderRadius:2 }} />
                {}
                {isJackpotSkin && (<>
                  <div style={{ position:"absolute", top:0, left:0, width:14, height:14, pointerEvents:"none",
                    borderTop:"1.5px solid rgba(255,215,0,0.4)", borderLeft:"1.5px solid rgba(255,215,0,0.4)", borderRadius:"12px 0 0 0" }} />
                  <div style={{ position:"absolute", top:0, right:0, width:14, height:14, pointerEvents:"none",
                    borderTop:"1.5px solid rgba(255,215,0,0.4)", borderRight:"1.5px solid rgba(255,215,0,0.4)", borderRadius:"0 12px 0 0" }} />
                  <div style={{ position:"absolute", bottom:0, left:0, width:14, height:14, pointerEvents:"none",
                    borderBottom:"1.5px solid rgba(255,215,0,0.25)", borderLeft:"1.5px solid rgba(255,215,0,0.25)", borderRadius:"0 0 0 12px" }} />
                  <div style={{ position:"absolute", bottom:0, right:0, width:14, height:14, pointerEvents:"none",
                    borderBottom:"1.5px solid rgba(255,215,0,0.25)", borderRight:"1.5px solid rgba(255,215,0,0.25)", borderRadius:"0 0 12px 0" }} />
                </>)}
                <div style={{ position:"absolute", bottom:0, right:0, width:40, height:40,
                  background:`radial-gradient(circle at 100% 100%, ${game.color}08 0%, transparent 70%)`,
                  pointerEvents:"none" }} />
                <div className="game-tile-icon" style={{ marginBottom:6,
                  animation:`lobbyIconFloat 3s ease-in-out ${idx * 0.4}s infinite` }}>
                  <game.Icon size={32} /></div>
                <div className="game-tile-name" style={{ fontSize:12, fontWeight:700, letterSpacing:1.5, textTransform:"uppercase",
                  color:T.text, fontFamily:T.serif, marginBottom:2,
                  textShadow:`0 0 20px ${game.color}15` }}>{game.name}</div>
                <div className="game-tile-desc" style={{ fontSize:9, color:T.dim, fontFamily:T.mono,
                  letterSpacing:0.5 }}>{game.description}</div>
                <div className="game-tile-rtp" style={{ fontSize:7, color:T.faint, fontFamily:T.mono,
                  letterSpacing:1, marginTop:2 }}>RTP {game.rtp}</div>
                {}
                {stats.gamesPlayed[game.id] > 0 && (() => {
                  const gw = (stats.winsPerGame || {})[game.id] || 0;
                  const gl = (stats.lossesPerGame || {})[game.id] || 0;
                  const profit = (stats.profitPerGame || {})[game.id] || 0;
                  const rh = (stats.resultHistory || {})[game.id] || [];
                  return (
                    <div style={{ marginTop:6, display:"flex", flexDirection:"column", alignItems:"center", gap:3, width:"100%" }}>
                      {rh.length >= 3 && <Sparkline results={rh} />}
                      <div style={{ fontSize:8, color:"#4a4a60", fontFamily:T.mono, display:"flex", gap:6 }}>
                        <span>{gw}W-{gl}L</span>
                        {profit !== 0 && <span style={{ color: profit > 0 ? T.green : "#ef4444" }}>
                          {profit > 0 ? "+" : ""}${profit.toLocaleString()}
                        </span>}
                      </div>
                    </div>
                  );
                })()}
              </button>
            ))}
          </div>
        </>)}
        {tab === "trophies" && (
          <div style={{ animation:"tabSlideIn 0.3s ease-out" }}>
            {}
            <div style={{ display:"flex", gap:0, marginBottom:14, borderRadius:8, overflow:"hidden",
              border:`1px solid ${activeTheme.accent}20` }}>
              {[{ id:"stats", label:"Stats" }, { id:"achievements", label:"Achievements" }].map(st => (
                <button key={st.id} onClick={() => { setFeatsSubTab(st.id); if (st.id === "achievements") setSeenAchCount(stats.achievements?.length || 0); }}
                  style={{ flex:1, padding:"8px 0", fontSize:10, fontWeight:700, letterSpacing:2,
                    textTransform:"uppercase", fontFamily:T.mono, cursor:"pointer", border:"none",
                    background: featsSubTab === st.id ? `${activeTheme.accent}20` : "transparent",
                    color: featsSubTab === st.id ? activeTheme.accent : T.dim,
                    borderBottom: featsSubTab === st.id ? `2px solid ${activeTheme.accent}` : "2px solid transparent",
                    transition:"all 0.2s" }}>
                  {st.label}
                  {st.id === "achievements" && (stats.achievements?.length || 0) > 0 && (
                    <span style={{ marginLeft:6, fontSize:9, opacity:0.6 }}>
                      {(stats.achievements || []).length}/{ACHIEVEMENTS.length}
                    </span>
                  )}
                </button>
              ))}
            </div>
            {}
            {featsSubTab === "achievements" && (<>
            {}
            <div onClick={() => setShowVipDetails(true)} style={{
              display:"flex", alignItems:"center", gap:12, padding:14, marginBottom:14,
              background:"rgba(255,255,255,0.03)", border:`1px solid ${vipTier.border}`,
              borderRadius:12, cursor:"pointer", transition:"all 0.2s",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = `${vipTier.color}12`; e.currentTarget.style.borderColor = vipTier.color + "66"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = vipTier.border; }}>
              <span style={{ fontSize:32 }}>{vipTier.icon}</span>
              <div style={{ flex:1 }}>
                <div style={{
                  fontSize:14, fontWeight:700, letterSpacing:3, fontFamily:T.mono,
                  color:vipTier.color, textTransform:"uppercase",
                }}>{vipTier.label} VIP</div>
                {(() => {
                  const next = getNextVipTier(vipPoints, achCount);
                  if (!next) return <div style={{ fontSize:9, color:T.dim, fontFamily:T.mono }}>MAX TIER REACHED</div>;
                  const progress = ((vipPoints - vipTier.minPoints) / (next.minPoints - vipTier.minPoints)) * 100;
                  return (<>
                    <div style={{ marginTop:4, height:4, borderRadius:2, background:"rgba(255,255,255,0.1)", overflow:"hidden" }}>
                      <div style={{ width:`${progress}%`, height:"100%", borderRadius:2, background:vipTier.color, transition:"width 0.5s" }} />
                    </div>
                    <div style={{ fontSize:9, color:T.dim, fontFamily:T.mono, marginTop:3 }}>
                      {vipPoints} / {next.minPoints.toLocaleString()} pts to {next.icon} {next.label} · Tap for details
                    </div>
                  </>);
                })()}
              </div>
            </div>
            {}
            <div style={{ display:"flex", gap:10, marginBottom:14 }}>
              <div style={{
                flex:1, textAlign:"center", padding:10,
                background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,150,0,0.15)", borderRadius:10,
              }}>
                <div style={{ ...S.label() }}>Current Streak</div>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:4, marginTop:4 }}>
                  {stats.winStreak >= 2 && <span style={{ fontSize:16 }}>▲</span>}
                  <span style={{ fontSize:22, fontWeight:700, fontFamily:T.mono,
                    color: stats.winStreak >= 5 ? "#ff4500" : stats.winStreak >= 2 ? "#ff9500" : T.muted
                  }}>{stats.winStreak}</span>
                </div>
              </div>
              <div style={{
                flex:1, textAlign:"center", padding:10,
                background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,150,0,0.15)", borderRadius:10,
              }}>
                <div style={{ ...S.label() }}>Best Streak</div>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:4, marginTop:4 }}>
                  <span style={{ fontSize:16 }}>⚡</span>
                  <span style={{ fontSize:22, fontWeight:700, fontFamily:T.mono, color:"#ff9500" }}>{stats.bestStreak}</span>
                </div>
              </div>
            </div>
            {}
            <div style={{
              padding:"12px 14px",
              background:"rgba(255,255,255,0.02)", border:`1px solid ${activeTheme.accent}18`, borderRadius:10,
            }}>
              <div style={{ ...S.label(), marginBottom:10 }}>
                Achievements ({(stats.achievements || []).length}/{ACHIEVEMENTS.length})
              </div>
              {[
                { name:"Easy", pts:150, color:"#22c55e" },
                { name:"Medium", pts:450, color:"#3b82f6" },
                { name:"Hard", pts:750, color:"#f59e0b" },
                { name:"Expert", pts:1500, color:"#a855f7" },
                { name:"Master", pts:2250, color:"#ef4444" },
                { name:"Insane", pts:3000, color:"#ff4500" },
              ].map(tier => {
                const tierAchs = ACHIEVEMENTS.filter(a => (ACH_POINTS[a.id] || 0) === tier.pts);
                if (tierAchs.length === 0) return null;
                const unlockedCount = tierAchs.filter(a => (stats.achievements || []).includes(a.id)).length;
                return (
                  <div key={tier.name} style={{ marginBottom:10 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:5 }}>
                      <span style={{ fontSize:9, fontWeight:700, letterSpacing:2, textTransform:"uppercase",
                        fontFamily:T.mono, color:tier.color }}>{tier.name}</span>
                      <span style={{ fontSize:8, fontFamily:T.mono, color:T.dim }}>{tier.pts} pts</span>
                      <span style={{ fontSize:8, fontFamily:T.mono, color:T.dim, marginLeft:"auto" }}>{unlockedCount}/{tierAchs.length}</span>
                    </div>
                    <div className="ach-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
                      {tierAchs.map(a => {
                        const unlocked = (stats.achievements || []).includes(a.id);
                        return (
                          <div key={a.id} style={{
                            display:"flex", alignItems:"center", gap:8, padding:"6px 8px",
                            borderRadius:8, transition:"all 0.2s",
                            background: unlocked ? `${tier.color}10` : "rgba(0,0,0,0.15)",
                            border: unlocked ? `1px solid ${tier.color}33` : "1px solid rgba(255,255,255,0.04)",
                            opacity: unlocked ? 1 : 0.4,
                          }}>
                            <span style={{ fontSize:18, filter: unlocked ? "none" : "grayscale(1)" }}>{a.icon}</span>
                            <div>
                              <div style={{ fontSize:10, fontWeight:700, color: unlocked ? T.text : T.dim,
                                fontFamily:T.serif, letterSpacing:0.5 }}>{a.name}</div>
                              <div style={{ fontSize:8, color: unlocked ? T.muted : T.dim,
                                fontFamily:T.mono }}>{a.desc}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            </>)}
            {}
            {featsSubTab === "stats" && (<>
            {}
            <div>
            <div className="stat-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
              <StatCard label="Peak Bankroll" value={`$${stats.peakBankroll.toLocaleString()}`}
                color={stats.peakBankroll > 1000 ? "#22c55e" : activeTheme.accent} accent={activeTheme.accent} />
              <StatCard label="Biggest Win" value={stats.biggestWin > 0 ? `+$${stats.biggestWin.toLocaleString()}` : "—"}
                color="#f1c40f" sub={stats.biggestWinGame ? `in ${GAMES.find(g=>g.id===stats.biggestWinGame)?.name || stats.biggestWinGame}` : ""} accent={activeTheme.accent} />
              <StatCard label="Total Wagered" value={`${stats.totalWagered.toLocaleString()}`} color="#8a8070" accent={activeTheme.accent} />
              <StatCard label="Net Profit" value={`${stats.netProfit >= 0 ? "+" : ""}$${stats.netProfit.toLocaleString()}`}
                color={stats.netProfit >= 0 ? "#22c55e" : "#ef4444"} accent={activeTheme.accent} />
              <StatCard label="Sessions" value={totalGames} color="#3b82f6"
                sub={totalGames > 0 ? `fav: ${mostPlayedName}` : ""} accent={activeTheme.accent} />
              <StatCard label="Record" value={(() => {
                const tw = Object.values(stats.winsPerGame || {}).reduce((a,b)=>a+b,0);
                const tl = Object.values(stats.lossesPerGame || {}).reduce((a,b)=>a+b,0);
                return (tw+tl) > 0 ? `${tw}W-${tl}L` : "—";
              })()} color="#8b5cf6"
                sub={stats.netProfit !== 0 ? `${stats.netProfit >= 0 ? "+" : ""}${stats.netProfit.toLocaleString()} net` : ""} accent={activeTheme.accent} />
              <StatCard label="Rebuys" value={stats.rebuys}
                color={stats.rebuys > 5 ? "#ef4444" : stats.rebuys > 0 ? "#f97316" : "#22c55e"}
                sub={stats.rebuys > 0 ? `${(stats.rebuys * 1000).toLocaleString()} rebought` : "clean run!"} accent={activeTheme.accent} />
              <StatCard label="Luck Rating" value={(() => {
                if (stats.totalWagered < 100) return "—";
                const expectedReturn = stats.totalWagered * 0.96;
                const actualReturn = stats.totalWagered + stats.netProfit;
                const luck = Math.round((actualReturn / expectedReturn) * 100);
                return luck >= 110 ? `▲ ${luck}%` : luck >= 100 ? `✦ ${luck}%` : luck >= 90 ? `${luck}%` : `✗ ${luck}%`;
              })()} color={stats.netProfit >= 0 ? "#f1c40f" : "#8a8070"}
                sub={stats.totalWagered >= 100 ? "vs expected return" : "play more to calculate"} accent={activeTheme.accent} />
            </div>
            {}
            <div style={{ background:"rgba(255,255,255,0.02)", border:`1px solid ${activeTheme.accent}18`,
              borderRadius:12, padding:"14px 16px" }}>
              <div style={{ fontSize:9, letterSpacing:2, textTransform:"uppercase", color:T.dim,
                fontFamily:T.mono, marginBottom:10, textAlign:"center" }}>Per Game Breakdown</div>
              {}
              {(() => {
                const gameWRs = GAMES.map(g => {
                  const gw = (stats.winsPerGame || {})[g.id] || 0;
                  const gl = (stats.lossesPerGame || {})[g.id] || 0;
                  const total = gw + gl;
                  return { ...g, wr: total >= 5 ? gw / total : -1, total };
                }).filter(g => g.wr >= 0);
                if (gameWRs.length < 2) return null;
                const hottest = gameWRs.reduce((a, b) => a.wr > b.wr ? a : b);
                const coldest = gameWRs.reduce((a, b) => a.wr < b.wr ? a : b);
                return (
                  <div style={{ display:"flex", gap:8, marginBottom:10, flexWrap:"wrap", justifyContent:"center" }}>
                    <div style={{ fontSize:9, fontFamily:T.mono, color:"#22c55e", padding:"3px 8px",
                      background:"rgba(34,197,94,0.08)", borderRadius:6, border:"1px solid rgba(34,197,94,0.15)" }}>
                      ▲ Hottest: {hottest.name} ({Math.round(hottest.wr * 100)}%)
                    </div>
                    <div style={{ fontSize:9, fontFamily:T.mono, color:"#3b82f6", padding:"3px 8px",
                      background:"rgba(59,130,246,0.08)", borderRadius:6, border:"1px solid rgba(59,130,246,0.15)" }}>
                      ▼ Coldest: {coldest.name} ({Math.round(coldest.wr * 100)}%)
                    </div>
                  </div>
                );
              })()}
              {GAMES.map(game => {
                const played = stats.gamesPlayed[game.id] || 0;
                const best = stats.biggestWinPerGame[game.id] || 0;
                const gw = (stats.winsPerGame || {})[game.id] || 0;
                const gl = (stats.lossesPerGame || {})[game.id] || 0;
                const wr = (gw + gl) > 0 ? Math.round(gw / (gw + gl) * 100) : 0;
                return (
                  <div key={game.id} className="breakdown-row" style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                    padding:"6px 0", borderBottom:"1px solid rgba(255,255,255,0.03)" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, minWidth:0, flex:"0 0 auto" }}>
                      <div style={{ width:6, height:6, borderRadius:"50%", background:game.color, opacity:played > 0 ? 1 : 0.3 }} />
                      <span style={{ fontSize:11, fontWeight:600, color: played > 0 ? "#e8e0d0" : "#4a4040",
                        letterSpacing:1 }}>{game.name}</span>
                    </div>
                    <div className="breakdown-stats" style={{ display:"flex", gap:8, fontFamily:T.mono, fontSize:9, alignItems:"center", flexWrap:"wrap", justifyContent:"flex-end" }}>
                      {played > 0 && (gw > 0 || gl > 0) && (
                        <span style={{ color: wr >= 50 ? "#22c55e" : wr > 0 ? "#f97316" : "#4a4040" }}>
                          {gw}W-{gl}L
                        </span>
                      )}
                      <span style={{ color:"#6a6050" }}>{played} sess</span>
                      {best > 0 && <span style={{ color:T.green }}>+${best.toLocaleString()}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
            {}
            <SessionTracker chips={chips} sessionStart={sessionStart} sessionRounds={sessionRounds}
              sessionChipsStart={sessionChipsStart} stats={stats} accent={activeTheme.accent} />
            {}
            <div style={{ textAlign:"center", marginTop:16 }}>
              {!confirmReset ? (
                <button onClick={() => setConfirmReset(true)}
                  style={{ padding:"8px 20px", fontSize:10, fontWeight:600, letterSpacing:2, textTransform:"uppercase",
                    fontFamily:T.mono,
                    background:"transparent", border:"1px solid rgba(239,68,68,0.3)", borderRadius:6,
                    color:T.red, cursor:"pointer", transition:"all 0.2s", opacity:0.6 }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.background = "rgba(239,68,68,0.1)"; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = "0.6"; e.currentTarget.style.background = "transparent"; }}>
                  Reset Progress
                </button>
              ) : (
                <div style={{ display:"flex", gap:8, justifyContent:"center", alignItems:"center", animation:"fadeIn 0.2s ease" }}>
                  <span style={{ fontSize:10, color:T.red, fontFamily:T.mono }}>Are you sure?</span>
                  <button onClick={() => { onResetStats(); setConfirmReset(false); }}
                    style={{ padding:"6px 16px", fontSize:10, fontWeight:700, letterSpacing:1,
                      fontFamily:T.mono, background:"rgba(239,68,68,0.2)",
                      border:"1px solid #ef4444", borderRadius:4, color:T.red, cursor:"pointer" }}>Yes</button>
                  <button onClick={() => setConfirmReset(false)}
                    style={{ padding:"6px 16px", fontSize:10, fontWeight:700, letterSpacing:1,
                      fontFamily:T.mono, background:"rgba(255,255,255,0.05)",
                      border:"1px solid rgba(255,255,255,0.2)", borderRadius:4, color:T.muted, cursor:"pointer" }}>Cancel</button>
                </div>
              )}
            </div>
            {}
            <div style={{ textAlign:"center", marginTop:20 }}>
              {!showAdmin ? (
                <button onClick={() => setShowAdmin(true)}
                  style={{ padding:"6px 16px", fontSize:9, fontWeight:600, letterSpacing:2, textTransform:"uppercase",
                    fontFamily:T.mono,
                    background:"transparent", border:"1px solid rgba(255,255,255,0.08)", borderRadius:6,
                    color:"#3a3020", cursor:"pointer", transition:"all 0.2s", opacity:0.5 }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = "0.8"; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = "0.5"; }}>
                  ◈ Admin
                </button>
              ) : !adminAuth ? (
                <div style={{ animation:"fadeIn 0.3s ease", background:"rgba(0,0,0,0.2)", borderRadius:10,
                  border:"1px solid rgba(255,255,255,0.08)", padding:16 }}>
                  <div style={{ fontSize:10, fontFamily:T.mono, color:T.muted, marginBottom:8, letterSpacing:1 }}>ADMIN PASSWORD</div>
                  <div style={{ display:"flex", gap:8, justifyContent:"center", alignItems:"center" }}>
                    <input type="password" value={adminPw} onChange={e => { setAdminPw(e.target.value); setAdminPwError(false); }}
                      onKeyDown={e => { if (e.key === "Enter") {
                        if (adminPw === "Ivy") { setAdminAuth(true); setAdminPwError(false); }
                        else setAdminPwError(true);
                      }}}
                      style={{ padding:"6px 12px", fontSize:12, fontFamily:T.mono, background:"rgba(0,0,0,0.3)",
                        border: adminPwError ? "1px solid #ef4444" : "1px solid rgba(255,255,255,0.15)",
                        borderRadius:6, color:T.text, width:120, outline:"none" }}
                      placeholder="Password" autoFocus />
                    <button onClick={() => {
                      if (adminPw === "Ivy") { setAdminAuth(true); setAdminPwError(false); }
                      else setAdminPwError(true);
                    }}
                      style={{ padding:"6px 14px", fontSize:10, fontWeight:700, fontFamily:T.mono,
                        background:`${activeTheme.accent}25`, border:`1px solid ${activeTheme.accent}50`,
                        borderRadius:6, color:activeTheme.accent, cursor:"pointer" }}>Enter</button>
                    <button onClick={() => { setShowAdmin(false); setAdminPw(""); setAdminPwError(false); }}
                      style={{ padding:"6px 10px", fontSize:10, fontFamily:T.mono, background:"transparent",
                        border:"1px solid rgba(255,255,255,0.1)", borderRadius:6, color:T.muted, cursor:"pointer" }}>✕</button>
                  </div>
                  {adminPwError && <div style={{ fontSize:9, color:"#ef4444", fontFamily:T.mono, marginTop:6 }}>Incorrect password</div>}
                </div>
              ) : (
                <div style={{ animation:"fadeIn 0.3s ease", background:"rgba(0,0,0,0.25)", borderRadius:12,
                  border:`1px solid ${activeTheme.accent}28`, padding:16, textAlign:"left" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                    <div style={{ fontSize:10, fontFamily:T.mono, color:activeTheme.accent, letterSpacing:2, fontWeight:700 }}>◈ ADMIN CONTROLS</div>
                    <button onClick={() => { setShowAdmin(false); setAdminAuth(false); setAdminPw(""); }}
                      style={{ padding:"4px 10px", fontSize:9, fontFamily:T.mono, background:"transparent",
                        border:"1px solid rgba(255,255,255,0.1)", borderRadius:4, color:T.muted, cursor:"pointer" }}>Close</button>
                  </div>
                  {}
                  <div style={{ marginBottom:16, padding:10, background:"rgba(255,255,255,0.03)", borderRadius:8,
                    border:"1px solid rgba(255,255,255,0.06)" }}>
                    <div style={{ fontSize:9, fontFamily:T.mono, color:T.muted, marginBottom:8, letterSpacing:1 }}>ADD CHIPS</div>
                    <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:8 }}>
                      {[1000, 10000, 100000, 1000000].map(amount => (
                        <button key={amount} onClick={() => onAdminSetChips(prev => prev + amount)}
                          style={{ padding:"5px 10px", fontSize:10, fontWeight:600, fontFamily:T.mono,
                            background:"rgba(34,197,94,0.12)", border:"1px solid rgba(34,197,94,0.3)",
                            borderRadius:5, color:"#22c55e", cursor:"pointer" }}>
                          +${amount >= 1000000 ? `${amount/1000000}M` : amount >= 1000 ? `${amount/1000}K` : amount}
                        </button>
                      ))}
                    </div>
                    <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                      <input type="number" value={adminChipAdd} onChange={e => setAdminChipAdd(e.target.value)}
                        placeholder="Custom amount"
                        style={{ padding:"5px 10px", fontSize:11, fontFamily:T.mono, background:"rgba(0,0,0,0.3)",
                          border:"1px solid rgba(255,255,255,0.12)", borderRadius:5, color:T.text, width:120, outline:"none" }} />
                      <button onClick={() => {
                        const amt = parseInt(adminChipAdd);
                        if (amt && amt > 0) { onAdminSetChips(prev => prev + amt); setAdminChipAdd(""); }
                      }}
                        style={{ padding:"5px 12px", fontSize:10, fontWeight:600, fontFamily:T.mono,
                          background:"rgba(34,197,94,0.15)", border:"1px solid rgba(34,197,94,0.3)",
                          borderRadius:5, color:"#22c55e", cursor:"pointer" }}>Add</button>
                    </div>
                  </div>
                  {}
                  <div style={{ padding:10, background:"rgba(255,255,255,0.03)", borderRadius:8,
                    border:"1px solid rgba(255,255,255,0.06)" }}>
                    <div style={{ fontSize:9, fontFamily:T.mono, color:T.muted, marginBottom:8, letterSpacing:1 }}>
                      ACHIEVEMENTS ({(stats.achievements || []).length}/{ACHIEVEMENTS.length})
                      <button onClick={() => {
                        const allIds = ACHIEVEMENTS.map(a => a.id);
                        const hasAll = allIds.every(id => (stats.achievements || []).includes(id));
                        if (hasAll) {
                          onAdminSetStats(s => ({ ...s, achievements: [] }));
                        } else {
                          onAdminSetStats(s => ({ ...s, achievements: [...allIds] }));
                        }
                      }}
                        style={{ marginLeft:8, padding:"2px 8px", fontSize:8, fontFamily:T.mono,
                          background:`${activeTheme.accent}1a`, border:`1px solid ${activeTheme.accent}35`,
                          borderRadius:3, color:activeTheme.accent, cursor:"pointer" }}>
                        {ACHIEVEMENTS.every(a => (stats.achievements || []).includes(a.id)) ? "Clear All" : "Unlock All"}
                      </button>
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:4, maxHeight:300, overflowY:"auto" }}>
                      {ACHIEVEMENTS.map(a => {
                        const unlocked = (stats.achievements || []).includes(a.id);
                        return (
                          <button key={a.id} onClick={() => {
                            onAdminSetStats(s => {
                              const achs = [...(s.achievements || [])];
                              if (unlocked) {
                                return { ...s, achievements: achs.filter(id => id !== a.id) };
                              } else {
                                return { ...s, achievements: [...achs, a.id] };
                              }
                            });
                          }}
                            style={{
                              display:"flex", alignItems:"center", gap:6, padding:"5px 6px",
                              borderRadius:6, cursor:"pointer", textAlign:"left",
                              background: unlocked ? "rgba(34,197,94,0.1)" : "rgba(0,0,0,0.2)",
                              border: unlocked ? "1px solid rgba(34,197,94,0.25)" : "1px solid rgba(255,255,255,0.06)",
                              transition:"all 0.15s",
                            }}>
                            <span style={{ fontSize:14, filter: unlocked ? "none" : "grayscale(1)", flexShrink:0 }}>{a.icon}</span>
                            <div style={{ minWidth:0 }}>
                              <div style={{ fontSize:9, fontWeight:700, color: unlocked ? "#22c55e" : T.dim,
                                fontFamily:T.mono, letterSpacing:0.3 }}>{a.name}</div>
                              <div style={{ fontSize:7, color: unlocked ? T.muted : T.dim,
                                fontFamily:T.mono }}>{ACH_POINTS[a.id] || 0} pts</div>
                            </div>
                            <span style={{ marginLeft:"auto", fontSize:10, flexShrink:0 }}>{unlocked ? "✅" : "⬜"}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  {}
                  <div style={{ marginTop:16, padding:10, background:"rgba(255,255,255,0.03)", borderRadius:8,
                    border:"1px solid rgba(255,255,255,0.06)" }}>
                    <div style={{ fontSize:9, fontFamily:T.mono, color:T.muted, marginBottom:8, letterSpacing:1 }}>OVERLAY PREVIEWS</div>
                    <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                      {[
                        { label:"BIG WIN", type:"big", color:"#f1c40f" },
                        { label:"MEGA WIN", type:"mega", color:"#ff6b6b" },
                        { label:"EPIC WIN", type:"epic", color:"#ff4500" },
                        { label:"JACKPOT!!!", type:"jackpot", color:"#ffd700" },
                      ].map(t => (
                        <button key={t.type} onClick={() => {
                          setTestOverlay(t.type);
                          if (t.type === "jackpot") {
                            setTestConfetti({type:"fireworks",key:Date.now()});
                            setTestCoinRain("extra_heavy");
                            setTestWash("jackpot");
                          } else if (t.type === "epic") {
                            setTestConfetti({type:"fireworks",key:Date.now()});
                            setTestCoinRain("heavy");
                            setTestEruption(true);
                            setTestWash("epic");
                          } else if (t.type === "mega") {
                            setTestConfetti({type:"confetti",key:Date.now()});
                            setTestCoinRain("medium");
                            setTestEruption(true);
                            setTestWash("mega");
                          } else {
                            setTestCoinRain("light");
                            setTestWash("big");
                          }
                        }}
                          style={{ padding:"5px 10px", fontSize:9, fontWeight:700, fontFamily:T.mono,
                            background:`${t.color}15`, border:`1px solid ${t.color}40`,
                            borderRadius:5, color:t.color, cursor:"pointer" }}>
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {}
                  <div style={{ marginTop:16, padding:10, background:"rgba(255,255,255,0.03)", borderRadius:8,
                    border: forceJackpot ? "1px solid rgba(255,69,0,0.4)" : "1px solid rgba(255,255,255,0.06)" }}>
                    <div style={{ fontSize:9, fontFamily:T.mono, color:T.muted, marginBottom:8, letterSpacing:1 }}>FORCE NEXT JACKPOT</div>
                    <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                      <button onClick={() => setForceJackpot(!forceJackpot)}
                        style={{ padding:"6px 14px", fontSize:10, fontWeight:700, fontFamily:T.mono,
                          background: forceJackpot ? "rgba(255,69,0,0.2)" : "rgba(255,255,255,0.05)",
                          border: forceJackpot ? "1px solid #ff4500" : "1px solid rgba(255,255,255,0.15)",
                          borderRadius:5, color: forceJackpot ? "#ff4500" : T.muted, cursor:"pointer",
                          transition:"all 0.2s" }}>
                        {forceJackpot ? "★ ARMED — Next scratch = JACKPOT" : "Arm Jackpot"}
                      </button>
                    </div>
                    {forceJackpot && (
                      <div style={{ fontSize:8, color:"#ff6b35", fontFamily:T.mono, marginTop:6 }}>
                        Go to Scratch Cards → buy any ticket → guaranteed jackpot with 2-3 matches + 10,000× multiplier
                      </div>
                    )}
                  </div>
                  {}
                  <div style={{ marginTop:16, padding:10, background:"rgba(255,255,255,0.03)", borderRadius:8,
                    border:"1px solid rgba(255,255,255,0.06)" }}>
                    <div style={{ fontSize:9, fontFamily:T.mono, color:T.muted, marginBottom:8, letterSpacing:1 }}>INDIVIDUAL EFFECTS</div>
                    <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                      {[
                        { label:"● Coins Light", fn:() => { setTestCoinRain("light"); setTimeout(()=>setTestCoinRain(null), 2000); }},
                        { label:"● Coins Heavy", fn:() => { setTestCoinRain("heavy"); setTimeout(()=>setTestCoinRain(null), 3000); }},
                        { label:"● Coins X-Heavy", fn:() => { setTestCoinRain("extra_heavy"); setTimeout(()=>setTestCoinRain(null), 5000); }},
                        { label:"✦ Confetti", fn:() => { setTestConfetti({type:"confetti",key:Date.now()}); setTimeout(()=>setTestConfetti(null), 3000); }},
                        { label:"✦ Fireworks", fn:() => { setTestConfetti({type:"fireworks",key:Date.now()}); setTimeout(()=>setTestConfetti(null), 4000); }},
                        { label:"▲ Eruption", fn:() => { setTestEruption(true); setTimeout(()=>setTestEruption(false), 1200); }},
                        { label:"✦ Wash Gold", fn:() => { setTestWash("gold"); setTimeout(()=>setTestWash(null), 500); }},
                        { label:"✦ Wash Big", fn:() => { setTestWash("big"); setTimeout(()=>setTestWash(null), 2000); }},
                        { label:"✦ Wash Mega", fn:() => { setTestWash("mega"); setTimeout(()=>setTestWash(null), 3000); }},
                        { label:"✦ Wash Epic", fn:() => { setTestWash("epic"); setTimeout(()=>setTestWash(null), 3000); }},
                        { label:"✦ Wash Jackpot", fn:() => { setTestWash("jackpot"); setTimeout(()=>setTestWash(null), 4000); }},
                        { label:"~ Shake Light", fn:() => { setTestShake("light"); setTimeout(()=>setTestShake(null), 400); }},
                        { label:"~ Shake Heavy", fn:() => { setTestShake("heavy"); setTimeout(()=>setTestShake(null), 600); }},
                        { label:"~ Shake Epic", fn:() => { setTestShake("epic"); setTimeout(()=>setTestShake(null), 800); }},
                      ].map((e, i) => (
                        <button key={i} onClick={e.fn}
                          style={{ padding:"4px 8px", fontSize:8, fontWeight:600, fontFamily:T.mono,
                            background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)",
                            borderRadius:4, color:T.muted, cursor:"pointer" }}>
                          {e.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            </div>
            </>)}
          </div>
        )}
        {}
        {tab === "shop" && (
          <div style={{ animation:"tabSlideIn 0.3s ease-out" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
              <div style={{ fontSize:14, fontWeight:700, letterSpacing:3, textTransform:"uppercase", fontFamily:T.serif, color:activeTheme.accent }}>Power-Up Shop</div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:12, fontFamily:T.mono, color: chips > 500 ? activeTheme.accent : "#e74c3c" }}>
                  ${chips.toLocaleString()}
                </div>
                <div style={{ fontSize:8, fontFamily:T.mono, color:T.dim }}>
                  Prices scale with {vipTier.label} tier (${vipTier.rebuy.toLocaleString()} base)
                </div>
              </div>
            </div>
            {}
            {(settings.powerUps || []).length > 0 && (
              <div onClick={() => setTab("inventory")} style={{ marginBottom:14, padding:"6px 12px", borderRadius:8,
                background:`${activeTheme.accent}08`, border:`1px solid ${activeTheme.accent}15`,
                cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <span style={{ fontSize:10, fontFamily:T.mono, color:activeTheme.accent }}>
                  {(settings.powerUps || []).length} active power-up{(settings.powerUps || []).length !== 1 ? "s" : ""}
                </span>
                <span style={{ fontSize:9, fontFamily:T.mono, color:T.dim }}>View Inventory →</span>
              </div>
            )}
            {}
            {SHOP_CATEGORIES.map(cat => {
              const items = SHOP_ITEMS.filter(i => i.cat === cat.id);
              return (
                <div key={cat.id} style={{ marginBottom:16 }}>
                  <div style={{ fontSize:11, letterSpacing:2, textTransform:"uppercase", color:T.muted, fontFamily:T.serif,
                    marginBottom:8, display:"flex", alignItems:"center", gap:6 }}>
                    <span>{cat.icon}</span>{cat.name}
                    {cat.id === "mystery" && (
                      <span onClick={() => setShowMysteryOdds(showMysteryOdds ? null : 1)} style={{
                        fontSize:8, fontFamily:T.mono, color:activeTheme.accent, cursor:"pointer",
                        marginLeft:"auto", letterSpacing:1, opacity:0.7 }}>
                        {showMysteryOdds ? "HIDE ODDS" : "VIEW ODDS"}
                      </span>
                    )}
                  </div>
                  {}
                  {cat.id === "mystery" && showMysteryOdds && (
                    <div style={{ marginBottom:10, padding:"10px 12px", borderRadius:8,
                      background:`${activeTheme.accent}06`, border:`1px solid ${activeTheme.accent}15` }}>
                      <div style={{ display:"flex", gap:4, marginBottom:8 }}>
                        {[{t:1,l:"Small"},{t:2,l:"Large"},{t:3,l:"Legendary"}].map(b => (
                          <button key={b.t} onClick={() => setShowMysteryOdds(b.t)} style={{
                            flex:1, padding:"4px 0", fontSize:9, fontWeight:700, fontFamily:T.mono,
                            background: showMysteryOdds === b.t ? `${activeTheme.accent}20` : "transparent",
                            border: showMysteryOdds === b.t ? `1px solid ${activeTheme.accent}40` : "1px solid transparent",
                            borderRadius:4, color: showMysteryOdds === b.t ? activeTheme.accent : T.dim,
                            cursor:"pointer", letterSpacing:1 }}>{b.l}</button>
                        ))}
                      </div>
                      {(() => {
                        const rates = MYSTERY_DROP_RATES[showMysteryOdds] || MYSTERY_DROP_RATES[1];
                        const total = Object.values(rates).reduce((a,b) => a+b, 0);
                        const rarities = ["common","uncommon","rare","epic","legendary","mythic"];
                        const labels = { common:"Common", uncommon:"Uncommon", rare:"Rare", epic:"Epic", legendary:"Legendary", mythic:"Mythic" };
                        return (
                          <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
                            {rarities.map(r => {
                              const pct = Math.round((rates[r] || 0) / total * 100);
                              if (pct === 0) return null;
                              const col = RARITY_COLORS[r] || T.dim;
                              return (
                                <div key={r} style={{ display:"flex", alignItems:"center", gap:8 }}>
                                  <div style={{ width:60, fontSize:9, fontFamily:T.mono, color:col, fontWeight:700, letterSpacing:1 }}>{labels[r]}</div>
                                  <div style={{ flex:1, height:6, borderRadius:3, background:"rgba(255,255,255,0.06)", overflow:"hidden" }}>
                                    <div style={{ width:`${pct}%`, height:"100%", borderRadius:3, background:col, transition:"width 0.3s" }} />
                                  </div>
                                  <div style={{ width:28, fontSize:9, fontFamily:T.mono, color:T.dim, textAlign:"right" }}>{pct}%</div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
                    {items.map(item => {
                      const rebuyFloor = vipTier.rebuy;
                      const itemPrice = Math.floor(rebuyFloor * item.costMulti);
                      const canAfford = chips >= itemPrice;
                      return (
                        <button key={item.id} onClick={() => setSelectedShopItem({ ...item, price: itemPrice })}
                        style={{
                          padding:"10px 8px", borderRadius:8, textAlign:"center", cursor:"pointer",
                          background:`${activeTheme.accent}08`,
                          border:`1px solid ${activeTheme.accent}20`,
                          transition:"all 0.2s", position:"relative", overflow:"hidden",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background=`${activeTheme.accent}15`; e.currentTarget.style.borderColor=`${activeTheme.accent}40`; e.currentTarget.style.transform="translateY(-2px)"; }}
                        onMouseLeave={e => { e.currentTarget.style.background=`${activeTheme.accent}08`; e.currentTarget.style.borderColor=`${activeTheme.accent}20`; e.currentTarget.style.transform="translateY(0)"; }}>
                          {}
                          {item.rarity !== "mystery" && (
                            <div style={{ position:"absolute", top:0, left:0, right:0, height:2,
                              background:RARITY_COLORS[item.rarity] || T.dim, borderRadius:"8px 8px 0 0" }} />
                          )}
                          <div style={{ fontSize:20, marginBottom:4 }}>{item.icon}</div>
                          <div style={{ fontSize:10, fontWeight:700, fontFamily:T.serif, color:T.text, letterSpacing:1 }}>{item.tier}</div>
                          {item.rarity !== "mystery" && (
                            <div style={{ fontSize:7, fontFamily:T.mono, color:RARITY_COLORS[item.rarity] || T.dim,
                              letterSpacing:1, textTransform:"uppercase", marginTop:1 }}>{item.rarity}</div>
                          )}
                          <div style={{ fontSize:8, color:T.dim, fontFamily:T.mono, marginTop:2, lineHeight:1.3 }}>{item.desc}</div>
                          <div style={{ marginTop:6, fontSize:11, fontWeight:700, fontFamily:T.mono,
                            color: canAfford ? activeTheme.accent : "#555" }}>
                            ${itemPrice.toLocaleString()}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {}
        {selectedShopItem && (() => {
          const si = selectedShopItem;
          const isMystery = si.effect.type === "mystery";
          const rarityCol = RARITY_COLORS[si.rarity] || T.dim;
          const bulkOptions = isMystery ? [1, 3, 5, 10] : [1, 3, 5];
          const doPurchase = (qty) => {
            const totalCost = si.price * qty;
            if (chips < totalCost) return;
            onAdminSetChips(c => c - totalCost);
            for (let q = 0; q < qty; q++) {
              if (isMystery) {
                const boxTier = si.effect.tier;
                const rates = MYSTERY_DROP_RATES[boxTier] || MYSTERY_DROP_RATES[1];
                const totalWeight = Object.values(rates).reduce((a,b) => a+b, 0);
                let roll = Math.random() * totalWeight;
                let selectedRarity = "common";
                for (const [rarity, weight] of Object.entries(rates)) {
                  roll -= weight;
                  if (roll <= 0) { selectedRarity = rarity; break; }
                }
                const pool = SHOP_ITEMS.filter(s => s.rarity === selectedRarity);
                let rewardItem = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : null;
                if (!rewardItem) {
                  const fb = ["legendary","epic","rare","uncommon","common"];
                  for (const r of fb) { const p = SHOP_ITEMS.filter(s => s.rarity === r); if (p.length > 0) { rewardItem = p[Math.floor(Math.random() * p.length)]; break; } }
                }
                if (rewardItem) {
                  const pu = { itemId: rewardItem.id, ...rewardItem.effect,
                    remaining: rewardItem.effect.rounds || rewardItem.effect.wins || rewardItem.effect.bets || rewardItem.effect.uses || 1 };
                  setSettings(s => ({ ...s, powerUps: [...(s.powerUps || []), pu] }));
                }
              } else {
                const pu = { itemId: si.id, ...si.effect,
                  remaining: si.effect.rounds || si.effect.wins || si.effect.bets || si.effect.uses || 1 };
                setSettings(s => ({ ...s, powerUps: [...(s.powerUps || []), pu] }));
              }
            }
            setSelectedShopItem(null);
          };
          return (
            <div onClick={() => setSelectedShopItem(null)} style={{
              position:"fixed", inset:0, zIndex:10000, background:"rgba(0,0,0,0.7)", backdropFilter:"blur(4px)",
              display:"flex", alignItems:"center", justifyContent:"center", padding:20,
              animation:"fadeIn 0.2s ease" }}>
              <div onClick={e => e.stopPropagation()} style={{
                width:"100%", maxWidth:340, borderRadius:14, overflow:"hidden",
                background:"linear-gradient(180deg, #1a1510 0%, #0e0a08 100%)",
                border:`1px solid ${rarityCol}30`, boxShadow:`0 20px 60px rgba(0,0,0,0.5), 0 0 30px ${rarityCol}10` }}>
                {}
                <div style={{ height:3, background:rarityCol }} />
                <div style={{ padding:"20px 24px" }}>
                  {}
                  <div style={{ textAlign:"center", marginBottom:16 }}>
                    <div style={{ fontSize:32, marginBottom:6 }}>{si.icon}</div>
                    <div style={{ fontSize:16, fontWeight:700, fontFamily:T.serif, color:T.text, letterSpacing:2 }}>{si.name}</div>
                    <div style={{ fontSize:11, fontFamily:T.mono, color:rarityCol, letterSpacing:2, textTransform:"uppercase", marginTop:4 }}>{si.rarity}</div>
                    <div style={{ fontSize:13, fontWeight:700, color:T.text, marginTop:4 }}>{si.tier}</div>
                  </div>
                  {}
                  <div style={{ fontSize:11, color:T.muted, fontFamily:T.mono, textAlign:"center", marginBottom:16, lineHeight:1.5 }}>
                    {si.desc}
                  </div>
                  {}
                  <div style={{ textAlign:"center", marginBottom:16 }}>
                    <span style={{ fontSize:10, color:T.dim, fontFamily:T.mono }}>Unit price: </span>
                    <span style={{ fontSize:14, fontWeight:700, color:activeTheme.accent, fontFamily:T.mono }}>${si.price.toLocaleString()}</span>
                  </div>
                  {}
                  <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                    {bulkOptions.map(qty => {
                      const totalCost = si.price * qty;
                      const canBuy = chips >= totalCost;
                      return (
                        <button key={qty} onClick={() => canBuy && doPurchase(qty)}
                          style={{
                            padding:"10px 16px", borderRadius:8, cursor: canBuy ? "pointer" : "not-allowed",
                            background: canBuy ? `${activeTheme.accent}15` : "rgba(60,60,60,0.1)",
                            border: canBuy ? `1px solid ${activeTheme.accent}30` : "1px solid rgba(60,60,60,0.15)",
                            display:"flex", alignItems:"center", justifyContent:"space-between",
                            transition:"all 0.15s",
                          }}
                          onMouseEnter={e => { if(canBuy) { e.currentTarget.style.background=`${activeTheme.accent}25`; e.currentTarget.style.borderColor=`${activeTheme.accent}50`; }}}
                          onMouseLeave={e => { e.currentTarget.style.background=canBuy?`${activeTheme.accent}15`:"rgba(60,60,60,0.1)"; e.currentTarget.style.borderColor=canBuy?`${activeTheme.accent}30`:"rgba(60,60,60,0.15)"; }}>
                          <span style={{ fontSize:12, fontWeight:700, fontFamily:T.serif, color: canBuy ? T.text : "#555", letterSpacing:1 }}>
                            {qty === 1 ? "Buy ×1" : `Buy ×${qty}`}
                          </span>
                          <span style={{ fontSize:12, fontWeight:700, fontFamily:T.mono, color: canBuy ? activeTheme.accent : "#555" }}>
                            ${totalCost.toLocaleString()}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {}
                  <div style={{ textAlign:"center", marginTop:12, fontSize:10, fontFamily:T.mono, color:T.dim }}>
                    Your balance: ${chips.toLocaleString()}
                  </div>
                  {}
                  <button onClick={() => setSelectedShopItem(null)} style={{
                    width:"100%", marginTop:12, padding:"8px 0", fontSize:10, fontFamily:T.mono,
                    letterSpacing:2, color:T.dim, background:"transparent", border:"1px solid rgba(255,255,255,0.08)",
                    borderRadius:6, cursor:"pointer" }}>CLOSE</button>
                </div>
              </div>
            </div>
          );
        })()}
        {}
        {tab === "inventory" && (
          <div style={{ animation:"tabSlideIn 0.3s ease-out" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
              <div style={{ fontSize:14, fontWeight:700, letterSpacing:3, textTransform:"uppercase", fontFamily:T.serif, color:activeTheme.accent }}>Inventory</div>
              <div style={{ fontSize:10, fontFamily:T.mono, color:T.dim }}>
                {(settings.powerUps || []).length} stored{(settings.activePowerUps || []).length > 0 ? ` · ${(settings.activePowerUps || []).length} active` : ""}
              </div>
            </div>
            {}
            {(settings.activePowerUps || []).length > 0 && (
              <div style={{ marginBottom:14 }}>
                <div style={{ fontSize:9, letterSpacing:2, textTransform:"uppercase", color:T.muted, fontFamily:T.mono, marginBottom:6 }}>Active</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                  {(settings.activePowerUps || []).map((pu, i) => {
                    const item = SHOP_ITEMS.find(s => s.id === pu.itemId);
                    if (!item) return null;
                    const rarityCol = RARITY_COLORS[item.rarity] || activeTheme.accent;
                    const remaining = pu.remaining != null ? pu.remaining : 0;
                    const unit = item.effect.wins ? "w" : "b";
                    return (
                      <div key={i} style={{ padding:"5px 10px", borderRadius:6, display:"flex", alignItems:"center", gap:5,
                        background:`${rarityCol}12`, border:`1px solid ${rarityCol}35`, fontSize:10, fontFamily:T.mono }}>
                        <span style={{ color:rarityCol }}>{item.icon}</span>
                        <span style={{ color:T.text, fontWeight:700 }}>{remaining}{unit}</span>
                        <span style={{ color:rarityCol, fontSize:8 }}>{item.tier}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {}
            {(settings.powerUps || []).length === 0 && (settings.activePowerUps || []).length === 0 ? (
              <div style={{ textAlign:"center", padding:"40px 20px" }}>
                <div style={{ fontSize:28, color:T.dim, marginBottom:12 }}>◇</div>
                <div style={{ fontSize:13, color:T.muted, fontFamily:T.serif, marginBottom:6 }}>No power-ups</div>
                <div style={{ fontSize:10, color:T.dim, fontFamily:T.mono }}>Visit the Shop to buy power-ups</div>
              </div>
            ) : (settings.powerUps || []).length === 0 ? (
              <div style={{ textAlign:"center", padding:"20px", fontSize:10, color:T.dim, fontFamily:T.mono }}>
                No items in bag — all power-ups are active
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {(settings.powerUps || []).map((pu, i) => {
                  const item = SHOP_ITEMS.find(s => s.id === pu.itemId);
                  if (!item) return null;
                  const remaining = pu.remaining != null ? pu.remaining : 0;
                  const maxUses = item.effect.rounds || item.effect.wins || item.effect.bets || item.effect.uses || 1;
                  const pct = Math.max(0, Math.min(100, (remaining / maxUses) * 100));
                  const typeLabels = {
                    winMulti: "Win Multiplier", vipMulti: "VIP Boost",
                    insurance: "Loss Insurance", shield: "All-In Shield",
                  };
                  const remainLabel = item.effect.wins ? `${remaining} wins` : item.effect.bets ? `${remaining} bets` : `${remaining} uses`;
                  const rarityCol = RARITY_COLORS[item.rarity] || activeTheme.accent;
                  return (
                    <div key={i} onClick={() => setSelectedInvItem(i)}
                      style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 14px",
                      background:`${activeTheme.accent}06`, border:`1px solid ${activeTheme.accent}15`,
                      borderRadius:10, position:"relative", overflow:"hidden", cursor:"pointer",
                      transition:"all 0.2s" }}>
                      {}
                      <div style={{ position:"absolute", left:0, top:0, bottom:0, width:`${pct}%`,
                        background:`${activeTheme.accent}08`, transition:"width 0.3s" }} />
                      {}
                      <div style={{ position:"absolute", left:0, top:0, bottom:0, width:3, background:rarityCol, opacity:0.5 }} />
                      {}
                      <div style={{ width:36, height:36, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center",
                        background:`${rarityCol}18`, border:`1px solid ${rarityCol}30`,
                        fontSize:16, color:rarityCol, fontWeight:700, flexShrink:0, zIndex:1 }}>
                        {item.icon}
                      </div>
                      {}
                      <div style={{ flex:1, zIndex:1 }}>
                        <div style={{ fontSize:12, fontWeight:700, fontFamily:T.serif, color:T.text, letterSpacing:1 }}>
                          {item.name} <span style={{ color:T.dim, fontWeight:400 }}>({item.tier})</span>
                        </div>
                        <div style={{ fontSize:9, color:T.muted, fontFamily:T.mono, marginTop:2 }}>
                          {typeLabels[item.effect.type] || item.effect.type}
                        </div>
                      </div>
                      {}
                      <div style={{ textAlign:"right", flexShrink:0, zIndex:1 }}>
                        <div style={{ fontSize:14, fontWeight:700, fontFamily:T.mono, color:activeTheme.accent }}>{remaining}</div>
                        <div style={{ fontSize:8, color:T.dim, fontFamily:T.mono }}>{remainLabel}</div>
                      </div>
                    </div>
                  );
                })}
                {}
                {selectedInvItem != null && (settings.powerUps || [])[selectedInvItem] && (() => {
                  const idx = selectedInvItem;
                  const pu = settings.powerUps[idx];
                  const item = SHOP_ITEMS.find(s => s.id === pu.itemId);
                  if (!item) return null;
                  const rarityCol = RARITY_COLORS[item.rarity] || activeTheme.accent;
                  const remaining = pu.remaining != null ? pu.remaining : 0;
                  const remainLabel = item.effect.wins ? `${remaining} wins` : item.effect.bets ? `${remaining} bets` : `${remaining} uses`;
                  return (
                    <div onClick={() => setSelectedInvItem(null)} style={{
                      position:"fixed", inset:0, zIndex:10000, background:"rgba(0,0,0,0.7)", backdropFilter:"blur(4px)",
                      display:"flex", alignItems:"center", justifyContent:"center", padding:20,
                      animation:"fadeIn 0.2s ease" }}>
                      <div onClick={e => e.stopPropagation()} style={{
                        width:"100%", maxWidth:300, borderRadius:14, overflow:"hidden",
                        background:"linear-gradient(180deg, #1a1510 0%, #0e0a08 100%)",
                        border:`1px solid ${rarityCol}30`, boxShadow:`0 20px 60px rgba(0,0,0,0.5), 0 0 30px ${rarityCol}10` }}>
                        <div style={{ height:3, background:rarityCol }} />
                        <div style={{ padding:"20px 24px", textAlign:"center" }}>
                          <div style={{ fontSize:32, marginBottom:6 }}>{item.icon}</div>
                          <div style={{ fontSize:16, fontWeight:700, fontFamily:T.serif, color:T.text, letterSpacing:2 }}>{item.name}</div>
                          <div style={{ fontSize:11, fontFamily:T.mono, color:rarityCol, letterSpacing:2, textTransform:"uppercase", marginTop:4 }}>{item.rarity}</div>
                          <div style={{ fontSize:13, fontWeight:700, color:T.text, marginTop:4 }}>{item.tier}</div>
                          <div style={{ fontSize:11, color:T.muted, fontFamily:T.mono, marginTop:8, lineHeight:1.5 }}>{item.desc}</div>
                          <div style={{ fontSize:12, fontFamily:T.mono, color:activeTheme.accent, marginTop:8 }}>
                            {remaining} {remainLabel.split(" ")[1]} remaining
                          </div>
                          <div style={{ display:"flex", flexDirection:"column", gap:8, marginTop:16 }}>
                            <button onClick={() => {
                              const activePu = { ...pu };
                              setSettings(s => ({
                                ...s,
                                powerUps: s.powerUps.filter((_, j) => j !== idx),
                                activePowerUps: [...(s.activePowerUps || []), activePu],
                              }));
                              setSelectedInvItem(null);
                            }} style={{
                              padding:"12px 16px", fontSize:12, fontWeight:700, fontFamily:T.mono,
                              letterSpacing:2, background:`${activeTheme.accent}20`, border:`1px solid ${activeTheme.accent}50`,
                              borderRadius:8, color:activeTheme.accent, cursor:"pointer", transition:"all 0.15s",
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background=`${activeTheme.accent}35`; }}
                            onMouseLeave={e => { e.currentTarget.style.background=`${activeTheme.accent}20`; }}>
                              ACTIVATE
                            </button>
                            <button onClick={() => {
                              if (confirm("Discard this power-up?")) {
                                setSettings(s => ({ ...s, powerUps: s.powerUps.filter((_, j) => j !== idx) }));
                                setSelectedInvItem(null);
                              }
                            }} style={{
                              padding:"8px 16px", fontSize:9, fontFamily:T.mono, letterSpacing:1,
                              background:"transparent", border:"1px solid rgba(239,68,68,0.2)",
                              borderRadius:6, color:"#ef4444", cursor:"pointer", opacity:0.5,
                            }}>DISCARD</button>
                            <button onClick={() => setSelectedInvItem(null)} style={{
                              padding:"6px 16px", fontSize:9, fontFamily:T.mono, letterSpacing:2,
                              color:T.dim, background:"transparent", border:"none", cursor:"pointer",
                            }}>CLOSE</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
                {}
                <button onClick={() => {
                  if (confirm("Discard all power-ups? This cannot be undone.")) {
                    setSettings(s => ({ ...s, powerUps: [] }));
                  }
                }} style={{ marginTop:8, padding:"8px 16px", fontSize:9, fontFamily:T.mono, letterSpacing:1,
                  background:"transparent", border:"1px solid rgba(239,68,68,0.2)", borderRadius:6,
                  color:"#ef4444", cursor:"pointer", opacity:0.6, transition:"all 0.2s", alignSelf:"center" }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.5)"; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = "0.6"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.2)"; }}>
                  Discard All
                </button>
              </div>
            )}
          </div>
        )}
        {}
        {tab === "settings" && (
          <div style={{ animation:"tabSlideIn 0.3s ease-out" }}>
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:11, letterSpacing:3, textTransform:"uppercase", color:T.muted, fontFamily:T.serif, marginBottom:10 }}>Theme Skin</div>
              <button onClick={() => setShowChipSkins(true)}
                style={{
                  display:"flex", alignItems:"center", gap:10, width:"100%", padding:"10px 14px",
                  borderRadius:8, cursor:"pointer", transition:"all 0.2s",
                  background:`${getChipSkin(settings.chipSkin).accent}10`,
                  border:`1.5px solid ${getChipSkin(settings.chipSkin).accent}40`,
                }}>
                <span style={{ fontSize:16 }}>{getChipSkin(settings.chipSkin).icon}</span>
                <div style={{ textAlign:"left" }}>
                  <div style={{ fontSize:12, fontWeight:700, color:getChipSkin(settings.chipSkin).accent,
                    fontFamily:T.serif }}>{getChipSkin(settings.chipSkin).name}</div>
                  <div style={{ fontSize:9, color:T.dim, fontFamily:T.mono }}>
                    {getUnlockedSkins(stats, chips, vipTier.id).length}/{CHIP_SKINS.length} unlocked — tap to change
                  </div>
                </div>
              </button>
            </div>
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:11, letterSpacing:3, textTransform:"uppercase", color:T.muted, fontFamily:T.serif, marginBottom:10 }}>Animation Speed</div>
              <div style={{ display:"flex", gap:6 }}>
                {[["normal","Normal"],["fast","Fast"],["instant","Instant"]].map(([val, label]) => (
                  <button key={val} onClick={() => setSettings && setSettings(s => ({...s, animSpeed: val}))}
                    style={{
                      flex:1, padding:"10px 8px", borderRadius:8, fontSize:12, fontWeight:600,
                      fontFamily:T.mono, cursor:"pointer", transition:"all 0.2s",
                      background: settings.animSpeed === val ? `${activeTheme.accent}25` : "rgba(255,255,255,0.03)",
                      border: settings.animSpeed === val ? `1.5px solid ${activeTheme.accent}` : "1.5px solid rgba(255,255,255,0.08)",
                      color: settings.animSpeed === val ? activeTheme.accent : T.muted,
                    }}>
                    {label}
                  </button>
                ))}
              </div>
              <div style={{ fontSize:10, color:T.dim, marginTop:6, fontFamily:T.mono }}>
                {settings.animSpeed === "normal" ? "Full animations & dramatic reveals" : settings.animSpeed === "fast" ? "Snappier card deals & reel stops" : "Skip all animations for speed grinding"}
              </div>
            </div>
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:11, letterSpacing:3, textTransform:"uppercase", color:T.muted, fontFamily:T.serif, marginBottom:10 }}>Theme</div>
              <div style={{ display:"flex", gap:6 }}>
                {[["dark","● Dark"],["light","○ Light"]].map(([val, label]) => (
                  <button key={val} onClick={() => setSettings && setSettings(s => ({...s, theme: val}))}
                    style={{
                      flex:1, padding:"10px 8px", borderRadius:8, fontSize:12, fontWeight:600,
                      fontFamily:T.mono, cursor:"pointer", transition:"all 0.2s",
                      background: (settings.theme || "dark") === val ? `${activeTheme.accent}25` : "rgba(255,255,255,0.03)",
                      border: (settings.theme || "dark") === val ? `1.5px solid ${activeTheme.accent}` : "1.5px solid rgba(255,255,255,0.08)",
                      color: (settings.theme || "dark") === val ? activeTheme.accent : T.muted,
                    }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:11, letterSpacing:3, textTransform:"uppercase", color:T.muted, fontFamily:T.serif, marginBottom:10 }}>Win/Loss Overlays</div>
              <button onClick={() => setSettings && setSettings(s => ({...s, skipOverlays: !s.skipOverlays}))}
                style={{
                  padding:"10px 20px", borderRadius:8, fontSize:12, fontWeight:600,
                  fontFamily:T.mono, cursor:"pointer", transition:"all 0.2s",
                  background: !settings.skipOverlays ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.12)",
                  border: !settings.skipOverlays ? "1.5px solid #22c55e" : "1.5px solid rgba(239,68,68,0.3)",
                  color: !settings.skipOverlays ? "#22c55e" : "#ef4444",
                }}>
                {!settings.skipOverlays ? "✅ Overlays On" : "⏭ Overlays Off"}
              </button>
              <div style={{ fontSize:10, color:T.dim, marginTop:6, fontFamily:T.mono }}>
                {!settings.skipOverlays ? "Big Win, Mega Win, and Busted screens play normally" : "Skip all full-screen win/loss overlays — instant rebuy on bust"}
              </div>
            </div>
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:11, letterSpacing:3, textTransform:"uppercase", color:T.muted, fontFamily:T.serif, marginBottom:10 }}>Visual Effects</div>
              <button onClick={() => setSettings && setSettings(s => ({...s, skipEffects: !s.skipEffects}))}
                style={{
                  padding:"10px 20px", borderRadius:8, fontSize:12, fontWeight:600,
                  fontFamily:T.mono, cursor:"pointer", transition:"all 0.2s",
                  background: !settings.skipEffects ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.12)",
                  border: !settings.skipEffects ? "1.5px solid #22c55e" : "1.5px solid rgba(239,68,68,0.3)",
                  color: !settings.skipEffects ? "#22c55e" : "#ef4444",
                }}>
                {!settings.skipEffects ? "✅ Effects On" : "⏭ Effects Off"}
              </button>
              <div style={{ fontSize:10, color:T.dim, marginTop:6, fontFamily:T.mono }}>
                {!settings.skipEffects ? "Coin rain, confetti, screen shake, and color wash" : "Disable all particle effects for better performance"}
              </div>
            </div>
            <div style={{ padding:12, background:"rgba(255,255,255,0.02)", borderRadius:8, border:"1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize:11, letterSpacing:3, textTransform:"uppercase", color:T.muted, fontFamily:T.serif, marginBottom:8 }}>Account</div>
              <div style={{ fontSize:12, color:activeTheme.accent, fontFamily:T.mono, marginBottom:4 }}> {username}</div>
              <div style={{ fontSize:10, color:T.dim, fontFamily:T.mono }}>
                {Object.values(stats.gamesPlayed).reduce((a,b)=>a+b,0)} rounds played · ${chips.toLocaleString()} chips
              </div>
            </div>
          </div>
        )}
          </div>
        </div>
      </div>
      {}
      <div className={isRainbow ? "anim-rainbow-border" : ""} style={{ flexShrink:0, zIndex:10, display:"flex", justifyContent:"space-around", alignItems:"stretch",
        borderTop:`1px solid ${activeTheme.accent}18`, background: isJackpotSkin ? "rgba(18,14,4,0.7)" : "rgba(10,8,18,0.6)", backdropFilter:"blur(12px)", WebkitBackdropFilter:"blur(12px)",
        boxShadow: activeTheme.navTint !== "transparent" ? `inset 0 0 40px ${activeTheme.navTint}` : "none",
        paddingBottom:"env(safe-area-inset-bottom, 0px)", position:"relative", overflow:"hidden" }}>
        {}
        {isJackpotSkin && (
          <div style={{ position:"absolute", top:0, bottom:0, width:"20%", pointerEvents:"none",
            background:"linear-gradient(90deg, transparent, rgba(255,215,0,0.1), rgba(255,248,200,0.15), rgba(255,215,0,0.1), transparent)",
            animation:"goldGlintSweep 5s ease-in-out 2s infinite", zIndex:0 }} />
        )}
        {[
          { id:"games", icon:"♠", label:"Games" },
          { id:"shop", icon:"$", label:"Shop" },
          { id:"inventory", icon:"◈", label:"Items" },
          { id:"trophies", icon:"★", label:"Feats" },
          { id:"settings", icon:"⚙", label:"Settings" },
        ].map(t => {
          const isActive = tab === t.id;
          return (
            <button key={t.id} onClick={() => { setTab(t.id); if (t.id === "trophies") setSeenAchCount(stats.achievements?.length || 0); }} style={{
              flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
              gap:2, padding:"10px 4px 8px", cursor:"pointer", transition:"all 0.2s",
              background:"transparent", border:"none", position:"relative",
            }}>
              {}
              <div style={{ position:"absolute", top:0, left:"20%", right:"20%", height:2, borderRadius:1,
                background: isActive ? (isRainbow ? "linear-gradient(90deg, transparent, #ff6ec7, #f7e84e, #4cff50, #3cb8ff, transparent)" : `linear-gradient(90deg, transparent, ${activeTheme.accent}, transparent)`) : "transparent",
                transition:"all 0.3s", opacity: isActive ? 1 : 0 }} />
              <span style={{ fontSize:20, lineHeight:1,
                filter: isActive ? "none" : "grayscale(0.8) brightness(0.6)",
                transition:"all 0.2s",
                transform: isActive ? "scale(1.1)" : "scale(1)",
              }}>{t.icon}</span>
              <span style={{ fontSize:8, fontWeight:700, letterSpacing:1.5, textTransform:"uppercase",
                fontFamily:T.mono,
                color: isActive ? activeTheme.accent : T.dim,
                transition:"all 0.2s",
              }}>{t.label}</span>
              {t.id === "trophies" && tab !== "trophies" && (stats.achievements?.length || 0) > seenAchCount && (
                <div style={{ position:"absolute", top:6, right:"calc(50% - 18px)", width:14, height:14,
                  borderRadius:7, background:`${activeTheme.accent}cc`, display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:8, fontWeight:700, color:"#fff", fontFamily:T.mono }}>{(stats.achievements?.length || 0) - seenAchCount}</div>
              )}
            </button>
          );
        })}
      </div>
      {}
      {testCoinRain && <CoinRain intensity={testCoinRain} />}
      {testWash && <ScreenColorWash type={testWash} onDismiss={() => setTestWash(null)} />}
      {testConfetti && <ConfettiCanvas type={testConfetti.type} key={testConfetti.key} />}
      {testEruption && <ChipEruption count={16} />}
      {testShake && <div style={{
        position:"fixed", top:0, left:0, right:0, bottom:0, pointerEvents:"none", zIndex:99999,
        animation: testShake === "epic" ? "epicShake 0.8s ease-out" : testShake === "heavy" ? "screenShake 0.5s ease-out" : "lossShake 0.3s ease-out",
      }} />}
      {}
      {testOverlay === "big" && <BigWinOverlay type="big" amount={2500} onDone={() => { setTestOverlay(null); setTimeout(()=>setTestCoinRain(null), 15000); setTestWash(null); setTestConfetti(null); setTestEruption(false); }} />}
      {testOverlay === "mega" && <BigWinOverlay type="mega" amount={25000} onDone={() => { setTestOverlay(null); setTimeout(()=>setTestCoinRain(null), 15000); setTestWash(null); setTestConfetti(null); setTestEruption(false); }} />}
      {testOverlay === "epic" && <BigWinOverlay type="epic" amount={100000} onDone={() => { setTestOverlay(null); setTimeout(()=>setTestCoinRain(null), 15000); setTestWash(null); setTestConfetti(null); setTestEruption(false); }} />}
      {testOverlay === "jackpot" && <JackpotOverlay amount={5000000} onDone={() => { setTestOverlay(null); setTimeout(()=>setTestCoinRain(null), 15000); setTestWash(null); setTestConfetti(null); setTestEruption(false); }} />}
      {showVipDetails && <VipDetailsModal vipPoints={vipPoints} stats={stats} onClose={() => setShowVipDetails(false)} accent={activeTheme.accent} modalBg={activeTheme.modalBg} modalBorder={activeTheme.modalBorder} />}
      {showChipSkins && <ChipSkinModal stats={stats} chips={chips} vipTierId={vipTier.id}
        currentSkin={settings.chipSkin || "house"} activeTheme={activeTheme}
        onSelect={id => { setSettings(s => ({...s, chipSkin: id})); setShowChipSkins(false); }}
        onClose={() => setShowChipSkins(false)} />}
    </div>
  );
}
function HandDisplay({ cards, hideFirst = false, label, value, isActive = false, flipReveal = false }) {
  const displayValue = hideFirst && cards.length >= 2 ? cardVal(cards[1]) : value;
  const isMobileH = typeof window !== "undefined" && window.innerWidth < 480;
  const cardOverlap = isMobileH ? (cards.length > 4 ? -24 : -18) : -12;
  const isBJHand = !hideFirst && cards.length === 2 && value === 21;
  return (
    <div style={{ textAlign:"center" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginBottom:10 }}>
        <span style={{ fontFamily:T.serif, fontSize:13, textTransform:"uppercase", letterSpacing:3, color:_themeAccent, fontWeight:600 }}>{label}</span>
        <span style={{ background: isActive ? _themeAccent : `${_themeAccent}40`, color: isActive ? "#1a1a2e" : _themeAccent, padding:"2px 10px", borderRadius:12, fontSize:13, fontWeight:"bold", fontFamily:T.mono,
          transition:"all 0.3s", animation: isActive ? "activeHandGlow 1.5s ease-in-out infinite" : "none" }}>
          {hideFirst ? `${displayValue}+?` : displayValue}
        </span>
      </div>
      <div style={{ display:"flex", justifyContent:"center", minHeight: isMobileH ? 100 : 134,
        padding:"4px 8px", borderRadius:12, transition:"all 0.3s",
        background: isActive ? `${_themeAccent}0a` : "transparent",
        animation: isBJHand ? "bjCelebrate 0.8s ease-out forwards" : "none" }}>
        {cards.map((card, i) => (
          <div key={i} style={{ marginLeft: i > 0 ? cardOverlap : 0, zIndex:i, transform: isActive ? "translateY(-4px)" : "none", transition:"transform 0.2s" }}>
            <Card card={card} hidden={hideFirst && i === 0} index={i} flipping={flipReveal && i === 0} />
          </div>
        ))}
      </div>
    </div>
  );
}
function BlackjackGame({ chips, setChips, onBack, onRebuy, startChips, lastBets = {}, setLastBet, winStreak = 0, vipPoints = 0, achCount = 0, reportLoss, applyWin = null, onBetPlaced = null, onRoundEnd, skipOverlays = false, skipEffects = false, theme = "dark", skinTheme, skinId = "house", activePowerUps = [] }) {
  const [deck, setDeck] = useState(() => createDeck(6));
  const [playerHands, setPlayerHands] = useState([[]]);
  const [activeHand, setActiveHand] = useState(0);
  const [dealerHand, setDealerHand] = useState([]);
  const [bet, setBet] = useState(() => Math.min(lastBets?.blackjack || 25, chips));
  useEffect(() => { if (setLastBet) setLastBet("blackjack", bet); }, [bet, setLastBet]);
  const [bets, setBets] = useState([0]);
  const [phase, setPhase] = useState("betting");
  useEffect(() => { if (phase === "resolved" && onRoundEnd) onRoundEnd(); }, [phase, onRoundEnd]);
  const [results, setResults] = useState([]);
  const [message, setMessage] = useState("Place your bet");
  const [stats, setStats] = useState({ wins:0, losses:0, pushes:0, blackjacks:0 });
  const fx = useWinEffects();
  const { shaking, shake, shakeIntensity, floatWins, addFloatWin, flash, triggerFlash, lightMode, triggerLights,
    bigWin, setBigWin, dismissOverlay, dismissAll, celebrateWin, shellEffects, coinRainActive, triggerCoins, softCoinRain, washType, triggerWash,
    confetti, triggerConfetti, eruptionActive, triggerEruption } = fx;
  const handVal = (hand) => {
    let t = 0, a = 0;
    for (const c of hand) { t += cardVal(c); if (c.rank === "A") a++; }
    while (t > 21 && a > 0) { t -= 10; a--; }
    return t;
  };
  const isBJ = (hand) => hand.length === 2 && handVal(hand) === 21;
  const deckRef = useRef(deck);
  useEffect(() => { deckRef.current = deck; }, [deck]);
  const drawCard = useCallback(() => {
    let d = [...deckRef.current];
    if (d.length < 20) d = createDeck(6);
    const card = d.pop();
    deckRef.current = d;
    setDeck(d);
    return card;
  }, []);
  const [insuranceOffered, setInsuranceOffered] = useState(false);
  const [insuranceBet, setInsuranceBet] = useState(0);
  const deal = () => {
    if (bet > chips) return;
    let d = [...deck];
    if (d.length < 20) d = createDeck(6);
    const p = [d.pop(), d.pop()], dl = [d.pop(), d.pop()];
    setDeck(d); setPlayerHands([p]); setDealerHand(dl);
    setChips(c => c - bet); if (onBetPlaced) onBetPlaced(bet); setBets([bet]); setResults([]);
    setActiveHand(0); setInsuranceOffered(false); setInsuranceBet(0);
    if (isBJ(p)) {
      if (isBJ(dl)) {
        setResults(["push"]); setChips(c => c + bet);
        setMessage("Both blackjack — Push!");
        setStats(s => ({ ...s, pushes: s.pushes + 1 }));
        setPhase("resolved"); triggerLights("push");
      } else {
        const w = Math.floor(bet * 2.5);
        setResults(["blackjack"]); if (applyWin) applyWin(w); else setChips(c => c + w);
        setMessage(`Blackjack! +$${w - bet}`);
        setStats(s => ({ ...s, wins: s.wins + 1, blackjacks: s.blackjacks + 1 }));
        setPhase("resolved"); triggerFlash(); shake();
        triggerLights("big"); addFloatWin(w - bet, { x: 50, y: 30 });
        softCoinRain(winStreak);
      }
    } else if (dl[1].rank === "A" && !isBJ(p)) {
      setInsuranceOffered(true); setPhase("insurance");
      setMessage("Dealer shows Ace — Insurance?");
    } else {
      setPhase("playing"); setMessage("Hit, Stand, or Double?");
    }
  };
  const takeInsurance = () => {
    const ins = Math.floor(bet / 2);
    setChips(c => c - ins); setInsuranceBet(ins); setInsuranceOffered(false);
    if (isBJ(dealerHand)) {
      setChips(c => c + ins * 3); setResults(["insurance"]);
      setMessage(`Dealer blackjack! Insurance pays +$${ins * 2}`);
      setStats(s => ({ ...s, pushes: s.pushes + 1 }));
      setPhase("resolved"); triggerFlash(); triggerLights("win"); softCoinRain(winStreak);
    } else {
      setPhase("playing"); setMessage("No blackjack. Hit, Stand, or Double?");
    }
  };
  const declineInsurance = () => {
    setInsuranceOffered(false);
    if (isBJ(dealerHand)) {
      setResults(["lose"]); setMessage("Dealer blackjack! You lose.");
      setStats(s => ({ ...s, losses: s.losses + 1 }));
      setPhase("resolved"); triggerLights("loss");
      if (reportLoss) reportLoss(bet);
    } else {
      setPhase("playing"); setMessage("Hit, Stand, or Double?");
    }
  };
  const surrender = () => {
    if (phase !== "playing" || playerHands[activeHand]?.length !== 2) return;
    const refund = Math.floor(bet / 2);
    setChips(c => c + refund); setResults(["surrender"]);
    setMessage(`Surrendered — $${refund} returned`);
    setStats(s => ({ ...s, losses: s.losses + 1 }));
    setPhase("resolved"); triggerLights("loss");
    if (reportLoss) reportLoss(bet - refund);
  };
  const hit = () => {
    const c = drawCard();
    const nh = [...playerHands];
    nh[activeHand] = [...nh[activeHand], c];
    setPlayerHands(nh);
    if (handVal(nh[activeHand]) > 21) nextHand(nh);
  };
  const stand = () => nextHand(playerHands);
  const betsRef = useRef(bets);
  useEffect(() => { betsRef.current = bets; }, [bets]);
  const dbl = () => {
    if (chips < bets[activeHand]) return;
    setChips(c => c - bets[activeHand]);
    const nb = [...bets]; nb[activeHand] *= 2; setBets(nb);
    betsRef.current = nb;
    const c = drawCard();
    const nh = [...playerHands];
    nh[activeHand] = [...nh[activeHand], c];
    setPlayerHands(nh); nextHand(nh);
  };
  const split = () => {
    const h = playerHands[activeHand];
    if (h.length !== 2 || h[0].rank !== h[1].rank) return;
    if (chips < bets[activeHand]) return;
    setChips(c => c - bets[activeHand]);
    const c1 = drawCard(), c2 = drawCard();
    const nh = [...playerHands];
    nh.splice(activeHand, 1, [h[0], c1], [h[1], c2]);
    setPlayerHands(nh);
    const nb = [...bets];
    nb.splice(activeHand, 1, bets[activeHand], bets[activeHand]);
    setBets(nb);
    betsRef.current = nb;
    setMessage(`Hand ${activeHand + 1} of ${nh.length}`);
  };
  const nextHand = (hands) => {
    if (activeHand < hands.length - 1) {
      setActiveHand(activeHand + 1);
      setMessage(`Hand ${activeHand + 2} of ${hands.length}`);
    } else {
      resolve(hands);
    }
  };
  const resolve = (hands) => {
    setPhase("dealer");
    let d = [...deck], dH = [...dealerHand];
    if (!hands.every(h => handVal(h) > 21)) {
      while (handVal(dH) < 17) {
        if (d.length < 5) d = createDeck(6);
        dH.push(d.pop());
      }
    }
    setDeck(d); setDealerHand(dH);
    const currentBets = betsRef.current;
    const dv = handVal(dH), db = dv > 21;
    const nr = []; let tw = 0; const ns = { ...stats };
    hands.forEach((h, i) => {
      const pv = handVal(h), b = currentBets[i] || bet;
      if (pv > 21) { nr.push("bust"); ns.losses++; }
      else if (db || pv > dv) { nr.push("win"); tw += b * 2; ns.wins++; }
      else if (pv === dv) { nr.push("push"); tw += b; ns.pushes++; }
      else { nr.push("lose"); ns.losses++; }
    });
    const net = tw - currentBets.reduce((a, b) => a + b, 0);
    if (net > 0) {
      if (applyWin) applyWin(tw); else setChips(c => c + tw);
    } else {
      setChips(c => c + tw);
    }
    setResults(nr); setStats(ns);
    if (net > 0) {
      triggerFlash(); triggerLights("win");
      addFloatWin(net, { x: 50, y: 30 });
      if (net >= bet * 3) { shake(); triggerLights("big"); softCoinRain(winStreak); }
      else { softCoinRain(winStreak); }
    } else if (net === 0) {
      triggerLights("push");
    } else {
      triggerLights("loss");
      if (reportLoss) reportLoss(Math.abs(net));
    }
    setMessage(tw === 0 ? "Dealer wins" : net > 0 ? `You win +$${net}!` : net === 0 ? "Push" : `You lose $${Math.abs(net)}`);
    setPhase("resolved");
  };
  const newRound = () => {
    setBigWin(null);
    fx.clearLights();
    if (chips <= 0) { setStats({ wins:0, losses:0, pushes:0, blackjacks:0 }); }
    setMessage("Place your bet");
    setPlayerHands([[]]); setDealerHand([]); setResults([]);
    setBets([0]); setActiveHand(0); setPhase("betting");
    setBet(b => Math.min(b, chips > 0 ? chips : 1000));
  };
  const canDbl = phase === "playing" && playerHands[activeHand]?.length === 2 && chips >= bets[activeHand];
  const canSpl = phase === "playing" && playerHands[activeHand]?.length === 2 && playerHands[activeHand][0].rank === playerHands[activeHand][1].rank;
  const handleKey = useCallback((key) => {
    if (phase === "betting" && (key === " " || key === "Enter")) deal();
    else if (phase === "playing") {
      if (key === "h") hit(); else if (key === "s") stand();
      else if (key === "d" && canDbl) dbl(); else if (key === "p" && canSpl) split();
      else if (key === "r") surrender();
    }
    else if (phase === "resolved" && (key === " " || key === "Enter")) newRound();
    else if (phase === "insurance") { if (key === "y") takeInsurance(); else if (key === "n") declineInsurance(); }
  }, [phase, canDbl, canSpl]);
  const msgColor = results.includes("blackjack") ? "#f1c40f" : results.includes("win") ? T.green
    : results.includes("bust") || results.includes("lose") ? T.red : _themeAccent;
  const bjSessionDetail = (stats.wins + stats.losses + stats.pushes) > 0 ? (
    <div style={{ display:"flex", gap:16, fontFamily:T.mono, fontSize:10, color:T.muted }}>
      <span>W: <span style={{color:T.green}}>{stats.wins}</span></span>
      <span>L: <span style={{color:T.redDark}}>{stats.losses}</span></span>
      <span>P: <span style={{color:_themeAccent}}>{stats.pushes}</span></span>
      <span>BJ: <span style={{color:"#f1c40f"}}>{stats.blackjacks}</span></span>
    </div>
  ) : null;
  return (
    <GameShell bg={FELT_BG} title="BLACKJACK" chips={chips} onBack={onBack} {...shellEffects} startChips={startChips} winStreak={winStreak} vipPoints={vipPoints} achCount={achCount} skipOverlays={skipOverlays} skipEffects={skipEffects} onRebuy={onRebuy} theme={theme} skinTheme={skinTheme} skinId={skinId} activePowerUps={activePowerUps} onKeyAction={handleKey} sessionDetail={bjSessionDetail} rules={<>
        <p style={{marginTop:0}}>Beat the dealer by getting closer to 21 without going over.</p>
        <p><span style={{color:_themeAccent}}>Card Values:</span> Number cards are face value. Face cards (J/Q/K) = 10. Aces = 1 or 11.</p>
        <p><span style={{color:_themeAccent}}>Gameplay:</span> You and the dealer each get 2 cards. One dealer card is face down. Hit to take another card, Stand to keep your hand.</p>
        <p><span style={{color:_themeAccent}}>Double Down:</span> Double your bet and receive exactly one more card.</p>
        <p><span style={{color:_themeAccent}}>Split:</span> If your first two cards match rank, split into two separate hands (each with its own bet).</p>
        <p><span style={{color:_themeAccent}}>Blackjack:</span> An Ace + 10-value card on the initial deal pays 3:2.</p>
        <p><span style={{color:_themeAccent}}>Dealer Rules:</span> Dealer must hit on 16 or less and stand on 17 or more.</p>
        <p><span style={{color:_themeAccent}}>Insurance:</span> When dealer shows an Ace, you can pay half your bet as insurance. If dealer has blackjack, insurance pays 2:1.</p>
        <p><span style={{color:_themeAccent}}>Surrender:</span> On your first two cards, give up half your bet to fold. Available before hitting.</p>
        <p><span style={{color:_themeAccent}}>Bust:</span> Going over 21 is an automatic loss. If both bust, the dealer wins.</p>
        <p style={{color:T.muted, fontSize:11}}>House edge: ~0.5% with optimal play. Uses 6 decks.</p>
      </>}>
      {}
      <div style={{ display:"flex", flexDirection:"column",
        alignItems:"center", gap:16, width:"100%", maxWidth:520, padding:"0 16px", zIndex:1 }}>
        <div style={{ fontSize:16, fontWeight:600, textAlign:"center", minHeight:24,
          animation:"fadeIn 0.3s ease", letterSpacing:1, color:msgColor }}>{message}</div>
        {dealerHand.length > 0 && (
          <HandDisplay cards={dealerHand} hideFirst={phase === "playing"} label="Dealer" value={handVal(dealerHand)} flipReveal={phase !== "playing" && phase !== "betting"} />
        )}
        {playerHands[0].length > 0 && (
          <div style={{ display:"flex", gap:28, flexWrap:"wrap", justifyContent:"center" }}>
            {playerHands.map((hand, i) => (
              <div key={i} style={{ opacity: results[i] === "bust" ? 0.5 : 1, transition:"opacity 0.3s" }}>
                <HandDisplay cards={hand} label={playerHands.length > 1 ? `Hand ${i+1}` : "You"}
                  value={handVal(hand)} isActive={phase === "playing" && i === activeHand} />
                {results[i] && (
                  <div style={{ textAlign:"center", marginTop:8, fontSize:12, fontWeight:700,
                    letterSpacing:2, textTransform:"uppercase",
                    animation:"resultBadge 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
                    padding:"3px 12px", borderRadius:6, display:"inline-block",
                    background: results[i] === "win" || results[i] === "blackjack" ? "rgba(34,197,94,0.12)" : results[i] === "push" ? `${_themeAccent}1f` : "rgba(239,68,68,0.12)",
                    border: `1px solid ${results[i] === "win" || results[i] === "blackjack" ? "rgba(34,197,94,0.3)" : results[i] === "push" ? `${_themeAccent}4d` : "rgba(239,68,68,0.3)"}`,
                    color: results[i] === "win" || results[i] === "blackjack" ? T.green : results[i] === "push" ? _themeAccent : T.red }}>
                    {results[i] === "blackjack" ? "♠ BLACKJACK ♠" : results[i]}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      {}
      <div style={{ padding:12, width:"100%", maxWidth:520, zIndex:1 }}>
        {phase === "betting" && (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:16 }}>
            <BetControls bet={bet} setBet={setBet} chips={chips} presets={[10,25,50,100,250]} />
            <GoldButton onClick={deal} disabled={bet > chips || bet < 1} hint="⏎ deal">Deal</GoldButton>
          </div>
        )}
        {phase === "insurance" && (
          <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap", animation:"fadeIn 0.3s ease" }}>
            <ActionButton label={`Insurance ($${Math.floor(bet/2)})`} onClick={takeInsurance} enabled={chips >= Math.floor(bet/2)} />
            <ActionButton label="No Insurance" onClick={declineInsurance} />
          </div>
        )}
        {phase === "playing" && (
          <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap", animation:"fadeIn 0.3s ease" }}>
            {[
              { l:"Hit", fn:hit, ok:true },
              { l:"Stand", fn:stand, ok:true },
              { l:"Double Down", fn:dbl, ok:canDbl },
              { l:"Split", fn:split, ok:canSpl },
              { l:"Surrender", fn:surrender, ok:playerHands[activeHand]?.length === 2 && playerHands.length === 1 },
            ].map(({ l, fn, ok }) => (
              <ActionButton key={l} label={l} onClick={fn} enabled={ok} />
            ))}
          </div>
        )}
        {phase === "resolved" && (
          <div style={{ display:"flex", gap:8, justifyContent:"center", flexWrap:"wrap" }}>
            <GoldButton onClick={newRound} small>Change Bet</GoldButton>
            {bet <= chips && bet >= 1 && (
              <GoldButton onClick={() => { newRound(); setTimeout(deal, 50); }}>Rebet ${bet} ♠</GoldButton>
            )}
          </div>
        )}
      </div>
      <div style={{ padding:12, fontSize:10, color:T.faint, letterSpacing:2, textTransform:"uppercase", zIndex:1 }}>
        6-Deck · Dealer Stands on 17 · Blackjack Pays 3:2
      </div>
      <FloatingWins wins={floatWins} />
    </GameShell>
  );
}
const VP_PAY_TABLE = [
  { name:"Royal Flush", mult:801, rank:9 },
  { name:"Straight Flush", mult:51, rank:8 },
  { name:"Four of a Kind", mult:26, rank:7 },
  { name:"Full House", mult:10, rank:6 },
  { name:"Flush", mult:7, rank:5 },
  { name:"Straight", mult:5, rank:4 },
  { name:"Three of a Kind", mult:4, rank:3 },
  { name:"Two Pair", mult:3, rank:2 },
  { name:"Jacks or Better", mult:2, rank:1 },
];
function evaluateVPHand(cards) {
  const RANK_VAL = {"2":2,"3":3,"4":4,"5":5,"6":6,"7":7,"8":8,"9":9,"10":10,"J":11,"Q":12,"K":13,"A":14};
  const vals = cards.map(c => RANK_VAL[c.rank]).sort((a,b) => a - b);
  const suits = cards.map(c => c.suit);
  const isFlush = suits.every(s => s === suits[0]);
  const isAceLowStraight = vals[0]===2 && vals[1]===3 && vals[2]===4 && vals[3]===5 && vals[4]===14;
  const isHighStraight = vals[4] - vals[0] === 4 && new Set(vals).size === 5;
  const isStraight = isHighStraight || isAceLowStraight;
  const counts = {};
  vals.forEach(v => counts[v] = (counts[v]||0) + 1);
  const freq = Object.values(counts).sort((a,b) => b - a);
  const isRoyal = isFlush && isStraight && vals[0] === 10;
  if (isRoyal) return { name:"Royal Flush", mult:801, rank:9 };
  if (isFlush && isStraight) return { name:"Straight Flush", mult:51, rank:8 };
  if (freq[0] === 4) return { name:"Four of a Kind", mult:26, rank:7 };
  if (freq[0] === 3 && freq[1] === 2) return { name:"Full House", mult:10, rank:6 };
  if (isFlush) return { name:"Flush", mult:7, rank:5 };
  if (isStraight) return { name:"Straight", mult:5, rank:4 };
  if (freq[0] === 3) return { name:"Three of a Kind", mult:4, rank:3 };
  if (freq[0] === 2 && freq[1] === 2) return { name:"Two Pair", mult:3, rank:2 };
  if (freq[0] === 2) {
    const pairVal = parseInt(Object.entries(counts).find(([k,v]) => v === 2)[0]);
    if (pairVal >= 11) return { name:"Jacks or Better", mult:2, rank:1 };
  }
  return { name:"No Win", mult:0, rank:0 };
}
function VideoPokerGame({ chips, setChips, onBack, onRebuy, startChips, lastBets = {}, setLastBet, winStreak = 0, vipPoints = 0, achCount = 0, reportLoss, applyWin = null, onBetPlaced = null, onRoundEnd, skipOverlays = false, skipEffects = false, theme = "dark", skinTheme, skinId = "house", activePowerUps = [] }) {
  const [deck, setDeck] = useState(() => createDeck(1));
  const [hand, setHand] = useState([null,null,null,null,null]);
  const [held, setHeld] = useState([false,false,false,false,false]);
  const [bet, setBet] = useState(() => Math.min(lastBets?.poker || 5, chips));
  useEffect(() => { if (setLastBet) setLastBet("poker", bet); }, [bet, setLastBet]);
  const [phase, setPhase] = useState("betting");
  const [result, setResult] = useState(null);
  const [winAmount, setWinAmount] = useState(0);
  const [showOverlay, setShowOverlay] = useState(false);
  const [replacedCards, setReplacedCards] = useState(new Set());
  const [drawKey, setDrawKey] = useState(0);
  const fx = useWinEffects();
  const { shaking, shake, shakeIntensity, floatWins, addFloatWin, flash, triggerFlash, lightMode, triggerLights,
    bigWin, setBigWin, dismissOverlay, dismissAll, celebrateWin, shellEffects, coinRainActive, triggerCoins, softCoinRain, washType, triggerWash,
    confetti, triggerConfetti, eruptionActive, triggerEruption } = fx;
  useEffect(() => { if (phase === "result" && onRoundEnd) onRoundEnd(); }, [phase, onRoundEnd]);
  const deal = () => {
    let d = createDeck(1);
    for (let i = d.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [d[i], d[j]] = [d[j], d[i]];
    }
    const newHand = d.splice(0, 5);
    setDeck(d);
    setHand(newHand);
    setHeld([false,false,false,false,false]);
    setChips(c => c - bet);
    if (onBetPlaced) onBetPlaced(bet);
    setResult(null);
    setWinAmount(0);
    setPhase("dealt");
  };
  const toggleHold = (idx) => {
    if (phase !== "dealt") return;
    setHeld(h => { const n = [...h]; n[idx] = !n[idx]; return n; });
  };
  const draw = () => {
    setPhase("drawing");
    const d = [...deck];
    const replaced = new Set();
    const newHand = hand.map((card, i) => {
      if (held[i]) return card;
      replaced.add(i);
      return d.pop();
    });
    setDeck(d);
    setReplacedCards(replaced);
    setDrawKey(k => k + 1);
    setTimeout(() => {
      setHand(newHand);
      const res = evaluateVPHand(newHand);
      setResult(res);
      if (res.mult > 0) {
        const payout = bet * res.mult;
        setWinAmount(payout);
        if (applyWin) applyWin(payout); else setChips(c => c + payout);
        const profit = payout - bet;
        if (profit > 0) addFloatWin(profit, {x:50, y:30});
        triggerFlash();
        if (res.rank >= 7) { shake(); triggerLights("mega"); softCoinRain(winStreak); }
        else if (res.rank >= 4) { shake(); triggerLights("big"); softCoinRain(winStreak); }
        else { triggerLights("win"); softCoinRain(winStreak); }
      } else {
        triggerLights("loss");
        if (reportLoss) reportLoss(bet);
      }
      setPhase("result");
    }, 400);
  };
  const newRound = () => {
    fx.clearLights();
    setBet(b => Math.min(b, chips > 0 ? chips : 5));
    setPhase("betting");
    setHand([null,null,null,null,null]);
    setHeld([false,false,false,false,false]);
    setResult(null);
    setWinAmount(0);
    setReplacedCards(new Set());
  };
  const BLUE_BG = "linear-gradient(180deg, #181310 0%, #0e0a08 50%, #080604 100%)";
  const handleKey = useCallback((key) => {
    if (phase==="betting" && (key===" "||key==="Enter")) deal();
    else if (phase==="dealt") { if(key>="1"&&key<="5") toggleHold(parseInt(key)-1); else if(key===" "||key==="Enter") draw(); }
    else if (phase==="result" && (key===" "||key==="Enter")) newRound();
  }, [phase]);
  return (
    <GameShell bg={BLUE_BG} title="VIDEO POKER" chips={chips} onBack={onBack} {...shellEffects} startChips={startChips} winStreak={winStreak} vipPoints={vipPoints} achCount={achCount} skipOverlays={skipOverlays} skipEffects={skipEffects} onRebuy={onRebuy} theme={theme} skinTheme={skinTheme} skinId={skinId} activePowerUps={activePowerUps} onKeyAction={handleKey} rules={<>
        <p style={{marginTop:0}}>Classic Jacks or Better video poker. Make the best 5-card hand.</p>
        <p><span style={{color:_themeAccent}}>Deal:</span> Place a bet and receive 5 cards face up.</p>
        <p><span style={{color:_themeAccent}}>Hold & Draw:</span> Click cards to hold them, then draw to replace the rest. Your final hand determines the payout.</p>
        <p><span style={{color:_themeAccent}}>Minimum Win:</span> A pair of Jacks, Queens, Kings, or Aces pays 1:1. Lower pairs don't pay.</p>
        <p><span style={{color:_themeAccent}}>Pay Table:</span> Two Pair 2×, Three of a Kind 3×, Straight 4×, Flush 6×, Full House 9×, Four of a Kind 25×, Straight Flush 50×, Royal Flush 800×.</p>
        <p><span style={{color:_themeAccent}}>Strategy:</span> Always hold winning hands. Hold high cards (J+) for a chance at Jacks or Better. Hold suited connectors for straight/flush draws.</p>
        <p style={{color:T.muted, fontSize:11}}>RTP: ~99.5% with optimal play. Uses 1 deck.</p>
      </>}>
      <FloatingWins wins={floatWins} />
      <div style={{ padding:"12px", position:"relative", zIndex:1, maxWidth:480, margin:"0 auto" }}>
        {}
        <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(59,130,246,0.2)",
          borderRadius:10, padding:"8px 12px", marginBottom:14 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr auto", gap:"2px 12px", fontSize:11,
            fontFamily:T.mono }}>
            {VP_PAY_TABLE.map(row => {
              const isHit = result && result.rank === row.rank;
              return (
              <React.Fragment key={row.rank}>
                <div style={{ color: isHit ? (row.rank >= 8 ? "#f1c40f" : "#22c55e") : "#8a8070",
                  fontWeight: isHit ? 700 : 400,
                  transition:"all 0.3s",
                  textShadow: isHit && row.rank >= 8 ? "0 0 8px rgba(241,196,15,0.4)" : "none" }}>{row.name}</div>
                <div style={{ color: isHit ? (row.rank >= 8 ? "#f1c40f" : "#22c55e") : _themeAccent,
                  fontWeight:600, textAlign:"right",
                  transition:"all 0.3s",
                  textShadow: isHit && row.rank >= 8 ? "0 0 8px rgba(241,196,15,0.4)" : "none" }}>{row.mult - 1}×</div>
              </React.Fragment>
              );
            })}
          </div>
        </div>
        {}
        <div style={{ display:"flex", justifyContent:"center", gap:6, marginBottom:8, minHeight:130 }}>
          {hand.map((card, i) => {
            const isReplaced = phase === "result" && replacedCards.has(i);
            const isWinCard = phase === "result" && result && result.mult > 0;
            const isRoyal = result && result.rank >= 8;
            return (
            <div key={i} onClick={() => toggleHold(i)} style={{
              cursor: phase === "dealt" ? "pointer" : "default",
              transform: held[i] ? "translateY(-10px)" : "none",
              transition:"transform 0.15s",
              position:"relative",
              perspective: 600,
            }}>
              {card ? (
                <div style={{
                  animation: isReplaced ? `pokerFlipIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 0.08}s both` : undefined,
                  borderRadius: 6,
                  ...(isWinCard ? {
                    animation: isRoyal ? `pokerRoyalCard 1.2s ease-in-out infinite` : `pokerWinCard 1.5s ease-in-out infinite`,
                    borderRadius: 6,
                  } : {}),
                }}>
                  <Card card={card} small key={`${drawKey}-${i}`} />
                </div>
              ) : (
                <div style={{ width:60, height:84, borderRadius:6, border:"2px dashed rgba(59,130,246,0.2)",
                  background:"rgba(255,255,255,0.02)" }} />
              )}
              {held[i] && (
                <div style={{ position:"absolute", top:-14, left:"50%", transform:"translateX(-50%)",
                  fontSize:9, fontWeight:700, fontFamily:T.mono,
                  color:"#3b82f6", letterSpacing:1, textTransform:"uppercase",
                  background:"rgba(59,130,246,0.15)", padding:"1px 6px", borderRadius:3,
                  animation:"holdBadgePulse 1.5s ease-in-out infinite",
                  boxShadow:"0 0 8px rgba(59,130,246,0.2)" }}>HELD</div>
              )}
            </div>
            );
          })}
        </div>
        {}
        {phase === "dealt" && (
          <div style={{ textAlign:"center", fontSize:11, color:T.muted, fontFamily:T.mono,
            letterSpacing:1, marginBottom:10 }}>
            Click cards to hold, then draw
          </div>
        )}
        {}
        {result && (
          <div style={{ textAlign:"center", marginBottom:12, animation:"resultBadge 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards" }}>
            <div style={{ fontSize: result.rank >= 8 ? 22 : 18, fontWeight:700, letterSpacing: result.rank >= 7 ? 3 : 2,
              fontFamily:T.serif, display:"inline-block",
              padding: result.mult > 0 ? "4px 16px" : "4px 12px", borderRadius:8,
              background: result.rank >= 8 ? "rgba(241,196,15,0.12)" : result.rank >= 5 ? "rgba(34,197,94,0.1)" : result.mult > 0 ? "rgba(34,197,94,0.06)" : "rgba(239,68,68,0.08)",
              border: result.rank >= 8 ? "1px solid rgba(241,196,15,0.4)" : result.rank >= 5 ? "1px solid rgba(34,197,94,0.3)" : "none",
              color: result.rank >= 8 ? "#f1c40f" : result.mult > 0 ? "#22c55e" : "#ef4444",
              textShadow: result.rank >= 8 ? "0 0 15px rgba(241,196,15,0.4)" : "none" }}>
              {result.rank >= 8 ? `✦ ${result.name} ✦` : result.name}{result.mult > 0 ? ` — ${result.mult === 1 ? "Push" : `+$${winAmount - bet}`}!` : ""}
            </div>
          </div>
        )}
        {}
        {phase === "betting" && (
          <div style={{ textAlign:"center" }}>
            <BetControls bet={bet} setBet={setBet} chips={chips} presets={[1,5,10,25,50]} />
            <div style={{ marginTop:8 }}>
              <GoldButton onClick={deal} disabled={chips < bet || bet <= 0} hint="⏎ deal">Deal</GoldButton>
            </div>
          </div>
        )}
        {}
        {phase === "dealt" && (
          <div style={{ textAlign:"center" }}>
            <GoldButton onClick={draw} hint="⏎ draw">Draw</GoldButton>
          </div>
        )}
        {phase === "drawing" && (
          <div style={{ textAlign:"center", fontSize:14, color:_themeAccent, letterSpacing:3, fontFamily:T.mono }}>
            Drawing...
          </div>
        )}
        {}
        {phase === "result" && (
          <div style={{ display:"flex", gap:8, justifyContent:"center", flexWrap:"wrap" }}>
            <GoldButton onClick={newRound} small>Change Bet</GoldButton>
            {bet <= chips && bet >= 1 && (
              <GoldButton onClick={() => { newRound(); setTimeout(deal, 50); }}>Rebet ${bet} ♠</GoldButton>
            )}
          </div>
        )}
      </div>
      <div style={{ padding:"12px", fontSize:10, color:"#3a4060", letterSpacing:2, textTransform:"uppercase", zIndex:1 }}>Jacks or Better · Hold & Draw · 99.5% RTP</div>
    </GameShell>
  );
}
const WHEEL_ORDER = [0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26];
const RED_NUMS = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);
const numColor = (n) => n===0?"#15803d":RED_NUMS.has(n)?"#dc2626":"#1e1e2e";
const numColorLight = (n) => n===0?"#22c55e":RED_NUMS.has(n)?"#ef4444":"#e8e0d0";
function RouletteWheel({ spinning, resultIdx, onFinish }) {
  const segAngle = 360 / WHEEL_ORDER.length;
  const S = 340, center = S / 2;
  const outerRim = 155;
  const trackOuter = 148;
  const trackCenter = 140;
  const trackInner = 132;
  const pocketOuter = 128;
  const pocketInner = 100;
  const innerR = 52;
  const ballR = 6;
  const [ballState, setBallState] = useState(null);
  const [launchPhase, setLaunchPhase] = useState("idle");
  const animRef = useRef(null);
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;
  useEffect(() => {
    if (spinning && resultIdx !== null) {
      const targetDeg = resultIdx * segAngle + segAngle / 2;
      const fullSpins = 5;
      const totalDeg = fullSpins * 360 + targetDeg;
      const spinDuration = 5500;
      const readyDelay = 500;
      const flickDelay = 400;
      setBallState({ angleDeg: 0, radius: trackCenter });
      setLaunchPhase("ready");
      const flickTimer = setTimeout(() => {
        setLaunchPhase("flick");
      }, readyDelay);
      let start = null;
      const animate = (ts) => {
        if (!start) start = ts;
        const t = Math.min((ts - start) / spinDuration, 1);
        if (t > 0.01) setLaunchPhase("spinning");
        let eased;
        if (t < 0.03) {
          eased = (t / 0.03) * (1 - Math.pow(1 - 0.03, 2.2));
        } else {
          eased = 1 - Math.pow(1 - t, 2.2);
        }
        const angleDeg = eased * totalDeg;
        let radius;
        if (t < 0.55) {
          const wobble = Math.sin(t * 80) * 1.2 * (1 - t / 0.55);
          radius = trackCenter + wobble;
        } else if (t < 0.72) {
          const dropT = (t - 0.55) / 0.17;
          const dropEased = dropT * dropT;
          radius = trackCenter + (pocketOuter - trackCenter) * dropEased;
          const bounce = Math.sin(dropT * Math.PI * 3) * 4 * (1 - dropT);
          radius += bounce;
        } else {
          const settleT = (t - 0.72) / 0.28;
          const settleEased = 1 - Math.pow(1 - settleT, 1.8);
          const pocketCenter = (pocketOuter + pocketInner) / 2;
          radius = pocketOuter + (pocketCenter - pocketOuter) * settleEased;
          const rattle = Math.sin(settleT * Math.PI * 5) * 2.5 * Math.pow(1 - settleT, 2.5);
          radius += rattle;
        }
        setBallState({ angleDeg, radius });
        if (t < 1) {
          animRef.current = requestAnimationFrame(animate);
        } else {
          setBallState({ angleDeg: totalDeg, radius: (pocketOuter + pocketInner) / 2 });
          setTimeout(() => { if (onFinishRef.current) onFinishRef.current(); }, 400);
        }
      };
      const launchTimer = setTimeout(() => {
        animRef.current = requestAnimationFrame(animate);
      }, readyDelay + flickDelay);
      return () => { clearTimeout(flickTimer); clearTimeout(launchTimer); if (animRef.current) cancelAnimationFrame(animRef.current); };
    }
    if (!spinning && resultIdx === null) { setBallState(null); setLaunchPhase("idle"); }
  }, [spinning, resultIdx]);
  let ballX = center, ballY = center - trackCenter;
  if (ballState) {
    const rad = (ballState.angleDeg - 90) * Math.PI / 180;
    ballX = center + ballState.radius * Math.cos(rad);
    ballY = center + ballState.radius * Math.sin(rad);
  }
  return (
    <div style={{ position:"relative", width:"100%", maxWidth:S, aspectRatio:"1/1" }}>
      <svg width="100%" height="100%" viewBox={`0 0 ${S} ${S}`}>
        <defs>
          <radialGradient id="ballGrad" cx="30%" cy="25%">
            <stop offset="0%" stopColor="#ffffff"/>
            <stop offset="25%" stopColor="#f0f0f0"/>
            <stop offset="55%" stopColor="#cccccc"/>
            <stop offset="80%" stopColor="#999999"/>
            <stop offset="100%" stopColor="#666666"/>
          </radialGradient>
          <linearGradient id="chromeRim" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e8e0c8"/>
            <stop offset="30%" stopColor={_themeAccent}/>
            <stop offset="50%" stopColor="#f5e6a3"/>
            <stop offset="70%" stopColor={_themeAccent}/>
            <stop offset="100%" stopColor="#b8941e"/>
          </linearGradient>
          <radialGradient id="woodCenter" cx="40%" cy="35%">
            <stop offset="0%" stopColor="#2a1a0a"/>
            <stop offset="50%" stopColor="#1a1008"/>
            <stop offset="100%" stopColor="#0a0804"/>
          </radialGradient>
          <radialGradient id="ballShadow" cx="50%" cy="50%">
            <stop offset="0%" stopColor="rgba(0,0,0,0.4)"/>
            <stop offset="100%" stopColor="rgba(0,0,0,0)"/>
          </radialGradient>
        </defs>
        {}
        <circle cx={center} cy={center} r={outerRim + 6} fill="none" stroke="url(#chromeRim)" strokeWidth="5"/>
        <circle cx={center} cy={center} r={outerRim + 2.5} fill="none" stroke="#b8941e" strokeWidth="0.5"/>
        {}
        <circle cx={center} cy={center} r={trackOuter} fill="none" stroke="rgba(60,50,30,0.4)" strokeWidth="1.5"/>
        <circle cx={center} cy={center} r={trackCenter} fill="none" stroke="rgba(30,20,10,0.25)" strokeWidth={trackOuter - trackInner} opacity="0.5"/>
        <circle cx={center} cy={center} r={trackInner} fill="none" stroke="rgba(100,80,40,0.35)" strokeWidth="1"/>
        <circle cx={center} cy={center} r={trackOuter - 0.5} fill="none" stroke="rgba(255,240,200,0.06)" strokeWidth="0.8"/>
        {}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
          const a = (deg - 90) * Math.PI / 180;
          const dx = center + (trackInner + 2) * Math.cos(a);
          const dy = center + (trackInner + 2) * Math.sin(a);
          return <polygon key={`def${i}`} points={`${dx},${dy-4} ${dx+2.5},${dy} ${dx},${dy+4} ${dx-2.5},${dy}`}
            fill={`${_themeAccent}80`} stroke={`${_themeAccent}b3`} strokeWidth="0.5"
            transform={`rotate(${deg},${dx},${dy})`}/>;
        })}
        {}
        <circle cx={center} cy={center} r={pocketOuter} fill="none" stroke="rgba(100,80,40,0.3)" strokeWidth="1"/>
        <circle cx={center} cy={center} r={pocketInner} fill="none" stroke="rgba(140,120,60,0.25)" strokeWidth="1"/>
        {}
        {WHEEL_ORDER.map((num, i) => {
          const sa = (i * segAngle - 90) * Math.PI / 180;
          const ea = ((i + 1) * segAngle - 90) * Math.PI / 180;
          const ox1 = center + pocketOuter * Math.cos(sa), oy1 = center + pocketOuter * Math.sin(sa);
          const ox2 = center + pocketOuter * Math.cos(ea), oy2 = center + pocketOuter * Math.sin(ea);
          const ix1 = center + pocketInner * Math.cos(sa), iy1 = center + pocketInner * Math.sin(sa);
          const ix2 = center + pocketInner * Math.cos(ea), iy2 = center + pocketInner * Math.sin(ea);
          const ma = ((i + 0.5) * segAngle - 90) * Math.PI / 180;
          const textR = (pocketOuter + pocketInner) / 2;
          const tx = center + textR * Math.cos(ma), ty = center + textR * Math.sin(ma);
          const isWinner = ballState && !spinning && resultIdx === i;
          return (
            <g key={i}>
              <path d={`M${ix1},${iy1} L${ox1},${oy1} A${pocketOuter},${pocketOuter} 0 0,1 ${ox2},${oy2} L${ix2},${iy2} A${pocketInner},${pocketInner} 0 0,0 ${ix1},${iy1}`}
                fill={numColor(num)} stroke={isWinner ? "rgba(255,255,255,0.6)" : `${_themeAccent}33`} strokeWidth={isWinner ? 1.5 : 0.5}
                opacity={isWinner ? 1 : 0.85}/>
              {}
              <path d={`M${ix1},${iy1} L${ox1},${oy1} A${pocketOuter},${pocketOuter} 0 0,1 ${ox2},${oy2} L${ix2},${iy2} A${pocketInner},${pocketInner} 0 0,0 ${ix1},${iy1}`}
                fill={isWinner ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)"} opacity={isWinner ? 0.8 : 0.6}
                style={isWinner ? {animation:"pocketWinPulse 1s ease-in-out infinite"} : {}}/>
              <text x={tx} y={ty} fill={isWinner ? "#fff" : numColorLight(num)} fontSize={isWinner ? "10" : "9"} fontWeight="700"
                fontFamily="'JetBrains Mono', monospace" textAnchor="middle" dominantBaseline="central"
                transform={`rotate(${(i+0.5)*segAngle},${tx},${ty})`}
                style={isWinner ? {filter:"drop-shadow(0 0 3px rgba(255,255,255,0.6))"} : {}}>{num}</text>
            </g>
          );
        })}
        {}
        {WHEEL_ORDER.map((_, i) => {
          const a = (i * segAngle - 90) * Math.PI / 180;
          const fx1 = center + pocketInner * Math.cos(a), fy1 = center + pocketInner * Math.sin(a);
          const fx2 = center + pocketOuter * Math.cos(a), fy2 = center + pocketOuter * Math.sin(a);
          return <line key={`f${i}`} x1={fx1} y1={fy1} x2={fx2} y2={fy2}
            stroke={`${_themeAccent}4d`} strokeWidth="1.2" strokeLinecap="round"/>;
        })}
        {WHEEL_ORDER.map((_, i) => {
          const a = (i * segAngle - 90) * Math.PI / 180;
          return <circle key={`fb${i}`} cx={center + pocketOuter * Math.cos(a)} cy={center + pocketOuter * Math.sin(a)}
            r={2} fill={`${_themeAccent}40`} stroke="rgba(180,150,50,0.35)" strokeWidth="0.5"/>;
        })}
        {}
        <circle cx={center} cy={center} r={innerR + 3} fill="none" stroke={`${_themeAccent}1f`} strokeWidth="2"/>
        <circle cx={center} cy={center} r={innerR} fill="url(#woodCenter)" stroke="url(#chromeRim)" strokeWidth="2.5"/>
        <circle cx={center} cy={center} r={innerR - 6} fill="none" stroke={`${_themeAccent}1a`} strokeWidth="0.8"/>
        <circle cx={center} cy={center} r={innerR - 12} fill="none" stroke={`${_themeAccent}0f`} strokeWidth="0.5"/>
        <text x={center} y={center - 3} fill={_themeAccent} fontSize="10" fontWeight="700"
          fontFamily="'Playfair Display', Georgia, serif" textAnchor="middle" dominantBaseline="central"
          letterSpacing="3" opacity="0.7">{String.fromCharCode(10022)}</text>
        <text x={center} y={center + 9} fill={`${_themeAccent}73`} fontSize="7" fontWeight="600"
          fontFamily="'JetBrains Mono', monospace" textAnchor="middle" dominantBaseline="central"
          letterSpacing="1.5">ROULETTE</text>
        {}
        {(launchPhase === "ready" || launchPhase === "flick") && (() => {
          const launcherDeg = launchPhase === "flick" ? -22 : -8;
          const launcherRad = (launcherDeg - 90) * Math.PI / 180;
          const armLen = 14;
          const baseX = center + (trackOuter + 2) * Math.cos(launcherRad);
          const baseY = center + (trackOuter + 2) * Math.sin(launcherRad);
          const tipRad = ((launcherDeg + (launchPhase === "flick" ? -12 : 0)) - 90) * Math.PI / 180;
          const tipX = baseX - armLen * Math.cos(tipRad);
          const tipY = baseY - armLen * Math.sin(tipRad);
          return (
            <g style={{ transition: "all 0.15s ease-out" }}>
              {}
              <line x1={baseX} y1={baseY} x2={tipX} y2={tipY}
                stroke={_themeAccent} strokeWidth="2.5" strokeLinecap="round"/>
              {}
              <circle cx={baseX} cy={baseY} r={3} fill="#b8941e" stroke={_themeAccent} strokeWidth="0.8"/>
              {}
              <circle cx={tipX} cy={tipY} r={2.2} fill="#f5e6a3" stroke={_themeAccent} strokeWidth="0.6"/>
            </g>
          );
        })()}
        {}
        {ballState && (
          <g>
            <ellipse cx={ballX + 2} cy={ballY + 3} rx={ballR + 1} ry={ballR * 0.7} fill="url(#ballShadow)" opacity="0.5"/>
            <circle cx={ballX} cy={ballY} r={ballR} fill="url(#ballGrad)" stroke="rgba(255,255,255,0.5)" strokeWidth="0.8"/>
            <ellipse cx={ballX - 1.5} cy={ballY - 2} rx={2.5} ry={1.8} fill="rgba(255,255,255,0.55)"/>
            <circle cx={ballX + 1} cy={ballY + 1.5} r={1} fill="rgba(255,255,255,0.12)"/>
          </g>
        )}
      </svg>
    </div>
  );
}
const BET_TYPES = [
  { id:"red", label:"Red", payout:2 },{ id:"black", label:"Black", payout:2 },
  { id:"odd", label:"Odd", payout:2 },{ id:"even", label:"Even", payout:2 },
  { id:"1-18", label:"1–18", payout:2 },{ id:"19-36", label:"19–36", payout:2 },
  { id:"1st12", label:"1st 12", payout:3 },{ id:"2nd12", label:"2nd 12", payout:3 },{ id:"3rd12", label:"3rd 12", payout:3 },
];
function checkRouletteBet(betType, number) {
  if(/^\d+$/.test(betType)) return parseInt(betType) === number;
  if(number===0) return false;
  switch (betType) {
    case "red":   return RED_NUMS.has(number);
    case "black": return !RED_NUMS.has(number) && number !== 0;
    case "odd":   return number % 2 === 1;
    case "even":  return number % 2 === 0;
    case "1-18":  return number >= 1 && number <= 18;
    case "19-36": return number >= 19 && number <= 36;
    case "1st12": return number >= 1 && number <= 12;
    case "2nd12": return number >= 13 && number <= 24;
    case "3rd12": return number >= 25 && number <= 36;
    default:      return false;
  }
}
function RouletteGame({ chips, setChips, onBack, onRebuy, startChips, lastBets = {}, setLastBet, winStreak = 0, vipPoints = 0, achCount = 0, reportLoss, applyWin = null, onBetPlaced = null, onRoundEnd, skipOverlays = false, skipEffects = false, theme = "dark", skinTheme, skinId = "house", activePowerUps = [] }) {
  const [betAmount, setBetAmount] = useState(() => Math.min(lastBets?.roulette || 10, chips));
  useEffect(() => { if (setLastBet) setLastBet("roulette", betAmount); }, [betAmount, setLastBet]);
  const [bets, setBets] = useState([]);
  const [phase, setPhase] = useState("betting");
  const [result, setResult] = useState(null);
  const [resultIdx, setResultIdx] = useState(null);
  const [message, setMessage] = useState("Place your bets");
  const [spinning, setSpinning] = useState(false);
  const [history, setHistory] = useState([]);
  const [nearMiss, setNearMiss] = useState(null);
  const [winBreakdown, setWinBreakdown] = useState(null);
  const [betLog, setBetLog] = useState([]);
  const betsRef = useRef(bets);
  const resultIdxRef = useRef(resultIdx);
  betsRef.current = bets;
  resultIdxRef.current = resultIdx;
  const totalBet = bets.reduce((s, b) => s + b.amount, 0);
  const remaining = chips - totalBet;
  useEffect(() => {
    if (betAmount > remaining && remaining > 0) setBetAmount(remaining);
  }, [remaining, betAmount]);
  const addBet = (type) => {
    if (betAmount < 1 || betAmount > remaining) return;
    setBets(prev => {
      const existing = prev.find(b => b.type === type);
      if (existing) return prev.map(b => b.type === type ? { ...b, amount: b.amount + betAmount } : b);
      return [...prev, { type, amount: betAmount }];
    });
  };
  const removeBet = (type) => {
    setBets(prev => prev.filter(b => b.type !== type));
  };
  const clearBets = () => setBets([]);
  const fx = useWinEffects();
  useEffect(() => { if (phase === "resolved" && onRoundEnd) onRoundEnd(); }, [phase, onRoundEnd]);
  const { shaking, shake, shakeIntensity, floatWins, addFloatWin, flash, triggerFlash, lightMode, triggerLights,
    bigWin, setBigWin, dismissOverlay, dismissAll, celebrateWin, shellEffects, coinRainActive, triggerCoins, softCoinRain, washType, triggerWash,
    confetti, triggerConfetti, eruptionActive, triggerEruption } = fx;
  const spin = () => {
    if(bets.length === 0 || totalBet > chips || totalBet < 1) return;
    setChips(c=>c-totalBet); if (onBetPlaced) onBetPlaced(totalBet); setPhase("spinning"); setMessage("No more bets...");
    const idx = Math.floor(Math.random()*WHEEL_ORDER.length);
    resultIdxRef.current = idx;
    setResultIdx(idx); setSpinning(true); setResult(null); setWinBreakdown(null);
  };
  const onWheelFinish = useCallback(() => {
    const curBets = betsRef.current;
    const curResultIdx = resultIdxRef.current;
    const winNum = WHEEL_ORDER[curResultIdx];
    setResult(winNum); setSpinning(false);
    setHistory(h => [winNum,...h].slice(0,15));
    let totalWin = 0;
    const breakdown = [];
    for (const b of curBets) {
      const isNum = /^\d+$/.test(b.type);
      const payout = isNum ? 36 : BET_TYPES.find(bt=>bt.id===b.type)?.payout||2;
      const won = checkRouletteBet(b.type, winNum);
      if (won) {
        const w = b.amount * payout;
        totalWin += w;
        const label = isNum ? `#${b.type}` : BET_TYPES.find(bt=>bt.id===b.type)?.label || b.type;
        breakdown.push({ label, amount: w - b.amount });
      }
    }
    setNearMiss(null);
    const colorStr = winNum===0?"G Green":RED_NUMS.has(winNum)?"R Red":"⚫ Black";
    const totalBetAmount = curBets.reduce((s,b)=>s+b.amount, 0);
    const newEntries = curBets.map(b => {
      const isNum = /^\d+$/.test(b.type);
      const label = isNum ? `#${b.type}` : (BET_TYPES.find(bt=>bt.id===b.type)?.label || b.type);
      const won = checkRouletteBet(b.type, winNum);
      const payout = isNum ? 36 : BET_TYPES.find(bt=>bt.id===b.type)?.payout||2;
      return { label, amount: b.amount, won, net: won ? b.amount * payout - b.amount : -b.amount };
    });
    setBetLog(prev => [...prev, ...newEntries]);
    if(totalWin > 0) {
      if (applyWin) applyWin(totalWin); else setChips(c=>c+totalWin);
      const profit = totalWin - totalBetAmount;
      setMessage(`${winNum} — ${colorStr} — Won $${totalWin.toLocaleString()}!`);
      setWinBreakdown(breakdown);
      triggerFlash();triggerLights("win");addFloatWin(profit, {x:50, y:30});
      if(totalWin>=totalBetAmount*10){shake();setBigWin({type:totalWin>=totalBetAmount*20?"mega":"big",amount:profit});}
      else{softCoinRain(winStreak);}
    } else {
      setMessage(`${winNum} — ${colorStr} — No luck`); triggerLights("loss");
      if (reportLoss) reportLoss(totalBetAmount);
      for (const b of curBets) {
        if (/^\d+$/.test(b.type)) {
          const wheelIdx = WHEEL_ORDER.indexOf(winNum);
          const betIdx = WHEEL_ORDER.indexOf(parseInt(b.type));
          if (wheelIdx >= 0 && betIdx >= 0) {
            const dist = Math.min(Math.abs(wheelIdx - betIdx), WHEEL_ORDER.length - Math.abs(wheelIdx - betIdx));
            if (dist <= 2) { setNearMiss(`So close! ${b.type} was just ${dist === 1 ? "one pocket" : "two pockets"} away`); break; }
          }
        }
      }
    }
    setPhase("resolved");
  }, [shake, triggerFlash, triggerLights, addFloatWin, setBigWin, softCoinRain, reportLoss, applyWin]);
  const reset = () => { setBigWin(null);fx.clearLights();setPhase("betting");setResult(null);setResultIdx(null);setMessage("Place your bets");setWinBreakdown(null);setBetAmount(b=>Math.min(b,chips>0?chips:1000)); };
  const handleKey = useCallback((key) => {
    if (phase==="betting" && (key===" "||key==="Enter")) spin();
    else if (phase==="resolved" && (key===" "||key==="Enter")) { setBigWin(null);fx.clearLights();setResult(null);setResultIdx(null);setMessage("No more bets...");spin(); }
  }, [phase]);
  const chipBudget = chips - totalBet;
  const betBreakdown = betLog.length > 0 ? (
    <div style={{ display:"flex", gap:3, flexWrap:"wrap", justifyContent:"center",
      maxHeight:48, overflow:"hidden", width:"100%", maxWidth:520 }}>
      {betLog.map((entry, i) => (
        <span key={i} style={{ fontSize:8, fontFamily:T.mono, padding:"1px 4px", borderRadius:3, lineHeight:"14px",
          background: entry.won ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
          border: `1px solid ${entry.won ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.15)"}`,
          color: entry.won ? "#22c55e" : "#ef4444" }}>
          {entry.label} {entry.net >= 0 ? "+" : ""}{entry.net}
        </span>
      ))}
    </div>
  ) : null;
  return (
    <GameShell bg={RED_BG} title="ROULETTE" chips={chips} onBack={onBack} {...shellEffects} startChips={startChips} onKeyAction={handleKey} winStreak={winStreak} vipPoints={vipPoints} achCount={achCount} skipOverlays={skipOverlays} skipEffects={skipEffects} onRebuy={onRebuy} theme={theme} skinTheme={skinTheme} skinId={skinId} activePowerUps={activePowerUps} nearMiss={nearMiss} sessionDetail={betBreakdown} rules={<>
        <p style={{marginTop:0}}>Bet on where the ball will land on a 37-pocket wheel (0–36). You can place multiple bets!</p>
        <p><span style={{color:_themeAccent}}>Multi-Bet:</span> Select a bet amount, then click bet types or numbers to add chips. Click a placed bet to remove it.</p>
        <p><span style={{color:_themeAccent}}>Straight Up:</span> Bet on a single number (0–36). Pays 35:1.</p>
        <p><span style={{color:_themeAccent}}>Red/Black:</span> Bet on the color. Pays 1:1.</p>
        <p><span style={{color:_themeAccent}}>Odd/Even:</span> Bet on odd or even numbers. Pays 1:1. Zero is neither.</p>
        <p><span style={{color:_themeAccent}}>1–18 / 19–36:</span> Bet on the low or high half. Pays 1:1.</p>
        <p><span style={{color:_themeAccent}}>Dozens:</span> Bet on 1–12, 13–24, or 25–36. Pays 2:1.</p>
        <p style={{color:T.muted, fontSize:11}}>European single-zero roulette. House edge: 2.7%.</p>
      </>}>
      {history.length > 0 && (
        <div style={{ display:"flex", gap:4, margin:"10px 0", zIndex:1, flexWrap:"wrap",
          justifyContent:"center", maxWidth:480 }}>
          {history.map((n, i) => (
            <div key={`${n}-${i}-${history.length}`} style={{
              width:24, height:24, borderRadius:"50%", background:numColor(n),
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:10, fontWeight:700, color:"#fff", fontFamily:T.mono,
              opacity: 1 - i * 0.05, border: i === 0 ? "2px solid rgba(255,255,255,0.5)" : "1px solid rgba(255,255,255,0.2)",
              animation: i === 0 ? "historyBubbleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards" : "none",
              boxShadow: i === 0 ? `0 0 10px ${numColor(n)}88` : "none",
            }}>{n}</div>
          ))}
        </div>
      )}
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12,padding:"0 16px",zIndex:1,width:"100%",maxWidth:480}}>
        <div style={{fontSize:16,fontWeight:600,textAlign:"center",minHeight:24,letterSpacing:1,
          animation: phase==="resolved" ? "rouletteReveal 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards" : "fadeIn 0.3s ease",
          color:phase==="resolved"&&message.includes("Won")?"#27ae60":phase==="resolved"&&message.includes("No luck")?"#e74c3c":_themeAccent,
          ...(phase==="resolved"&&message.includes("Won") ? { textShadow:"0 0 10px rgba(39,174,96,0.3)" } : {})
        }}>{message}</div>
        {}
        {winBreakdown && winBreakdown.length > 1 && (
          <div style={{ display:"flex", gap:6, flexWrap:"wrap", justifyContent:"center" }}>
            {winBreakdown.map((w, i) => (
              <span key={i} style={{ fontSize:10, fontFamily:T.mono, color:"#22c55e", background:"rgba(34,197,94,0.1)",
                padding:"2px 6px", borderRadius:4, border:"1px solid rgba(34,197,94,0.2)",
                animation:`resultBadge 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 0.1}s both` }}>
                {w.label} +${w.amount.toLocaleString()}
              </span>
            ))}
          </div>
        )}
        <RouletteWheel spinning={spinning} resultIdx={resultIdx} onFinish={onWheelFinish} />
        {phase==="betting"&&(
          <div style={{width:"100%",animation:"fadeIn 0.3s ease"}}>
            {}
            {bets.length > 0 && (
              <div style={{ marginBottom:10, padding:"6px 10px", background:`${_themeAccent}0f`,
                border:`1px solid ${_themeAccent}26`, borderRadius:8 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                  <span style={{ fontSize:9, letterSpacing:2, textTransform:"uppercase", color:T.muted }}>
                    Active Bets · ${totalBet.toLocaleString()} total
                  </span>
                  <button onClick={clearBets} style={{ fontSize:9, fontFamily:T.mono, color:"#ef4444",
                    background:"none", border:"none", cursor:"pointer", letterSpacing:1 }}>CLEAR ALL</button>
                </div>
                <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                  {bets.map(b => {
                    const isNum = /^\d+$/.test(b.type);
                    const label = isNum ? `#${b.type}` : BET_TYPES.find(bt=>bt.id===b.type)?.label || b.type;
                    return (
                      <button key={b.type} onClick={() => removeBet(b.type)}
                        style={{ fontSize:10, fontFamily:T.mono, padding:"3px 8px", borderRadius:4,
                          background:`${_themeAccent}26`, border:`1px solid ${_themeAccent}4d`,
                          color:_themeAccent, cursor:"pointer", transition:"all 0.15s" }}>
                        {label} ${b.amount} ✕
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            <div style={{fontSize:11,letterSpacing:2,textTransform:"uppercase",color:T.muted,textAlign:"center",marginBottom:6}}>Click to add ${betAmount} chip{betAmount!==1?"s":""}</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3, 1fr)",gap:5,marginBottom:10}}>
              {BET_TYPES.map(b => {
                const placed = bets.find(pb => pb.type === b.id);
                return (
                  <button key={b.id} onClick={() => addBet(b.id)}
                    style={{
                      padding:"7px 4px", borderRadius:6, fontSize:11, fontWeight:600,
                      fontFamily:T.mono, cursor: chipBudget >= betAmount ? "pointer" : "not-allowed", transition:"all 0.2s",
                      background: placed ? `${_themeAccent}33` : "rgba(255,255,255,0.03)",
                      border: placed ? `1.5px solid ${_themeAccent}` : "1.5px solid rgba(255,255,255,0.1)",
                      color: placed ? _themeAccent : T.muted, position:"relative",
                    }}>
                    {b.label} <span style={{ opacity:0.5 }}>({b.payout}x)</span>
                    {placed && <span style={{ position:"absolute", top:-6, right:-4, fontSize:8, fontFamily:T.mono,
                      background:_themeAccent, color:"#0e0a08", padding:"0 4px", borderRadius:8, fontWeight:700 }}>${placed.amount}</span>}
                  </button>
                );
              })}
            </div>
            <div style={{fontSize:11,letterSpacing:2,textTransform:"uppercase",color:T.muted,textAlign:"center",marginBottom:4}}>Or pick a number (36x)</div>
            <div className="roulette-nums" style={{display:"flex",flexWrap:"wrap",gap:3,justifyContent:"center"}}>
              {Array.from({length:37}, (_, i) => i).map(n => {
                const placed = bets.find(b => b.type === String(n));
                const nc = numColor(n);
                return (
                  <button key={n} onClick={() => addBet(String(n))}
                    style={{
                      width:26, height:26, borderRadius:4, fontSize:9, fontWeight:700,
                      fontFamily:T.mono, cursor: chipBudget >= betAmount ? "pointer" : "not-allowed", transition:"all 0.15s",
                      background: placed ? nc : "rgba(255,255,255,0.05)",
                      border: placed ? `2px solid ${_themeAccent}` : `1px solid ${nc}55`,
                      color: placed ? "#fff" : nc === "#1e1e2e" ? "#888" : numColorLight(n),
                      position:"relative",
                    }}>
                    {n}
                    {placed && <span style={{ position:"absolute", top:-7, right:-5, fontSize:7, fontFamily:T.mono,
                      background:_themeAccent, color:"#0e0a08", padding:"0 3px", borderRadius:6, fontWeight:700, lineHeight:"14px" }}>${placed.amount}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
      <div style={{padding:"16px",width:"100%",maxWidth:560,zIndex:1}}>
        {phase==="betting"&&<div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:14}}>
          <BetControls bet={betAmount} setBet={setBetAmount} chips={Math.max(0, chips - totalBet)} presets={[5,10,25,50,100]}/>
          <GoldButton onClick={spin} disabled={bets.length===0||totalBet>chips||totalBet<1} hint="⏎ spin">Spin · ${totalBet}</GoldButton>
        </div>}
        {phase==="spinning"&&<div className="anim-spinner" style={{textAlign:"center",color:T.muted,fontSize:13,letterSpacing:2}}>Spinning...</div>}
        {phase==="resolved"&&<div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
          <GoldButton onClick={reset} small>Change Bets</GoldButton>
          {totalBet<=chips&&bets.length>0&&<GoldButton onClick={()=>{setBigWin(null);fx.clearLights();setResult(null);setResultIdx(null);setWinBreakdown(null);setMessage("No more bets...");spin();}}>Rebet ${totalBet}</GoldButton>}
        </div>}
      </div>
      <div style={{padding:"8px",fontSize:10,color:"#4a3030",letterSpacing:2,textTransform:"uppercase",zIndex:1}}>European · Single Zero · Multi-Bet</div>
      <FloatingWins wins={floatWins} />
      {bigWin && !skipOverlays && <BigWinOverlay type={bigWin.type} amount={bigWin.amount} onDone={dismissOverlay} />}
    </GameShell>
  );
}
const SLOT_SYMBOLS = [
  { id:"cherry", weight:22 },{ id:"lemon", weight:20 },{ id:"orange", weight:18 },
  { id:"grape", weight:15 },{ id:"bell", weight:12 },{ id:"diamond", weight:9 },
  { id:"seven", weight:6 },{ id:"joker", weight:5 },{ id:"scatter", weight:4 },
];
const WILD_ID = "joker";
const SCAT_ID = "scatter";
const SLOT_PAY = {
  cherry:[5,15,50], lemon:[5,18,65], orange:[7,24,90],
  grape:[12,36,140], bell:[18,65,260], diamond:[30,115,460],
  seven:[48,230,880], joker:[70,460,1750],
};
const SLOT_PAY_ORDER = ["joker","seven","diamond","bell","grape","orange","lemon","cherry"];
const SCAT_AWARDS = { 3:{mult:2,spins:6}, 4:{mult:5,spins:8}, 5:{mult:15,spins:10} };
const FREE_SPIN_MULT = 2;
const PAYLINES = [
  [1,1,1,1,1],
  [0,0,0,0,0],
  [2,2,2,2,2],
  [0,1,2,1,0],
  [2,1,0,1,2],
  [0,0,1,2,2],
  [2,2,1,0,0],
  [1,0,0,0,1],
  [1,2,2,2,1],
  [0,1,1,1,0],
  [2,1,1,1,2],
  [1,0,1,0,1],
  [1,2,1,2,1],
  [0,1,0,1,0],
  [2,1,2,1,2],
  [1,1,0,1,1],
  [1,1,2,1,1],
  [0,2,0,2,0],
  [2,0,2,0,2],
  [0,2,1,2,0],
];
function weightedRandom() {
  const tw = SLOT_SYMBOLS.reduce((s,sym)=>s+sym.weight,0);
  let r = Math.random()*tw;
  for(const sym of SLOT_SYMBOLS){r-=sym.weight;if(r<=0)return sym.id;}
  return SLOT_SYMBOLS[0].id;
}
function checkSlot5Wins(grid, betPerLine, totalBet, isFree) {
  const mult = isFree ? FREE_SPIN_MULT : 1;
  const wins = [];
  let scatCount = 0;
  for(let r=0;r<5;r++) for(let row=0;row<3;row++) if(grid[r][row]===SCAT_ID) scatCount++;
  if(scatCount >= 3) {
    const sa = SCAT_AWARDS[scatCount];
    wins.push({ line:-1, sym:SCAT_ID, count:scatCount, mult:sa.mult, payout:totalBet*sa.mult*mult, spins:sa.spins, positions:null });
  }
  PAYLINES.forEach((line, li) => {
    const syms = line.map((row, reel) => grid[reel][row]);
    let baseSym = null;
    for(const s of syms){ if(s!==WILD_ID && s!==SCAT_ID){ baseSym=s; break; } }
    if(!baseSym && syms.some(s=>s===WILD_ID)) baseSym = WILD_ID;
    if(!baseSym) return;
    let count = 0;
    for(let i=0;i<5;i++){
      if(syms[i]===baseSym || syms[i]===WILD_ID) count++; else break;
    }
    if(count >= 3) {
      const pay = SLOT_PAY[baseSym];
      if(pay){
        const m = pay[count-3];
        wins.push({ line:li, sym:baseSym, count, mult:m, payout:betPerLine*m*mult, positions:line });
      }
    }
  });
  return wins;
}
function SlotReel5({ symbols, spinning, winRows, justStopped }) {
  const isMobileS = typeof window !== "undefined" && window.innerWidth < 480;
  const isNarrow = typeof window !== "undefined" && window.innerWidth < 380;
  const CELL_H = isNarrow ? 50 : isMobileS ? 58 : 82;
  const REEL_W = isNarrow ? 50 : isMobileS ? 58 : 82;
  const stripRef = useRef(null);
  if (!stripRef.current) {
    stripRef.current = Array.from({ length: 12 }, () => {
      const syms = Object.keys(SLOT_ICON_MAP);
      return syms[Math.floor(Math.random() * syms.length)];
    });
  }
  return (
    <div style={{ width:REEL_W, minWidth:REEL_W, flexShrink:0, borderRadius:8, border:`1px solid ${_themeAccent}26`, overflow:"hidden", position:"relative",
      background:"rgba(0,0,0,0.4)",
      animation: justStopped ? "slotClunk 0.25s cubic-bezier(0.36, 0, 0.66, -0.56)" : "none" }}>
      {spinning ? (
        <div style={{ height: CELL_H * 3, overflow:"hidden", position:"relative" }}>
          <div className="reel-strip spinning">
            <div className="reel-strip-inner" style={{ display:"flex", flexDirection:"column" }}>
              {[...stripRef.current, ...stripRef.current].map((sym, i) => (
                <div key={i} style={{
                  height: CELL_H, display:"flex", alignItems:"center", justifyContent:"center",
                  borderTop: i > 0 ? "1px solid rgba(255,255,255,0.04)" : "none",
                  filter: "blur(0.5px)", opacity: 0.7,
                }}>
                  {SLOT_ICON_MAP[sym] || <span style={{color:"#333",fontSize:22}}>—</span>}
                </div>
              ))}
            </div>
          </div>
          {}
          <div style={{ position:"absolute", top:0, left:0, right:0, height:20,
            background:"linear-gradient(180deg, rgba(26,14,24,0.8), transparent)", pointerEvents:"none" }} />
          <div style={{ position:"absolute", bottom:0, left:0, right:0, height:20,
            background:"linear-gradient(0deg, rgba(26,14,24,0.8), transparent)", pointerEvents:"none" }} />
        </div>
      ) : (
        symbols.map((sym, row) => {
          const isWin = winRows.includes(row);
          const isScat = sym === "scatter";
          return (
            <div key={row} style={{
              height: CELL_H, display:"flex", alignItems:"center", justifyContent:"center",
              transition: "all 0.3s",
              background: isScat ? "rgba(241,196,15,0.18)" : isWin ? `${_themeAccent}1f` : "transparent",
              borderTop: row > 0 ? "1px solid rgba(255,255,255,0.04)" : "none",
              boxShadow: isScat ? "inset 0 0 20px rgba(241,196,15,0.3)" : isWin ? `inset 0 0 15px ${_themeAccent}33` : "none",
              animation: isScat ? "pulse 1s infinite" : "none",
            }}>
              <div style={{
                animation: justStopped ? `symbolLand 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) ${row * 0.05}s both`
                  : isWin ? "symbolWinGlow 1.2s ease-in-out infinite"
                  : "none",
                transform: isWin && !justStopped ? "scale(1.2)" : isScat ? "scale(1.15)" : "scale(1.0)",
                transition:"transform 0.3s",
              }}>
                {sym ? SLOT_ICON_MAP[sym] : <span style={{color:"#333",fontSize:22}}>—</span>}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
function SlotsGame({ chips, setChips, onBack, onRebuy, startChips, lastBets = {}, setLastBet, winStreak = 0, vipPoints = 0, achCount = 0, reportLoss, applyWin = null, onBetPlaced = null, onRoundEnd, skipOverlays = false, skipEffects = false, theme = "dark", skinTheme, skinId = "house", activePowerUps = [] }) {
  const REELS = 5, ROWS = 3;
  const SLOT_SYMS = Object.keys(SLOT_PAY);
  const emptyGrid = () => Array.from({length:REELS}, () => Array.from({length:ROWS}, () => SLOT_SYMS[Math.floor(Math.random() * SLOT_SYMS.length)]));
  const [displayReels, setDisplayReels] = useState(emptyGrid);
  const [bet, setBet] = useState(() => Math.min(lastBets?.slots || 20, chips));
  useEffect(() => { if (setLastBet) setLastBet("slots", bet); }, [bet, setLastBet]);
  const [phase, setPhase] = useState("betting");
  const [wins, setWins] = useState([]);
  const [totalWin, setTotalWin] = useState(0);
  const [message, setMessage] = useState("Spin to play — 20 paylines");
  const [spinning, setSpinning] = useState(Array(REELS).fill(false));
  const [reelJustStopped, setReelJustStopped] = useState(Array(REELS).fill(false));
  const [winHighlight, setWinHighlight] = useState("");
  const [activePayline, setActivePayline] = useState(-1);
  const cycleRef = useRef(null);
  useEffect(() => { if (phase === "resolved" && onRoundEnd) onRoundEnd(); }, [phase, onRoundEnd]);
  const [freeSpins, setFreeSpins] = useState(0);
  const [freeSpinTotal, setFreeSpinTotal] = useState(0);
  const [slotLastBet, setSlotLastBet] = useState(0);
  const [nearMiss, setNearMiss] = useState(null);
  const [showPaylines, setShowPaylines] = useState(false);
  const intervals = useRef([]);
  const fx = useWinEffects();
  const { shaking, shake, shakeIntensity, floatWins, addFloatWin, flash, triggerFlash, lightMode, triggerLights,
    bigWin, setBigWin, dismissOverlay, dismissAll, celebrateWin, shellEffects, coinRainActive, triggerCoins, softCoinRain, washType, triggerWash,
    confetti, triggerConfetti, eruptionActive, triggerEruption } = fx;
  const isFree = freeSpins > 0;
  const betPerLine = Math.max(1, Math.round(bet / 20));
  const actualBet = bet;
  useEffect(() => {
    if (freeSpins > 0 && phase === "resolved" && !bigWin) {
      const timer = setTimeout(() => {
        doSpin(slotLastBet || actualBet);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [freeSpins, phase, bigWin]);
  useEffect(() => {
    return () => {
      if(cycleRef.current) { clearInterval(cycleRef.current); cycleRef.current = null; }
      intervals.current.forEach(i=>clearInterval(i));
    };
  }, []);
  const doSpin = (freeBet) => {
    const useBet = freeBet || actualBet;
    const bpl = Math.max(1, Math.round(useBet / 20));
    if(!freeBet) { if(useBet>chips||bet<1) return; setChips(c=>c-useBet); if (onBetPlaced) onBetPlaced(useBet); setSlotLastBet(useBet); }
    setPhase("spinning"); setWins([]); setTotalWin(0);
    setWinHighlight(""); setActivePayline(-1); setBigWin(null); setNearMiss(null);
    if(cycleRef.current) { clearInterval(cycleRef.current); cycleRef.current = null; }
    setReelJustStopped(Array(REELS).fill(false));
    setMessage(isFree ? `Free Spin (${freeSpins} left) — 2× multiplier!` : "Spinning...");
    const finalGrid = Array.from({length:REELS}, () =>
      Array.from({length:ROWS}, () => weightedRandom())
    );
    setSpinning(Array(REELS).fill(true));
    for(let r=0;r<REELS;r++){
      intervals.current[r]=setInterval(()=>{
        setDisplayReels(prev=>{
          const n=[...prev]; n[r]=Array.from({length:ROWS},()=>weightedRandom()); return n;
        });
      },80);
    }
    const previewWins = checkSlot5Wins(finalGrid, bpl, useBet, !!freeBet);
    const hasBigPotential = previewWins.some(w => w.count >= 4 && w.payout >= useBet * 5);
    const reelDelays = hasBigPotential ? [500,700,900,1300,2000] : [500,700,900,1100,1400];
    reelDelays.forEach((delay,r)=>{
      setTimeout(()=>{
        clearInterval(intervals.current[r]);
        setDisplayReels(prev=>{const n=[...prev];n[r]=finalGrid[r];return n;});
        setSpinning(prev=>{const n=[...prev];n[r]=false;return n;});
        setReelJustStopped(prev=>{const n=[...prev];n[r]=true;return n;});
        setTimeout(()=>setReelJustStopped(prev=>{const n=[...prev];n[r]=false;return n;}), 250);
        if(hasBigPotential && r === 3) setMessage("✦ Come on... ✦");
        if(r===REELS-1){
          const w = checkSlot5Wins(finalGrid, bpl, useBet, !!freeBet);
          const tw = w.reduce((s,win)=>s+win.payout, 0);
          const newSpins = w.reduce((s,win)=>s+(win.spins||0), 0);
          setWins(w); setTotalWin(tw);
          if(tw > 0) { if (applyWin) applyWin(tw); else setChips(c=>c+tw); }
          if(newSpins > 0){
            setFreeSpins(f=>f+newSpins);
            setFreeSpinTotal(t=>t+newSpins);
          }
          if(freeBet) {
            setFreeSpins(f=>f-1);
          }
          let scatOnGrid = 0;
          for(let rr=0;rr<5;rr++) for(let ro=0;ro<3;ro++) if(finalGrid[rr][ro]===SCAT_ID) scatOnGrid++;
          if(tw > 0){
            triggerFlash();
            addFloatWin(tw, { bigThreshold: useBet * 2, megaThreshold: useBet * 10 });
            const ratio = tw / useBet;
            const slotProfit = freeBet ? tw : tw - useBet;
            const epicThresh = freeBet ? 100 : 50;
            const megaThresh = freeBet ? 30 : 15;
            const bigThresh = freeBet ? 15 : 5;
            if(ratio >= epicThresh) { shake(800, "epic"); setBigWin({ type:"epic", amount:slotProfit }); triggerLights("mega", 4000); }
            else if(ratio >= megaThresh) { shake(600, "heavy"); setBigWin({ type:"mega", amount:slotProfit }); triggerLights("mega", 3000); }
            else if(ratio >= bigThresh) { shake(400, "normal"); setBigWin({ type:"big", amount:slotProfit }); triggerLights("big", 2500); }
            else if(ratio >= 1) { shake(200, "light"); triggerLights("win", 1500); softCoinRain(winStreak); }
            else { triggerLights("win", 1000); softCoinRain(winStreak); }
            const scatWin = w.find(x=>x.sym===SCAT_ID);
            if(scatWin){
              setMessage(`⭐ ${scatWin.count} SCATTERS! +$${tw} + ${scatWin.spins} FREE SPINS! ⭐`);
            } else if(w.length===1){
              setMessage(`${w[0].count}× ${SLOT_LABEL_MAP[w[0].sym]} — +$${tw}!`);
              setWinHighlight(w[0].sym);
              if(w[0].line >= 0) setActivePayline(w[0].line);
            } else {
              setMessage(`${w.length} wins! +$${tw}${newSpins>0?` + ${newSpins} FREE SPINS!`:""}`);
              setWinHighlight("multi");
              const payWins = w.filter(x=>x.line>=0);
              if(payWins.length>0){
                setActivePayline(payWins[0].line);
                let ci = 0;
                cycleRef.current = setInterval(() => { ci=(ci+1)%payWins.length; setActivePayline(payWins[ci].line); }, 1400);
              }
            }
          } else {
            const scatMsg = scatOnGrid > 0 ? ` (${scatOnGrid}/3 scatters)` : "";
            setMessage(freeBet ? `No win — free spins continue${scatMsg}` : `No win${scatMsg}`);
            if (!freeBet && reportLoss) reportLoss(useBet);
            if (!freeBet) {
              setNearMiss(null);
              const highSyms = ["seven","diamond","bell","joker"];
              for (let li = 0; li < PAYLINES.length; li++) {
                const line = PAYLINES[li];
                const syms = line.map((row, reel) => finalGrid[reel][row]);
                let baseSym = null;
                for (const s of syms) { if (s !== WILD_ID && s !== SCAT_ID) { baseSym = s; break; } }
                if (!baseSym) continue;
                let count = 0;
                for (let i = 0; i < 5; i++) { if (syms[i] === baseSym || syms[i] === WILD_ID) count++; else break; }
                if (count === 2 && highSyms.includes(baseSym)) {
                  setNearMiss(`Almost! 2× ${SLOT_LABEL_MAP[baseSym]} on line ${li+1} — one more!`);
                  break;
                }
              }
              if (scatOnGrid === 2) setNearMiss("2 scatters on the board — one more for free spins!");
            }
          }
          setPhase("resolved");
        }
      },delay);
    });
  };
  const spin = () => doSpin(null);
  const spinFree = () => doSpin(slotLastBet);
  useEffect(()=>{return()=>{
    intervals.current.forEach(i=>clearInterval(i));
      };},[]);
  const reset = () => {
    fx.clearLights();
    setPhase("betting");setWins([]);setTotalWin(0);setMessage("Spin to play — 20 paylines");
    setWinHighlight(""); setActivePayline(-1); setBigWin(null);
    if(cycleRef.current) { clearInterval(cycleRef.current); cycleRef.current = null; }
        setFreeSpins(0);setFreeSpinTotal(0);
    setBet(b=>Math.min(b,chips>0?chips:1000));
  };
  const handleKey = useCallback((key) => {
    if (phase==="betting" && (key===" "||key==="Enter") && !isFree) doSpin();
    else if (phase==="resolved" && !isFree && (key===" "||key==="Enter")) reset();
  }, [phase, isFree]);
  return (
    <GameShell bg={PURPLE_BG} title="VIDEO SLOTS" chips={chips} onBack={onBack} {...shellEffects} startChips={startChips} winStreak={winStreak} vipPoints={vipPoints} achCount={achCount} skipOverlays={skipOverlays} skipEffects={skipEffects} onRebuy={onRebuy} theme={theme} skinTheme={skinTheme} skinId={skinId} activePowerUps={activePowerUps} onKeyAction={handleKey} nearMiss={nearMiss} rules={<>
        <p style={{marginTop:0}}>5-reel, 3-row video slot machine with 20 paylines.</p>
        <p><span style={{color:_themeAccent}}>Symbols:</span> Cherry, Lemon, Orange, Grape, Bell, Diamond, Seven, and Wild (Joker). Higher symbols pay more.</p>
        <p><span style={{color:_themeAccent}}>Paylines:</span> 20 fixed lines. Wins count left-to-right starting from reel 1 only — matching symbols must begin on the leftmost reel. 3+ in a row on any payline pays.</p>
        <p><span style={{color:_themeAccent}}>Wild (Joker):</span> Substitutes for any symbol except Scatter on any reel.</p>
        <p><span style={{color:_themeAccent}}>Scatter (Star):</span> 3+ Scatters anywhere triggers Free Spins. 3 = 6 spins (2× bet), 4 = 8 spins (5× bet), 5 = 10 spins (15× bet). Free spins use a 2× win multiplier.</p>
        <p><span style={{color:_themeAccent}}>Bet:</span> Your total bet is split across all 20 lines. Payouts are multiplied by your per-line bet (total ÷ 20).</p>
        <p style={{color:T.muted, fontSize:11}}>RTP: ~95%. Volatile — big wins are rare but large.</p>
      </>}>
      <FloatingWins wins={floatWins} />
      {bigWin && !skipOverlays && <BigWinOverlay type={bigWin.type} amount={bigWin.amount} onDone={dismissOverlay} />}
      {}
      <div style={{margin:"8px 0",padding:"6px 12px",background:"rgba(0,0,0,0.3)",borderRadius:8,border:`1px solid ${_themeAccent}26`,zIndex:1,maxWidth:380,width:"92%"}}>
        <div style={{fontSize:9,letterSpacing:2,textTransform:"uppercase",color:"#6a6a80",textAlign:"center",marginBottom:3}}>
          Payouts (per line){isFree && <span style={{color:"#f1c40f"}}> · 2× FREE SPIN</span>}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1px 12px"}}>
          {SLOT_PAY_ORDER.map(sym=>{const p=SLOT_PAY[sym]; return (
            <div key={sym} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"2px 0",fontSize:9,fontFamily:T.mono,
              color:winHighlight===sym||winHighlight==="multi"?"#f1c40f":"#7a7070",fontWeight:winHighlight===sym?700:400}}>
              <span style={{textTransform:"capitalize"}}>{sym==="joker"?"Wild ★":sym}</span>
              <span>{p[0]}/{p[1]}/{p[2]}x</span>
            </div>
          );})}
        </div>
        <div style={{fontSize:8,color:"#4a4a60",textAlign:"center",marginTop:2}}>
          3/4/5 of a kind · Wild subs all · Scatter: 3+=Free Spins
        </div>
      </div>
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:10,padding:"0 12px",zIndex:1}}>
        {phase === "spinning" ? (
          <div style={{fontSize:15,fontWeight:600,textAlign:"center",minHeight:24,letterSpacing:1,animation:"fadeIn 0.3s ease",
            color:_themeAccent}}>{isFree ? "Free Spin..." : "Good luck..."}</div>
        ) : phase === "resolved" && totalWin > 0 ? (
          <div style={{fontSize:15,fontWeight:600,textAlign:"center",minHeight:24,letterSpacing:1,animation:"fadeIn 0.3s ease",
            color:"#f1c40f"}}>+${totalWin.toLocaleString()} <span style={{fontSize:11,color:"#22c55e",fontWeight:400}}>= {isFree ? `+${totalWin.toLocaleString()} free` : `${(totalWin - bet) >= 0 ? "+" : ""}${(totalWin - bet).toLocaleString()} net`}</span></div>
        ) : phase === "resolved" ? (
          <div style={{fontSize:15,fontWeight:600,textAlign:"center",minHeight:24,letterSpacing:1,animation:"fadeIn 0.3s ease",
            color:"#e74c3c"}}>No win</div>
        ) : (
          <div style={{minHeight:24}} />
        )}
        <EdgeLights mode={lightMode} color="#a855f7" />
        {}
        {(() => {
          const activeWin = activePayline >= 0 ? wins.find(w => w.line === activePayline) : null;
          const winRowsByReel = Array.from({length:REELS}, ()=> new Set());
          if(activePayline >= 0 && activeWin) {
            const line = PAYLINES[activePayline];
            line.forEach((row, reel) => { if(reel < activeWin.count) winRowsByReel[reel].add(row); });
          }
          const isMobileSG = typeof window !== "undefined" && window.innerWidth < 480;
          const isNarrowSG = typeof window !== "undefined" && window.innerWidth < 380;
          const reelW = isNarrowSG ? 50 : isMobileSG ? 58 : 82, cellH = isNarrowSG ? 50 : isMobileSG ? 58 : 82, gap = 6;
          const gridW = REELS * reelW + (REELS-1) * gap;
          const gridH = 3 * cellH;
          return (
        <div style={{background:"linear-gradient(180deg, #1a0e18, #0e0610)",borderRadius:16,padding:"16px 14px",
          border: isFree ? "3px solid rgba(241,196,15,0.5)" : "3px solid rgba(42,26,62,0.8)",
          boxShadow: isFree
            ? "0 0 40px rgba(241,196,15,0.25), 0 0 80px rgba(241,196,15,0.1), inset 0 0 30px rgba(241,196,15,0.05)"
            : totalWin > 0
            ? "0 0 40px rgba(241,196,15,0.3), inset 0 0 30px rgba(0,0,0,0.5)"
            : `0 0 40px ${_themeAccent}26, inset 0 0 30px rgba(0,0,0,0.5)`,
          position:"relative", transition:"box-shadow 0.5s, border-color 0.5s",
          width: gridW + 28, maxWidth:"95vw"}}>
          <div style={{display:"flex",gap:6,width:gridW,minWidth:gridW,flexShrink:0}}>
            {Array.from({length:REELS},(_, r)=>(
              <SlotReel5 key={r} symbols={displayReels[r]} spinning={spinning[r]}
                winRows={[...winRowsByReel[r]]} justStopped={reelJustStopped[r]}/>
            ))}
          </div>
          {}
          {activePayline >= 0 && activeWin && !spinning.some(Boolean) && (
            <svg style={{position:"absolute",top:16,left:14,width:gridW,height:gridH,pointerEvents:"none",overflow:"visible"}}
              viewBox={`0 0 ${gridW} ${gridH}`}>
              {(() => {
                const line = PAYLINES[activePayline];
                const pts = line.slice(0, activeWin.count).map((row, reel) => ({
                  x: reel * (reelW + gap) + reelW / 2,
                  y: row * cellH + cellH / 2,
                }));
                if(pts.length < 2) return null;
                let d = `M ${pts[0].x} ${pts[0].y}`;
                for(let i = 1; i < pts.length; i++) {
                  const prev = pts[i-1];
                  const curr = pts[i];
                  const cpx = (prev.x + curr.x) / 2;
                  d += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`;
                }
                const circles = pts.map((p, i) => (
                  <ellipse key={i} cx={p.x} cy={p.y} rx={28} ry={28}
                    fill="none" stroke="rgba(241,196,15,0.5)" strokeWidth="2.5"
                    style={{animation:"pulse 1.2s ease-in-out infinite"}} />
                ));
                return (
                  <g>
                    {}
                    <path d={d} fill="none" stroke="rgba(241,196,15,0.2)" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
                    {}
                    <path d={d} fill="none" stroke="rgba(241,196,15,0.7)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                    {circles}
                  </g>
                );
              })()}
            </svg>
          )}
          {}
          {wins.length > 0 && phase === "resolved" && !spinning.some(Boolean) && (() => {
            const items = wins.map((w, i) => {
              const label = `${w.count}× ${SLOT_LABEL_MAP[w.sym] || "Scatter"}${w.line >= 0 ? ` L${w.line+1}` : ""} +$${w.payout}`;
              return label;
            });
            const summary = items.length <= 3
              ? items.join("  ·  ")
              : items.join("  ·  ") + "  ·  ";
            const needsScroll = items.length > 3;
            return (
              <div style={{
                marginTop:10, overflow:"hidden", borderRadius:6, height:28,
                background:"rgba(241,196,15,0.08)",
                border:"1px solid rgba(241,196,15,0.15)",
                display:"flex", alignItems:"center", position:"relative",
              }}>
                <div style={{
                  whiteSpace:"nowrap", fontFamily:T.mono, fontSize:10, color:"#f1c40f",
                  paddingLeft: needsScroll ? "100%" : 0,
                  textAlign: needsScroll ? undefined : "center",
                  width: needsScroll ? undefined : "100%",
                  animation: needsScroll ? `slotTicker ${Math.max(8, items.length * 2.5)}s linear infinite` : "none",
                }}>
                  {needsScroll ? summary + summary : summary}
                </div>
                {needsScroll && <style>{`@keyframes slotTicker { 0% { transform:translateX(0); } 100% { transform:translateX(-50%); } }`}</style>}
              </div>
            );
          })()}
        </div>
          );
        })()}
      </div>
      <div style={{padding:"16px",width:"100%",maxWidth:560,zIndex:1}}>
        {phase==="betting"&&<div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:14}}>
          <BetControls bet={bet} setBet={setBet} chips={chips} presets={[20,40,100,200,500]}/>
          <GoldButton onClick={spin} disabled={actualBet>chips||bet<1} hint="⏎ spin">Spin</GoldButton>
        </div>}
        {phase==="spinning"&&<div style={{minHeight:30}}/>}
        {phase==="resolved"&&<div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
          {freeSpins > 0 ? (
            <>
              <div style={{fontSize:12,color:"#f1c40f",letterSpacing:1,fontWeight:600}}>
                {freeSpins} Free Spin{freeSpins!==1?"s":""} Remaining · 2× Multiplier
              </div>
              <GoldButton onClick={spinFree} hint="⏎ spin">Free Spin!</GoldButton>
            </>
          ) : (
            <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
              <GoldButton onClick={reset} small>Change Bet</GoldButton>
              {bet <= chips && bet >= 1 && (
                <GoldButton onClick={() => { reset(); setTimeout(spin, 50); }}>Rebet ${bet}</GoldButton>
              )}
            </div>
          )}
        </div>}
      </div>
      <div style={{padding:"8px",fontSize:10,color:"#3a2050",letterSpacing:2,textTransform:"uppercase",zIndex:1}}>5×3 · 20 Lines · Wild + Scatter</div>
      {}
      <button onClick={() => setShowPaylines(true)} style={{
        background:"none", border:"1px solid rgba(168,85,247,0.3)", borderRadius:8, padding:"6px 16px",
        color:"#a855f7", fontSize:11, fontFamily:T.mono, cursor:"pointer", letterSpacing:1,
        transition:"all 0.2s", marginBottom:8, zIndex:1,
      }}
        onMouseEnter={e => { e.currentTarget.style.borderColor="rgba(168,85,247,0.6)"; e.currentTarget.style.background="rgba(168,85,247,0.08)"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor="rgba(168,85,247,0.3)"; e.currentTarget.style.background="none"; }}>
        View All 20 Paylines
      </button>
      {}
      {showPaylines && (
        <div style={{position:"fixed",inset:0,zIndex:20000,display:"flex",alignItems:"center",justifyContent:"center",
          background:"rgba(0,0,0,0.8)",backdropFilter:"blur(6px)",animation:"fadeIn 0.2s ease"}}
          onClick={e => { if(e.target===e.currentTarget) setShowPaylines(false); }}>
          <div style={{background:"linear-gradient(180deg,#1e1e34,#15152a)",border:`1px solid ${_themeAccent}33`,
            borderRadius:T.radiusLg,padding:"20px 16px",maxWidth:420,width:"94%",maxHeight:"85vh",
            boxShadow:"0 24px 64px rgba(0,0,0,0.6)",animation:"fadeInScale 0.2s ease",
            display:"flex",flexDirection:"column"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,flexShrink:0}}>
              <div style={{fontSize:14,fontWeight:700,letterSpacing:2,color:_themeAccent,textTransform:"uppercase",fontFamily:T.serif}}>
                Payline Guide
              </div>
              <button onClick={() => setShowPaylines(false)} style={{
                background:"none",border:"none",color:T.muted,fontSize:20,cursor:"pointer",padding:"0 4px",lineHeight:1,
              }}
                onMouseEnter={e=>e.currentTarget.style.color=T.text}
                onMouseLeave={e=>e.currentTarget.style.color=T.muted}>×</button>
            </div>
            <div style={{fontSize:10,color:T.textMuted,marginBottom:12,fontFamily:T.mono,lineHeight:1.5,flexShrink:0}}>
              Wins count left→right from reel 1. 3+ matching symbols on a line pays.
              Wilds (Joker) substitute for any symbol except Scatter.
            </div>
            <div style={{overflowY:"auto",flex:1,display:"flex",flexDirection:"column",gap:6,paddingRight:4}}>
              {PAYLINES.map((line, li) => {
                const names = [
                  "Straight Middle","Straight Top","Straight Bottom","V Shape","Inverted V",
                  "Diagonal Down","Diagonal Up","U Top","U Bottom","Mild V",
                  "Mild Inverted V","Zigzag High","Zigzag Low","W Top","W Bottom",
                  "Bump Top","Bump Bottom","Big Zigzag","Big Zigzag Inv","Diamond"
                ];
                const cw = 14, ch = 14, gapX = 1;
                const gridW = 5*cw + 4*gapX;
                const gridH = 3*ch;
                const renderMiniGrid = (matchCount) => (
                  <svg width={gridW} height={gridH} viewBox={`0 0 ${gridW} ${gridH}`} style={{flexShrink:0}}>
                    {Array.from({length:5},(_, r) =>
                      Array.from({length:3},(_, row) => {
                        const x = r*(cw+gapX), y = row*ch;
                        const isActive = line[r] === row && r < matchCount;
                        const isDim = line[r] === row && r >= matchCount;
                        return <rect key={`${r}-${row}`} x={x} y={y} width={cw} height={ch} rx={2}
                          fill={isActive ? "rgba(241,196,15,0.35)" : "rgba(255,255,255,0.03)"}
                          stroke={isActive ? "rgba(241,196,15,0.7)" : isDim ? "rgba(241,196,15,0.15)" : "rgba(255,255,255,0.04)"}
                          strokeWidth={isActive?1.2:0.5} strokeDasharray={isDim?"2 2":"none"}/>;
                      })
                    )}
                    {(() => {
                      const pts = line.slice(0, matchCount).map((row, reel) => ({
                        x: reel*(cw+gapX) + cw/2, y: row*ch + ch/2,
                      }));
                      if(pts.length<2) return null;
                      let d = `M ${pts[0].x} ${pts[0].y}`;
                      for(let i=1;i<pts.length;i++){
                        const prev=pts[i-1], curr=pts[i], cpx=(prev.x+curr.x)/2;
                        d += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`;
                      }
                      return <>
                        <path d={d} fill="none" stroke="rgba(241,196,15,0.15)" strokeWidth="5" strokeLinecap="round"/>
                        <path d={d} fill="none" stroke="rgba(241,196,15,0.8)" strokeWidth="1.5" strokeLinecap="round"/>
                      </>;
                    })()}
                    {line.slice(0, matchCount).map((row, reel) => (
                      <circle key={reel} cx={reel*(cw+gapX)+cw/2} cy={row*ch+ch/2} r={2.5} fill="#f1c40f" opacity={0.9}/>
                    ))}
                  </svg>
                );
                return (
                  <div key={li} style={{padding:"8px 10px",background:"rgba(0,0,0,0.25)",borderRadius:8,
                    border:`1px solid ${_themeAccent}14`,flexShrink:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                      <span style={{fontSize:11,fontFamily:T.mono,color:_themeAccent,fontWeight:700}}>L{li+1}</span>
                      <span style={{fontSize:10,fontFamily:T.mono,color:T.textMuted}}>{names[li]}</span>
                      <span style={{fontSize:9,fontFamily:T.mono,color:"#4a4060",marginLeft:"auto"}}>
                        {line.map(r=>r===0?"T":r===1?"M":"B").join("·")}
                      </span>
                    </div>
                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                      {[3,4,5].map(n => (
                        <div key={n} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                          {renderMiniGrid(n)}
                          <span style={{fontSize:8,fontFamily:T.mono,color:"#6a6080"}}>{n}×</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </GameShell>
  );
}
const PLINKO_ROWS = 12;
const PLINKO_SLOTS = PLINKO_ROWS + 1;
const PLINKO_MULTS = [100, 20, 6, 2.2, 0.7, 0.4, 0.3, 0.4, 0.7, 2.2, 6, 20, 100];
const PLINKO_COLORS = ["#dc2626","#ea580c","#f97316","#facc15","#84cc16","#22c55e","#15803d","#22c55e","#84cc16","#facc15","#f97316","#ea580c","#dc2626"];
const TEAL_BG = "radial-gradient(ellipse at center, #14100c 0%, #0c0a08 60%, #080604 100%)";
const PBW = 340, PBH = 420, PPX = 6, PPT = 40;
const PRWH = (PBH - PPT - 55) / PLINKO_ROWS;
const PSLY = PPT + PLINKO_ROWS * PRWH + 8;
const PPEGR = 4;
const PBALLR = 5.5;
const PSLOT_TOTAL_W = PBW - PPX * 2;
const PSLOT_W = PSLOT_TOTAL_W / PLINKO_SLOTS;
const PSLOT_EDGES = [];
(() => {
  for (let i = 0; i <= PLINKO_SLOTS; i++) {
    PSLOT_EDGES.push(PPX + i * PSLOT_W);
  }
})();
const PPEGS = [];
(() => {
  const botPegs = PLINKO_ROWS + 2;
  const totalW = PBW - PPX * 2;
  const hSpace = totalW / (botPegs - 1);
  for (let row = 0; row < PLINKO_ROWS; row++) {
    const n = row + 3;
    const rowW = (n - 1) * hSpace;
    const startX = PBW / 2 - rowW / 2;
    const y = PPT + row * PRWH;
    for (let col = 0; col < n; col++) {
      PPEGS.push({ x: startX + col * hSpace, y });
    }
  }
})();
let _pBallId = 0;
function generatePlinkoPath() {
  const botPegs = PLINKO_ROWS + 2;
  const totalW = PBW - PPX * 2;
  const hSpace = totalW / (botPegs - 1);
  const choices = [];
  for (let i = 0; i < PLINKO_ROWS; i++) choices.push(Math.random() < 0.5 ? 0 : 1);
  const slot = choices.reduce((a, b) => a + b, 0);
  const waypoints = [];
  waypoints.push({ x: PBW / 2, y: PPT - 15 });
  let gap = 0;
  for (let row = 0; row < PLINKO_ROWS; row++) {
    gap += choices[row];
    const n = row + 3;
    const rowW = (n - 1) * hSpace;
    const startX = PBW / 2 - rowW / 2;
    const gx = startX + gap * hSpace + hSpace / 2;
    const gy = PPT + row * PRWH + PRWH * 0.6;
    waypoints.push({ x: gx + (Math.random() - 0.5) * 6, y: gy });
  }
  waypoints.push({ x: PSLOT_EDGES[slot] + PSLOT_W / 2, y: PSLY });
  return { waypoints, slot };
}
function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}
function simPlinkoBall(b, dt) {
  if (b.landed) return b;
  const elapsed = b.elapsed + dt;
  const path = b.path;
  const maxIdx = path.length - 1;
  const segTimes = b.segTimes;
  const totalTime = segTimes[segTimes.length - 1];
  if (elapsed >= totalTime) {
    const final = path[maxIdx];
    return { ...b, x: final.x, y: final.y, elapsed, landed: true, slot: b.targetSlot, landTime: Date.now() };
  }
  let seg = 0;
  for (let i = 0; i < segTimes.length - 1; i++) {
    if (elapsed < segTimes[i + 1]) { seg = i; break; }
  }
  const segStart = segTimes[seg];
  const segEnd = segTimes[seg + 1];
  const segDur = segEnd - segStart;
  const localT = Math.min(1, (elapsed - segStart) / segDur);
  const from = path[seg];
  const to = path[seg + 1];
  const yT = localT * localT;
  const y = from.y + (to.y - from.y) * yT;
  const xRaw = easeInOut(localT);
  const bounce = localT > 0.85 ? Math.sin((localT - 0.85) / 0.15 * Math.PI) * 1.5 : 0;
  const x = from.x + (to.x - from.x) * xRaw + bounce * (to.x > from.x ? -1 : 1);
  return { ...b, x, y, elapsed };
}
function PlinkoGame({ chips, setChips, onBack, onRebuy, startChips, lastBets = {}, setLastBet, winStreak = 0, vipPoints = 0, achCount = 0, reportLoss, applyWin = null, onBetPlaced = null, onRoundEnd, skipOverlays = false, skipEffects = false, theme = "dark", skinTheme, skinId = "house", activePowerUps = [] }) {
  const [bet, setBet] = useState(() => Math.min(lastBets?.plinko || 5, chips));
  useEffect(() => { if (setLastBet) setLastBet("plinko", bet); }, [bet, setLastBet]);
  const [message, setMessage] = useState("Drop the ball");
  const [resultColor, setResultColor] = useState(_themeAccent);
  const [history, setHistory] = useState([]);
  const [slotFlashes, setSlotFlashes] = useState({});
  const [, forceRender] = useState(0);
  const fx = useWinEffects();
  const { shaking, shake, shakeIntensity, floatWins, addFloatWin, flash, triggerFlash, lightMode, triggerLights,
    bigWin, setBigWin, dismissOverlay, dismissAll, celebrateWin, shellEffects, coinRainActive, triggerCoins, softCoinRain, washType, triggerWash,
    confetti, triggerConfetti, eruptionActive, triggerEruption } = fx;
  const ballsRef = useRef([]);
  const rafRef = useRef(null);
  const lastTRef = useRef(0);
  const paidRef = useRef(new Set());
  useEffect(() => {
    const tick = (ts) => {
      const dt = lastTRef.current ? Math.min((ts - lastTRef.current) / 1000, 0.04) : 0.016;
      lastTRef.current = ts;
      let dirty = false;
      const now = Date.now();
      for (let i = 0; i < ballsRef.current.length; i++) {
        const b = ballsRef.current[i];
        if (!b.landed) {
          ballsRef.current[i] = simPlinkoBall(b, dt);
          dirty = true;
          if (ballsRef.current[i].landed && !paidRef.current.has(b.id)) {
            paidRef.current.add(b.id);
            const slot = ballsRef.current[i].slot;
            const mult = PLINKO_MULTS[slot] || 0.2;
            const win = Math.round(b.bet * mult);
            if (mult >= 1) { if (applyWin) applyWin(win); else setChips(c => c + win); }
            else setChips(c => c + win);
            setHistory(h => [mult, ...h].slice(0, 12));
            setSlotFlashes(f => ({ ...f, [slot]: now }));
            if (mult >= 26) {
              shake(600, "heavy");
              triggerFlash();
              addFloatWin(win, { x: 50, y: 40, bigThreshold: 0, megaThreshold: b.bet * 20 });
              setBigWin({ type: "mega", amount: win - b.bet });
              triggerLights("mega", 3000);
            } else if (mult >= 9) {
              shake(500, "normal");
              triggerFlash();
              addFloatWin(win, { x: 50, y: 40, bigThreshold: 0, megaThreshold: b.bet * 20 });
              setBigWin({ type: "big", amount: win - b.bet });
              triggerLights("big", 3000);
            } else if (mult >= 4) {
              shake(300, "light");
              triggerFlash();
              addFloatWin(win, { x: 40 + Math.random()*20, y: 50 });
              triggerLights("win", 1500);
              softCoinRain(winStreak);
            } else if (mult >= 1) {
              const profit = win - b.bet;
              if (profit > 0) { addFloatWin(profit, { x: 40 + Math.random()*20, y: 55 }); softCoinRain(winStreak); }
              triggerLights("win", 1000);
            }
            if (mult >= 1) { setMessage(`${mult}x — +$${win - b.bet}!`); setResultColor(mult >= 3 ? "#f1c40f" : "#27ae60"); }
            else { setMessage(`${mult}x — $${win} back`); setResultColor("#e74c3c"); if (reportLoss) reportLoss(b.bet); }
            const allDone = ballsRef.current.every(bb => bb.landed);
            if (allDone && onRoundEnd) onRoundEnd();
          }
        }
      }
      const len = ballsRef.current.length;
      ballsRef.current = ballsRef.current.filter(b => !b.landed || now - b.landTime < 1500);
      if (ballsRef.current.length !== len) dirty = true;
      if (dirty) forceRender(n => n + 1);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);
  const drop = () => {
    if (bet > chips || bet < 1) return;
    setChips(c => c - bet);
    if (onBetPlaced) onBetPlaced(bet);
    setBigWin(null);
    const { waypoints, slot } = generatePlinkoPath();
    const segTimes = [0];
    let cumT = 0;
    for (let i = 0; i < waypoints.length - 1; i++) {
      const dy = Math.max(5, waypoints[i + 1].y - waypoints[i].y);
      const segDur = 0.06 + Math.sqrt(dy / 800);
      cumT += segDur;
      segTimes.push(cumT);
    }
    ballsRef.current.push({
      id: ++_pBallId,
      x: waypoints[0].x,
      y: waypoints[0].y,
      path: waypoints,
      segTimes,
      elapsed: 0,
      targetSlot: slot,
      bet,
      landed: false,
      slot: -1,
      landTime: 0,
      spawnTime: Date.now(),
    });
    setMessage("Dropping...");
    setResultColor(_themeAccent);
  };
  const balls = ballsRef.current;
  const activeBalls = balls.filter(b => !b.landed);
  return (
    <GameShell bg={TEAL_BG} title="PLINKO" chips={chips} onBack={onBack} {...shellEffects} startChips={startChips} winStreak={winStreak} vipPoints={vipPoints} achCount={achCount} skipOverlays={skipOverlays} skipEffects={skipEffects} onRebuy={onRebuy} theme={theme} skinTheme={skinTheme} skinId={skinId} activePowerUps={activePowerUps} rules={<>
        <p style={{marginTop:0}}>Drop a ball from the top and watch it bounce through 12 rows of pegs into a payout slot.</p>
        <p><span style={{color:_themeAccent}}>How It Works:</span> The ball bounces left or right at each peg with roughly 50/50 probability. The final slot determines your payout multiplier.</p>
        <p><span style={{color:_themeAccent}}>Payouts:</span> Center slots pay 0.3×–1.0× (most likely). Edge slots pay up to 26× your bet (least likely).</p>
        <p><span style={{color:_themeAccent}}>Slot Values:</span> From edge to center: 26×, 9×, 4×, 2×, 1.4×, 1.0×, 0.3× — then mirrors back out.</p>
        <p><span style={{color:_themeAccent}}>Strategy:</span> No strategy — it's pure probability. The ball's path is random. Edge hits are rare but rewarding.</p>
        <p style={{color:T.muted, fontSize:11}}>RTP: ~93.6%. Medium volatility.</p>
      </>}>
      <FloatingWins wins={floatWins} />
      {bigWin && !skipOverlays && <BigWinOverlay type={bigWin.type} amount={bigWin.amount} onDone={dismissOverlay} />}
      {history.length > 0 && (
        <div style={{ display: "flex", gap: 4, margin: "8px 0", zIndex: 1, flexWrap: "wrap", justifyContent: "center" }}>
          {history.map((m, i) => (
            <div key={`${m}-${i}-${history.length}`} style={{
              padding: "2px 8px", borderRadius: 10, fontSize: 10, fontWeight: 700,
              fontFamily: T.mono,
              background: m >= 3 ? "rgba(220,38,38,0.3)" : m >= 1 ? "rgba(132,204,22,0.2)" : "rgba(100,100,100,0.2)",
              color: m >= 3 ? "#ef4444" : m >= 1 ? "#84cc16" : "#888",
              opacity: 1 - i * 0.06,
              animation: i === 0 ? "multBounceIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards" : "none",
              boxShadow: i === 0 && m >= 3 ? "0 0 8px rgba(239,68,68,0.3)" : "none",
            }}>{m}x</div>
          ))}
        </div>
      )}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 12, padding: "0 16px", zIndex: 1 }}>
        <div style={{ fontSize: 16, fontWeight: 600, textAlign: "center", minHeight: 24, letterSpacing: 1, color: resultColor, animation: "fadeIn 0.3s ease" }}>{message}</div>
        <div className="plinko-board" style={{ position:"relative", padding:8, maxWidth:"100%", width: PBW + 16 }}>
          <EdgeLights mode={lightMode} color="#22c55e" />
          <svg viewBox={`0 0 ${PBW} ${PBH}`} style={{ overflow: "visible", width:"100%", height:"auto", maxHeight:"55vh" }}>
            <rect x="0" y="0" width={PBW} height={PBH} rx="12" fill="rgba(0,0,0,0.3)" stroke={`${_themeAccent}26`} strokeWidth="1" />
          {}
          {PPEGS.map((peg, i) => {
            let lit = false;
            let closest = Infinity;
            for (const b of balls) {
              if (b.landed) continue;
              const dx = b.x - peg.x, dy = b.y - peg.y;
              const dist = dx * dx + dy * dy;
              if (dist < 500) { lit = true; }
              if (dist < closest) closest = dist;
            }
            const nearGlow = closest < 2000 && !lit ? Math.max(0, 1 - closest / 2000) : 0;
            return (
              <g key={i}>
                {lit && <circle cx={peg.x} cy={peg.y} r={PPEGR + 4} fill="none" stroke={`${_themeAccent}66`} strokeWidth="2" opacity="0.6">
                  <animate attributeName="opacity" from="0.6" to="0" dur="0.4s" fill="freeze"/>
                  <animate attributeName="r" from={PPEGR + 2} to={PPEGR + 8} dur="0.4s" fill="freeze"/>
                </circle>}
                <circle cx={peg.x} cy={peg.y} r={PPEGR} fill={_themeAccent}
                  opacity={lit ? 1 : 0.45 + nearGlow * 0.3}
                  style={{ transition: "opacity 0.15s", filter: lit ? `drop-shadow(0 0 4px ${_themeAccent}99)` : "none" }} />
              </g>
            );
          })}
          {}
          {PLINKO_MULTS.map((mult, i) => {
            const sx = PSLOT_EDGES[i];
            const sw = PSLOT_W;
            const flashTime = slotFlashes[i] || 0;
            const isFlash = Date.now() - flashTime < 500;
            const fs = mult >= 10 ? 7 : 8;
            return (
              <g key={i}>
                <rect x={sx + 0.5} y={PSLY} width={sw - 1} height={22} rx="3"
                  fill={isFlash ? PLINKO_COLORS[i] : `${PLINKO_COLORS[i]}33`}
                  stroke={isFlash ? "#fff" : `${PLINKO_COLORS[i]}66`} strokeWidth={isFlash ? 2 : 0.5}
                  style={{ transition: "all 0.2s" }}>
                  {isFlash && <animate attributeName="opacity" values="1;0.7;1" dur="0.4s" repeatCount="2"/>}
                </rect>
                <text x={sx + sw / 2} y={PSLY + 14} fill={isFlash ? "#fff" : PLINKO_COLORS[i]}
                  fontSize={fs} fontWeight="700" fontFamily="'JetBrains Mono', monospace"
                  textAnchor="middle" dominantBaseline="central" opacity={isFlash ? 1 : 0.7}
                  style={isFlash ? {filter:`drop-shadow(0 0 4px ${PLINKO_COLORS[i]})`} : {}}>{mult}x</text>
                {}
                {isFlash && (
                  <circle cx={sx + sw/2} cy={PSLY + 11} r="5" fill="none"
                    stroke={PLINKO_COLORS[i]} strokeWidth="2" opacity="0.8">
                    <animate attributeName="r" from="5" to="25" dur="0.5s" fill="freeze"/>
                    <animate attributeName="opacity" from="0.8" to="0" dur="0.5s" fill="freeze"/>
                    <animate attributeName="stroke-width" from="2.5" to="0.3" dur="0.5s" fill="freeze"/>
                  </circle>
                )}
                {}
                {isFlash && mult >= 4 && Array.from({length:6}, (_, j) => (
                  <circle key={`sp${j}`} cx={sx + sw/2 + (Math.random()-0.5)*20} cy={PSLY + (Math.random()-0.5)*10}
                    r={2 + Math.random()*2} fill={PLINKO_COLORS[i]} opacity={0.8}>
                    <animate attributeName="opacity" from="0.8" to="0" dur="0.5s" fill="freeze"/>
                    <animate attributeName="cy" from={PSLY} to={PSLY - 15 - Math.random()*20} dur="0.5s" fill="freeze"/>
                  </circle>
                ))}
              </g>
            );
          })}
          {}
          {balls.map(b => {
            const fade = b.landed ? Math.max(0, 1 - (Date.now() - b.landTime) / 1500) : 1;
            if (fade <= 0) return null;
            const centerDist = Math.abs(b.x - PBW/2) / (PBW/2);
            const glowIntensity = Math.min(1, centerDist * 1.5);
            const glowColor = `rgba(239,68,68,${0.2 + glowIntensity * 0.5})`;
            return (
              <g key={b.id} opacity={fade}>
                {}
                {!b.landed && glowIntensity > 0.2 && (
                  <circle cx={b.x} cy={b.y} r={PBALLR + 4 + glowIntensity * 6} fill="none"
                    stroke={glowColor} strokeWidth={1 + glowIntensity * 2} opacity={glowIntensity * 0.6}/>
                )}
                {}
                {!b.landed && b.elapsed > 0.1 && (
                  <>
                    <circle cx={b.x + (Math.random()-0.5)*2} cy={b.y - 8} r={2} fill="#ef4444" opacity={0.3}/>
                    <circle cx={b.x + (Math.random()-0.5)*3} cy={b.y - 16} r={1.5} fill="#ef4444" opacity={0.15}/>
                  </>
                )}
                <ellipse cx={b.x} cy={b.y + 5} rx={PBALLR - 1} ry="2.5" fill="rgba(0,0,0,0.25)" />
                <circle cx={b.x} cy={b.y} r={PBALLR} fill="#ef4444" stroke="#fff" strokeWidth="1.5" />
                <circle cx={b.x - 1.8} cy={b.y - 1.8} r="2" fill="rgba(255,255,255,0.3)" />
              </g>
            );
          })}
          {}
          {balls.length === 0 && (
            <g opacity="0.35">
              <line x1={PBW / 2} y1="6" x2={PBW / 2} y2="24" stroke={_themeAccent} strokeWidth="1" strokeDasharray="3,3" />
              <polygon points={`${PBW/2-6},8 ${PBW/2+6},8 ${PBW/2},18`} fill={_themeAccent} />
            </g>
          )}
        </svg>
        </div>
      </div>
      <div style={{ padding: "16px", width: "100%", maxWidth: 500, zIndex: 1 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          <BetControls bet={bet} setBet={setBet} chips={chips} presets={[1, 5, 10, 25, 50]} />
          <GoldButton onClick={drop} disabled={bet > chips || bet < 1} hint="⏎ drop">Drop</GoldButton>
        </div>
      </div>
      <div style={{ padding: "8px", fontSize: 10, color: "#2a4040", letterSpacing: 2, textTransform: "uppercase", zIndex: 1 }}>{PLINKO_ROWS} Rows · Edge Pays 26x · 94% RTP</div>
    </GameShell>
  );
}
const CRASH_BG = "radial-gradient(ellipse at center, #1a2e1a 0%, #0f1a0f 60%, #081008 100%)";
function generateCrashPoint() {
  const r = Math.random();
  return Math.max(1.0, 0.96 / r);
}
function CrashGame({ chips, setChips, onBack, onRebuy, startChips, lastBets = {}, setLastBet, winStreak = 0, vipPoints = 0, achCount = 0, reportLoss, applyWin = null, onBetPlaced = null, onRoundEnd, skipOverlays = false, skipEffects = false, theme = "dark", skinTheme, skinId = "house", activePowerUps = [] }) {
  const [bet, setBet] = useState(() => Math.min(lastBets?.crash || 10, chips));
  useEffect(() => { if (setLastBet) setLastBet("crash", bet); }, [bet, setLastBet]);
  const [phase, setPhase] = useState("betting");
  const [multiplier, setMultiplier] = useState(1.0);
  const [crashPoint, setCrashPoint] = useState(0);
  const [cashOutAt, setCashOutAt] = useState(0);
  const [message, setMessage] = useState("Place your bet and launch!");
  const [history, setHistory] = useState([]);
  useEffect(() => { if (phase === "crashed" && onRoundEnd) onRoundEnd(); }, [phase, onRoundEnd]);
  const [autoCashOut, setAutoCashOut] = useState(0);
  const [nearMiss, setNearMiss] = useState(null);
  const animRef = useRef(null);
  const startTimeRef = useRef(0);
  const crashRef = useRef(0);
  const cashedRef = useRef(false);
  const cashOutMultRef = useRef(0);
  const betRef = useRef(0);
  const multRef = useRef(1.0);
  const canvasRef = useRef(null);
  const gdRef = useRef({ pts: [], coIdx: -1, coMult: 0, crashed: false, crashPt: 0 });
  const isMobileC = typeof window !== "undefined" && window.innerWidth < 480;
  const GW = isMobileC ? Math.min(340, window.innerWidth - 48) : 380, GH = isMobileC ? 200 : 280;
  useEffect(() => {
    if (phase !== "running" && phase !== "watching") return;
    const iv = setInterval(() => setMultiplier(Math.floor(multRef.current * 100) / 100), 50);
    return () => clearInterval(iv);
  }, [phase]);
  const fx = useWinEffects();
  const { shaking, shake, shakeIntensity, floatWins, addFloatWin, flash, triggerFlash, lightMode, triggerLights,
    bigWin, setBigWin, dismissOverlay, dismissAll, celebrateWin, shellEffects, coinRainActive, triggerCoins, softCoinRain, washType, triggerWash,
    confetti, triggerConfetti, eruptionActive, triggerEruption } = fx;
  function drawCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const needW = Math.round(GW * dpr), needH = Math.round(GH * dpr);
    if (canvas.width !== needW || canvas.height !== needH) {
      canvas.width = needW;
      canvas.height = needH;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, GW, GH);
    const d = gdRef.current;
    const pts = d.pts;
    const peakM = pts.length > 0 ? pts[pts.length - 1].m : 1;
    const maxMult = Math.max(1.3, peakM * 1.15, d.crashed ? d.crashPt * 1.1 : 1.3);
    const maxTime = pts.length > 0 ? Math.max(4, pts[pts.length - 1].t * 1.15) : 4;
    const toX = (t) => 30 + (t / maxTime) * (GW - 40);
    const toY = (m) => maxMult > 1 ? GH - 20 - ((m - 1) / (maxMult - 1)) * (GH - 35) : GH - 20;
    ctx.strokeStyle = `${_themeAccent}14`; ctx.lineWidth = 1;
    ctx.font = "9px 'JetBrains Mono', monospace";
    ctx.fillStyle = `${_themeAccent}4d`; ctx.textAlign = "right";
    for (const m of [1, 1.5, 2, 3, 5, 10, 20, 50, 100]) {
      if (m > maxMult) break;
      const y = toY(m);
      ctx.beginPath(); ctx.moveTo(30, y); ctx.lineTo(GW - 10, y); ctx.stroke();
      ctx.fillText(m + "×", 26, y + 3);
    }
    ctx.strokeStyle = `${_themeAccent}33`;
    ctx.beginPath(); ctx.moveTo(30, GH - 20); ctx.lineTo(GW - 10, GH - 20); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(30, 15); ctx.lineTo(30, GH - 20); ctx.stroke();
    if (pts.length < 2) {
      const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 200);
      ctx.beginPath(); ctx.arc(toX(0), toY(1), 4 + pulse * 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(34,197,94,${0.4 + pulse * 0.4})`; ctx.fill();
      return;
    }
    const co = d.coIdx >= 0 ? d.coIdx : pts.length;
    const pre = pts.slice(0, Math.min(co + 1, pts.length));
    const post = d.coIdx >= 0 ? pts.slice(d.coIdx) : [];
    if (pre.length > 1) {
      ctx.beginPath();
      ctx.moveTo(toX(pre[0].t), toY(pre[0].m));
      for (let i = 1; i < pre.length; i++) ctx.lineTo(toX(pre[i].t), toY(pre[i].m));
      ctx.lineTo(toX(pre[pre.length - 1].t), GH - 20);
      ctx.lineTo(toX(pre[0].t), GH - 20);
      ctx.closePath();
      ctx.fillStyle = d.crashed && d.coIdx < 0 ? "rgba(239,68,68,0.06)" : "rgba(34,197,94,0.08)";
      ctx.fill();
    }
    if (pre.length > 1) {
      ctx.beginPath();
      ctx.moveTo(toX(pre[0].t), toY(pre[0].m));
      for (let i = 1; i < pre.length; i++) ctx.lineTo(toX(pre[i].t), toY(pre[i].m));
      ctx.strokeStyle = d.crashed && d.coIdx < 0 ? "#ef4444" : "#22c55e";
      ctx.lineWidth = 2.5; ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.setLineDash([]); ctx.stroke();
    }
    if (post.length > 1) {
      ctx.beginPath();
      ctx.moveTo(toX(post[0].t), toY(post[0].m));
      for (let i = 1; i < post.length; i++) ctx.lineTo(toX(post[i].t), toY(post[i].m));
      ctx.strokeStyle = d.crashed ? "#ef4444" : "rgba(34,197,94,0.4)";
      ctx.lineWidth = 2; ctx.setLineDash([6, 4]); ctx.stroke(); ctx.setLineDash([]);
    }
    if (!d.crashed && pts.length > 0) {
      const tip = pts[pts.length - 1];
      const inten = Math.min(1, (peakM - 1) / 9);
      const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 150);
      ctx.beginPath(); ctx.arc(toX(tip.t), toY(tip.m), 4 + inten * 4 + pulse * 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(34,197,94,${0.15 + pulse * 0.15})`; ctx.fill();
      ctx.beginPath(); ctx.arc(toX(tip.t), toY(tip.m), 3, 0, Math.PI * 2);
      ctx.fillStyle = "#22c55e"; ctx.fill();
    }
    if (d.coIdx >= 0 && d.coIdx < pts.length) {
      const cp = pts[d.coIdx];
      const cx = toX(cp.t), cy = toY(d.coMult);
      ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx.fillStyle = "#22c55e"; ctx.fill();
      ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.font = "bold 11px 'JetBrains Mono', monospace";
      ctx.fillStyle = "#22c55e"; ctx.textAlign = "center";
      ctx.fillText(d.coMult.toFixed(2) + "×", cx, cy - 12);
    }
    if (d.crashed && pts.length > 0) {
      const last = pts[pts.length - 1];
      const cx = toX(last.t), cy = toY(d.crashPt);
      const age = (Date.now() % 1800) / 1800;
      ctx.beginPath(); ctx.arc(cx, cy, 6 + age * 24, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(239,68,68,${0.6 - age * 0.6})`; ctx.lineWidth = 2; ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx.fillStyle = "#ef4444"; ctx.fill();
      ctx.font = "bold 11px 'JetBrains Mono', monospace";
      ctx.fillStyle = "#ef4444"; ctx.textAlign = "center";
      ctx.fillText(d.crashPt.toFixed(2) + "×", cx, cy - 12);
    }
  }
  const launch = () => {
    if (bet > chips || bet < 1) return;
    if (animRef.current) cancelAnimationFrame(animRef.current);
    setChips(c => c - bet);
    if (onBetPlaced) onBetPlaced(bet);
    betRef.current = bet;
    const cp = generateCrashPoint();
    setCrashPoint(cp); crashRef.current = cp;
    cashedRef.current = false; cashOutMultRef.current = 0;
    setCashOutAt(0);
    gdRef.current = { pts: [], coIdx: -1, coMult: 0, crashed: false, crashPt: 0 };
    setBigWin(null); setNearMiss(null);
    fx.clearCoins(); fx.clearConfetti(); fx.clearEruption(); fx.clearLights();
    multRef.current = 1.0; setMultiplier(1.0);
    setPhase("running");
    setMessage("Cash out before it crashes!");
    startTimeRef.current = performance.now();
    const animate = (now) => {
      const elapsed = (now - startTimeRef.current) / 1000;
      const mult = Math.pow(Math.E, 0.06 * Math.pow(elapsed, 1.55));
      if (mult >= crashRef.current) {
        multRef.current = crashRef.current;
        setMultiplier(Math.floor(crashRef.current * 100) / 100);
        gdRef.current.pts.push({ t: elapsed, m: crashRef.current });
        gdRef.current.crashed = true;
        gdRef.current.crashPt = crashRef.current;
        drawCanvas();
        setPhase("crashed");
        shake(500);
        if (cashedRef.current) {
          const profit = Math.floor(betRef.current * cashOutMultRef.current) - betRef.current;
          setMessage(`Crashed at ${crashRef.current.toFixed(2)}× — you got out at ${cashOutMultRef.current.toFixed(2)}× (+$${profit})`);
          if (crashRef.current >= cashOutMultRef.current * 2.5 && crashRef.current >= 5)
            setNearMiss(`It went to ${crashRef.current.toFixed(2)}×! Could've been $${Math.floor(betRef.current * crashRef.current) - betRef.current}...`);
          else setNearMiss(null);
        } else {
          setMessage(`Crashed at ${crashRef.current.toFixed(2)}×! Lost $${betRef.current}`);
          triggerLights("loss");
          if (reportLoss) reportLoss(betRef.current);
          const milestones = [2, 3, 5, 10, 20, 50];
          const nearMile = milestones.find(m => crashRef.current >= m * 0.85 && crashRef.current < m);
          if (nearMile) setNearMiss(`So close to ${nearMile}×! Crashed at ${crashRef.current.toFixed(2)}×`);
          else setNearMiss(null);
        }
        setHistory(h => [{ point: crashRef.current, won: cashedRef.current, cashAt: cashedRef.current ? cashOutMultRef.current : 0 }, ...h].slice(0, 20));
        return;
      }
      const rounded = Math.floor(mult * 100) / 100;
      if (autoCashOut > 0 && !cashedRef.current && rounded >= autoCashOut) {
        const winnings = Math.floor(betRef.current * autoCashOut);
        if (applyWin) applyWin(winnings); else setChips(c => c + winnings);
        setCashOutAt(autoCashOut);
        cashOutMultRef.current = autoCashOut;
        cashedRef.current = true;
        gdRef.current.coIdx = gdRef.current.pts.length;
        gdRef.current.coMult = autoCashOut;
        setPhase("watching");
        const profit = winnings - betRef.current;
        triggerFlash();
        if (profit > 0) addFloatWin(profit, { x: 50, y: 30 });
        if (autoCashOut >= 25) { shake(800, "epic"); setBigWin({ type:"epic", amount: profit }); triggerLights("mega"); }
        else if (autoCashOut >= 10) { shake(600, "heavy"); setBigWin({ type:"mega", amount: profit }); triggerLights("mega"); }
        else if (autoCashOut >= 5) { shake(400, "normal"); setBigWin({ type:"big", amount: profit }); triggerLights("big"); }
        else { triggerLights("win"); softCoinRain(winStreak); }
        setMessage(`Auto cashed out at ${autoCashOut.toFixed(2)}× (+$${profit}) — watching...`);
      }
      multRef.current = mult;
      gdRef.current.pts.push({ t: elapsed, m: mult });
      drawCanvas();
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
  };
  const cashOut = () => {
    if (phase !== "running" || cashedRef.current) return;
    const currentMult = Math.floor(multRef.current * 100) / 100;
    const winnings = Math.floor(bet * currentMult);
    if (applyWin) applyWin(winnings); else setChips(c => c + winnings);
    setMultiplier(currentMult);
    setCashOutAt(currentMult);
    cashOutMultRef.current = currentMult;
    cashedRef.current = true;
    gdRef.current.coIdx = gdRef.current.pts.length;
    gdRef.current.coMult = currentMult;
    setPhase("watching");
    const profit = winnings - bet;
    triggerFlash();
    if (profit > 0) addFloatWin(profit, { x: 50, y: 30 });
    if (currentMult >= 25) { shake(800, "epic"); setBigWin({ type:"epic", amount: profit }); triggerLights("mega"); }
    else if (currentMult >= 10) { shake(600, "heavy"); setBigWin({ type:"mega", amount: profit }); triggerLights("mega"); }
    else if (currentMult >= 5) { shake(400, "normal"); setBigWin({ type:"big", amount: profit }); triggerLights("big"); }
    else if (currentMult >= 2) { shake(200, "light"); triggerLights("win"); softCoinRain(winStreak); }
    else { triggerLights("win"); softCoinRain(winStreak); }
    setMessage(`Cashed out at ${currentMult.toFixed(2)}× (+$${profit}) — watching...`);
  };
  const reset = () => {
    cancelAnimationFrame(animRef.current);
    setPhase("betting"); setMultiplier(1.0); multRef.current = 1.0;
    setCrashPoint(0); setCashOutAt(0);
    gdRef.current = { pts: [], coIdx: -1, coMult: 0, crashed: false, crashPt: 0 };
    setBigWin(null); fx.clearLights();
    setMessage("Place your bet and launch!");
    setBet(b => Math.min(b, chips > 0 ? chips : 1000));
    drawCanvas();
  };
  useEffect(() => () => cancelAnimationFrame(animRef.current), []);
  useEffect(() => {
    if (phase !== "crashed") return;
    let active = true;
    const tick = () => { if (active) { drawCanvas(); requestAnimationFrame(tick); } };
    requestAnimationFrame(tick);
    return () => { active = false; };
  }, [phase]);
  const handleKey = useCallback((key) => {
    if (phase === "betting" && (key === " " || key === "Enter")) launch();
    else if (phase === "running" && (key === " " || key === "Enter")) cashOut();
    else if (phase === "crashed" && (key === " " || key === "Enter")) reset();
  }, [phase]);
  const intensity = Math.min(1, (multiplier - 1) / 9);
  const pulseSpeed = Math.max(0.3, 1.2 - intensity * 0.9);
  const multColor = phase === "crashed" ? "#ef4444" : phase === "watching" ? "#22c55e" : multiplier >= 2 ? "#22c55e" : _themeAccent;
  const bgShift = phase === "running" || phase === "watching"
    ? `radial-gradient(ellipse at center, rgba(${26 + intensity * 20},${46 + intensity * 40},${26},1) 0%, #0f1a0f 60%, #081008 100%)`
    : CRASH_BG;
  const showGame = phase !== "betting";
  return (
    <GameShell bg={bgShift} title="CRASH" chips={chips} onBack={onBack} {...shellEffects} startChips={startChips} winStreak={winStreak} vipPoints={vipPoints} achCount={achCount} skipOverlays={skipOverlays} skipEffects={skipEffects} onRebuy={onRebuy} theme={theme} skinTheme={skinTheme} skinId={skinId} activePowerUps={activePowerUps} onKeyAction={handleKey} nearMiss={nearMiss} rules={<>
        <p style={{marginTop:0}}>Place a bet and watch the multiplier climb. Cash out before it crashes!</p>
        <p><span style={{color:_themeAccent}}>Gameplay:</span> After betting, a multiplier starts at 1.00× and rises exponentially. Click "Cash Out" at any time to win your bet × the current multiplier.</p>
        <p><span style={{color:_themeAccent}}>The Crash:</span> At a random point, the multiplier crashes to zero. If you haven't cashed out, you lose your bet entirely.</p>
        <p><span style={{color:_themeAccent}}>Watch Mode:</span> If you cash out, you can watch the multiplier continue climbing (or crash) for the rest of the round.</p>
        <p><span style={{color:_themeAccent}}>Strategy:</span> Lower cash-out targets are safer but less rewarding. The crash point is random each round — there's no pattern to predict.</p>
        <p style={{color:T.muted, fontSize:11}}>House edge: 4%. The crash point is determined before each round starts.</p>
      </>}>
      <FloatingWins wins={floatWins} />
      {bigWin && !skipOverlays && <BigWinOverlay type={bigWin.type} amount={bigWin.amount} onDone={dismissOverlay} />}
      {history.length > 0 && (
        <div style={{ display:"flex", gap:4, flexWrap:"wrap", justifyContent:"center", padding:"6px 12px", zIndex:1, maxWidth:400 }}>
          {history.slice(0, 12).map((h, i) => (
            <span key={`${h.point}-${i}-${history.length}`} style={{
              fontSize:10, fontFamily:T.mono, fontWeight:600,
              padding:"2px 6px", borderRadius:4,
              background: h.won ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
              color: h.won ? "#22c55e" : "#ef4444",
              border: `1px solid ${h.won ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
              animation: i === 0 ? "crashHistoryIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards" : "none",
              boxShadow: i === 0 ? `0 0 8px ${h.won ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}` : "none",
            }}>{h.point.toFixed(2)}×</span>
          ))}
        </div>
      )}
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:12, padding:"0 12px", zIndex:1 }}>
        <div style={{ fontSize:14, fontWeight:600, textAlign:"center", letterSpacing:1, color: phase === "crashed" ? "#ef4444" : phase === "watching" ? "#22c55e" : _themeAccent }}>
          {message}
        </div>
        {}
        <div style={{ textAlign:"center", display: showGame ? "block" : "none" }}>
          <div style={{ fontSize:32, marginBottom:4, position:"relative", display:"inline-block",
            animation: phase === "crashed" ? "none" : `float ${Math.max(0.5, 2 - intensity * 1.5)}s ease-in-out infinite`,
            transform: phase === "crashed" ? "rotate(90deg) scale(1.2)" : "none",
            transition: "transform 0.3s",
            filter: phase === "crashed" ? "grayscale(0.5)" : "none",
          }}>
            {phase === "crashed" ? "×" : "▲"}
            {}
            {(phase === "running" || phase === "watching") && (
              <div style={{ position:"absolute", left:"50%", top:"50%", transform:"translate(-50%,-50%)",
                width: 40 + intensity * 30, height: 40 + intensity * 30, borderRadius:"50%",
                background:`radial-gradient(circle, rgba(34,197,94,${0.1 + intensity * 0.15}) 0%, transparent 70%)`,
                pointerEvents:"none", animation:`rocketTrail ${Math.max(0.4, 1.2 - intensity * 0.8)}s ease-in-out infinite` }} />
            )}
            {}
            {phase === "crashed" && (
              <div style={{ position:"absolute", left:"50%", top:"50%", transform:"translate(-50%,-50%)",
                width:20, height:20, borderRadius:"50%",
                border:"3px solid rgba(239,68,68,0.6)",
                animation:"crashShockwave 0.6s ease-out forwards", pointerEvents:"none" }} />
            )}
          </div>
          <div style={{
            fontSize: multiplier >= 10 ? 44 : multiplier >= 5 ? 50 : 56,
            fontWeight:800,
            fontFamily:T.mono, color: multColor,
            textShadow: (phase === "running" || phase === "watching")
              ? `0 0 ${20 + intensity * 40}px ${multColor}, 0 0 ${8 + intensity * 20}px ${multColor}`
              : phase === "crashed" ? "0 0 30px #ef4444, 0 0 60px rgba(239,68,68,0.3)" : "none",
            letterSpacing: 2,
            transition: "font-size 0.3s, text-shadow 0.2s",
          }}>
            {phase === "watching" ? `${cashOutAt.toFixed(2)}×` : `${multiplier.toFixed(2)}×`}
            {phase === "watching" && <span style={{ fontSize:20, color:T.muted, marginLeft:8 }}>({multiplier.toFixed(2)}×)</span>}
          </div>
          {}
          {phase === "crashed" && (
            <div style={{ position:"absolute", inset:0, borderRadius:8, pointerEvents:"none",
              animation:"crashFadeRed 0.5s ease-out forwards" }} />
          )}
        </div>
        <div style={{ position:"relative", padding:8, width:"100%", maxWidth: GW + 36 }}>
          <EdgeLights mode={lightMode} color="#22c55e" />
          <div style={{
            background:"rgba(0,0,0,0.4)", borderRadius:12, padding:10,
            border: phase === "running" ? `1px solid rgba(34,197,94,${0.15 + intensity * 0.3})` : phase === "crashed" ? "1px solid rgba(239,68,68,0.4)" : `1px solid ${_themeAccent}26`,
            boxShadow: phase === "running"
              ? `inset 0 0 20px rgba(0,0,0,0.3), 0 0 ${intensity * 20}px rgba(34,197,94,${intensity * 0.2}), 0 0 ${intensity * 40}px rgba(34,197,94,${intensity * 0.08})`
              : phase === "crashed" ? "inset 0 0 30px rgba(239,68,68,0.15), 0 0 20px rgba(239,68,68,0.1)" : "inset 0 0 20px rgba(0,0,0,0.3)",
            width:"100%", maxWidth: GW + 20,
            transition: "border-color 0.3s, box-shadow 0.3s",
            animation: phase === "running" ? `borderGlow ${pulseSpeed}s ease-in-out infinite` : "none",
          }}>
            <canvas ref={canvasRef} width={GW} height={GH} style={{ width: "100%", maxWidth: GW, height: "auto", aspectRatio: `${GW}/${GH}`, display:"block", margin:"0 auto" }} />
          </div>
        </div>
        <div style={{ fontFamily:T.mono, fontSize:11, color:"#7a7070", textAlign:"center", display: showGame ? "block" : "none" }}>
          Bet: ${bet}{phase === "watching" && ` · Won: $${Math.floor(bet * cashOutAt)}`}
          {phase === "crashed" && !cashedRef.current && ` · Crash: ${crashPoint.toFixed(2)}×`}
          {phase === "crashed" && cashedRef.current && ` · Won: $${Math.floor(bet * cashOutAt)} · Crash: ${crashPoint.toFixed(2)}×`}
        </div>
      </div>
      <div style={{ padding:"16px", width:"100%", maxWidth:500, zIndex:1 }}>
        {phase === "betting" && (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:14 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
              <span style={{ fontSize:10, letterSpacing:2, color:T.dim, fontFamily:T.mono, textTransform:"uppercase" }}>Auto Cash-Out</span>
              <div style={{ display:"flex", gap:4 }}>
                {[0, 1.5, 2, 3, 5, 10].map(v => (
                  <button key={v} onClick={() => setAutoCashOut(v)} style={{
                    padding:"4px 8px", fontSize:10, fontWeight:600, fontFamily:T.mono,
                    background: autoCashOut === v ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.05)",
                    border: `1px solid ${autoCashOut === v ? "#22c55e" : "rgba(255,255,255,0.1)"}`,
                    borderRadius:4, color: autoCashOut === v ? "#22c55e" : "#6a6050", cursor:"pointer",
                  }}>{v === 0 ? "Off" : `${v}×`}</button>
                ))}
              </div>
            </div>
            <BetControls bet={bet} setBet={setBet} chips={chips} presets={[5,10,25,50,100]} />
            <GoldButton onClick={launch} disabled={bet > chips || bet < 1} hint="⏎ launch">Launch</GoldButton>
          </div>
        )}
        {phase === "running" && (
          <div style={{ display:"flex", justifyContent:"center" }}>
            <button onClick={cashOut} style={{
              padding:"16px 48px", fontSize:18, fontWeight:800,
              fontFamily:T.serif,
              letterSpacing:3, textTransform:"uppercase",
              background:`linear-gradient(180deg, hsl(${142 + intensity * 10}, ${72 + intensity * 10}%, ${45 + intensity * 10}%), #16a34a)`,
              color:"#fff", border:"2px solid #4ade80",
              borderRadius:8, cursor:"pointer",
              boxShadow:`0 0 ${20 + intensity * 30}px rgba(34,197,94,${0.4 + intensity * 0.3})`,
              animation: `pulse ${pulseSpeed}s infinite`,
              transition: "box-shadow 0.3s",
            }}>
              Cash Out ${Math.floor(bet * multiplier)}
            </button>
          </div>
        )}
        {phase === "watching" && (
          <div style={{ textAlign:"center", color:T.muted, fontSize:13, letterSpacing:2 }}>
            Watching... {multiplier.toFixed(2)}× and climbing
          </div>
        )}
        {phase === "crashed" && (
          <div style={{ display:"flex", gap:8, justifyContent:"center", flexWrap:"wrap" }}>
            <GoldButton onClick={reset} small>Change Bet</GoldButton>
            {bet <= chips && bet >= 1 && (
              <GoldButton onClick={() => { reset(); setTimeout(launch, 50); }}>Rebet ${bet} ▲</GoldButton>
            )}
          </div>
        )}
      </div>
      <div style={{ padding:"8px", fontSize:10, color:"#1a3a1a", letterSpacing:2, textTransform:"uppercase", zIndex:1 }}>Cash out before the crash · 4% house edge</div>
    </GameShell>
  );
}
function HighLowGame({ chips, setChips, onBack, onRebuy, startChips, lastBets = {}, setLastBet, winStreak = 0, vipPoints = 0, achCount = 0, reportLoss, applyWin = null, onBetPlaced = null, onRoundEnd, skipOverlays = false, skipEffects = false, theme = "dark", skinTheme, skinId = "house", activePowerUps = [] }) {
  const [deck, setDeck] = useState(() => createDeck(4));
  const [currentCard, setCurrentCard] = useState(null);
  const [nextCard, setNextCard] = useState(null);
  const [bet, setBet] = useState(() => Math.min(lastBets?.highlow || 25, chips));
  useEffect(() => { if (setLastBet) setLastBet("highlow", bet); }, [bet, setLastBet]);
  const [phase, setPhase] = useState("betting");
  const [hlStreak, setHlStreak] = useState(0);
  const [winnings, setWinnings] = useState(0);
  const [result, setResult] = useState("");
  const [history, setHistory] = useState([]);
  useEffect(() => { if (phase === "result" && onRoundEnd) onRoundEnd(); }, [phase, onRoundEnd]);
  const fx = useWinEffects();
  const { shaking, shake, shakeIntensity, floatWins, addFloatWin, flash, triggerFlash, lightMode, triggerLights,
    bigWin, setBigWin, dismissOverlay, dismissAll, celebrateWin, shellEffects, coinRainActive, triggerCoins, softCoinRain, washType, triggerWash,
    confetti, triggerConfetti, eruptionActive, triggerEruption } = fx;
  const RANK_ORDER = { "2":2,"3":3,"4":4,"5":5,"6":6,"7":7,"8":8,"9":9,"10":10,"J":11,"Q":12,"K":13,"A":14 };
  const rankVal = (card) => RANK_ORDER[card.rank];
  const HI_LO_PAYS = {
    2:  { high: 1.04, low: 0 },
    3:  { high: 1.06, low: 11.61 },
    4:  { high: 1.16, low: 5.81 },
    5:  { high: 1.29, low: 3.87 },
    6:  { high: 1.45, low: 2.9 },
    7:  { high: 1.66, low: 2.32 },
    8:  { high: 1.88, low: 1.88 },
    9:  { high: 2.32, low: 1.66 },
    10: { high: 2.9,  low: 1.45 },
    11: { high: 3.87, low: 1.29 },
    12: { high: 5.81, low: 1.16 },
    13: { high: 11.61, low: 1.06 },
    14: { high: 0,    low: 1.04 },
  };
  const getPayouts = (card) => {
    if (!card) return { high: 0, low: 0 };
    const r = rankVal(card);
    return HI_LO_PAYS[r] || { high: 1.8, low: 1.8 };
  };
  const payouts = getPayouts(currentCard);
  const deal = () => {
    let d = [...deck];
    if (d.length < 10) d = createDeck(4);
    const card = d.pop();
    setDeck(d);
    setCurrentCard(card);
    setNextCard(null);
    setChips(c => c - bet);
    if (onBetPlaced) onBetPlaced(bet);
    setWinnings(bet);
    setHlStreak(0);
    setResult("");
    setPhase("guessing");
  };
  const guess = (choice) => {
    let d = [...deck];
    if (d.length < 5) d = createDeck(4);
    const next = d.pop();
    setDeck(d);
    setNextCard(next);
    setPhase("revealing");
    const curr = rankVal(currentCard);
    const nxt = rankVal(next);
    const isHigher = nxt > curr;
    const isLower = nxt < curr;
    const isTie = nxt === curr;
    const correct = (choice === "higher" && isHigher) || (choice === "lower" && isLower);
    const roundPay = choice === "higher" ? payouts.high : payouts.low;
    setTimeout(() => {
      if (isTie) {
        setResult("tie");
        setHistory(h => [...h.slice(-11), { card: next, correct: null }]);
        triggerLights("push");
        setTimeout(() => {
          setCurrentCard(next);
          setNextCard(null);
          setPhase("guessing");
        }, 800);
      } else if (correct) {
        const newStreak = hlStreak + 1;
        setHlStreak(newStreak);
        const newWinnings = Math.floor(winnings * roundPay);
        setWinnings(newWinnings);
        setResult("correct");
        triggerFlash();
        triggerLights("win");
        if (roundPay >= 2.5 || newStreak >= 3) {
          shake();
          addFloatWin(newWinnings - bet, {x:50, y:30});
        }
        setHistory(h => [...h.slice(-11), { card: next, correct: true }]);
        setTimeout(() => {
          setCurrentCard(next);
          setNextCard(null);
          setPhase("guessing");
        }, 800);
      } else {
        setResult("wrong");
        setWinnings(0);
        triggerLights("loss");
        if (reportLoss) reportLoss(bet);
        setHistory(h => [...h.slice(-11), { card: next, correct: false }]);
        setTimeout(() => setPhase("result"), 600);
      }
    }, 500);
  };
  const cashOut = () => {
    if (applyWin) applyWin(winnings); else setChips(c => c + winnings);
    const profit = winnings - bet;
    if (profit > 0) {
      addFloatWin(profit, {x:50, y:30});
      triggerFlash();
      triggerLights(profit >= bet * 5 ? "big" : "win"); if(profit >= bet * 5){setBigWin({type:profit>=bet*15?"mega":"big",amount:profit});}else{softCoinRain(winStreak);}
      if (profit >= bet * 5) shake();
    }
    setResult("cashout");
    setPhase("result");
  };
  const newRound = () => {
    setBigWin(null);
    fx.clearLights();
    setBet(b => Math.min(b, chips > 0 ? chips : 10));
    setPhase("betting");
    setCurrentCard(null);
    setNextCard(null);
    setHlStreak(0);
    setWinnings(0);
    setResult("");
  };
  const bg = "linear-gradient(180deg, #1a2a1a 0%, #0d1f0d 50%, #0a1a0a 100%)";
  return (
    <GameShell bg={bg} title="Hi-Lo" chips={chips} onBack={onBack} {...shellEffects} startChips={startChips} winStreak={hlStreak} vipPoints={vipPoints} achCount={achCount} skipOverlays={skipOverlays} skipEffects={skipEffects} onRebuy={onRebuy} theme={theme} skinTheme={skinTheme} skinId={skinId} activePowerUps={activePowerUps} rules={<>
        <p style={{marginTop:0}}>Guess whether the next card will be higher or lower than the current card.</p>
        <p><span style={{color:_themeAccent}}>Card Order:</span> 2 (lowest) through Ace (highest). Suits don't matter.</p>
        <p><span style={{color:_themeAccent}}>Payouts:</span> Each guess pays based on how likely it is. Guessing "higher" on a 2 is near-certain and pays only 1.08×. Guessing "lower" on a King is risky and pays 11×. Middle cards (7–8) pay ~1.8× either way.</p>
        <p><span style={{color:_themeAccent}}>Ties:</span> If the next card is equal, it's a push — your pot is unchanged and you guess again.</p>
        <p><span style={{color:_themeAccent}}>Cash Out:</span> After 1+ correct guesses, you can cash out at any time. If you guess wrong, you lose everything.</p>
        <p style={{color:T.muted, fontSize:11}}>House edge: ~3.5%. Uses 4 decks.</p>
      </>}>
      <FloatingWins wins={floatWins} />
      {bigWin && !skipOverlays && <BigWinOverlay type={bigWin.type} amount={bigWin.amount} onDone={dismissOverlay} />}
      <div style={{ padding:"12px", position:"relative", zIndex:1, maxWidth:540, margin:"0 auto" }}>
        <EdgeLights mode={lightMode} color="#f59e0b" />
        {}
        <div style={{ display:"flex", justifyContent:"center", gap:16, marginBottom:8, padding:"6px 12px",
          background:"rgba(255,240,220,0.03)", borderRadius:8, border:`1px solid ${_themeAccent}14` }}>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:8, letterSpacing:2, color:T.dim, fontFamily:T.mono, textTransform:"uppercase" }}>Bet</div>
            <div style={{ fontSize:14, fontWeight:700, fontFamily:T.mono, color:_themeAccent }}>${bet}</div>
          </div>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:8, letterSpacing:2, color:T.dim, fontFamily:T.mono, textTransform:"uppercase" }}>Streak</div>
            <div style={{ fontSize:14, fontWeight:700, fontFamily:T.mono, color: hlStreak > 0 ? "#22c55e" : T.muted }}>{hlStreak}</div>
          </div>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:8, letterSpacing:2, color:T.dim, fontFamily:T.mono, textTransform:"uppercase" }}>Pot</div>
            <div style={{ fontSize:14, fontWeight:700, fontFamily:T.mono, color: winnings > 0 ? "#f1c40f" : T.muted }}>${winnings.toLocaleString()}</div>
          </div>
          {history.length > 0 && <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:8, letterSpacing:2, color:T.dim, fontFamily:T.mono, textTransform:"uppercase" }}>Last</div>
            <div style={{ fontSize:14, fontWeight:700, fontFamily:T.mono, color:T.textMuted }}>{history.length > 0 ? history[history.length-1].card?.rank || "—" : "—"}</div>
          </div>}
        </div>
        {}
        {phase !== "betting" && phase !== "result" && (
          <div style={{ textAlign:"center", marginBottom:16 }}>
            <div style={{ display:"flex", justifyContent:"center", gap:20, marginBottom:8 }}>
              <div>
                <div style={{ fontSize:9, letterSpacing:2, color:T.dim, fontFamily:T.mono, textTransform:"uppercase" }}>Streak</div>
                <div style={{ fontSize:24, fontWeight:700, fontFamily:T.mono,
                  color: hlStreak >= 3 ? "#f59e0b" : hlStreak >= 1 ? _themeAccent : "#8a8070",
                  animation: hlStreak >= 3 ? "hlStreakFire 1.2s ease-in-out infinite" : "none" }}>{hlStreak}</div>
              </div>
              <div>
                <div style={{ fontSize:9, letterSpacing:2, color:T.dim, fontFamily:T.mono, textTransform:"uppercase" }}>Pot</div>
                <div key={winnings} style={{ fontSize:24, fontWeight:700, fontFamily:T.mono, color:T.green,
                  animation: winnings > bet ? "hlPotPulse 0.3s ease-out" : "none" }}>${winnings}</div>
              </div>
              <div>
                <div style={{ fontSize:9, letterSpacing:2, color:T.dim, fontFamily:T.mono, textTransform:"uppercase" }}>Total ×</div>
                <div style={{ fontSize:24, fontWeight:700, fontFamily:T.mono, color:_themeAccent }}>{(winnings / bet).toFixed(2)}×</div>
              </div>
            </div>
          </div>
        )}
        {}
        <div style={{ display:"flex", justifyContent:"center", alignItems:"center", gap:32, minHeight:170, marginBottom:16 }}>
          {currentCard && (
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:9, letterSpacing:2, color:T.dim, fontFamily:T.mono, marginBottom:6, textTransform:"uppercase" }}>Current</div>
              <Card card={currentCard} />
            </div>
          )}
          {(phase === "guessing" || phase === "revealing" || phase === "result") && (
            <div style={{ fontSize:20, color:_themeAccent, fontWeight:700 }}>→</div>
          )}
          {nextCard ? (
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:9, letterSpacing:2, color:T.dim, fontFamily:T.mono, marginBottom:6, textTransform:"uppercase" }}>Next</div>
              <div style={{ animation: result === "wrong" ? "hlCardReveal 0.4s ease-out, hlWrong 0.5s ease-out 0.4s" : "hlCardReveal 0.4s ease-out",
                perspective:600, borderRadius:8,
                ...(result === "correct" ? { animation:"hlCardReveal 0.4s ease-out, hlCorrect 0.6s ease-out 0.3s" } : {}) }}>
                <Card card={nextCard} />
              </div>
            </div>
          ) : phase === "guessing" ? (
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:9, letterSpacing:2, color:T.dim, fontFamily:T.mono, marginBottom:6, textTransform:"uppercase" }}>Next</div>
              <div style={{ width:96, height:134, borderRadius:8, border:`2px dashed ${_themeAccent}4d`,
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, color:`${_themeAccent}4d`,
                background:`${_themeAccent}05` }}>?</div>
            </div>
          ) : null}
        </div>
        {}
        {phase === "betting" && (
          <div style={{ textAlign:"center" }}>
            <BetControls bet={bet} setBet={setBet} chips={chips} presets={[5,10,25,50,100]} />
            <div style={{ marginTop:8, textAlign:"center" }}>
              <GoldButton onClick={deal} disabled={chips < bet || bet <= 0} hint="⏎ deal">Deal Card</GoldButton>
            </div>
          </div>
        )}
        {}
        {phase === "guessing" && (
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:11, letterSpacing:2, color:T.muted, fontFamily:T.mono, marginBottom:14, textTransform:"uppercase" }}>
              Will the next card be higher or lower?
            </div>
            <div style={{ display:"flex", gap:12, justifyContent:"center", marginBottom:12 }}>
              <button onClick={() => guess("higher")} disabled={payouts.high === 0} style={{
                padding:"14px 24px", fontSize:15, fontWeight:700, fontFamily:T.serif,
                letterSpacing:2, textTransform:"uppercase",
                background: payouts.high === 0 ? "rgba(100,100,100,0.3)" : "linear-gradient(180deg, #22c55e, #16a34a)", color:"#fff",
                border:"none", borderRadius:8, cursor: payouts.high === 0 ? "not-allowed" : "pointer",
                transition:"transform 0.15s", opacity: payouts.high === 0 ? 0.4 : 1,
                display:"flex", flexDirection:"column", alignItems:"center", gap:4,
              }}
                onMouseEnter={e => { if (payouts.high > 0) e.currentTarget.style.transform="scale(1.05)"; }}
                onMouseLeave={e => e.currentTarget.style.transform="scale(1)"}>
                <span>▲ Higher</span>
                {payouts.high > 0 && <span style={{ fontSize:11, opacity:0.85, fontFamily:T.mono }}>{payouts.high}×</span>}
              </button>
              <button onClick={() => guess("lower")} disabled={payouts.low === 0} style={{
                padding:"14px 24px", fontSize:15, fontWeight:700, fontFamily:T.serif,
                letterSpacing:2, textTransform:"uppercase",
                background: payouts.low === 0 ? "rgba(100,100,100,0.3)" : "linear-gradient(180deg, #ef4444, #dc2626)", color:"#fff",
                border:"none", borderRadius:8, cursor: payouts.low === 0 ? "not-allowed" : "pointer",
                transition:"transform 0.15s", opacity: payouts.low === 0 ? 0.4 : 1,
                display:"flex", flexDirection:"column", alignItems:"center", gap:4,
              }}
                onMouseEnter={e => { if (payouts.low > 0) e.currentTarget.style.transform="scale(1.05)"; }}
                onMouseLeave={e => e.currentTarget.style.transform="scale(1)"}>
                <span>▼ Lower</span>
                {payouts.low > 0 && <span style={{ fontSize:11, opacity:0.85, fontFamily:T.mono }}>{payouts.low}×</span>}
              </button>
            </div>
            {hlStreak >= 1 && (
              <button onClick={cashOut} style={{
                padding:"10px 24px", fontSize:12, fontWeight:700, fontFamily:T.mono,
                letterSpacing:2, textTransform:"uppercase",
                background:`${_themeAccent}26`, border:`1px solid ${_themeAccent}`,
                borderRadius:6, color:_themeAccent, cursor:"pointer", transition:"all 0.2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.background=`${_themeAccent}40`; }}
                onMouseLeave={e => { e.currentTarget.style.background=`${_themeAccent}26`; }}>
                Cash Out ${winnings}
              </button>
            )}
          </div>
        )}
        {}
        {phase === "revealing" && (
          <div style={{ textAlign:"center", fontSize:14, color:_themeAccent, letterSpacing:2, fontFamily:T.mono }}>
            Revealing...
          </div>
        )}
        {}
        {phase === "result" && (
          <div style={{ textAlign:"center" }}>
            {result === "wrong" && (
              <div style={{ fontSize:18, fontWeight:700, color:T.red, marginBottom:12,
                fontFamily:T.serif, letterSpacing:2,
                animation:"resultBadge 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
                display:"inline-block", padding:"4px 16px", borderRadius:8,
                background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)" }}>
                BUST! {hlStreak > 0 ? `Streak ended at ${hlStreak}` : "No streak"}
              </div>
            )}
            {result === "cashout" && (
              <div style={{ fontSize:18, fontWeight:700, color:T.green, marginBottom:12,
                fontFamily:T.serif, letterSpacing:2,
                animation:"resultBadge 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
                display:"inline-block", padding:"4px 16px", borderRadius:8,
                background:"rgba(34,197,94,0.1)", border:"1px solid rgba(34,197,94,0.3)",
                textShadow: winnings >= bet * 3 ? "0 0 10px rgba(34,197,94,0.3)" : "none" }}>
                CASHED OUT +${winnings - bet} (streak of {hlStreak})
              </div>
            )}
            <div style={{ display:"flex", gap:8, justifyContent:"center", flexWrap:"wrap" }}>
              <GoldButton onClick={newRound} small>Change Bet</GoldButton>
              {bet <= chips && bet >= 1 && (
                <GoldButton onClick={() => { newRound(); setTimeout(deal, 50); }}>Rebet ${bet} ♠</GoldButton>
              )}
            </div>
          </div>
        )}
        {}
        {history.length > 0 && (
          <div style={{ marginTop:20, display:"flex", gap:4, justifyContent:"center", flexWrap:"wrap" }}>
            {history.map((h, i) => {
              const isLatest = i === history.length - 1;
              return (
              <div key={`${h.card.rank}${h.card.suit}-${i}`} style={{ fontSize:11, padding:"3px 6px", borderRadius:4,
                fontFamily:T.mono, fontWeight:600,
                background: h.correct === null ? `${_themeAccent}1a` : h.correct ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                color: h.correct === null ? _themeAccent : h.correct ? "#22c55e" : "#ef4444",
                border: `1px solid ${h.correct === null ? `${_themeAccent}40` : h.correct ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
                animation: isLatest ? "multBounceIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards" : "none",
              }}>
                {h.card.rank}{h.card.suit}
              </div>
              );
            })}
          </div>
        )}
      </div>
      <div style={{ padding:"8px", fontSize:10, color:"#1a3a1a", letterSpacing:2, textTransform:"uppercase", zIndex:1 }}>
        Guess higher or lower · Ties lose · Cash out anytime
      </div>
    </GameShell>
  );
}
function DiceFace({ value, size = 64, color = "#f5f0e8", dotColor = "#1a1a2e", rolling = false }) {
  const dotPositions = {
    1: [[50,50]],
    2: [[28,28],[72,72]],
    3: [[28,28],[50,50],[72,72]],
    4: [[28,28],[72,28],[28,72],[72,72]],
    5: [[28,28],[72,28],[50,50],[28,72],[72,72]],
    6: [[28,28],[72,28],[28,50],[72,50],[28,72],[72,72]],
  };
  const dots = dotPositions[value] || [];
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={rolling ? { animation:"spin 0.3s linear infinite" } : {}}>
      <rect x="5" y="5" width="90" height="90" rx="16" fill={color} stroke="#c8b89a" strokeWidth="3"/>
      {dots.map(([cx,cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="9" fill={dotColor}/>
      ))}
    </svg>
  );
}
const DICE_BETS = [
  { id:"over7", label:"Over 7", desc:"Sum > 7", payout:2.33, check: (s) => s > 7 },
  { id:"under7", label:"Under 7", desc:"Sum < 7", payout:2.33, check: (s) => s < 7 },
  { id:"seven", label:"Lucky 7", desc:"Sum = 7", payout:5.8, check: (s) => s === 7 },
  { id:"doubles", label:"Doubles", desc:"Same number", payout:5.8, check: (s,a,b) => a === b },
  { id:"high", label:"High Roll", desc:"Sum ≥ 10", payout:5.8, check: (s) => s >= 10 },
  { id:"snake", label:"Snake Eyes", desc:"Double 1s", payout:35, check: (s,a,b) => a === 1 && b === 1 },
];
function DiceGame({ chips, setChips, onBack, onRebuy, startChips, lastBets = {}, setLastBet, winStreak = 0, vipPoints = 0, achCount = 0, reportLoss, applyWin = null, onBetPlaced = null, onRoundEnd, skipOverlays = false, skipEffects = false, theme = "dark", skinTheme, skinId = "house", activePowerUps = [] }) {
  const [bet, setBet] = useState(() => Math.min(lastBets?.dice || 25, chips));
  useEffect(() => { if (setLastBet) setLastBet("dice", bet); }, [bet, setLastBet]);
  const [selectedBet, setSelectedBet] = useState("over7");
  const [die1, setDie1] = useState(1);
  const [die2, setDie2] = useState(6);
  const [phase, setPhase] = useState("betting");
  const [resultMsg, setResultMsg] = useState("");
  const [won, setWon] = useState(false);
  const [winAmount, setWinAmount] = useState(0);
  const [history, setHistory] = useState([]);
  useEffect(() => { if (phase === "result" && onRoundEnd) onRoundEnd(); }, [phase, onRoundEnd]);
  const fx = useWinEffects();
  const { shaking, shake, shakeIntensity, floatWins, addFloatWin, flash, triggerFlash, lightMode, triggerLights,
    bigWin, setBigWin, dismissOverlay, dismissAll, celebrateWin, shellEffects, coinRainActive, triggerCoins, softCoinRain, washType, triggerWash,
    confetti, triggerConfetti, eruptionActive, triggerEruption } = fx;
  const roll = () => {
    if (chips < bet) return;
    setChips(c => c - bet);
    if (onBetPlaced) onBetPlaced(bet);
    setPhase("rolling");
    setResultMsg("");
    let rollCount = 0;
    const rollInterval = setInterval(() => {
      setDie1(Math.floor(Math.random() * 6) + 1);
      setDie2(Math.floor(Math.random() * 6) + 1);
      rollCount++;
      if (rollCount >= 12) {
        clearInterval(rollInterval);
        const d1 = Math.floor(Math.random() * 6) + 1;
        const d2 = Math.floor(Math.random() * 6) + 1;
        setDie1(d1);
        setDie2(d2);
        const sum = d1 + d2;
        const betInfo = DICE_BETS.find(b => b.id === selectedBet);
        const isWin = betInfo.check(sum, d1, d2);
        if (isWin) {
          const payout = Math.floor(bet * betInfo.payout);
          if (applyWin) applyWin(payout); else setChips(c => c + payout);
          setWon(true);
          setWinAmount(payout);
          setResultMsg(`${betInfo.label}! ${d1} + ${d2} = ${sum} — Won +$${payout - bet}`);
          triggerFlash();
          const profit = payout - bet;
          if (profit > 0) addFloatWin(profit, {x:50, y:30});
          if (betInfo.payout >= 5) { shake(); triggerLights("big"); setBigWin({type:betInfo.payout>=20?"mega":"big",amount:profit}); }
          else { triggerLights("win"); softCoinRain(winStreak); }
        } else {
          setWon(false);
          setWinAmount(0);
          setResultMsg(`${d1} + ${d2} = ${sum} — ${betInfo.label} loses`);
          triggerLights("loss");
          if (reportLoss) reportLoss(bet);
        }
        setHistory(h => [...h.slice(-19), { d1, d2, sum, won: isWin }]);
        setPhase("result");
      }
    }, 60);
  };
  const reset = () => {
    setBigWin(null);
    fx.clearLights();
    setBet(b => Math.min(b, chips > 0 ? chips : 25));
    setPhase("betting");
    setResultMsg("");
  };
  const bg = "linear-gradient(180deg, #2a1a2e 0%, #1a0d1f 50%, #140a1a 100%)";
  return (
    <GameShell bg={bg} title="Dice" chips={chips} onBack={onBack} {...shellEffects} startChips={startChips} winStreak={winStreak} vipPoints={vipPoints} achCount={achCount} skipOverlays={skipOverlays} skipEffects={skipEffects} onRebuy={onRebuy} theme={theme} skinTheme={skinTheme} skinId={skinId} activePowerUps={activePowerUps} rules={<>
        <p style={{marginTop:0}}>Choose a bet type, then roll two dice to see if you win.</p>
        <p><span style={{color:_themeAccent}}>Over 7:</span> Sum of both dice is greater than 7. Pays 2.33×.</p>
        <p><span style={{color:_themeAccent}}>Under 7:</span> Sum is less than 7. Pays 2.33×.</p>
        <p><span style={{color:_themeAccent}}>Lucky 7:</span> Sum is exactly 7. Pays 5.8×.</p>
        <p><span style={{color:_themeAccent}}>Doubles:</span> Both dice show the same number. Pays 5.8×.</p>
        <p><span style={{color:_themeAccent}}>High Roll:</span> Sum is 10 or higher. Pays 5.8×.</p>
        <p><span style={{color:_themeAccent}}>Snake Eyes:</span> Both dice show 1. Pays 35×.</p>
        <p><span style={{color:_themeAccent}}>Odds:</span> Two dice produce sums from 2–12. 7 is the most common (6 ways), while 2 and 12 are rarest (1 way each).</p>
        <p style={{color:T.muted, fontSize:11}}>House edge: ~3% average across bet types.</p>
      </>}>
      <FloatingWins wins={floatWins} />
      {bigWin && !skipOverlays && <BigWinOverlay type={bigWin.type} amount={bigWin.amount} onDone={dismissOverlay} />}
      <div style={{ padding:"12px", position:"relative", zIndex:1, maxWidth:540, margin:"0 auto" }}>
        <EdgeLights mode={lightMode} color="#ec4899" />
        {}
        <div style={{ display:"flex", justifyContent:"center", gap:16, marginBottom:6, padding:"6px 12px",
          background:"rgba(255,240,220,0.03)", borderRadius:8, border:`1px solid ${_themeAccent}14` }}>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:8, letterSpacing:2, color:T.dim, fontFamily:T.mono, textTransform:"uppercase" }}>Bet</div>
            <div style={{ fontSize:14, fontWeight:700, fontFamily:T.mono, color:_themeAccent }}>${bet}</div>
          </div>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:8, letterSpacing:2, color:T.dim, fontFamily:T.mono, textTransform:"uppercase" }}>Type</div>
            <div style={{ fontSize:12, fontWeight:700, fontFamily:T.mono, color:"#ec4899" }}>{DICE_BETS.find(b=>b.id===selectedBet)?.label || "—"}</div>
          </div>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:8, letterSpacing:2, color:T.dim, fontFamily:T.mono, textTransform:"uppercase" }}>Payout</div>
            <div style={{ fontSize:14, fontWeight:700, fontFamily:T.mono, color:T.textMuted }}>{DICE_BETS.find(b=>b.id===selectedBet)?.payout || 0}×</div>
          </div>
          {history.length > 0 && <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:8, letterSpacing:2, color:T.dim, fontFamily:T.mono, textTransform:"uppercase" }}>Last</div>
            <div style={{ fontSize:14, fontWeight:700, fontFamily:T.mono, color: history[history.length-1]?.won ? "#22c55e" : "#e74c3c" }}>{history[history.length-1]?.sum || "—"}</div>
          </div>}
        </div>
        {}
        <div style={{ display:"flex", justifyContent:"center", gap:20, marginBottom:8, padding:"16px 0" }}>
          <div style={{ animation: phase === "rolling" ? "diceRoll 0.6s ease-out infinite" : phase === "result" ? "diceSlam 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)" : undefined,
            transition:"transform 0.3s",
            ...(phase === "result" && won ? { filter:"drop-shadow(0 0 8px rgba(34,197,94,0.4))" } : {}),
          }}>
            <DiceFace value={die1} size={88} rolling={phase === "rolling"} />
          </div>
          <div style={{ animation: phase === "rolling" ? "diceRoll 0.6s ease-out infinite 0.15s" : phase === "result" ? "diceSlam 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) 0.08s both" : undefined,
            transition:"transform 0.3s",
            ...(phase === "result" && won ? { filter:"drop-shadow(0 0 8px rgba(34,197,94,0.4))" } : {}),
          }}>
            <DiceFace value={die2} size={88} rolling={phase === "rolling"} />
          </div>
        </div>
        {(phase === "result" || phase === "betting") && (
          <div style={{ textAlign:"center", fontSize:13, fontFamily:T.mono,
            color:T.muted, marginBottom:12, letterSpacing:1,
            animation: phase === "result" ? "diceSumReveal 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards" : "none" }}>
            Sum: <span style={{ color: phase === "result" && won ? "#22c55e" : _themeAccent, fontWeight:700, fontSize: phase === "result" ? 18 : 16,
              textShadow: phase === "result" && won ? "0 0 10px rgba(34,197,94,0.3)" : "none",
              transition:"font-size 0.3s" }}>{die1 + die2}</span>
          </div>
        )}
        {}
        {resultMsg && (
          <div style={{ textAlign:"center", marginBottom:14 }}>
            <div style={{ fontSize:15, fontWeight:700, letterSpacing:2,
              fontFamily:T.serif, display:"inline-block",
              padding:"4px 16px", borderRadius:8,
              color: won ? "#22c55e" : "#ef4444",
              background: won ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
              border: won ? "1px solid rgba(34,197,94,0.25)" : "1px solid rgba(239,68,68,0.2)",
              textShadow: won && winAmount >= bet * 5 ? "0 0 10px rgba(34,197,94,0.3)" : "none",
              animation:"resultBadge 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards" }}>
              {resultMsg}
            </div>
          </div>
        )}
        {}
        {phase === "betting" && (
          <>
            <div style={{ fontSize:9, letterSpacing:2, color:T.dim, fontFamily:T.mono,
              textTransform:"uppercase", textAlign:"center", marginBottom:8 }}>Choose your bet</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:6, marginBottom:14 }}>
              {DICE_BETS.map(b => {
                const isSel = selectedBet === b.id;
                return (
                <button key={b.id} onClick={() => setSelectedBet(b.id)} style={{
                  padding:"10px 6px", textAlign:"center", cursor:"pointer",
                  background: isSel ? "rgba(236,72,153,0.15)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${isSel ? "#ec4899" : "rgba(255,255,255,0.1)"}`,
                  borderRadius:8, transition:"all 0.2s",
                  animation: isSel ? "diceBetPick 0.25s ease-out" : "none",
                  boxShadow: isSel ? "0 0 12px rgba(236,72,153,0.15)" : "none",
                }}>
                  <div style={{ fontSize:12, fontWeight:700, color: isSel ? "#ec4899" : "#e8e0d0",
                    fontFamily:T.serif, letterSpacing:1 }}>{b.label}</div>
                  <div style={{ fontSize:9, color:"#6a6050", fontFamily:T.mono, marginTop:2 }}>{b.desc}</div>
                  <div style={{ fontSize:10, color:_themeAccent, fontFamily:T.mono, marginTop:3, fontWeight:600 }}>{b.payout}×</div>
                </button>
                );
              })}
            </div>
            <BetControls bet={bet} setBet={setBet} chips={chips} presets={[5,10,25,50,100]} />
            <div style={{ textAlign:"center", marginTop:8 }}>
              <GoldButton onClick={roll} disabled={chips < bet || bet <= 0} hint="⏎ roll">Roll Dice</GoldButton>
            </div>
          </>
        )}
        {phase === "rolling" && (
          <div style={{ textAlign:"center", fontSize:14, color:_themeAccent, letterSpacing:3, fontFamily:T.mono }}>
            Rolling...
          </div>
        )}
        {phase === "result" && (
          <div style={{ display:"flex", gap:8, justifyContent:"center", flexWrap:"wrap", marginTop:8 }}>
            <GoldButton onClick={reset} small>Change Bet</GoldButton>
            {bet <= chips && bet >= 1 && (
              <GoldButton onClick={() => { reset(); setTimeout(roll, 50); }}>Rebet ${bet} </GoldButton>
            )}
          </div>
        )}
        {}
        {history.length > 0 && (
          <div style={{ marginTop:16, display:"flex", gap:4, justifyContent:"center", flexWrap:"wrap" }}>
            {history.map((h, i) => {
              const isLatest = i === history.length - 1;
              return (
              <div key={`${h.d1}${h.d2}-${i}`} style={{ fontSize:10, padding:"3px 6px", borderRadius:4,
                fontFamily:T.mono, fontWeight:600,
                background: h.won ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.05)",
                color: h.won ? "#22c55e" : "#6a6050",
                border: `1px solid ${h.won ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.08)"}`,
                animation: isLatest ? "multBounceIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards" : "none",
                boxShadow: isLatest && h.won ? "0 0 6px rgba(34,197,94,0.25)" : "none",
              }}>
                {h.sum}
              </div>
              );
            })}
          </div>
        )}
      </div>
      <div style={{ padding:"8px", fontSize:10, color:"#2a1a2e", letterSpacing:2, textTransform:"uppercase", zIndex:1 }}>
        Pick a bet · Roll the dice · 3.5% house edge
      </div>
    </GameShell>
  );
}
function CrapsGame({ chips, setChips, onBack, onRebuy, startChips, lastBets = {}, setLastBet, winStreak = 0, vipPoints = 0, achCount = 0, reportLoss, applyWin = null, onBetPlaced = null, onRoundEnd, skipOverlays = false, skipEffects = false, theme = "dark", skinTheme, skinId = "house", activePowerUps = [] }) {
  const [bet, setBet] = useState(() => Math.min(lastBets?.craps || 25, chips));
  useEffect(() => { if (setLastBet) setLastBet("craps", bet); }, [bet, setLastBet]);
  const [betType, setBetType] = useState("pass");
  const [comeBets, setComeBets] = useState([]);
  const [die1, setDie1] = useState(3);
  const [die2, setDie2] = useState(4);
  const [phase, setPhase] = useState("betting");
  const [point, setPoint] = useState(null);
  const [rollNum, setRollNum] = useState(0);
  const [resultMsg, setResultMsg] = useState("");
  useEffect(() => { if (phase === "result" && onRoundEnd) onRoundEnd(); }, [phase, onRoundEnd]);
  const [won, setWon] = useState(false);
  const [history, setHistory] = useState([]);
  const fx = useWinEffects();
  const { shaking, shake, shakeIntensity, floatWins, addFloatWin, flash, triggerFlash, lightMode, triggerLights,
    bigWin, setBigWin, dismissOverlay, dismissAll, celebrateWin, shellEffects, coinRainActive, triggerCoins, softCoinRain, washType, triggerWash,
    confetti, triggerConfetti, eruptionActive, triggerEruption } = fx;
  const processCome = (sum) => {
    let payout = 0;
    const remaining = [];
    for (const cb of comeBets) {
      if (cb.point === null) {
        if (cb.type === "come") {
          if (sum === 7 || sum === 11) { payout += cb.amount * 2; }
          else if (sum === 2 || sum === 3 || sum === 12) {  }
          else { remaining.push({...cb, point: sum}); }
        } else {
          if (sum === 7 || sum === 11) {  }
          else if (sum === 2 || sum === 3) { payout += cb.amount * 2; }
          else if (sum === 12) { payout += cb.amount;  }
          else { remaining.push({...cb, point: sum}); }
        }
      } else {
        if (cb.type === "come") {
          if (sum === cb.point) { payout += cb.amount * 2; }
          else if (sum === 7) {  }
          else { remaining.push(cb); }
        } else {
          if (sum === 7) { payout += cb.amount * 2; }
          else if (sum === cb.point) {  }
          else { remaining.push(cb); }
        }
      }
    }
    if (payout > 0) setChips(c => c + payout);
    setComeBets(remaining);
    return payout;
  };
  const animateRoll = (callback) => {
    let count = 0;
    const interval = setInterval(() => {
      setDie1(Math.floor(Math.random() * 6) + 1);
      setDie2(Math.floor(Math.random() * 6) + 1);
      count++;
      if (count >= 10) {
        clearInterval(interval);
        const d1 = Math.floor(Math.random() * 6) + 1;
        const d2 = Math.floor(Math.random() * 6) + 1;
        setDie1(d1);
        setDie2(d2);
        setTimeout(() => callback(d1, d2), 300);
      }
    }, 60);
  };
  const comeOutRoll = () => {
    if (chips < bet) return;
    setChips(c => c - bet);
    if (onBetPlaced) onBetPlaced(bet);
    setPhase("rolling");
    setResultMsg("");
    setRollNum(1);
    animateRoll((d1, d2) => {
      const sum = d1 + d2;
      if (betType === "pass") {
        if (sum === 7 || sum === 11) {
          const payout = bet * 2;
          if (applyWin) applyWin(payout); else setChips(c => c + payout);
          setWon(true);
          setResultMsg(`Natural ${sum}! Pass line wins!`);
          triggerFlash(); triggerLights("win"); softCoinRain(winStreak);
          addFloatWin(bet, {x:50, y:30});
          setHistory(h => [...h.slice(-14), { sum, type:"comeout", result:"win" }]);
          setPhase("result");
        } else if (sum === 2 || sum === 3 || sum === 12) {
          setWon(false);
          setResultMsg(`Craps ${sum}! Pass line loses.`);
          triggerLights("loss"); if (reportLoss) reportLoss(bet);
          setHistory(h => [...h.slice(-14), { sum, type:"comeout", result:"loss" }]);
          setPhase("result");
        } else {
          setPoint(sum);
          setResultMsg(`Point is ${sum}. Roll it again before a 7!`);
          triggerLights("win");
          setHistory(h => [...h.slice(-14), { sum, type:"comeout", result:"point" }]);
          setPhase("point");
        }
      } else {
        if (sum === 7 || sum === 11) {
          setWon(false);
          setResultMsg(`Natural ${sum}! Don't Pass loses.`);
          triggerLights("loss"); if (reportLoss) reportLoss(bet);
          setHistory(h => [...h.slice(-14), { sum, type:"comeout", result:"loss" }]);
          setPhase("result");
        } else if (sum === 2 || sum === 3) {
          const payout = bet * 2;
          if (applyWin) applyWin(payout); else setChips(c => c + payout);
          setWon(true);
          setResultMsg(`Craps ${sum}! Don't Pass wins!`);
          triggerFlash(); triggerLights("win"); softCoinRain(winStreak);
          addFloatWin(bet, {x:50, y:30});
          setHistory(h => [...h.slice(-14), { sum, type:"comeout", result:"win" }]);
          setPhase("result");
        } else if (sum === 12) {
          setChips(c => c + bet);
          setWon(false);
          setResultMsg(`12 — Push. Bet returned.`);
          triggerLights("push");
          setHistory(h => [...h.slice(-14), { sum, type:"comeout", result:"push" }]);
          setPhase("result");
        } else {
          setPoint(sum);
          setResultMsg(`Point is ${sum}. Hope for a 7 before ${sum}!`);
          triggerLights("win");
          setHistory(h => [...h.slice(-14), { sum, type:"comeout", result:"point" }]);
          setPhase("point");
        }
      }
    });
  };
  const pointRoll = () => {
    setPhase("pointRolling");
    setRollNum(r => r + 1);
    animateRoll((d1, d2) => {
      const sum = d1 + d2;
      const comePay = processCome(sum);
      const comeMsg = comePay > 0 ? ` Come bets: +$${comePay}` : "";
      if (betType === "pass") {
        if (sum === point) {
          const payout = bet * 2;
          if (applyWin) applyWin(payout); else setChips(c => c + payout);
          setWon(true);
          setResultMsg(`${sum}! Hit the point — Pass line wins!${comeMsg}`);
          triggerFlash(); triggerLights("win"); shake(200, "light"); softCoinRain(winStreak);
          addFloatWin(bet, {x:50, y:30});
          setHistory(h => [...h.slice(-14), { sum, type:"point", result:"win" }]);
          setPhase("result");
        } else if (sum === 7) {
          setWon(false);
          setResultMsg(`Seven out! Pass line loses.${comeMsg}`);
          triggerLights("loss"); if (reportLoss) reportLoss(bet);
          setHistory(h => [...h.slice(-14), { sum, type:"point", result:"loss" }]);
          setPhase("result");
        } else {
          setResultMsg(`Rolled ${sum}. Need ${point} to win, 7 loses.${comeMsg}`);
          setHistory(h => [...h.slice(-14), { sum, type:"point", result:"roll" }]);
          setPhase("point");
        }
      } else {
        if (sum === 7) {
          const payout = bet * 2;
          if (applyWin) applyWin(payout); else setChips(c => c + payout);
          setWon(true);
          setResultMsg(`Seven! Don't Pass wins!${comeMsg}`);
          triggerFlash(); triggerLights("win"); shake(200, "light"); softCoinRain(winStreak);
          addFloatWin(bet, {x:50, y:30});
          setHistory(h => [...h.slice(-14), { sum, type:"point", result:"win" }]);
          setPhase("result");
        } else if (sum === point) {
          setWon(false);
          setResultMsg(`${sum} — Point hit. Don't Pass loses.${comeMsg}`);
          triggerLights("loss"); if (reportLoss) reportLoss(bet);
          setHistory(h => [...h.slice(-14), { sum, type:"point", result:"loss" }]);
          setPhase("result");
        } else {
          setResultMsg(`Rolled ${sum}. Need 7 to win, ${point} loses.${comeMsg}`);
          setHistory(h => [...h.slice(-14), { sum, type:"point", result:"roll" }]);
          setPhase("point");
        }
      }
    });
  };
  const reset = () => {
    setBigWin(null);
    fx.clearLights();
    if (comeBets.length > 0) {
      const refund = comeBets.reduce((sum, cb) => sum + cb.amount, 0);
      if (refund > 0) setChips(c => c + refund);
    }
    setBet(b => Math.min(b, chips > 0 ? chips : 25));
    setPhase("betting");
    setPoint(null);
    setRollNum(0);
    setResultMsg("");
    setWon(false);
    setComeBets([]);
  };
  const bg = "linear-gradient(180deg, #0d2818 0%, #0a1f12 50%, #061a0d 100%)";
  return (
    <GameShell bg={bg} title="Craps" chips={chips} onBack={onBack} {...shellEffects} startChips={startChips} winStreak={winStreak} vipPoints={vipPoints} achCount={achCount} skipOverlays={skipOverlays} skipEffects={skipEffects} onRebuy={onRebuy} theme={theme} skinTheme={skinTheme} skinId={skinId} activePowerUps={activePowerUps} rules={<>
        <p style={{marginTop:0}}>The classic dice game. Bet on the Pass Line or Don't Pass, then roll.</p>
        <p><span style={{color:_themeAccent}}>Come-Out Roll:</span> The first roll of a new round determines what happens next.</p>
        <p><span style={{color:_themeAccent}}>Pass Line:</span> Win on 7 or 11 (natural). Lose on 2, 3, or 12 (craps). Any other number sets the "point."</p>
        <p><span style={{color:_themeAccent}}>Don't Pass:</span> The opposite — win on 2 or 3, lose on 7 or 11. 12 is a push (bet returned). Then root against the point.</p>
        <p><span style={{color:_themeAccent}}>The Point:</span> Once a point is set (4, 5, 6, 8, 9, or 10), keep rolling. Pass wins if the point is hit before a 7. Don't Pass wins if 7 comes first.</p>
        <p><span style={{color:_themeAccent}}>Payouts:</span> Even money (1:1) on all bets. The low house edge makes this one of the best bets in the casino.</p>
        <p><span style={{color:_themeAccent}}>Come / Don&apos;t Come:</span> Available during the Point phase. Works like Pass/Don&apos;t Pass but establishes its own point. Multiple Come bets can be active at once.</p>
        <p style={{color:T.muted, fontSize:11}}>House edge: 1.41% (Pass) / 1.36% (Don&apos;t Pass).</p>
      </>}>
      <FloatingWins wins={floatWins} />
      {bigWin && !skipOverlays && <BigWinOverlay type={bigWin.type} amount={bigWin.amount} onDone={dismissOverlay} />}
      <div style={{ padding:"12px", position:"relative", zIndex:1, maxWidth:500, margin:"0 auto" }}>
        <EdgeLights mode={lightMode} color="#16a34a" />
        {}
        <div style={{ background:"linear-gradient(180deg, #1a6b35, #145a2c)", borderRadius:12,
          border: point ? "2px solid #f1c40f" : `2px solid ${_themeAccent}`, padding:"16px", marginBottom:16, position:"relative",
          transition:"border-color 0.4s, box-shadow 0.4s",
          animation: point ? "crapsFeltGlow 2s ease-in-out infinite" : "none",
          boxShadow: point ? "0 0 15px rgba(241,196,15,0.1)" : "none" }}>
          {}
          {point && (
            <div style={{ position:"absolute", top:8, right:12, background:"#fff", borderRadius:"50%",
              width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center",
              fontWeight:900, fontSize:16, color:"#1a1a2e", fontFamily:T.mono,
              border:"3px solid #1a1a2e",
              animation:"crapsPointPulse 1.5s ease-in-out infinite" }}>
              {point}
            </div>
          )}
          {}
          <div style={{ display:"flex", justifyContent:"center", gap:12, marginBottom:12 }}>
            <div style={{ padding:"4px 16px", borderRadius:4, fontSize:11, fontWeight:700,
              fontFamily:T.serif, letterSpacing:2, textTransform:"uppercase",
              background: betType === "pass" ? "rgba(255,255,255,0.15)" : "transparent",
              color: betType === "pass" ? "#fff" : "rgba(255,255,255,0.4)",
              border:"1px solid rgba(255,255,255,0.2)" }}>
              Pass Line
            </div>
            <div style={{ padding:"4px 16px", borderRadius:4, fontSize:11, fontWeight:700,
              fontFamily:T.serif, letterSpacing:2, textTransform:"uppercase",
              background: betType === "dontpass" ? "rgba(255,255,255,0.15)" : "transparent",
              color: betType === "dontpass" ? "#fff" : "rgba(255,255,255,0.4)",
              border:"1px solid rgba(255,255,255,0.2)" }}>
              Don't Pass
            </div>
          </div>
          {}
          <div style={{ display:"flex", justifyContent:"center", gap:16, margin:"12px 0" }}>
            <div style={{ animation: (phase === "rolling" || phase === "pointRolling") ? "diceRoll 0.6s ease-out infinite"
              : (phase === "result" || phase === "point") ? "diceSlam 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)" : undefined,
              transition:"transform 0.3s",
              ...(phase === "result" && won ? { filter:"drop-shadow(0 0 6px rgba(34,197,94,0.4))" } : {}),
            }}>
              <DiceFace value={die1} size={52} rolling={phase === "rolling" || phase === "pointRolling"} />
            </div>
            <div style={{ animation: (phase === "rolling" || phase === "pointRolling") ? "diceRoll 0.6s ease-out infinite 0.15s"
              : (phase === "result" || phase === "point") ? "diceSlam 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) 0.08s both" : undefined,
              transition:"transform 0.3s",
              ...(phase === "result" && won ? { filter:"drop-shadow(0 0 6px rgba(34,197,94,0.4))" } : {}),
            }}>
              <DiceFace value={die2} size={52} rolling={phase === "rolling" || phase === "pointRolling"} />
            </div>
          </div>
          {}
          <div style={{ textAlign:"center", fontSize:13, fontFamily:T.mono,
            color:"rgba(255,255,255,0.7)", marginBottom:4 }}>
            {(phase !== "rolling" && phase !== "pointRolling") && (
              <span style={{ animation: (phase === "result" || phase === "point") ? "diceSumReveal 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards" : "none" }}>
                Sum: <span style={{ color: phase === "result" && won ? "#22c55e" : "#fff", fontWeight:700, fontSize:18,
                  textShadow: phase === "result" && won ? "0 0 8px rgba(34,197,94,0.3)" : "none" }}>{die1 + die2}</span>
              {rollNum > 0 && <span style={{ color:"rgba(255,255,255,0.4)", marginLeft:8 }}>Roll #{rollNum}</span>}</span>
            )}
          </div>
        </div>
        {}
        {resultMsg && (
          <div style={{ textAlign:"center", marginBottom:14 }}>
            <div style={{ fontSize:14, fontWeight:700, letterSpacing:1, display:"inline-block",
              fontFamily:T.serif, padding:"4px 14px", borderRadius:8,
              color: won ? "#22c55e" : phase === "point" ? _themeAccent : "#ef4444",
              background: won ? "rgba(34,197,94,0.08)" : phase === "point" ? `${_themeAccent}14` : "rgba(239,68,68,0.08)",
              border: won ? "1px solid rgba(34,197,94,0.25)" : phase === "point" ? `1px solid ${_themeAccent}33` : "1px solid rgba(239,68,68,0.2)",
              animation: (phase === "result" || resultMsg.includes("Natural") || resultMsg.includes("Craps")) ? "crapsNatural 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards" : "fadeIn 0.3s ease" }}>
              {resultMsg}
            </div>
          </div>
        )}
        {}
        {phase === "betting" && (
          <>
            {}
            <div style={{ display:"flex", gap:6, justifyContent:"center", marginBottom:12, flexWrap:"wrap" }}>
              <button onClick={() => setBetType("pass")} style={{
                padding:"8px 14px", fontSize:12, fontWeight:700,
                fontFamily:T.serif, letterSpacing:1,
                background: betType === "pass" ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.05)",
                border: `1px solid ${betType === "pass" ? "#22c55e" : "rgba(255,255,255,0.1)"}`,
                borderRadius:8, color: betType === "pass" ? "#22c55e" : "#8a8070", cursor:"pointer",
                minWidth:0, flex:"1 1 auto", maxWidth:160,
              }}>
                Pass Line
                <div style={{ fontSize:8, color:"#6a6050", fontFamily:T.mono, marginTop:2 }}>1.41% edge</div>
              </button>
              <button onClick={() => setBetType("dontpass")} style={{
                padding:"8px 14px", fontSize:12, fontWeight:700,
                fontFamily:T.serif, letterSpacing:1,
                background: betType === "dontpass" ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.05)",
                border: `1px solid ${betType === "dontpass" ? "#ef4444" : "rgba(255,255,255,0.1)"}`,
                borderRadius:8, color: betType === "dontpass" ? "#ef4444" : "#8a8070", cursor:"pointer",
                minWidth:0, flex:"1 1 auto", maxWidth:160,
              }}>
                Don't Pass
                <div style={{ fontSize:8, color:"#6a6050", fontFamily:T.mono, marginTop:2 }}>1.36% edge</div>
              </button>
            </div>
            {}
            <BetControls bet={bet} setBet={setBet} chips={chips} presets={[5,10,25,50,100]} />
            <div style={{ textAlign:"center", marginTop:8 }}>
              <GoldButton onClick={comeOutRoll} disabled={chips < bet || bet <= 0} hint="⏎ roll">Come-Out Roll</GoldButton>
            </div>
          </>
        )}
        {}
        {(phase === "rolling" || phase === "pointRolling") && (
          <div style={{ textAlign:"center", fontSize:14, color:_themeAccent, letterSpacing:3, fontFamily:T.mono }}>
            Rolling...
          </div>
        )}
        {}
        {phase === "point" && (
          <div style={{ textAlign:"center" }}>
            {comeBets.length > 0 && (
              <div style={{ marginBottom:10, fontSize:10, fontFamily:T.mono, color:T.muted }}>
                Come bets: {comeBets.map((cb, i) => (
                  <span key={i} style={{ color: cb.type==="come" ? "#22c55e" : "#ef4444", marginLeft:4 }}>
                    {cb.type==="come"?"C":"DC"}{cb.point ? `(${cb.point})` : ""} ${cb.amount}
                  </span>
                ))}
              </div>
            )}
            <div style={{ display:"flex", gap:6, justifyContent:"center", marginBottom:10, flexWrap:"wrap" }}>
              <button onClick={() => { if(chips>=bet){setChips(c=>c-bet);setComeBets(cb=>[...cb,{point:null,amount:bet,type:"come"}]);} }}
                disabled={chips<bet}
                style={{ padding:"6px 12px", fontSize:10, fontWeight:600, fontFamily:T.serif,
                  background:"rgba(34,197,94,0.15)", border:"1px solid rgba(34,197,94,0.4)", borderRadius:6,
                  color: chips>=bet ? "#22c55e" : "#555", cursor: chips>=bet ? "pointer" : "not-allowed", letterSpacing:1,
                  flex:"1 1 auto", minWidth:0, maxWidth:140 }}>
                Come ${bet}
              </button>
              <button onClick={() => { if(chips>=bet){setChips(c=>c-bet);setComeBets(cb=>[...cb,{point:null,amount:bet,type:"dontcome"}]);} }}
                disabled={chips<bet}
                style={{ padding:"6px 12px", fontSize:10, fontWeight:600, fontFamily:T.serif,
                  background:"rgba(239,68,68,0.15)", border:"1px solid rgba(239,68,68,0.4)", borderRadius:6,
                  color: chips>=bet ? "#ef4444" : "#555", cursor: chips>=bet ? "pointer" : "not-allowed", letterSpacing:1,
                  flex:"1 1 auto", minWidth:0, maxWidth:140 }}>
                Don&apos;t Come ${bet}
              </button>
            </div>
            <GoldButton onClick={pointRoll} hint="⏎ roll">Roll Again</GoldButton>
          </div>
        )}
        {}
        {phase === "result" && (
          <div style={{ display:"flex", gap:8, justifyContent:"center", flexWrap:"wrap" }}>
            <GoldButton onClick={reset} small>Change Bet</GoldButton>
            {bet <= chips && bet >= 1 && (
              <GoldButton onClick={() => { reset(); setTimeout(comeOutRoll, 50); }}>Rebet ${bet} </GoldButton>
            )}
          </div>
        )}
        {}
        {history.length > 0 && (
          <div style={{ marginTop:16, display:"flex", gap:4, justifyContent:"center", flexWrap:"wrap" }}>
            {history.map((h, i) => {
              const isLatest = i === history.length - 1;
              return (
              <div key={`${h.sum}-${h.result}-${i}`} style={{ fontSize:10, padding:"3px 6px", borderRadius:4,
                fontFamily:T.mono, fontWeight:600,
                background: h.result === "win" ? "rgba(34,197,94,0.15)" : h.result === "loss" ? "rgba(239,68,68,0.15)"
                  : h.result === "point" ? `${_themeAccent}26` : "rgba(255,255,255,0.05)",
                color: h.result === "win" ? "#22c55e" : h.result === "loss" ? "#ef4444"
                  : h.result === "point" ? _themeAccent : "#6a6050",
                border: `1px solid ${h.result === "win" ? "rgba(34,197,94,0.3)" : h.result === "loss" ? "rgba(239,68,68,0.3)"
                  : h.result === "point" ? `${_themeAccent}4d` : "rgba(255,255,255,0.08)"}`,
                animation: isLatest ? "multBounceIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards" : "none",
              }}>
                {h.sum}
              </div>
              );
            })}
          </div>
        )}
      </div>
      <div style={{ padding:"8px", fontSize:10, color:"#0d2818", letterSpacing:2, textTransform:"uppercase", zIndex:1 }}>
        Pass line or don't pass · 1.4% house edge
      </div>
    </GameShell>
  );
}
const KENO_PAYOUTS = {
  1: { 1: 3.2 },
  2: { 1: 1.5, 2: 4.5 },
  3: { 2: 4, 3: 20 },
  4: { 2: 2, 3: 7, 4: 40 },
  5: { 2: 1.5, 3: 3, 4: 12, 5: 70 },
  6: { 3: 3.5, 4: 10, 5: 40, 6: 250 },
  7: { 3: 2.5, 4: 5, 5: 18, 6: 80, 7: 500 },
  8: { 4: 5, 5: 18, 6: 100, 7: 500, 8: 3000 },
  9: { 4: 3, 5: 10, 6: 40, 7: 180, 8: 1000, 9: 6000 },
  10: { 4: 2, 5: 6, 6: 22, 7: 90, 8: 450, 9: 2500, 10: 15000 },
};
function KenoGame({ chips, setChips, onBack, onRebuy, startChips, lastBets = {}, setLastBet, winStreak = 0, vipPoints = 0, achCount = 0, reportLoss, applyWin = null, onBetPlaced = null, onRoundEnd, skipOverlays = false, skipEffects = false, theme = "dark", skinTheme, skinId = "house", activePowerUps = [] }) {
  const GRID_SIZE = 40;
  const MAX_PICKS = 10;
  const DRAW_COUNT = 10;
  const [bet, setBet] = useState(() => Math.min(lastBets?.keno || 5, chips));
  useEffect(() => { if (setLastBet) setLastBet("keno", bet); }, [bet, setLastBet]);
  const [picks, setPicks] = useState([]);
  const [drawn, setDrawn] = useState([]);
  const [phase, setPhase] = useState("picking");
  const [drawIndex, setDrawIndex] = useState(0);
  const [matches, setMatches] = useState(0);
  useEffect(() => { if (phase === "result" && onRoundEnd) onRoundEnd(); }, [phase, onRoundEnd]);
  const [payout, setPayout] = useState(0);
  const [showOverlay, setShowOverlay] = useState(false);
  const [nearMiss, setNearMiss] = useState(null);
  const fx = useWinEffects();
  const { shaking, shake, shakeIntensity, floatWins, addFloatWin, flash, triggerFlash, lightMode, triggerLights,
    bigWin, setBigWin, dismissOverlay, dismissAll, celebrateWin, shellEffects, coinRainActive, triggerCoins, softCoinRain, washType, triggerWash,
    confetti, triggerConfetti, eruptionActive, triggerEruption } = fx;
  const togglePick = (num) => {
    if (phase !== "picking") return;
    if (picks.includes(num)) {
      setPicks(p => p.filter(n => n !== num));
    } else if (picks.length < MAX_PICKS) {
      setPicks(p => [...p, num]);
    }
  };
  const quickPick = (count) => {
    const nums = [];
    while (nums.length < count) {
      const n = Math.floor(Math.random() * GRID_SIZE) + 1;
      if (!nums.includes(n)) nums.push(n);
    }
    setPicks(nums.sort((a,b) => a - b));
  };
  const startDraw = () => {
    if (picks.length === 0 || chips < bet) return;
    setChips(c => c - bet);
    if (onBetPlaced) onBetPlaced(bet);
    setPhase("drawing");
    setDrawIndex(0);
    setMatches(0);
    const drawNums = [];
    while (drawNums.length < DRAW_COUNT) {
      const n = Math.floor(Math.random() * GRID_SIZE) + 1;
      if (!drawNums.includes(n)) drawNums.push(n);
    }
    let idx = 0;
    let matchCount = 0;
    const interval = setInterval(() => {
      const num = drawNums[idx];
      setDrawn(d => [...d, num]);
      setDrawIndex(idx + 1);
      if (picks.includes(num)) {
        matchCount++;
        setMatches(matchCount);
      }
      idx++;
      if (idx >= DRAW_COUNT) {
        clearInterval(interval);
        const payTable = KENO_PAYOUTS[picks.length];
        const mult = payTable && payTable[matchCount] ? payTable[matchCount] : 0;
        const winAmount = Math.floor(bet * mult);
        setPayout(winAmount);
        if (winAmount > 0) {
          if (applyWin) applyWin(winAmount); else setChips(c => c + winAmount);
          const profit = winAmount - bet;
          if (profit > 0) addFloatWin(profit, {x:50, y:30});
          triggerFlash();
          if (mult >= 500) { shake(800, "epic"); triggerLights("mega", 4000); setBigWin({type:"epic", amount:winAmount - bet}); setShowOverlay(true); }
          else if (mult >= 50) { shake(600, "heavy"); triggerLights("mega", 3000); setBigWin({type:"mega", amount:winAmount - bet}); setShowOverlay(true); }
          else if (mult >= 10) { shake(400, "normal"); triggerLights("big", 2500); setBigWin({type:"big", amount:winAmount - bet}); }
          else if (mult >= 3) { shake(200, "light"); triggerLights("win", 1500); softCoinRain(winStreak); }
          else { triggerLights("win"); softCoinRain(winStreak); }
          const nextMult = payTable && payTable[matchCount + 1] ? payTable[matchCount + 1] : 0;
          if (nextMult > mult * 3) {
            setNearMiss(`One more hit for ${nextMult}× payout!`);
          } else setNearMiss(null);
        } else {
          triggerLights("loss"); if (reportLoss) reportLoss(bet);
          const nextMult = payTable && payTable[matchCount + 1] ? payTable[matchCount + 1] : 0;
          if (nextMult > 0) {
            setNearMiss(`So close! One more hit for ${nextMult}× payout`);
          } else setNearMiss(null);
        }
        setTimeout(() => setPhase("result"), 400);
      }
    }, 200);
  };
  const reset = (keepPicks = false) => {
    fx.clearLights();
    setDrawn([]);
    setDrawIndex(0);
    setMatches(0);
    setPayout(0);
    setBet(b => Math.min(b, chips > 0 ? chips : 5));
    if (!keepPicks) setPicks([]);
    setPhase("picking");
  };
  const clearPicks = () => { if (phase === "picking") setPicks([]); };
  const bg = "linear-gradient(180deg, #1a1a3e 0%, #12122e 50%, #0a0a20 100%)";
  const payTable = KENO_PAYOUTS[picks.length] || {};
  return (
    <GameShell bg={bg} title="Keno" chips={chips} onBack={onBack} {...shellEffects} startChips={startChips} winStreak={winStreak} vipPoints={vipPoints} achCount={achCount} skipOverlays={skipOverlays} skipEffects={skipEffects} onRebuy={onRebuy} theme={theme} skinTheme={skinTheme} skinId={skinId} activePowerUps={activePowerUps} nearMiss={nearMiss} rules={<>
        <p style={{marginTop:0}}>Pick numbers and hope they match the random draw!</p>
        <p><span style={{color:_themeAccent}}>Pick Numbers:</span> Select 1 to 10 numbers from a grid of 40. Use Quick Pick buttons for random selections.</p>
        <p><span style={{color:_themeAccent}}>The Draw:</span> 10 numbers are drawn randomly, one at a time. Matching numbers are "hits."</p>
        <p><span style={{color:_themeAccent}}>Payouts:</span> Depend on how many numbers you picked and how many you hit. More picks = harder to hit all, but higher maximum payout.</p>
        <p><span style={{color:_themeAccent}}>Example Payouts:</span> 1 pick/1 hit = 3.5×. 5 picks/5 hits = 200×. 10 picks/10 hits = 10,000×.</p>
        <p><span style={{color:_themeAccent}}>Strategy:</span> Fewer picks give better odds of hitting but lower max payouts. More picks are lottery-style — unlikely but huge. The payout table updates based on your pick count.</p>
        <p style={{color:T.muted, fontSize:11}}>RTP: ~92%. High volatility with more picks.</p>
      </>}>
      <FloatingWins wins={floatWins} />
      {showOverlay && !skipOverlays && payout > 0 && phase === "result" && payout >= bet * 50 && (
        <BigWinOverlay type={payout >= bet * 200 ? "mega" : "big"} amount={payout - bet} onDone={() => { setShowOverlay(false); dismissAll(); }} />
      )}
      <div style={{ padding:"12px", position:"relative", zIndex:1, maxWidth:560, margin:"0 auto" }}>
        <EdgeLights mode={lightMode} color="#8b5cf6" />
        {}
        <div style={{ display:"flex", justifyContent:"center", gap:16, marginBottom:6, padding:"6px 12px",
          background:"rgba(255,240,220,0.03)", borderRadius:8, border:`1px solid ${_themeAccent}14` }}>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:8, letterSpacing:2, color:T.dim, fontFamily:T.mono, textTransform:"uppercase" }}>Bet</div>
            <div style={{ fontSize:14, fontWeight:700, fontFamily:T.mono, color:_themeAccent }}>${bet}</div>
          </div>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:8, letterSpacing:2, color:T.dim, fontFamily:T.mono, textTransform:"uppercase" }}>Picks</div>
            <div style={{ fontSize:14, fontWeight:700, fontFamily:T.mono, color: picks.length > 0 ? "#8b5cf6" : T.muted }}>{picks.length}/{MAX_PICKS}</div>
          </div>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:8, letterSpacing:2, color:T.dim, fontFamily:T.mono, textTransform:"uppercase" }}>Hits</div>
            <div key={matches} style={{ fontSize:14, fontWeight:700, fontFamily:T.mono, color: matches > 0 ? "#22c55e" : T.muted,
              animation: matches > 0 ? "kenoMatchCount 0.35s ease-out" : "none" }}>{matches}</div>
          </div>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:8, letterSpacing:2, color:T.dim, fontFamily:T.mono, textTransform:"uppercase" }}>Drawn</div>
            <div style={{ fontSize:14, fontWeight:700, fontFamily:T.mono, color:_themeAccent }}>{drawIndex}/{DRAW_COUNT}</div>
          </div>
        </div>
        {}
        <div className="keno-grid" style={{ display:"grid", gridTemplateColumns:"repeat(8, 1fr)", gap:4, marginBottom:12 }}>
          {Array.from({ length: GRID_SIZE }, (_, i) => i + 1).map(num => {
            const isPicked = picks.includes(num);
            const isDrawn = drawn.includes(num);
            const isHit = isPicked && isDrawn;
            const isMiss = isPicked && !isDrawn && phase === "result";
            return (
              <button key={num} onClick={() => togglePick(num)}
                disabled={phase !== "picking" && !isPicked}
                style={{
                  aspectRatio:"1", display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:13, fontWeight:700, fontFamily:T.mono,
                  borderRadius:6, cursor: phase === "picking" ? "pointer" : "default",
                  transition:"all 0.15s", border:"1px solid",
                  background: isHit ? "rgba(34,197,94,0.3)"
                    : isDrawn ? `${_themeAccent}26`
                    : isPicked ? "rgba(139,92,246,0.2)"
                    : "rgba(255,255,255,0.03)",
                  borderColor: isHit ? "#22c55e"
                    : isDrawn ? `${_themeAccent}66`
                    : isPicked ? "#8b5cf6"
                    : "rgba(255,255,255,0.08)",
                  color: isHit ? "#22c55e"
                    : isMiss ? "#ef4444"
                    : isDrawn ? _themeAccent
                    : isPicked ? "#8b5cf6"
                    : "#6a6050",
                  animation: isHit ? "kenoHitPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards" : isDrawn ? "kenoDrawPop 0.25s ease-out forwards" : undefined,
                  boxShadow: isHit ? "0 0 12px rgba(34,197,94,0.4)" : "none",
                }}>
                {num}
              </button>
            );
          })}
        </div>
        {}
        {phase === "picking" && (
          <div style={{ display:"flex", gap:6, justifyContent:"center", marginBottom:12, flexWrap:"wrap" }}>
            {[1,3,5,7,10].map(n => (
              <button key={n} onClick={() => quickPick(n)} style={{
                padding:"5px 10px", fontSize:10, fontWeight:600, fontFamily:T.mono,
                background:"rgba(139,92,246,0.1)", border:"1px solid rgba(139,92,246,0.3)",
                borderRadius:4, color:"#8b5cf6", cursor:"pointer", letterSpacing:1,
              }}>Quick {n}</button>
            ))}
            <button onClick={clearPicks} style={{
              padding:"5px 10px", fontSize:10, fontWeight:600, fontFamily:T.mono,
              background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)",
              borderRadius:4, color:T.muted, cursor:"pointer", letterSpacing:1,
            }}>Clear</button>
          </div>
        )}
        {}
        {picks.length > 0 && (
          <div style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(139,92,246,0.15)",
            borderRadius:8, padding:"8px 12px", marginBottom:12 }}>
            <div style={{ fontSize:9, letterSpacing:2, textTransform:"uppercase", color:T.dim,
              fontFamily:T.mono, marginBottom:6, textAlign:"center" }}>
              Payout Table ({picks.length} picks)
            </div>
            <div style={{ display:"flex", gap:6, justifyContent:"center", flexWrap:"wrap" }}>
              {Object.entries(payTable).map(([hits, mult]) => {
                const isActive = parseInt(hits) === matches && phase === "result";
                return (
                <div key={hits} style={{
                  padding:"3px 8px", borderRadius:4, fontSize:10, fontFamily:T.mono,
                  background: isActive ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.05)",
                  border: `1px solid ${isActive ? "#22c55e" : "rgba(255,255,255,0.08)"}`,
                  color: isActive ? "#22c55e" : "#8a8070",
                  animation: isActive ? "resultBadge 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards" : "none",
                  boxShadow: isActive ? "0 0 8px rgba(34,197,94,0.3)" : "none",
                }}>
                  {hits} hits = <span style={{ color: isActive ? "#22c55e" : _themeAccent, fontWeight:600 }}>{mult}×</span>
                </div>
                );
              })}
            </div>
          </div>
        )}
        {}
        {phase === "picking" && picks.length > 0 && (
          <div style={{ textAlign:"center" }}>
            <BetControls bet={bet} setBet={setBet} chips={chips} presets={[1,2,5,10,25]} />
            <div style={{ marginTop:8 }}>
              <GoldButton onClick={startDraw} disabled={chips < bet} hint="⏎ draw">Draw Numbers</GoldButton>
            </div>
          </div>
        )}
        {phase === "picking" && picks.length === 0 && (
          <div style={{ textAlign:"center", fontSize:12, color:T.dim, fontFamily:T.mono,
            letterSpacing:1, padding:"8px 0" }}>
            Pick 1–10 numbers to play
          </div>
        )}
        {phase === "drawing" && (
          <div className="anim-spinner" style={{ textAlign:"center", fontSize:14, color:_themeAccent, letterSpacing:3,
            fontFamily:T.mono }}>
            Drawing... {drawIndex}/{DRAW_COUNT}
          </div>
        )}
        {}
        {phase === "result" && (
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:18, fontWeight:700, marginBottom:12, display:"inline-block",
              fontFamily:T.serif, letterSpacing:2, padding:"5px 18px", borderRadius:8,
              color: payout > 0 ? "#22c55e" : "#ef4444",
              background: payout > 0 ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
              border: payout > 0 ? "1px solid rgba(34,197,94,0.25)" : "1px solid rgba(239,68,68,0.2)",
              textShadow: payout >= bet * 50 ? "0 0 12px rgba(34,197,94,0.4)" : "none",
              animation:"resultBadge 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards" }}>
              {payout > 0
                ? `${matches} HIT${matches > 1 ? "S" : ""} — WON $${payout.toLocaleString()}!`
                : `${matches} hit${matches !== 1 ? "s" : ""} — No payout`}
            </div>
            <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
              {bet <= chips && bet >= 1 && (
                <GoldButton onClick={() => { reset(true); setTimeout(startDraw, 50); }}>Rebet ${bet} </GoldButton>
              )}
              <GoldButton onClick={() => reset(true)} small>Same Numbers</GoldButton>
              <GoldButton onClick={() => reset(false)} small>New Numbers</GoldButton>
            </div>
          </div>
        )}
      </div>
      <div style={{ padding:"8px", fontSize:10, color:"#1a1a3e", letterSpacing:2, textTransform:"uppercase", zIndex:1 }}>
        Pick 1–10 numbers · 10 drawn · Up to 15,000× payout
      </div>
    </GameShell>
  );
}
function baccaratVal(card) {
  const r = card.rank;
  if (r === "A") return 1;
  if (["10","J","Q","K"].includes(r)) return 0;
  return parseInt(r);
}
function baccaratTotal(cards) {
  return cards.reduce((sum, c) => sum + baccaratVal(c), 0) % 10;
}
function BaccaratGame({ chips, setChips, onBack, onRebuy, startChips, lastBets = {}, setLastBet, winStreak = 0, vipPoints = 0, achCount = 0, reportLoss, applyWin = null, onBetPlaced = null, onRoundEnd, skipOverlays = false, skipEffects = false, theme = "dark", skinTheme, skinId = "house", activePowerUps = [] }) {
  const [bet, setBet] = useState(() => Math.min(lastBets?.baccarat || 25, chips));
  useEffect(() => { if (setLastBet) setLastBet("baccarat", bet); }, [bet, setLastBet]);
  const [betType, setBetType] = useState("player");
  const [playerCards, setPlayerCards] = useState([]);
  const [bankerCards, setBankerCards] = useState([]);
  const [phase, setPhase] = useState("betting");
  const [resultMsg, setResultMsg] = useState("");
  useEffect(() => { if (phase === "result" && onRoundEnd) onRoundEnd(); }, [phase, onRoundEnd]);
  const [won, setWon] = useState(false);
  const [winAmount, setWinAmount] = useState(0);
  const [history, setHistory] = useState([]);
  const fx = useWinEffects();
  const { shaking, shake, shakeIntensity, floatWins, addFloatWin, flash, triggerFlash, lightMode, triggerLights,
    bigWin, setBigWin, dismissOverlay, dismissAll, celebrateWin, shellEffects, coinRainActive, triggerCoins, softCoinRain, washType, triggerWash,
    confetti, triggerConfetti, eruptionActive, triggerEruption } = fx;
  const deal = () => {
    if (chips < bet) return;
    setChips(c => c - bet);
    if (onBetPlaced) onBetPlaced(bet);
    setPhase("dealing");
    const d = createDeck(8);
    const pc = [d.pop(), d.pop()];
    const bc = [d.pop(), d.pop()];
    let pTotal = baccaratTotal(pc);
    let bTotal = baccaratTotal(bc);
    const pNatural = pTotal >= 8;
    const bNatural = bTotal >= 8;
    if (!pNatural && !bNatural) {
      let playerThird = null;
      if (pTotal <= 5) {
        playerThird = d.pop();
        pc.push(playerThird);
        pTotal = baccaratTotal(pc);
      }
      if (playerThird === null) {
        if (bTotal <= 5) { bc.push(d.pop()); bTotal = baccaratTotal(bc); }
      } else {
        const pThirdVal = baccaratVal(playerThird);
        let bankerDraws = false;
        if (bTotal <= 2) bankerDraws = true;
        else if (bTotal === 3 && pThirdVal !== 8) bankerDraws = true;
        else if (bTotal === 4 && pThirdVal >= 2 && pThirdVal <= 7) bankerDraws = true;
        else if (bTotal === 5 && pThirdVal >= 4 && pThirdVal <= 7) bankerDraws = true;
        else if (bTotal === 6 && (pThirdVal === 6 || pThirdVal === 7)) bankerDraws = true;
        if (bankerDraws) { bc.push(d.pop()); bTotal = baccaratTotal(bc); }
      }
    }
    setTimeout(() => {
      setPlayerCards(pc);
      setBankerCards(bc);
      let winner, msg;
      if (pTotal > bTotal) { winner = "player"; msg = `Player ${pTotal} vs Banker ${bTotal}`; }
      else if (bTotal > pTotal) { winner = "banker"; msg = `Banker ${bTotal} vs Player ${pTotal}`; }
      else { winner = "tie"; msg = `Tie at ${pTotal}`; }
      let payout = 0;
      let isWin = false;
      if (betType === winner) {
        isWin = true;
        if (betType === "player") payout = bet * 2;
        else if (betType === "banker") payout = bet + Math.floor(bet * 0.95);
        else if (betType === "tie") payout = bet * 9;
      } else if (winner === "tie" && betType !== "tie") {
        payout = bet;
        msg += " — Push";
      }
      if (payout > 0) {
        if (isWin) { if (applyWin) applyWin(payout); else setChips(c => c + payout); }
        else setChips(c => c + payout);
        if (isWin) {
          const profit = payout - bet;
          setWinAmount(payout);
          setWon(true);
          if (profit > 0) addFloatWin(profit, {x:50, y:30});
          triggerFlash();
          if (betType === "tie") { shake(); triggerLights("big"); setBigWin({type:"big",amount:profit}); }
          else { triggerLights("win"); softCoinRain(winStreak); }
          msg += ` — Won $${profit}${betType === "banker" ? " (5% comm.)" : ""}!`;
        } else {
          setWon(false);
          setWinAmount(0);
          triggerLights("push");
          msg += " — Bet returned";
        }
      } else {
        setWon(false);
        setWinAmount(0);
        triggerLights("loss"); if (reportLoss) reportLoss(bet);
        msg += " — Lost";
      }
      setResultMsg(msg);
      setHistory(h => [...h.slice(-14), { winner, p: pTotal, b: bTotal }]);
      setPhase("result");
    }, 600);
  };
  const reset = () => {
    setBigWin(null);
    fx.clearLights();
    setBet(b => Math.min(b, chips > 0 ? chips : 25));
    setPhase("betting");
    setPlayerCards([]);
    setBankerCards([]);
    setResultMsg("");
    setWon(false);
    setWinAmount(0);
  };
  const bg = "linear-gradient(180deg, #2e1a1a 0%, #1f0d0d 50%, #1a0808 100%)";
  return (
    <GameShell bg={bg} title="BACCARAT" chips={chips} onBack={onBack} {...shellEffects} startChips={startChips} winStreak={winStreak} vipPoints={vipPoints} achCount={achCount} skipOverlays={skipOverlays} skipEffects={skipEffects} onRebuy={onRebuy} theme={theme} skinTheme={skinTheme} skinId={skinId} activePowerUps={activePowerUps} rules={<>
        <p style={{marginTop:0}}>Bet on Player, Banker, or Tie. Closest to 9 wins.</p>
        <p><span style={{color:_themeAccent}}>Card Values:</span> Ace = 1. Cards 2–9 = face value. 10, J, Q, K = 0. Only the last digit of the total counts (e.g. 15 = 5).</p>
        <p><span style={{color:_themeAccent}}>Natural:</span> If either hand totals 8 or 9 on the first two cards, it's a "natural" and no more cards are drawn.</p>
        <p><span style={{color:_themeAccent}}>Player Rule:</span> Player draws a third card on 0–5, stands on 6–7.</p>
        <p><span style={{color:_themeAccent}}>Banker Rule:</span> Banker's draw depends on the Player's third card (complex rule handled automatically).</p>
        <p><span style={{color:_themeAccent}}>Payouts:</span> Player bet pays 1:1. Banker bet pays 0.95:1 (5% commission). Tie bet pays 8:1. Player/Banker bets push on a tie.</p>
        <p style={{color:T.muted, fontSize:11}}>House edge: 1.06% (Banker), 1.24% (Player), 14.4% (Tie). Uses 8 decks.</p>
      </>}>
      <FloatingWins wins={floatWins} />
      {bigWin && !skipOverlays && <BigWinOverlay type={bigWin.type} amount={bigWin.amount} onDone={dismissOverlay} />}
      <div style={{ padding:"12px", position:"relative", zIndex:1, maxWidth:540, margin:"0 auto" }}>
        <EdgeLights mode={lightMode} color="#dc2626" />
        {}
        <div style={{ display:"flex", justifyContent:"center", gap:16, marginBottom:8, padding:"6px 12px",
          background:"rgba(255,240,220,0.03)", borderRadius:8, border:`1px solid ${_themeAccent}14` }}>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:8, letterSpacing:2, color:T.dim, fontFamily:T.mono, textTransform:"uppercase" }}>Bet</div>
            <div style={{ fontSize:14, fontWeight:700, fontFamily:T.mono, color:_themeAccent }}>${bet}</div>
          </div>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:8, letterSpacing:2, color:T.dim, fontFamily:T.mono, textTransform:"uppercase" }}>On</div>
            <div style={{ fontSize:12, fontWeight:700, fontFamily:T.mono, color: betType==="player"?"#3b82f6":betType==="banker"?"#dc2626":"#22c55e" }}>{betType.charAt(0).toUpperCase()+betType.slice(1)}</div>
          </div>
          {history.length > 0 && <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:8, letterSpacing:2, color:T.dim, fontFamily:T.mono, textTransform:"uppercase" }}>History</div>
            <div style={{ display:"flex", gap:3, alignItems:"center" }}>{history.slice(-6).map((h,i) => (
              <span key={i} style={{ width:8, height:8, borderRadius:"50%", display:"inline-block",
                background: h.winner==="player"?"#3b82f6":h.winner==="banker"?"#dc2626":"#22c55e" }} />
            ))}</div>
          </div>}
        </div>
        {}
        {playerCards.length > 0 && (() => {
          const pTotal = baccaratTotal(playerCards);
          const bTotal = baccaratTotal(bankerCards);
          const pWins = phase === "result" && pTotal > bTotal;
          const bWins = phase === "result" && bTotal > pTotal;
          const pNat = pTotal >= 8 && playerCards.length === 2;
          const bNat = bTotal >= 8 && bankerCards.length === 2;
          return (
          <div style={{ display:"flex", justifyContent:"space-around", marginBottom:16, animation:"fadeIn 0.4s ease" }}>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:10, letterSpacing:2, textTransform:"uppercase", marginBottom:6,
                fontFamily:T.mono,
                color: pWins ? "#22c55e" : "#8a8070",
                animation: pNat && phase === "result" ? "bacNatural 1.2s ease-in-out infinite" : "none" }}>
                Player <span style={{ fontWeight:700, fontSize:14, color: pWins ? "#22c55e" : _themeAccent }}>{pTotal}</span>
                {pNat && <span style={{ fontSize:8, color:"#f1c40f", marginLeft:4 }}>NATURAL</span>}
              </div>
              <div style={{ display:"flex", gap:4, justifyContent:"center",
                borderRadius:8, padding:4,
                animation: pWins ? "bacWinHand 1.5s ease-in-out infinite" : "none" }}>
                {playerCards.map((c,i) => <div key={i} style={{ animation: `bacDealIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) ${i*0.15}s both` }}><Card card={c} /></div>)}
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"center", fontSize:14, color:T.dim, fontWeight:700 }}>VS</div>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:10, letterSpacing:2, textTransform:"uppercase", marginBottom:6,
                fontFamily:T.mono,
                color: bWins ? "#22c55e" : "#8a8070",
                animation: bNat && phase === "result" ? "bacNatural 1.2s ease-in-out infinite" : "none" }}>
                Banker <span style={{ fontWeight:700, fontSize:14, color: bWins ? "#22c55e" : _themeAccent }}>{bTotal}</span>
                {bNat && <span style={{ fontSize:8, color:"#f1c40f", marginLeft:4 }}>NATURAL</span>}
              </div>
              <div style={{ display:"flex", gap:4, justifyContent:"center",
                borderRadius:8, padding:4,
                animation: bWins ? "bacWinHand 1.5s ease-in-out infinite" : "none" }}>
                {bankerCards.map((c,i) => <div key={i} style={{ animation: `bacDealIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) ${0.3+i*0.15}s both` }}><Card card={c} /></div>)}
              </div>
            </div>
          </div>
          );
        })()}
        {}
        {resultMsg && (
          <div style={{ textAlign:"center", marginBottom:14 }}>
            <div style={{ fontSize:14, fontWeight:700, letterSpacing:1, display:"inline-block",
              fontFamily:T.serif, padding:"4px 14px", borderRadius:8,
              color: won ? "#22c55e" : resultMsg.includes("Push") ? _themeAccent : "#ef4444",
              background: won ? "rgba(34,197,94,0.08)" : resultMsg.includes("Push") ? `${_themeAccent}14` : "rgba(239,68,68,0.08)",
              border: won ? "1px solid rgba(34,197,94,0.25)" : resultMsg.includes("Push") ? `1px solid ${_themeAccent}33` : "1px solid rgba(239,68,68,0.2)",
              animation:"resultBadge 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards" }}>
              {resultMsg}
            </div>
          </div>
        )}
        {}
        {phase === "betting" && (
          <>
            <div style={{ display:"flex", gap:8, justifyContent:"center", marginBottom:14 }}>
              {[
                { id:"player", label:"Player", sub:"1:1", color:"#3b82f6" },
                { id:"tie", label:"Tie", sub:"8:1", color:_themeAccent },
                { id:"banker", label:"Banker", sub:"0.95:1", color:"#dc2626" },
              ].map(b => {
                const isSel = betType === b.id;
                return (
                <button key={b.id} onClick={() => setBetType(b.id)} style={{
                  padding:"12px 18px", fontSize:14, fontWeight:700, flex:1,
                  fontFamily:T.serif, letterSpacing:1,
                  background: isSel ? `${b.color}22` : "rgba(255,255,255,0.03)",
                  border: `2px solid ${isSel ? b.color : "rgba(255,255,255,0.1)"}`,
                  borderRadius:10, color: isSel ? b.color : "#8a8070", cursor:"pointer",
                  transition:"all 0.2s", textAlign:"center",
                  animation: isSel ? "bacBetSelect 0.25s ease-out" : "none",
                  boxShadow: isSel ? `0 0 12px ${b.color}25` : "none",
                }}>
                  {b.label}
                  <div style={{ fontSize:10, color:T.dim, fontFamily:T.mono, marginTop:2 }}>{b.sub}</div>
                </button>
                );
              })}
            </div>
            <BetControls bet={bet} setBet={setBet} chips={chips} presets={[5,10,25,50,100]} />
            <div style={{ textAlign:"center", marginTop:8 }}>
              <GoldButton onClick={deal} disabled={chips < bet || bet <= 0} hint="⏎ deal">Deal</GoldButton>
            </div>
          </>
        )}
        {phase === "dealing" && (
          <div className="anim-spinner" style={{ textAlign:"center", fontSize:14, color:_themeAccent, letterSpacing:3, fontFamily:T.mono }}>
            Dealing...
          </div>
        )}
        {phase === "result" && (
          <div style={{ display:"flex", gap:8, justifyContent:"center", flexWrap:"wrap" }}>
            <GoldButton onClick={reset} small>Change Bet</GoldButton>
            {bet <= chips && bet >= 1 && (
              <GoldButton onClick={() => { reset(); setTimeout(deal, 50); }}>Rebet ${bet} on {betType} ♠</GoldButton>
            )}
          </div>
        )}
        {}
        {history.length > 0 && (
          <div style={{ marginTop:16, display:"flex", gap:4, justifyContent:"center", flexWrap:"wrap" }}>
            {history.map((h, i) => {
              const isLatest = i === history.length - 1;
              return (
              <div key={`${h.winner}-${h.p}-${h.b}-${i}`} style={{ fontSize:10, padding:"3px 6px", borderRadius:4,
                fontFamily:T.mono, fontWeight:600,
                background: h.winner === "player" ? "rgba(59,130,246,0.15)" : h.winner === "banker" ? "rgba(220,38,38,0.15)" : `${_themeAccent}26`,
                color: h.winner === "player" ? "#3b82f6" : h.winner === "banker" ? "#dc2626" : _themeAccent,
                border: `1px solid ${h.winner === "player" ? "rgba(59,130,246,0.3)" : h.winner === "banker" ? "rgba(220,38,38,0.3)" : `${_themeAccent}4d`}`,
                animation: isLatest ? "multBounceIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards" : "none",
                boxShadow: isLatest ? `0 0 6px ${h.winner === "player" ? "rgba(59,130,246,0.25)" : h.winner === "banker" ? "rgba(220,38,38,0.25)" : `${_themeAccent}40`}` : "none",
              }}>
                {h.winner === "tie" ? "T" : h.winner === "player" ? "P" : "B"} {h.p}–{h.b}
              </div>
              );
            })}
          </div>
        )}
      </div>
      <div style={{ padding:"8px", fontSize:10, color:"#2e1a1a", letterSpacing:2, textTransform:"uppercase", zIndex:1 }}>
        Player · Banker · Tie · 8 Decks
      </div>
    </GameShell>
  );
}
const SCRATCH_AMOUNTS = [1, 5, 10, 25, 50, 100, 250, 500, 1000, 10000];
const SCRATCH_TIER_STYLE = (cost) => {
  if (cost >= 10000) return { label:"JACKPOT CITY", color:"#ff4500", accent:"#ff6b35", icon:"■" };
  if (cost >= 5000) return { label:"MEGA FORTUNE", color:"#ff3366", accent:"#ff6b8a", icon:"◆" };
  if (cost >= 1000) return { label:"HIGH ROLLER", color:T.red, accent:"#f87171", icon:"♠" };
  if (cost >= 500) return { label:"DIAMOND MINE", color:"#a855f7", accent:"#c084fc", icon:"⛏" };
  if (cost >= 250) return { label:"PLATINUM PASS", color:"#60a5fa", accent:"#93c5fd", icon:"✦" };
  if (cost >= 100) return { label:"GOLD RUSH", color:_themeAccent, accent:"#f1c40f", icon:"●" };
  if (cost >= 50) return { label:"CASH BLAST", color:T.green, accent:"#4ade80", icon:"$" };
  if (cost >= 25) return { label:"SILVER STRIKE", color:"#c0c0c0", accent:"#e0e0e0", icon:"⚡" };
  if (cost >= 10) return { label:"BRONZE PICK", color:"#cd7f32", accent:"#e8a050", icon:"⚄" };
  if (cost >= 5) return { label:"COPPER CARD", color:"#b87333", accent:"#d4915c", icon:"♠" };
  return { label:"LUCKY PENNY", color:"#8b7355", accent:"#a08060", icon:"♣" };
};
const PRIZE_POOL_WEIGHTS = [
  { mult: 1,    weight: 88   },
  { mult: 2,    weight: 6    },
  { mult: 3,    weight: 2.5  },
  { mult: 5,    weight: 1.8  },
  { mult: 10,   weight: 0.9  },
  { mult: 25,   weight: 0.4  },
  { mult: 50,   weight: 0.15 },
  { mult: 100,  weight: 0.04 },
  { mult: 500,  weight: 0.005},
];
const PRIZE_TOTAL_W = PRIZE_POOL_WEIGHTS.reduce((a,b)=>a+b.weight,0);
function pickPrizeMult() {
  let r = Math.random() * PRIZE_TOTAL_W;
  for (const p of PRIZE_POOL_WEIGHTS) {
    r -= p.weight;
    if (r <= 0) return p.mult;
  }
  return 1;
}
function generateScratchTicket(ticketCost, forceJackpotFlag = false) {
  const jackpot = forceJackpotFlag || Math.random() < 0.000001;
  const isWinner = jackpot ? true : Math.random() < 0.25;
  const matchCount = jackpot ? (2 + Math.floor(Math.random() * 2)) : isWinner ? (Math.random() < 0.82 ? 1 : Math.random() < 0.78 ? 2 : 3) : 0;
  const pool = Array.from({length:30},(_,i)=>i+1);
  const shuffle = arr => { for(let i=arr.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]];} return arr; };
  shuffle(pool);
  const winningNumbers = pool.slice(0,3).sort((a,b)=>a-b);
  const remaining = pool.slice(3);
  const yourNumbers = [];
  const matchPositions = new Set();
  if (matchCount > 0) {
    const positions = shuffle(Array.from({length:12},(_,i)=>i));
    for (let i = 0; i < matchCount; i++) matchPositions.add(positions[i]);
  }
  const usedNumbers = new Set(winningNumbers);
  for (let i = 0; i < 12; i++) {
    let num;
    if (matchPositions.has(i)) {
      const availableWins = winningNumbers.filter(n => !yourNumbers.some(y => y.number === n));
      num = availableWins.length > 0 ? availableWins[Math.floor(Math.random()*availableWins.length)] : winningNumbers[0];
    } else {
      let pick;
      do {
        pick = remaining[Math.floor(Math.random() * remaining.length)];
      } while (yourNumbers.some(y => y.number === pick));
      num = pick;
    }
    usedNumbers.add(num);
    const prizeMult = pickPrizeMult();
    const prize = Math.max(1, Math.round(ticketCost * prizeMult));
    let special = null;
    if (!matchPositions.has(i)) {
      if (Math.random() < 0.01) special = "moneybag";
    }
    if (!special && Math.random() < 0.04) special = "fire";
    yourNumbers.push({ number: num, prize, special, isMatch: matchPositions.has(i) });
  }
  const bonusWin = Math.random() < 0.06;
  const bonusMult = [1,1,1,2,2,3][Math.floor(Math.random()*6)];
  const bonus = { prize: Math.max(1, Math.round(ticketCost * bonusMult)), isWinner: bonusWin };
  return { winningNumbers, yourNumbers, bonus, jackpot };
}
function calcTicketPayout(ticket) {
  let total = 0;
  const winDetails = [];
  const { winningNumbers, yourNumbers, bonus, jackpot } = ticket;
  const winSet = new Set(winningNumbers);
  yourNumbers.forEach((spot, i) => {
    let won = false;
    let prize = spot.prize;
    if (winSet.has(spot.number) || spot.special === "moneybag") {
      won = true;
      if (spot.special === "fire") prize *= 2;
      total += prize;
      winDetails.push({ index: i, prize, special: spot.special });
    }
  });
  if (bonus.isWinner) {
    total += bonus.prize;
    winDetails.push({ index: "bonus", prize: bonus.prize });
  }
  if (jackpot && total > 0) {
    total *= 10000;
    winDetails.forEach(w => w.prize *= 10000);
  } else if (jackpot) {
    total = 10000;
    winDetails.push({ index: "jackpot", prize: 10000 });
  }
  return { total, winDetails, jackpot: jackpot };
}
const TOTAL_SPOTS = 16;
function ScratchCardGame({ chips, setChips, onBack, onRebuy, startChips, winStreak = 0, vipPoints = 0, achCount = 0, reportLoss, applyWin = null, onBetPlaced = null, reportJackpot, onRoundEnd, forceJackpot = false, onForceJackpotUsed, skipOverlays = false, skipEffects = false, theme = "dark", skinTheme, skinId = "house", activePowerUps = [] }) {
  const [customAmount, setCustomAmount] = useState(10);
  const [ticket, setTicket] = useState(null);
  const [scratched, setScratched] = useState(Array(TOTAL_SPOTS).fill(false));
  const [scratchAnim, setScratchAnim] = useState(Array(TOTAL_SPOTS).fill(false));
  const [phase, setPhase] = useState("buying");
  useEffect(() => { if (phase === "result" && onRoundEnd) onRoundEnd(); }, [phase, onRoundEnd]);
  const [payout, setPayout] = useState(0);
  const [winDetails, setWinDetails] = useState([]);
  const [isJackpot, setIsJackpot] = useState(false);
  const [cardCost, setCardCost] = useState(0);
  const [showOverlay, setShowOverlay] = useState(false);
  const [runningTotal, setRunningTotal] = useState(0);
  const fx = useWinEffects();
  const { shaking, shake, shakeIntensity, floatWins, addFloatWin, flash, triggerFlash, lightMode, triggerLights,
    bigWin, setBigWin, dismissOverlay, dismissAll, celebrateWin, shellEffects, coinRainActive, triggerCoins, softCoinRain, washType, triggerWash,
    confetti, triggerConfetti, eruptionActive, triggerEruption } = fx;
  const currentCost = Math.max(1, Math.min(customAmount, chips));
  const t = SCRATCH_TIER_STYLE(phase === "buying" ? currentCost : cardCost);
  const maxAffordable = Math.max(1, chips);
  const buyCard = () => {
    const cost = currentCost;
    if (cost <= 0 || chips < cost) return;
    setCardCost(cost);
    setChips(c => c - cost);
    if (onBetPlaced) onBetPlaced(cost);
    const newTicket = generateScratchTicket(cost, forceJackpot);
    if (forceJackpot && onForceJackpotUsed) onForceJackpotUsed();
    setTicket(newTicket);
    setScratched(Array(TOTAL_SPOTS).fill(false));
    setScratchAnim(Array(TOTAL_SPOTS).fill(false));
    setPayout(0);
    setWinDetails([]);
    setIsJackpot(false);
    setRunningTotal(0);
    setPhase("scratching");
  };
  const scratchSpot = (idx) => {
    if (phase !== "scratching" || scratched[idx]) return;
    setScratchAnim(prev => { const n = [...prev]; n[idx] = true; return n; });
    setTimeout(() => {
      setScratched(prev => {
        const ns = [...prev]; ns[idx] = true;
        if (ns.every(Boolean)) setTimeout(() => resolveCard(), 200);
        return ns;
      });
    }, 200);
  };
  const scratchAll = () => {
    if (phase !== "scratching") return;
    const unscratched = scratched.map((s, i) => s ? -1 : i).filter(i => i >= 0);
    unscratched.forEach((idx, i) => {
      setTimeout(() => {
        setScratchAnim(prev => { const n = [...prev]; n[idx] = true; return n; });
        setTimeout(() => {
          setScratched(prev => {
            const ns = [...prev]; ns[idx] = true;
            if (ns.every(Boolean)) setTimeout(() => resolveCard(), 200);
            return ns;
          });
        }, 150);
      }, i * 80);
    });
  };
  useEffect(() => {
    if (!ticket || phase !== "scratching") return;
    const winSet = new Set(ticket.winningNumbers);
    const winRevealed = scratched[0] && scratched[1] && scratched[2];
    if (!winRevealed) return;
    let running = 0;
    ticket.yourNumbers.forEach((spot, i) => {
      const spotIdx = 3 + i;
      if (!scratched[spotIdx]) return;
      if (winSet.has(spot.number) || spot.special === "moneybag") {
        let prize = spot.prize;
        if (spot.special === "fire" && winSet.has(spot.number)) prize *= 2;
        running += prize;
      }
    });
    if (scratched[15] && ticket.bonus.isWinner) running += ticket.bonus.prize;
    setRunningTotal(running);
  }, [scratched, ticket, phase]);
  const resolveCard = () => {
    if (!ticket) return;
    const result = calcTicketPayout(ticket);
    setPayout(result.total);
    setWinDetails(result.winDetails);
    setIsJackpot(result.jackpot);
    if (result.jackpot && reportJackpot) reportJackpot();
    if (result.total > 0) {
      if (applyWin) applyWin(result.total); else setChips(c => c + result.total);
      const profit = result.total - cardCost;
      if (profit > 0) addFloatWin(profit, {x:50, y:30});
      triggerFlash();
      if (result.jackpot) { shake(1000, "epic"); triggerLights("mega", 8000); triggerConfetti("fireworks"); triggerCoins("extra_heavy"); triggerWash("jackpot"); triggerEruption(); setShowOverlay(true); }
      else if (result.total >= cardCost * 50) { shake(800, "epic"); triggerLights("mega", 4000); triggerConfetti("fireworks"); triggerEruption(); setBigWin({type:"epic", amount:result.total}); setShowOverlay(true); }
      else if (result.total >= cardCost * 20) { shake(600, "heavy"); triggerLights("mega", 3000); triggerConfetti("confetti"); setBigWin({type:"mega", amount:result.total}); setShowOverlay(true); }
      else if (result.total >= cardCost * 5) { shake(400, "normal"); triggerLights("big", 2500); setBigWin({type:"big", amount:result.total}); setShowOverlay(true); }
      else { triggerLights("win"); softCoinRain(winStreak); }
    } else {
      triggerLights("loss");
      if (reportLoss) reportLoss(cardCost);
    }
    setPhase("result");
  };
  const reset = () => {
    fx.clearLights();
    setPhase("buying");
    setTicket(null);
    setScratched(Array(TOTAL_SPOTS).fill(false));
    setScratchAnim(Array(TOTAL_SPOTS).fill(false));
    setPayout(0);
    setWinDetails([]);
    setIsJackpot(false);
    setRunningTotal(0);
    setShowOverlay(false);
  };
  const bg = "linear-gradient(180deg, #2e2a1a 0%, #1f1a0d 50%, #1a1508 100%)";
  const unscratchedCell = (isAnimating) => ({
    background: isAnimating ? `${_themeAccent}40` : `linear-gradient(145deg, #9a9080, #7a7060)`,
    backgroundSize: isAnimating ? undefined : "200% 100%",
    boxShadow: "inset 0 2px 4px rgba(0,0,0,0.3), inset 0 -1px 2px rgba(255,255,255,0.15), 0 1px 3px rgba(0,0,0,0.2)",
    animation: isAnimating ? "scratchBurst 0.3s ease-out" : "none",
    transform: isAnimating ? "scale(0.95)" : "none",
    cursor: phase === "scratching" ? "pointer" : "default",
  });
  const isSpotWinner = (spotIdx) => {
    if (!ticket) return false;
    return winDetails.some(w => w.index === spotIdx);
  };
  const winSet = ticket ? new Set(ticket.winningNumbers) : new Set();
  return (
    <GameShell bg={bg} title="SCRATCH CARDS" chips={chips} onBack={onBack} {...shellEffects} startChips={startChips} winStreak={winStreak} vipPoints={vipPoints} achCount={achCount} skipOverlays={skipOverlays} skipEffects={skipEffects} onRebuy={onRebuy} theme={theme} skinTheme={skinTheme} skinId={skinId} activePowerUps={activePowerUps} rules={<>
        <p style={{marginTop:0}}>Real scratch-off lottery tickets — just like at the gas station!</p>
        <p><span style={{color:_themeAccent}}>How to Play:</span> Choose a ticket tier, then scratch to reveal. First scratch the 3 WINNING NUMBERS at the top, then scratch YOUR 12 NUMBERS below.</p>
        <p><span style={{color:_themeAccent}}>Matching:</span> If any of YOUR NUMBERS matches a WINNING NUMBER, you win the PRIZE shown for that spot. Multiple wins per ticket are possible!</p>
        <p><span style={{color:_themeAccent}}>Special Symbols:</span></p>
        <p>$ <span style={{color:T.green}}>Money Bag</span> — Auto-win that spot's prize, no match needed!</p>
        <p>▲ <span style={{color:"#f59e0b"}}>Fire</span> — If that spot matches, prize is DOUBLED!</p>
        <p><span style={{color:_themeAccent}}>Bonus Spot:</span> An extra chance to win — scratch it for an instant prize!</p>
        <p><span style={{color:T.red}}>★ JACKPOT:</span> 1 in 1,000,000 chance — multiplies ALL winnings by 10,000×!</p>
        <p style={{color:T.muted, fontSize:11}}>Overall odds of winning: ~1 in 3. Most wins are break-even. RTP: ~68%.</p>
      </>}>
      <FloatingWins wins={floatWins} />
      {showOverlay && !skipOverlays && payout > 0 && phase === "result" && (
        isJackpot
          ? <JackpotOverlay amount={payout} onDone={() => { setShowOverlay(false); dismissAll(); }} />
          : <BigWinOverlay type={bigWin ? bigWin.type : "big"} amount={payout} onDone={() => { setShowOverlay(false); dismissAll(); }} />
      )}
      <div style={{ padding:"12px", position:"relative", zIndex:1, maxWidth:500, margin:"0 auto" }}>
        <EdgeLights mode={lightMode} color="#eab308" />
        {}
        {phase === "buying" && (
          <div>
            <div style={{ fontSize:11, letterSpacing:2, color:T.dim, fontFamily:T.mono,
              textTransform:"uppercase", marginBottom:10, textAlign:"center" }}>Choose your ticket</div>
            {}
            <div style={{ textAlign:"center", marginBottom:12 }}>
              <div style={{ fontSize:28, fontWeight:900, fontFamily:T.serif, color:t.color,
                letterSpacing:2, transition:"color 0.2s" }}>
                ${currentCost.toLocaleString()}
              </div>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6, marginTop:2 }}>
                <span style={{ fontSize:18 }}>{t.icon}</span>
                <span style={{ fontSize:12, fontWeight:700, color:t.accent, fontFamily:T.serif,
                  letterSpacing:2, transition:"color 0.2s" }}>{t.label}</span>
              </div>
            </div>
            {}
            <div style={{ padding:"0 8px", marginBottom:10 }}>
              <input type="range" min={1} max={maxAffordable} value={currentCost}
                onChange={e => setCustomAmount(parseInt(e.target.value))}
                style={{ width:"100%", accentColor:t.color, cursor:"pointer" }}
              />
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:8, color:T.dim,
                fontFamily:T.mono, marginTop:2 }}>
                <span>$1</span>
                <span>${maxAffordable.toLocaleString()}</span>
              </div>
            </div>
            {}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(5, 1fr)", gap:6, marginBottom:8 }}>
              {SCRATCH_AMOUNTS.map((amt) => {
                const canAfford = chips >= amt;
                const tier = SCRATCH_TIER_STYLE(amt);
                const isActive = currentCost === amt;
                return (
                  <button key={amt} onClick={() => { if (canAfford) setCustomAmount(amt); }}
                    disabled={!canAfford} style={{
                    padding:"8px 4px", fontSize:9, fontWeight:700, fontFamily:T.mono,
                    background: isActive ? `${tier.color}20` : "rgba(255,255,255,0.03)",
                    border: `1.5px solid ${isActive ? tier.color : "rgba(255,255,255,0.08)"}`,
                    borderRadius:10, color: isActive ? tier.color : canAfford ? T.muted : T.dim,
                    cursor: canAfford ? "pointer" : "not-allowed", transition:"all 0.15s",
                    opacity: canAfford ? 1 : 0.3, textAlign:"center",
                    boxShadow: isActive ? `0 0 12px ${tier.color}30` : "none",
                  }}>
                    <div style={{ fontSize:20, lineHeight:1, marginBottom:3 }}>{tier.icon}</div>
                    <div style={{ fontWeight:900, fontSize:10 }}>{amt >= 1000 ? `$${(amt/1000)}K` : `$${amt}`}</div>
                    <div style={{ fontSize:6, letterSpacing:0.3, opacity:0.65, marginTop:1, lineHeight:1.1 }}>{tier.label}</div>
                  </button>
                );
              })}
            </div>
            {}
            <div style={{ marginBottom:12, padding:"0 4px" }}>
              <button onClick={() => { if (chips > 0) setCustomAmount(chips); }}
                disabled={chips <= 0} style={{
                width:"100%", padding:"8px 10px", fontSize:12, fontWeight:900, fontFamily:T.mono,
                background: currentCost === chips ? "rgba(255,69,0,0.15)" : "rgba(255,69,0,0.04)",
                border: `1.5px solid ${currentCost === chips ? "#ff4500" : "rgba(255,69,0,0.15)"}`,
                borderRadius:10, color: currentCost === chips ? "#ff4500" : "#ff6b6b",
                cursor: chips > 0 ? "pointer" : "not-allowed", transition:"all 0.15s",
                letterSpacing:2,
                boxShadow: currentCost === chips ? "0 0 16px rgba(255,69,0,0.2)" : "none",
              }}>
                ★ ALL IN — ${chips.toLocaleString()} ▲
              </button>
            </div>
            {}
            <div style={{ background:"rgba(255,255,255,0.03)", border:`1px solid ${t.color}33`,
              borderRadius:10, padding:"10px 14px", marginBottom:14 }}>
              <div style={{ fontSize:9, letterSpacing:2, textTransform:"uppercase", color:T.dim,
                fontFamily:T.mono, marginBottom:6, textAlign:"center" }}>
                Prize Range — {t.label}
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"4px 12px", fontSize:11,
                fontFamily:T.mono, color:T.muted }}>
                {PRIZE_POOL_WEIGHTS.map(p => {
                  const val = Math.max(1, Math.round(currentCost * p.mult));
                  return (
                    <div key={p.mult} style={{ display:"flex", justifyContent:"space-between" }}>
                      <span style={{ color: p.mult >= 100 ? t.color : "#6a6050" }}>${val.toLocaleString()}</span>
                      <span style={{ color:"#4a4030", fontSize:9 }}>{p.mult}×</span>
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop:8, fontSize:9, color:T.dim, textAlign:"center",
                fontFamily:T.mono }}>
                $ Auto-win · ▲ 2× Prize · ★ Jackpot: 10,000×
              </div>
            </div>
            <div style={{ textAlign:"center" }}>
              <GoldButton onClick={buyCard} disabled={currentCost <= 0 || chips < currentCost}>
                {currentCost === chips && chips > 0 ? `ALL IN ($${chips.toLocaleString()})` : `Buy Ticket ($${currentCost.toLocaleString()})`}
              </GoldButton>
            </div>
          </div>
        )}
        {}
        {(phase === "scratching" || phase === "result") && ticket && (() => {
          const allWinRevealed = scratched[0] && scratched[1] && scratched[2];
          return (
          <>
            {}
            <div style={{ background:`linear-gradient(135deg, ${t.color}18, ${t.color}08)`,
              border:`2px solid ${t.color}55`, borderRadius:14, overflow:"hidden", marginBottom:10,
              position:"relative" }}>
              {}
              {phase === "scratching" && (
                <div style={{ position:"absolute", inset:0, pointerEvents:"none", zIndex:2,
                  background:`linear-gradient(105deg, transparent 40%, ${t.color}15 45%, ${t.color}30 50%, ${t.color}15 55%, transparent 60%)`,
                  backgroundSize:"200% 100%",
                  animation:"ticketShimmer 2s ease-in-out 0.3s 1 both",
                  borderRadius:14 }} />
              )}
              {}
              <div style={{ background:`linear-gradient(90deg, ${t.color}44, ${t.color}22)`,
                padding:"8px 14px", display:"flex", justifyContent:"space-between", alignItems:"center",
                position:"relative", overflow:"hidden" }}>
                <span style={{ fontSize:14, fontWeight:900, color:t.accent, fontFamily:T.serif,
                  letterSpacing:2 }}>{t.label}</span>
                <span style={{ fontSize:10, color:t.accent, fontFamily:T.mono, opacity:0.7 }}>
                  ${cardCost.toLocaleString()} ticket
                </span>
                {}
                {phase === "result" && isJackpot && (
                  <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center",
                    background:"linear-gradient(90deg, rgba(255,215,0,0.0), rgba(255,215,0,0.25), rgba(255,215,0,0.0))",
                    animation:"bigWinPulse 0.8s ease-in-out infinite", pointerEvents:"none" }}>
                    <span style={{ fontSize:18, fontWeight:900, letterSpacing:5, fontFamily:T.serif,
                      color:"#ffd700", textShadow:"0 0 15px rgba(255,215,0,0.8), 0 0 30px rgba(255,215,0,0.4)" }}>
                      ★ JACKPOT ★
                    </span>
                  </div>
                )}
              </div>
              <div style={{ padding:"14px 16px" }}>
                {}
                <div style={{ marginBottom:12 }}>
                  <div style={{ fontSize:9, letterSpacing:3, textTransform:"uppercase", color:T.muted,
                    fontFamily:T.mono, marginBottom:6, textAlign:"center", fontWeight:700 }}>
                    ⭐ Winning Numbers ⭐
                  </div>
                  <div style={{ display:"flex", justifyContent:"center", gap:10 }}>
                    {ticket.winningNumbers.map((num, i) => {
                      const isRevealed = scratched[i];
                      const isAnimating = scratchAnim[i] && !isRevealed;
                      return (
                        <button key={i} onClick={() => scratchSpot(i)} style={{
                          width:72, height:72, borderRadius:12, border:"none",
                          display:"flex", alignItems:"center", justifyContent:"center",
                          cursor: phase === "scratching" && !isRevealed ? "pointer" : "default",
                          transition:"all 0.2s",
                          ...(isRevealed ? {
                            background:"rgba(241,196,15,0.15)", border:"2px solid rgba(241,196,15,0.4)",
                            animation:"scratchBurst 0.4s ease-out",
                            boxShadow:"0 0 15px rgba(241,196,15,0.2)",
                          } : unscratchedCell(isAnimating)),
                        }}>
                          {isRevealed ? (
                            <span style={{ fontSize:26, fontWeight:900, color:"#f1c40f",
                              fontFamily:T.mono,
                              textShadow:"0 0 10px rgba(241,196,15,0.3)",
                              animation:"fadeInScale 0.3s ease-out" }}>{num}</span>
                          ) : (
                            <span style={{ fontSize:16, color:"rgba(255,255,255,0.3)", fontFamily:T.mono }}>?</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
                {}
                <div style={{ height:1, background:`linear-gradient(90deg, transparent, ${t.color}44, transparent)`, margin:"4px 0 10px" }} />
                {}
                <div style={{ marginBottom:12 }}>
                  <div style={{ fontSize:9, letterSpacing:3, textTransform:"uppercase", color:T.muted,
                    fontFamily:T.mono, marginBottom:6, textAlign:"center", fontWeight:700 }}>
                    Your Numbers
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:8 }}>
                    {ticket.yourNumbers.map((spot, i) => {
                      const spotIdx = 3 + i;
                      const isRevealed = scratched[spotIdx];
                      const isAnimating = scratchAnim[spotIdx] && !isRevealed;
                      const isMatch = isRevealed && allWinRevealed && (winSet.has(spot.number) || spot.special === "moneybag");
                      const displayPrize = spot.special === "fire" && winSet.has(spot.number) ? spot.prize * 2 : spot.prize;
                      return (
                        <button key={i} onClick={() => scratchSpot(spotIdx)} style={{
                          padding:"6px 2px", borderRadius:8, border:"none",
                          display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
                          cursor: phase === "scratching" && !isRevealed ? "pointer" : "default",
                          transition:"all 0.2s", minHeight:72,
                          ...(isRevealed ? {
                            background: isMatch ? (ticket.jackpot ? "rgba(255,215,0,0.18)" : "rgba(34,197,94,0.15)") : "rgba(255,255,255,0.04)",
                            border: isMatch ? (ticket.jackpot ? "2px solid rgba(255,215,0,0.6)" : "2px solid rgba(34,197,94,0.5)") : "1px solid rgba(255,255,255,0.06)",
                            boxShadow: isMatch ? (ticket.jackpot ? "0 0 20px rgba(255,215,0,0.4)" : "0 0 16px rgba(34,197,94,0.35)") : "none",
                            animation: isMatch ? "matchReveal 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards" : "scratchBurst 0.35s ease-out",
                          } : unscratchedCell(isAnimating)),
                        }}>
                          {isRevealed ? (<>
                            <div style={{ display:"flex", alignItems:"center", gap:2, marginBottom:2 }}>
                              {spot.special === "moneybag" && <span style={{ fontSize:10 }}>$</span>}
                              {spot.special === "fire" && <span style={{ fontSize:10 }}>▲</span>}
                              {isMatch && ticket.jackpot && <span style={{ fontSize:10 }}>♛</span>}
                              <span style={{ fontSize:20, fontWeight:800, color: isMatch ? (ticket.jackpot ? "#ffd700" : "#22c55e") : "#c8c0b0",
                                fontFamily:T.mono,
                                textShadow: isMatch ? (ticket.jackpot ? "0 0 12px rgba(255,215,0,0.6)" : "0 0 8px rgba(34,197,94,0.4)") : "none",
                                animation: isMatch ? "none" : "fadeInScale 0.25s ease-out" }}>
                                {spot.special === "moneybag" ? "$" : spot.number}
                              </span>
                            </div>
                            <span style={{ fontSize:10, fontWeight:700, color: isMatch ? (ticket.jackpot ? "#ffd700" : "#4ade80") : "#6a6050",
                              fontFamily:T.mono,
                              animation: isMatch ? "winAccumulate 0.4s ease-out" : "none" }}>
                              ${displayPrize.toLocaleString()}
                            </span>
                          </>) : (
                            <span style={{ fontSize:14, color:"rgba(255,255,255,0.3)", fontFamily:T.mono }}>?</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
                {}
                <div style={{ height:1, background:`linear-gradient(90deg, transparent, ${t.color}44, transparent)`, margin:"4px 0 10px" }} />
                {}
                <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:12 }}>
                  <span style={{ fontSize:9, letterSpacing:3, textTransform:"uppercase", color:T.muted,
                    fontFamily:T.mono, fontWeight:700 }}>Bonus</span>
                  {(() => {
                    const bIdx = 15;
                    const isRevealed = scratched[bIdx];
                    const isAnimating = scratchAnim[bIdx] && !isRevealed;
                    const bWin = ticket.bonus.isWinner;
                    return (
                      <button onClick={() => scratchSpot(bIdx)} style={{
                        width:80, height:44, borderRadius:8, border:"none",
                        display:"flex", alignItems:"center", justifyContent:"center",
                        cursor: phase === "scratching" && !isRevealed ? "pointer" : "default",
                        transition:"all 0.2s",
                        ...(isRevealed ? {
                          background: bWin ? "rgba(241,196,15,0.15)" : "rgba(255,255,255,0.04)",
                          border: bWin ? "2px solid rgba(241,196,15,0.5)" : "1px solid rgba(255,255,255,0.06)",
                          boxShadow: bWin ? "0 0 16px rgba(241,196,15,0.35)" : "none",
                          animation: bWin ? "matchReveal 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards" : "scratchBurst 0.35s ease-out",
                        } : {
                          ...unscratchedCell(isAnimating),
                          background: isAnimating ? `${_themeAccent}40` : "linear-gradient(145deg, #a89878, #8a7858)",
                          border: "1px solid rgba(241,196,15,0.15)",
                        }),
                      }}>
                        {isRevealed ? (
                          bWin ? (
                            <span style={{ fontSize:14, fontWeight:800, color:"#f1c40f",
                              fontFamily:T.mono, animation:"fadeInScale 0.3s ease-out",
                              textShadow:"0 0 8px rgba(241,196,15,0.4)" }}>$ ${ticket.bonus.prize.toLocaleString()}</span>
                          ) : (
                            <span style={{ fontSize:16, color:T.dim }}>❌</span>
                          )
                        ) : (
                          <span style={{ fontSize:14, color:"rgba(255,255,255,0.3)", fontFamily:T.mono }}>★ ? ★</span>
                        )}
                      </button>
                    );
                  })()}
                </div>
              </div>
            </div>
            {}
            {phase === "scratching" && runningTotal > 0 && (
              <div style={{ textAlign:"center", marginBottom:8, animation:"winAccumulate 0.4s ease-out" }}>
                <span style={{ fontSize:16, fontWeight:700, color:T.green,
                  fontFamily:T.mono, padding:"4px 16px", borderRadius:8,
                  background:"rgba(34,197,94,0.08)", border:"1px solid rgba(34,197,94,0.2)",
                  display:"inline-block",
                  textShadow:"0 0 8px rgba(34,197,94,0.3)" }}>
                  Winnings: +${runningTotal.toLocaleString()}
                </span>
              </div>
            )}
            {}
            {phase === "scratching" && (
              <div style={{ textAlign:"center", marginBottom:8 }}>
                <button onClick={scratchAll} style={{
                  padding:"8px 24px", fontSize:11, fontWeight:700, fontFamily:T.mono,
                  letterSpacing:2, textTransform:"uppercase",
                  background:`${_themeAccent}1a`, border:`1px solid ${_themeAccent}4d`,
                  borderRadius:6, color:_themeAccent, cursor:"pointer",
                }}>Scratch All</button>
              </div>
            )}
            {}
            {phase === "result" && (
              <div style={{ textAlign:"center" }}>
                {isJackpot && (
                  <div style={{ fontSize:20, fontWeight:900, color:"#f1c40f", marginBottom:6,
                    fontFamily:T.serif, letterSpacing:3,
                    animation:"bigWinPulse 0.6s ease-in-out infinite",
                    textShadow:"0 0 20px rgba(241,196,15,0.5)" }}>
                    ★ JACKPOT — 10,000× ♠
                  </div>
                )}
                <div style={{ fontSize:18, fontWeight:700, marginBottom:4,
                  fontFamily:T.serif, letterSpacing:2,
                  color: payout > 0 ? "#22c55e" : "#ef4444",
                  animation:"fadeIn 0.3s ease" }}>
                  {payout > 0
                    ? `WON $${payout.toLocaleString()}!`
                    : "No winners — try again!"}
                </div>
                {payout > 0 && winDetails.length > 0 && !isJackpot && (
                  <div style={{ fontSize:10, color:T.muted, marginBottom:8,
                    fontFamily:T.mono }}>
                    {winDetails.length} winning spot{winDetails.length > 1 ? "s" : ""}
                  </div>
                )}
                <GoldButton onClick={reset}>Buy Another</GoldButton>
              </div>
            )}
          </>
          );
        })()}
      </div>
      <div style={{ padding:"8px", fontSize:9, color:"#2e2a1a", letterSpacing:2, textTransform:"uppercase", zIndex:1 }}>
        Match your numbers to winning numbers · $ Auto-win · ▲ 2× Prize
      </div>
    </GameShell>
  );
}
const INITIAL_STATS = {
  peakBankroll: 1000,
  biggestWin: 0,
  biggestWinGame: null,
  totalWagered: 0,
  rebuys: 0,
  gamesPlayed: { blackjack:0, poker:0, roulette:0, slots:0, plinko:0, crash:0, highlow:0, dice:0, craps:0, keno:0, baccarat:0, scratch:0 },
  biggestWinPerGame: { blackjack:0, poker:0, roulette:0, slots:0, plinko:0, crash:0, highlow:0, dice:0, craps:0, keno:0, baccarat:0, scratch:0 },
  winsPerGame: { blackjack:0, poker:0, roulette:0, slots:0, plinko:0, crash:0, highlow:0, dice:0, craps:0, keno:0, baccarat:0, scratch:0 },
  lossesPerGame: { blackjack:0, poker:0, roulette:0, slots:0, plinko:0, crash:0, highlow:0, dice:0, craps:0, keno:0, baccarat:0, scratch:0 },
  profitPerGame: { blackjack:0, poker:0, roulette:0, slots:0, plinko:0, crash:0, highlow:0, dice:0, craps:0, keno:0, baccarat:0, scratch:0 },
  resultHistory: { blackjack:[], poker:[], roulette:[], slots:[], plinko:[], crash:[], highlow:[], dice:[], craps:[], keno:[], baccarat:[], scratch:[] },
  netProfit: 0,
  winStreak: 0,
  bestStreak: 0,
  lossStreak: 0,
  achievements: [],
  totalWins: 0,
  lastAllInAmount: 0,
  allInWins: 0,
  totalRounds: 0,
};
function FirstTimePrompt({ onSignIn }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) { setError("Please enter a name"); return; }
    if (trimmed.length > 20) { setError("20 characters max"); return; }
    if (/['"\\\/]/.test(trimmed)) { setError("No quotes or slashes"); return; }
    onSignIn(trimmed);
  };
  return (
    <div style={{ minHeight:"100vh", background:DARK_BG, display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center", fontFamily:T.serif, color:T.text }}>
      <div style={{ textAlign:"center", animation:"fadeIn 0.5s ease" }}>
        <h1 className="anim-shimmer-title" style={{ fontSize:32, fontWeight:900, margin:"0 0 8px", letterSpacing:4,
          background:`linear-gradient(135deg, ${_themeAccent}, ${_themeAccent}cc, ${_themeAccent})`,
          backgroundSize:"200% auto", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
          backgroundClip:"text", color:"transparent",
          fontFamily:"'Cormorant Garamond', 'Playfair Display', Georgia, serif" }}>OBSIDIAN LOUNGE</h1>
        <div style={{ fontSize:10, letterSpacing:3, color:T.dim, fontFamily:T.mono, marginBottom:28 }}>CHOOSE A NAME TO BEGIN</div>
        <input type="text" value={name} onChange={e => { setName(e.target.value); setError(""); }}
          onKeyDown={e => e.key === "Enter" && handleSubmit()} placeholder="Your name" maxLength={20} autoFocus
          style={{ width:200, padding:"10px 14px", fontSize:15, fontWeight:600, textAlign:"center",
            fontFamily:T.serif, letterSpacing:2, background:"rgba(255,255,255,0.05)",
            border:`1px solid ${_themeAccent}4d`, borderRadius:8, color:T.text, outline:"none" }}
          onFocus={e => e.target.style.borderColor = `${_themeAccent}99`}
          onBlur={e => e.target.style.borderColor = `${_themeAccent}4d`} />
        {error && <div style={{ marginTop:6, fontSize:10, color:T.red, fontFamily:T.mono }}>{error}</div>}
        <div style={{ marginTop:14 }}>
          <button onClick={handleSubmit} style={{ padding:"10px 36px", fontSize:12, fontWeight:700,
            letterSpacing:3, textTransform:"uppercase", fontFamily:T.serif,
            background:`linear-gradient(135deg, ${_themeAccent}, ${_themeAccent}cc)`, color:"#1a1a2e",
            border:"none", borderRadius:7, cursor:"pointer" }}>Play</button>
        </div>
        <div style={{ marginTop:16, fontSize:8, color:"#3a3020", fontFamily:T.mono, letterSpacing:1 }}>
          Your progress saves to this name
        </div>
      </div>
    </div>
  );
}
export default function Casino() {
  const [username, setUsername] = useState(null);
  const [lastUsername, setLastUsername] = useState("");
  const [currentGame, setCurrentGame] = useState(null);
  const [transitioning, setTransitioning] = useState(false);
  const [transitionFadeOut, setTransitionFadeOut] = useState(false);
  const [transitionFadeKey, setTransitionFadeKey] = useState(0);
  const pendingGameRef = useRef(null);
  const [chips, setChips] = useState(1000);
  const [stats, setStats] = useState(INITIAL_STATS);
  const statsRef = useRef(INITIAL_STATS);
  useEffect(() => { statsRef.current = stats; }, [stats]);
  const [settings, setSettings] = useState({ animSpeed: "normal", theme: "dark", skipOverlays: false, skipEffects: false, chipSkin: "house" });
  const settingsRef = useRef(settings);
  useEffect(() => { settingsRef.current = settings; }, [settings]);
  const [loaded, setLoaded] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const prevChipsRef = useRef(1000);
  const usernameRef = useRef(null);
  const [achievementToast, setAchievementToast] = useState(null);
  const achievementQueueRef = useRef([]);
  const pendingAchievementsRef = useRef([]);
  const [forceJackpot, setForceJackpot] = useState(false);
  const sessionStartRef = useRef(Date.now());
  const [sessionRounds, setSessionRounds] = useState(0);
  const sessionChipsStartRef = useRef(-1);
  const autoSignInRef = useRef(false);
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=JetBrains+Mono:wght@400;600&family=Cormorant+Garamond:wght@400;700&display=swap";
    document.head.appendChild(link);
    let viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      viewport = document.createElement("meta");
      viewport.name = "viewport";
      document.head.appendChild(viewport);
    }
    viewport.content = "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover";
    document.body.style.overflow = "auto";
    document.body.style.overscrollBehavior = "none";
    document.body.style.position = "relative";
    const preventCtx = (e) => { if (e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA") e.preventDefault(); };
    document.addEventListener("contextmenu", preventCtx);
    return () => { try { document.head.removeChild(link); } catch(e) {} document.removeEventListener("contextmenu", preventCtx); };
  }, []);
  const showNextAchievement = useCallback(() => {
    if (achievementQueueRef.current.length === 0) { setAchievementToast(null); return; }
    const next = achievementQueueRef.current.shift();
    setAchievementToast(next);
  }, []);
  const unlockAchievement = useCallback((id) => {
    setStats(s => {
      if ((s.achievements || []).includes(id)) return s;
      const ach = ACHIEVEMENTS.find(a => a.id === id);
      if (ach) achievementQueueRef.current.push(ach);
      if (!achievementToast && achievementQueueRef.current.length === 1) {
        setTimeout(() => showNextAchievement(), 100);
      }
      return { ...s, achievements: [...(s.achievements || []), id] };
    });
  }, [achievementToast, showNextAchievement]);
  useEffect(() => {
    if (pendingAchievementsRef.current.length > 0) {
      const pending = [...pendingAchievementsRef.current];
      pendingAchievementsRef.current = [];
      pending.forEach(id => unlockAchievement(id));
    }
  });
  const handleSignIn = useCallback(async (name, { instant = false } = {}) => {
    const key = `casino-save:${name.toLowerCase()}`;
    try {
      await window.storage.set("casino-lastuser", name).catch(() => {});
      const result = await window.storage.get(key);
      if (result && result.value) {
        const save = JSON.parse(result.value);
        if (save.chips != null) { setChips(save.chips); prevChipsRef.current = save.chips; }
        if (save.stats) setStats(s => ({ ...s, ...save.stats,
          gamesPlayed: { ...s.gamesPlayed, ...(save.stats.gamesPlayed || {}) },
          biggestWinPerGame: { ...s.biggestWinPerGame, ...(save.stats.biggestWinPerGame || {}) },
          winsPerGame: { ...s.winsPerGame, ...(save.stats.winsPerGame || {}) },
          lossesPerGame: { ...s.lossesPerGame, ...(save.stats.lossesPerGame || {}) },
          profitPerGame: { ...s.profitPerGame, ...(save.stats.profitPerGame || {}) },
          resultHistory: { ...s.resultHistory, ...(save.stats.resultHistory || {}) },
        }));
        if (save.displayName) name = save.displayName;
        if (save.settings) setSettings(s => ({ ...s, ...save.settings }));
      }
    } catch (e) {  }
    usernameRef.current = name;
    if (instant) {
      setUsername(name);
      setLoaded(true);
    } else {
      setTransitioning(true);
      setTimeout(() => {
        setUsername(name);
        setLoaded(true);
        setTimeout(() => {
          setTransitioning(false);
          setTransitionFadeKey(k => k + 1);
          setTransitionFadeOut(true);
          setTimeout(() => setTransitionFadeOut(false), 450);
        }, 80);
      }, 350);
    }
    sessionStartRef.current = Date.now();
    setSessionRounds(0);
  }, []);
  const handleSignOut = useCallback(() => {
    setUsername(null);
    setCurrentGame(null);
    setChips(1000);
    setStats(INITIAL_STATS);
    prevChipsRef.current = 1000;
    setLoaded(false);
    autoSignInRef.current = false;
    window.storage?.delete("casino-lastuser").catch(() => {});
  }, []);
  useEffect(() => {
    (async () => {
      try {
        const result = await window.storage.get("casino-lastuser");
        if (result && result.value && !autoSignInRef.current) {
          autoSignInRef.current = true;
          setLastUsername(result.value);
          await handleSignIn(result.value, { instant: true });
          setInitialLoading(false);
          return;
        }
      } catch (e) {  }
      setInitialLoading(false);
    })();
  }, [handleSignIn]);
  useEffect(() => {
    if (loaded && sessionChipsStartRef.current === -1) sessionChipsStartRef.current = chips;
  }, [loaded, chips]);
  useEffect(() => {
    if (!loaded || !usernameRef.current) return;
    const key = `casino-save:${usernameRef.current.toLowerCase()}`;
    const save = JSON.stringify({ chips, stats, settings, displayName: usernameRef.current });
    window.storage?.set(key, save).catch(() => {});
  }, [chips, stats, settings, loaded]);
  useEffect(() => {
    const prev = prevChipsRef.current;
    const diff = chips - prev;
    prevChipsRef.current = chips;
    if (diff === 0) return;
    setStats(s => {
      const updated = { ...s,
        achievements: [...(s.achievements || [])],
      };
      const ua = updated.achievements;
      if (prev <= 0 && chips > 0 && currentGame) {
        updated.rebuys += 1;
        updated.winStreak = 0;
        updated.lossStreak = 0;
        if (updated.rebuys >= 100) { if (!ua.includes("rebuy_100")) pendingAchievementsRef.current.push("rebuy_100"); };
        return updated;
      }
      if (chips > updated.peakBankroll) updated.peakBankroll = chips;
      if (diff < 0 && currentGame) {
        updated.totalWagered += Math.abs(diff);
        updated.lastAllInAmount = Math.abs(diff);
        if (currentGame === "plinko") {
          updated._plinkoBalls = (updated._plinkoBalls || 0) + 1;
          if (updated._plinkoBalls >= 10) { updated.totalRounds = (updated.totalRounds || 0) + 1; updated._plinkoBalls = 0; }
        } else {
          updated.totalRounds = (updated.totalRounds || 0) + 1;
        }
        if (updated.totalRounds >= 1000) { if (!ua.includes("rounds_1k")) pendingAchievementsRef.current.push("rounds_1k"); };
        if (updated.totalRounds >= 5000) { if (!ua.includes("rounds_5k")) pendingAchievementsRef.current.push("rounds_5k"); };
        if (updated.totalRounds >= 10000) { if (!ua.includes("rounds_10k")) pendingAchievementsRef.current.push("rounds_10k"); };
        if (Math.abs(diff) >= 10000) { if (!ua.includes("high_roller")) pendingAchievementsRef.current.push("high_roller"); };
        if (Math.abs(diff) >= 50000) { if (!ua.includes("high_roller_50k")) pendingAchievementsRef.current.push("high_roller_50k"); };
        if (Math.abs(diff) >= 250000) { if (!ua.includes("high_roller_250k")) pendingAchievementsRef.current.push("high_roller_250k"); };
        if (Math.abs(diff) >= 1000000) { if (!ua.includes("high_roller_1m")) pendingAchievementsRef.current.push("high_roller_1m"); };
        if (Math.abs(diff) >= 100000000) { if (!ua.includes("high_roller_100m")) pendingAchievementsRef.current.push("high_roller_100m"); };
        if (updated.totalWagered >= 100000) { if (!ua.includes("wagered_100k")) pendingAchievementsRef.current.push("wagered_100k"); };
        if (updated.totalWagered >= 1000000) { if (!ua.includes("wagered_1m")) pendingAchievementsRef.current.push("wagered_1m"); };
        if (updated.totalWagered >= 100000000) { if (!ua.includes("wagered_100m")) pendingAchievementsRef.current.push("wagered_100m"); };
        if (updated.totalWagered >= 5000000000) { if (!ua.includes("wagered_5b")) pendingAchievementsRef.current.push("wagered_5b"); };
        const pts = calcVipPoints(updated);
        const tier = getVipTier(pts, ua.length);
        if (["silver","gold","platinum","emerald","diamond","celestial","royale"].includes(tier.id)) { if (!ua.includes("vip_silver")) pendingAchievementsRef.current.push("vip_silver"); };
        if (["gold","platinum","emerald","diamond","celestial","royale"].includes(tier.id)) { if (!ua.includes("vip_gold")) pendingAchievementsRef.current.push("vip_gold"); };
        if (["platinum","emerald","diamond","celestial","royale"].includes(tier.id)) { if (!ua.includes("vip_platinum")) pendingAchievementsRef.current.push("vip_platinum"); };
        if (["emerald","diamond","celestial","royale"].includes(tier.id)) { if (!ua.includes("vip_emerald")) pendingAchievementsRef.current.push("vip_emerald"); };
        if (["diamond","celestial","royale"].includes(tier.id)) { if (!ua.includes("vip_diamond")) pendingAchievementsRef.current.push("vip_diamond"); };
        if (["celestial","royale"].includes(tier.id)) { if (!ua.includes("vip_celestial")) pendingAchievementsRef.current.push("vip_celestial"); };
      }
      if (diff > 0 && currentGame) {
        const streakEligible = currentGame !== "slots" && currentGame !== "plinko";
        if (streakEligible) {
          updated.winStreak = (updated.winStreak || 0) + 1;
          const prevLossStreak = updated.lossStreak || 0;
          updated.lossStreak = 0;
          if (updated.winStreak > (updated.bestStreak || 0)) updated.bestStreak = updated.winStreak;
          if (updated.winStreak >= 5) { if (!ua.includes("streak_5")) pendingAchievementsRef.current.push("streak_5"); };
          if (updated.winStreak >= 10) { if (!ua.includes("streak_10")) pendingAchievementsRef.current.push("streak_10"); };
          if (updated.winStreak >= 20) { if (!ua.includes("streak_20")) pendingAchievementsRef.current.push("streak_20"); };
          if (prevLossStreak >= 5) { if (!ua.includes("comeback")) pendingAchievementsRef.current.push("comeback"); };
        }
        updated.totalWins = (updated.totalWins || 0) + 1;
        const wpg = { ...(updated.winsPerGame || {}) };
        wpg[currentGame] = (wpg[currentGame] || 0) + 1;
        updated.winsPerGame = wpg;
        const ppg = { ...(updated.profitPerGame || {}) };
        ppg[currentGame] = (ppg[currentGame] || 0) + diff;
        updated.profitPerGame = ppg;
        const rh = { ...(updated.resultHistory || {}) };
        rh[currentGame] = [...(rh[currentGame] || []), diff].slice(-20);
        updated.resultHistory = rh;
        if (diff > updated.biggestWin) {
          updated.biggestWin = diff;
          updated.biggestWinGame = currentGame;
        }
        const perGame = { ...updated.biggestWinPerGame };
        if (diff > (perGame[currentGame] || 0)) perGame[currentGame] = diff;
        updated.biggestWinPerGame = perGame;
        if (updated.totalWins === 1) { if (!ua.includes("first_win")) pendingAchievementsRef.current.push("first_win"); };
        if (updated.totalWins >= 100) { if (!ua.includes("wins_100")) pendingAchievementsRef.current.push("wins_100"); };
        if (updated.totalWins >= 1000) { if (!ua.includes("wins_1k")) pendingAchievementsRef.current.push("wins_1k"); };
        if (updated.totalWins >= 5000) { if (!ua.includes("wins_5k")) pendingAchievementsRef.current.push("wins_5k"); };
        if (diff >= 10000) { if (!ua.includes("big_win_10k_j")) pendingAchievementsRef.current.push("big_win_10k_j"); };
        if (diff >= 100000) { if (!ua.includes("big_win_100k")) pendingAchievementsRef.current.push("big_win_100k"); };
        if (diff >= 1000000) { if (!ua.includes("big_win_1m")) pendingAchievementsRef.current.push("big_win_1m"); };
        if (diff >= 100000000) { if (!ua.includes("big_win_100m")) pendingAchievementsRef.current.push("big_win_100m"); };
        if (diff >= 1000000000) { if (!ua.includes("big_win_1b")) pendingAchievementsRef.current.push("big_win_1b"); };
        if (updated.lastAllInAmount > 0 && diff >= updated.lastAllInAmount) {
          if (updated.lastAllInAmount >= prev * 0.9) {
            updated.allInWins = (updated.allInWins || 0) + 1;
            if (updated.allInWins >= 25) { if (!ua.includes("all_in_25")) pendingAchievementsRef.current.push("all_in_25"); };
          }
        }
        const allGameIds = ["blackjack","poker","roulette","slots","plinko","crash","highlow","dice","craps","keno","baccarat","scratch"];
        const gp = updated.gamesPlayed || {};
        const allPlayed = allGameIds.every(id => (gp[id] || 0) > 0);
        if (allPlayed) { if (!ua.includes("played_all")) pendingAchievementsRef.current.push("played_all"); };
      }
      if (diff < 0 && currentGame && prev > chips) {
      }
      updated.netProfit = chips - 1000 - (updated.rebuys * 1000);
            if (chips >= 10000 && !ua.includes("bankroll_10k")) pendingAchievementsRef.current.push("bankroll_10k");
      if (chips >= 25000 && !ua.includes("bankroll_25k")) pendingAchievementsRef.current.push("bankroll_25k");
      if (chips >= 100000 && !ua.includes("bankroll_100k")) pendingAchievementsRef.current.push("bankroll_100k");
      if (chips >= 1000000 && !ua.includes("bankroll_1m")) pendingAchievementsRef.current.push("bankroll_1m");
      if (chips >= 10000000 && !ua.includes("bankroll_10m")) pendingAchievementsRef.current.push("bankroll_10m");
      if (chips >= 1000000000 && !ua.includes("bankroll_1b")) pendingAchievementsRef.current.push("bankroll_1b");
      return updated;
    });
  }, [chips, currentGame]);
  const selectGame = useCallback((gameId) => {
    setStats(s => ({
      ...s,
      gamesPlayed: { ...s.gamesPlayed, [gameId]: (s.gamesPlayed[gameId] || 0) + 1 }
    }));
    setTransitioning(true);
    pendingGameRef.current = gameId;
    setTimeout(() => {
      setCurrentGame(gameId);
      setTimeout(() => {
        setTransitioning(false);
        setTransitionFadeKey(k => k + 1);
        setTransitionFadeOut(true);
        setTimeout(() => setTransitionFadeOut(false), 450);
      }, 80);
    }, 300);
  }, []);
  const [showBusted, setShowBusted] = useState(false);
  const chipsRef = useRef(chips);
  chipsRef.current = chips;
  const showBustedRef = useRef(showBusted);
  showBustedRef.current = showBusted;
  const bustedTimerRef = useRef(null);
  useEffect(() => {
    if (chips > 0 && bustedTimerRef.current) {
      clearTimeout(bustedTimerRef.current);
      bustedTimerRef.current = null;
    }
  }, [chips]);
  const onRoundEnd = useCallback(() => {
    setSessionRounds(r => r + 1);
    if (bustedTimerRef.current) clearTimeout(bustedTimerRef.current);
    bustedTimerRef.current = setTimeout(() => {
      if (chipsRef.current <= 0 && !showBustedRef.current) setShowBusted(true);
      bustedTimerRef.current = null;
    }, 1500);
  }, []);
  const reportJackpot = useCallback(() => {
    const su = statsRef.current.secretUnlocks || [];
    if (!su.includes("jackpot_hit")) {
      setStats(prev => ({ ...prev, secretUnlocks: [...(prev.secretUnlocks || []), "jackpot_hit"] }));
      statsRef.current.secretUnlocks = [...su, "jackpot_hit"];
    }
    const ua = statsRef.current.achievements || [];
    if (!ua.includes("jackpot")) pendingAchievementsRef.current.push("jackpot");
  }, []);
  const handleRebuy = useCallback(() => {}, []);
  const doRebuy = useCallback(() => {
    const pts = calcVipPoints(statsRef.current);
    const achCount = (statsRef.current.achievements || []).length;
    const tier = getVipTier(pts, achCount);
    const rebuyAmount = tier.rebuy || 1000;
    setChips(rebuyAmount);
    prevChipsRef.current = rebuyAmount;
    setStats(s => ({ ...s, rebuys: s.rebuys + 1 }));
    setShowBusted(false);
  }, []);
  const startChipsRef = useRef(chips);
  const lastBetsRef = useRef({});
  useEffect(() => {
    if (currentGame) startChipsRef.current = chips;
  }, [currentGame]);
  const consumePowerUp = useCallback((itemId) => {
    setSettings(s => {
      const aps = (s.activePowerUps || []).map(p =>
        p.itemId === itemId ? { ...p, remaining: p.remaining - 1 } : p
      ).filter(p => p.remaining > 0);
      return { ...s, activePowerUps: aps };
    });
  }, []);
  const applyWin = useCallback((netWin) => {
    const aps = settingsRef.current?.activePowerUps || [];
    const pu = aps.find(p => p.type === 'winMulti');
    const finalWin = pu ? netWin * pu.multi : netWin;
    if (pu) consumePowerUp(pu.itemId);
    setChips(c => c + finalWin);
    return finalWin;
  }, [consumePowerUp]);
  const onBetPlaced = useCallback((betAmount) => {
    const aps = settingsRef.current?.activePowerUps || [];
    const pu = aps.find(p => p.type === 'vipMulti');
    if (!pu) return;
    const basePoints = Math.floor(betAmount / 500) + 2;
    const bonusPoints = basePoints * (pu.multi - 1);
    setStats(s => ({ ...s, vipBonusPoints: (s.vipBonusPoints || 0) + bonusPoints }));
    consumePowerUp(pu.itemId);
  }, [consumePowerUp]);
  const reportLoss = useCallback((betAmount = 0) => {
    const aps = settingsRef.current?.activePowerUps || [];
    const insurance = aps.find(p => p.type === 'insurance');
    const shield = !insurance && aps.find(p => p.type === 'shield');
    if (insurance) {
      setChips(c => c + betAmount);
      consumePowerUp(insurance.itemId);
    } else if (shield) {
      setChips(c => c + Math.floor(betAmount * shield.keep));
      consumePowerUp(shield.itemId);
    }
    setStats(s => {
      const lpg = { ...(s.lossesPerGame || {}) };
      if (currentGame) lpg[currentGame] = (lpg[currentGame] || 0) + 1;
      const rh = { ...(s.resultHistory || {}) };
      if (currentGame) rh[currentGame] = [...(rh[currentGame] || []), -1].slice(-20);
      const streakEligible = currentGame !== "slots" && currentGame !== "plinko";
      return {
        ...s,
        winStreak: streakEligible ? 0 : s.winStreak,
        lossStreak: streakEligible ? (s.lossStreak || 0) + 1 : s.lossStreak,
        lossesPerGame: lpg,
        resultHistory: rh,
      };
    });
  }, [currentGame, consumePowerUp]);
  useEffect(() => {
    const ls = statsRef.current.lossStreak || 0;
    const ua = statsRef.current.achievements || [];
    if (ls >= 10 && !ua.includes("loss_10")) {
      pendingAchievementsRef.current.push("loss_10");
    }
  });
  _themeAccent = getActiveTheme(settings.chipSkin).accent;
  _isRainbow = settings.chipSkin === "completionist";
  _isJackpotSkin = settings.chipSkin === "jackpot";
  _cardTint = getActiveTheme(settings.chipSkin).cardTint;
  const gameProps = {
    chips, setChips,
    onBack: () => { setTransitioning(true); pendingGameRef.current = null; setTimeout(() => { setCurrentGame(null); setTimeout(() => { setTransitioning(false); setTransitionFadeKey(k => k + 1); setTransitionFadeOut(true); setTimeout(() => setTransitionFadeOut(false), 450); }, 80); }, 300); },
    onRebuy: doRebuy,
    startChips: startChipsRef.current,
    lastBets: lastBetsRef.current,
    setLastBet: (game, amount) => { lastBetsRef.current[game] = amount; },
    winStreak: stats.winStreak || 0,
    vipPoints: calcVipPoints(stats),
    achCount: (stats.achievements || []).length,
    reportLoss,
    applyWin,
    onBetPlaced,
    consumePowerUp,
    reportJackpot,
    onRoundEnd,
    animSpeed: settings.animSpeed,
    theme: settings.theme || "dark",
    skinTheme: getActiveTheme(settings.chipSkin),
    skinAccent: getActiveTheme(settings.chipSkin).accent,
    skinId: settings.chipSkin || "house",
    activePowerUps: ((settings.activePowerUps || []).map(pu => {
      const item = SHOP_ITEMS.find(s => s.id === pu.itemId);
      return item ? { ...pu, item } : null;
    }).filter(Boolean)),
    skipOverlays: settings.skipOverlays,
    skipEffects: settings.skipEffects,
  };
  const handleResetStats = useCallback(() => {
    setChips(1000); prevChipsRef.current = 1000; setStats(INITIAL_STATS);
    if (usernameRef.current) {
      const key = `casino-save:${usernameRef.current.toLowerCase()}`;
      const save = JSON.stringify({ chips: 1000, stats: INITIAL_STATS, settings, displayName: usernameRef.current });
      window.storage?.set(key, save).catch(() => {});
    }
  }, []);
  return (
    <div className={`${settings.animSpeed === "fast" ? "anim-fast" : settings.animSpeed === "instant" ? "anim-instant" : ""}${(settings.theme || "dark") === "light" ? " theme-light" : ""}`}
      style={{ background:"#080604", minHeight:"100vh", overflowX:"hidden", maxWidth:"100vw",
        "--accent-gradient": `radial-gradient(circle, ${_themeAccent}, ${_themeAccent}cc)`,
        "--accent-light": `${_themeAccent}cc`,
        "--accent-glow": `${_themeAccent}80` }}>
      <style>{GLOBAL_STYLES}</style>
      <div style={{ background:"#080604", minHeight:"100vh", overflowX:"hidden" }}>
      {initialLoading ? (
        <div style={{ minHeight:"100vh", background:"#080604", display:"flex", alignItems:"center", justifyContent:"center",
          fontFamily:"Georgia, 'Times New Roman', serif", color:_themeAccent, fontSize:18, letterSpacing:3 }}>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:28, fontWeight:700, letterSpacing:6, marginBottom:12 }}>OBSIDIAN LOUNGE</div>
            <div style={{ fontSize:13, opacity:0.5, letterSpacing:2 }}>Loading...</div>
          </div>
        </div>
      ) : !username ? (
        <FirstTimePrompt onSignIn={handleSignIn} />
      ) : !loaded ? (
        <div style={{ minHeight:"100vh", background:"#080604", display:"flex", alignItems:"center", justifyContent:"center",
          fontFamily:"Georgia, 'Times New Roman', serif", color:_themeAccent, fontSize:13, letterSpacing:2, opacity:0.5 }}>
          Loading...
        </div>
      ) : (<>
      <div style={{ opacity: transitioning ? 0 : 1 }}>
      {currentGame===null && <TitleScreen chips={chips} onSelectGame={selectGame} onRebuy={handleRebuy} stats={stats}
        onResetStats={handleResetStats} username={username} onSignOut={handleSignOut}
        onAdminSetStats={setStats} onAdminSetChips={setChips}
        forceJackpot={forceJackpot} setForceJackpot={setForceJackpot}
        sessionStart={sessionStartRef.current} sessionRounds={sessionRounds}
        sessionChipsStart={sessionChipsStartRef.current === -1 ? chips : sessionChipsStartRef.current}
        settings={settings} setSettings={setSettings} />}
      {currentGame==="blackjack" && <BlackjackGame {...gameProps}/>}
      {currentGame==="poker" && <VideoPokerGame {...gameProps}/>}
      {currentGame==="roulette" && <RouletteGame {...gameProps}/>}
      {currentGame==="slots" && <SlotsGame {...gameProps}/>}
      {currentGame==="plinko" && <PlinkoGame {...gameProps}/>}
      {currentGame==="crash" && <CrashGame {...gameProps}/>}
      {currentGame==="highlow" && <HighLowGame {...gameProps}/>}
      {currentGame==="dice" && <DiceGame {...gameProps}/>}
      {currentGame==="craps" && <CrapsGame {...gameProps}/>}
      {currentGame==="keno" && <KenoGame {...gameProps}/>}
      {currentGame==="baccarat" && <BaccaratGame {...gameProps}/>}
      {currentGame==="scratch" && <ScratchCardGame {...gameProps} forceJackpot={forceJackpot} onForceJackpotUsed={() => setForceJackpot(false)} />}
      </div>
      </>)}
      {showBusted && !settings.skipOverlays && (() => {
        const pts = calcVipPoints(stats);
        const ac = (stats.achievements || []).length;
        const tier = getVipTier(pts, ac);
        return <BustedOverlay peakBalance={stats.peakBankroll || 1000} onRebuy={doRebuy} rebuys={stats.rebuys || 0} rebuyAmount={tier.rebuy || 1000} />;
      })()}
      {achievementToast && <AchievementToast achievement={achievementToast}
        onDone={() => { setAchievementToast(null); setTimeout(showNextAchievement, 300); }} />}
      </div>
      {}
      {transitioning && (
        <div style={{ position:"fixed", inset:0, zIndex:99999, background:"#080604",
          opacity:1, pointerEvents:"all" }} />
      )}
      {}
      {!transitioning && transitionFadeOut && (
        <div key={transitionFadeKey} style={{ position:"fixed", inset:0, zIndex:99998, background:"#080604",
          animation:"overlayFadeOut 0.4s ease forwards", pointerEvents:"none" }} />
      )}
    </div>
  );
}
