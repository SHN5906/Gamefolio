// Types communs aux adapters de prix marché.

import type { Grade } from "@/types/game";

export type PriceSource = "pricecharting" | "tcgplayer" | "manual";

export interface RawPriceFeed {
  cardId: string; // id catalogue (TCGdex)
  grade: Grade;
  priceUsd: number;
  source: PriceSource;
  sourceRef?: string; // product_id / sku externe
  fetchedAt: string; // ISO timestamp
  // Marqueurs de qualité : sans confidence on ne sait pas si la mise à jour
  // sort de marges normales (variation jour à jour < 15%).
  sampleSize?: number; // nombre de ventes prises en compte (TCGplayer)
  ageHours?: number; // age moyen des ventes (PriceCharting parfois)
}

/** Données minimales à upserter dans `card_grade_prices`. */
export interface GradePriceUpsert {
  cardId: string;
  grade: Grade;
  priceUsd: number;
  source: PriceSource;
  sourceRef?: string;
}

export interface PriceFetchError {
  cardId: string;
  reason: string;
}

export interface PriceFetchResult {
  upserts: GradePriceUpsert[];
  errors: PriceFetchError[];
}

/** Contrat d'un adapter de source de prix. */
export interface PriceAdapter {
  /** Récupère tous les grades disponibles pour une carte donnée. */
  fetchAllGrades(cardId: string, sourceRef: string): Promise<RawPriceFeed[]>;
  /** Identifiant de la source pour le logging et la traçabilité. */
  readonly source: PriceSource;
}
