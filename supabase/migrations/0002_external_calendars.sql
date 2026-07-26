create table if not exists public.external_calendars (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  url text not null,
  color text not null default '#0ea5e9',
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists external_calendars_user_id_idx on public.external_calendars (user_id);

alter table public.external_calendars enable row level security;

drop policy if exists "Users can view their own external calendars" on public.external_calendars;
create policy "Users can view their own external calendars"
  on public.external_calendars for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own external calendars" on public.external_calendars;
create policy "Users can insert their own external calendars"
  on public.external_calendars for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own external calendars" on public.external_calendars;
create policy "Users can update their own external calendars"
  on public.external_calendars for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own external calendars" on public.external_calendars;
create policy "Users can delete their own external calendars"
  on public.external_calendars for delete
  using (auth.uid() = user_id);
