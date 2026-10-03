-- Run this script in the Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Create the Hackathons table
create table if not exists public.hackathons (
  id text primary key default gen_random_uuid()::text,
  title text not null,
  start_date text not null,
  end_date text not null,
  website_url text,
  platform text default 'Other',
  status text default 'upcoming',
  description text,
  tags text[] default '{}',
  team_name text,
  prize_pool text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable Row Level Security (RLS)
alter table public.hackathons enable row level security;

-- 3. Create simple public policies for Anon access (ideal for personal tracker)
drop policy if exists "Enable read access for all users" on public.hackathons;
create policy "Enable read access for all users"
on public.hackathons for select
using (true);

drop policy if exists "Enable insert access for all users" on public.hackathons;
create policy "Enable insert access for all users"
on public.hackathons for insert
with check (true);

drop policy if exists "Enable update access for all users" on public.hackathons;
create policy "Enable update access for all users"
on public.hackathons for update
using (true);

drop policy if exists "Enable delete access for all users" on public.hackathons;
create policy "Enable delete access for all users"
on public.hackathons for delete
using (true);

-- 4. Enable Supabase Realtime for this table
alter publication supabase_realtime add table public.hackathons;
