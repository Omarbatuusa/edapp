-- Create Zola User
DO $$
DECLARE
    new_id UUID := gen_random_uuid();
    tenant_id UUID;
BEGIN
    SELECT id INTO tenant_id FROM tenants WHERE code = 'LAKE001';

    -- Create Profile
    INSERT INTO profiles (id, email, first_name, last_name, role, tenant_id, school_name)
    VALUES (new_id, 'zola@lakewood.edu', 'Zola', 'Learner', 'student', tenant_id, 'Lakewood International Academy');

    -- Create Auth User
    INSERT INTO auth.users (id, email, encrypted_password)
    VALUES (new_id, 'zola@lakewood.edu', '$2a$10$eb7iplRNI5bQyO8kpc1upu3Nwd.n7YINNCr63byr4cm0IVCOk39eC');

END $$;

-- Verify
SELECT email, role, u.encrypted_password
FROM profiles p JOIN auth.users u ON p.id = u.id
WHERE email = 'zola@lakewood.edu';
