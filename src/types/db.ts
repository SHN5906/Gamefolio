// Types TypeScript générés depuis le schéma SQL Supabase (section 5.2 du PROJECT.md)
// À remplacer par `supabase gen types typescript` une fois le projet Supabase créé

export type SubscriptionTier = 'free' | 'pro' | 'trader'
export type Currency = 'EUR' | 'USD' | 'GBP'
export type Language = 'fr' | 'en' | 'de' | 'es' | 'it' | 'pt' | 'jp'
export type Condition = 'NM' | 'EX' | 'GD' | 'PL' | 'PO'
export type PriceSource = 'cardmarket' | 'tcgplayer' | 'ebay'
export type AlertTrigger = 'above' | 'below' | 'change_pct'

export interface Profile {
  id: string
  username: string | null
  display_name: string | null
  avatar_url: string | null
  default_currency: Currency
  default_language: Language
  subscription_tier: SubscriptionTier
  subscription_renews_at: string | null
  created_at: string
}

export interface CardCatalog {
  id: string
  tcgdex_id: string
  name_fr: string | null
  name_en: string | null
  name_jp: string | null
  set_id: string
  set_name_fr: string | null
  set_name_en: string | null
  number: string | null
  rarity: string | null
  illustrator: string | null
  image_url_low: string | null
  image_url_high: string | null
  release_date: string | null
  hp: number | null
  types: string[] | null
  variants: Record<string, unknown> | null
  updated_at: string
}

export interface CardPrice {
  id: number
  card_id: string
  language: Language
  variant: string
  condition: Condition
  graded: boolean
  grade: string | null
  source: PriceSource
  price_eur: number
  price_low_eur: number | null
  price_avg_eur: number | null
  price_trend_eur: number | null
  captured_at: string
}

export interface UserCard {
  id: string
  user_id: string
  card_id: string
  language: Language
  variant: string
  condition: Condition
  graded: boolean
  grade: string | null
  quantity: number
  purchase_price_eur: number | null
  purchase_date: string | null
  notes: string | null
  is_for_sale: boolean
  created_at: string
  updated_at: string
}

export interface PortfolioSnapshot {
  id: number
  user_id: string
  total_value_eur: number
  total_cost_eur: number | null
  card_count: number | null
  unique_card_count: number | null
  captured_at: string
}

export interface WishlistItem {
  id: string
  user_id: string
  card_id: string
  language: Language
  variant: string
  condition: Condition
  target_price_eur: number | null
  alert_enabled: boolean
  notes: string | null
  created_at: string
}

export interface PriceAlert {
  id: string
  user_id: string
  user_card_id: string
  trigger_type: AlertTrigger
  threshold: number
  is_active: boolean
  last_triggered_at: string | null
  created_at: string
}

// Type enrichi pour l'affichage (UserCard + données du catalogue joinées)
export interface UserCardWithDetails extends UserCard {
  card: CardCatalog
  current_price: number | null
  pnl: number | null
  pnl_pct: number | null
}
