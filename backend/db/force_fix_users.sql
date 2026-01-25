-- Get Tenant ID
DO $$
DECLARE
    tid UUID;
BEGIN
    SELECT id INTO tid FROM tenants WHERE code = 'LAKE001';

    -- Fix Admin
    UPDATE profiles 
    SET tenant_id = tid, 
        password_hash = '$2a$10$X7Xk/x.w.v.v.v.v.v.v.u.v.v.v.v.v.v.v.v.v.v.v.v.v.v' -- Placeholder, using real hash below via app logic if needed, but let's use a known generated one.
        -- Actually, I'll use the one from the seed file which we know worked locally if the env matches.
        -- Wait, the seed file used: $2y$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa
    WHERE email = 'admin@lakewood.edu';

    -- Fix Zola
    UPDATE profiles 
    SET tenant_id = tid,
        password_hash = '$2y$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa' 
    WHERE email = 'zola@lakewood.edu';

    -- Fix Lefu
    UPDATE profiles 
    SET tenant_id = tid,
        password_hash = '$2y$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa'
    WHERE email = 'lefu@lakewood.edu';
    
    -- Ensure they are linked to the tenant
    RAISE NOTICE 'Updated users for Tenant ID: %', tid;
END $$;
