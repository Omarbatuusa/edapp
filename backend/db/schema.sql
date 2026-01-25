-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Tenants Table (Schools)
create table public.tenants (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  code text not null unique, -- e.g., 'spark-ormonde'
  domain text unique, -- e.g., 'spark-ormonde.edapp.co.za'
  logo_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Roles Enum
create type public.app_role as enum ('admin', 'staff', 'parent', 'student');

-- 3. Profiles Table (Linked to Supabase Auth)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  first_name text,
  last_name text,
  role app_role default 'parent'::app_role,
  tenant_id uuid references public.tenants(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. RLS Policies (Row Level Security)
alter table public.tenants enable row level security;
alter table public.profiles enable row level security;

-- Tenant: Everyone can read tenants (for resolving domains)
create policy "Public tenants are viewable by everyone"
  on public.tenants for select
  using ( true );

-- Profiles: Users can see their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using ( auth.uid() = id );

-- 5. Seed Initial Tenant (Example)
insert into public.tenants (name, code, domain)
values 
('Spark Schools - Ormonde', 'spark-ormonde', 'spark-ormonde.edapp.co.za'),
('Spark Schools - Maboneng', 'spark-maboneng', 'spark-maboneng.edapp.co.za');
