-- Add metadata columns to profiles for student routing
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS phase text, -- 'foundation', 'senior', 'fet'
ADD COLUMN IF NOT EXISTS grade text; -- 'Grade 5', '11A'

-- Add Unique Constraint to Email for ON CONFLICT support
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_email_key') THEN
        ALTER TABLE profiles ADD CONSTRAINT profiles_email_key UNIQUE (email);
    END IF;
END $$;
