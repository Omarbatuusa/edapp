-- Add password_hash to profiles for custom auth
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS password_hash text;

-- Optional: Set default password for existing users (e.g. 'password123')
-- Hash for 'password123': $2a$10$3cKxpj.p5.aE8.X/O.n.u.z/.x.v.y/..
-- BUT we can't easily do this without pgcrypto or similar if running via sql.
-- For now, we will leave them null and require a reset or re-seed.
