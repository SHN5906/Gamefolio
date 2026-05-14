// Prism — moteur de coach 100 % local.
//
// Pas d'API, pas de clé. Toute la "compréhension" se fait par pattern-matching
// d'intents sur l'input normalisé (lowercase + sans accents). Les réponses
// utilisent les vraies données du jeu (PACKS, drop rates, formules) + le
// contexte runtime du joueur (solde, inventaire).
//
// Limites assumées :
// - Conversation simple (pas de mémoire au-delà du dernier tour).
// - Couverture finie : si rien ne matche, fallback avec menu des sujets connus.
// - Pas de NLP profond — un utilisateur qui écrit en pur argot ou très mal
//   orthographié peut tomber sur le fallback. C'est OK pour une V1.
//
// Si on veut un vrai LLM en V2, on garde la même interface `respond()` et
// on bascule l'implémentation côté serveur (route /api/coach/chat + Claude).

import { PACKS, priceForGrade } from "@/data/packs";
import {
  GRADE_PRICE_MULTIPLIER,
  REGRADE_COST_USD,
  WHEEL_HOUSE_EDGE,
} from "@/types/game";
import type { Grade } from "@/types/game";

// ── Types ────────────────────────────────────────────────────────────

export interface CoachContext {
  balance: number;
  inventoryCount: number;
  inventoryValue: number;
  username: string;
  topCards: Array<{ name: string; grade: Grade; price: number }>;
}

interface Intent {
  /** Identifiant pour debug — n'est pas montré à l'utilisateur. */
  id: string;
  /** Au moins un de ces tokens normalisés doit matcher l'input. */
  triggers: string[];
  /** Plus haut = vérifié en premier (gère les overlaps). */
  priority?: number;
  respond: (input: string, ctx: CoachContext) => string;
}

// ── Normalisation ────────────────────────────────────────────────────

function norm(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
}

function matches(input: string, triggers: string[]): boolean {
  const n = norm(input);
  return triggers.some((t) => n.includes(norm(t)));
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function fmtUsd(v: number): string {
  return `$${v.toFixed(2)}`;
}

// ── Intents ──────────────────────────────────────────────────────────

const INTENTS: Intent[] = [
  // Jeu responsable — priorité maximale, doit court-circuiter le reste
  {
    id: "responsible",
    priority: 100,
    triggers: [
      "j'ai perdu",
      "jai perdu",
      "j'arrete",
      "jarrete",
      "addict",
      "trop joue",
      "trop joué",
      "auto-exclusion",
      "auto exclusion",
      "aide jeu",
      "jeu compulsif",
    ],
    respond: () =>
      `Je t'arrête tout de suite : si tu sens que tu joues trop, ça compte plus que tout le reste.

**Joueurs Info Service** — **09 74 75 13 13** (gratuit, 8h-2h, 7j/7).

Tu peux aussi t'auto-exclure depuis tes **Paramètres → Jeu responsable** (verrouillage 24h, 7j, ou définitif).

Aucune partie ne vaut une descente. Prends soin de toi.`,
  },

  // Greeting
  {
    id: "greeting",
    priority: 10,
    triggers: [
      "salut",
      "bonjour",
      "hello",
      "hey",
      "yo",
      "coucou",
      "bonsoir",
      "wesh",
    ],
    respond: (_input, ctx) =>
      pick([
        `Salut **${ctx.username}** 👋 Qu'est-ce que je peux faire pour toi ?`,
        `Yo **${ctx.username}**. T'as ${fmtUsd(ctx.balance)} fictifs en poche, dis-moi ce que tu veux savoir.`,
        `Hey ${ctx.username}, prêt à ouvrir des caisses ? Demande-moi laquelle, ou comment marche la roue, ou autre chose.`,
      ]),
  },

  // Aide / commandes
  {
    id: "help",
    priority: 20,
    triggers: [
      "aide",
      "qu'est-ce que tu sais",
      "tu fais quoi",
      "tu sais quoi",
      "tu peux faire",
      "commandes",
      "help",
      "sujets",
    ],
    respond: () =>
      `Voilà ce que je sais faire :

- **Quelle caisse j'ouvre ?** — je regarde ton solde et te suggère
- **Comment marche la roue ?** / **Calcule X $ pour Y $** — formule + proba
- **C'est rentable de re-grader ?** — explication de l'EV
- **Battles**, **jackpot**, **drop rates**, **grades PSA** — explications mécaniques
- **Mon solde**, **mon inventaire** — récap rapide
- **Jeu responsable** — quand tu sens que c'est trop

Pose ta question naturellement, je m'en sortirai.`,
  },

  // Solde / inventaire
  {
    id: "balance",
    priority: 30,
    triggers: [
      "mon solde",
      "combien j'ai",
      "combien je possede",
      "mes cartes",
      "mon inventaire",
      "ma collection",
    ],
    respond: (_input, ctx) => {
      const top = ctx.topCards[0];
      const lines = [
        `**Solde** : ${fmtUsd(ctx.balance)} fictifs`,
        `**Inventaire** : ${ctx.inventoryCount} carte${ctx.inventoryCount > 1 ? "s" : ""} pour ${fmtUsd(ctx.inventoryValue)} de valeur totale`,
      ];
      if (top) {
        lines.push(
          `**Plus chère** : ${top.name} en ${gradeLabel(top.grade)} — ${fmtUsd(top.price)}`,
        );
      }
      return lines.join("\n");
    },
  },

  // Calcul wheel proba — "j'ai 50 $ je vise 200 $"
  {
    id: "wheel_proba",
    priority: 50,
    triggers: ["vise", "cible", "mise", "roue", "wheel", "upgrade"],
    respond: (input, ctx) => {
      // Cherche deux nombres dans l'input — premier = mise, deuxième = cible
      const nums = (input.match(/\d+(?:[.,]\d+)?/g) ?? [])
        .map((n) => parseFloat(n.replace(",", ".")))
        .filter((n) => !Number.isNaN(n) && n > 0);
      if (nums.length >= 2) {
        const [stake, target] = nums;
        if (stake >= target) {
          return `Ta mise (${fmtUsd(stake)}) est ≥ ta cible (${fmtUsd(target)}). Tu mises plus que ce que tu vises — choisis une cible plus chère, sinon ça n'a aucun sens.`;
        }
        const ratio = stake / target;
        if (ratio < 0.1) {
          return `Ratio ${(ratio * 100).toFixed(1)} % — c'est en-dessous du minimum jouable (10 %). Mise plus, ou vise moins haut.`;
        }
        if (ratio > 0.9) {
          return `Ratio ${(ratio * 100).toFixed(1)} % — c'est au-dessus du max jouable (90 %). À ce stade c'est presque acquis, pas intéressant. Baisse la mise.`;
        }
        const proba = (stake * WHEEL_HOUSE_EDGE) / target;
        return `Pour **${fmtUsd(stake)}** misés sur une cible à **${fmtUsd(target)}** :

- **Probabilité de gain** : ${(proba * 100).toFixed(1)} %
- **Formule** : (${stake.toFixed(0)} × 0,92) / ${target.toFixed(0)} = ${proba.toFixed(3)}
- House edge : 8 %

Si tu perds, la mise est consommée. ${proba > 0.5 ? "Plutôt safe." : proba > 0.3 ? "Pari moyen." : "Tu tentes ta chance."}`;
      }
      // Pas de chiffres → explication générale
      return `**Roue d'upgrade** — tu mises N cartes pour tenter une cible plus chère.

- **Probabilité** = (valeur_mise × 0,92) / valeur_cible
- House edge : 8 %
- Ratio mise/cible doit être entre **10 %** et **90 %**
- Si tu perds, la mise est consommée

Donne-moi tes deux chiffres (ex: "200 vise 500") et je te calcule la proba.`;
    },
  },

  // Quelle caisse ouvrir
  {
    id: "pack_recommend",
    priority: 40,
    triggers: [
      "quelle caisse",
      "ouvrir une caisse",
      "quoi ouvrir",
      "caisse abordable",
      "recommandation",
      "recommend",
      "conseille",
      "suggestion caisse",
    ],
    respond: (_input, ctx) => {
      const affordable = PACKS.filter((p) => p.price <= ctx.balance);
      if (affordable.length === 0) {
        const cheapest = [...PACKS].sort((a, b) => a.price - b.price)[0];
        return `T'as ${fmtUsd(ctx.balance)} fictifs en poche — pas assez pour ouvrir quoi que ce soit. La plus accessible reste **${cheapest.nameFr}** à ${fmtUsd(cheapest.price)}.

Tu peux soit attendre le cooldown (2h) pour 5 $ rebonus, soit revendre une carte de ton inventaire (${fmtUsd(ctx.inventoryValue)} disponible).`;
      }
      // Tri par "fun rapport au budget" — ~20-40 % du solde = sweet spot
      const sweetMin = ctx.balance * 0.15;
      const sweetMax = ctx.balance * 0.5;
      const sweet = affordable
        .filter((p) => p.price >= sweetMin && p.price <= sweetMax)
        .sort((a, b) => b.price - a.price)
        .slice(0, 3);
      const list = (sweet.length > 0 ? sweet : affordable.slice(0, 3))
        .map(
          (p) =>
            `- **${p.nameFr}** ${p.emoji} — ${fmtUsd(p.price)} (${p.cardPool.length} cartes possibles)`,
        )
        .join("\n");
      return `Avec ${fmtUsd(ctx.balance)}, voici ce que je verrais :

${list}

Mon avis : reste autour de **20-40 %** de ton solde par ouverture — assez pour que ça pique sans te ruiner d'un coup.`;
    },
  },

  // Drop rates général
  {
    id: "drop_rates",
    priority: 35,
    triggers: [
      "drop rate",
      "drop table",
      "probabilites caisse",
      "probas caisse",
      "chances caisse",
    ],
    respond: () =>
      `Chaque ouverture est un **tirage 2-étages** :

1. **Carte** tirée selon \`dropRate\` du pack (chaque carte a son %)
2. **Grade** tiré ensuite : Raw / PSA 5 / PSA 8 / PSA 9 / PSA 10

**Important** : les cartes commune/uncommon ne peuvent PAS sortir en PSA 10 — économiquement absurde dans la vraie vie.

**Multiplicateurs de prix par grade** :
- Raw × 1
- PSA 5 × 1,6
- PSA 8 × 3,5
- PSA 9 × 6
- PSA 10 × 12

Ouvre une caisse, scroll en bas → "Drop table" pour voir les % exacts.`,
  },

  // Regrade
  {
    id: "regrade",
    priority: 40,
    triggers: ["regrade", "re-grade", "regrader", "re-grader"],
    respond: () =>
      `**Re-gradation** — ${REGRADE_COST_USD} $ fictifs.

- Détruit ta carte, retire un grade au hasard sur la même carte
- Tu peux **monter** (PSA 5 → PSA 10, jackpot)
- Tu peux **descendre** (PSA 9 → Raw, perte sèche)
- Tu peux **stagner**

**EV moyenne** :
- Break-even autour d'un **PSA 8**
- **Négative** sur PSA 9 et PSA 10 (la pénalité de chute domine)

Mon avis : le regrade c'est un fun feature, pas un investissement. Fais-le sur une PSA 5 ou 8 pour tenter le coup, jamais sur une PSA 9/10 que tu veux garder.`,
  },

  // Roue (sans chiffres) — fallback si wheel_proba ne capte pas le calcul
  {
    id: "wheel_general",
    priority: 30,
    triggers: [
      "comment marche la roue",
      "expliquer roue",
      "cest quoi la roue",
      "c'est quoi la roue",
    ],
    respond: () =>
      `**Roue d'upgrade** :

- Mise N cartes de ton inventaire (somme = mise)
- Choisis une carte cible (carte + grade)
- **Probabilité** = (valeur_mise × 0,92) / valeur_cible
- Si tu gagnes : tu reçois la cible. Si tu perds : tu perds toute la mise.

**Contraintes** :
- Ratio mise/cible entre 10 % et 90 %
- Plus la mise est proche de la cible, plus la proba est haute (mais le gain net plus faible)

Ex: 200 misés sur 500 = (200 × 0,92) / 500 = **36,8 %** de chance.

Pour un calcul précis, dis-moi tes chiffres ("100 sur 400").`,
  },

  // Battles
  {
    id: "battles",
    priority: 30,
    triggers: ["battle", "battles", "pvp", "combat", "1v1"],
    respond: () =>
      `**Battles PvP** :

- Deux joueurs misent la **même caisse**
- Les deux ouvrent en simultané
- **Le meilleur drop rafle les deux cartes**

C'est de la pure variance — pas de skill, juste qui tire le mieux. Bon pour le frisson, mauvais pour la rationalité économique (EV neutre - le house edge).

Pose-toi la question : t'es là pour le fun ou pour l'optimisation ? Si c'est l'optim, ouvre solo.`,
  },

  // Jackpot
  {
    id: "jackpot",
    priority: 30,
    triggers: ["jackpot", "pot communautaire", "tirage commun", "pot commun"],
    respond: () =>
      `**Jackpot communautaire** :

- Pot collectif alimenté par les dépôts (cartes converties en valeur fictive)
- **Tirage proportionnel** à ta valeur déposée
- Ex: tu déposes 100 $ sur un pot de 1000 $ → 10 % de chance de tout rafler
- Reset toutes les ~10 minutes

Mathématiquement équitable (EV = 0 hors house edge éventuel), mais le gain max est énorme. Bon pari occasionnel, mauvaise stratégie de fond.`,
  },

  // Grades PSA
  {
    id: "grades",
    priority: 30,
    triggers: ["grade", "psa", "raw", "gradation", "gradage"],
    respond: () =>
      `**Système de grades** — chaque carte gagnée a un état :

- **Raw** : non gradée (× 1)
- **PSA 5** : moyen (× 1,6)
- **PSA 8** : bon (× 3,5)
- **PSA 9** : très bon (× 6)
- **PSA 10** : Gem Mint (× 12)

Multipliers appliqués au prix de base de la carte. Un Dracaufeu Set de Base Raw à 350 $ devient 4 200 $ en PSA 10.

Les commune/uncommon ne montent **jamais** au-dessus de PSA 5 dans le jeu (réalisme marché).`,
  },
];

// ── API publique ─────────────────────────────────────────────────────

export function respondLocal(input: string, ctx: CoachContext): string {
  // Trie par priorité (descending) — première qui match gagne
  const sorted = [...INTENTS].sort(
    (a, b) => (b.priority ?? 0) - (a.priority ?? 0),
  );
  for (const intent of sorted) {
    if (matches(input, intent.triggers)) {
      return intent.respond(input, ctx);
    }
  }
  // Fallback
  return `Je n'ai pas saisi — je suis bon sur les **mécaniques du jeu** (caisses, roue, regrade, battles, jackpot, grades PSA) et sur ton **état perso** (solde, inventaire).

Tape **aide** pour la liste des sujets, ou reformule autrement.`;
}

// ── Utils ────────────────────────────────────────────────────────────

function gradeLabel(g: Grade): string {
  return g === "raw" ? "RAW" : g.toUpperCase().replace("-", " ");
}

// Expose pour les tests / debug
export const _internals = { INTENTS, norm, matches };
// Évite "unused" sur les imports de constantes (typecheck strict)
void GRADE_PRICE_MULTIPLIER;
void priceForGrade;
