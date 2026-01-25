INSERT INTO behaviour_categories (tenant_id, name, type, points, severity_level)
SELECT 
    (SELECT id FROM tenants WHERE code = 'STMARKS' LIMIT 1),
    'Outstanding Effort', 'merit', 5, 'Level 1'
WHERE NOT EXISTS (SELECT 1 FROM behaviour_categories WHERE name = 'Outstanding Effort');

INSERT INTO behaviour_categories (tenant_id, name, type, points, severity_level)
SELECT 
    (SELECT id FROM tenants WHERE code = 'STMARKS' LIMIT 1),
    'Late Arrival', 'demerit', 1, 'Level 1'
WHERE NOT EXISTS (SELECT 1 FROM behaviour_categories WHERE name = 'Late Arrival');

INSERT INTO behaviour_categories (tenant_id, name, type, points, severity_level)
SELECT 
    (SELECT id FROM tenants WHERE code = 'STMARKS' LIMIT 1),
    'Uniform Violation', 'demerit', 2, 'Level 1'
WHERE NOT EXISTS (SELECT 1 FROM behaviour_categories WHERE name = 'Uniform Violation');
