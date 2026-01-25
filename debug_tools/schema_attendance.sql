-- Attendance Schema

CREATE TABLE IF NOT EXISTS attendance_registers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID REFERENCES classes(id),
    date DATE NOT NULL,
    educator_id UUID REFERENCES profiles(id), -- Who marked it
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(class_id, date)
);

CREATE TABLE IF NOT EXISTS attendance_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    register_id UUID REFERENCES attendance_registers(id),
    student_id UUID REFERENCES profiles(id),
    status VARCHAR(20) NOT NULL, -- Present, Absent, Late
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(register_id, student_id)
);
