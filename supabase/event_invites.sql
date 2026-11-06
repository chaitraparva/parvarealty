-- ============================================================================
-- Parva Realty website: "Request an Invite" (Mahesh Bhupathi event, 14 Nov)
-- Run this once in Supabase → SQL Editor → New query → Run
-- Needs public.is_site_admin() from supabase/property_requests.sql (already set up)
-- ============================================================================

create table if not exists public.event_invites (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  event       text not null default 'mahesh-bhupathi-2026-11-14',
  full_name   text not null check (char_length(trim(full_name)) between 2 and 100),
  phone       text not null check (phone ~ '^\+?[0-9 ()-]{7,20}$'),
  status      text not null default 'new' check (status in ('new', 'contacted'))
);

alter table public.event_invites enable row level security;

-- Website visitors (no login) can only ADD a request; they can never read the list
grant insert on public.event_invites to anon, authenticated;
grant select, update, delete on public.event_invites to authenticated;

drop policy if exists "visitors request invite" on public.event_invites;
create policy "visitors request invite" on public.event_invites
  for insert to anon, authenticated
  with check (status = 'new');

-- Only website admins (site_admins table) can see / update / delete requests
drop policy if exists "admins read invites" on public.event_invites;
create policy "admins read invites" on public.event_invites
  for select to authenticated using (public.is_site_admin());

drop policy if exists "admins update invites" on public.event_invites;
create policy "admins update invites" on public.event_invites
  for update to authenticated using (public.is_site_admin()) with check (public.is_site_admin());

drop policy if exists "admins delete invites" on public.event_invites;
create policy "admins delete invites" on public.event_invites
  for delete to authenticated using (public.is_site_admin());
