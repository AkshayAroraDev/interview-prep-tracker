-- Single-table application state storage for Supabase
-- This migration creates only one application table: public.user_state

create extension if not exists pgcrypto;

create table if not exists public.user_state (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  state_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_state_user_id_fkey
    foreign key (user_id) references auth.users (id) on delete cascade
);

-- Enforce one JSON document row per authenticated user.
create unique index if not exists user_state_user_id_unique_idx
  on public.user_state (user_id);

-- Helpful for sorting / latest-state queries.
create index if not exists user_state_updated_at_idx
  on public.user_state (updated_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists user_state_set_updated_at on public.user_state;

create trigger user_state_set_updated_at
before update on public.user_state
for each row
execute function public.set_updated_at();

alter table public.user_state enable row level security;

create policy "user_state_select_own"
on public.user_state
for select
to authenticated
using (user_id = auth.uid());

create policy "user_state_insert_own"
on public.user_state
for insert
to authenticated
with check (user_id = auth.uid());

create policy "user_state_update_own"
on public.user_state
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());
