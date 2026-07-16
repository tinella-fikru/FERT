-- ===========================================================================
-- FERT — Supabase schema
-- Traditional Ethiopian clothing: catalog, made-to-order, appointments.
-- Run in the Supabase SQL editor (or via supabase db push).
-- ===========================================================================

-- ---------- Enums ----------------------------------------------------------
create type order_status as enum (
  'pending_payment', 'paid', 'in_workshop', 'quality_check',
  'ready', 'delivered', 'cancelled'
);

create type appointment_status as enum (
  'requested', 'confirmed', 'completed', 'cancelled'
);

create type garment_category as enum (
  'habesha_kemis', 'netela', 'mens_suit', 'shirt', 'accessory'
);

-- ---------- Catalog --------------------------------------------------------
create table collections (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  season text,
  hero_image_url text,
  sort_order int default 0,
  published boolean default false,
  created_at timestamptz default now()
);

create table garments (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid references collections(id) on delete set null,
  slug text unique not null,
  name text not null,
  category garment_category not null,
  description text,
  story text,                       -- craft/heritage editorial copy
  base_price_etb numeric(12,2) not null,
  lead_time_days int default 21,    -- made-to-order production time
  made_to_order boolean default true,
  image_urls text[] default '{}',
  published boolean default false,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- Tibeb (embroidered border) patterns selectable during configuration
create table tibeb_patterns (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  price_delta_etb numeric(12,2) default 0,
  image_url text,
  available boolean default true
);

-- ---------- Customers (mirrors Clerk users) --------------------------------
create table customers (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text unique not null,
  email text not null,
  full_name text,
  phone text,
  created_at timestamptz default now()
);

-- ---------- Orders ---------------------------------------------------------
create table orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,           -- e.g. FERT-2026-0001
  customer_id uuid references customers(id) not null,
  garment_id uuid references garments(id) not null,
  tibeb_pattern_id uuid references tibeb_patterns(id),
  status order_status default 'pending_payment',
  -- configuration
  size_label text,                             -- standard size, or null if custom
  measurements jsonb,                          -- { bust, waist, hips, length, sleeve, ... } in cm
  notes text,
  -- money
  base_price_etb numeric(12,2) not null,
  tibeb_delta_etb numeric(12,2) default 0,
  total_etb numeric(12,2) not null,
  -- payment
  chapa_tx_ref text unique,
  paid_at timestamptz,
  -- fulfilment
  estimated_ready_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table order_status_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade not null,
  status order_status not null,
  note text,
  created_at timestamptz default now()
);

-- ---------- Appointments ---------------------------------------------------
create table appointments (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id),
  full_name text not null,
  email text not null,
  phone text,
  preferred_date date not null,
  preferred_time text not null,               -- 'morning' | 'afternoon'
  purpose text,                                -- fitting, consultation, pickup
  status appointment_status default 'requested',
  admin_note text,
  created_at timestamptz default now()
);

-- ---------- Indexes --------------------------------------------------------
create index idx_garments_collection on garments(collection_id) where published;
create index idx_orders_customer on orders(customer_id);
create index idx_orders_status on orders(status);
create index idx_appointments_date on appointments(preferred_date);

-- ---------- updated_at trigger ---------------------------------------------
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger orders_updated_at before update on orders
  for each row execute function set_updated_at();

-- ---------- Order number sequence ------------------------------------------
create sequence order_number_seq start 1;

create or replace function next_order_number() returns text as $$
  select 'FERT-' || to_char(now(), 'YYYY') || '-' ||
         lpad(nextval('order_number_seq')::text, 4, '0');
$$ language sql;

-- ===========================================================================
-- Row Level Security
-- The Nuxt server uses the service-role key for privileged writes;
-- the anon key is only ever used for published catalog reads.
-- ===========================================================================
alter table collections enable row level security;
alter table garments enable row level security;
alter table tibeb_patterns enable row level security;
alter table customers enable row level security;
alter table orders enable row level security;
alter table order_status_events enable row level security;
alter table appointments enable row level security;

-- Public (anon) may read the published catalog only
create policy "public read published collections"
  on collections for select using (published);

create policy "public read published garments"
  on garments for select using (published);

create policy "public read available tibeb"
  on tibeb_patterns for select using (available);

-- Everything else is service-role only (no anon policies ⇒ denied).
