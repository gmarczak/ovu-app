create extension if not exists "pgcrypto";

create table if not exists cycles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  cycle_length integer not null default 28,
  period_length integer not null default 5,
  last_period_start date
);

create table if not exists period_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  start_date date not null,
  end_date date,
  symptoms text[],
  bleeding_intensity text check (bleeding_intensity in ('light', 'medium', 'heavy')),
  mood text check (mood in ('bad', 'neutral', 'good')),
  notes text,
  created_at timestamptz default now()
);

alter table cycles enable row level security;
alter table period_logs enable row level security;

create policy "Users can manage own cycles"
  on cycles
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can manage own period logs"
  on period_logs
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
