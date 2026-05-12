-- ╔════════════════════════════════════════════════════════════════════╗
-- ║  0007 — RLS card_prices : autoriser l'insertion des prix         ║
-- ║                                                                   ║
-- ║  Les utilisateurs connectés peuvent insérer des prix             ║
-- ║  (nécessaire pour syncAndStorePriceForCard côté serveur)         ║
-- ╚════════════════════════════════════════════════════════════════════╝

-- Autoriser les utilisateurs connectés à insérer des prix
drop policy if exists "Authenticated can insert prices" on public.card_prices;
create policy "Authenticated can insert prices"
  on public.card_prices
  for insert
  to authenticated
  with check (true);

-- Autoriser aussi le service role (pour les Edge Functions cron)
drop policy if exists "Service role can manage prices" on public.card_prices;
create policy "Service role can manage prices"
  on public.card_prices
  for all
  to service_role
  using (true)
  with check (true);
