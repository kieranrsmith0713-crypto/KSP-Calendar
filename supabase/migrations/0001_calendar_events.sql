create table if not exists public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text,
  start_time timestamptz not null,
  end_time timestamptz not null,
  all_day boolean not null default false,
  location text,
  category text,
  recurrence_rule text,
  created_at timestamptz not null default now()
);

create index if not exists calendar_events_user_id_idx on public.calendar_events (user_id);
create index if not exists calendar_events_start_time_idx on public.calendar_events (start_time);

alter table public.calendar_events enable row level security;

create policy "Users can view their own events"
  on public.calendar_events for select
  using (auth.uid() = user_id);

create policy "Users can insert their own events"
  on public.calendar_events for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own events"
  on public.calendar_events for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own events"
  on public.calendar_events for delete
  using (auth.uid() = user_id);
