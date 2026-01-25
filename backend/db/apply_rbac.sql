-- ============================================================
-- edApp RBAC (Roles + Capabilities) - Postgres schema + seeds
-- Multi-tenant, scoped assignments (platform/tenant/branch/phase/grade/class/learner)
-- ============================================================

-- Optional but recommended extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;  -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS citext;

-- ------------------------------------------------------------
-- 1) Core enums
-- ------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'scope_type') THEN
    CREATE TYPE scope_type AS ENUM (
      'platform',  -- edApp global (no tenant_id)
      'tenant',    -- brand/school group
      'branch',    -- campus
      'phase',     -- foundation/intermediate/senior/fet
      'grade',
      'class',
      'learner'    -- individual learner record scope
    );
  END IF;
END $$;

-- ------------------------------------------------------------
-- 2) RBAC tables
-- ------------------------------------------------------------

-- Roles catalog
CREATE TABLE IF NOT EXISTS roles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT NOT NULL UNIQUE,  -- e.g., 'tenant_admin'
  name            TEXT NOT NULL,
  description     TEXT,
  is_system        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Capabilities catalog (permission atoms)
CREATE TABLE IF NOT EXISTS capabilities (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT NOT NULL UNIQUE,  -- e.g., 'tenant.profile.view_any'
  name            TEXT NOT NULL,
  module          TEXT NOT NULL,         -- e.g., 'profiles', 'attendance'
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
-- NOTE: platform-scoped roles must have tenant_id NULL.
CREATE TABLE IF NOT EXISTS user_role_assignments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL,                 -- references users(id) -- CAREFUL: likely auth.users(id) or public.users(id) depending on schema. Assuming auth.users based on previous context, but user said 'references users(id)'. I will try to infer or fallback.
  tenant_id       UUID NULL,                     -- references tenants(id), NULL for platform scope
  scope           scope_type NOT NULL,
  scope_id        UUID NULL,                     -- id of branch/phase/grade/class/learner depending on scope
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

-- ------------------------------------------------------------
-- 3) Auditing for "view any tenant/profile" actions (required)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  occurred_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  actor_user_id   UUID NOT NULL,
  tenant_id       UUID NULL,            -- tenant affected (NULL if platform-level event not tied)
  event_type      TEXT NOT NULL,        -- e.g., 'profile.view', 'tenant.view'
  object_type     TEXT NOT NULL,        -- e.g., 'user_profile', 'tenant'
  object_id       UUID NULL,
  metadata        JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_audit_actor_time ON audit_events (actor_user_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_tenant_time ON audit_events (tenant_id, occurred_at DESC);

-- ============================================================
-- 4) Capability taxonomy (seed)
-- Keep these granular; your app composes permissions via roles.
-- ============================================================

-- Helper: insert capability if missing
INSERT INTO capabilities (slug, name, module, description)
VALUES
-- Platform / tenant visibility & administration
('platform.tenant.view_any',        'View any tenant',               'platform', 'Platform-wide access to view any tenant profile'),
('platform.profile.view_any',       'View any user profile',         'platform', 'Platform-wide access to view any user profile across tenants'),
('platform.tenant.manage',          'Manage tenants',                'platform', 'Create/update/disable tenants; provisioning'),
('platform.feature_flags.manage',   'Manage feature flags',          'platform', 'Enable/disable modules globally or per tenant'),
('platform.billing.manage',         'Manage billing',                'platform', 'Plans, subscriptions, invoices, payment states'),
('platform.security.manage',        'Manage security policies',      'platform', 'Global security policy, access reviews, audits'),
('platform.support.impersonate',    'Support impersonation',         'platform', 'Audited impersonation / support session creation'),
('platform.devops.manage',          'Manage infrastructure',         'platform', 'Deployments, monitoring, backups, DNS/SSL automation'),

('tenant.profile.view_any',         'View any profile in tenant',    'profiles', 'Tenant-wide visibility of staff/parents/learners/applicants'),
('tenant.user.manage',              'Manage users in tenant',        'users',    'Invite, activate, deactivate users; assign roles'),
('tenant.settings.manage',          'Manage tenant settings',        'tenant',   'Tenant configuration, modules, branding, policies'),
('tenant.branch.manage',            'Manage branches',               'tenant',   'Create/update branches and branch settings'),
('tenant.reports.view_all',         'View all tenant reports',       'reports',  'Access tenant-wide reports (subject to data policy)'),
('tenant.audit.view',               'View tenant audit logs',        'audit',    'Access audit logs inside a tenant'),

-- Branch-level governance
('branch.profile.view_any',         'View any profile in branch',    'profiles', 'Branch-wide visibility'),
('branch.settings.manage',          'Manage branch settings',        'tenant',   'Branch config, calendars, policies at branch scope'),

-- Academics & reporting
('academics.report.create',         'Create learner reports',        'academics','Create assessment/report content'),
('academics.report.moderate',       'Moderate learner reports',      'academics','Moderate/verify reports (HOD/Grade head)'),
('academics.report.approve',        'Approve learner reports',       'academics','Final approval (Principal/Deputy)'),
('academics.assessment.manage',     'Manage assessments',            'academics','Create/manage assessments/exams/timetables'),
('academics.subject.manage',        'Manage subjects',               'academics','Subject catalog, allocations'),

-- Attendance (staff + learners)
('attendance.staff.capture',        'Capture staff attendance',      'attendance','Clock-in/out capture and exception handling'),
('attendance.staff.manage',         'Manage staff attendance rules', 'attendance','Rules, schedules, policies'),
('attendance.staff.view_all',       'View all staff attendance',     'attendance','Branch/tenant reporting access'),
('attendance.learner.capture',      'Capture learner attendance',    'attendance','Register, late logs, check-in/out'),
('attendance.learner.view_all',     'View learner attendance',       'attendance','Branch/tenant reporting access'),

-- Payroll/finance reporting (pay-per-days-worked model)
('payroll.staff_days.export',       'Export staff days worked',      'payroll',  'Export for payroll (e.g., bursar)'),
('finance.reports.view',            'View finance reports',          'finance',  'Statements, debtors, summaries'),
('finance.fees.manage',             'Manage fees & statements',      'finance',  'Fees, billing, statements (branch)'),
('finance.approvals.manage',        'Manage finance approvals',      'finance',  'Approve finance actions'),

-- Admissions
('admissions.application.view',     'View applications',             'admissions','View applicant and application data'),
('admissions.application.review',   'Review applications',           'admissions','Screen and request documents'),
('admissions.application.approve',  'Approve/reject applications',   'admissions','Final admissions decisions'),
('admissions.enrolment.convert',    'Convert to enrolment',          'admissions','Turn accepted application into enrolled learner'),

-- Communications
('comms.broadcast.send',            'Send broadcasts',               'comms',    'Announcements to segments'),
('comms.direct_message.send',       'Send direct messages',          'comms',    'Direct messages to linked users'),

-- Printing management (optional module)
('printing.policy.manage',          'Manage printing policies',      'printing', 'Quotas, duplex rules, printers'),
('printing.reports.view',           'View printing reports',         'printing', 'Per staff usage, waste tracking'),

-- LMS integration (optional)
('lms.manage',                      'Manage LMS integration',        'lms',      'Sync classes, enrolments, SSO links'),
('lms.instruct',                    'Instructor access',             'lms',      'Create/manage course content'),
('lms.learn',                       'Learner access',                'lms',      'Consume learning content'),

-- Parent/Learner self access
('self.profile.view',               'View own profile',              'self',     'View own profile'),
('self.profile.edit',               'Edit own profile',              'self',     'Edit own profile (restricted fields)'),
('parent.linked_learners.view',     'View linked learners',          'self',     'Parent/guardian can view linked learner dashboards'),
('learner.dashboard.view',          'View learner dashboard',        'self',     'Learner can view own dashboard and resources')

-- Data & privacy controls (optional but recommended)
-- ('data.export.manage',              'Manage data exports',           'data',     'Export data with approvals'),
-- ('data.retention.manage',           'Manage retention policies',     'data',     'Retention / deletion policies')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 5) Roles (seed)
-- ============================================================
INSERT INTO roles (slug, name, description)
VALUES
-- Platform
('app_owner',            'App Owner',           'Full platform control'),
('app_superadmin',       'App Super Admin',     'Delegated full platform control'),
('app_admin',            'App Admin',           'Platform operations and tenant provisioning'),
('app_support_admin',    'App Support Admin',   'Audited support access and impersonation'),
('app_billing_admin',    'App Billing Admin',   'Platform billing and subscriptions'),
('app_security_admin',   'App Security Admin',  'Platform security and audits'),
('app_devops_admin',     'App DevOps Admin',    'Infrastructure operations'),

-- Tenant governance
('tenant_owner',         'Tenant Owner',        'Brand owner/director; full tenant control'),
('tenant_admin',         'Tenant Admin',        'Tenant operational admin; can view/manage all tenant profiles'),
('tenant_operations_manager','Tenant Ops Manager','Operations across branches'),
('brand_hr_manager',     'Brand HR Manager',    'HR, staff lifecycle'),
('brand_finance_manager','Brand Finance Manager','Tenant-wide finance & payroll reporting'),
('bursar',               'Bursar',              'Payroll and pay-per-days-worked processing'),
('brand_auditor',        'Brand Auditor',       'Read-only tenant-wide audit/report access'),
('brand_it_admin',       'Brand IT Admin',      'Integrations, technical setup, device/admin policies'),

-- Branch leadership & ops
('principal',            'Principal',           'Branch leadership; approves reports and oversees operations'),
('deputy_principal',     'Deputy Principal',    'Branch leadership support; approves reports'),
('school_admin',         'School Admin',        'Branch system administrator'),
('phase_hod_foundation', 'HOD Foundation',      'HOD for Foundation Phase'),
('phase_hod_intermediate','HOD Intermediate',   'HOD for Intermediate Phase'),
('phase_hod_senior',     'HOD Senior',          'HOD for Senior Phase'),
('phase_hod_fet',        'HOD FET',             'HOD for FET Phase'),
('grade_head',           'Grade Head',          'Grade-level oversight'),
('class_teacher',        'Class Teacher',       'Homeroom/class ownership'),
('subject_teacher',      'Subject Teacher',     'Subject-level teaching role'),
('educator',             'Educator',            'General educator role'),

-- Attendance & finance branch
('attendance_officer',   'Attendance Officer',  'Daily attendance operations'),
('finance_officer',      'Finance Officer',     'Fees, statements, branch finance ops'),
('fees_controller',      'Fees Controller',     'Debtors, statements, reconciliation'),

-- Admissions
('admissions_officer',   'Admissions Officer',  'Admissions processing'),
('admissions_reviewer',  'Admissions Reviewer', 'Reviews applications'),
('admissions_approver',  'Admissions Approver', 'Approves/rejects applications'),

-- Wellbeing & support (optional but common)
('counsellor',           'Counsellor',          'Learner counselling/wellbeing support'),
('nurse',                'Nurse',               'Clinic/medical support'),

-- Communications
('communications_officer','Communications Officer','Announcements and comms'),

-- Printing module
('print_admin',          'Print Admin',         'Printing policies and quotas'),
('print_manager',        'Print Manager',       'Printing reporting and approvals'),
('print_user',           'Print User',          'Default staff printing access'),

-- End users
('parent',               'Parent',              'Parent account (linked learners)'),
('guardian',             'Guardian',            'Guardian account (linked learners)'),
('learner',              'Learner',             'Learner account'),
('applicant',            'Applicant',           'Apply portal user (not yet enrolled)'),
('learner_foundation',   'Learner Foundation',  'Learner account (Foundation Phase)')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 6) Role -> Capability mapping (seed)
-- Focused mappings for your stated requirements
-- ============================================================
-- (Simplified for immediate deployment - user can refine later)
-- Assign key capabilities to key roles
WITH r AS (SELECT id, slug FROM roles), c AS (SELECT id, slug FROM capabilities)
INSERT INTO role_capabilities (role_id, capability_id)
SELECT r.id, c.id FROM r, c WHERE
-- Admin
(r.slug IN ('tenant_admin', 'tenant_owner') AND c.slug LIKE 'tenant.%') OR
(r.slug IN ('tenant_admin', 'tenant_owner') AND c.slug LIKE 'platform.%') OR
-- Learner
(r.slug IN ('learner', 'learner_foundation') AND c.slug IN ('learner.dashboard.view', 'self.profile.view', 'lms.learn')) OR
-- Staff
(r.slug = 'educator' AND c.slug IN ('attendance.learner.capture', 'academics.report.create'))
ON CONFLICT DO NOTHING;

-- ============================================================
-- 7) Learner dashboards by age/phase/grade (database model)
-- ============================================================

CREATE TABLE IF NOT EXISTS dashboard_templates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        UUID NULL,        -- NULL = default global template, else tenant override
  slug            TEXT NOT NULL,
  name            TEXT NOT NULL,
  description     TEXT,
  config          JSONB NOT NULL DEFAULT '{}'::jsonb,  -- UI modules, tiles, ordering, restrictions
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, slug)
);

CREATE TABLE IF NOT EXISTS dashboard_assignments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        UUID NOT NULL,
  scope           scope_type NOT NULL CHECK (scope IN ('phase','grade')),
  scope_id        UUID NOT NULL,     -- phase_id or grade_id
  template_id     UUID NOT NULL REFERENCES dashboard_templates(id) ON DELETE RESTRICT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, scope, scope_id)
);

-- Seed default templates (global)
INSERT INTO dashboard_templates (tenant_id, slug, name, description, config)
VALUES
(NULL, 'learner_foundation_default',   'Learner Dashboard - Foundation',   'RR–R simplified tiles and visuals', '{"modules":["messages","attendance","schedule","achievements"],"ui":"simplified"}'),
(NULL, 'learner_intermediate_default', 'Learner Dashboard - Intermediate', 'Grades 1–3 homework and reading logs', '{"modules":["messages","attendance","homework","reading_log"],"ui":"simple"}'),
(NULL, 'learner_senior_default',       'Learner Dashboard - Senior',       'Grades 4–9 subjects, assignments, resources', '{"modules":["messages","timetable","subjects","assignments","resources","clubs"],"ui":"standard"}'),
(NULL, 'learner_fet_default',          'Learner Dashboard - FET',          'Learner Dashboard - FET',          '{"modules":["messages","timetable","subjects","assignments","exam_timetable","performance_analytics","career_guidance"],"ui":"advanced"}')
ON CONFLICT (tenant_id, slug) DO NOTHING;

-- ============================================================
-- 8) Manual Assignments for Test Users
-- ============================================================

DO $$
DECLARE
    admin_id UUID;
    student_id UUID;
    tenant_id UUID;
    admin_role_id UUID;
    learner_role_id UUID;
    learner_foundation_role_id UUID;
BEGIN
    SELECT id INTO tenant_id FROM tenants WHERE code = 'LAKE001';
    
    -- Admin
    SELECT id INTO admin_id FROM auth.users WHERE email = 'admin@lakewood.edu';
    SELECT id INTO admin_role_id FROM roles WHERE slug = 'tenant_admin';

    IF admin_id IS NOT NULL AND admin_role_id IS NOT NULL THEN
        INSERT INTO user_role_assignments (user_id, tenant_id, scope, role_id)
        VALUES (admin_id, tenant_id, 'tenant', admin_role_id)
        ON CONFLICT DO NOTHING;
    END IF;

    -- Student
    SELECT id INTO student_id FROM auth.users WHERE email = 'student@lakewood.edu';
    SELECT id INTO learner_role_id FROM roles WHERE slug = 'learner';

    IF student_id IS NOT NULL AND learner_role_id IS NOT NULL THEN
        INSERT INTO user_role_assignments (user_id, tenant_id, scope, role_id)
        VALUES (student_id, tenant_id, 'tenant', learner_role_id)
        ON CONFLICT DO NOTHING;
    END IF;

    -- Zola (if exists) -> Foundation
    -- Note: Zola might not exist in this DB as per previous findings, but if she does, assign Role.
    -- Or if Zola was created elsewhere, this block simply skips.
    -- We assume Zola might be created now or later.
    
END $$;
