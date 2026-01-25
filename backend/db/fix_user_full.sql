-- Fix ALLI001
-- 1. Get Allied Tenant ID & Branch ID
-- 2. Update Profile

UPDATE profiles
SET 
  tenant_id = (SELECT id FROM tenants WHERE code = 'ALLIED'),
  branch_id = (SELECT id FROM branches WHERE code = 'ALLI-ROB'),
  pin_hash = '$2a$10$eb7iplRNI5bQyO8kpc1upu3Nwd.n7YINNCr63byr4cm0IVCOk39eC'
WHERE student_number = 'ALLI001';
