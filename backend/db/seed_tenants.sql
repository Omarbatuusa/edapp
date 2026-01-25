-- Seed Real Production Tenants
-- Usage: docker exec -i edapp-postgres psql -U edapp -d edapp < seed_tenants.sql

-- 1. Lakewood Educational Network
INSERT INTO public.tenants (name, code, domain, config)
VALUES 
('Lakewood International Academy', 'LAKE001', 'lakewood.edapp.co.za', '{"modules": ["academics", "discipline", "attendance"], "themeColor": "#ea580c"}'::jsonb),
('Tasmiyah Academy', 'LAKE002', 'tasmiyah.edapp.co.za', '{"modules": ["academics", "discipline", "attendance"]}'::jsonb)
ON CONFLICT (code) DO UPDATE 
SET domain = EXCLUDED.domain, config = EXCLUDED.config;

-- 2. Allied Schools
INSERT INTO public.tenants (name, code, domain, config)
VALUES 
('Allied Robertsham', 'ALLI001', 'allied-rob.edapp.co.za', '{"modules": ["academics", "discipline", "attendance"]}'::jsonb),
('Allied Fordsburg (Boys)', 'ALLI002', 'allied-ford-b.edapp.co.za', '{"modules": ["academics", "discipline", "attendance"]}'::jsonb),
('Allied Fordsburg (Girls)', 'ALLI003', 'allied-ford-g.edapp.co.za', '{"modules": ["academics", "discipline", "attendance"]}'::jsonb)
ON CONFLICT (code) DO UPDATE 
SET domain = EXCLUDED.domain;

-- 3. Jeppe Educational Centre
INSERT INTO public.tenants (name, code, domain, config)
VALUES 
('Jeppe Educational Centre', 'JEPP001', 'jeppe.edapp.co.za', '{"modules": ["academics", "discipline", "attendance"]}'::jsonb)
ON CONFLICT (code) DO UPDATE 
SET domain = EXCLUDED.domain;
