// Persistance locale (LocalStorage) — sera remplacée par Supabase plus tard
// Pour l'instant, mode démo : tout est stocké côté client.

import type {
  GameCard,
  Grade,
  InventoryItem,
  OpeningResult,
  Pack,
  RegradeResult,
} from "@/types/game";
import { REGRADE_COST_USD } from "@/types/game";
import {
  STARTING_BALANCE,
  FREE_DAILY_LIMIT,
  priceForGrade,
  rollGrade,
} from "@/data/packs";

const KEY_BALANCE = "gf:balance";
const KEY_DAILY = "gf:daily";
const KEY_INVENTORY = "gf:inventory"; // v1 (legacy, count-based)
const KEY_INVENTORY_V2 = "gf:inventory.v2"; // v2 (per-instance, graded)
const KEY_BOOTSTRAPPED = "gf:bootstrapped";
const KEY_COOLDOWN = "gf:cooldown-until";

// Cooldown de 2h quand solde = 0, puis on offre $5 pour rejouer
export const COOLDOWN_MS = 2 * 60 * 60 * 1000; // 2 heures
export const REFRESH_AMOUNT = 5.0;

interface DailyState {
  used: number;
  date: string; // YYYY-MM-DD
}

// ── Legacy (v1) — conservé pour la migration une seule fois au bootstrap ──
interface InventoryEntryLegacy {
  card: GameCard;
  count: number;
  firstAcquiredAt: string;
}

function genId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto)
    return crypto.randomUUID();
  return `it_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

/** Migre l'inventaire v1 (count, sans grade) vers v2 (instances graded raw). */
function migrateInventoryV1ToV2(): void {
  if (typeof window === "undefined") return;
  const raw = localStorage.getItem(KEY_INVENTORY);
  if (!raw) return;
  try {
    const legacy = JSON.parse(raw) as InventoryEntryLegacy[];
    const items: InventoryItem[] = [];
    for (const e of legacy) {
      for (let i = 0; i < e.count; i++) {
        items.push({
          id: genId(),
          card: e.card,
          grade: "raw",
          price: e.card.value,
          acquiredAt: e.firstAcquiredAt,
          acquiredFrom: "pack",
          isLocked: false,
        });
      }
    }
    localStorage.setItem(KEY_INVENTORY_V2, JSON.stringify(items));
    localStorage.removeItem(KEY_INVENTORY);
  } catch {
    // pas de panique : on laisse l'ancien storage, l'inventaire repart à vide en v2
  }
}

// ── Bootstrap : si nouveau joueur, créditer $10 ────────────────────────
export function bootstrapIfNeeded(): {
  balance: number;
  bootstrapped: boolean;
} {
  if (typeof window === "undefined")
    return { balance: STARTING_BALANCE, bootstrapped: false };
  // Migration idempotente v1 → v2 — touche uniquement si v1 présent
  migrateInventoryV1ToV2();
  const already = localStorage.getItem(KEY_BOOTSTRAPPED);
  if (already === "1") {
    return { balance: getBalance(), bootstrapped: false };
  }
  localStorage.setItem(KEY_BALANCE, String(STARTING_BALANCE));
  localStorage.setItem(KEY_BOOTSTRAPPED, "1");
  return { balance: STARTING_BALANCE, bootstrapped: true };
}

// ── Balance ─────────────────────────────────────────────────────────────
export function getBalance(): number {
  if (typeof window === "undefined") return STARTING_BALANCE;
  const v = localStorage.getItem(KEY_BALANCE);
  if (v === null) return STARTING_BALANCE;
  const n = parseFloat(v);
  return isNaN(n) ? STARTING_BALANCE : n;
}

export function setBalance(amount: number): void {
  if (typeof window === "undefined") return;
  // Clamp à 0 minimum — jamais de solde négatif
  const clamped = Math.max(0, parseFloat(amount.toFixed(2)));
  localStorage.setItem(KEY_BALANCE, clamped.toFixed(2));
  window.dispatchEvent(
    new CustomEvent("gf:balance-changed", { detail: clamped }),
  );
  // Si on tombe à 0, démarrer le cooldown
  if (clamped === 0 && getCooldownUntil() === null) {
    startCooldown();
  }
}

export function addBalance(delta: number): number {
  const next = parseFloat((getBalance() + delta).toFixed(2));
  setBalance(next);
  return getBalance();
}

// ── Cooldown ──────────────────────────────────────────────────────────
export function getCooldownUntil(): number | null {
  if (typeof window === "undefined") return null;
  const v = localStorage.getItem(KEY_COOLDOWN);
  if (!v) return null;
  const ts = parseInt(v, 10);
  if (isNaN(ts) || ts <= Date.now()) return null;
  return ts;
}

export function startCooldown(): number {
  const until = Date.now() + COOLDOWN_MS;
  if (typeof window !== "undefined") {
    localStorage.setItem(KEY_COOLDOWN, String(until));
    window.dispatchEvent(new CustomEvent("gf:cooldown-changed"));
  }
  return until;
}

export function clearCooldown(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY_COOLDOWN);
  window.dispatchEvent(new CustomEvent("gf:cooldown-changed"));
}

export function isCooldownActive(): boolean {
  return getCooldownUntil() !== null;
}

/**
 * Réclame le refresh post-cooldown : ajoute $REFRESH_AMOUNT et clear le cooldown.
 * Le cooldown doit avoir expiré (timestamp passé). On distingue "pas de cooldown
 * du tout" (n'a jamais joué jusqu'à $0) de "cooldown expiré, prêt à claim" via
 * la présence brute de la clé localStorage.
 */
export function claimRefresh(): { success: boolean; amount: number } {
  if (typeof window === "undefined") return { success: false, amount: 0 };
  // getCooldownUntil() retourne null si expiré OU si absent.
  // On utilise la présence brute de la clé pour distinguer les deux cas.
  const raw = localStorage.getItem(KEY_COOLDOWN);
  if (!raw) return { success: false, amount: 0 };
  const ts = parseInt(raw, 10);
  if (isNaN(ts) || ts > Date.now()) return { success: false, amount: 0 };
  clearCooldown();
  addBalance(REFRESH_AMOUNT);
  return { success: true, amount: REFRESH_AMOUNT };
}

// ── Daily Openings ──────────────────────────────────────────────────────
function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function emptyDailyState(): DailyState {
  return { used: 0, date: todayStr() };
}

export function getDailyState(): DailyState {
  if (typeof window === "undefined") return emptyDailyState();
  const raw = localStorage.getItem(KEY_DAILY);
  if (!raw) return emptyDailyState();
  try {
    const parsed = JSON.parse(raw) as DailyState;
    return parsed.date === todayStr() ? parsed : emptyDailyState();
  } catch {
    return emptyDailyState();
  }
}

export function getDailyUsed(): number {
  return getDailyState().used;
}

export function getDailyRemaining(): number {
  return Math.max(0, FREE_DAILY_LIMIT - getDailyUsed());
}

export function incrementDailyUsed(): number {
  const state = getDailyState();
  state.used += 1;
  state.date = todayStr();
  if (typeof window !== "undefined") {
    localStorage.setItem(KEY_DAILY, JSON.stringify(state));
    window.dispatchEvent(
      new CustomEvent("gf:daily-changed", { detail: state }),
    );
  }
  return state.used;
}

// ── Inventory (cartes possédées) ────────────────────────────────────────
// Stockage v2 : 1 ligne par instance (carte + grade + prix acquis). Une
// même carte peut apparaître plusieurs fois en grades différents.

function writeInventory(items: InventoryItem[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY_INVENTORY_V2, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent("gf:inventory-changed"));
}

export function getInventoryItems(): InventoryItem[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(KEY_INVENTORY_V2);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as InventoryItem[];
  } catch {
    return [];
  }
}

/** Agrège par (cardId, grade) — utile pour l'affichage groupé en collection. */
export interface AggregatedEntry {
  card: GameCard;
  grade: Grade;
  count: number;
  totalValue: number;
  itemIds: string[];
  firstAcquiredAt: string;
}

export function getInventoryAggregated(): AggregatedEntry[] {
  const items = getInventoryItems();
  const map = new Map<string, AggregatedEntry>();
  for (const it of items) {
    const key = `${it.card.id}::${it.grade}`;
    const existing = map.get(key);
    if (existing) {
      existing.count += 1;
      existing.totalValue = parseFloat(
        (existing.totalValue + it.price).toFixed(2),
      );
      existing.itemIds.push(it.id);
      if (it.acquiredAt < existing.firstAcquiredAt)
        existing.firstAcquiredAt = it.acquiredAt;
    } else {
      map.set(key, {
        card: it.card,
        grade: it.grade,
        count: 1,
        totalValue: it.price,
        itemIds: [it.id],
        firstAcquiredAt: it.acquiredAt,
      });
    }
  }
  return Array.from(map.values());
}

/**
 * @deprecated utiliser `getInventoryAggregated()` (clé par grade) ou
 * `getInventoryItems()` (par instance). Conservé pour les composants legacy
 * qui ne savent pas afficher les grades. Agrège par card uniquement, en
 * sommant tous les grades — perte d'info volontaire.
 */
export function getInventory(): Array<{
  card: GameCard;
  count: number;
  firstAcquiredAt: string;
}> {
  const items = getInventoryItems();
  const map = new Map<
    string,
    { card: GameCard; count: number; firstAcquiredAt: string }
  >();
  for (const it of items) {
    const existing = map.get(it.card.id);
    if (existing) {
      existing.count += 1;
      if (it.acquiredAt < existing.firstAcquiredAt)
        existing.firstAcquiredAt = it.acquiredAt;
    } else {
      map.set(it.card.id, {
        card: it.card,
        count: 1,
        firstAcquiredAt: it.acquiredAt,
      });
    }
  }
  return Array.from(map.values());
}

export function addInventoryItem(
  card: GameCard,
  grade: Grade,
  price: number,
  acquiredFrom: InventoryItem["acquiredFrom"] = "pack",
): { isNew: boolean; item: InventoryItem } {
  const items = getInventoryItems();
  // « isNew » = première fois que l'utilisateur possède CE couple (card, grade)
  const isNew = !items.some(
    (it) => it.card.id === card.id && it.grade === grade,
  );
  const item: InventoryItem = {
    id: genId(),
    card,
    grade,
    price: parseFloat(price.toFixed(2)),
    acquiredAt: new Date().toISOString(),
    acquiredFrom,
    isLocked: false,
  };
  items.push(item);
  writeInventory(items);
  return { isNew, item };
}

export function removeInventoryItem(itemId: string): InventoryItem | null {
  const items = getInventoryItems();
  const idx = items.findIndex((it) => it.id === itemId);
  if (idx === -1) return null;
  const [removed] = items.splice(idx, 1);
  writeInventory(items);
  return removed;
}

export function setItemLocked(itemId: string, locked: boolean): boolean {
  const items = getInventoryItems();
  const item = items.find((it) => it.id === itemId);
  if (!item) return false;
  item.isLocked = locked;
  writeInventory(items);
  return true;
}

export function getInventoryValue(): number {
  return parseFloat(
    getInventoryItems()
      .reduce((s, it) => s + it.price, 0)
      .toFixed(2),
  );
}

// ── Opening — orchestration complète ────────────────────────────────────
export function recordOpening(
  packId: string,
  card: GameCard,
  grade: Grade,
  price: number,
): OpeningResult {
  const { isNew } = addInventoryItem(card, grade, price, "pack");
  // Stats : on tracke chaque ouverture et chaque carte holo+
  // Import dynamique pour éviter une dépendance circulaire stats → game.
  import("./stats").then(({ incrementStat }) => {
    incrementStat("opens");
    if (
      card.rarity === "holo" ||
      card.rarity === "shining" ||
      card.rarity === "gold-star" ||
      card.rarity === "crystal" ||
      card.rarity === "secret-rare" ||
      card.rarity === "rainbow-rare"
    ) {
      incrementStat("holos");
    }
  });
  return {
    card,
    grade,
    price,
    isNew,
    packId,
    openedAt: new Date().toISOString(),
  };
}

// ── Vente de cartes ─────────────────────────────────────────────────────
/** Revend une instance précise par son id. Crédite le solde au prix d'acquisition. */
export function sellItem(itemId: string): {
  success: boolean;
  valueGained: number;
} {
  const items = getInventoryItems();
  const item = items.find((it) => it.id === itemId);
  if (!item || item.isLocked) return { success: false, valueGained: 0 };
  const valueGained = item.price;
  removeInventoryItem(itemId);
  addBalance(valueGained);
  clearCooldown();
  return { success: true, valueGained };
}

/**
 * @deprecated mode legacy : revend N instances **Raw** d'une carte donnée
 * (les grades > raw doivent être vendus via `sellItem(itemId)` pour éviter
 * que le joueur dump un PSA 10 sans s'en rendre compte).
 */
export function sellCard(
  cardId: string,
  qty = 1,
): { success: boolean; valueGained: number } {
  const candidates = getInventoryItems()
    .filter((it) => it.card.id === cardId && it.grade === "raw" && !it.isLocked)
    .slice(0, qty);
  if (candidates.length < qty) return { success: false, valueGained: 0 };
  let total = 0;
  for (const c of candidates) {
    total += c.price;
    removeInventoryItem(c.id);
  }
  total = parseFloat(total.toFixed(2));
  addBalance(total);
  clearCooldown();
  return { success: true, valueGained: total };
}

/** Revend toutes les cartes (vide l'inventaire). */
export function sellAllCards(): { totalGained: number; cardsSold: number } {
  const items = getInventoryItems().filter((it) => !it.isLocked);
  const total = parseFloat(items.reduce((s, it) => s + it.price, 0).toFixed(2));
  const count = items.length;
  // Conserve uniquement les items verrouillés
  const kept = getInventoryItems().filter((it) => it.isLocked);
  writeInventory(kept);
  if (total > 0) {
    addBalance(total);
    clearCooldown();
  }
  return { totalGained: total, cardsSold: count };
}

// ── Re-gradation ────────────────────────────────────────────────────────
// L'utilisateur paie REGRADE_COST_USD pour détruire son exemplaire et obtenir
// un nouveau grade au hasard sur la même carte. Risque-récompense : peut monter
// ou tomber.
export function regradeItem(
  itemId: string,
  pack: Pack, // pack source — détermine la distribution de grade
): { success: boolean; result?: RegradeResult; reason?: string } {
  const items = getInventoryItems();
  const item = items.find((it) => it.id === itemId);
  if (!item) return { success: false, reason: "item-not-found" };
  if (item.isLocked) return { success: false, reason: "item-locked" };
  if (getBalance() < REGRADE_COST_USD)
    return { success: false, reason: "insufficient-balance" };

  const oldGrade = item.grade;
  const oldPrice = item.price;
  // Tirage : on réutilise la distribution du pack (même règle « cartes communes
  // ne peuvent pas être PSA 10 » via LOW_RARITY_GRADE_WEIGHTS).
  // À terme, remplacer par `regrade_distribution` côté BDD (cf. ARCHITECTURE.md §3.2).
  const newGrade = rollGrade(pack, item.card);
  const newPrice = priceForGrade(item.card, newGrade);

  // Transaction locale : -20 \$, supprime l'ancien, ajoute le nouveau
  addBalance(-REGRADE_COST_USD);
  removeInventoryItem(itemId);
  addInventoryItem(item.card, newGrade, newPrice, "regrade");

  // Stats — incrémente le compteur de regrade
  import("./stats").then(({ incrementStat }) => incrementStat("regrades"));

  return {
    success: true,
    result: {
      card: item.card,
      oldGrade,
      newGrade,
      oldPrice,
      newPrice,
      delta: parseFloat((newPrice - oldPrice).toFixed(2)),
    },
  };
}

// ── Profil utilisateur (localStorage, sans Supabase) ─────────────────────
const KEY_PROFILE = "gf:profile";

export interface UserProfile {
  username: string;
  avatarColor: string;
  createdAt: string;
}

const DEFAULT_USERNAMES = [
  "Dresseur Pro",
  "Maître du Centre",
  "Champion Élite",
  "Apprenti TCG",
  "Collectionneur",
  "Chasseur Holo",
];
const AVATAR_COLORS = [
  "#2A7DFF",
  "#10D9A0",
  "#FFCC00",
  "#EC4899",
  "#8B5CF6",
  "#FF6B47",
  "#00D4FF",
  "#F8A5C2",
];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getProfile(): UserProfile {
  if (typeof window === "undefined") {
    return {
      username: "Dresseur",
      avatarColor: "#2A7DFF",
      createdAt: new Date().toISOString(),
    };
  }
  const raw = localStorage.getItem(KEY_PROFILE);
  if (!raw) {
    const fresh: UserProfile = {
      username: randomFrom(DEFAULT_USERNAMES),
      avatarColor: randomFrom(AVATAR_COLORS),
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(KEY_PROFILE, JSON.stringify(fresh));
    return fresh;
  }
  try {
    return JSON.parse(raw) as UserProfile;
  } catch {
    const fresh: UserProfile = {
      username: randomFrom(DEFAULT_USERNAMES),
      avatarColor: randomFrom(AVATAR_COLORS),
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(KEY_PROFILE, JSON.stringify(fresh));
    return fresh;
  }
}

export function setProfile(patch: Partial<UserProfile>): UserProfile {
  const current = getProfile();
  const next: UserProfile = { ...current, ...patch };
  if (typeof window !== "undefined") {
    localStorage.setItem(KEY_PROFILE, JSON.stringify(next));
    window.dispatchEvent(
      new CustomEvent("gf:profile-changed", { detail: next }),
    );
  }
  return next;
}

/** Reset complet : efface tout, recrée un compte vierge avec $10 de bonus. */
export function resetAccount(): void {
  if (typeof window === "undefined") return;
  Object.keys(localStorage).forEach((k) => {
    if (k.startsWith("gf:")) localStorage.removeItem(k);
  });
  bootstrapIfNeeded();
  window.dispatchEvent(
    new CustomEvent("gf:balance-changed", { detail: getBalance() }),
  );
  window.dispatchEvent(new CustomEvent("gf:inventory-changed"));
  window.dispatchEvent(new CustomEvent("gf:profile-changed"));
  // Stats + jackpot ont leurs propres events — on les notifie aussi pour
  // que les pages Missions / Jackpot resync immédiatement.
  window.dispatchEvent(new CustomEvent("gf:stats-changed"));
  window.dispatchEvent(new CustomEvent("gf:jackpot-changed"));
}
