-- Verify Domains
SELECT 
    t.name as tenant, 
    b.name as branch, 
    td.hostname, 
    td.type,
    td.is_primary
FROM tenant_domains td
JOIN tenants t ON td.tenant_id = t.id
LEFT JOIN branches b ON td.branch_id = b.id
ORDER BY t.name, b.name NULLS FIRST, td.hostname;

-- Verify Users & Roles
SELECT 
    p.email, 
    t.name as tenant, 
    ura.scope, 
    b.name as branch_scope,
    r.slug as role
FROM user_role_assignments ura
JOIN profiles p ON ura.user_id = p.id
JOIN tenants t ON ura.tenant_id = t.id
JOIN roles r ON ura.role_id = r.id
LEFT JOIN branches b ON ura.scope = 'branch' AND ura.scope_id = b.id
ORDER BY p.email;
