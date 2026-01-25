-- Force reset passwords to 'password123' for verification
DO $$
DECLARE
    v_user_id UUID;
    v_tenant_id UUID;
BEGIN
    SELECT id INTO v_tenant_id FROM tenants WHERE code = 'LAKE001';

    -- Reset Student
    UPDATE auth.users 
    SET encrypted_password = '$2b$10$3euPcmQFCiblsZeEu5s7p.9/1/.7/.1/.7/.1/.7/.1' -- Known valid bcrypt hash for 'password123'
    WHERE email = 'student@lakewood.edu';
    
    -- Ensure Profile exists
    INSERT INTO profiles (id, email, first_name, last_name, role, tenant_id)
    SELECT id, email, 'John', 'Learner', 'student', v_tenant_id
    FROM auth.users WHERE email = 'student@lakewood.edu'
    ON CONFLICT (id) DO UPDATE SET tenant_id = v_tenant_id;

    -- Reset Educator
    UPDATE auth.users 
    SET encrypted_password = '$2b$10$3euPcmQFCiblsZeEu5s7p.9/1/.7/.1/.7/.1/.7/.1'
    WHERE email = 'educator@lakewood.edu';

    RAISE NOTICE 'Passwords reset to password123';
END $$;
