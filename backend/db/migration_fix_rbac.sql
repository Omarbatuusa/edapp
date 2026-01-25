-- Initialize RBAC Tables
create extension if not exists "uuid-ossp";

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'scope_type') THEN
    CREATE TYPE scope_type AS ENUM ('platform', 'tenant', 'branch', 'phase', 'grade', 'class', 'learner');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS roles (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug            TEXT NOT NULL UNIQUE,
  name            TEXT NOT NULL,
  description     TEXT,
  is_system       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS capabilities (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug            TEXT NOT NULL UNIQUE,
  name            TEXT NOT NULL,
  module          TEXT NOT NULL,
  description     TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS role_capabilities (
  role_id         UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  capability_id   UUID NOT NULL REFERENCES capabilities(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, capability_id)
);

CREATE TABLE IF NOT EXISTS user_role_assignments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL, 
  tenant_id       UUID NULL REFERENCES tenants(id) ON DELETE CASCADE,
  scope           scope_type NOT NULL,
  scope_id        UUID NULL,
  role_id         UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed Roles
INSERT INTO roles (slug, name, description) VALUES
('platform_admin', 'Platform Admin', 'Full system access'),
('tenant_admin', 'School Administrator', 'Full access to tenant'),
('staff', 'Staff Member', 'General staff access'),
('educator', 'Educator', 'Teacher access'),
('learner', 'Learner', 'Student access'),
('parent', 'Parent', 'Parent access')
ON CONFLICT (slug) DO NOTHING;

-- Assign Staff Role to Admin Users
DO $$
DECLARE
    staff_role_id uuid;
    lakewood_tenant_id uuid;
    lakewood_user_id uuid;
    stmarks_tenant_id uuid;
    stmarks_user_id uuid;
BEGIN
    SELECT id INTO staff_role_id FROM roles WHERE slug = 'staff';
    
    -- Lakewood Assignment
    SELECT id INTO lakewood_tenant_id FROM tenants WHERE code = 'LAKE001';
    SELECT id INTO lakewood_user_id FROM auth.users WHERE email = 'admin@lakewood.edu';
    
    IF staff_role_id IS NOT NULL AND lakewood_tenant_id IS NOT NULL AND lakewood_user_id IS NOT NULL THEN
        INSERT INTO user_role_assignments (user_id, tenant_id, scope, role_id)
        VALUES (lakewood_user_id, lakewood_tenant_id, 'tenant', staff_role_id)
        ON CONFLICT DO NOTHING; -- No unique constraint here but safe enough for run-once
        RAISE NOTICE 'Assigned Staff role to admin@lakewood.edu';
    END IF;

    -- StMarks Assignment
    SELECT id INTO stmarks_tenant_id FROM tenants WHERE code = 'STMARKS';
    SELECT id INTO stmarks_user_id FROM auth.users WHERE email = 'admin@stmarks.edu';

    IF staff_role_id IS NOT NULL AND stmarks_tenant_id IS NOT NULL AND stmarks_user_id IS NOT NULL THEN
        INSERT INTO user_role_assignments (user_id, tenant_id, scope, role_id)
        VALUES (stmarks_user_id, stmarks_tenant_id, 'tenant', staff_role_id)
        ON CONFLICT DO NOTHING;
        RAISE NOTICE 'Assigned Staff role to admin@stmarks.edu';
    END IF;
END $$;
