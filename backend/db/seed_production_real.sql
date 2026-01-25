-- REAL PRODUCTION SEED DATA & SCHEMA UPGRADE
-- Generated for Lakewood / Allied / Jeppe Reset

-- ==========================================
-- 1. Schema Upgrades (Branches & Domains)
-- ==========================================

-- Branches (Campuses)
CREATE TABLE IF NOT EXISTS branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  code TEXT NOT NULL, -- e.g., 'ALLI-Rob'
  config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, code)
);

-- Domain Registry
DO $$ BEGIN
    CREATE TYPE domain_type AS ENUM ('login', 'apply', 'marketing');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS tenant_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE, -- Nullable (if domain is for whole brand)
  hostname TEXT UNIQUE NOT NULL, -- e.g. 'allied-girls.edapp.co.za'
  type domain_type DEFAULT 'login',
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_domains ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 2. Seed Tenants (Brands)
-- ==========================================
-- Handle Legacy Migration (LAKE001 -> LAKEWOOD) to avoid unique constraint violation on domain
UPDATE tenants SET code = 'LAKEWOOD', name = 'Lakewood Educational Network' 
WHERE code = 'LAKE001';

INSERT INTO tenants (name, code, domain, config) VALUES 
('Lakewood Educational Network', 'LAKEWOOD', 'lakewood.edapp.co.za', '{"theme": "lakewood", "modules": ["academics", "discipline", "attendance"]}'::jsonb),
('Allied Schools', 'ALLIED', 'allied.edapp.co.za', '{"theme": "allied", "modules": ["academics", "discipline", "attendance"]}'::jsonb),
('Jeppe Educational Centre', 'JEPPE', 'jeppe.edapp.co.za', '{"theme": "jeppe", "modules": ["academics", "discipline", "attendance"]}'::jsonb)
ON CONFLICT (code) DO UPDATE 
SET name = EXCLUDED.name, domain = EXCLUDED.domain, config = EXCLUDED.config;

-- Ensure domains are correct if they were different
UPDATE tenants SET domain = 'lakewood.edapp.co.za' WHERE code = 'LAKEWOOD';


-- ==========================================
-- 3. Seed Branches (Campuses)
-- ==========================================

DO $$
DECLARE
    lakewood_id UUID;
    allied_id UUID;
    jeppe_id UUID;
BEGIN
    SELECT id INTO lakewood_id FROM tenants WHERE code = 'LAKEWOOD';
    SELECT id INTO allied_id FROM tenants WHERE code = 'ALLIED';
    SELECT id INTO jeppe_id FROM tenants WHERE code = 'JEPPE';

    IF lakewood_id IS NULL THEN
        RAISE NOTICE 'Lakewood Tenant NOT FOUND!';
    ELSE
        RAISE NOTICE 'Found Lakewood Tenant: %', lakewood_id;
    END IF;

    -- Lakewood Branches
    INSERT INTO branches (tenant_id, name, code) VALUES
    (lakewood_id, 'Lakewood International Academy', 'LIA-ORM'), -- Ormonde
    (lakewood_id, 'Tasmiyah Academy', 'TAS-ACAD')
    ON CONFLICT (tenant_id, code) DO NOTHING;

    -- Allied Branches
    INSERT INTO branches (tenant_id, name, code) VALUES
    (allied_id, 'Allied School Robertsham', 'ALLI-ROB'),
    (allied_id, 'Allied Fordsburg (Boys)', 'ALLI-FORD-B'),
    (allied_id, 'Allied Fordsburg (Girls)', 'ALLI-FORD-G'),
    (allied_id, 'Allied Castle', 'ALLI-CASTLE')
    ON CONFLICT (tenant_id, code) DO NOTHING;

    -- Jeppe
    INSERT INTO branches (tenant_id, name, code) VALUES
    (jeppe_id, 'Jeppe Educational Centre', 'JEPPE-MAIN')
    ON CONFLICT (tenant_id, code) DO NOTHING;

END $$;

-- ==========================================
-- 4. Seed Domain Registry
-- ==========================================

DO $$
DECLARE
    lakewood_id UUID;
    allied_id UUID;
    jeppe_id UUID;
    
    lia_id UUID;
    tas_id UUID;
    
    alli_rob_id UUID;
    alli_fb_b_id UUID;
    alli_fb_g_id UUID;
    alli_castle_id UUID;
    
    jeppe_branch_id UUID;
BEGIN
    -- Get IDs
    SELECT id INTO lakewood_id FROM tenants WHERE code = 'LAKEWOOD';
    SELECT id INTO allied_id FROM tenants WHERE code = 'ALLIED';
    SELECT id INTO jeppe_id FROM tenants WHERE code = 'JEPPE';

    SELECT id INTO lia_id FROM branches WHERE code = 'LIA-ORM';
    SELECT id INTO tas_id FROM branches WHERE code = 'TAS-ACAD';

    SELECT id INTO alli_rob_id FROM branches WHERE code = 'ALLI-ROB';
    SELECT id INTO alli_fb_b_id FROM branches WHERE code = 'ALLI-FORD-B';
    SELECT id INTO alli_fb_g_id FROM branches WHERE code = 'ALLI-FORD-G';
    SELECT id INTO alli_castle_id FROM branches WHERE code = 'ALLI-CASTLE';

    SELECT id INTO jeppe_branch_id FROM branches WHERE code = 'JEPPE-MAIN';

    -- --------------------------------------
    -- Lakewood Domains
    -- --------------------------------------
    -- Brand Login
    INSERT INTO tenant_domains (tenant_id, branch_id, hostname, type, is_primary) VALUES
    (lakewood_id, NULL, 'lakewood.edapp.co.za', 'login', true),
    (lakewood_id, NULL, 'apply-lakewood.edapp.co.za', 'apply', false)
    ON CONFLICT (hostname) DO NOTHING;

    -- LIA Campus
    IF lia_id IS NOT NULL THEN
        INSERT INTO tenant_domains (tenant_id, branch_id, hostname, type) VALUES
        (lakewood_id, lia_id, 'lakewood-ormonde.edapp.co.za', 'login'),
        (lakewood_id, lia_id, 'apply-lakewood-ormonde.edapp.co.za', 'apply'),
        (lakewood_id, lia_id, 'lia.edapp.co.za', 'login'),
        (lakewood_id, lia_id, 'apply-lia.edapp.co.za', 'apply')
        ON CONFLICT (hostname) DO NOTHING;
    END IF;

    -- Tasmiyah Campus
    IF tas_id IS NOT NULL THEN
        INSERT INTO tenant_domains (tenant_id, branch_id, hostname, type) VALUES
        (lakewood_id, tas_id, 'tasmiyah.edapp.co.za', 'login'),
        (lakewood_id, tas_id, 'apply-tasmiyah.edapp.co.za', 'apply'),
        (lakewood_id, tas_id, 'tas.edapp.co.za', 'login'),
        (lakewood_id, tas_id, 'apply-tas.edapp.co.za', 'apply')
        ON CONFLICT (hostname) DO NOTHING;
    END IF;

    -- --------------------------------------
    -- Allied Domains
    -- --------------------------------------
    -- Brand Login
    INSERT INTO tenant_domains (tenant_id, branch_id, hostname, type, is_primary) VALUES
    (allied_id, NULL, 'allied.edapp.co.za', 'login', true),
    (allied_id, NULL, 'apply-allied.edapp.co.za', 'apply', false)
    ON CONFLICT (hostname) DO NOTHING;

    -- Fordsburg Girls
    IF alli_fb_g_id IS NOT NULL THEN
        INSERT INTO tenant_domains (tenant_id, branch_id, hostname, type) VALUES
        (allied_id, alli_fb_g_id, 'allied-girls-fordsburg.edapp.co.za', 'login'),
        (allied_id, alli_fb_g_id, 'apply-allied-girls-fordsburg.edapp.co.za', 'apply')
        ON CONFLICT (hostname) DO NOTHING;
    END IF;

    -- Fordsburg Boys
    IF alli_fb_b_id IS NOT NULL THEN
        INSERT INTO tenant_domains (tenant_id, branch_id, hostname, type) VALUES
        (allied_id, alli_fb_b_id, 'allied-boys-fordsburg.edapp.co.za', 'login'),
        (allied_id, alli_fb_b_id, 'apply-allied-boys-fordsburg.edapp.co.za', 'apply')
        ON CONFLICT (hostname) DO NOTHING;
    END IF;

    -- Robertsham (Main)
    IF alli_rob_id IS NOT NULL THEN
        INSERT INTO tenant_domains (tenant_id, branch_id, hostname, type) VALUES
        (allied_id, alli_rob_id, 'allied-robertsham.edapp.co.za', 'login'),
        (allied_id, alli_rob_id, 'apply-allied-robertsham.edapp.co.za', 'apply')
        ON CONFLICT (hostname) DO NOTHING;
    END IF;
    
    -- Castle
    IF alli_castle_id IS NOT NULL THEN
        INSERT INTO tenant_domains (tenant_id, branch_id, hostname, type) VALUES
        (allied_id, alli_castle_id, 'allied-castle.edapp.co.za', 'login'),
        (allied_id, alli_castle_id, 'apply-allied-castle.edapp.co.za', 'apply')
        ON CONFLICT (hostname) DO NOTHING;
    END IF;

    -- --------------------------------------
    -- Jeppe Domains
    -- --------------------------------------
    IF jeppe_branch_id IS NOT NULL THEN
        INSERT INTO tenant_domains (tenant_id, branch_id, hostname, type, is_primary) VALUES
        (jeppe_id, jeppe_branch_id, 'jeppe.edapp.co.za', 'login', true),
        (jeppe_id, jeppe_branch_id, 'apply-jeppe.edapp.co.za', 'apply', false)
        ON CONFLICT (hostname) DO NOTHING;
    END IF;

END $$;

-- ==========================================
-- 5. Seed Users (Test Accounts)
-- ==========================================

DO $$
DECLARE
    lakewood_id UUID;
    allied_id UUID;
    
    lia_id UUID;
    tas_id UUID;
    alli_rob_id UUID;

    admin_role_id UUID;
    educator_role_id UUID;
    learner_role_id UUID;
    parent_role_id UUID;
    
    user_id UUID;
BEGIN
    SELECT id INTO lakewood_id FROM tenants WHERE code = 'LAKEWOOD';
    SELECT id INTO allied_id FROM tenants WHERE code = 'ALLIED';
    
    SELECT id INTO lia_id FROM branches WHERE code = 'LIA-ORM';
    SELECT id INTO tas_id FROM branches WHERE code = 'TAS-ACAD';
    SELECT id INTO alli_rob_id FROM branches WHERE code = 'ALLI-ROB';

    SELECT id INTO admin_role_id FROM roles WHERE slug = 'tenant_admin';
    SELECT id INTO educator_role_id FROM roles WHERE slug = 'educator';
    SELECT id INTO learner_role_id FROM roles WHERE slug = 'learner';
    SELECT id INTO parent_role_id FROM roles WHERE slug = 'parent';

    -- 1. Global Admin (Lakewood Context)
    -- Insert into AUTH.USERS
    INSERT INTO auth.users (email, encrypted_password) VALUES ('admin@lakewood.edu', '$2a$10$eb7iplRNI5bQyO8kpc1upu3Nwd.n7YINNCr63byr4cm0IVCOk39eC')
    ON CONFLICT (email) DO NOTHING;
    SELECT id INTO user_id FROM auth.users WHERE email = 'admin@lakewood.edu';
    
    -- Update Profile
    INSERT INTO profiles (id, email, first_name, last_name, role, tenant_id)
    VALUES (user_id, 'admin@lakewood.edu', 'Lakewood', 'Admin', 'staff', lakewood_id)
    ON CONFLICT (id) DO UPDATE SET tenant_id = EXCLUDED.tenant_id;

    -- Assign Role
    INSERT INTO user_role_assignments (user_id, tenant_id, scope, role_id)
    VALUES (user_id, lakewood_id, 'tenant', admin_role_id)
    ON CONFLICT DO NOTHING;

    -- 2. Allied Admin
    INSERT INTO auth.users (email, encrypted_password) VALUES ('admin@allied.edu', '$2a$10$eb7iplRNI5bQyO8kpc1upu3Nwd.n7YINNCr63byr4cm0IVCOk39eC')
    ON CONFLICT (email) DO NOTHING;
    SELECT id INTO user_id FROM auth.users WHERE email = 'admin@allied.edu';
    
    INSERT INTO profiles (id, email, first_name, last_name, role, tenant_id)
    VALUES (user_id, 'admin@allied.edu', 'Allied', 'Admin', 'staff', allied_id)
    ON CONFLICT (id) DO UPDATE SET tenant_id = EXCLUDED.tenant_id;
    
    INSERT INTO user_role_assignments (user_id, tenant_id, scope, role_id)
    VALUES (user_id, allied_id, 'tenant', admin_role_id)
    ON CONFLICT DO NOTHING;

    -- 3. Staff (LIA Branch)
    -- Create User
    INSERT INTO auth.users (email, encrypted_password) VALUES ('staff@lia.edu', '$2a$10$eb7iplRNI5bQyO8kpc1upu3Nwd.n7YINNCr63byr4cm0IVCOk39eC')
    ON CONFLICT (email) DO NOTHING;
    SELECT id INTO user_id FROM auth.users WHERE email = 'staff@lia.edu';

    INSERT INTO profiles (id, email, first_name, last_name, role, tenant_id)
    VALUES (user_id, 'staff@lia.edu', 'Staff', 'LIA', 'staff', lakewood_id)
    ON CONFLICT (id) DO NOTHING;
    
    -- Assign Role: Validate LIA ID
    IF lia_id IS NULL THEN
        RAISE NOTICE 'Skipping Staff Assignment: LIA Branch ID is NULL!';
    ELSE
        INSERT INTO user_role_assignments (user_id, tenant_id, scope, scope_id, role_id)
        VALUES (user_id, lakewood_id, 'branch', lia_id, educator_role_id)
        ON CONFLICT DO NOTHING;
    END IF;

    -- 4. Learner (Allied Robertsham)
    INSERT INTO auth.users (email, encrypted_password) VALUES ('learner@allied.edu', '$2a$10$eb7iplRNI5bQyO8kpc1upu3Nwd.n7YINNCr63byr4cm0IVCOk39eC')
    ON CONFLICT (email) DO NOTHING;
    SELECT id INTO user_id FROM auth.users WHERE email = 'learner@allied.edu';
    
    INSERT INTO profiles (id, email, first_name, last_name, role, tenant_id, student_number, pin_hash)
    VALUES (user_id, 'learner@allied.edu', 'Learner', 'Allied', 'student', allied_id, 'ALLI001', '$2a$10$eb7iplRNI5bQyO8kpc1upu3Nwd.n7YINNCr63byr4cm0IVCOk39eC')
    ON CONFLICT (id) DO UPDATE SET student_number = 'ALLI001';

    IF alli_rob_id IS NULL THEN
        RAISE NOTICE 'Skipping Learner Assignment: Allied Robertsham Branch ID is NULL!';
    ELSE
        INSERT INTO user_role_assignments (user_id, tenant_id, scope, scope_id, role_id)
        VALUES (user_id, allied_id, 'branch', alli_rob_id, learner_role_id)
        ON CONFLICT DO NOTHING;
    END IF;

END $$;
