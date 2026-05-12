// Audit du RTP (Return To Player) — garantie de rentabilité de la plateforme.
//
// Pour chaque caisse, on calcule :
//   EV = Σ (card.dropRate × Σ (grade.weight × price[card,grade]))
//   RTP = EV / pack.price
//
// Un RTP > 0.85 signale un pack non-rentable : il faut soit augmenter le
// prix, soit baisser les drop rates des cartes/grades chers. Au-dessus
// de 1.00 la plateforme perd de l'argent à chaque ouverture.

import type { GameCard, Grade, GradeWeights, Pack } from "@/types/game";
import { DEFAULT_GRADE_WEIGHTS } from "@/data/packs";
import { GRADE_PRICE_MULTIPLIER } from "@/types/game";

export interface PackAuditResult {
  packId: string;
  packPrice: number;
  ev: number;
  rtp: number;
  status: "healthy" | "tight" | "unprofitable";
  topRiskCards: Array<{ cardId: string; contribution: number }>;
}

const RTP_ALERT_THRESHOLD = 0.85;
const RTP_DEPLOY_BLOCK = 1.0;

function gradePricesFor(
  card: GameCard,
  priceTable: Record<string, Partial<Record<Grade, number>>>,
): Record<Grade, number> {
  const fromTable = priceTable[card.id] ?? {};
  return {
    raw: fromTable["raw"] ?? card.value,
    "psa-5": fromTable["psa-5"] ?? card.value * GRADE_PRICE_MULTIPLIER["psa-5"],
    "psa-8": fromTable["psa-8"] ?? card.value * GRADE_PRICE_MULTIPLIER["psa-8"],
    "psa-9": fromTable["psa-9"] ?? card.value * GRADE_PRICE_MULTIPLIER["psa-9"],
    "psa-10":
      fromTable["psa-10"] ?? card.value * GRADE_PRICE_MULTIPLIER["psa-10"],
  };
}

function cardGradeWeights(pack: Pack, card: GameCard): GradeWeights {
  return (
    pack.gradeWeights?.[card.id] ??
    pack.defaultGradeWeights ??
    DEFAULT_GRADE_WEIGHTS
  );
}

function gradeEv(weights: GradeWeights, prices: Record<Grade, number>): number {
  const total = (
    ["raw", "psa-5", "psa-8", "psa-9", "psa-10"] as Grade[]
  ).reduce((s, g) => s + weights[g], 0);
  if (total <= 0) return 0;
  return (["raw", "psa-5", "psa-8", "psa-9", "psa-10"] as Grade[]).reduce(
    (s, g) => s + (weights[g] / total) * prices[g],
    0,
  );
}

export function auditPack(
  pack: Pack,
  priceTable: Record<string, Partial<Record<Grade, number>>> = {},
): PackAuditResult {
  const cardEvs: Array<{ cardId: string; contribution: number }> = [];
  let totalDropRate = 0;
  for (const c of pack.cardPool) totalDropRate += c.dropRate;

  let ev = 0;
  for (const card of pack.cardPool) {
    const weights = cardGradeWeights(pack, card);
    const prices = gradePricesFor(card, priceTable);
    const cardEv = gradeEv(weights, prices);
    const contribution = (card.dropRate / totalDropRate) * cardEv;
    ev += contribution;
    cardEvs.push({ cardId: card.id, contribution });
  }
  ev = parseFloat(ev.toFixed(4));
  const rtp = parseFloat((ev / pack.price).toFixed(4));

  let status: PackAuditResult["status"];
  if (rtp >= RTP_DEPLOY_BLOCK) status = "unprofitable";
  else if (rtp >= RTP_ALERT_THRESHOLD) status = "tight";
  else status = "healthy";

  const topRiskCards = cardEvs
    .sort((a, b) => b.contribution - a.contribution)
    .slice(0, 5);

  return {
    packId: pack.id,
    packPrice: pack.price,
    ev,
    rtp,
    status,
    topRiskCards,
  };
}

export function shouldBlockDeploy(audit: PackAuditResult): boolean {
  return audit.status === "unprofitable";
}
