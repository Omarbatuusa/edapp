-- Seed Capabilities, Roles, and Mappings
DO $$
BEGIN

-- 1. CAPABILITIES
-- Platform
INSERT INTO capabilities (slug, name, module, description) VALUES
('platform.tenant.view_any', 'View any tenant', 'platform', 'Platform-wide access to view any tenant profile'),
('platform.profile.view_any', 'View any user profile', 'platform', 'Platform-wide access to view any user profile'),
('platform.tenant.manage', 'Manage tenants', 'platform', 'Create/update/disable tenants'),
('platform.feature_flags.manage', 'Manage feature flags', 'platform', 'Enable/disable modules globally'),
('platform.billing.manage', 'Manage billing', 'platform', 'Plans, subscriptions'),
('platform.security.manage', 'Manage security policies', 'platform', 'Global security policy'),
('platform.support.impersonate', 'Support impersonation', 'platform', 'Audited support session creation'),
('platform.devops.manage', 'Manage infrastructure', 'platform', 'Deployments, monitoring'),

-- Tenant
('tenant.profile.view_any', 'View any profile in tenant', 'profiles', 'Tenant-wide visibility'),
('tenant.user.manage', 'Manage users in tenant', 'users', 'Invite, activate, deactivate users'),
('tenant.settings.manage', 'Manage tenant settings', 'tenant', 'Tenant configuration'),
('tenant.branch.manage', 'Manage branches', 'tenant', 'Create/update branches'),
('tenant.reports.view_all', 'View all tenant reports', 'reports', 'Access tenant-wide reports'),
('tenant.audit.view', 'View tenant audit logs', 'audit', 'Access audit logs'),

-- Branch
('branch.profile.view_any', 'View any profile in branch', 'profiles', 'Branch-wide visibility'),
('branch.settings.manage', 'Manage branch settings', 'tenant', 'Branch config'),

-- Academics
('academics.report.create', 'Create learner reports', 'academics', 'Create assessment/report content'),
('academics.report.moderate', 'Moderate learner reports', 'academics', 'Moderate/verify reports'),
('academics.report.approve', 'Approve learner reports', 'academics', 'Final approval'),
('academics.assessment.manage', 'Manage assessments', 'academics', 'Create/manage assessments'),
('academics.subject.manage', 'Manage subjects', 'academics', 'Subject catalog'),

-- Attendance
('attendance.staff.capture', 'Capture staff attendance', 'attendance', 'Clock-in/out capture'),
('attendance.staff.manage', 'Manage staff attendance rules', 'attendance', 'Rules, schedules'),
('attendance.staff.view_all', 'View all staff attendance', 'attendance', 'Branch/tenant reporting access'),
('attendance.learner.capture', 'Capture learner attendance', 'attendance', 'Register, late logs'),
('attendance.learner.view_all', 'View learner attendance', 'attendance', 'Branch/tenant reporting access'),

-- Finance
('payroll.staff_days.export', 'Export staff days worked', 'payroll', 'Export for payroll'),
('finance.reports.view', 'View finance reports', 'finance', 'Statements, debtors'),
('finance.fees.manage', 'Manage fees & statements', 'finance', 'Fees, billing'),
('finance.approvals.manage', 'Manage finance approvals', 'finance', 'Approve finance actions'),

-- Admissions
('admissions.application.view', 'View applications', 'admissions', 'View applicant data'),
('admissions.application.review', 'Review applications', 'admissions', 'Screen and request documents'),
('admissions.application.approve', 'Approve/reject applications', 'admissions', 'Final decisions'),
('admissions.enrolment.convert', 'Convert to enrolment', 'admissions', 'Convert accepted app to learner'),

-- Comms
('comms.broadcast.send', 'Send broadcasts', 'comms', 'Announcements to segments'),
('comms.direct_message.send', 'Send direct messages', 'comms', 'Direct messages'),

-- Self
('self.profile.view', 'View own profile', 'self', 'View own profile'),
('self.profile.edit', 'Edit own profile', 'self', 'Edit own profile'),
('parent.linked_learners.view', 'View linked learners', 'self', 'Parent view linked learners'),
('learner.dashboard.view', 'View learner dashboard', 'self', 'Learner view dashboard')
ON CONFLICT (slug) DO NOTHING;


-- 2. ROLES
INSERT INTO roles (slug, name, description) VALUES
-- Platform
('app_owner', 'App Owner', 'Full platform control'),
('app_superadmin', 'App Super Admin', 'Delegated platform control'),
('app_admin', 'App Admin', 'Platform ops'),
('app_support_admin', 'Support Admin', 'Support access'),

-- Tenant
('tenant_owner', 'Tenant Owner', 'Full tenant control'),
('tenant_admin', 'Tenant Admin', 'Tenant operational admin'),
('brand_finance_manager', 'Brand Finance Manager', 'Tenant finance'),
('brand_hr_manager', 'Brand HR Manager', 'Tenant HR'),
('bursar', 'Bursar', 'Payroll'),

-- Branch
('principal', 'Principal', 'Branch leadership'),
('deputy_principal', 'Deputy Principal', 'Branch deputy'),
('school_admin', 'School Admin', 'Branch admin'),
('phase_hod', 'Phase HOD', 'Head of Department'),
('grade_head', 'Grade Head', 'Grade oversight'),
('class_teacher', 'Class Teacher', 'Homeroom teacher'),
('educator', 'Educator', 'General educator'),
('finance_officer', 'Finance Officer', 'Branch finance'),
('admissions_officer', 'Admissions Officer', 'Admissions'),

-- Users
('parent', 'Parent', 'Parent account'),
('learner', 'Learner', 'Learner account'),
('applicant', 'Applicant', 'Applicant account')
ON CONFLICT (slug) DO NOTHING;


-- 3. MAPPINGS (Simplified for Seed)
-- Tenant Admin
INSERT INTO role_capabilities (role_id, capability_id)
SELECT r.id, c.id FROM roles r, capabilities c
WHERE r.slug = 'tenant_admin' AND c.slug IN (
    'tenant.profile.view_any', 'tenant.user.manage', 'tenant.settings.manage', 
    'tenant.branch.manage', 'tenant.reports.view_all', 'tenant.audit.view'
) ON CONFLICT DO NOTHING;

-- Principal
INSERT INTO role_capabilities (role_id, capability_id)
SELECT r.id, c.id FROM roles r, capabilities c
WHERE r.slug = 'principal' AND c.slug IN (
    'branch.profile.view_any', 'attendance.staff.view_all', 'attendance.learner.view_all',
    'academics.report.approve', 'tenant.reports.view_all', 'comms.broadcast.send'
) ON CONFLICT DO NOTHING;

-- Educator
INSERT INTO role_capabilities (role_id, capability_id)
SELECT r.id, c.id FROM roles r, capabilities c
WHERE r.slug = 'educator' AND c.slug IN (
    'academics.report.create', 'comms.direct_message.send', 'attendance.learner.capture'
) ON CONFLICT DO NOTHING;

-- Learner
INSERT INTO role_capabilities (role_id, capability_id)
SELECT r.id, c.id FROM roles r, capabilities c
WHERE r.slug = 'learner' AND c.slug IN (
    'self.profile.view', 'learner.dashboard.view', 'self.profile.edit'
) ON CONFLICT DO NOTHING;


-- 4. DASHBOARD TEMPLATES
INSERT INTO dashboard_templates (tenant_id, slug, name, description, config) VALUES
(NULL, 'learner_foundation_default', 'Learner Dashboard - Foundation', 'RR-R simplified', '{"modules":["messages","attendance","schedule","achievements"],"ui":"simplified"}'),
(NULL, 'learner_senior_default', 'Learner Dashboard - Senior', 'Grades 4-9 standard', '{"modules":["messages","timetable","subjects","assignments"],"ui":"standard"}')
ON CONFLICT (tenant_id, slug) DO NOTHING;

RAISE NOTICE 'RBAC Data Seeded Successfully';

END $$;
