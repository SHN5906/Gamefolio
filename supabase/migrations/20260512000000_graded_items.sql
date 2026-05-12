-- ─────────────────────────────────────────────────────────────────────
-- GameFolio — schéma graded items (PSA variants)
-- Cf. ARCHITECTURE.md §1
-- ─────────────────────────────────────────────────────────────────────

-- ── 1. Catalogue carte (identité Pokémon, indépendante du grade) ──────
create table if not exists cards (
  id              text primary key,            -- ex: 'base1-4' (TCGdex)
  name            text not null,
  name_fr         text not null,
  set_code        text not null,
  set_name_fr     text not null,
  number          text not null,
  rarity          text not null,
  energy          text not null,
  image_url       text,
  anim_tier       text not null default 'base',
  pricecharting_id text,
  tcgplayer_id    text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_cards_set on cards (set_code);
create index if not exists idx_cards_rarity on cards (rarity);

-- ── 2. Prix marché par carte × grade (source de vérité monétaire) ────
create table if not exists card_grade_prices (
  card_id     text not null references cards(id) on delete cascade,
  grade       text not null check (grade in ('raw','psa-5','psa-8','psa-9','psa-10')),
  price_usd   numeric(10,2) not null check (price_usd >= 0),
  source      text not null check (source in ('pricecharting','tcgplayer','manual')),
  source_ref  text,
  updated_at  timestamptz not null default now(),
  primary key (card_id, grade)
);

create index if not exists idx_prices_updated on card_grade_prices (updated_at);

-- Lecture publique (le client a besoin des prix), écriture admin uniquement.
alter table card_grade_prices enable row level security;
create policy "anyone reads grade prices" on card_grade_prices for select using (true);

-- ── 3. Historique des variations de prix (audit & détection anomalies) ─
create table if not exists card_grade_price_history (
  id          bigserial primary key,
  card_id     text not null,
  grade       text not null,
  price_usd   numeric(10,2) not null,
  source      text not null,
  recorded_at timestamptz not null default now()
);

create index if not exists idx_price_history_card on card_grade_price_history (card_id, grade, recorded_at desc);

-- Trigger qui snapshote chaque update dans l'historique (utile pour
-- détecter une variation > 15 % en 24h = signal d'anomalie marché).
create or replace function snapshot_price_change()
returns trigger
language plpgsql
as $$
begin
  insert into card_grade_price_history (card_id, grade, price_usd, source)
  values (new.card_id, new.grade, new.price_usd, new.source);
  return new;
end;
$$;

drop trigger if exists on_price_update on card_grade_prices;
create trigger on_price_update
  after insert or update of price_usd on card_grade_prices
  for each row execute function snapshot_price_change();

-- ── 4. Distribution de grade par défaut par pack ───────────────────────
create table if not exists pack_grade_defaults (
  pack_id     text not null,
  grade       text not null check (grade in ('raw','psa-5','psa-8','psa-9','psa-10')),
  weight      numeric(8,4) not null check (weight >= 0),
  primary key (pack_id, grade)
);

-- ── 5. Distribution de grade carte par carte (override) ──────────────
create table if not exists pack_card_grade_weights (
  pack_id     text not null,
  card_id     text not null references cards(id) on delete cascade,
  grade       text not null check (grade in ('raw','psa-5','psa-8','psa-9','psa-10')),
  weight      numeric(8,4) not null check (weight >= 0),
  primary key (pack_id, card_id, grade)
);

-- ── 6. Distribution du regrade (commune à tous les packs) ────────────
create table if not exists regrade_distribution (
  from_grade  text not null check (from_grade in ('raw','psa-5','psa-8','psa-9','psa-10')),
  to_grade    text not null check (to_grade in ('raw','psa-5','psa-8','psa-9','psa-10')),
  weight      numeric(8,4) not null check (weight >= 0),
  primary key (from_grade, to_grade)
);

-- Seed des valeurs proposées dans ARCHITECTURE.md §3.2
insert into regrade_distribution (from_grade, to_grade, weight) values
  ('raw',    'raw',    35), ('raw',    'psa-5',  30), ('raw',    'psa-8',  20), ('raw',    'psa-9',  10), ('raw',    'psa-10',  5),
  ('psa-5',  'raw',    25), ('psa-5',  'psa-5',  30), ('psa-5',  'psa-8',  25), ('psa-5',  'psa-9',  15), ('psa-5',  'psa-10',  5),
  ('psa-8',  'raw',    15), ('psa-8',  'psa-5',  20), ('psa-8',  'psa-8',  35), ('psa-8',  'psa-9',  20), ('psa-8',  'psa-10', 10),
  ('psa-9',  'raw',    10), ('psa-9',  'psa-5',  15), ('psa-9',  'psa-8',  25), ('psa-9',  'psa-9',  35), ('psa-9',  'psa-10', 15),
  ('psa-10', 'raw',     8), ('psa-10', 'psa-5',  12), ('psa-10', 'psa-8',  20), ('psa-10', 'psa-9',  35), ('psa-10', 'psa-10', 25)
on conflict (from_grade, to_grade) do update set weight = excluded.weight;

-- ── 7. Inventaire (1 ligne par instance) ─────────────────────────────
create table if not exists user_inventory_items (
  id              bigserial primary key,
  user_id         uuid not null references auth.users(id) on delete cascade,
  card_id         text not null references cards(id),
  grade           text not null check (grade in ('raw','psa-5','psa-8','psa-9','psa-10')),
  acquired_at     timestamptz not null default now(),
  acquired_from   text not null check (acquired_from in ('pack','regrade','wheel','admin')),
  acquired_price  numeric(10,2) not null,
  is_locked       boolean not null default false
);

create index if not exists idx_inv_items_user on user_inventory_items (user_id);
create index if not exists idx_inv_items_card_grade on user_inventory_items (card_id, grade);
create index if not exists idx_inv_items_unlocked on user_inventory_items (user_id, is_locked);

alter table user_inventory_items enable row level security;
create policy "user reads own items" on user_inventory_items for select using (auth.uid() = user_id);
create policy "user inserts own items" on user_inventory_items for insert with check (auth.uid() = user_id);
create policy "user updates own items" on user_inventory_items for update using (auth.uid() = user_id);
create policy "user deletes own items" on user_inventory_items for delete using (auth.uid() = user_id);

-- ── 8. Historique regrade (analytics + audit) ────────────────────────
create table if not exists regrade_history (
  id              bigserial primary key,
  user_id         uuid not null references auth.users(id) on delete cascade,
  card_id         text not null,
  from_grade      text not null,
  to_grade        text not null,
  from_price      numeric(10,2) not null,
  to_price        numeric(10,2) not null,
  cost_paid       numeric(10,2) not null default 20.00,
  created_at      timestamptz not null default now()
);

create index if not exists idx_regrade_user on regrade_history (user_id, created_at desc);
alter table regrade_history enable row level security;
create policy "user reads own regrades" on regrade_history for select using (auth.uid() = user_id);

-- ── 9. Historique wheel (analytics) ──────────────────────────────────
create table if not exists wheel_history (
  id              bigserial primary key,
  user_id         uuid not null references auth.users(id) on delete cascade,
  stake_value     numeric(10,2) not null,
  target_card_id  text not null,
  target_grade    text not null,
  target_price    numeric(10,2) not null,
  probability     numeric(6,4) not null,
  won             boolean not null,
  spun_at         timestamptz not null default now()
);

create index if not exists idx_wheel_user on wheel_history (user_id, spun_at desc);
alter table wheel_history enable row level security;
create policy "user reads own wheel" on wheel_history for select using (auth.uid() = user_id);

-- ── 10. Migration v1 → v2 : convertir user_inventory en user_inventory_items ─
-- Idempotente : si user_inventory_items est déjà rempli pour l'user, ne refait pas.
do $$
begin
  if exists (select 1 from information_schema.tables where table_name = 'user_inventory') then
    -- Pour chaque ligne (user, card, count), crée `count` instances Raw
    insert into user_inventory_items (user_id, card_id, grade, acquired_at, acquired_from, acquired_price)
    select
      ui.user_id,
      ui.card_id,
      'raw',
      ui.first_acquired_at,
      'admin',
      0    -- prix inconnu pour les anciennes acquisitions (sera réévalué au prochain affichage)
    from user_inventory ui
    cross join lateral generate_series(1, ui.count) gs
    where not exists (
      select 1 from user_inventory_items uii
      where uii.user_id = ui.user_id and uii.card_id = ui.card_id
    );
  end if;
end$$;

-- ── 11. Realtime ─────────────────────────────────────────────────────
alter publication supabase_realtime add table user_inventory_items;
alter publication supabase_realtime add table card_grade_prices;
