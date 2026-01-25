-- Academic Schema

-- Classes (e.g., 11A, 10B)
CREATE TABLE IF NOT EXISTS classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id),
    name VARCHAR(50) NOT NULL,
    grade VARCHAR(20) NOT NULL,
    phase VARCHAR(20) NOT NULL, -- foundation, senior, fet
    created_at TIMESTAMP DEFAULT NOW()
);

-- Subjects (e.g., Mathematics, History)
CREATE TABLE IF NOT EXISTS subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Class Subjects (Links a class to a subject and a teacher)
CREATE TABLE IF NOT EXISTS class_subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID REFERENCES classes(id),
    subject_id UUID REFERENCES subjects(id),
    educator_id UUID REFERENCES profiles(id), -- The teacher
    created_at TIMESTAMP DEFAULT NOW()
);

-- Enrollments (Students in Classes)
CREATE TABLE IF NOT EXISTS enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID REFERENCES classes(id),
    student_id UUID REFERENCES profiles(id),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(class_id, student_id)
);

-- Timetables (Schedule)
CREATE TABLE IF NOT EXISTS timetables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID REFERENCES classes(id),
    subject_id UUID REFERENCES subjects(id),
    day_of_week VARCHAR(20) NOT NULL, -- Monday, Tuesday...
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room VARCHAR(50),
    type VARCHAR(20) DEFAULT 'Core' -- Core, Elective, Break
);
