-- Fix User Seeding with Foreign Key Dependencies

DO $$
DECLARE
    new_tenant_id uuid;
    new_user_id uuid;
BEGIN
    -- 1. Get Tenant ID for Lakewood
    SELECT id INTO new_tenant_id FROM tenants WHERE code = 'LAKE001';
    
    IF new_tenant_id IS NULL THEN
        RAISE EXCEPTION 'Tenant LAKE001 not found. Please seed tenants first.';
    END IF;

    -- 2. Ensure User exists in auth.users (to satisfy foreign key)
    -- We try to insert, or return existing ID
    INSERT INTO auth.users (email, encrypted_password, created_at)
    VALUES ('admin@lakewood.edu', '$2a$10$eb7iplRNI5bQyO8kpc1upu3Nwd.n7YINNCr63byr4cm0IVCOk39eC', now())
    ON CONFLICT (email) DO UPDATE 
    SET encrypted_password = EXCLUDED.encrypted_password
    RETURNING id INTO new_user_id;

    -- If no new row returned (because it existed and we just updated), fetch the ID
    IF new_user_id IS NULL THEN
        SELECT id INTO new_user_id FROM auth.users WHERE email = 'admin@lakewood.edu';
    END IF;

    RAISE NOTICE 'Auth User ID: %', new_user_id;

    -- 3. Insert or Update Profile
    INSERT INTO profiles (id, email, first_name, last_name, role, tenant_id, password_hash)
    VALUES (new_user_id, 'admin@lakewood.edu', 'Admin', 'User', 'staff', new_tenant_id, '$2a$10$eb7iplRNI5bQyO8kpc1upu3Nwd.n7YINNCr63byr4cm0IVCOk39eC')
    ON CONFLICT (id) DO UPDATE 
    SET password_hash = EXCLUDED.password_hash,
        tenant_id = EXCLUDED.tenant_id,
        role = 'staff';
        
    RAISE NOTICE 'Profile seeded successfully for admin@lakewood.edu';
END $$;
