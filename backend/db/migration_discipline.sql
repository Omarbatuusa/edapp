-- Discipline Categories: Merits, Demerits
CREATE TABLE IF NOT EXISTS discipline_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('merit', 'demerit')),
    points INT NOT NULL DEFAULT 0,
    severity_level INT DEFAULT 1, -- 1=Minor, 5=Severe
    created_at TIMESTAMP DEFAULT NOW()
);

-- Incidents: The actual record of a student receiving a merit/demerit
CREATE TABLE IF NOT EXISTS incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES branches(id) ON DELETE SET NULL, -- Ensure isolation
    student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    staff_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    category_id UUID REFERENCES discipline_categories(id) ON DELETE SET NULL,
    date TIMESTAMP DEFAULT NOW(),
    notes TEXT,
    points_at_time INT, -- Snapshot of points value at time of issue
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_incidents_student ON incidents(student_id);
CREATE INDEX idx_incidents_tenant ON incidents(tenant_id);
CREATE INDEX idx_incidents_branch ON incidents(branch_id);

-- Seed Default Categories for Lakewood (Tenant ID will be inserted dynamically if possible, or we seed globally?)
-- For multi-tenancy, each tenant needs categories.
-- We will handle seeding via a separate logic or assume the app creates them.
-- For this MVP, we can insert generic ones for ALL tenants if we want, or just let users create them?
-- Better: Seed for known tenants (Lakewood, Allied).

-- Seed for Lakewood (Using subquery if tenant exists)
INSERT INTO discipline_categories (tenant_id, name, type, points, severity_level)
SELECT id, 'Late for Class', 'demerit', -5, 1 FROM tenants WHERE code = 'LAKEWOOD'
ON CONFLICT DO NOTHING;

INSERT INTO discipline_categories (tenant_id, name, type, points, severity_level)
SELECT id, 'Incomplete Homework', 'demerit', -10, 1 FROM tenants WHERE code = 'LAKEWOOD'
ON CONFLICT DO NOTHING;

INSERT INTO discipline_categories (tenant_id, name, type, points, severity_level)
SELECT id, 'Academic Excellence', 'merit', 10, 1 FROM tenants WHERE code = 'LAKEWOOD'
ON CONFLICT DO NOTHING;

INSERT INTO discipline_categories (tenant_id, name, type, points, severity_level)
SELECT id, 'Community Service', 'merit', 20, 1 FROM tenants WHERE code = 'LAKEWOOD'
ON CONFLICT DO NOTHING;

-- Seed for Allied
INSERT INTO discipline_categories (tenant_id, name, type, points, severity_level)
SELECT id, 'Late for Class', 'demerit', -5, 1 FROM tenants WHERE code = 'ALLIED'
ON CONFLICT DO NOTHING;

INSERT INTO discipline_categories (tenant_id, name, type, points, severity_level)
SELECT id, 'Uniform Violation', 'demerit', -5, 1 FROM tenants WHERE code = 'ALLIED'
ON CONFLICT DO NOTHING;
