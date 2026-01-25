-- Copy Admin Hash to Student
-- Admin hash (verified working for 'password123'): $2a$10$eb7iplRNI5bQyO8kpc1upu3Nwd.n7YINNCr63byr4cm0IVCOk39eC

UPDATE auth.users
SET encrypted_password = (SELECT encrypted_password FROM auth.users WHERE email = 'admin@lakewood.edu')
WHERE email = 'student@lakewood.edu';

-- Verify
SELECT email, encrypted_password FROM auth.users WHERE email IN ('admin@lakewood.edu', 'student@lakewood.edu');
