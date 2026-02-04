-- Migration: Add new role enum values to PostgreSQL
-- Run this on your production database

-- Add new platform roles
ALTER TYPE role_assignments_role_enum ADD VALUE IF NOT EXISTS 'platform_secretary';
ALTER TYPE role_assignments_role_enum ADD VALUE IF NOT EXISTS 'platform_support';

-- Add governance roles
ALTER TYPE role_assignments_role_enum ADD VALUE IF NOT EXISTS 'brand_admin';
ALTER TYPE role_assignments_role_enum ADD VALUE IF NOT EXISTS 'main_branch_admin';
ALTER TYPE role_assignments_role_enum ADD VALUE IF NOT EXISTS 'tenant_admin';

-- Add operations roles
ALTER TYPE role_assignments_role_enum ADD VALUE IF NOT EXISTS 'admissions_officer';
ALTER TYPE role_assignments_role_enum ADD VALUE IF NOT EXISTS 'finance_officer';
ALTER TYPE role_assignments_role_enum ADD VALUE IF NOT EXISTS 'hr_admin';
ALTER TYPE role_assignments_role_enum ADD VALUE IF NOT EXISTS 'reception';
ALTER TYPE role_assignments_role_enum ADD VALUE IF NOT EXISTS 'it_admin';

-- Add academic leadership roles
ALTER TYPE role_assignments_role_enum ADD VALUE IF NOT EXISTS 'principal';
ALTER TYPE role_assignments_role_enum ADD VALUE IF NOT EXISTS 'deputy_principal';
ALTER TYPE role_assignments_role_enum ADD VALUE IF NOT EXISTS 'smt';
ALTER TYPE role_assignments_role_enum ADD VALUE IF NOT EXISTS 'grade_head';
ALTER TYPE role_assignments_role_enum ADD VALUE IF NOT EXISTS 'phase_head';

-- Add teaching roles
ALTER TYPE role_assignments_role_enum ADD VALUE IF NOT EXISTS 'class_teacher';
ALTER TYPE role_assignments_role_enum ADD VALUE IF NOT EXISTS 'subject_teacher';

-- Add support roles
ALTER TYPE role_assignments_role_enum ADD VALUE IF NOT EXISTS 'counsellor';
ALTER TYPE role_assignments_role_enum ADD VALUE IF NOT EXISTS 'nurse';
ALTER TYPE role_assignments_role_enum ADD VALUE IF NOT EXISTS 'transport';
ALTER TYPE role_assignments_role_enum ADD VALUE IF NOT EXISTS 'aftercare';
ALTER TYPE role_assignments_role_enum ADD VALUE IF NOT EXISTS 'security';
ALTER TYPE role_assignments_role_enum ADD VALUE IF NOT EXISTS 'caretaker';

-- Add community roles
ALTER TYPE role_assignments_role_enum ADD VALUE IF NOT EXISTS 'alumni';
ALTER TYPE role_assignments_role_enum ADD VALUE IF NOT EXISTS 'sgb_member';
ALTER TYPE role_assignments_role_enum ADD VALUE IF NOT EXISTS 'parent_association';

-- Update existing tenant_main_admin to main_branch_admin (if any)
UPDATE role_assignments SET role = 'main_branch_admin' WHERE role = 'tenant_main_admin';
UPDATE role_assignments SET role = 'finance_officer' WHERE role = 'finance_admin';
UPDATE role_assignments SET role = 'hr_admin' WHERE role = 'staff_admin';
