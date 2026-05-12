// Types du système de jeu GameFolio

// ── Grades PSA ────────────────────────────────────────────────────────────
// Une carte n'est pas un item unique : chaque exemplaire possède un état
// (Raw, PSA 5/8/9/10) qui détermine son prix marché.
export type Grade = "raw" | "psa-5" | "psa-8" | "psa-9" | "psa-10";

export const GRADES: readonly Grade[] = [
  "raw",
  "psa-5",
  "psa-8",
  "psa-9",
  "psa-10",
] as const;

// Multiplicateurs de prix par grade, appliqués au prix Raw d'une carte
// quand aucun prix marché n'est disponible (fallback). Les vraies valeurs
// viennent de l'API PriceCharting/TCGPlayer via card_grade_prices.
export const GRADE_PRICE_MULTIPLIER: Record<Grade, number> = {
  raw: 1.0,
  "psa-5": 1.6,
  "psa-8": 3.5,
  "psa-9": 6.0,
  "psa-10": 12.0,
};

// Distribution de grade par défaut au tirage d'une caisse.
// Surchargée optionnellement par carte via `Pack.gradeWeights[cardId]`.
export type GradeWeights = Record<Grade, number>;

// Une instance de carte possédée par un joueur : carte + grade + prix figé.
export interface GradedCard {
  card: GameCard;
  grade: Grade;
  // Prix marché de la combinaison (card, grade) au moment du tirage.
  // Utilisé pour P&L et pour les calculs de mise (wheel, regrade).
  price: number;
}

// Une instance en inventaire — chaque exemplaire est une ligne distincte
// (PSA 9 acquis lundi ≠ PSA 9 acquis mardi pour le P&L).
export interface InventoryItem extends GradedCard {
  id: string; // uuid local ou id DB
  acquiredAt: string; // ISO
  acquiredFrom: "pack" | "regrade" | "wheel" | "admin";
  isLocked: boolean; // mis à true pendant un wheel/battle
}

export type Rarity =
  | "common"
  | "uncommon"
  | "rare"
  | "holo"
  | "reverse-holo"
  | "ex"
  | "gx"
  | "v"
  | "vmax"
  | "tag-team"
  | "shining"
  | "gold-star"
  | "crystal"
  | "secret-rare"
  | "rainbow-rare";

export type PackTier =
  | "starter"
  | "common"
  | "intermediate"
  | "premium"
  | "ultra";

export type AnimationTier = "base" | "rare" | "epic" | "legendary";

export interface GameCard {
  id: string;
  name: string;
  nameFr: string;
  set: string;
  setFr: string;
  number: string;
  rarity: Rarity;
  value: number; // valeur marché en USD
  imageUrl: string | null;
  dropRate: number; // probabilité en % (somme = 100 dans le pool)
  energy: string; // pour le fallback gradient
  animTier: AnimationTier;
}

export interface Pack {
  id: string;
  name: string;
  nameFr: string;
  description: string;
  price: number; // USD
  tier: PackTier;
  cardPool: GameCard[];
  guaranteedRarity?: Rarity;
  gradient: { from: string; to: string; via?: string };
  glowColor: string;
  emoji: string;
  badge?: string;
  isNew?: boolean;
  isFeatured?: boolean;
  // Distribution de grade par défaut au tirage (si absent: voir DEFAULT_GRADE_WEIGHTS)
  defaultGradeWeights?: GradeWeights;
  // Surcharge par carte : ex. les cartes communes ne peuvent jamais sortir en PSA 10
  gradeWeights?: Partial<Record<string, GradeWeights>>;
}

export interface DailyOpenings {
  used: number;
  limit: number;
  resetsAt: string; // ISO date
}

export interface UserBalance {
  amount: number; // USD avec 2 décimales
}

export interface OpeningResult {
  card: GameCard;
  grade: Grade;
  price: number;
  isNew: boolean; // true si c'est la première fois que le joueur obtient ce couple (card, grade)
  packId: string;
  openedAt: string;
}

// ── Re-gradation ──────────────────────────────────────────────────────────
export const REGRADE_COST_USD = 20;

export interface RegradeResult {
  card: GameCard;
  oldGrade: Grade;
  newGrade: Grade;
  oldPrice: number;
  newPrice: number;
  delta: number; // newPrice - oldPrice (peut être négatif)
}

// ── Roue d'upgrade ────────────────────────────────────────────────────────
export const WHEEL_HOUSE_EDGE = 0.92; // 8 % de marge maison
export const WHEEL_MIN_RATIO = 0.1; // mise/cible minimum (sinon trop frustrant)
export const WHEEL_MAX_RATIO = 0.9; // mise/cible maximum (sinon pas excitant)

export interface WheelSpinInput {
  stake: InventoryItem[]; // cartes mises (chacune sera consommée si défaite)
  targetCardId: string; // carte cible (depuis le catalogue)
  targetGrade: Grade; // grade cible
}

export interface WheelSpinResult {
  probability: number; // P(succès) effective, [0,1]
  won: boolean;
  consumedItemIds: string[]; // toujours = stake.map(s=>s.id)
  rewardCard?: GradedCard; // si won
}

export interface BattleRoom {
  id: string;
  packId: string;
  packName: string;
  stake: number;
  maxPlayers: number;
  players: BattlePlayer[];
  status: "waiting" | "in-progress" | "finished";
  createdAt: string;
  winnerId?: string;
}

export interface BattlePlayer {
  userId: string;
  username: string;
  avatarInitial: string;
  card?: GameCard;
  ready: boolean;
}

export interface JackpotDeposit {
  userId: string;
  username: string;
  avatarInitial: string;
  depositValue: number;
  percentage: number;
  cardCount: number;
}

export interface JackpotRound {
  id: string;
  totalValue: number;
  endsAt: string;
  status: "open" | "drawing" | "closed";
  deposits: JackpotDeposit[];
  winnerId?: string;
  winnerName?: string;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  reward: number; // USD
  type: "daily" | "weekly";
  progress: number;
  goal: number;
  completed: boolean;
  icon: string;
}
