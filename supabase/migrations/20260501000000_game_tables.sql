-- ─────────────────────────────────────────────────────────────────────
-- GameFolio — schéma jeu : balance, ouvertures, battles, jackpot
-- ─────────────────────────────────────────────────────────────────────

-- ── 1. Solde utilisateur ───────────────────────────────────────────────
create table if not exists user_balance (
  user_id          uuid primary key references auth.users(id) on delete cascade,
  amount_usd       numeric(10,2) not null default 10.00,
  total_deposited  numeric(10,2) not null default 0.00,
  total_won        numeric(10,2) not null default 0.00,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table user_balance enable row level security;
create policy "user reads own balance"   on user_balance for select using (auth.uid() = user_id);
create policy "user updates own balance" on user_balance for update using (auth.uid() = user_id);

-- ── 2. Bootstrap : trigger qui crédite $10 à la création d'utilisateur ─
create or replace function init_user_balance()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into user_balance (user_id, amount_usd) values (new.id, 10.00);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function init_user_balance();

-- ── 3. Catalogue des packs (référentiel statique côté client) ──────────
-- Pas de table — les packs sont définis dans src/data/packs.ts

-- ── 4. Ouvertures (historique) ─────────────────────────────────────────
create table if not exists pack_openings (
  id            bigserial primary key,
  user_id       uuid not null references auth.users(id) on delete cascade,
  pack_id       text not null,
  card_id       text not null,
  card_value    numeric(10,2) not null default 0,
  cost_paid     numeric(10,2) not null default 0,
  was_free      boolean not null default false,
  opened_at     timestamptz not null default now()
);

create index if not exists idx_pack_openings_user on pack_openings(user_id, opened_at desc);

alter table pack_openings enable row level security;
create policy "user reads own openings" on pack_openings for select using (auth.uid() = user_id);
create policy "user inserts own openings" on pack_openings for insert with check (auth.uid() = user_id);

-- ── 5. Compteur quotidien (50 gratuites/jour) ─────────────────────────
create table if not exists daily_openings (
  user_id    uuid not null references auth.users(id) on delete cascade,
  day        date not null default current_date,
  count      int  not null default 0,
  primary key (user_id, day)
);

alter table daily_openings enable row level security;
create policy "user reads own daily" on daily_openings for select using (auth.uid() = user_id);
create policy "user upserts own daily" on daily_openings for all using (auth.uid() = user_id);

-- ── 6. Inventaire (cartes possédées) ─────────────────────────────────
create table if not exists user_inventory (
  id                  bigserial primary key,
  user_id             uuid not null references auth.users(id) on delete cascade,
  card_id             text not null,
  count               int  not null default 1,
  first_acquired_at   timestamptz not null default now(),
  unique (user_id, card_id)
);

create index if not exists idx_inventory_user on user_inventory(user_id);

alter table user_inventory enable row level security;
create policy "user reads own inventory" on user_inventory for select using (auth.uid() = user_id);
create policy "user manages own inventory" on user_inventory for all using (auth.uid() = user_id);

-- ── 7. Battles PvP ────────────────────────────────────────────────────
create table if not exists battle_rooms (
  id            uuid primary key default gen_random_uuid(),
  pack_id       text not null,
  stake_usd     numeric(10,2) not null,
  max_players   int not null default 2,
  status        text not null default 'waiting' check (status in ('waiting','in-progress','finished')),
  host_id       uuid not null references auth.users(id) on delete cascade,
  winner_id     uuid references auth.users(id),
  created_at    timestamptz not null default now(),
  finished_at   timestamptz
);

create table if not exists battle_participants (
  room_id        uuid not null references battle_rooms(id) on delete cascade,
  user_id        uuid not null references auth.users(id) on delete cascade,
  card_id        text,
  card_value     numeric(10,2),
  ready          boolean not null default false,
  joined_at      timestamptz not null default now(),
  primary key (room_id, user_id)
);

alter table battle_rooms enable row level security;
alter table battle_participants enable row level security;
create policy "anyone reads rooms" on battle_rooms for select using (true);
create policy "user creates own rooms" on battle_rooms for insert with check (auth.uid() = host_id);
create policy "anyone reads participants" on battle_participants for select using (true);
create policy "user joins as self" on battle_participants for insert with check (auth.uid() = user_id);

-- ── 8. Jackpot ────────────────────────────────────────────────────────
create table if not exists jackpot_rounds (
  id              uuid primary key default gen_random_uuid(),
  total_value     numeric(10,2) not null default 0,
  status          text not null default 'open' check (status in ('open','drawing','closed')),
  starts_at       timestamptz not null default now(),
  ends_at         timestamptz not null,
  winner_id       uuid references auth.users(id),
  created_at      timestamptz not null default now()
);

create table if not exists jackpot_deposits (
  id            bigserial primary key,
  round_id      uuid not null references jackpot_rounds(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  card_id       text not null,
  card_value    numeric(10,2) not null,
  deposited_at  timestamptz not null default now()
);

create index if not exists idx_jackpot_deposits_round on jackpot_deposits(round_id);

alter table jackpot_rounds enable row level security;
alter table jackpot_deposits enable row level security;
create policy "anyone reads rounds" on jackpot_rounds for select using (true);
create policy "anyone reads deposits" on jackpot_deposits for select using (true);
create policy "user deposits as self" on jackpot_deposits for insert with check (auth.uid() = user_id);

-- ── 9. Missions / Streak ─────────────────────────────────────────────
create table if not exists user_missions (
  id            bigserial primary key,
  user_id       uuid not null references auth.users(id) on delete cascade,
  mission_id    text not null,
  progress      int not null default 0,
  completed     boolean not null default false,
  claimed       boolean not null default false,
  reset_at      timestamptz,
  unique (user_id, mission_id)
);

alter table user_missions enable row level security;
create policy "user reads own missions" on user_missions for select using (auth.uid() = user_id);
create policy "user manages own missions" on user_missions for all using (auth.uid() = user_id);

-- ── 10. Realtime — activer pour battles & jackpot ─────────────────────
alter publication supabase_realtime add table battle_rooms;
alter publication supabase_realtime add table battle_participants;
alter publication supabase_realtime add table jackpot_rounds;
alter publication supabase_realtime add table jackpot_deposits;
