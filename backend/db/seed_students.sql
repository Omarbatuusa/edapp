DO $$
DECLARE
    tenant_id uuid;
BEGIN
    -- 1. Get Lakewood ID
    SELECT id INTO tenant_id FROM tenants WHERE code = 'LAKE001';

    IF tenant_id IS NOT NULL THEN
        -- 2. Seed Zola (Foundation Learner)
        -- Password: password123
        INSERT INTO profiles (email, first_name, last_name, role, phase, grade, tenant_id, password_hash)
        VALUES (
            'zola@lakewood.edu', 
            'Zola', 
            'M.', 
            'student', 
            'foundation', 
            'Grade 5', 
            tenant_id, 
            '$2y$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa'
        )
        ON CONFLICT (email) DO UPDATE 
        SET phase = EXCLUDED.phase, grade = EXCLUDED.grade, password_hash = EXCLUDED.password_hash;

        -- 3. Seed Lefu (Senior Learner)
        INSERT INTO profiles (email, first_name, last_name, role, phase, grade, tenant_id, password_hash)
        VALUES (
            'lefu@lakewood.edu', 
            'Lefu', 
            'Kay', 
            'student', 
            'senior', 
            '11A', 
            tenant_id, 
            '$2y$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa'
        )
        ON CONFLICT (email) DO UPDATE 
        SET phase = EXCLUDED.phase, grade = EXCLUDED.grade, password_hash = EXCLUDED.password_hash;

        RAISE NOTICE 'Seeded Zola and Lefu for LAKE001';
    END IF;
END $$;
