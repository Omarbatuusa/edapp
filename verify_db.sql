SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_role_assignments';
SELECT count(1) as assignment_count FROM user_role_assignments;
SELECT u.email, r.slug as role, ura.scope 
FROM user_role_assignments ura 
JOIN roles r ON r.id = ura.role_id 
JOIN profiles u ON u.id = ura.user_id 
WHERE u.email = 'admin@lakewood.edu';
