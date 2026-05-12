"use client";

import { useEffect, useState, useCallback } from "react";
import {
  bootstrapIfNeeded,
  getBalance,
  setBalance as setBalanceStore,
  addBalance,
  getDailyUsed,
  incrementDailyUsed,
  getInventory,
  getInventoryItems,
  getInventoryAggregated,
  recordOpening,
  getCooldownUntil,
  claimRefresh as claimRefreshStore,
  REFRESH_AMOUNT,
  sellCard as sellCardStore,
  sellItem as sellItemStore,
  sellAllCards as sellAllCardsStore,
  regradeItem as regradeItemStore,
  getProfile,
  setProfile as setProfileStore,
  resetAccount as resetAccountStore,
  type UserProfile,
} from "@/lib/data/game";
import { FREE_DAILY_LIMIT } from "@/data/packs";
import type { GameCard, Grade, OpeningResult } from "@/types/game";

const isClient = typeof window !== "undefined";

/**
 * Hook factory : s'abonne à un event custom et resync depuis un getter.
 * Lazy init pour éviter le flash SSR → CSR.
 */
function useStorageEvent<T>(eventName: string, read: () => T, fallback: T): T {
  const [state, setState] = useState<T>(() => (isClient ? read() : fallback));

  useEffect(() => {
    setState(read());
    const handler = () => setState(read());
    window.addEventListener(eventName, handler);
    return () => window.removeEventListener(eventName, handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventName]);

  return state;
}

// ── Bootstrap ───────────────────────────────────────────────────────────
export function useBootstrap() {
  const [bootstrapped, setBootstrapped] = useState(false);
  useEffect(() => {
    setBootstrapped(bootstrapIfNeeded().bootstrapped);
  }, []);
  return bootstrapped;
}

// ── Balance ─────────────────────────────────────────────────────────────
export function useBalance() {
  // Fallback sur getBalance() si l'event arrive sans detail valide
  const balance = useStorageEvent("gf:balance-changed", getBalance, 0);
  const update = useCallback((amount: number) => setBalanceStore(amount), []);
  const add = useCallback((delta: number) => addBalance(delta), []);
  return { balance, setBalance: update, addBalance: add };
}

// ── Daily Openings ──────────────────────────────────────────────────────
export function useDailyOpenings() {
  const used = useStorageEvent("gf:daily-changed", getDailyUsed, 0);
  const limit = FREE_DAILY_LIMIT;
  const remaining = Math.max(0, limit - used);
  // Guard division par zéro
  const pct = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;
  const consume = useCallback(() => incrementDailyUsed(), []);
  return { used, limit, remaining, pct, consume };
}

// ── Inventory ───────────────────────────────────────────────────────────
// API legacy (par carte agrégée) — composants qui n'affichent pas le grade
export function useInventory() {
  const items = useStorageEvent("gf:inventory-changed", getInventory, []);
  // Total value : on lit les instances pour avoir le vrai prix par grade,
  // pas le `card.value` (qui est uniquement le Raw).
  const totalValue = useStorageEvent(
    "gf:inventory-changed",
    () => getInventoryItems().reduce((s, it) => s + it.price, 0),
    0,
  );
  const count = items.reduce((s, e) => s + e.count, 0);
  return { items, totalValue: parseFloat(totalValue.toFixed(2)), count };
}

// Nouveau hook : retourne les instances graded séparément (1 ligne par grade)
export function useInventoryGraded() {
  const entries = useStorageEvent(
    "gf:inventory-changed",
    getInventoryAggregated,
    [],
  );
  const items = useStorageEvent("gf:inventory-changed", getInventoryItems, []);
  const totalValue = parseFloat(
    items.reduce((s, it) => s + it.price, 0).toFixed(2),
  );
  return { entries, items, totalValue, count: items.length };
}

// ── Open Pack ───────────────────────────────────────────────────────────
export function useOpenPack() {
  return useCallback(
    (
      packId: string,
      card: GameCard,
      grade: Grade,
      price: number,
      costPaid: number,
      wasFree: boolean,
    ): OpeningResult => {
      if (wasFree) {
        incrementDailyUsed();
      } else if (getBalance() >= costPaid) {
        addBalance(-costPaid);
      }
      return recordOpening(packId, card, grade, price);
    },
    [],
  );
}

// ── Cooldown ────────────────────────────────────────────────────────────
export function useCooldown() {
  const until = useStorageEvent("gf:cooldown-changed", getCooldownUntil, null);
  const [now, setNow] = useState<number>(() => Date.now());

  // Tick chaque seconde UNIQUEMENT si un cooldown est actif
  useEffect(() => {
    if (until === null) return;
    setNow(Date.now());
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tick);
  }, [until]);

  const active = until !== null && until > now;
  const remainingMs = active && until ? until - now : 0;
  const hours = Math.floor(remainingMs / 3600000);
  const minutes = Math.floor((remainingMs % 3600000) / 60000);
  const seconds = Math.floor((remainingMs % 60000) / 1000);

  const claim = useCallback(() => claimRefreshStore(), []);

  return {
    active,
    until,
    remainingMs,
    hours,
    minutes,
    seconds,
    label: `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`,
    canClaim: until !== null && until <= now,
    refreshAmount: REFRESH_AMOUNT,
    claim,
  };
}

// ── Sell ────────────────────────────────────────────────────────────────
export function useSellCard() {
  return useCallback(
    (cardId: string, qty = 1) => sellCardStore(cardId, qty),
    [],
  );
}

// Nouveau : vente d'une instance précise (PSA 9 distinct d'un autre PSA 9)
export function useSellItem() {
  return useCallback((itemId: string) => sellItemStore(itemId), []);
}

export function useSellAllCards() {
  return useCallback(() => sellAllCardsStore(), []);
}

// ── Regrade ─────────────────────────────────────────────────────────────
export function useRegradeItem() {
  return useCallback(
    (itemId: string, pack: Parameters<typeof regradeItemStore>[1]) =>
      regradeItemStore(itemId, pack),
    [],
  );
}

// ── Profil ──────────────────────────────────────────────────────────────
const DEFAULT_PROFILE: UserProfile = {
  username: "",
  avatarColor: "#2A7DFF",
  createdAt: "",
};

export function useProfile() {
  const profile = useStorageEvent(
    "gf:profile-changed",
    getProfile,
    DEFAULT_PROFILE,
  );
  const update = useCallback(
    (patch: Partial<UserProfile>) => setProfileStore(patch),
    [],
  );
  const reset = useCallback(() => resetAccountStore(), []);
  return { profile, updateProfile: update, resetAccount: reset };
}
