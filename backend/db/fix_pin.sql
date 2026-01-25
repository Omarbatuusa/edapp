-- Force update PIN hash for ALLI001 to 'password123'
UPDATE profiles 
SET pin_hash = '$2a$10$eb7iplRNI5bQyO8kpc1upu3Nwd.n7YINNCr63byr4cm0IVCOk39eC'
WHERE student_number = 'ALLI001';
