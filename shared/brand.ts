/**
 * FERT brand links — social profiles, branches, and contact.
 * Single source of truth for the footer, hero, and contact surfaces.
 */

export const BRAND = {
  phone: '092 437 3777',
  phoneHref: 'tel:+251924373777',
  email: 'atelier@fert.et',
  instagram: 'https://www.instagram.com/official_fert_design',
  facebook: 'https://www.facebook.com/profile.php?id=100064876995823',
  branches: [
    {
      name: 'Fert Design',
      mapUrl:
        'https://www.google.com/search?hl=en-GB&kgmid=%2Fg%2F11vf8jjvyq&q=Fert%20design',
    },
    {
      name: 'Fert Design — 3rd Branch',
      mapUrl:
        'https://www.google.com/search?hl=en-GB&kgmid=%2Fg%2F11wpmg_5k0&q=Fert%20design%203rd%20branch',
    },
  ],
} as const
