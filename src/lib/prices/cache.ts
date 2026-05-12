// Cache mémoire des prix marché.
// Pourquoi : un appel API externe par ouverture de caisse est inacceptable
// (latence + coût). On charge en mémoire au boot (et toutes les N minutes)
// depuis la table `card_grade_prices` qui est elle-même alimentée par le
// cron `sync-card-grade-prices`.

import type { Grade } from "@/types/game";

type GradePriceMap = Partial<Record<Grade, number>>;

interface CacheState {
  table: Record<string, GradePriceMap>;
  lastRefreshAt: number;
}

const state: CacheState = {
  table: {},
  lastRefreshAt: 0,
};

const STALE_AFTER_MS = 5 * 60 * 1000; // 5 minutes

export function setCacheTable(table: Record<string, GradePriceMap>): void {
  state.table = table;
  state.lastRefreshAt = Date.now();
}

/** Lookup direct, retourne null si la carte ou le grade n'est pas en cache. */
export function getCachedPrice(cardId: string, grade: Grade): number | null {
  const card = state.table[cardId];
  if (!card) return null;
  const price = card[grade];
  return typeof price === "number" ? price : null;
}

/** Vrai si le cache n'a pas été rafraîchi depuis 5 min. */
export function isCacheStale(): boolean {
  return Date.now() - state.lastRefreshAt > STALE_AFTER_MS;
}

/**
 * Helper test : remplit le cache directement (utile pour les unit tests
 * du moteur de drop, sans devoir mocker fetch).
 */
export function seedCacheForTest(table: Record<string, GradePriceMap>): void {
  setCacheTable(table);
}

/** Vide tout. */
export function clearCache(): void {
  state.table = {};
  state.lastRefreshAt = 0;
}
