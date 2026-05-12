# GameFolio — Web App

> **Pivot (mai 2026)** : ce projet a pivoté du portfolio tracker (CardFolio) vers un
> casino TCG en monnaie fictive style Hellcase. Les anciennes sections de ce
> document parlent encore du portfolio — voir `ARCHITECTURE.md` pour la conception
> du nouveau système (caisses, PSA, regrade, roue, jackpot) et `DEPLOY.md` pour la
> mise en prod.

## Vision (nouvelle)

GameFolio est un casino TCG en **monnaie fictive uniquement** : on ouvre des caisses
thématiques (Kanto, Neo, Shinings, Cristaux…), on joue à la roue d'upgrade, on
défie d'autres joueurs en battle PvP, on dépose dans le jackpot communautaire.
$10 fictifs offerts à l'inscription, aucune CB requise, jamais.

**Aucun argent réel ne peut entrer ni sortir** — seul le tier VIP cosmétique est
payant (Stripe), mais ne donne aucun avantage de gameplay. C'est ce qui rend
le produit légal en France (art. 322-2-3 du Code de la sécurité intérieure).

Marché cible : France first (18+, géo-bloqué BE/NL), EUR pour la facturation VIP,
monnaie de jeu en `$` fictif.

## Vision (legacy CardFolio — pour mémoire)

CardFolio faisait pour les cartes Pokémon TCG ce que Coinbase fait pour la crypto :
transformer une collection éparpillée en patrimoine lisible, suivi en temps réel,
partageable avec dignité. Cette vision est désormais abandonnée.

---

## Stack — versions exactes proposées

| Couche          | Techno                                                          | Version  |
| --------------- | --------------------------------------------------------------- | -------- |
| Framework       | **Next.js** (App Router)                                        | 15.x     |
| Langage         | **TypeScript** strict                                           | 5.x      |
| UI              | **Tailwind CSS v4**                                             | 4.x      |
| Composants      | Primitives maison (`src/components/ui/`)                        | —        |
| Animations      | **Framer Motion**                                               | 11.x     |
| Charts          | **Recharts**                                                    | 2.x      |
| State client    | **Zustand**                                                     | 5.x      |
| State serveur   | **TanStack Query v5**                                           | 5.x      |
| Backend / BDD   | **Supabase** (Postgres + Auth + Edge Functions + Storage)       | SDK 2.x  |
| Auth            | Supabase Auth + **NextAuth v5** (optionnel Google/GitHub OAuth) | 5.x      |
| Paiements       | **Stripe** (Checkout + Customer Portal + Webhooks)              | SDK 17.x |
| Notifs          | **Resend** (emails transactionnels)                             | SDK 4.x  |
| Analytics       | **PostHog**                                                     | 1.x      |
| Crash reporting | **Sentry**                                                      | 8.x      |
| Lint / format   | **ESLint** (config Next.js) + **Prettier**                      | —        |
| Git hooks       | **Lefthook**                                                    | —        |

---

## Arborescence cible

```
src/
├── app/                          (Next.js App Router)
│   ├── layout.tsx                (root layout, providers, theme)
│   ├── page.tsx                  (landing / redirect vers /dashboard)
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── forgot-password/page.tsx
│   ├── (app)/
│   │   ├── layout.tsx            (sidebar + topbar, auth guard)
│   │   ├── dashboard/page.tsx    (HeroValueCard, sparkline, top movers)
│   │   ├── collection/
│   │   │   ├── page.tsx          (liste cartes, tri, filtres)
│   │   │   └── [id]/page.tsx     (fiche carte, courbe 30j)
│   │   ├── add/
│   │   │   ├── page.tsx          (search TCGdex + ajout manuel)
│   │   │   └── [catalogId]/page.tsx
│   │   ├── insights/page.tsx     (stats avancées, locked si free)
│   │   ├── wishlist/page.tsx
│   │   └── settings/
│   │       ├── account/page.tsx
│   │       ├── subscription/page.tsx
│   │       ├── notifications/page.tsx
│   │       └── export/page.tsx
│   └── api/
│       ├── webhooks/stripe/route.ts
│       └── prices/sync/route.ts
├── components/
│   ├── ui/                       (Button, Text, Card, Input, Badge, Skeleton)
│   ├── portfolio/                (HeroValueCard, Sparkline, AllocationDonut)
│   ├── cards/                    (CardListItem, CardDetailHeader, PriceChart)
│   └── layout/                   (Sidebar, Topbar, MobileNav)
├── lib/
│   ├── supabase/
│   │   ├── client.ts             (browser client)
│   │   └── server.ts             (server client + admin)
│   ├── tcgdex.ts                 (client API TCGdex)
│   ├── stripe.ts                 (Stripe SDK init)
│   ├── queryClient.ts
│   └── auth.ts
├── stores/                       (Zustand : sessionStore, prefsStore)
├── hooks/                        (useUserCards, usePortfolio, useCardPrice)
├── types/
│   ├── db.ts                     (types générés depuis le schéma SQL)
│   └── api.ts                    (types TCGdex, Stripe, etc.)
├── constants/
│   ├── theme.ts                  (design tokens)
│   └── env.ts                    (validation env vars)
└── utils/
    ├── formatCurrency.ts
    ├── formatDate.ts
    └── computeDiff.ts
```

---

## Conventions de code

- **Imports absolus** avec alias `@/*` mappé sur `src/*`
- **Named exports** uniquement pour les composants, default export pour les pages Next.js
- **PascalCase** pour les composants, **camelCase** pour les fonctions/hooks/variables
- **Hooks préfixés `use`**, stores Zustand suffixés `Store`
- Pas de logique métier dans les composants : extraire dans hooks ou stores
- **Aucun `any`**, aucun `// @ts-ignore`
- Commentaires en français quand utiles — pas de commentaires bavards
- **Une feature = un commit** conventionnel (`feat:`, `fix:`, `chore:`)

---

## Dépendances — liste complète avec justification

### Core

- `next@15` — App Router, Server Components, Route Handlers, streaming
- `react@19` + `react-dom@19` — peer deps Next.js 15
- `typescript@5` — strict mode

### UI / Styling

- `tailwindcss@4` — utility-first, configuration design tokens
- `framer-motion@11` — animations fluides (transitions pages, sparkline)
- `lucide-react` — icônes cohérentes, tree-shakable
- `recharts@2` — charts (PriceChart 30j, AllocationDonut, Sparkline)
- `clsx` + `tailwind-merge` — composition className sans conflits

### State / Data

- `@tanstack/react-query@5` — cache serveur, optimistic updates, refetch
- `zustand@5` — state client léger (session, préférences)

### Backend

- `@supabase/supabase-js@2` — client Supabase (BDD, Auth, Storage)
- `@supabase/ssr` — helpers Next.js pour cookies Supabase côté serveur

### Paiements

- `stripe@17` — SDK serveur Stripe (webhooks, Checkout Session)
- `@stripe/stripe-js` — SDK client (redirection Checkout)

### Communication

- `resend@4` — emails transactionnels (bienvenue, alertes prix)

### Formulaires / Validation

- `react-hook-form@7` — gestion formulaires (ajout carte, signup)
- `zod@3` — validation schéma (forms + API routes)

### Monitoring

- `@sentry/nextjs@8` — crash reporting
- `posthog-js` — analytics produit, funnels, sessions

### Dev / Qualité

- `eslint` + `eslint-config-next` — linting
- `prettier` — formatting
- `lefthook` — git hooks (lint + format avant commit)

---

## Variables d'environnement (`.env.local` — ne jamais committer)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# TCGdex
NEXT_PUBLIC_TCGDEX_BASE_URL=https://api.tcgdex.net/v2

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Resend
RESEND_API_KEY=

# PostHog
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Sentry
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=
```

---

## Design tokens (src/constants/theme.ts)

```ts
export const colors = {
  bg: {
    base: "#0A0E14",
    surface: "#131820",
    surfaceElev: "#1B2230",
    surfaceHi: "#232A3A",
  },
  border: {
    DEFAULT: "#252C3A",
    strong: "#313A4D",
  },
  text: {
    primary: "#F4F5F7",
    secondary: "#B8BFCC",
    muted: "#8B92A5",
    dim: "#5A6275",
  },
  accent: {
    positive: "#00D68F",
    negative: "#FF5577",
    warning: "#E8B339",
  },
  brand: {
    DEFAULT: "#5B7FFF",
    hi: "#7B97FF",
  },
} as const;

export const fontFamily = {
  display: ["Inter Tight", "sans-serif"],
  body: ["Inter", "sans-serif"],
};
```

---

## Ce que cette première session NE fait PAS

- Pas d'intégration Stripe active (env vars en place seulement)
- Pas de jobs Supabase Edge Functions
- Pas de charts réels (placeholder statique en v0)
- Pas de Sentry/PostHog actif
- Pas de tests (on en discute après le scaffold)
- Pas de Resend actif

---

## Roadmap des étapes de build

| Étape | Contenu                                          | Statut |
| ----- | ------------------------------------------------ | ------ |
| 1     | Ce fichier PROJECT.md                            | ✅     |
| 2     | Init Next.js + install deps + scaffold structure | ⏳     |
| 3     | Design tokens + Tailwind config + composants ui/ | ⏳     |
| 4     | Supabase client + auth screens + layout app      | ⏳     |
| 5     | Dashboard avec HeroValueCard mockée              | ⏳     |
