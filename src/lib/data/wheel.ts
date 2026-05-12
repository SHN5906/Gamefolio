// Roue d'upgrade (style L-Case)
// L'utilisateur mise N cartes de son inventaire pour tenter d'obtenir UNE carte
// cible plus chère. P(succès) = (mise × houseEdge) / cible.

import type {
  GameCard,
  Grade,
  InventoryItem,
  WheelSpinInput,
  WheelSpinResult,
} from "@/types/game";
import {
  WHEEL_HOUSE_EDGE,
  WHEEL_MIN_RATIO,
  WHEEL_MAX_RATIO,
} from "@/types/game";
import { priceForGrade } from "@/data/packs";
import {
  addBalance,
  addInventoryItem,
  getInventoryItems,
  removeInventoryItem,
  setItemLocked,
} from "@/lib/data/game";

// ── Calcul de probabilité ────────────────────────────────────────────────

/** Probabilité brute sans contrainte (peut sortir hors [WHEEL_MIN_RATIO, WHEEL_MAX_RATIO]). */
export function rawProbability(stake: number, target: number): number {
  if (target <= 0) return 0;
  return (stake * WHEEL_HOUSE_EDGE) / target;
}

/** Clamp + arrondi pour affichage / pour le tirage. */
export function clampedProbability(stake: number, target: number): number {
  const p = rawProbability(stake, target);
  return Math.min(1, Math.max(0, p));
}

/** Vrai si la combinaison stake/target est jouable. */
export type ValidationReason =
  | "stake-empty"
  | "stake-ge-target"
  | "ratio-too-low"
  | "ratio-too-high"
  | "stake-locked";

export type ValidationResult =
  | { ok: true; probability: number }
  | { ok: false; reason: ValidationReason; probability: number };

export function validateSpin(
  stake: number,
  target: number,
  stakeItems: InventoryItem[],
): ValidationResult {
  if (stakeItems.length === 0)
    return { ok: false, reason: "stake-empty", probability: 0 };
  if (stakeItems.some((it) => it.isLocked))
    return { ok: false, reason: "stake-locked", probability: 0 };
  if (stake >= target)
    return { ok: false, reason: "stake-ge-target", probability: 1 };
  const ratio = stake / target;
  if (ratio < WHEEL_MIN_RATIO)
    return {
      ok: false,
      reason: "ratio-too-low",
      probability: rawProbability(stake, target),
    };
  if (ratio > WHEEL_MAX_RATIO)
    return {
      ok: false,
      reason: "ratio-too-high",
      probability: rawProbability(stake, target),
    };
  return { ok: true, probability: clampedProbability(stake, target) };
}

// ── Exécution du spin ────────────────────────────────────────────────────

/**
 * Lance la roue.
 *
 * Important : en prod cette logique vit côté serveur (Edge Function
 * `wheel-spin`). Le client se contente d'afficher l'animation qui converge
 * vers le résultat renvoyé par le serveur. La version ci-dessous est utile
 * pour le mode démo localStorage.
 */
export function spinWheel(
  input: WheelSpinInput,
  targetCard: GameCard,
): WheelSpinResult {
  const stakeValue = parseFloat(
    input.stake.reduce((s, it) => s + it.price, 0).toFixed(2),
  );
  const targetPrice = priceForGrade(targetCard, input.targetGrade);
  const probability = clampedProbability(stakeValue, targetPrice);

  // RNG — en prod utiliser crypto.getRandomValues
  const roll = Math.random();
  const won = roll < probability;

  // Quoi qu'il arrive, on consomme la mise (côté plateforme c'est l'enjeu)
  const consumedItemIds: string[] = [];
  for (const item of input.stake) {
    if (removeInventoryItem(item.id)) consumedItemIds.push(item.id);
  }

  if (won) {
    addInventoryItem(targetCard, input.targetGrade, targetPrice, "wheel");
    return {
      probability,
      won: true,
      consumedItemIds,
      rewardCard: {
        card: targetCard,
        grade: input.targetGrade,
        price: targetPrice,
      },
    };
  }

  return { probability, won: false, consumedItemIds };
}

// ── Helpers UI ───────────────────────────────────────────────────────────

/**
 * Calcule l'angle de l'arc « gain » sur la roue, en degrés.
 * Utile pour rendre la zone verte proportionnelle à la chance.
 */
export function winningArcDegrees(probability: number): number {
  return parseFloat((Math.min(1, Math.max(0, probability)) * 360).toFixed(2));
}

/**
 * Calcule la position finale du pointer de la roue.
 *  - Si win : retourne un angle dans la zone verte (0, arcDeg)
 *  - Sinon  : retourne un angle dans la zone rouge (arcDeg, 360)
 *
 * Ajoute aussi N tours complets (1080° par défaut) pour le suspense visuel.
 */
export function finalAngle(
  won: boolean,
  probability: number,
  extraSpins = 3,
): number {
  const arc = winningArcDegrees(probability);
  if (won) {
    // Légère marge intérieure pour ne pas tomber pile sur le bord
    const innerArc = arc * 0.96;
    const offset = (arc - innerArc) / 2;
    const within = offset + Math.random() * innerArc;
    return extraSpins * 360 + within;
  }
  const losingArc = 360 - arc;
  const within = arc + Math.random() * losingArc;
  return extraSpins * 360 + within;
}

// ── Helpers de mise (pré-spin) ───────────────────────────────────────────

/** Liste les items de l'inventaire éligibles à la mise (non verrouillés). */
export function eligibleStakeItems(): InventoryItem[] {
  return getInventoryItems().filter((it) => !it.isLocked);
}

/**
 * Verrouille les items pendant la durée de l'animation côté client pour
 * empêcher l'utilisateur de revendre ses cartes en parallèle d'un spin
 * en cours. Doit toujours être suivi d'un `unlockStakeItems` (ou d'une
 * consommation via `spinWheel`).
 */
export function lockStakeItems(items: InventoryItem[]): void {
  for (const it of items) setItemLocked(it.id, true);
}

export function unlockStakeItems(items: InventoryItem[]): void {
  for (const it of items) setItemLocked(it.id, false);
}

/**
 * En cas d'échec côté serveur (timeout, déconnexion) après verrouillage
 * mais avant consommation, le client peut « rembourser » sa mise en
 * annulant le verrou. Le serveur reste la source de vérité ; cet helper
 * est seulement pour la persistance optimiste localStorage.
 */
export function refundStake(items: InventoryItem[]): void {
  unlockStakeItems(items);
}

/** Crédite directement le solde si l'utilisateur préfère vendre sa mise plutôt que jouer. */
export function liquidateStake(items: InventoryItem[]): number {
  let total = 0;
  for (const it of items) {
    if (it.isLocked) continue;
    total += it.price;
    removeInventoryItem(it.id);
  }
  total = parseFloat(total.toFixed(2));
  if (total > 0) addBalance(total);
  return total;
}

// ── Aide à la décision : suggérer une cible vendable ────────────────────

/**
 * Étant donné une mise, retourne le prix cible idéal pour atteindre la
 * probabilité visée (par défaut 50 %).
 *
 *   target = (stake × houseEdge) / desiredProbability
 */
export function suggestedTargetPrice(
  stake: number,
  desiredProbability = 0.5,
): number {
  if (desiredProbability <= 0) return Infinity;
  return parseFloat(
    ((stake * WHEEL_HOUSE_EDGE) / desiredProbability).toFixed(2),
  );
}

// ── Grade map pour la cible ──────────────────────────────────────────────

/** Retourne tous les grades disponibles pour une cible et leur prix calculé. */
export function targetGradeOptions(
  card: GameCard,
): Array<{ grade: Grade; price: number }> {
  return (["raw", "psa-5", "psa-8", "psa-9", "psa-10"] as Grade[]).map((g) => ({
    grade: g,
    price: priceForGrade(card, g),
  }));
}
