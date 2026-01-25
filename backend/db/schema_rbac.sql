-- edApp RBAC (Roles + Capabilities) - Postgres schema + seeds
-- Multi-tenant, scoped assignments (platform/tenant/branch/phase/grade/class/learner)

-- Optional but recommended extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

-- ------------------------------------------------------------
-- 1) Core enums
-- ------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'scope_type') THEN
    CREATE TYPE scope_type AS ENUM (
      'platform',
      'tenant',
      'branch',
      'phase',
      'grade',
      'class',
      'learner'
    );
  END IF;
END $$;

-- ------------------------------------------------------------
-- 2) RBAC tables
-- ------------------------------------------------------------

-- Roles catalog
CREATE TABLE IF NOT EXISTS roles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT NOT NULL UNIQUE,
  name            TEXT NOT NULL,
  description     TEXT,
  is_system       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Capabilities catalog (permission atoms)
CREATE TABLE IF NOT EXISTS capabilities (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT NOT NULL UNIQUE,
  name            TEXT NOT NULL,
  module          TEXT NOT NULL,
  description     TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Many-to-many mapping: role -> capability
CREATE TABLE IF NOT EXISTS role_capabilities (
  role_id         UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  capability_id   UUID NOT NULL REFERENCES capabilities(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, capability_id)
);

-- Scoped role assignments: user holds a role within a scope
CREATE TABLE IF NOT EXISTS user_role_assignments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL, -- references auth.users(id) or public.profiles(id)? using UUID for now, implicit link
  tenant_id       UUID NULL REFERENCES tenants(id) ON DELETE CASCADE, -- NULL for platform scope
  scope           scope_type NOT NULL,
  scope_id        UUID NULL, -- id of branch/phase/grade/class/learner depending on scope
  role_id         UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  starts_at       TIMESTAMPTZ NULL,
  ends_at         TIMESTAMPTZ NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Basic scope integrity rules
  CONSTRAINT ura_platform_has_no_tenant CHECK (
    (scope <> 'platform') OR (tenant_id IS NULL)
  ),
  CONSTRAINT ura_scope_id_required CHECK (
    (scope IN ('platform','tenant') AND scope_id IS NULL)
    OR
    (scope NOT IN ('platform','tenant') AND scope_id IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_ura_user_active ON user_role_assignments (user_id) WHERE is_active;
CREATE INDEX IF NOT EXISTS idx_ura_tenant_scope ON user_role_assignments (tenant_id, scope, scope_id) WHERE is_active;
CREATE UNIQUE INDEX IF NOT EXISTS uq_ura_active_unique ON user_role_assignments (user_id, tenant_id, scope, scope_id, role_id) WHERE is_active;

-- ------------------------------------------------------------
-- 3) Auditing
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  occurred_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  actor_user_id   UUID NOT NULL,
  tenant_id       UUID NULL,
  event_type      TEXT NOT NULL,
  object_type     TEXT NOT NULL,
  object_id       UUID NULL,
  metadata        JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_audit_actor_time ON audit_events (actor_user_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_tenant_time ON audit_events (tenant_id, occurred_at DESC);

-- ------------------------------------------------------------
-- 4) Dashboard Templates (Phase/Grade Logic)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS dashboard_templates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NULL REFERENCES tenants(id) ON DELETE CASCADE, -- NULL = default
  slug            TEXT NOT NULL,
  name            TEXT NOT NULL,
  description     TEXT,
  config          JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, slug)
);

CREATE TABLE IF NOT EXISTS dashboard_assignments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  scope           scope_type NOT NULL CHECK (scope IN ('phase','grade')),
  scope_id        UUID NOT NULL,
  template_id     UUID NOT NULL REFERENCES dashboard_templates(id) ON DELETE RESTRICT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, scope, scope_id)
);
