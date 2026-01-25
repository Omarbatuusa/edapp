-- Assign Roles to Existing Users
DO $$
DECLARE
    v_tenant_id uuid;
    v_admin_id uuid;
    v_zola_id uuid;
    v_lefu_id uuid;
    
    v_role_tenant_admin uuid;
    v_role_learner uuid;
BEGIN
    -- 1. Get IDs
    SELECT id INTO v_tenant_id FROM tenants WHERE code = 'LAKEWOOD';
    SELECT id INTO v_admin_id FROM auth.users WHERE email = 'admin@lakewood.edu';
    SELECT id INTO v_zola_id FROM auth.users WHERE email = 'zola@lakewood.edu';
    SELECT id INTO v_lefu_id FROM auth.users WHERE email = 'lefu@lakewood.edu';

    SELECT id INTO v_role_tenant_admin FROM roles WHERE slug = 'tenant_admin';
    SELECT id INTO v_role_learner FROM roles WHERE slug = 'learner';

    -- 2. Assign Tenant Admin
    IF v_admin_id IS NOT NULL AND v_role_tenant_admin IS NOT NULL THEN
        INSERT INTO user_role_assignments (user_id, tenant_id, scope, role_id)
        VALUES (v_admin_id, v_tenant_id, 'tenant', v_role_tenant_admin)
        ON CONFLICT (user_id, tenant_id, scope, scope_id, role_id) WHERE is_active DO NOTHING;
        
        RAISE NOTICE 'Assigned Tenant Admin to admin@lakewood.edu';
    END IF;

    -- 3. Assign Learner (Zola)
    IF v_zola_id IS NOT NULL AND v_role_learner IS NOT NULL THEN
        INSERT INTO user_role_assignments (user_id, tenant_id, scope, scope_id, role_id)
        VALUES (v_zola_id, v_tenant_id, 'learner', v_zola_id, v_role_learner)
        ON CONFLICT (user_id, tenant_id, scope, scope_id, role_id) WHERE is_active DO NOTHING;
        
        RAISE NOTICE 'Assigned Learner to zola@lakewood.edu';
    END IF;
    
    -- 4. Assign Learner (Lefu)
    IF v_lefu_id IS NOT NULL AND v_role_learner IS NOT NULL THEN
        INSERT INTO user_role_assignments (user_id, tenant_id, scope, scope_id, role_id)
        VALUES (v_lefu_id, v_tenant_id, 'learner', v_lefu_id, v_role_learner)
        ON CONFLICT (user_id, tenant_id, scope, scope_id, role_id) WHERE is_active DO NOTHING;
        
        RAISE NOTICE 'Assigned Learner to lefu@lakewood.edu';
    END IF;

END $$;
