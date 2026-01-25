-- Fix missing tables for Domain Resolution
create extension if not exists "uuid-ossp";

-- 1. Create Branches Table (if not exists)
CREATE TABLE IF NOT EXISTS public.branches (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
    name text NOT NULL,
    code text,
    config jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now()
);

-- 2. Create Tenant Domains Table
CREATE TABLE IF NOT EXISTS public.tenant_domains (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
    branch_id uuid REFERENCES public.branches(id) ON DELETE SET NULL,
    hostname text UNIQUE NOT NULL,
    type text DEFAULT 'login', -- login, apply, portal
    created_at timestamp with time zone DEFAULT now()
);

-- 3. Seed Default Domains (Lakewood)
DO $$
DECLARE
    lakewood_id uuid;
BEGIN
    SELECT id INTO lakewood_id FROM tenants WHERE code = 'LAKE001';
    
    IF lakewood_id IS NOT NULL THEN
        INSERT INTO tenant_domains (tenant_id, hostname, type)
        VALUES (lakewood_id, 'lakewood.edapp.co.za', 'login')
        ON CONFLICT (hostname) DO NOTHING;
        
        RAISE NOTICE 'Seeded lakewood.edapp.co.za';
    END IF;
END $$;
