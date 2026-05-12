-- ╔════════════════════════════════════════════════════════════════════╗
-- ║  0005 — RLS : autoriser les utilisateurs connectés à enrichir    ║
-- ║  le catalogue de cartes (insert/update)                          ║
-- ╚════════════════════════════════════════════════════════════════════╝

-- Les utilisateurs authentifiés peuvent insérer de nouvelles cartes
-- dans card_catalog (nécessaire quand on ajoute une carte à sa collection)
drop policy if exists "Authenticated users can insert catalog" on public.card_catalog;
create policy "Authenticated users can insert catalog"
  on public.card_catalog
  for insert
  to authenticated
  with check (true);

-- Ils peuvent aussi mettre à jour (upsert = insert + update)
drop policy if exists "Authenticated users can update catalog" on public.card_catalog;
create policy "Authenticated users can update catalog"
  on public.card_catalog
  for update
  to authenticated
  using (true)
  with check (true);

-- Correction aussi pour user_cards : s'assurer que l'insert est autorisé
drop policy if exists "Users can insert own cards" on public.user_cards;
create policy "Users can insert own cards"
  on public.user_cards
  for insert
  to authenticated
  with check (auth.uid() = user_id);
