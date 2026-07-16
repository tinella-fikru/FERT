# FERT

**Traditional Ethiopian clothing, made to order in Addis Ababa.**

A luxury editorial e-commerce site: monochrome ALAÏA-style art direction with a
tilet-gold accent, GSAP animations, and a full made-to-order pipeline —
catalog → configuration wizard → Chapa payment → atelier workflow → fitting.

## Stack

| Layer      | Tech                                              |
| ---------- | ------------------------------------------------- |
| App        | Nuxt 3 (Vue 3 + Nitro server routes)              |
| Styling    | Tailwind CSS — design tokens in `tailwind.config.ts` |
| Animation  | GSAP + ScrollTrigger (reduced-motion aware)       |
| Database   | Supabase (Postgres + RLS)                         |
| Auth       | Clerk                                             |
| Payments   | Chapa (hosted checkout, server-side verification) |
| Email      | Resend                                            |
| Validation | Zod (shared client/server schemas)                |

## Getting started

```bash
npm install
cp .env.example .env   # fill in your keys (see below)
npm run dev
```

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Run `supabase/schema.sql` in the SQL editor (tables, RLS, order-number sequence).
3. Run `supabase/seed.sql` (3 collections, 8 garments, 5 tibeb patterns).
4. Copy the project URL, anon key, and service-role key into `.env`.

### 2. Clerk

1. Create an application at [dashboard.clerk.com](https://dashboard.clerk.com).
2. Copy the publishable + secret keys into `.env`.
3. Add staff emails to `NUXT_ADMIN_EMAILS` (comma-separated) to grant `/admin` access.

### 3. Chapa

1. Get a secret key at [dashboard.chapa.co](https://dashboard.chapa.co) — use the
   `CHASECK_TEST-` key first; swap to live at launch.
2. Payment truth is established by server-to-server verification
   (`/api/orders/verify`), never by the redirect alone.

### 4. Resend

1. Create an API key at [resend.com](https://resend.com) and verify your sending
   domain (update the `FROM` address in `server/utils/email.ts`).

## Architecture notes

- **Server-authoritative pricing** — `POST /api/orders` reprices every order
  from the database; client-sent amounts are never trusted.
- **RLS posture** — the anon key can only read the published catalog. All order,
  customer, and appointment writes go through Nitro routes using the
  service-role key, behind Clerk auth (`server/utils/auth.ts`).
- **Order pipeline state machine** — legal transitions enforced in
  `server/api/admin/orders/[id]/status.post.ts`
  (`pending_payment → paid → in_workshop → quality_check → ready → delivered`).
- **Draft persistence** — the order wizard survives a sign-in redirect via
  sessionStorage (`composables/useOrderDraft.ts`).
- **Animations** — one system: `useReveal` scroll entrances, hero character
  stagger, and a page-transition ink wipe. All collapse instantly under
  `prefers-reduced-motion`.
- **Imagery** — `components/GarmentImage.vue` renders art-directed placeholders
  (tibeb SVG band, reserved aspect ratio → zero CLS). Pass `src` to swap in
  real photography; nothing else changes.

## Design system

Generated with the ui-ux-pro-max skill; persisted at `design-system/fert/MASTER.md`
in the workspace root. Key tokens:

- **Ink** `#0A0A0A` · **Paper** `#FAFAF8` · **Gold** `#B98A2F` (tilet accent)
- Playfair Display (display) · Source Serif 4 (body) · JetBrains Mono (labels/prices)
- Zero border-radius, no shadows, 3px hard rules between sections

## Scripts

| Command           | Purpose                          |
| ----------------- | -------------------------------- |
| `npm run dev`     | Dev server on `localhost:3000`   |
| `npm run build`   | Production build (`.output/`)    |
| `npm run preview` | Preview the production build     |
