-- ===========================================================================
-- Migration 004 - catalog imagery and editorial content
-- Applies local public assets to the seeded catalog. Safe to run more than once.
-- ===========================================================================

update garments set
  description = 'A sculpted mermaid kemis with a fitted olive bodice, ivory flounce, and hand-finished gold star motifs.',
  story = 'A contemporary Addis silhouette built around the movement of a classic kemis. The fitted line opens below the knee so the woven cloth keeps its ceremonial sweep.',
  image_urls = array['/images/Designs/photo_11_2026-07-18_18-58-29.jpg']
where slug = 'mermaid-tibeb';

update garments set
  description = 'Full-length white habesha kemis framed by vivid red and gold Meskel-inspired embroidery.',
  story = 'The rising red forms recall the light of the Demera bonfire. Each border is laid out symmetrically, then worked by hand from neckline to hem.',
  image_urls = array[
    '/images/Designs/photo_13_2026-07-18_18-58-29.jpg',
    '/images/Designs/photo_19_2026-07-18_18-58-29.jpg'
  ]
where slug = 'meskel-kemis-demera';

update garments set
  description = 'Ceremonial white kemis with yellow-gold cross medallions and a softly gathered full-length skirt.',
  story = 'Designed for Timket gatherings, the circular cross motifs catch daylight across the skirt while the sheer sleeves keep the garment light and fluid.',
  image_urls = array[
    '/images/Designs/photo_15_2026-07-18_18-58-29.jpg',
    '/images/Designs/photo_18_2026-07-18_18-58-29.jpg'
  ]
where slug = 'timket-kemis-tabot';

update garments set
  description = 'A modern menen shirt with a warm brown ground and gold hand-embroidered placket, collar, cuffs, and hem.',
  story = 'Cut for everyday wear, this shirt brings traditional embroidery into a clean contemporary shape without losing the hand-finished character of the cloth.',
  image_urls = array['/images/Designs/photo_6_2026-07-18_18-58-29.jpg']
where slug = 'atelier-shirt-menen';

update garments set
  description = 'A formal white netela ensemble edged in green and gold, with fine cross motifs and a generous ceremonial drape.',
  story = 'The long netela is composed to frame the wearer from shoulder to floor, echoing the white and green palette associated with renewal and celebration.',
  image_urls = array[
    '/images/Designs/photo_3_2026-07-18_18-58-29.jpg',
    '/images/Designs/photo_4_2026-07-18_18-58-29.jpg'
  ]
where slug = 'timket-netela-baptism';

update garments set
  description = 'Featherweight white netela with ember-red borders, flowing script-like motifs, and a matching waist wrap.',
  story = 'A celebration netela inspired by the color of Meskel fire. The open white field keeps the cloth airy while the red border gives it a strong ceremonial finish.',
  image_urls = array['/images/Designs/photo_2_2026-07-18_18-58-29.jpg']
where slug = 'meskel-netela-ember';

update garments set
  description = 'A contemporary white kemis with a structured blue waist, short sleeves, and restrained gold vine embroidery.',
  story = 'Made for modern Addis days, this lighter silhouette pairs traditional woven detail with an easy proportion that moves from daytime gatherings to evening events.',
  image_urls = array[
    '/images/Designs/photo_12_2026-07-18_18-58-29.jpg',
    '/images/Designs/photo_21_2026-07-18_18-58-29.jpg',
    '/images/Designs/photo_22_2026-07-18_18-58-29.jpg'
  ]
where slug = 'atelier-kemis-city';

update garments set
  description = 'A coordinated ivory ceremonial suit with dense gold embroidery at the collar, chest, cuffs, and matched trim.',
  story = 'The Kaba Suit balances a formal mandarin-collar jacket with tapered trousers. Gold motifs are positioned to align when the jacket is closed.',
  image_urls = array[
    '/images/Designs/photo_5_2026-07-18_18-58-29.jpg',
    '/images/Designs/photo_10_2026-07-18_18-58-29.jpg'
  ]
where slug = 'meskel-suit-kaba';

update garments set
  description = 'A narrow woven accessory featuring blue, green, and gold tilet geometry on a luminous white ground.',
  story = 'Tilet concentrates the visual language of the loom into a portable border. Wear it draped over white cotton or use it to finish a ceremonial look.',
  image_urls = array['/images/Designs/photo_23_2026-07-18_18-58-29.jpg']
where slug = 'atelier-scarf-tilet';

update tibeb_patterns set
  description = 'Protective green-and-gold geometry inspired by talismanic Ethiopian forms.',
  story = 'Telsem motifs use repeated geometry to create rhythm and balance along a woven border.',
  image_url = '/images/Garments/telsem-dorze-weaving.jpg',
  image_urls = array['/images/Garments/telsem-dorze-weaving.jpg']
where slug = 'telsem';

update tibeb_patterns set
  description = 'Ascending warm-toned diamonds inspired by the Meskel bonfire.',
  story = 'Demera is a bold celebratory border suited to cuffs, necklines, and broad hems.',
  image_url = '/images/Garments/demera-dorze-weaving.jpg',
  image_urls = array['/images/Garments/demera-dorze-weaving.jpg']
where slug = 'demera';

update tibeb_patterns set
  description = 'Interlocking cross forms in gold, red, and green, arranged as a strong ceremonial band.',
  story = 'The pattern draws on the layered geometry of Ethiopian processional crosses.',
  image_url = '/images/Garments/meskel-cross-dorze-weaving.jpg',
  image_urls = array['/images/Garments/meskel-cross-dorze-weaving.jpg']
where slug = 'meskel-cross';

update tibeb_patterns set
  description = 'A cool metallic thread finish for luminous white-on-white ceremonial garments.',
  story = 'Silver thread catches light without overpowering the cotton weave and is reserved for formal pieces.',
  image_url = '/images/Garments/silver-thread-embroidery.jpg',
  image_urls = array['/images/Garments/silver-thread-embroidery.jpg']
where slug = 'silver-thread';

update tibeb_patterns set
  name = 'Menen Cotton',
  slug = 'menen-cotton',
  description = 'Handwoven Ethiopian cotton with a soft hand, breathable structure, and natural texture.',
  story = 'Menen cotton is woven by shemane artisans and forms the light, durable foundation of many FERT garments.',
  image_url = '/images/Garments/menen-cotton-shemane.jpg',
  image_urls = array['/images/Garments/menen-cotton-shemane.jpg']
where slug in ('menen-cotten', 'menen-cotton');
