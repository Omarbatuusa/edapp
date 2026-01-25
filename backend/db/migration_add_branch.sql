-- Migration: Add branch_id to profiles
ALTER TABLE profiles 
ADD COLUMN branch_id UUID REFERENCES branches(id) ON DELETE SET NULL;

-- Create Index for speed
CREATE INDEX idx_profiles_branch_id ON profiles(branch_id);

-- Update Seed Data Logic (Manual Fix for existing test users)
-- LIA Staff
UPDATE profiles 
SET branch_id = (SELECT id FROM branches WHERE code = 'LIA-ORM')
WHERE email = 'staff@lia.edu';

-- Allied Learner
UPDATE profiles
SET branch_id = (SELECT id FROM branches WHERE code = 'ALLI-ROB')
WHERE email = 'learner@allied.edu';

-- Admin Users (optional, usually null if they are Multi-Branch Tenant Admins)
-- But if they belong to a specific main hub, we can set it.
-- Leaving Admin branch_id NULL implies "Tenant Level Access".
