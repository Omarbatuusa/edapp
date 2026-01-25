-- Force Reset Password for student@lakewood.edu
-- Hash for 'password123': $2a$10$IeJtXx1NNm7yDr4nFnTSFucgVvd7csCd.PTUDxJhMonfyvlkjnPyG

DO $$
DECLARE
    profile_id UUID;
BEGIN
    -- 1. Get Profile ID
    SELECT id INTO profile_id FROM profiles WHERE email = 'student@lakewood.edu';
    
    IF profile_id IS NULL THEN
        RAISE NOTICE 'Profile not found for student@lakewood.edu';
        RETURN;
    END IF;

    -- 2. Upsert into auth.users (ensure it exists and has correct password)
    INSERT INTO auth.users (id, email, encrypted_password)
    VALUES (profile_id, 'student@lakewood.edu', '$2a$10$IeJtXx1NNm7yDr4nFnTSFucgVvd7csCd.PTUDxJhMonfyvlkjnPyG')
    ON CONFLICT (id) DO UPDATE 
    SET encrypted_password = '$2a$10$IeJtXx1NNm7yDr4nFnTSFucgVvd7csCd.PTUDxJhMonfyvlkjnPyG';

    RAISE NOTICE 'Password updated for user ID: %', profile_id;
END $$;

-- Verify
SELECT u.email, u.encrypted_password FROM auth.users u 
JOIN profiles p ON u.id = p.id
WHERE p.email = 'student@lakewood.edu';
