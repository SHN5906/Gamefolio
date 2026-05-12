// Agrégateur de sources de prix.
// Stratégie : pour chaque (carte, grade), prendre la meilleure source disponible.
//   - 'raw'      → TCGPlayer (marché US le plus liquide pour le Near Mint)
//   - 'psa-*'    → PriceCharting (seul à avoir un prix par grade PSA fiable)
// Si la source primaire échoue, on tente la secondaire. Si les deux échouent,
// on remonte une erreur — l'item ne sera pas mis à jour, l'ancien prix reste.

import type { Grade } from "@/types/game";
import type {
  GradePriceUpsert,
  PriceAdapter,
  PriceFetchResult,
  RawPriceFeed,
} from "./types";

interface CardSourceMapping {
  cardId: string;
  pricechartingId?: string;
  tcgplayerId?: string;
}

interface AggregatorConfig {
  pricecharting?: PriceAdapter;
  tcgplayer?: PriceAdapter;
}

const PSA_GRADES: Grade[] = ["psa-5", "psa-8", "psa-9", "psa-10"];

export class PriceAggregator {
  constructor(private readonly config: AggregatorConfig) {}

  async fetchCardPrices(mapping: CardSourceMapping): Promise<PriceFetchResult> {
    const upserts: GradePriceUpsert[] = [];
    const errors: PriceFetchResult["errors"] = [];

    // Source primaire pour Raw : TCGPlayer ; secondaire : PriceCharting
    const rawFeed = await this.tryFetchRaw(mapping, errors);
    if (rawFeed) upserts.push(toUpsert(rawFeed));

    // Source primaire pour PSA : PriceCharting (seule à avoir les grades)
    const psaFeeds = await this.tryFetchPsa(mapping, errors);
    for (const f of psaFeeds) upserts.push(toUpsert(f));

    return { upserts, errors };
  }

  private async tryFetchRaw(
    mapping: CardSourceMapping,
    errors: PriceFetchResult["errors"],
  ): Promise<RawPriceFeed | null> {
    // 1) TCGPlayer
    if (this.config.tcgplayer && mapping.tcgplayerId) {
      try {
        const feeds = await this.config.tcgplayer.fetchAllGrades(
          mapping.cardId,
          mapping.tcgplayerId,
        );
        const raw = feeds.find((f) => f.grade === "raw");
        if (raw) return raw;
      } catch (e) {
        errors.push({
          cardId: mapping.cardId,
          reason: `tcgplayer-raw: ${(e as Error).message}`,
        });
      }
    }
    // 2) Fallback PriceCharting
    if (this.config.pricecharting && mapping.pricechartingId) {
      try {
        const feeds = await this.config.pricecharting.fetchAllGrades(
          mapping.cardId,
          mapping.pricechartingId,
        );
        const raw = feeds.find((f) => f.grade === "raw");
        if (raw) return raw;
      } catch (e) {
        errors.push({
          cardId: mapping.cardId,
          reason: `pricecharting-raw: ${(e as Error).message}`,
        });
      }
    }
    return null;
  }

  private async tryFetchPsa(
    mapping: CardSourceMapping,
    errors: PriceFetchResult["errors"],
  ): Promise<RawPriceFeed[]> {
    if (!this.config.pricecharting || !mapping.pricechartingId) return [];
    try {
      const feeds = await this.config.pricecharting.fetchAllGrades(
        mapping.cardId,
        mapping.pricechartingId,
      );
      return feeds.filter((f) => PSA_GRADES.includes(f.grade));
    } catch (e) {
      errors.push({
        cardId: mapping.cardId,
        reason: `pricecharting-psa: ${(e as Error).message}`,
      });
      return [];
    }
  }
}

function toUpsert(feed: RawPriceFeed): GradePriceUpsert {
  return {
    cardId: feed.cardId,
    grade: feed.grade,
    priceUsd: feed.priceUsd,
    source: feed.source,
    sourceRef: feed.sourceRef,
  };
}
