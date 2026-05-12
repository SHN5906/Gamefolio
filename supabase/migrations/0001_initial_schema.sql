-- ╔════════════════════════════════════════════════════════════════════╗
-- ║  CardFolio — Schéma initial                                       ║
-- ║  Run this in Supabase SQL Editor (Settings > Database > SQL)     ║
-- ╚════════════════════════════════════════════════════════════════════╝

-- ── Extensions ──────────────────────────────────────────────────────
create extension if not exists "uuid-ossp" schema extensions;
create extension if not exists "pg_trgm";  -- recherche full-text rapide

-- ── Types énumérés ──────────────────────────────────────────────────
do $$ begin
  create type subscription_tier as enum ('free', 'pro', 'trader');
exception when duplicate_object then null; end $$;

do $$ begin
  create type currency as enum ('EUR', 'USD', 'GBP');
exception when duplicate_object then null; end $$;

do $$ begin
  create type card_language as enum ('fr', 'en', 'de', 'es', 'it', 'pt', 'jp');
exception when duplicate_object then null; end $$;

do $$ begin
  create type card_condition as enum ('NM', 'EX', 'GD', 'PL', 'PO');
exception when duplicate_object then null; end $$;

do $$ begin
  create type wish_priority as enum ('urgent', 'want', 'watching');
exception when duplicate_object then null; end $$;

do $$ begin
  create type sealed_type as enum ('display', 'etb', 'coffret', 'blister', 'deck', 'tin', 'bundle', 'promo');
exception when duplicate_object then null; end $$;

do $$ begin
  create type sealed_state as enum ('sealed', 'opened');
exception when duplicate_object then null; end $$;

-- ╔════════════════════════════════════════════════════════════════════╗
-- ║  TABLES                                                           ║
-- ╚════════════════════════════════════════════════════════════════════╝

-- ── 1. profiles ─────────────────────────────────────────────────────
-- Étend auth.users avec les infos métier
create table if not exists public.profiles (
  id                     uuid primary key references auth.users(id) on delete cascade,
  username               text unique,
  display_name           text,
  avatar_url             text,
  default_currency       currency not null default 'EUR',
  default_language       card_language not null default 'fr',
  subscription_tier      subscription_tier not null default 'free',
  subscription_renews_at timestamptz,
  created_at             timestamptz not null default now()
);

-- Trigger : créer un profil automatiquement à l'inscription
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── 2. card_catalog ─────────────────────────────────────────────────
-- Catalogue de cartes (synchronisé depuis TCGdex, partagé entre utilisateurs)
create table if not exists public.card_catalog (
  id              text primary key,           -- ex: 'sv03-006'
  tcgdex_id       text unique,                -- ID TCGdex
  name_fr         text,
  name_en         text,
  name_jp         text,
  set_id          text,
  set_name_fr     text,
  set_name_en     text,
  number          text,
  rarity          text,
  illustrator     text,
  image_url_low   text,
  image_url_high  text,
  release_date    date,
  hp              int,
  types           text[],
  variants        jsonb,
  updated_at      timestamptz not null default now()
);

create index if not exists idx_catalog_name_fr on public.card_catalog using gin (name_fr gin_trgm_ops);
create index if not exists idx_catalog_name_en on public.card_catalog using gin (name_en gin_trgm_ops);
create index if not exists idx_catalog_set on public.card_catalog (set_id);

-- ── 3. card_prices ──────────────────────────────────────────────────
-- Historique de prix (partagé, multi-source)
create table if not exists public.card_prices (
  id               bigserial primary key,
  card_id          text not null references public.card_catalog(id) on delete cascade,
  language         card_language not null default 'fr',
  variant          text not null default 'normal',
  condition        card_condition not null default 'NM',
  graded           boolean not null default false,
  grade            text,
  source           text not null default 'cardmarket',
  price_eur        numeric(10,2) not null,
  price_low_eur    numeric(10,2),
  price_avg_eur    numeric(10,2),
  price_trend_eur  numeric(10,2),
  captured_at      timestamptz not null default now()
);

create index if not exists idx_prices_card_captured on public.card_prices (card_id, captured_at desc);

-- ── 4. user_cards ───────────────────────────────────────────────────
-- Cartes possédées par l'utilisateur
create table if not exists public.user_cards (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users(id) on delete cascade,
  card_id            text not null references public.card_catalog(id) on delete restrict,
  language           card_language not null default 'fr',
  variant            text not null default 'normal',
  condition          card_condition not null default 'NM',
  graded             boolean not null default false,
  grade              text,
  quantity           int not null default 1 check (quantity > 0),
  purchase_price_eur numeric(10,2),
  purchase_date      date,
  notes              text,
  is_for_sale        boolean not null default false,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index if not exists idx_user_cards_user on public.user_cards (user_id);
create index if not exists idx_user_cards_card on public.user_cards (card_id);

-- Trigger pour updated_at
create or replace function public.set_updated_at()
returns trigger as $$ begin new.updated_at := now(); return new; end; $$ language plpgsql;

drop trigger if exists set_updated_at_user_cards on public.user_cards;
create trigger set_updated_at_user_cards before update on public.user_cards
  for each row execute function public.set_updated_at();

-- ── 5. user_sealed ──────────────────────────────────────────────────
-- Produits scellés (displays, ETB, coffrets…)
create table if not exists public.user_sealed (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users(id) on delete cascade,
  name               text not null,
  type               sealed_type not null,
  set_name           text,
  language           card_language not null default 'fr',
  state              sealed_state not null default 'sealed',
  quantity           int not null default 1 check (quantity > 0),
  purchase_price_eur numeric(10,2),
  current_value_eur  numeric(10,2),
  purchase_date      date,
  notes              text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index if not exists idx_user_sealed_user on public.user_sealed (user_id);

drop trigger if exists set_updated_at_user_sealed on public.user_sealed;
create trigger set_updated_at_user_sealed before update on public.user_sealed
  for each row execute function public.set_updated_at();

-- ── 6. wishlist_items ───────────────────────────────────────────────
create table if not exists public.wishlist_items (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  card_id           text not null references public.card_catalog(id) on delete cascade,
  language          card_language not null default 'fr',
  variant           text not null default 'normal',
  condition         card_condition not null default 'NM',
  priority          wish_priority not null default 'want',
  target_price_eur  numeric(10,2),
  max_price_eur     numeric(10,2),
  alert_enabled     boolean not null default true,
  notes             text,
  created_at        timestamptz not null default now()
);

create index if not exists idx_wishlist_user on public.wishlist_items (user_id);
create unique index if not exists uniq_wishlist_user_card on public.wishlist_items (user_id, card_id, variant, language);

-- ── 7. portfolio_snapshots ──────────────────────────────────────────
-- Snapshots quotidiens pour les courbes historiques
create table if not exists public.portfolio_snapshots (
  id                 bigserial primary key,
  user_id            uuid not null references auth.users(id) on delete cascade,
  total_value_eur    numeric(12,2) not null,
  total_cost_eur     numeric(12,2),
  card_count         int,
  unique_card_count  int,
  captured_at        timestamptz not null default now()
);

create index if not exists idx_snapshots_user_date on public.portfolio_snapshots (user_id, captured_at desc);

-- ╔════════════════════════════════════════════════════════════════════╗
-- ║  ROW LEVEL SECURITY                                               ║
-- ╚════════════════════════════════════════════════════════════════════╝

-- Activer RLS partout
alter table public.profiles            enable row level security;
alter table public.user_cards          enable row level security;
alter table public.user_sealed         enable row level security;
alter table public.wishlist_items      enable row level security;
alter table public.portfolio_snapshots enable row level security;
alter table public.card_catalog        enable row level security;
alter table public.card_prices         enable row level security;

-- ── profiles ── chacun peut lire/modifier son profil
drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- ── user_cards ── propriétaire uniquement
drop policy if exists "Users manage own cards" on public.user_cards;
create policy "Users manage own cards" on public.user_cards
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── user_sealed ── propriétaire uniquement
drop policy if exists "Users manage own sealed" on public.user_sealed;
create policy "Users manage own sealed" on public.user_sealed
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── wishlist ── propriétaire uniquement
drop policy if exists "Users manage own wishlist" on public.wishlist_items;
create policy "Users manage own wishlist" on public.wishlist_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── snapshots ── propriétaire uniquement (read seulement, l'écriture passe par un cron edge function)
drop policy if exists "Users read own snapshots" on public.portfolio_snapshots;
create policy "Users read own snapshots" on public.portfolio_snapshots
  for select using (auth.uid() = user_id);

-- ── catalog & prices ── lecture publique (données partagées)
drop policy if exists "Catalog is public" on public.card_catalog;
create policy "Catalog is public" on public.card_catalog
  for select using (true);

drop policy if exists "Prices are public" on public.card_prices;
create policy "Prices are public" on public.card_prices
  for select using (true);

-- ╔════════════════════════════════════════════════════════════════════╗
-- ║  VUES utiles                                                       ║
-- ╚════════════════════════════════════════════════════════════════════╝

-- Vue : cartes de l'utilisateur enrichies du catalogue + dernier prix
create or replace view public.user_cards_enriched as
select
  uc.*,
  cc.name_fr,
  cc.name_en,
  cc.set_id,
  cc.set_name_fr,
  cc.set_name_en,
  cc.number      as catalog_number,
  cc.rarity,
  cc.image_url_low,
  cc.image_url_high,
  cc.types,
  -- dernier prix connu pour la même condition/langue/grade
  (select cp.price_eur
   from public.card_prices cp
   where cp.card_id = uc.card_id
     and cp.language = uc.language
     and cp.condition = uc.condition
     and cp.graded = uc.graded
   order by cp.captured_at desc
   limit 1
  ) as current_price_eur
from public.user_cards uc
join public.card_catalog cc on cc.id = uc.card_id;

-- ╔════════════════════════════════════════════════════════════════════╗
-- ║  Permissions sur les vues (héritent des tables sources via RLS)   ║
-- ╚════════════════════════════════════════════════════════════════════╝
grant select on public.user_cards_enriched to authenticated, anon;
