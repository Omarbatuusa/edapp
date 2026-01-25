-- Fix Login for Dashboard Access
DO $$
DECLARE
    lakewood_id uuid;
    stmarks_id uuid;
    user_id uuid;
    password_hash text := '$2a$10$RSs4lImkHCcER.nl8doI3O6BopY3cJX1nAQJxEYfxSOgoJXdnidgC'; -- password123
BEGIN
    -- 1. Ensure LAKE001 Tenant
    INSERT INTO tenants (name, code, domain) VALUES ('Lakewood High', 'LAKE001', 'lakewood.edapp.co.za')
    ON CONFLICT (code) DO UPDATE SET domain = 'lakewood.edapp.co.za'
    RETURNING id INTO lakewood_id;

    RAISE NOTICE 'Lakewood ID: %', lakewood_id;

    -- 2. Upsert admin@lakewood.edu in auth.users
    INSERT INTO auth.users (email, encrypted_password, created_at)
    VALUES ('admin@lakewood.edu', password_hash, now())
    ON CONFLICT (email) DO UPDATE SET encrypted_password = password_hash
    RETURNING id INTO user_id;

    -- 3. Upsert admin@lakewood.edu in profiles (WITHOUT password_hash)
    INSERT INTO profiles (id, email, first_name, last_name, role, tenant_id)
    VALUES (user_id, 'admin@lakewood.edu', 'Admin', 'Lakewood', 'staff', lakewood_id)
    ON CONFLICT (id) DO UPDATE SET 
        role = 'staff',
        tenant_id = lakewood_id;

    RAISE NOTICE 'Fixed admin@lakewood.edu';

    -- 4. Ensure STMARKS Tenant
    INSERT INTO tenants (name, code, domain) VALUES ('St. Marks', 'STMARKS', 'stmarks.edapp.co.za')
    ON CONFLICT (code) DO UPDATE SET domain = 'stmarks.edapp.co.za'
    RETURNING id INTO stmarks_id;

     RAISE NOTICE 'StMarks ID: %', stmarks_id;

    -- 5. Upsert admin@stmarks.edu in auth.users
    INSERT INTO auth.users (email, encrypted_password, created_at)
    VALUES ('admin@stmarks.edu', password_hash, now())
    ON CONFLICT (email) DO UPDATE SET encrypted_password = password_hash
    RETURNING id INTO user_id;

    -- 6. Upsert admin@stmarks.edu in profiles (WITHOUT password_hash)
    INSERT INTO profiles (id, email, first_name, last_name, role, tenant_id)
    VALUES (user_id, 'admin@stmarks.edu', 'Admin', 'StMarks', 'staff', stmarks_id)
    ON CONFLICT (id) DO UPDATE SET 
        role = 'staff',
        tenant_id = stmarks_id;

    RAISE NOTICE 'Fixed admin@stmarks.edu';

END $$;
