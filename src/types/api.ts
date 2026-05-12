// Types pour les APIs externes (TCGdex, Stripe)

// ── TCGdex ──────────────────────────────────────────────────────────────────

export interface TCGdexCard {
  id: string
  localId: string
  name: string
  image?: string
  category: string
  hp?: number
  types?: string[]
  illustrator?: string
  rarity?: string
  variants?: {
    normal?: boolean
    reverse?: boolean
    holo?: boolean
    firstEdition?: boolean
  }
  set: {
    id: string
    name: string
    logo?: string
    releaseDate?: string
  }
}

export interface TCGdexCardPrice {
  low?: number
  mid?: number
  high?: number
  market?: number
  directLow?: number
}

export interface TCGdexSet {
  id: string
  name: string
  logo?: string
  symbol?: string
  releaseDate?: string
  cardCount: {
    total: number
    official: number
  }
}

// ── Réponses API internes ────────────────────────────────────────────────────

export interface PortfolioPeriodData {
  date: string
  value: number
}

export interface PortfolioSummary {
  totalValue: number
  totalCost: number
  pnl: number
  pnlPct: number
  cardCount: number
  uniqueCardCount: number
  history: PortfolioPeriodData[]
}
