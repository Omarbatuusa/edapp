DO $$
DECLARE
    v_tenant_id uuid;
BEGIN
    SELECT id INTO v_tenant_id FROM tenants WHERE code = 'LAKEWOOD';
    
    IF v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'Tenant LAKEWOOD not found';
    END IF;

    INSERT INTO behaviour_categories (name, type, points, severity_level, tenant_id)
    VALUES 
    ('Late Coming', 'demerit', 1, 'Level 1', v_tenant_id),
    ('Uniform Violation', 'demerit', 1, 'Level 1', v_tenant_id),
    ('Outstanding Citizenship', 'merit', 5, 'Level 1', v_tenant_id),
    ('Homework Not Done', 'demerit', 2, 'Level 1', v_tenant_id)
    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Seeded categories for LAKEWOOD';
END $$;
