// Adapter PriceCharting — source principale pour les prix PSA gradés.
// Doc: https://www.pricecharting.com/api-documentation

import type { Grade } from "@/types/game";
import type { PriceAdapter, RawPriceFeed } from "./types";

const PC_BASE_URL = "https://www.pricecharting.com/api";

// PriceCharting renvoie des prix en cents (ex: 5499 = 54.99 \$)
function centsToUsd(cents: number | undefined | null): number | null {
  if (cents == null || isNaN(cents)) return null;
  return parseFloat((cents / 100).toFixed(2));
}

// Mapping interne : les clés du JSON PriceCharting → nos grades.
// PC distingue Loose (Raw) et plusieurs niveaux Graded (BGS/PSA).
// Les noms exacts dépendent du produit ; les clés ci-dessous sont
// celles documentées pour les produits Pokémon TCG.
const PC_GRADE_FIELDS: Record<Grade, string> = {
  raw: "loose-price", // carte non gradée (Near Mint)
  "psa-5": "cib-price", // approximation — pas de clé PSA 5 dédiée chez PC
  "psa-8": "new-price", // PSA 8 ≈ « new » dans la nomenclature PC pour TCG
  "psa-9": "graded-price", // PSA 9
  "psa-10": "manual-only-price", // PSA 10 / Gem Mint
};

export class PriceChartingAdapter implements PriceAdapter {
  readonly source = "pricecharting" as const;

  constructor(private readonly apiToken: string) {}

  async fetchAllGrades(
    cardId: string,
    sourceRef: string,
  ): Promise<RawPriceFeed[]> {
    const url = `${PC_BASE_URL}/product?t=${encodeURIComponent(this.apiToken)}&id=${encodeURIComponent(sourceRef)}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      throw new Error(`PriceCharting ${res.status}: ${res.statusText}`);
    }
    const data = (await res.json()) as Record<string, unknown>;

    // PC peut retourner { status: 'success' } ou bien des champs prix directement.
    // En cas de produit introuvable, on remonte une erreur explicite.
    if (data["status"] === "not-found") {
      throw new Error(`PriceCharting product not found: ${sourceRef}`);
    }

    const now = new Date().toISOString();
    const feeds: RawPriceFeed[] = [];

    for (const [grade, field] of Object.entries(PC_GRADE_FIELDS) as [
      Grade,
      string,
    ][]) {
      const raw = data[field];
      const cents = typeof raw === "number" ? raw : null;
      const priceUsd = centsToUsd(cents);
      if (priceUsd == null || priceUsd <= 0) continue;

      feeds.push({
        cardId,
        grade,
        priceUsd,
        source: this.source,
        sourceRef,
        fetchedAt: now,
      });
    }

    return feeds;
  }
}
