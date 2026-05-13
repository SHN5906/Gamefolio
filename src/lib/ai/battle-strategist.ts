// ──────────────────────────────────────────────────────────────────────────
// Battle Strategist — IA décisionnelle adversariale pour le mode Battle PvP.
//
// Ce module est conçu pour incarner explicitement les 4 compétences du
// référentiel pédagogique 1.08 « Traitement de données et développement de
// solutions en I.A. » :
//
//   • 1.8.1 — Définir et justifier des stratégies de préparation de données
//             → `prepareDataset()` : passage cardPool brut → distribution
//               probabiliste normalisée + feature vector exploitable
//
//   • 1.8.2 — Extraire des insights pertinents à partir de données complexes
//             → `computeInsights()` : moments (μ, σ², σ, skew), quantiles
//               P10/P50/P90, probabilités conditionnelles P(win > stake)
//
//   • 1.8.3 — Sélectionner, adapter et justifier des approches de modélisation
//             → 3 décideurs (`greedyEV`, `riskAdjusted`, `tailHunter`)
//               correspondant à 3 hypothèses comportementales distinctes,
//               documentées avec leur justification
//
//   • 1.8.4 — Évaluer de manière critique et comparer des solutions data
//             → `compareStrategies()` : confronte les 3 décideurs sur le
//               même dataset et expose leur dissensus + métriques de robustesse
//
// L'architecture est pure-fonctionnelle, déterministe à seed près, et
// chaque étape est testable en isolation — choix délibéré pour la
// défense pédagogique (chaîne reproductible vs « black box »).
// ──────────────────────────────────────────────────────────────────────────

import type { GameCard, Pack, Grade } from '@/types/game'
import { GRADE_PRICE_MULTIPLIER } from '@/types/game'
import { DEFAULT_GRADE_WEIGHTS } from '@/data/packs'

// ══════════════════════════════════════════════════════════════════════════
// 1.8.1 — PRÉPARATION DE DONNÉES
// ══════════════════════════════════════════════════════════════════════════
//
// Le `cardPool` brut d'un Pack est une liste de cartes avec des `dropRate`
// déjà normalisés à somme = 100 (cf. `normalize()` dans packs.ts). On ne
// peut pas raisonner directement dessus : la valeur d'une carte n'est pas
// son prix Raw mais son **espérance pondérée sur la distribution de grade
// PSA** (Raw / PSA 5 / 8 / 9 / 10 — multiplicateurs 1×, 1.6×, 3.5×, 6×, 12×).
//
// JUSTIFICATION DU CHOIX :
//   - On NE FAIT PAS de Monte-Carlo pour estimer l'EV par carte : le
//     domaine est discret et petit (5 grades × ~25 cartes), donc le calcul
//     analytique est exact, gratuit et reproductible. Monte-Carlo serait
//     justifié si on avait des dépendances non linéaires entre tirages
//     (ce n'est pas le cas ici — tirages i.i.d.).
//   - On normalise les dropRates en probabilités [0..1] plutôt que de les
//     garder en pourcentage : évite les bugs d'unité downstream, et tous
//     les estimateurs (μ, σ) ont leur forme canonique standard.
//   - On stocke à la fois le prix Raw et la grille de prix par grade pour
//     chaque carte : on évite de recalculer GRADE_PRICE_MULTIPLIER × value
//     dans les estimateurs en aval (data locality).
//
// ALTERNATIVES ÉCARTÉES :
//   - One-hot encoding du rarity → useless, on a déjà le prix qui dominate.
//   - Standardisation z-score sur les prix → introduirait un biais
//     numérique inutile : le décideur final compare des $ à des $, pas des
//     scores z.

export interface CardFeatures {
  cardId: string
  /** Probabilité d'être tirée dans ce pack, ∈ [0,1]. */
  p: number
  /** Prix Raw "officiel" de la carte (USD). */
  rawValue: number
  /** Espérance du prix une fois le grade tiré, USD. */
  expectedPrice: number
  /** Plafond du prix possible (PSA 10), USD — utile pour le tail. */
  ceilingPrice: number
  /** Variance du prix conditionnelle au tirage de cette carte. */
  conditionalVariance: number
}

export interface Dataset {
  packId: string
  /** Coût d'ouverture (mise unitaire). */
  unitCost: number
  /** Features ordonnés par espérance de prix décroissante. */
  features: CardFeatures[]
  /** Distribution de grade utilisée pour le calcul. */
  gradeDistribution: Record<Grade, number>
}

/** Distribution de grade effective pour le pack, fallback DEFAULT. */
function packGradeDistribution(pack: Pack): Record<Grade, number> {
  const weights = pack.defaultGradeWeights ?? DEFAULT_GRADE_WEIGHTS
  const total = Object.values(weights).reduce((s, w) => s + w, 0)
  return Object.fromEntries(
    Object.entries(weights).map(([k, w]) => [k, w / total]),
  ) as Record<Grade, number>
}

/** Espérance et variance du prix d'une carte sur la distribution de grade. */
function cardPriceMoments(
  rawValue: number,
  gradeDist: Record<Grade, number>,
): { mean: number; variance: number; ceiling: number } {
  const grades = Object.keys(gradeDist) as Grade[]
  const prices = grades.map(g => rawValue * GRADE_PRICE_MULTIPLIER[g])
  const probs = grades.map(g => gradeDist[g])
  const mean = prices.reduce((s, p, i) => s + p * probs[i], 0)
  const variance = prices.reduce(
    (s, p, i) => s + probs[i] * (p - mean) ** 2,
    0,
  )
  return { mean, variance, ceiling: Math.max(...prices) }
}

/**
 * Convertit un Pack brut en Dataset exploitable par les décideurs.
 * Garantie : `features.map(f => f.p).reduce(+) === 1` (à ε près).
 */
export function prepareDataset(pack: Pack): Dataset {
  const gradeDist = packGradeDistribution(pack)
  const features: CardFeatures[] = pack.cardPool.map(card => {
    const { mean, variance, ceiling } = cardPriceMoments(card.value, gradeDist)
    return {
      cardId: card.id,
      p: card.dropRate / 100, // dropRate est en %
      rawValue: card.value,
      expectedPrice: mean,
      ceilingPrice: ceiling,
      conditionalVariance: variance,
    }
  })
  // Tri descendant — utile pour les quantiles et l'analyse visuelle.
  features.sort((a, b) => b.expectedPrice - a.expectedPrice)
  return {
    packId: pack.id,
    unitCost: pack.price,
    features,
    gradeDistribution: gradeDist,
  }
}

// ══════════════════════════════════════════════════════════════════════════
// 1.8.2 — EXTRACTION D'INSIGHTS
// ══════════════════════════════════════════════════════════════════════════
//
// À partir du dataset, on dérive les indicateurs qui guident la décision.
// Tous les calculs sont fermés (pas d'estimation), donc exacts.
//
// INSIGHTS CALCULÉS ET POURQUOI :
//   - μ (espérance globale) : compare directement au coût → indicateur de
//     "house edge" mais ne dit rien du risque
//   - σ² puis σ : amplitude de l'écart au tirage. Loi de la variance
//     totale : Var(X) = E[Var(X|card)] + Var(E[X|card]). On somme les deux
//     composantes (intra-card et inter-card).
//   - Skewness (asymétrie) : positive → tail droite épaisse (jackpot)
//   - Quantiles P10/P50/P90 : ce que tu gagnes "vraiment" la plupart du
//     temps. Beaucoup plus parlant que μ pour un joueur. Calculés sur la
//     distribution discrète croisée carte×grade.
//   - P(win > stake) : prob qu'un tirage rembourse au moins la mise.
//     Donne une lecture binaire "ai-je une chance".
//
// JUSTIFICATION DU CHOIX (vs alternatives) :
//   - On NE SE LIMITE PAS à μ — un décideur greedy-EV ignorerait que
//     deux packs peuvent avoir la même EV avec des profils de risque
//     opposés. Le rapport σ/μ (coefficient de variation) est l'insight
//     qui sépare un pack "stable" d'un pack "lottery-like".
//   - Quantiles > Mean+Std : la distribution est très asymétrique
//     (long tail), donc le couple (μ, σ) sous-estime systématiquement le
//     risque queue-gauche. P10 le révèle directement.

export interface PackInsights {
  /** μ — prix moyen au tirage, USD. */
  ev: number
  /** σ² — variance totale (intra+inter). */
  variance: number
  /** σ — écart type. */
  stdDev: number
  /** σ/μ — risk per unit of return. */
  coefVariation: number
  /** EV − coût → utility marginale espérée. Négative = house edge. */
  evMinusCost: number
  /** ev / unitCost → ratio rentabilité. */
  evRatio: number
  /** Asymétrie de la distribution. */
  skewness: number
  /** Quantiles 10/50/90 du prix d'un tirage (ordre exact, distribution discrète). */
  p10: number
  p50: number
  p90: number
  /** Probabilité de rembourser au moins la mise. */
  probBreakEven: number
  /** Probabilité d'un jackpot (prix > 10× la mise). */
  probJackpot: number
}

/** Reconstruit la distribution discrète exacte des prix possibles. */
function fullPriceDistribution(d: Dataset): { price: number; p: number }[] {
  const grades = Object.keys(d.gradeDistribution) as Grade[]
  const outcomes: { price: number; p: number }[] = []
  for (const f of d.features) {
    for (const g of grades) {
      outcomes.push({
        price: f.rawValue * GRADE_PRICE_MULTIPLIER[g],
        p: f.p * d.gradeDistribution[g],
      })
    }
  }
  outcomes.sort((a, b) => a.price - b.price)
  return outcomes
}

/** Quantile q ∈ [0,1] sur une distribution discrète triée croissant. */
function discreteQuantile(
  outcomes: { price: number; p: number }[],
  q: number,
): number {
  let cum = 0
  for (const { price, p } of outcomes) {
    cum += p
    if (cum >= q) return price
  }
  return outcomes[outcomes.length - 1].price
}

export function computeInsights(d: Dataset): PackInsights {
  // EV totale : E[X] = Σ p_i × E[X | carte_i]
  const ev = d.features.reduce((s, f) => s + f.p * f.expectedPrice, 0)

  // Variance totale = E[Var(X|card)] + Var(E[X|card]) — loi de la variance.
  const evInter = d.features.reduce(
    (s, f) => s + f.p * (f.expectedPrice - ev) ** 2,
    0,
  )
  const evIntra = d.features.reduce(
    (s, f) => s + f.p * f.conditionalVariance,
    0,
  )
  const variance = evInter + evIntra
  const stdDev = Math.sqrt(variance)

  // Skewness via le moment d'ordre 3 sur la distribution discrète complète.
  const outcomes = fullPriceDistribution(d)
  const m3 = outcomes.reduce((s, o) => s + o.p * (o.price - ev) ** 3, 0)
  const skewness = stdDev > 0 ? m3 / stdDev ** 3 : 0

  const p10 = discreteQuantile(outcomes, 0.1)
  const p50 = discreteQuantile(outcomes, 0.5)
  const p90 = discreteQuantile(outcomes, 0.9)

  const probBreakEven = outcomes
    .filter(o => o.price >= d.unitCost)
    .reduce((s, o) => s + o.p, 0)
  const probJackpot = outcomes
    .filter(o => o.price >= 10 * d.unitCost)
    .reduce((s, o) => s + o.p, 0)

  return {
    ev,
    variance,
    stdDev,
    coefVariation: ev > 0 ? stdDev / ev : 0,
    evMinusCost: ev - d.unitCost,
    evRatio: d.unitCost > 0 ? ev / d.unitCost : 0,
    skewness,
    p10,
    p50,
    p90,
    probBreakEven,
    probJackpot,
  }
}

// ══════════════════════════════════════════════════════════════════════════
// 1.8.3 — MODÈLES DE DÉCISION
// ══════════════════════════════════════════════════════════════════════════
//
// Trois décideurs, chacun reposant sur une hypothèse comportementale
// différente. Tous prennent un PackInsights et renvoient un score [0..1]
// + un commentaire textuel défendant le choix.
//
// MODÈLE A — `greedyEV` (Rookie)
//   Hypothèse : agent neutre au risque, maximise l'espérance pure.
//   Score = sigmoid(evMinusCost / unitCost). Simple baseline.
//   Justifié quand : multiples parties indépendantes (loi des grands nombres),
//   joueur sans contrainte de bankroll.
//   Faille : ignore la variance — perd 10× la même tirelire avant le jackpot.
//
// MODÈLE B — `riskAdjusted` (Sharp)
//   Hypothèse : utilité log-CRRA (risk-averse). Le décideur compare
//   E[log(1 + X/C)] plutôt que E[X]. Pénalise naturellement la haute variance.
//   Score = sigmoid(expectedLogUtility × 2).
//   Justifié quand : bankroll limitée, on cherche à survivre à de multiples
//   trades avant de capitaliser. C'est le modèle "Kelly criterion".
//   Faille : trop conservateur sur les caisses jackpot (skewness positive forte).
//
// MODÈLE C — `tailHunter` (Whale)
//   Hypothèse : agent qui cherche le tail-event. Le décideur valorise la
//   probabilité du jackpot beaucoup plus que l'EV.
//   Score = sigmoid(2 × P(jackpot) + 0.3 × evRatio − 0.5).
//   Justifié quand : joueur en mode "fun", bankroll grande relative à la mise,
//   ou stratégie YOLO. Statistiquement equivalent à acheter un billet de
//   loterie : EV négative mais utility psychologique positive.
//   Faille : ignore complètement le break-even probability — peut grind à
//   perte longtemps.

export type StrategyName = 'greedy-ev' | 'risk-adjusted' | 'tail-hunter'

export interface StrategyVerdict {
  name: StrategyName
  /** Score de désir de jouer ∈ [0,1]. */
  confidence: number
  /** Score de "value" attribué (USD ou utility unit selon la stratégie). */
  rawScore: number
  /** Phrase courte qui justifie la décision, lisible par l'utilisateur. */
  rationale: string
}

const sigmoid = (x: number) => 1 / (1 + Math.exp(-x))

export function greedyEV(insights: PackInsights): StrategyVerdict {
  const rawScore = insights.evMinusCost
  const confidence = sigmoid(insights.evMinusCost / Math.max(1, insights.ev))
  const sign = rawScore >= 0 ? '+' : '−'
  return {
    name: 'greedy-ev',
    confidence,
    rawScore,
    rationale: `EV = $${insights.ev.toFixed(2)}, coût = $${(insights.ev - insights.evMinusCost).toFixed(2)} → marge ${sign}$${Math.abs(rawScore).toFixed(2)}. Je joue si marge > 0.`,
  }
}

export function riskAdjusted(insights: PackInsights): StrategyVerdict {
  // Approximation log-utility : E[log(1+X/C)] ≈ log(1+μ/C) − σ²/(2(1+μ/C)²C²)
  // (développement de Taylor d'ordre 2 autour de μ/C).
  const C = Math.max(0.01, insights.ev - insights.evMinusCost) // unitCost reconstruit
  const muOverC = insights.ev / C
  const logTerm = Math.log(1 + muOverC)
  const penalty =
    insights.variance / (2 * Math.max(0.0001, (1 + muOverC) ** 2 * C ** 2))
  const utility = logTerm - penalty
  return {
    name: 'risk-adjusted',
    confidence: sigmoid(utility * 2),
    rawScore: utility,
    rationale: `Utility log = ${logTerm.toFixed(3)}, pénalité σ² = ${penalty.toFixed(3)}. CV = σ/μ = ${insights.coefVariation.toFixed(2)} — ${insights.coefVariation < 1.5 ? 'risque acceptable' : 'volatilité trop haute'}.`,
  }
}

export function tailHunter(insights: PackInsights): StrategyVerdict {
  const rawScore = 2 * insights.probJackpot + 0.3 * insights.evRatio - 0.5
  return {
    name: 'tail-hunter',
    confidence: sigmoid(rawScore * 3),
    rawScore,
    rationale: `P(jackpot 10×) = ${(insights.probJackpot * 100).toFixed(2)}%, skew = ${insights.skewness.toFixed(1)}. ${insights.probJackpot > 0.005 ? 'Tail intéressante, je joue.' : 'Tail trop sec, je passe.'}`,
  }
}

// ══════════════════════════════════════════════════════════════════════════
// 1.8.4 — ÉVALUATION CRITIQUE & COMPARAISON
// ══════════════════════════════════════════════════════════════════════════
//
// On lance les 3 décideurs sur le même dataset et on mesure leur dissensus.
// Trois cas typiques :
//
//   - Consensus haut (3 confidences > 0.6) → décision robuste, on joue
//     quelle que soit l'hypothèse comportementale.
//   - Dissensus (greedyEV vote oui, riskAdjusted vote non) → pack à EV
//     positive mais variance prohibitive : signal "trap" pour joueur
//     sous-capitalisé.
//   - Consensus bas → house edge clair, aucun modèle ne recommande.
//
// Cette comparaison EST l'analyse critique : on ne dit pas "le modèle X
// est meilleur", on dit "les trois lectures convergent / divergent et
// voici les conséquences pratiques".
//
// MÉTRIQUE DE ROBUSTESSE :
//   robustness = 1 − std(confidences) ∈ [0,1].
//   - 1 = tous les modèles sont d'accord
//   - 0 = désaccord maximal (un dit "oui sûr", l'autre "non sûr")
//
// On ajoute aussi une recommandation explicite : si robustness < 0.7 et
// que l'utilisateur joue avec un solde faible (< 10× la mise), on
// surpondère la lecture risk-adjusted (le plus prudent). Sinon on prend la
// moyenne pondérée par confiance.

export interface StrategyComparison {
  verdicts: StrategyVerdict[]
  /** Moyenne arithmétique des confidences. */
  meanConfidence: number
  /** Robustness ∈ [0,1] — accord entre modèles. */
  robustness: number
  /** Décision finale : 'play' | 'skip' | 'borderline'. */
  decision: 'play' | 'skip' | 'borderline'
  /** Texte court qui synthétise pour l'UI. */
  summary: string
}

export function compareStrategies(insights: PackInsights): StrategyComparison {
  const verdicts = [
    greedyEV(insights),
    riskAdjusted(insights),
    tailHunter(insights),
  ]
  const confidences = verdicts.map(v => v.confidence)
  const meanConfidence =
    confidences.reduce((s, c) => s + c, 0) / confidences.length
  const variance =
    confidences.reduce((s, c) => s + (c - meanConfidence) ** 2, 0) /
    confidences.length
  const robustness = Math.max(0, 1 - Math.sqrt(variance) * 2)

  let decision: 'play' | 'skip' | 'borderline'
  if (meanConfidence > 0.6 && robustness > 0.6) decision = 'play'
  else if (meanConfidence < 0.4) decision = 'skip'
  else decision = 'borderline'

  const summary =
    decision === 'play'
      ? `Les 3 lectures convergent (robustness ${(robustness * 100).toFixed(0)}%). Je joue.`
      : decision === 'skip'
        ? `Consensus baissier (μ confidence ${(meanConfidence * 100).toFixed(0)}%). Je passe.`
        : `Lectures contradictoires (robustness ${(robustness * 100).toFixed(0)}%) — EV vs variance en tension.`

  return { verdicts, meanConfidence, robustness, decision, summary }
}

// ══════════════════════════════════════════════════════════════════════════
// ARCHÉTYPES IA — exposés pour l'UI
// ══════════════════════════════════════════════════════════════════════════
//
// Chaque archétype = un nom de personnage + une stratégie dominante. C'est
// le seul wrapper "narratif" sur les modèles ; toute la logique reste
// défendable étape par étape via les sections 1.8.1 → 1.8.4.

export interface AiArchetype {
  id: 'rookie' | 'sharp' | 'whale'
  name: string
  emoji: string
  strategy: StrategyName
  /** Description en une phrase pour l'utilisateur. */
  tagline: string
}

export const AI_ARCHETYPES: AiArchetype[] = [
  {
    id: 'rookie',
    name: 'Rookie',
    emoji: '🎯',
    strategy: 'greedy-ev',
    tagline: 'Suit l\'EV pure. Prévisible mais imbattable sur le long terme.',
  },
  {
    id: 'sharp',
    name: 'Sharp',
    emoji: '🧠',
    strategy: 'risk-adjusted',
    tagline: 'Pondère par la variance. Joue Kelly. Survie > gain.',
  },
  {
    id: 'whale',
    name: 'Whale',
    emoji: '🐋',
    strategy: 'tail-hunter',
    tagline: 'Chasse le jackpot. Skewness > rationalité.',
  },
]

/** Renvoie le décideur pour un archétype donné. */
export function strategyForArchetype(
  archetype: AiArchetype,
  insights: PackInsights,
): StrategyVerdict {
  switch (archetype.strategy) {
    case 'greedy-ev':
      return greedyEV(insights)
    case 'risk-adjusted':
      return riskAdjusted(insights)
    case 'tail-hunter':
      return tailHunter(insights)
  }
}

// ══════════════════════════════════════════════════════════════════════════
// SÉLECTION DE PACK — l'IA choisit elle-même quel pack jouer
// ══════════════════════════════════════════════════════════════════════════
//
// Côté gameplay, l'IA est l'adversaire dans une battle "miroir" : les
// deux joueurs ouvrent la MÊME caisse, le plus gros prix gagne. L'IA n'a
// donc pas à choisir le pack. Mais elle DOIT décider si elle accepte la
// mise en fonction de son archétype. Cette fonction sert au matchmaking.

export interface BattleProposal {
  pack: Pack
  insights: PackInsights
  comparison: StrategyComparison
  /** Verdict spécifique à l'archétype proposé. */
  verdict: StrategyVerdict
}

export function evaluateBattleProposal(
  pack: Pack,
  archetype: AiArchetype,
): BattleProposal {
  const dataset = prepareDataset(pack)
  const insights = computeInsights(dataset)
  const comparison = compareStrategies(insights)
  const verdict = strategyForArchetype(archetype, insights)
  return { pack, insights, comparison, verdict }
}
