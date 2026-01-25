-- Force Assign Learner Role to Zola
INSERT INTO user_role_assignments (user_id, tenant_id, scope, scope_id, role_id)
SELECT 
    (SELECT id FROM profiles WHERE email = 'zola@lakewood.edu'),
    (SELECT id FROM tenants WHERE code = 'LAKEWOOD'),
    'learner',
    (SELECT id FROM profiles WHERE email = 'zola@lakewood.edu'), -- Is the scope_id for a learner the profile id? Usually yes.
    (SELECT id FROM roles WHERE slug = 'learner')
WHERE NOT EXISTS (
    SELECT 1 FROM user_role_assignments 
    WHERE user_id = (SELECT id FROM profiles WHERE email = 'zola@lakewood.edu')
    AND role_id = (SELECT id FROM roles WHERE slug = 'learner')
);
