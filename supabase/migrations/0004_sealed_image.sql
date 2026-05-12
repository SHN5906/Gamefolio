-- ╔════════════════════════════════════════════════════════════════════╗
-- ║  Ajout image_url sur user_sealed                                  ║
-- ║  Permet à l'utilisateur d'uploader une photo de son coffret      ║
-- ╚════════════════════════════════════════════════════════════════════╝

alter table public.user_sealed
  add column if not exists image_url text;

-- ── Storage bucket pour les photos uploadées par les users ──
-- Crée le bucket "sealed-products" en lecture publique (les images sont visibles par tous)
-- Les uploads sont restreints au propriétaire (RLS via policies ci-dessous).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'sealed-products',
  'sealed-products',
  true,
  5242880,                                                    -- 5 MB
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do nothing;

-- Policy : un user ne peut upload que dans son propre dossier (préfixe = user_id)
drop policy if exists "Users upload to own folder" on storage.objects;
create policy "Users upload to own folder"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'sealed-products'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy : un user peut update / delete ses propres fichiers
drop policy if exists "Users update own files" on storage.objects;
create policy "Users update own files"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'sealed-products'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users delete own files" on storage.objects;
create policy "Users delete own files"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'sealed-products'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Lecture : publique (tout le monde peut voir les images via URL)
drop policy if exists "Public read sealed products" on storage.objects;
create policy "Public read sealed products"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'sealed-products');

-- ── Curated list : produits scellés connus avec image officielle ──
-- Ces visuels sont des liens vers les jaquettes officielles Pokémon
-- (utilisés en fallback quand l'utilisateur n'uploade pas sa propre photo)

create table if not exists public.sealed_catalog (
  id           text primary key,
  name         text not null,
  type         sealed_type not null,
  set_name     text,
  language     card_language not null default 'fr',
  image_url    text,
  release_date date,
  msrp_eur     numeric(10,2)
);

alter table public.sealed_catalog enable row level security;
drop policy if exists "Sealed catalog is public" on public.sealed_catalog;
create policy "Sealed catalog is public" on public.sealed_catalog for select using (true);

-- Quelques produits populaires pour démarrer
insert into public.sealed_catalog (id, name, type, set_name, language, image_url, msrp_eur) values
  ('display-fable-nebuleuse',     'Display Fable Nébuleuse',                    'display', 'Fable Nébuleuse',          'fr', 'https://www.pokemon.com/static-assets/content-assets/cms2/img/trading-card-game/series/sv06/sv06-booster-display.png', 145),
  ('etb-mascarade-crepusculaire', 'Elite Trainer Box Mascarade Crépusculaire',  'etb',     'Mascarade Crépusculaire', 'fr', 'https://www.pokemon.com/static-assets/content-assets/cms2/img/trading-card-game/series/sv06/sv06-etb.png',           54),
  ('coffret-mega-dracaufeu',      'Coffret Méga Dracaufeu-ex Héros Transcendant','coffret','Héros Transcendant',     'fr', null, 89),
  ('display-151',                 'Display 151',                                 'display', '151',                     'fr', 'https://www.pokemon.com/static-assets/content-assets/cms2/img/trading-card-game/series/sv03-5/sv03-5-display.png', 199),
  ('etb-151',                     'Elite Trainer Box 151',                       'etb',     '151',                     'fr', 'https://www.pokemon.com/static-assets/content-assets/cms2/img/trading-card-game/series/sv03-5/sv03-5-etb.png',     65)
on conflict (id) do nothing;
