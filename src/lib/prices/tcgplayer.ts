// Adapter TCGPlayer — meilleure source pour les cartes Raw (Near Mint).
// Doc: https://docs.tcgplayer.com/reference/catalog_getproductprices

import type { Grade } from "@/types/game";
import type { PriceAdapter, RawPriceFeed } from "./types";

interface TcgPlayerTokenStore {
  /** Récupère un token bearer valide (renouvelle automatiquement si expiré). */
  getAccessToken(): Promise<string>;
}

interface TcgPlayerPriceItem {
  productId: number;
  lowPrice: number | null;
  midPrice: number | null;
  highPrice: number | null;
  marketPrice: number | null;
  directLowPrice: number | null;
  subTypeName: string; // 'Normal' | 'Holofoil' | 'Reverse Holofoil' | …
}

interface TcgPlayerResponse {
  success: boolean;
  errors: string[];
  results: TcgPlayerPriceItem[];
}

export class TcgPlayerAdapter implements PriceAdapter {
  readonly source = "tcgplayer" as const;

  constructor(private readonly tokens: TcgPlayerTokenStore) {}

  // TCGplayer expose le prix Raw uniquement (le prix marché Near Mint). On
  // n'utilise cet adapter que pour `grade='raw'` ; les grades PSA viennent
  // de PriceCharting.
  async fetchAllGrades(
    cardId: string,
    sourceRef: string,
  ): Promise<RawPriceFeed[]> {
    const token = await this.tokens.getAccessToken();
    const url = `https://api.tcgplayer.com/pricing/product/${encodeURIComponent(sourceRef)}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`TCGPlayer ${res.status}: ${res.statusText}`);
    const data = (await res.json()) as TcgPlayerResponse;
    if (!data.success) throw new Error(`TCGPlayer: ${data.errors.join("; ")}`);

    // Stratégie : on prend le marketPrice du sous-type le plus pertinent.
    // - Pour les holos : 'Holofoil'
    // - Sinon : 'Normal'
    // Si plusieurs résultats correspondent, on garde celui qui a le marketPrice
    // le plus élevé (souvent c'est le foil pour les holos).
    const candidates = data.results
      .filter((r) => typeof r.marketPrice === "number" && r.marketPrice > 0)
      .sort((a, b) => (b.marketPrice ?? 0) - (a.marketPrice ?? 0));

    if (candidates.length === 0) return [];
    const best = candidates[0];
    const priceUsd = parseFloat((best.marketPrice ?? 0).toFixed(2));

    const feed: RawPriceFeed = {
      cardId,
      grade: "raw" as Grade,
      priceUsd,
      source: this.source,
      sourceRef: String(best.productId),
      fetchedAt: new Date().toISOString(),
    };
    return [feed];
  }
}
