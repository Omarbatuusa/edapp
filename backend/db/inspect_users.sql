-- Compare Admin and Student Profiles

SELECT 'TENANT' as type, id, code, domain FROM tenants WHERE code = 'LAKE001';

SELECT 'PROFILE' as type, p.email, p.tenant_id, p.role, u.encrypted_password 
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.email IN ('admin@lakewood.edu', 'student@lakewood.edu');
