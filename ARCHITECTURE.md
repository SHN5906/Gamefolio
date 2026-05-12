# GameFolio — Architecture du système Lootbox + PSA + Regrade + Wheel

Document de conception du système de caisses (lootboxes) Pokémon TCG avec variantes
de gradation PSA, mini-jeu de re-gradation, et roue d'upgrade type L-Case.

---

## 1. Modèle de données

### 1.1 Pourquoi un modèle « carte + grade » et non « item unique par grade »

Un Dracaufeu Set de Base existe en 5+ états sur le marché :
**Raw**, **PSA 5**, **PSA 8**, **PSA 9**, **PSA 10**. Chaque état a son propre prix
(le PSA 10 peut valoir 50× le Raw). Plutôt que dupliquer la carte 5 fois dans le
catalogue, on factorise :

- **`cards`** : 1 ligne par carte (id TCGdex, nom, set, numéro, illustration)
- **`card_grade_prices`** : N lignes par carte (1 par grade), avec prix marché + source
- **`user_inventory_items`** : 1 ligne par instance possédée, clé composite `(user_id, card_id, grade)`

C'est la forme normale 3NF classique pour des items à variantes ; elle évite la
duplication, garde un référentiel propre, et permet de mettre à jour le prix
d'un grade sans toucher aux autres.

### 1.2 Schéma SQL

Voir `supabase/migrations/20260512000000_graded_items.sql`. Tables ajoutées :

```sql
-- Catalogue carte (identité du Pokémon dans son set, indépendant du grade)
create table cards (
  id              text primary key,           -- ex: 'base1-4' (TCGdex)
  name            text not null,
  name_fr         text not null,
  set_code        text not null,
  set_name_fr     text not null,
  number          text not null,
  rarity          text not null,
  energy          text not null,
  image_url       text,
  anim_tier       text not null default 'base'
);

-- Prix de marché par carte × grade (source de vérité monétaire)
create table card_grade_prices (
  card_id         text not null references cards(id) on delete cascade,
  grade           text not null,              -- 'raw' | 'psa-5' | 'psa-8' | 'psa-9' | 'psa-10'
  price_usd       numeric(10,2) not null,
  source          text not null,              -- 'pricecharting' | 'tcgplayer' | 'manual'
  source_ref      text,                       -- product_id externe pour le refetch
  updated_at      timestamptz not null default now(),
  primary key (card_id, grade)
);

-- Probabilités de grade par caisse × carte (overrides)
-- Si pas de ligne pour (pack_id, card_id), on tombe sur la table par défaut du pack
create table pack_card_grade_weights (
  pack_id         text not null,
  card_id         text not null,
  grade           text not null,
  weight          numeric(8,4) not null,      -- pondération relative (somme libre, normalisée à la volée)
  primary key (pack_id, card_id, grade)
);

-- Distribution de grade par défaut du pack (si pas d'override carte par carte)
create table pack_grade_defaults (
  pack_id         text not null,
  grade           text not null,
  weight          numeric(8,4) not null,
  primary key (pack_id, grade)
);

-- Inventaire utilisateur : 1 ligne par instance grade
create table user_inventory_items (
  id              bigserial primary key,
  user_id         uuid not null references auth.users(id) on delete cascade,
  card_id         text not null references cards(id),
  grade           text not null,
  acquired_at     timestamptz not null default now(),
  acquired_from   text not null,              -- 'pack' | 'regrade' | 'wheel' | 'admin'
  acquired_price  numeric(10,2) not null,     -- prix figé au moment de l'acquisition (pour P&L)
  is_locked       boolean not null default false  -- empêche revente pendant wheel/battle en cours
);

create index on user_inventory_items (user_id, card_id, grade);
create index on user_inventory_items (user_id, is_locked);
```

L'inventaire **n'agrège plus** par count : chaque instance est une ligne. Indispensable
pour pouvoir verrouiller une carte précise pendant un upgrade en cours, et pour
distinguer 2× PSA 9 acquis à des prix différents (P&L par instance).

### 1.3 Pourquoi `acquired_price` est figé

Sans ça, vendre une carte gagnée à 950 \$ aujourd'hui mais cotée à 1 200 \$ demain
ne permet pas de calculer la marge réelle de la plateforme. On stocke le prix au
moment T pour 1) afficher au joueur ce qu'il a « gagné », 2) auditer le ratio
de redistribution (RTP), 3) détecter des anomalies de prix marché.

---

## 2. Algorithme de tirage — Caisse > Carte > Grade

### 2.1 Vue d'ensemble

```
Ouverture caisse
   │
   ├─► (1) Tirage carte
   │       Roulette pondérée sur pack.cardPool[*].dropRate
   │       Output: cardId
   │
   ├─► (2) Tirage grade
   │       Si pack_card_grade_weights(pack_id, card_id) existe → utilise ces poids
   │       Sinon → utilise pack_grade_defaults(pack_id)
   │       Roulette pondérée → grade
   │
   ├─► (3) Lookup prix
   │       SELECT price_usd FROM card_grade_prices WHERE card_id = ? AND grade = ?
   │       Si null → fallback prix Raw + log d'alerte
   │
   └─► (4) Enregistrement
           INSERT user_inventory_items (card_id, grade, acquired_price=price_usd)
```

### 2.2 Pourquoi deux tirages séparés

Une approche naïve serait de définir directement « Dracaufeu PSA 10 » à 0,02 %
dans la pool. Mauvaise idée :

- Le catalogue explose (50 cartes × 5 grades = 250 entrées par caisse)
- Impossible de tuner la rareté du grade sans toucher à la rareté de la carte
- Impossible de définir des règles « les cartes communes sont jamais PSA 10 »
  (= mettre `weight=0` pour ce couple) de façon scalable

Le découpage en 2 étapes garde la rareté de la **carte** (identité Pokémon) séparée
de la rareté du **grade** (état physique), exactement comme dans le marché réel.

### 2.3 Pseudocode (TypeScript)

Implémentation dans `src/data/packs.ts` (fonctions `rollCard`, `rollGrade`, `rollPackOutcome`).

```ts
function weightedPick<T>(items: T[], weight: (t: T) => number): T {
  const total = items.reduce((s, i) => s + weight(i), 0);
  let r = Math.random() * total;
  for (const it of items) {
    r -= weight(it);
    if (r <= 0) return it;
  }
  return items[items.length - 1]; // sécurité flottants
}

export function rollPackOutcome(pack: Pack): {
  card: GameCard;
  grade: Grade;
  price: number;
} {
  // 1. Tirage carte
  const card = weightedPick(pack.cardPool, (c) => c.dropRate);

  // 2. Tirage grade (override carte > défaut pack)
  const weights = pack.gradeWeights[card.id] ?? pack.defaultGradeWeights;
  const grade = weightedPick(
    Object.entries(weights) as [Grade, number][],
    ([, w]) => w,
  )[0];

  // 3. Lookup prix (priceTable est rempli au boot via API)
  const price = priceTable[card.id]?.[grade] ?? priceTable[card.id]?.raw ?? 0;

  return { card, grade, price };
}
```

### 2.4 Garanties anti-exploit

- **Le tirage se fait côté serveur** (Edge Function `open-pack`), jamais côté client.
  Le client reçoit uniquement le résultat. Sinon, n'importe quel utilisateur ouvre
  la console et appelle `rollPackOutcome` 10 000 fois jusqu'à tomber sur le jackpot.
- **Le RNG utilise `crypto.randomUUID()` / `crypto.getRandomValues()`** et pas
  `Math.random()` qui est prédictible.
- **Audit log** : chaque tirage écrit `pack_openings(seed_hash, card_id, grade, price)`
  pour pouvoir prouver l'équité (provably fair) à la demande d'un joueur.

---

## 3. Mini-jeu de Re-gradation — 20 \$

### 3.1 Règles

L'utilisateur paie 20 \$ pour « re-grader » une carte de son inventaire :

1. La carte source est **détruite** (DELETE de l'instance).
2. Un nouveau tirage de grade est effectué sur la **même carte**, selon une table
   `regrade_grade_weights` (distinct des poids de pack — c'est plus aléatoire,
   le but est le frisson, pas le rendement).
3. Une nouvelle instance est créée avec `acquired_from='regrade'` et le prix du
   nouveau grade.

### 3.2 Distribution proposée (à tuner)

| Grade source → | Raw  | PSA 5 | PSA 8 | PSA 9 | PSA 10 |
| -------------- | ---- | ----- | ----- | ----- | ------ |
| **Raw**        | 35 % | 30 %  | 20 %  | 10 %  | 5 %    |
| **PSA 5**      | 25 % | 30 %  | 25 %  | 15 %  | 5 %    |
| **PSA 8**      | 15 % | 20 %  | 35 %  | 20 %  | 10 %   |
| **PSA 9**      | 10 % | 15 %  | 25 %  | 35 %  | 15 %   |
| **PSA 10**     | 8 %  | 12 %  | 20 %  | 35 %  | 25 %   |

Lecture : un PSA 9 a 15 % de chances de monter en PSA 10, mais aussi 10 % de
retomber en Raw (perte de gradation). C'est le risque-récompense demandé.

La table est stockée dans `regrade_distribution` côté DB pour pouvoir l'ajuster
sans déploiement.

### 3.3 EV (esperance) et rentabilité

Pour qu'on ne se fasse pas vider la caisse, l'EV du regrade doit être ≤ prix
de la source – marge. Avec les pondérations ci-dessus et les ratios de prix
typiques (PSA 10 = 10× Raw), l'EV moyenne du regrade est **proche du break-even
pour un PSA 8** et **négative pour un PSA 9/10** (la pénalité de chute domine).

L'admin DOIT lancer un script de simulation `scripts/simulate-regrade.ts`
avant tout déploiement pour vérifier le RTP global et ajuster la matrice.

### 3.4 API

```
POST /api/regrade
Body: { inventoryItemId: number }
Response: { oldGrade, newGrade, oldPrice, newPrice, delta }
```

Implémentation : `supabase/functions/regrade/index.ts`. Logique :

1. Vérifier que `user_balance.amount_usd >= 20`
2. Vérifier que l'instance appartient au user et n'est pas `is_locked`
3. Transaction : DELETE instance + INSERT nouvelle instance + UPDATE balance
4. Log dans `regrade_history` pour analytics

---

## 4. Roue d'Upgrade — Style L-Case

### 4.1 Concept

L'utilisateur sélectionne 1 à N cartes de son inventaire (somme des valeurs =
`stake`), choisit une carte cible du catalogue (valeur = `target`), et lance la
roue. La probabilité de succès est :

```
P(succès) = (stake × houseEdge) / target
```

`houseEdge` = 0.92 par défaut (8 % de marge maison). Sans ça, le jeu est
strictement EV=0 pour le joueur, ce qui n'est pas viable.

### 4.2 Contraintes

- `stake < target` (sinon le « upgrade » n'en est pas un)
- `stake / target ≥ 0.10` (sinon trop improbable, frustrant)
- `stake / target ≤ 0.90` (sinon pas excitant, et le HE devient ridicule)
- target ∈ catalogue (pas de carte « custom » créée par le joueur)

### 4.3 Tirage

Côté serveur :

```ts
const probability = (stake * HOUSE_EDGE) / target;
const roll = secureRandom(); // [0, 1)
const win = roll < probability;

if (win) {
  // user perd les cartes mises, gagne la carte cible
  // grade de la cible : tirage selon regrade_grade_weights pondéré par target value
} else {
  // user perd toutes les cartes mises
}
```

### 4.4 Visuel — roue interactive

Composant `src/components/game/UpgradeWheel.tsx` :

- SVG circulaire avec un arc vert de longueur = `probability × 360°`
- Pointer fixe en haut, roue qui tourne en `easeOut` 5-7s
- Position finale = `winning ? randomDans(arcVert) : randomDans(arcRouge)`
- Animation décorrélée du résultat (le résultat vient du serveur, l'animation
  ne fait que **mimer** la convergence vers ce résultat). Crucial pour éviter
  toute manipulation client.

### 4.5 Mise multi-carte

Sélectionner plusieurs cartes additionne leurs prix marché. Front affiche
en temps réel la probabilité projetée pour aider le joueur à doser sa mise.

### 4.6 API

```
POST /api/wheel/spin
Body: { stakeItemIds: number[], targetCardId: string }
Response: {
  won: boolean,
  probability: number,
  targetCard?: { card, grade, price },
  consumedItemIds: number[]
}
```

---

## 5. Intégration prix marché (PriceCharting / TCGPlayer)

### 5.1 Pourquoi pas en temps réel à chaque ouverture

- Latence : 200-500 ms par appel → impossible pour une UX d'ouverture < 100 ms
- Coût : PriceCharting est facturé à la requête
- Volatilité : on veut une **vue stable** pour calculer le RTP de la session

### 5.2 Stratégie : sync quotidien + override manuel

Edge Function `sync-card-grade-prices` schedulée via `pg_cron` à 02:00 UTC :

```
Pour chaque card_id dans cards :
  product_id = card.pricecharting_id  (mappé en seed)
  data = await fetch('https://www.pricecharting.com/api/product?id=' + product_id)

  upsert card_grade_prices :
    (card_id, 'raw',     data['loose-price'] / 100,        'pricecharting')
    (card_id, 'psa-5',   data['graded-price'] / 100,       'pricecharting')   # approximation
    (card_id, 'psa-8',   data['manual-only-price'] / 100,  'pricecharting')
    (card_id, 'psa-9',   data['box-only-price'] / 100,     'pricecharting')   # à mapper
    (card_id, 'psa-10',  data['new-price'] / 100,          'pricecharting')

  # log la variation pour alerter si > ±15 % en 24h (signal de manipulation marché)
```

> Note : les clés réelles de PriceCharting ne sont pas `manual-only-price` pour PSA 8.
> Il faut soit utiliser leur endpoint `/api/product` qui retourne tous les grades,
> soit utiliser **TCGPlayer Pricing API** qui expose explicitement `low/mid/high`
> et nécessite un mapping séparé pour PSA. En pratique on combinera :
>
> - **PriceCharting** pour PSA (champs explicites: `graded`, `box-only` etc.)
> - **TCGPlayer** pour Raw / Near-Mint (marché US le plus liquide)

### 5.3 Garantie de rentabilité

La marge globale de la plateforme = `prix payé pour la caisse – EV(payout)`.
Pour la garantir, **avant chaque sync de prix** on lance :

```
scripts/audit-rtp.ts
  For each pack:
    EV = Σ (card.dropRate × Σ (grade.weight × price[card,grade]))
    RTP = EV / pack.price
    if RTP > 0.85: ALERT — pack pas rentable, augmenter prix ou baisser drop rates
```

Si une carte explose en prix (Dracaufeu × 3 du jour au lendemain), l'algo détecte
que le pack est devenu déficitaire et **désactive** automatiquement le pack
(`is_active=false` dans `pack_grade_defaults`) jusqu'à arbitrage admin.

### 5.4 Adapter

Code dans `src/lib/prices/` :

- `pricecharting.ts` — adapter PriceCharting API
- `tcgplayer.ts` — adapter TCGPlayer API
- `aggregator.ts` — combine les deux sources, choisit la meilleure par grade
- `cache.ts` — cache mémoire local pour les ouvertures rapides (rechargé toutes
  les 5 min depuis `card_grade_prices`)

---

## 6. Migration depuis l'existant

L'inventaire actuel agrège par `cardId` (count). On le convertit :

```sql
INSERT INTO user_inventory_items (user_id, card_id, grade, acquired_price)
SELECT user_id, card_id, 'raw', card_value
FROM user_inventory
CROSS JOIN LATERAL generate_series(1, count);
```

Toutes les cartes existantes sont marquées Raw (état par défaut). Aucune
donnée perdue. Les anciennes routes API restent compatibles via une vue
`user_inventory_legacy` qui agrège.

---

## 7. Suite

Liste des fichiers touchés / créés :

- `src/types/game.ts` — nouveaux types `Grade`, `GradedCard`, `InventoryItem`
- `src/data/packs.ts` — `rollGrade`, `rollPackOutcome`, distributions par défaut
- `src/lib/data/game.ts` — adapter inventaire, regrade
- `src/lib/data/wheel.ts` — logique roue d'upgrade
- `src/lib/prices/` — adapters PriceCharting + TCGPlayer
- `src/components/game/RegradeModal.tsx` — UI re-gradation
- `src/components/game/UpgradeWheel.tsx` — UI roue
- `src/app/(app)/game/regrade/page.tsx` — page sélection carte à re-grader
- `src/app/(app)/game/wheel/page.tsx` — page upgrade
- `supabase/migrations/20260512000000_graded_items.sql` — schéma DB
- `supabase/functions/regrade/` — Edge Function regrade serveur
- `supabase/functions/wheel-spin/` — Edge Function roue serveur
- `supabase/functions/sync-card-grade-prices/` — sync prix quotidien

Tests à écrire (suite) :

- `tests/algo/rollPackOutcome.test.ts` — distribution sur 100k tirages
- `tests/algo/wheelProbability.test.ts` — ratio probabilité = stake/target × HE
- `tests/algo/regradeEV.test.ts` — EV par grade source dans la fourchette attendue
