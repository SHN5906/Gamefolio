# Déployer GameFolio en production

Guide de mise en prod sur Vercel + Supabase. Estimé 60 min si tout va bien.

## Phase 1 — Vercel (frontend)

1. `vercel login` puis `vercel link` à la racine du repo (équipe Vercel cible).
2. Pousse le repo sur GitHub. Importe-le dans Vercel : framework = Next.js, root
   dir = `/`, build command par défaut.
3. Variables d'environnement : copie le contenu de `.env.local.example`,
   remplis les valeurs prod (voir Phase 2 pour Supabase, Phase 3 pour Stripe).
4. Domaine : ajoute `gamefolio.app` (et `www`) dans Vercel → DNS.
5. Vérifie que les redirects 301 dans `next.config.ts` sont actifs
   (`/dashboard`, `/add`, `/wishlist`, `/insights`, `/collection`, `/card/:id`).

## Phase 2 — Supabase (auth + base de données)

1. Crée un projet **région Frankfurt** (EU). Note l'URL + anon key + service role key.
2. Renseigne `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY` dans Vercel.
3. Lance les migrations dans `supabase/migrations/` dans l'ordre :
   - `0001_initial_schema.sql` (profiles, etc.)
   - `0002_seed_catalog.sql` (catalogue de base)
   - `0003_pg_cron_sync.sql`
   - `0004_sealed_image.sql`
   - `0005_catalog_write_policy.sql`
   - `0006_fix_price_view.sql`
   - `0007_fix_prices_rls.sql`
   - `20260501000000_game_tables.sql` (user_balance, inventory, battles…)
   - `20260512000000_graded_items.sql` (PSA variants — voir `ARCHITECTURE.md`)
4. Active Auth → Email/Password. Ajoute l'URL prod dans la liste des redirect URLs.
5. Storage : crée le bucket `avatars` (public read, write authenticated).
6. **Mettre les tirages côté serveur (CRITIQUE — voir Phase 5)**.

## Phase 3 — Stripe (VIP)

Le tier VIP cosmétique reste optionnel — sans Stripe configuré, le bouton VIP
renvoie vers `/signup` mais ne déclenche pas de paiement.

1. Crée un compte Stripe (mode test d'abord).
2. Crée deux produits : `Plus 4.99/mo` et `VIP 14.99/mo`. Copie les Price IDs.
3. Renseigne dans Vercel : `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`,
   `STRIPE_PRICE_ID_PLUS`, `STRIPE_PRICE_ID_VIP`, `STRIPE_WEBHOOK_SECRET`.
4. Configure le webhook Stripe vers `https://gamefolio.app/api/webhooks/stripe`
   (à coder en Phase 4, événements `checkout.session.completed`, `customer.subscription.*`).

## Phase 4 — Resend (emails) + PostHog + Sentry

* **Resend** : crée un domaine vérifié `gamefolio.app`, copie `RESEND_API_KEY`.
* **PostHog EU** : projet EU, copie la clé publique. Le SDK est déjà installé,
  reste à wrap l'app dans `<PostHogProvider>` (à faire — Phase 5).
* **Sentry** : projet `gamefolio`, copie le DSN. Wrap via `withSentryConfig` dans
  `next.config.ts` (à faire — Phase 5).

## Phase 5 — Travaux restants pour vraiment release-ready

**Tout ce qui suit est nécessaire avant un trafic significatif. La Phase 1
(rebrand + nettoyage texte) ne suffit pas pour la prod.**

### 5.a — Migrer les tirages côté serveur (CRITIQUE anti-triche)

Aujourd'hui `rollPackOutcome`, `regradeItem`, `spinWheel` s'exécutent **côté
client** (localStorage). N'importe quel utilisateur ouvre la console et appelle
`rollPackOutcome(pack)` à l'infini. À faire :

1. Créer Edge Functions Supabase :
   - `supabase/functions/open-pack/index.ts` — débite le solde, fait le tirage
     côté serveur, INSERT `pack_openings` + `user_inventory_items`
   - `supabase/functions/regrade/index.ts` — débite $20, supprime l'instance,
     re-tire un grade, INSERT nouvelle instance + `regrade_history`
   - `supabase/functions/wheel-spin/index.ts` — calcule la probabilité, tire,
     supprime la mise, INSERT reward + `wheel_history`
2. Côté client : remplacer les appels directs aux fonctions locales par des
   appels `supabase.functions.invoke('open-pack', { body: { packId } })`.
3. L'animation client (CaseOpener, UpgradeWheel) reste — elle ne fait que
   *mimer* la convergence vers le résultat retourné par le serveur.

### 5.b — Migrer l'inventaire de localStorage vers Supabase

`src/lib/data/game.ts` lit/écrit dans `localStorage`. À remplacer par des
appels Supabase via `@tanstack/react-query` (cache + optimistic updates).
La migration v1→v2 SQL (`20260512000000_graded_items.sql §10`) est prête.

### 5.c — Brancher PostHog + Sentry

Wrapper dans `src/app/layout.tsx` :
```tsx
<PostHogProvider>{children}</PostHogProvider>
```
+ `Sentry.init` dans `instrumentation.ts` (Next 15+).

### 5.d — Middleware géo-blocage

`src/middleware.ts` doit lire `request.geo?.country` (fourni par Vercel) et
renvoyer une page d'info pour `BE` et `NL`. La variable `BLOCKED_COUNTRIES`
définit la liste.

### 5.e — Cron sync prix marché

`supabase/functions/sync-card-grade-prices/index.ts` — appel quotidien
PriceCharting + TCGPlayer, upsert dans `card_grade_prices`. Schedulé via
`pg_cron`. Code adapter prêt dans `src/lib/prices/`.

### 5.f — Image OG

Créer `public/og-image.png` (1200×630, PNG ou JPG, < 200 KB). Doit reprendre
le logo GF + screenshot d'ouverture de caisse. Référencé dans `metadataBase`.

### 5.g — Anti-triche / rate limiting

Sur les Edge Functions :
* Limiter à N requêtes par seconde par utilisateur (Upstash Redis recommandé).
* Logger toute tentative > 10/sec comme suspicieuse.
* Captcha (hCaptcha/Turnstile) sur signup pour bloquer les bots multi-comptes.

### 5.h — Tests d'intégration

Au minimum :
* Test du `rollPackOutcome` sur 100 k tirages, vérifier la distribution
  ≤ 1% d'écart vs les drop rates.
* Test du wheel : `clampedProbability(stake, target)` == probabilité observée.
* Test du regrade : EV par grade dans la fourchette attendue.

### 5.i — i18n EN

Le marché US est massif pour les lootboxes TCG. `next-intl` ou `next-i18next`.
Tradire `fr` → `en`, garder `fr` par défaut sur `gamefolio.app/fr` et
`en` sur `gamefolio.app/en`.

## Objectif 1 M MAU — checklist marketing & SEO

* Une landing par caisse indexable (`/game/open/[packId]` — déjà dans le sitemap)
* OG personnalisée par caisse (à faire — `generateMetadata`)
* Programme de parrainage : `/r/[code]` (Phase 2)
* Leaderboard public top wins + top streak (Phase 2)
* Contenu : 1 article/semaine "Top 10 cartes les plus rares du set X"
* Discord communauté (linker dans le footer)
* Partenariats créateurs TCG sur YouTube/TikTok (commission par signup converti)

---

## Aide

Question ? `hello@gamefolio.app`
Bug urgent ? `security@gamefolio.app`
