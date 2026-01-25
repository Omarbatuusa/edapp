-- Recreate Student User (Fixed Order)
DO $$
DECLARE
    new_id UUID := gen_random_uuid();
    tenant_id UUID;
BEGIN
    SELECT id INTO tenant_id FROM tenants WHERE code = 'LAKE001';

    -- Delete old student (if exists)
    DELETE FROM profiles WHERE email = 'student@lakewood.edu';
    DELETE FROM auth.users WHERE email = 'student@lakewood.edu';

    -- Create Auth User FIRST (to satisfy FK)
    INSERT INTO auth.users (id, email, encrypted_password)
    VALUES (new_id, 'student@lakewood.edu', '$2a$10$eb7iplRNI5bQyO8kpc1upu3Nwd.n7YINNCr63byr4cm0IVCOk39eC');

    -- Create Profile (references Auth User)
    INSERT INTO profiles (id, email, first_name, last_name, role, tenant_id)
    VALUES (new_id, 'student@lakewood.edu', 'Student', 'User', 'student', tenant_id);

    RAISE NOTICE 'Recreated student@lakewood.edu';
END $$;
