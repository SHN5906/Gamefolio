# 🟢 Setup Supabase — CardFolio

Guide pas à pas pour brancher CardFolio à un vrai Supabase.

## 1. Créer le projet Supabase

1. Va sur https://supabase.com → **New project**
2. Choisis :
   - **Name** : `cardfolio` (ou ce que tu veux)
   - **Database password** : génère un mot de passe fort, sauvegarde-le
   - **Region** : `eu-central-1` (Francfort) ou `eu-west-2` (Londres) pour la France
3. Attends ~2 min que ça se provisionne

## 2. Récupérer les clés API

1. Dans le dashboard Supabase → **Settings** → **API**
2. Copie :
   - **Project URL** (`https://xxxxx.supabase.co`)
   - **Project API keys → anon / public**

## 3. Configurer `.env.local`

À la racine du projet, crée un fichier `.env.local` :

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

## 4. Lancer la migration SQL

1. Dans le dashboard Supabase → **SQL Editor** → **New query**
2. Copie tout le contenu de `supabase/migrations/0001_initial_schema.sql`
3. Clique **Run** (ou Ctrl+Enter)
4. Tu devrais voir "Success. No rows returned" → toutes les tables sont créées avec RLS activée

### Vérification rapide
Va dans **Database → Tables** : tu dois voir `profiles`, `card_catalog`, `card_prices`, `user_cards`, `user_sealed`, `wishlist_items`, `portfolio_snapshots`.

## 5. Redémarrer le serveur Next.js

```bash
# Ctrl+C pour arrêter
npm run dev
```

## 6. Créer ton premier compte

1. Va sur http://localhost:3334/signup
2. Crée un compte (n'importe quel email valide)
3. Vérifie ta boîte mail → confirme l'email
4. Login → tu arrives sur le dashboard

> **Astuce dev** : pour skip la confirmation email, va dans Supabase → **Authentication → Providers → Email** → décoche `Confirm email`.

## 7. (Optionnel) Désactiver le mode démo

Si tu vois encore les données mockées après avoir setup Supabase, c'est que `NEXT_PUBLIC_SUPABASE_URL` n'est pas chargée. Vérifie :
- Le fichier `.env.local` est à la racine (pas dans `src/`)
- Tu as bien redémarré `npm run dev`
- Pas de typo dans les noms de variables

## 8. Charger le catalogue de cartes

### Option A : Seed rapide (pour tester immédiatement)

Lance la migration `0002_seed_catalog.sql` qui insère ~17 cartes populaires pour démarrer :

1. SQL Editor → New query
2. Colle le contenu de `supabase/migrations/0002_seed_catalog.sql`
3. Run

Tu peux maintenant ajouter ces cartes via `/add` (Dracaufeu ex, Mewtwo, Lugia VSTAR, etc.)

### Option B : Catalogue complet via Edge Function

Pour avoir **toutes** les cartes Pokémon (~17 000), il faut déployer l'Edge Function `sync-catalog`.

#### Pré-requis : installer Supabase CLI

```bash
# macOS
brew install supabase/tap/supabase

# Ou via npm
npm install -g supabase
```

#### Déployer la fonction

```bash
# À la racine du projet
supabase login           # browser auth
supabase link --project-ref <ton-project-ref>   # voir Settings → API
supabase functions deploy sync-catalog
```

#### Premier sync manuel

Récupère ta `service_role_key` (Settings → API → service_role) puis :

```bash
# Sync complet (~10 min, 17k cartes)
curl -X POST https://<ton-projet>.supabase.co/functions/v1/sync-catalog \
  -H "Authorization: Bearer <service_role_key>"

# Sync d'un seul set (pour tester)
curl -X POST "https://<ton-projet>.supabase.co/functions/v1/sync-catalog?setId=sv03" \
  -H "Authorization: Bearer <service_role_key>"

# Dry run (ne touche pas la DB)
curl -X POST "https://<ton-projet>.supabase.co/functions/v1/sync-catalog?dryRun=1" \
  -H "Authorization: Bearer <service_role_key>"
```

#### Cron quotidien (optionnel)

Pour que TCGdex se sync automatiquement chaque nuit :

1. Active les extensions `pg_cron` et `pg_net` (Database → Extensions)
2. Stocke les secrets dans le Vault (Database → Vault → Add new secret) :
   - `project_url` = `https://<ton-projet>.supabase.co`
   - `service_role_key` = ta clé service_role
3. Lance la migration `0003_pg_cron_sync.sql`

Vérification :
```sql
select * from cron.job;
select * from cron.job_run_details order by start_time desc limit 5;
```

---

## Architecture du data layer

```
src/lib/data/         ← Server actions (CRUD via @supabase/ssr)
  ├ cards.ts          → fetchUserCards / createUserCard / etc.
  ├ sealed.ts         → fetchUserSealed / etc.
  └ wishlist.ts       → fetchWishlist / etc.

src/hooks/            ← React Query wrappers (pour Client Components)
  ├ useUserCards.ts
  ├ useUserSealed.ts
  ├ useWishlist.ts
  └ useCollectionData.ts  ← Hybride : Supabase OU mocks selon env
```

## RLS — comment ça marche

Toutes les tables utilisateur ont une policy `auth.uid() = user_id`. Donc :
- Tu ne peux **pas** lire les cartes d'un autre user (même avec son ID)
- Les server actions tournent avec le JWT du user via cookies → l'RLS filtre auto
- Le catalog (`card_catalog`, `card_prices`) est en lecture publique

## Mode démo (fallback)

Si `NEXT_PUBLIC_SUPABASE_URL` n'est pas définie, l'app tourne avec les mocks de `lib/mock.ts`. Très pratique pour :
- Démos / screenshots / Loom
- Pull request sans setup Supabase
- Showcase sur ton site portfolio

## Prochaines étapes

- [ ] Edge Function `sync-catalog` (cron quotidien TCGdex → `card_catalog`)
- [ ] Edge Function `sync-prices` (cron Cardmarket → `card_prices`)
- [ ] Edge Function `daily-snapshot` (cron user-by-user → `portfolio_snapshots`)
- [ ] Storage bucket `avatars` pour les photos de profil
- [ ] Realtime sur `card_prices` pour push les variations en live
