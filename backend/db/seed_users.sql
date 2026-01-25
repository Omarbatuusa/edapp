-- Seed Admin User for Lakewood (LAKE001)
-- Password: password123
-- Hash: $2y$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa

DO $$
DECLARE
    tenant_id uuid;
    user_id uuid;
BEGIN
    -- 1. Get Lakewood ID
    SELECT id INTO tenant_id FROM tenants WHERE code = 'LAKE001';

    IF tenant_id IS NOT NULL THEN
        -- 2. Insert or Update Admin Profile
        INSERT INTO profiles (email, first_name, last_name, role, tenant_id, password_hash)
        VALUES ('admin@lakewood.edu', 'Admin', 'User', 'staff', tenant_id, '$2y$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa')
        ON CONFLICT (email) DO UPDATE 
        SET password_hash = EXCLUDED.password_hash,
            tenant_id = EXCLUDED.tenant_id;
            
        RAISE NOTICE 'Seeded admin@lakewood.edu for LAKE001';
    ELSE
        RAISE NOTICE 'Tenant LAKE001 not found. Skipping user seed.';
    END IF;
END $$;
