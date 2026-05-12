-- ╔════════════════════════════════════════════════════════════════════╗
-- ║  Seed du catalogue de cartes — pour tester sans Edge Function    ║
-- ║                                                                   ║
-- ║  Insère ~20 cartes Pokémon populaires pour que la recherche fonc-║
-- ║  tionne immédiatement.                                           ║
-- ║                                                                   ║
-- ║  Lance après 0001_initial_schema.sql                             ║
-- ║                                                                   ║
-- ║  Pour le catalogue complet → déploie l'Edge Function sync-catalog║
-- ╚════════════════════════════════════════════════════════════════════╝

insert into public.card_catalog
  (id, tcgdex_id, name_fr, name_en, set_id, set_name_fr, set_name_en, number, rarity, image_url_low, image_url_high, types)
values
  -- Set 151
  ('sv03-006', 'sv03-006', 'Dracaufeu ex',     'Charizard ex',     'sv03', '151', '151', '006/165', 'Holo Rare', 'https://assets.tcgdex.net/fr/sv/sv03/006/low.png', 'https://assets.tcgdex.net/fr/sv/sv03/006/high.png', array['Feu']),
  ('sv03-056', 'sv03-056', 'Léviator ex',      'Gyarados ex',      'sv03', '151', '151', '056/165', 'Holo Rare', 'https://assets.tcgdex.net/fr/sv/sv03/056/low.png', 'https://assets.tcgdex.net/fr/sv/sv03/056/high.png', array['Eau']),
  ('sv03-150', 'sv03-150', 'Mewtwo Holo',      'Mewtwo',           'sv03', '151', '151', '150/165', 'Holo Rare', 'https://assets.tcgdex.net/fr/sv/sv03/150/low.png', 'https://assets.tcgdex.net/fr/sv/sv03/150/high.png', array['Psychique']),
  ('sv03-025', 'sv03-025', 'Pikachu',          'Pikachu',          'sv03', '151', '151', '025/165', 'Common',    'https://assets.tcgdex.net/fr/sv/sv03/025/low.png', 'https://assets.tcgdex.net/fr/sv/sv03/025/high.png', array['Électrique']),
  ('sv03-009', 'sv03-009', 'Bulbizarre',       'Bulbasaur',        'sv03', '151', '151', '001/165', 'Common',    'https://assets.tcgdex.net/fr/sv/sv03/001/low.png', 'https://assets.tcgdex.net/fr/sv/sv03/001/high.png', array['Plante']),

  -- Évolutions Célestes
  ('swsh07-215', 'swsh07-215', 'Noctali VMAX Alt Art', 'Umbreon VMAX Alt Art', 'swsh07', 'Évolution Céleste', 'Evolving Skies', '215/203', 'Alternate Art', 'https://assets.tcgdex.net/fr/swsh/swsh07/215/low.png', 'https://assets.tcgdex.net/fr/swsh/swsh07/215/high.png', array['Obscurité']),
  ('swsh07-218', 'swsh07-218', 'Rayquaza VMAX Alt Art', 'Rayquaza VMAX Alt Art', 'swsh07', 'Évolution Céleste', 'Evolving Skies', '218/203', 'Alternate Art', 'https://assets.tcgdex.net/fr/swsh/swsh07/218/low.png', 'https://assets.tcgdex.net/fr/swsh/swsh07/218/high.png', array['Incolore']),

  -- Tempête Argentée
  ('swsh12-186', 'swsh12-186', 'Lugia V Alt Art', 'Lugia V Alt Art', 'swsh12', 'Tempête Argentée', 'Silver Tempest', '186/195', 'Alternate Art', 'https://assets.tcgdex.net/fr/swsh/swsh12/186/low.png', 'https://assets.tcgdex.net/fr/swsh/swsh12/186/high.png', array['Incolore']),
  ('swsh12-139', 'swsh12-139', 'Lugia VSTAR Alt Art', 'Lugia VSTAR Alt Art', 'swsh12', 'Tempête Argentée', 'Silver Tempest', '139/195', 'Alternate Art', 'https://assets.tcgdex.net/fr/swsh/swsh12/139/low.png', 'https://assets.tcgdex.net/fr/swsh/swsh12/139/high.png', array['Incolore']),

  -- Voltage Éclatant
  ('swsh04-044', 'swsh04-044', 'Pikachu VMAX',    'Pikachu VMAX',    'swsh04', 'Voltage Éclatant', 'Vivid Voltage', '044/185', 'Holo Rare', 'https://assets.tcgdex.net/fr/swsh/swsh04/044/low.png', 'https://assets.tcgdex.net/fr/swsh/swsh04/044/high.png', array['Électrique']),

  -- Astres Radieux
  ('swsh10-123', 'swsh10-123', 'Arceus VSTAR',    'Arceus VSTAR',    'swsh10', 'Astres Radieux', 'Brilliant Stars', '123/189', 'VSTAR', 'https://assets.tcgdex.net/fr/swsh/swsh10/123/low.png', 'https://assets.tcgdex.net/fr/swsh/swsh10/123/high.png', array['Incolore']),

  -- Perte d'Origine
  ('swsh11-131', 'swsh11-131', 'Giratine VSTAR', 'Giratina VSTAR', 'swsh11', 'Perte d''Origine', 'Lost Origin', '131/196', 'VSTAR', 'https://assets.tcgdex.net/fr/swsh/swsh11/131/low.png', 'https://assets.tcgdex.net/fr/swsh/swsh11/131/high.png', array['Psychique']),

  -- Écarlate & Violet
  ('sv01-245', 'sv01-245', 'Miraidon ex Alt Art', 'Miraidon ex Alt Art', 'sv01', 'Écarlate & Violet', 'Scarlet & Violet', '245/198', 'Special Illustration', 'https://assets.tcgdex.net/fr/sv/sv01/245/low.png', 'https://assets.tcgdex.net/fr/sv/sv01/245/high.png', array['Électrique']),
  ('sv01-247', 'sv01-247', 'Koraidon ex Alt Art', 'Koraidon ex Alt Art', 'sv01', 'Écarlate & Violet', 'Scarlet & Violet', '247/198', 'Special Illustration', 'https://assets.tcgdex.net/fr/sv/sv01/247/low.png', 'https://assets.tcgdex.net/fr/sv/sv01/247/high.png', array['Combat']),

  -- Set Base (vintage)
  ('base1-006', 'base1-006', 'Dracaufeu Holo',  'Charizard',       'base1', 'Set de Base', 'Base Set', '004/102', 'Holo Rare', 'https://assets.tcgdex.net/fr/base/base1/006/low.png', 'https://assets.tcgdex.net/fr/base/base1/006/high.png', array['Feu']),
  ('base1-010', 'base1-010', 'Mewtwo Holo',     'Mewtwo Holo',     'base1', 'Set de Base', 'Base Set', '010/102', 'Holo Rare', 'https://assets.tcgdex.net/fr/base/base1/010/low.png', 'https://assets.tcgdex.net/fr/base/base1/010/high.png', array['Psychique'])
on conflict (id) do nothing;
