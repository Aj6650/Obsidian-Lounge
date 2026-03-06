import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase.js';
import { theme } from './theme-globals.js';
import { GLOBAL_STYLES, T, S, FELT_BG, DARK_BG } from './constants/styles.js';
import { CHIP_SKINS, INSANE_ACHS, isSkinUnlocked, getUnlockedSkins, getChipSkin, SKIN_THEMES, getActiveTheme } from './constants/chips.js';
import { VIP_TIERS, VAULT_YEAR_THRESHOLDS, ACH_POINTS, calcVipPoints, getVipTier, getNextVipTier } from './constants/vip.js';
import { ACHIEVEMENTS } from './constants/achievements.js';
import { SHOP_ITEMS, MYSTERY_DROP_RATES, RARITY_COLORS, SHOP_CATEGORIES } from './constants/shop.js';
import { AmbientParticles } from './components/ui/AmbientParticles.jsx';
import { FloatingWins } from './components/ui/FloatingWins.jsx';
import { ScreenColorWash } from './components/ui/ScreenColorWash.jsx';
import { CoinRain } from './components/ui/CoinRain.jsx';
import { ConfettiCanvas } from './components/ui/ConfettiCanvas.jsx';
import { ChipEruption } from './components/ui/ChipEruption.jsx';
import { BigWinOverlay } from './components/ui/BigWinOverlay.jsx';
import { AnimatedChips } from './components/ui/AnimatedChips.jsx';
import { StreakIndicator } from './components/ui/StreakIndicator.jsx';
import { AchievementToast } from './components/ui/AchievementToast.jsx';
import { NearMissFlash } from './components/ui/NearMissFlash.jsx';
import { JackpotOverlay } from './components/ui/JackpotOverlay.jsx';
import { BustedOverlay } from './components/ui/BustedOverlay.jsx';
import { ChipStackVisual } from './components/ui/ChipStackVisual.jsx';
import { EdgeLights } from './components/ui/EdgeLights.jsx';
import { useWinEffects } from './components/ui/WinEffects.jsx';
import { LightningBolts } from './components/ui/LightningBolts.jsx';
import { ChipSkinEffect } from './components/ui/ChipSkinEffect.jsx';
import { ChipSkinModal } from './components/ui/ChipSkinModal.jsx';
import { PokerChipIcon } from './components/ui/PokerChipIcon.jsx';
import { BankrollDisplay } from './components/ui/BankrollDisplay.jsx';
import { VipDetailsModal } from './components/ui/VipDetailsModal.jsx';
import { BackButton } from './components/ui/BackButton.jsx';
import { GoldButton } from './components/ui/GoldButton.jsx';
import { BetControls } from './components/ui/BetControls.jsx';
import { Card } from './components/ui/Card.jsx';
import { SessionTracker } from './components/ui/SessionTracker.jsx';
import { StatCard } from './components/ui/StatCard.jsx';
import { Sparkline } from './components/ui/Sparkline.jsx';
import { GameShell } from './components/GameShell.jsx';
import { TitleScreen } from './components/TitleScreen.jsx';
import { AuthScreen } from './components/AuthScreen.jsx';
import { BlackjackGame } from './components/games/BlackjackGame.jsx';
import { VideoPokerGame } from './components/games/VideoPokerGame.jsx';
import { RouletteGame } from './components/games/RouletteGame.jsx';
import { SlotsGame } from './components/games/SlotsGame.jsx';
import { PlinkoGame } from './components/games/PlinkoGame.jsx';
import { CrashGame } from './components/games/CrashGame.jsx';
import { HighLowGame } from './components/games/HighLowGame.jsx';
import { DiceGame } from './components/games/DiceGame.jsx';
import { CrapsGame } from './components/games/CrapsGame.jsx';
import { KenoGame } from './components/games/KenoGame.jsx';
import { BaccaratGame } from './components/games/BaccaratGame.jsx';
import { ScratchCardGame } from './components/games/ScratchCardGame.jsx';

const INITIAL_STATS = {
  peakBankroll: 1000,
  biggestWin: 0,
  biggestWinGame: null,
  totalWagered: 0,
  rebuys: 0,
  totalRebuySpend: 0,
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
  // Vault
  vault: 0,
  vaultWageredThisCycle: 0,
  interestCycleNumber: 0,
  interestHistory: [],
  thisYearStats: { wagered:0, wins:0, netPL:0, rebuys:0 },
  totalVaulted: 0,
  totalInterestEarned: 0,
  vaultLosses: 0,
  // VIP
  vipPenaltyPoints: 0,
  // Debt
  totalDebt: 0,
  totalDebtIncurred: 0,
  rebuyCount: 0,
  debtAutoRepay: false,
};
export default function Casino() {
  const [username, setUsername] = useState(null);
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
  const firebaseUserRef = useRef(null);
  const isGuestRef = useRef(false);
  const saveDebounceRef = useRef(null);
  const firstAuthCheckRef = useRef(true);
  const [achievementToast, setAchievementToast] = useState(null);
  const achievementQueueRef = useRef([]);
  const pendingAchievementsRef = useRef([]);
  const [interestToast, setInterestToast] = useState(null);
  const [demotionToast, setDemotionToast] = useState(null);
  const [forceJackpot, setForceJackpot] = useState(false);
  const sessionStartRef = useRef(Date.now());
  const [sessionRounds, setSessionRounds] = useState(0);
  const sessionChipsStartRef = useRef(-1);
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
  // Hydrate state from a save object and enter the game with a transition
  const enterGame = useCallback((displayName, saveData, { instant = false } = {}) => {
    if (saveData) {
      if (saveData.chips != null) { setChips(saveData.chips); prevChipsRef.current = saveData.chips; }
      if (saveData.stats) {
        setStats(s => ({
          ...INITIAL_STATS, ...s, ...saveData.stats,
          gamesPlayed: { ...INITIAL_STATS.gamesPlayed, ...(saveData.stats.gamesPlayed || {}) },
          biggestWinPerGame: { ...INITIAL_STATS.biggestWinPerGame, ...(saveData.stats.biggestWinPerGame || {}) },
          winsPerGame: { ...INITIAL_STATS.winsPerGame, ...(saveData.stats.winsPerGame || {}) },
          lossesPerGame: { ...INITIAL_STATS.lossesPerGame, ...(saveData.stats.lossesPerGame || {}) },
          profitPerGame: { ...INITIAL_STATS.profitPerGame, ...(saveData.stats.profitPerGame || {}) },
          resultHistory: { ...INITIAL_STATS.resultHistory, ...(saveData.stats.resultHistory || {}) },
        }));
      }
      if (saveData.settings) setSettings(s => ({ ...s, ...saveData.settings }));
    }
    usernameRef.current = displayName;
    sessionStartRef.current = Date.now();
    setSessionRounds(0);
    if (instant) {
      setUsername(displayName);
      setLoaded(true);
    } else {
      setTransitioning(true);
      setTimeout(() => {
        setUsername(displayName);
        setLoaded(true);
        setTimeout(() => {
          setTransitioning(false);
          setTransitionFadeKey(k => k + 1);
          setTransitionFadeOut(true);
          setTimeout(() => setTransitionFadeOut(false), 450);
        }, 80);
      }, 350);
    }
  }, []);

  const handleGuestPlay = useCallback(() => {
    isGuestRef.current = true;
    let saveData = null;
    try {
      const saved = localStorage.getItem('casinoGuestSave');
      if (saved) saveData = JSON.parse(saved);
    } catch (e) {}
    enterGame('Guest', saveData, { instant: false });
  }, [enterGame]);

  const handleSignOut = useCallback(async () => {
    if (saveDebounceRef.current) clearTimeout(saveDebounceRef.current);
    if (firebaseUserRef.current) {
      await signOut(auth).catch(() => {});
    }
    firebaseUserRef.current = null;
    isGuestRef.current = false;
    setUsername(null);
    setCurrentGame(null);
    setChips(1000);
    setStats(INITIAL_STATS);
    setSettings({ animSpeed: 'normal', theme: 'dark', skipOverlays: false, skipEffects: false, chipSkin: 'house' });
    prevChipsRef.current = 1000;
    setLoaded(false);
  }, []);

  // Firebase auth state listener — fires once on load, then on sign-in/out
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      const isFirst = firstAuthCheckRef.current;
      firstAuthCheckRef.current = false;
      firebaseUserRef.current = user;
      if (user) {
        isGuestRef.current = false;
        try {
          const snap = await getDoc(doc(db, 'users', user.uid));
          const saveData = snap.exists() ? snap.data() : null;
          const displayName = user.displayName || user.email?.split('@')[0] || 'Player';
          enterGame(displayName, saveData, { instant: isFirst });
        } catch (e) {
          enterGame(user.displayName || 'Player', null, { instant: isFirst });
        }
      }
      setInitialLoading(false);
    });
    return () => unsub();
  }, [enterGame]);

  useEffect(() => {
    if (loaded && sessionChipsStartRef.current === -1) sessionChipsStartRef.current = chips;
  }, [loaded, chips]);

  // Debounced save — Firestore for auth users, localStorage for guests
  useEffect(() => {
    if (!loaded) return;
    if (saveDebounceRef.current) clearTimeout(saveDebounceRef.current);
    saveDebounceRef.current = setTimeout(() => {
      const user = firebaseUserRef.current;
      if (user && !isGuestRef.current) {
        setDoc(doc(db, 'users', user.uid), {
          schemaVersion: 1, chips, stats, settings, savedAt: serverTimestamp(),
        }).catch(() => {});
      } else if (isGuestRef.current) {
        try { localStorage.setItem('casinoGuestSave', JSON.stringify({ chips, stats, settings })); } catch (e) {}
      }
    }, 1000);
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
      }
      const allGameIds = ["blackjack","poker","roulette","slots","plinko","crash","highlow","dice","craps","keno","baccarat","scratch"];
      const gp = updated.gamesPlayed || {};
      const allPlayed = allGameIds.every(id => (gp[id] || 0) > 0);
      if (allPlayed) { if (!ua.includes("played_all")) pendingAchievementsRef.current.push("played_all"); };
      updated.netProfit = chips - 1000 - (updated.totalRebuySpend || 0);
      // Track thisYearStats net P&L and wins
      if (currentGame && diff !== 0) {
        const tys = { ...(updated.thisYearStats || {}) };
        tys.netPL = (tys.netPL || 0) + diff;
        if (diff > 0) tys.wins = (tys.wins || 0) + 1;
        updated.thisYearStats = tys;
      }
      // Bust vault penalty: burn % of vault + 10% VIP pts when chips reach 0
      if (chips <= 0 && (updated.vault || 0) > 0) {
        const guardAps = settingsRef.current?.activePowerUps || [];
        const vaultGuard = guardAps.find(p => p.type === "vaultGuard");
        const burnRate = vaultGuard ? vaultGuard.reduceTo : 0.35;
        if (vaultGuard) consumePowerUp(vaultGuard.itemId);
        const vaultLoss = Math.floor((updated.vault || 0) * burnRate);
        const currentVipPts = calcVipPoints(updated);
        const oldTier = getVipTier(currentVipPts, ua.length);
        const vipLoss = Math.floor(currentVipPts * 0.10);
        updated.vault = Math.max(0, (updated.vault || 0) - vaultLoss);
        updated.vaultLosses = (updated.vaultLosses || 0) + vaultLoss;
        updated.vipPenaltyPoints = (updated.vipPenaltyPoints || 0) + vipLoss;
        if (!ua.includes("vault_bust")) pendingAchievementsRef.current.push("vault_bust");
        const newVipPts = calcVipPoints(updated);
        const newTier = getVipTier(newVipPts, ua.length);
        if (newTier.id !== oldTier.id) {
          setDemotionToast(`VIP TIER LOST — demoted to ${newTier.label}`);
          setTimeout(() => setDemotionToast(null), 5000);
        }
      }
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
    setStats(s => {
      const newRebuys = (s.rebuys || 0) + 1;
      const newRebuyCount = (s.rebuyCount || 0) + 1;
      const ua = s.achievements || [];
      if (newRebuys >= 100 && !ua.includes("rebuy_100")) {
        pendingAchievementsRef.current.push("rebuy_100");
      }
      return {
        ...s,
        rebuys: newRebuys,
        rebuyCount: newRebuyCount,
        winStreak: 0,
        lossStreak: 0,
        totalRebuySpend: (s.totalRebuySpend || 0) + rebuyAmount,
        totalDebt: (s.totalDebt || 0) + rebuyAmount,
        totalDebtIncurred: (s.totalDebtIncurred || 0) + rebuyAmount,
        thisYearStats: { ...(s.thisYearStats || {}), rebuys: ((s.thisYearStats || {}).rebuys || 0) + 1 },
      };
    });
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
    const s = statsRef.current;
    let debtRepay = 0;
    if ((s.totalDebt || 0) > 0 && (s.rebuyCount || 0) >= 3) {
      debtRepay = Math.min(Math.floor(finalWin * 0.10), s.totalDebt);
    }
    if (debtRepay > 0) {
      if (debtRepay >= s.totalDebt) {
        const ua = s.achievements || [];
        if (!ua.includes("debt_cleared")) pendingAchievementsRef.current.push("debt_cleared");
      }
      setStats(st => ({ ...st, totalDebt: Math.max(0, (st.totalDebt || 0) - debtRepay) }));
    }
    setChips(c => c + (finalWin - debtRepay));
    return finalWin;
  }, [consumePowerUp]);
  const applyChipsReturn = useCallback((amount) => {
    if (amount <= 0) return;
    prevChipsRef.current += amount;
    setChips(c => c + amount);
  }, []);
  const onBetPlaced = useCallback((betAmount) => {
    // VIP multi bonus points
    const aps = settingsRef.current?.activePowerUps || [];
    const pu = aps.find(p => p.type === 'vipMulti');
    if (pu) {
      const basePoints = Math.floor(betAmount / 500) + 2;
      const bonusPoints = basePoints * (pu.multi - 1);
      setStats(s => ({ ...s, vipBonusPoints: (s.vipBonusPoints || 0) + bonusPoints }));
      consumePowerUp(pu.itemId);
    }
    // Hard Debt: 2% of each bet auto-repays debt
    const cur = statsRef.current;
    if ((cur.totalDebt || 0) > 0 && (cur.rebuyCount || 0) >= 3) {
      const wagerRepay = Math.min(Math.floor(betAmount * 0.02), cur.totalDebt);
      if (wagerRepay > 0) {
        if (wagerRepay >= cur.totalDebt) {
          const ua = cur.achievements || [];
          if (!ua.includes("debt_cleared")) pendingAchievementsRef.current.push("debt_cleared");
        }
        setStats(s => ({ ...s, totalDebt: Math.max(0, (s.totalDebt || 0) - wagerRepay) }));
      }
    }
    // Interest cycle tracking
    const newCycleWagered = (cur.vaultWageredThisCycle || 0) + betAmount;
    const pts = calcVipPoints(cur);
    const tier = getVipTier(pts, (cur.achievements || []).length);
    const threshold = VAULT_YEAR_THRESHOLDS[tier.id] || 100000;
    const vaultBal = cur.vault || 0;
    if (newCycleWagered >= threshold && vaultBal > 0) {
      const baseInterest = Math.min(Math.floor(vaultBal * 0.10), threshold);
      const catalyst = aps.find(p => p.type === "interestCatalyst");
      const interest = Math.floor(baseInterest * (catalyst ? catalyst.multi : 1));
      if (catalyst) consumePowerUp(catalyst.itemId);
      const ua = cur.achievements || [];
      if (!ua.includes("interest_first")) pendingAchievementsRef.current.push("interest_first");
      const newVaultBal = (cur.vault || 0) + interest;
      if (newVaultBal >= 10000 && !ua.includes("vault_10k")) pendingAchievementsRef.current.push("vault_10k");
      if (newVaultBal >= 1000000 && !ua.includes("vault_1m")) pendingAchievementsRef.current.push("vault_1m");
      if (newVaultBal >= 100000000 && !ua.includes("vault_100m")) pendingAchievementsRef.current.push("vault_100m");
      const nextCycleNum = (cur.interestCycleNumber || 0) + 1;
      if (nextCycleNum >= 10 && !ua.includes("interest_10")) pendingAchievementsRef.current.push("interest_10");
      setStats(s => ({
        ...s,
        vault: (s.vault || 0) + interest,
        totalInterestEarned: (s.totalInterestEarned || 0) + interest,
        vaultWageredThisCycle: newCycleWagered - threshold,
        interestCycleNumber: (s.interestCycleNumber || 0) + 1,
        interestHistory: (() => {
          const raw = [...(s.interestHistory || []), { year: (s.interestCycleNumber || 0) + 1, interest, ...(s.thisYearStats || {}) }];
          return raw.length > 50 ? [...raw.slice(0, 10), ...raw.slice(-10)] : raw;
        })(),
        thisYearStats: { wagered: betAmount, wins: 0, netPL: 0, rebuys: 0 },
      }));
      setInterestToast(interest);
      setTimeout(() => setInterestToast(null), 5000);
    } else {
      setStats(s => ({
        ...s,
        vaultWageredThisCycle: newCycleWagered,
        thisYearStats: { ...(s.thisYearStats || {}), wagered: ((s.thisYearStats || {}).wagered || 0) + betAmount },
      }));
    }
  }, [consumePowerUp]);
  const reportLoss = useCallback((betAmount = 0) => {
    const aps = settingsRef.current?.activePowerUps || [];
    const insurance = aps.find(p => p.type === 'insurance');
    const shield = !insurance && aps.find(p => p.type === 'shield');
    const streakGuard = aps.find(p => p.type === 'streakShield');
    if (insurance) {
      prevChipsRef.current += betAmount;
      setChips(c => c + betAmount);
      consumePowerUp(insurance.itemId);
    } else if (shield) {
      const shieldRefund = Math.floor(betAmount * shield.keep);
      prevChipsRef.current += shieldRefund;
      setChips(c => c + shieldRefund);
      consumePowerUp(shield.itemId);
    }
    const streakEligible = currentGame !== "slots" && currentGame !== "plinko";
    const currentWinStreak = statsRef.current?.winStreak || 0;
    const shielded = streakGuard && streakEligible && currentWinStreak > 0;
    if (shielded) consumePowerUp(streakGuard.itemId);
    setStats(s => {
      const lpg = { ...(s.lossesPerGame || {}) };
      if (currentGame) lpg[currentGame] = (lpg[currentGame] || 0) + 1;
      const rh = { ...(s.resultHistory || {}) };
      if (currentGame) rh[currentGame] = [...(rh[currentGame] || []), -1].slice(-20);
      return {
        ...s,
        winStreak: (streakEligible && !shielded) ? 0 : s.winStreak,
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
  const doVaultDeposit = useCallback((amount) => {
    const dep = Math.floor(amount);
    const maxDep = chipsRef.current - 1000;
    if (dep <= 0 || dep > maxDep) return;
    if ((statsRef.current.rebuyCount || 0) >= 3 && (statsRef.current.totalDebt || 0) > 0) return;
    prevChipsRef.current -= dep;
    setChips(c => c - dep);
    const newVault = (statsRef.current.vault || 0) + dep;
    const ua = statsRef.current.achievements || [];
    if (!ua.includes("vault_first")) pendingAchievementsRef.current.push("vault_first");
    if (newVault >= 10000 && !ua.includes("vault_10k")) pendingAchievementsRef.current.push("vault_10k");
    if (newVault >= 1000000 && !ua.includes("vault_1m")) pendingAchievementsRef.current.push("vault_1m");
    if (newVault >= 100000000 && !ua.includes("vault_100m")) pendingAchievementsRef.current.push("vault_100m");
    setStats(s => ({ ...s, vault: (s.vault || 0) + dep, totalVaulted: (s.totalVaulted || 0) + dep }));
  }, []);
  const doVaultWithdraw = useCallback((amount) => {
    const wd = Math.floor(amount);
    const vaultBal = statsRef.current.vault || 0;
    if (wd <= 0 || wd > vaultBal) return;
    const fee = Math.floor(wd * 0.08);
    const received = wd - fee;
    prevChipsRef.current += received;
    setChips(c => c + received);
    setStats(s => ({ ...s, vault: Math.max(0, (s.vault || 0) - wd) }));
  }, []);
  const doVaultRepayDebt = useCallback((amount) => {
    const vaultBal = statsRef.current.vault || 0;
    const debt = statsRef.current.totalDebt || 0;
    const pay = Math.min(Math.floor(amount), vaultBal, debt);
    if (pay <= 0) return;
    if (debt - pay <= 0) {
      const ua = statsRef.current.achievements || [];
      if (!ua.includes("debt_cleared")) pendingAchievementsRef.current.push("debt_cleared");
    }
    setStats(s => ({
      ...s,
      vault: Math.max(0, (s.vault || 0) - pay),
      totalDebt: Math.max(0, (s.totalDebt || 0) - pay),
    }));
  }, []);
  const doWithdrawFromVault = useCallback(() => {
    const vaultBal = statsRef.current.vault || 0;
    if (vaultBal <= 0) return;
    prevChipsRef.current = vaultBal;
    setChips(vaultBal);
    setStats(s => ({ ...s, vault: 0 }));
    setShowBusted(false);
  }, []);
  theme.accent = getActiveTheme(settings.chipSkin).accent;
  theme.isRainbow = settings.chipSkin === "completionist";
  theme.isJackpotSkin = settings.chipSkin === "jackpot";
  theme.cardTint = getActiveTheme(settings.chipSkin).cardTint;
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
    applyChipsReturn,
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
    const user = firebaseUserRef.current;
    if (user && !isGuestRef.current) {
      setDoc(doc(db, 'users', user.uid), {
        schemaVersion: 1, chips: 1000, stats: INITIAL_STATS, settings, savedAt: serverTimestamp(),
      }).catch(() => {});
    } else if (isGuestRef.current) {
      try { localStorage.setItem('casinoGuestSave', JSON.stringify({ chips: 1000, stats: INITIAL_STATS, settings })); } catch (e) {}
    }
  }, [settings]);
  return (
    <div className={`${settings.animSpeed === "fast" ? "anim-fast" : settings.animSpeed === "instant" ? "anim-instant" : ""}${(settings.theme || "dark") === "light" ? " theme-light" : ""}`}
      style={{ background:"#080604", minHeight:"100vh", overflowX:"hidden", maxWidth:"100vw",
        "--accent-gradient": `radial-gradient(circle, ${theme.accent}, ${theme.accent}cc)`,
        "--accent-light": `${theme.accent}cc`,
        "--accent-glow": `${theme.accent}80` }}>
      <style>{GLOBAL_STYLES}</style>
      <div style={{ background:"#080604", minHeight:"100vh", overflowX:"hidden" }}>
      {initialLoading ? (
        <div style={{ minHeight:"100vh", background:"#080604", display:"flex", alignItems:"center", justifyContent:"center",
          fontFamily:"Georgia, 'Times New Roman', serif", color:theme.accent, fontSize:18, letterSpacing:3 }}>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:28, fontWeight:700, letterSpacing:6, marginBottom:12 }}>OBSIDIAN LOUNGE</div>
            <div style={{ fontSize:13, opacity:0.5, letterSpacing:2 }}>Loading...</div>
          </div>
        </div>
      ) : !username ? (
        <AuthScreen onGuestPlay={handleGuestPlay} />
      ) : !loaded ? (
        <div style={{ minHeight:"100vh", background:"#080604", display:"flex", alignItems:"center", justifyContent:"center",
          fontFamily:"Georgia, 'Times New Roman', serif", color:theme.accent, fontSize:13, letterSpacing:2, opacity:0.5 }}>
          Loading...
        </div>
      ) : (<>
      <div style={{ opacity: transitioning ? 0 : 1 }}>
      {currentGame===null && <TitleScreen chips={chips} onSelectGame={selectGame} onRebuy={handleRebuy} stats={stats}
        onResetStats={handleResetStats} username={username} onSignOut={handleSignOut}
        isGuest={isGuestRef.current} userEmail={firebaseUserRef.current?.email || null}
        onAdminSetStats={setStats} onAdminSetChips={setChips}
        forceJackpot={forceJackpot} setForceJackpot={setForceJackpot}
        sessionStart={sessionStartRef.current} sessionRounds={sessionRounds}
        sessionChipsStart={sessionChipsStartRef.current === -1 ? chips : sessionChipsStartRef.current}
        settings={settings} setSettings={setSettings}
        onVaultDeposit={doVaultDeposit} onVaultWithdraw={doVaultWithdraw} onVaultRepayDebt={doVaultRepayDebt} />}
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
        return <BustedOverlay peakBalance={stats.peakBankroll || 1000} onRebuy={doRebuy} rebuys={stats.rebuys || 0} rebuyAmount={tier.rebuy || 1000} vaultBalance={stats.vault || 0} onWithdrawFromVault={doWithdrawFromVault} totalDebt={stats.totalDebt || 0} rebuyCount={stats.rebuyCount || 0} />;
      })()}
      {interestToast != null && (
        <div key={interestToast} style={{
          position:"fixed", bottom:80, right:16, zIndex:10020,
          background:"linear-gradient(135deg, rgba(212,175,55,0.2), rgba(212,175,55,0.08))",
          border:"1px solid rgba(212,175,55,0.5)", borderRadius:12,
          padding:"12px 18px", fontFamily:T.mono, color:"#d4af37",
          boxShadow:"0 0 24px rgba(212,175,55,0.25)",
          animation:"toastSlide 5s ease forwards",
        }}>
          <div style={{ fontSize:10, letterSpacing:2, textTransform:"uppercase", opacity:0.7, marginBottom:3 }}>VAULT INTEREST PAID</div>
          <div style={{ fontSize:18, fontWeight:900 }}>+${interestToast.toLocaleString()}</div>
        </div>
      )}
      {demotionToast && (
        <div key={demotionToast} style={{
          position:"fixed", bottom:140, right:16, zIndex:10020,
          background:"linear-gradient(135deg, rgba(200,50,50,0.2), rgba(200,50,50,0.08))",
          border:"1px solid rgba(200,50,50,0.5)", borderRadius:12,
          padding:"12px 18px", fontFamily:T.mono, color:"#f87171",
          boxShadow:"0 0 24px rgba(200,50,50,0.25)",
          animation:"toastSlide 5s ease forwards",
        }}>
          <div style={{ fontSize:10, letterSpacing:2, textTransform:"uppercase", opacity:0.7, marginBottom:3 }}>VIP STATUS CHANGE</div>
          <div style={{ fontSize:14, fontWeight:700 }}>{demotionToast}</div>
        </div>
      )}
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

