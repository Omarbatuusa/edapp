SELECT count(1) as role_count FROM roles;
SELECT id, slug FROM roles WHERE slug = 'tenant_admin';
SELECT u.email, r.slug as role, ura.scope, ura.tenant_id 
FROM user_role_assignments ura 
JOIN auth.users u ON u.id = ura.user_id 
JOIN roles r ON r.id = ura.role_id 
WHERE u.email = 'admin@lakewood.edu';
