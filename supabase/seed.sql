-- ===========================================================================
-- FERT — seed data
-- Collections, garments, and tibeb patterns for launch.
-- Prices in Ethiopian Birr (ETB).
-- ===========================================================================

insert into collections (slug, name, description, season, sort_order, published) values
  ('meskel', 'Meskel', 'A celebration collection for the Finding of the True Cross — luminous whites, bonfire golds, garments made for procession and gathering.', 'Meskerem 2019', 1, true),
  ('timket', 'Timket', 'Ceremonial dress for Epiphany — flowing netela, layered kemis, and the discipline of white cotton against highland light.', 'Tir 2019', 2, true),
  ('atelier-line', 'Atelier Line', 'Everyday habesha dressing — simplified silhouettes, refined menen cotton, tibeb reduced to a single quiet line.', 'Permanent', 3, true);

insert into garments (collection_id, slug, name, category, description, story, base_price_etb, lead_time_days, made_to_order, published, sort_order) values
  (
    (select id from collections where slug = 'meskel'),
    'meskel-kemis-demera',
    'Demera Kemis',
    'habesha_kemis',
    'Full-length habesha kemis in handwoven menen cotton with a broad Meskel-gold tibeb at hem and cuff.',
    'Woven on traditional looms in Addis Ababa over fourteen days. The demera motif — ascending diamonds — recalls the bonfire around which Meskel turns. Each border is embroidered by a single artisan, start to finish.',
    18500, 21, true, true, 1
  ),
  (
    (select id from collections where slug = 'meskel'),
    'meskel-netela-ember',
    'Ember Netela',
    'netela',
    'Featherweight netela shawl, double-woven edge, ember-gold tibeb band.',
    'The netela is the most intimate of Ethiopian garments — worn to church, to mourning, to celebration. Ours is woven from the finest first-pass cotton, light enough to pass through a ring.',
    6800, 14, true, true, 2
  ),
  (
    (select id from collections where slug = 'meskel'),
    'meskel-suit-kaba',
    'Kaba Suit',
    'mens_suit',
    'Men''s two-piece in heavyweight menen — mandarin-collar tunic and tapered trouser with matched tibeb.',
    'Cut for ceremony and comfort in equal measure. The collar band carries a narrowed version of the demera tibeb, mirrored at the trouser hem.',
    16200, 21, true, true, 3
  ),
  (
    (select id from collections where slug = 'timket'),
    'timket-kemis-tabot',
    'Tabot Kemis',
    'habesha_kemis',
    'Ceremonial kemis with cathedral-length sleeves and layered white-on-white tibeb.',
    'Made for Timket processions: the white-on-white border only reveals itself in movement, when highland light passes across the weave.',
    21400, 28, true, true, 1
  ),
  (
    (select id from collections where slug = 'timket'),
    'timket-netela-baptism',
    'Baptism Netela',
    'netela',
    'Classic ceremonial netela with fine silver-thread tibeb.',
    'The silver thread is twisted with cotton in the traditional manner so it drapes rather than stiffens — a technique held by few remaining weavers.',
    7900, 14, true, true, 2
  ),
  (
    (select id from collections where slug = 'atelier-line'),
    'atelier-shirt-menen',
    'Menen Shirt',
    'shirt',
    'Everyday shirt in soft-washed menen cotton, single tibeb line at the placket.',
    'The atelier line strips habesha dressing to its essentials. One line of tibeb, hand-embroidered, on a shirt made for every day.',
    5400, 10, true, true, 1
  ),
  (
    (select id from collections where slug = 'atelier-line'),
    'atelier-kemis-city',
    'City Kemis',
    'habesha_kemis',
    'Knee-length modern kemis, unlined menen, minimal gold tibeb at the neckline.',
    'A kemis for Addis — shortened, simplified, moving easily between office and evening.',
    12800, 18, true, true, 2
  ),
  (
    (select id from collections where slug = 'atelier-line'),
    'atelier-scarf-tilet',
    'Tilet Scarf',
    'accessory',
    'Narrow-loom scarf carrying a full-width tilet pattern.',
    'The whole scarf is border: tilet edge-to-edge, a concentrated piece of the weaver''s art.',
    3600, 7, true, true, 3
  );

insert into tibeb_patterns (slug, name, description, price_delta_etb, available) values
  ('demera', 'Demera', 'Ascending diamond motif — the Meskel bonfire. Bold and celebratory.', 1200, true),
  ('meskel-cross', 'Meskel Cross', 'Interlocking cross forms in the Axumite tradition.', 1500, true),
  ('telsem', 'Telsem', 'Protective geometric band, the oldest pattern in our archive.', 900, true),
  ('single-line', 'Single Line', 'One unbroken line of gold — the atelier signature. No supplement.', 0, true),
  ('silver-thread', 'Silver Thread', 'White-and-silver ceremonial border, twisted-thread technique.', 2100, true);
