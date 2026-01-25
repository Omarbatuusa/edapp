-- Inspect Schema and Data
\d profiles;

SELECT * FROM profiles WHERE email IN ('zola@lakewood.edu', 'student@lakewood.edu');
