-- Fix Tenant Domain for Lakewood (LAKE001)
-- Updates domain from broken 'lakewood-main' to working 'lakewood'
UPDATE tenants 
SET domain = 'lakewood.edapp.co.za' 
WHERE code = 'LAKE001';

-- Verify the change
SELECT * FROM tenants WHERE code = 'LAKE001';
