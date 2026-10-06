-- ===========================================================================
-- Migration 002 — payments ledger + exact appointment slots
-- Apply to an EXISTING database (schema.sql already includes these for
-- fresh setups). Run in the Supabase SQL editor.
-- ===========================================================================

-- Payments ledger (webhook idempotency + audit)
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) not null,
  tx_ref text unique not null,
  amount_etb numeric(12,2) not null,
  currency text not null default 'ETB',
  chapa_status text not null,
  raw_payload jsonb,
  created_at timestamptz default now()
);
create index if not exists idx_payments_order on payments(order_id);
alter table payments enable row level security;
-- service-role only (no anon policies ⇒ denied)

-- Exact hourly slot bookings
alter table appointments add column if not exists scheduled_at timestamptz;

-- Double-booking protection: one active appointment per exact slot.
create unique index if not exists uniq_active_slot on appointments (scheduled_at)
  where scheduled_at is not null and status in ('requested', 'confirmed');
