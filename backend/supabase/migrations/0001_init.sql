-- 0001_init.sql
-- Initial database schema for Skill Swap Platform
-- Run via Supabase CLI or psql

-- Enable required extensions (uuid & crypto)
create extension if not exists "pgcrypto";

-- -------------------------------
-- ENUM TYPES
-- -------------------------------
create type swap_status as enum ('pending', 'accepted', 'cancelled');

-- -------------------------------
-- TABLES
-- -------------------------------

-- Users
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text,
  avatar_url text,
  visibility boolean not null default true,
  rating_avg numeric(3,2) default 0,
  created_at timestamp with time zone default now()
);

-- Skills catalog
create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  name text unique not null
);

-- Skills a user can teach
create table if not exists public.user_skills (
  user_id uuid references public.users(id) on delete cascade,
  skill_id uuid references public.skills(id) on delete cascade,
  proficiency int check (proficiency between 1 and 5),
  primary key (user_id, skill_id)
);

-- Skills a user wants to learn
create table if not exists public.desired_skills (
  user_id uuid references public.users(id) on delete cascade,
  skill_id uuid references public.skills(id) on delete cascade,
  priority int check (priority between 1 and 5),
  primary key (user_id, skill_id)
);

-- Weekly availability slots
create table if not exists public.availability_slots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  weekday int not null check (weekday between 0 and 6), -- 0 = Sunday
  start_time time not null,
  end_time time not null,
  constraint chk_time_range check (end_time > start_time)
);

-- Swap requests between two users
create table if not exists public.swap_requests (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid references public.users(id) on delete cascade,
  responder_id uuid references public.users(id) on delete cascade,
  give_skill_id uuid references public.skills(id),
  take_skill_id uuid references public.skills(id),
  status swap_status not null default 'pending',
  created_at timestamp with time zone default now()
);

-- Feedback after swap completion
create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  swap_id uuid references public.swap_requests(id) on delete cascade,
  from_user_id uuid references public.users(id) on delete cascade,
  to_user_id uuid references public.users(id) on delete cascade,
  stars int not null check (stars between 1 and 5),
  comment text,
  created_at timestamp with time zone default now()
);

-- Admin logs
create table if not exists public.admin_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.users(id) on delete set null,
  action_type text not null,
  target_id uuid,
  details jsonb,
  created_at timestamp with time zone default now()
);

-- -------------------------------
-- INDEXES & CONSTRAINTS
-- -------------------------------
-- Full-text search on skill names
create index if not exists idx_skills_name_fts on public.skills using gin (to_tsvector('english', name));

-- -------------------------------
-- RLS (Row-Level Security) – Enabled but policies are defined separately
-- -------------------------------
alter table public.users enable row level security;
alter table public.user_skills enable row level security;
alter table public.desired_skills enable row level security;
alter table public.availability_slots enable row level security;
alter table public.swap_requests enable row level security;
alter table public.feedback enable row level security;

-- Note: Define granular policies in a follow-up migration once roles are clarified. 