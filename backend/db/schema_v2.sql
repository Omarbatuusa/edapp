-- Enable Extensions
create extension if not exists "uuid-ossp";

-- ==========================================
-- 0. Mock Supabase Auth (For Local/Self-Hosted)
-- ==========================================
create schema if not exists auth;
create table if not exists auth.users (
    id uuid default uuid_generate_v4() primary key,
    email text unique not null,
    encrypted_password text,
    created_at timestamp with time zone default now()
);

-- ==========================================
-- 1. Core Identity & Tenancy
-- ==========================================
create table public.tenants (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  code text not null unique,
  domain text unique, -- e.g., 'spark-ormonde.edapp.co.za'
  logo_url text,
  config jsonb default '{}'::jsonb, -- Modules enabled/disabled
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create type public.app_role as enum ('admin', 'staff', 'parent', 'student');

create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  first_name text,
  last_name text,
  role app_role default 'parent'::app_role,
  tenant_id uuid references public.tenants(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==========================================
-- 2. Academics (CAPS Structure)
-- ==========================================
create table public.academic_years (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid references public.tenants(id) on delete cascade not null,
  year integer not null,
  is_active boolean default false,
  term_config jsonb -- Define terms (Name, Start, End)
);

create table public.grades (
    id uuid default uuid_generate_v4() primary key,
    tenant_id uuid references public.tenants(id) on delete cascade not null,
    name text not null, -- "Grade 1"
    phase text -- "Foundation", "Senior", "FET"
);

create table public.subjects (
    id uuid default uuid_generate_v4() primary key,
    tenant_id uuid references public.tenants(id) on delete cascade not null,
    name text not null,
    code text
);

-- ==========================================
-- 3. Discipline & Policies
-- ==========================================
create table public.policies (
    id uuid default uuid_generate_v4() primary key,
    tenant_id uuid references public.tenants(id) on delete cascade not null,
    title text not null,
    content text,
    category text, -- Conduct, Uniform, etc.
    version text default '1.0',
    is_active boolean default true,
    file_url text, -- PDF attachment
    created_at timestamp with time zone default now()
);

create type public.behaviour_type as enum ('merit', 'demerit');

create table public.behaviour_categories (
    id uuid default uuid_generate_v4() primary key,
    tenant_id uuid references public.tenants(id) on delete cascade not null,
    name text not null, -- "Late Coming", "Kindness"
    type behaviour_type not null,
    points integer default 1,
    severity_level text -- "Level 1" to "Level 5"
);

create table public.behaviour_records (
    id uuid default uuid_generate_v4() primary key,
    tenant_id uuid references public.tenants(id) on delete cascade not null,
    student_id uuid references public.profiles(id) not null, -- Assuming student profile
    issuer_id uuid references public.profiles(id) not null, -- Staff member
    category_id uuid references public.behaviour_categories(id),
    incident_date timestamp with time zone default now(),
    description text,
    points integer,
    status text default 'recorded', -- recorded, escalated, resolved
    parent_notified boolean default false
);

-- ==========================================
-- 4. RLS Policies
-- ==========================================
alter table public.tenants enable row level security;
alter table public.profiles enable row level security;
alter table public.policies enable row level security;
alter table public.behaviour_records enable row level security;

-- (Policies to be defined: Users can only view data from their own tenant)
