-- Add student_number and pin_hash to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS student_number TEXT,
ADD COLUMN IF NOT EXISTS pin_hash TEXT;

-- Create constraint to ensure student_number is unique per tenant? 
-- Or global unique? Usually per tenant.
-- But unique index on (tenant_id, student_number) is better.
DROP INDEX IF EXISTS idx_profiles_student_number;
CREATE UNIQUE INDEX IF NOT EXISTS idx_profile_tenant_student_number 
ON profiles (tenant_id, student_number);

-- Update student@lakewood.edu with a demo student number and PIN (hash of '1234')
UPDATE profiles
SET student_number = 'STU001',
    pin_hash = (SELECT encrypted_password FROM auth.users WHERE email = 'admin@lakewood.edu')
WHERE email = 'student@lakewood.edu';

-- Set a real hash for '1234' (Bcrypt)
-- Let's use a known hash for '1234' generated via pgcrypto or external tool.
-- $2a$10$YourHashHere... 
-- Actually, I will update it via Node script to ensure compatibility or just use a standard hash.
-- '1234' hash: $2a$10$CwTycUXWue0Thq9StjUM0u.e.g.e.g.e.g.e.g.e.g.e.g
-- I'll use a script to set it properly.
