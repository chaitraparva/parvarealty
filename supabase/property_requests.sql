-- ============================================================================
-- Parva Realty website: Exchange / Sell property requests
-- Run this once in Supabase → SQL Editor → New query → Run
-- ============================================================================

-- 1. Table for client requests
create table if not exists public.property_requests (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),
  user_id           uuid not null default auth.uid() references auth.users(id) on delete cascade,
  request_type      text not null check (request_type in ('exchange', 'sell')),
  email             text not null,
  phone             text not null,
  property_address  text not null,
  property_location text not null,
  photo_paths       text[] not null default '{}',
  owner_confirmed   boolean not null default false,  -- exchange: "I am the owner, not a broker"
  fee_accepted      boolean not null default false,  -- sell: agreed to 2–3% platform fee
  status            text not null default 'new' check (status in ('new', 'contacted'))
);

-- 2. Admin emails allowed to see requests (must match the website admin logins)
create table if not exists public.site_admins (
  email text primary key
);

insert into public.site_admins (email) values
  ('chaitra@parvarealty.ae'),
  ('nagesh@parvarealty.ae'),
  ('sushma@diagofinance.com')
on conflict do nothing;

create or replace function public.is_site_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.site_admins
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- 3. Row level security
alter table public.property_requests enable row level security;
alter table public.site_admins enable row level security;  -- no policies = not readable from the website

drop policy if exists "clients insert own request" on public.property_requests;
create policy "clients insert own request" on public.property_requests
  for insert to authenticated
  with check (user_id = auth.uid() and status = 'new');

drop policy if exists "admins read requests" on public.property_requests;
create policy "admins read requests" on public.property_requests
  for select to authenticated using (public.is_site_admin());

drop policy if exists "admins update requests" on public.property_requests;
create policy "admins update requests" on public.property_requests
  for update to authenticated using (public.is_site_admin()) with check (public.is_site_admin());

drop policy if exists "admins delete requests" on public.property_requests;
create policy "admins delete requests" on public.property_requests
  for delete to authenticated using (public.is_site_admin());

-- 4. Private storage bucket for property photos
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('property-photos', 'property-photos', false, 10485760, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

drop policy if exists "clients upload own photos" on storage.objects;
create policy "clients upload own photos" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'property-photos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "admins view photos" on storage.objects;
create policy "admins view photos" on storage.objects
  for select to authenticated
  using (bucket_id = 'property-photos' and public.is_site_admin());

drop policy if exists "admins delete photos" on storage.objects;
create policy "admins delete photos" on storage.objects
  for delete to authenticated
  using (bucket_id = 'property-photos' and public.is_site_admin());
