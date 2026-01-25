-- Force Assign Tenant Admin
INSERT INTO user_role_assignments (user_id, tenant_id, scope, role_id)
SELECT 
    (SELECT id FROM auth.users WHERE email = 'admin@lakewood.edu'),
    (SELECT id FROM tenants WHERE code = 'LAKEWOOD'),
    'tenant',
    (SELECT id FROM roles WHERE slug = 'tenant_admin')
WHERE NOT EXISTS (
    SELECT 1 FROM user_role_assignments 
    WHERE user_id = (SELECT id FROM auth.users WHERE email = 'admin@lakewood.edu')
    AND role_id = (SELECT id FROM roles WHERE slug = 'tenant_admin')
);

SELECT count(1) as assignment_count FROM user_role_assignments WHERE user_id = (SELECT id FROM auth.users WHERE email = 'admin@lakewood.edu');
