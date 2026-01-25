-- Inspect User and Tenant Data
SELECT 
    t.code, 
    t.id as tenant_id, 
    u.email, 
    u.encrypted_password, -- first few chars to check hash type
    p.role,
    p.tenant_id as profile_tenant_id
FROM auth.users u
JOIN profiles p ON u.id = p.id
JOIN tenants t ON p.tenant_id = t.id
WHERE u.email = 'student@lakewood.edu';
