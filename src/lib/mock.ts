// Données mockées pour le développement (avant Supabase)
import type { EnergyType } from '@/constants/theme'
import type { Condition } from '@/types/db'

export interface MockCard {
  id: string
  name: string
  set: string
  number: string
  energy: EnergyType
  condition: Condition
  language: string
  grade: string | null
  value: number
  changePct: number
  purchasePrice: number
  imageUrl?: string | null   // ← NEW : URL TCGdex haute qualité
}

// URLs TCGdex (vérifiées via api.tcgdex.net en avril 2026)
// Fallback : gradient énergie si null OU si l'image fail à charger (onError dans le composant)
export const MOCK_CARDS: MockCard[] = [
  { id: '1', name: 'Charizard ex',         set: '151',            number: '006/165', energy: 'fire',      condition: 'NM', language: 'FR', grade: null,     value: 128.00, changePct:  18.5, purchasePrice: 90,  imageUrl: 'https://assets.tcgdex.net/fr/sv/sv03.5/6/high.webp' },
  { id: '2', name: 'Lugia V Alt Art',      set: 'Silver Tempest', number: '186/195', energy: 'colorless', condition: 'NM', language: 'EN', grade: 'PSA 9',  value: 214.00, changePct:   6.7, purchasePrice: 150, imageUrl: 'https://assets.tcgdex.net/en/swsh/swsh12/186/high.webp' },
  { id: '3', name: 'Pikachu VMAX',         set: 'Vivid Voltage',  number: '044/185', energy: 'lightning', condition: 'NM', language: 'EN', grade: null,     value:  74.50, changePct:   9.2, purchasePrice: 62,  imageUrl: 'https://assets.tcgdex.net/en/swsh/swsh04/44/high.webp' },
  { id: '4', name: 'Mewtwo Holo',          set: 'Base Set',       number: '010/102', energy: 'psychic',   condition: 'EX', language: 'FR', grade: null,     value:  89.00, changePct:  -4.3, purchasePrice: 95,  imageUrl: 'https://assets.tcgdex.net/fr/base/base1/10/high.webp' },
  { id: '5', name: 'Umbreon VMAX Alt Art', set: 'Évo. Célestes',  number: '215/203', energy: 'dark',      condition: 'NM', language: 'EN', grade: 'PSA 10', value: 310.00, changePct:   2.1, purchasePrice: 200, imageUrl: 'https://assets.tcgdex.net/en/swsh/swsh07/215/high.webp' },
  { id: '6', name: 'Gyarados ex',          set: '151',            number: '056/165', energy: 'water',     condition: 'NM', language: 'FR', grade: null,     value:  42.00, changePct:   5.0, purchasePrice: 35,  imageUrl: 'https://assets.tcgdex.net/fr/sv/sv03.5/56/high.webp' },
]

export const MOCK_PORTFOLIO = {
  totalValue:     3847.50,
  totalCost:      3005.00,
  pnl:             842.50,
  pnlPct:           28.03,
  cardCount:         312,
  setCount:           18,
  gradedCount:         6,
}

export const MOCK_ALLOCATION = [
  { name: '151',            pct: 0.31, color: '#7C3AED' },
  { name: 'Surging Sparks', pct: 0.22, color: '#F59E0B' },
  { name: 'Silver Tempest', pct: 0.18, color: '#10B981' },
  { name: 'Base Set',       pct: 0.14, color: '#3B82F6' },
  { name: 'Autres',         pct: 0.15, color: '#334155' },
]

// Génération de données de prix (Mouvement Brownien Géométrique)
export function genChartData(
  n: number,
  startVal: number,
  drift: number,
  vol: number,
  endVal: number
): Array<{ i: number; value: number }> {
  const data: number[] = [startVal]
  for (let i = 1; i < n; i++) {
    const rnd = (Math.random() - 0.48) * 2
    data.push(Math.max(data[i - 1] * (1 + drift + vol * rnd), 1))
  }
  // Force la dernière valeur
  data[data.length - 1] = endVal
  return data.map((value, i) => ({ i, value: Math.round(value * 100) / 100 }))
}

// ── Wishlist ──────────────────────────────────────────────────────
export type WishPriority = 'urgent' | 'want' | 'watching'

export interface MockWishItem {
  id:           string
  name:         string
  set:          string
  number:       string
  energy:       EnergyType
  currentPrice: number   // prix actuel estimé
  targetPrice:  number | null   // alerte sous ce seuil
  maxPrice:     number | null   // budget max
  priority:     WishPriority
  notes:        string | null
  addedAt:      string          // ISO date
  tcgdexImage:  string | null   // URL de base TCGdex
}

export const MOCK_WISHLIST: MockWishItem[] = [
  {
    id: 'w1', name: 'Rayquaza VMAX Alt Art', set: 'Évolution Céleste',
    number: '218/203', energy: 'colorless', currentPrice: 185, targetPrice: 150,
    maxPrice: 160, priority: 'urgent', notes: 'PSA 10 si possible',
    addedAt: '2024-11-15', tcgdexImage: null,
  },
  {
    id: 'w2', name: 'Arceus VSTAR', set: 'Astres Radieux',
    number: '123/189', energy: 'colorless', currentPrice: 42, targetPrice: 35,
    maxPrice: 40, priority: 'want', notes: null,
    addedAt: '2024-12-01', tcgdexImage: null,
  },
  {
    id: 'w3', name: 'Giratine VSTAR', set: 'Perte d\'Origine',
    number: '131/196', energy: 'psychic', currentPrice: 28, targetPrice: null,
    maxPrice: 30, priority: 'watching', notes: 'Surveille la tendance',
    addedAt: '2025-01-08', tcgdexImage: null,
  },
  {
    id: 'w4', name: 'Lugia VSTAR Alt Art', set: 'Tempête Argentée',
    number: '139/195', energy: 'colorless', currentPrice: 220, targetPrice: 180,
    maxPrice: 200, priority: 'want', notes: null,
    addedAt: '2025-02-20', tcgdexImage: null,
  },
  {
    id: 'w5', name: 'Miraidon ex Alt Art', set: 'Écarlate & Violet',
    number: '245/198', energy: 'lightning', currentPrice: 55, targetPrice: 45,
    maxPrice: 50, priority: 'watching', notes: null,
    addedAt: '2025-03-10', tcgdexImage: null,
  },
]

// ── Produits scellés ─────────────────────────────────────────────
export type SealedType = 'display' | 'etb' | 'coffret' | 'blister' | 'deck' | 'tin' | 'bundle' | 'promo'

export const SEALED_TYPE_LABELS: Record<SealedType, string> = {
  display: 'Display 36 boosters',
  etb:     'Elite Trainer Box',
  coffret: 'Coffret spécial',
  blister: 'Blister',
  deck:    'Deck de démarrage',
  tin:     'Tin / Mini-tin',
  bundle:  'Bundle',
  promo:   'Pack promo',
}

export interface MockSealedProduct {
  id:            string
  name:          string
  type:          SealedType
  set:           string
  language:      string
  condition:     'sealed' | 'opened'
  quantity:      number
  purchasePrice: number
  value:         number
  changePct:     number
  imageUrl?:     string | null
}

export const MOCK_SEALED: MockSealedProduct[] = [
  {
    id: 's1', name: 'Display Fable Nébuleuse', type: 'display',
    set: 'Fable Nébuleuse', language: 'FR', condition: 'sealed',
    quantity: 1, purchasePrice: 145, value: 168, changePct: 15.9,
    imageUrl: 'https://www.pokemon.com/static-assets/content-assets/cms2/img/trading-card-game/series/sv06/sv06-booster-display.png',
  },
  {
    id: 's2', name: 'Elite Trainer Box Mascarade Crépusculaire', type: 'etb',
    set: 'Mascarade Crépusculaire', language: 'FR', condition: 'sealed',
    quantity: 2, purchasePrice: 54, value: 61, changePct: 13.0,
    imageUrl: 'https://www.pokemon.com/static-assets/content-assets/cms2/img/trading-card-game/series/sv06/sv06-etb.png',
  },
  {
    id: 's3', name: 'Coffret Méga Dracaufeu-ex Héros Transcendant', type: 'coffret',
    set: 'Héros Transcendant', language: 'FR', condition: 'sealed',
    quantity: 1, purchasePrice: 89, value: 110, changePct: 23.6,
    imageUrl: null,  // Pas d'image officielle dispo → fallback gradient
  },
]

export const PERIODS = {
  '24h': { n: 60,  dr: -0.0005, vl: 0.003, label: '24 dernières heures', abs: -124.80, up: false, end: 3722.70 },
  '7d':  { n: 84,  dr:  0.0012, vl: 0.004, label: '7 derniers jours',    abs:  124.80, up: true,  end: 3847.50 },
  '30d': { n: 120, dr:  0.003,  vl: 0.007, label: '30 derniers jours',   abs:  487.20, up: true,  end: 3847.50 },
  '1y':  { n: 160, dr:  0.004,  vl: 0.009, label: 'Cette année',         abs: 1242.00, up: true,  end: 3847.50 },
  'all': { n: 200, dr:  0.005,  vl: 0.011, label: 'Depuis le début',     abs: 1842.50, up: true,  end: 3847.50 },
} as const

export type PeriodKey = keyof typeof PERIODS
