DO $$
DECLARE
    v_tenant_id uuid;
    v_zola_id uuid;
    v_lefu_id uuid;
    v_hash text := crypt('password123', gen_salt('bf'));
BEGIN
    -- 1. Get Lakewood ID
    SELECT id INTO v_tenant_id FROM tenants WHERE code = 'LAKEWOOD';
    
    IF v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'Tenant LAKEWOOD not found';
    END IF;

    -- 2. Seed Zola (Foundation Learner)
    INSERT INTO auth.users (email, encrypted_password) VALUES ('zola@lakewood.edu', v_hash) ON CONFLICT (email) DO NOTHING;
    SELECT id INTO v_zola_id FROM auth.users WHERE email = 'zola@lakewood.edu';

    INSERT INTO profiles (id, email, first_name, last_name, role, tenant_id, password_hash)
    VALUES (
        v_zola_id,
        'zola@lakewood.edu', 
        'Zola', 
        'M.', 
        'student', 
        v_tenant_id, 
        v_hash
    )
    ON CONFLICT (id) DO UPDATE 
    SET role = EXCLUDED.role, password_hash = EXCLUDED.password_hash, tenant_id = v_tenant_id;

    -- 3. Seed Lefu (Senior Learner)
    INSERT INTO auth.users (email, encrypted_password) VALUES ('lefu@lakewood.edu', v_hash) ON CONFLICT (email) DO NOTHING;
    SELECT id INTO v_lefu_id FROM auth.users WHERE email = 'lefu@lakewood.edu';

    INSERT INTO profiles (id, email, first_name, last_name, role, tenant_id, password_hash)
    VALUES (
        v_lefu_id,
        'lefu@lakewood.edu', 
        'Lefu', 
        'Kay', 
        'student', 
        v_tenant_id, 
        v_hash
    )
    ON CONFLICT (id) DO UPDATE 
    SET role = EXCLUDED.role, password_hash = EXCLUDED.password_hash, tenant_id = v_tenant_id;

    RAISE NOTICE 'Seeded Zola and Lefu for LAKEWOOD';
END $$;
