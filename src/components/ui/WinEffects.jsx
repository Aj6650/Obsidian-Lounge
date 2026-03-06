import React, { useState, useCallback, useRef } from 'react';
import { useScreenShake, actionBtnStyle } from './ActionButton.jsx';
import { useFloatingWins, FloatingWins } from './FloatingWins.jsx';
import { useCoinRain, CoinRain } from './CoinRain.jsx';
import { useScreenColorWash, ScreenColorWash } from './ScreenColorWash.jsx';
import { useConfetti, ConfettiCanvas } from './ConfettiCanvas.jsx';
import { useChipEruption, ChipEruption } from './ChipEruption.jsx';
import { useEdgeLights } from './EdgeLights.jsx';
import { BigWinOverlay } from './BigWinOverlay.jsx';

export function useWinEffects() {
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
