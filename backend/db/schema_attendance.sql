-- Attendance Schema

CREATE TABLE IF NOT EXISTS attendance_registers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    educator_id UUID REFERENCES profiles(id), -- Who marked it
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(class_id, date)
);

CREATE TABLE IF NOT EXISTS attendance_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    register_id UUID REFERENCES attendance_registers(id) ON DELETE CASCADE,
    student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL, -- Present, Absent, Late
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(register_id, student_id)
);

-- RLS Policies
ALTER TABLE attendance_registers ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_entries ENABLE ROW LEVEL SECURITY;
