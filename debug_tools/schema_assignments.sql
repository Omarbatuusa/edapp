-- Assignments Schema

CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_subject_id UUID REFERENCES class_subjects(id),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    due_date TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'Active', -- Active, Archived
    is_urgent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS student_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID REFERENCES assignments(id),
    student_id UUID REFERENCES profiles(id),
    status VARCHAR(20) DEFAULT 'Pending', -- Pending, Submitted, Graded
    grade INTEGER, -- Percentage
    feedback TEXT,
    submitted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(assignment_id, student_id)
);
