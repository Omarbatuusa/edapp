SELECT 
    p.email, 
    length(p.email) as email_len, 
    p.role, 
    p.tenant_id, 
    u.encrypted_password 
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.email IN ('zola@lakewood.edu', 'student@lakewood.edu', 'admin@lakewood.edu');
