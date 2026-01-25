-- Fix User/Tenant Linkage
DO $$
DECLARE
    v_tenant_id UUID;
    v_user_id UUID;
BEGIN
    -- 1. Ensure Tenant Exists and Get ID
    SELECT id INTO v_tenant_id FROM tenants WHERE code = 'LAKE001';
    
    IF v_tenant_id IS NULL THEN
        INSERT INTO tenants (name, code, domain, config)
        VALUES ('Lakewood International Academy', 'LAKE001', 'lakewood.edapp.co.za', '{"modules": ["academics"]}'::jsonb)
        RETURNING id INTO v_tenant_id;
    END IF;

    -- 2. Upsert Student User
    INSERT INTO auth.users (email, encrypted_password, created_at)
    VALUES ('student@lakewood.edu', '$2b$10$3euPcmQFCiblsZeEu5s7p.9/1/.7/.1/.7/.1/.7/.1', NOW()) -- password123
    ON CONFLICT (email) DO UPDATE 
    SET encrypted_password = EXCLUDED.encrypted_password
    RETURNING id INTO v_user_id;

    -- 3. Upsert Student Profile with Correct Tenant ID
    INSERT INTO profiles (id, email, first_name, last_name, role, tenant_id)
    VALUES (v_user_id, 'student@lakewood.edu', 'John', 'Learner', 'student', v_tenant_id)
    ON CONFLICT (id) DO UPDATE 
    SET tenant_id = v_tenant_id, role = 'student';

    RAISE NOTICE 'Fixed Student: ID=%, Tenant=%', v_user_id, v_tenant_id;
END $$;
