-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- USERS (Managed by Supabase Auth, but we can have a public profile table if needed)
-- For now, we'll reference auth.users in other tables.

-- MOODS Table
create table public.moods (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  mood_level int not null check (mood_level between 1 and 5),
  note text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- JOURNALS Table
create table public.journals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  content text not null,
  mood_tags text[], -- Array of strings for tags
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- AI_LOGS Table (To track AI usage/history)
create table public.ai_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  input_context text,
  ai_response jsonb, -- Store full JSON response
  tokens_used int,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- SETTINGS Table
create table public.settings (
  user_id uuid references auth.users(id) on delete cascade primary key,
  theme text default 'light',
  reminder_time time,
  is_reminder_enabled boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security (RLS) Policies
alter table public.moods enable row level security;
alter table public.journals enable row level security;
alter table public.ai_logs enable row level security;
alter table public.settings enable row level security;

-- Policies for MOODS
create policy "Users can view their own moods" on public.moods
  for select using (auth.uid() = user_id);

create policy "Users can insert their own moods" on public.moods
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own moods" on public.moods
  for update using (auth.uid() = user_id);

create policy "Users can delete their own moods" on public.moods
  for delete using (auth.uid() = user_id);

-- Policies for JOURNALS
create policy "Users can view their own journals" on public.journals
  for select using (auth.uid() = user_id);

create policy "Users can insert their own journals" on public.journals
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own journals" on public.journals
  for update using (auth.uid() = user_id);

create policy "Users can delete their own journals" on public.journals
  for delete using (auth.uid() = user_id);

-- Policies for AI_LOGS
create policy "Users can view their own ai logs" on public.ai_logs
  for select using (auth.uid() = user_id);

create policy "Users can insert their own ai logs" on public.ai_logs
  for insert with check (auth.uid() = user_id);

-- Policies for SETTINGS
create policy "Users can view their own settings" on public.settings
  for select using (auth.uid() = user_id);

create policy "Users can insert their own settings" on public.settings
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own settings" on public.settings
  for update using (auth.uid() = user_id);
