// Types du système de jeu GameFolio

export type Rarity =
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'holo'
  | 'reverse-holo'
  | 'ex'
  | 'gx'
  | 'v'
  | 'vmax'
  | 'tag-team'
  | 'shining'
  | 'gold-star'
  | 'crystal'
  | 'secret-rare'
  | 'rainbow-rare'

export type PackTier = 'starter' | 'common' | 'intermediate' | 'premium' | 'ultra'

export type AnimationTier = 'base' | 'rare' | 'epic' | 'legendary'

export interface GameCard {
  id: string
  name: string
  nameFr: string
  set: string
  setFr: string
  number: string
  rarity: Rarity
  value: number        // valeur marché en USD
  imageUrl: string | null
  dropRate: number     // probabilité en % (somme = 100 dans le pool)
  energy: string       // pour le fallback gradient
  animTier: AnimationTier
}

export interface Pack {
  id: string
  name: string
  nameFr: string
  description: string
  price: number        // USD
  tier: PackTier
  cardPool: GameCard[]
  guaranteedRarity?: Rarity
  gradient: { from: string; to: string; via?: string }
  glowColor: string
  emoji: string
  badge?: string
  isNew?: boolean
  isFeatured?: boolean
}

export interface DailyOpenings {
  used: number
  limit: number
  resetsAt: string    // ISO date
}

export interface UserBalance {
  amount: number      // USD avec 2 décimales
}

export interface OpeningResult {
  card: GameCard
  isNew: boolean
  packId: string
  openedAt: string
}

export interface BattleRoom {
  id: string
  packId: string
  packName: string
  stake: number
  maxPlayers: number
  players: BattlePlayer[]
  status: 'waiting' | 'in-progress' | 'finished'
  createdAt: string
  winnerId?: string
}

export interface BattlePlayer {
  userId: string
  username: string
  avatarInitial: string
  card?: GameCard
  ready: boolean
}

export interface JackpotDeposit {
  userId: string
  username: string
  avatarInitial: string
  depositValue: number
  percentage: number
  cardCount: number
}

export interface JackpotRound {
  id: string
  totalValue: number
  endsAt: string
  status: 'open' | 'drawing' | 'closed'
  deposits: JackpotDeposit[]
  winnerId?: string
  winnerName?: string
}

export interface Mission {
  id: string
  title: string
  description: string
  reward: number     // USD
  type: 'daily' | 'weekly'
  progress: number
  goal: number
  completed: boolean
  icon: string
}
