-- ╔════════════════════════════════════════════════════════════════════╗
-- ║  0006 — Correction de la vue user_cards_enriched                 ║
-- ║                                                                   ║
-- ║  Le prix Cardmarket est un prix de marché global — il ne dépend  ║
-- ║  pas de la condition de LA carte de l'utilisateur.               ║
-- ║  On retire le filtre sur condition/graded pour toujours trouver  ║
-- ║  le dernier prix disponible.                                     ║
-- ╚════════════════════════════════════════════════════════════════════╝

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
  -- Dernier prix Cardmarket connu pour cette carte (sans filtre condition)
  (
    select cp.price_eur
    from public.card_prices cp
    where cp.card_id = uc.card_id
    order by cp.captured_at desc
    limit 1
  ) as current_price_eur
from public.user_cards uc
join public.card_catalog cc on cc.id = uc.card_id;

grant select on public.user_cards_enriched to authenticated, anon;
