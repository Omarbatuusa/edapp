-- Seed Academic Demo Data

-- 1. Create Class 11A
INSERT INTO classes (id, tenant_id, name, grade, phase)
SELECT gen_random_uuid(), (SELECT id FROM tenants WHERE code = 'LAKEWOOD'), '11A', '11', 'senior'
WHERE NOT EXISTS (SELECT 1 FROM classes WHERE name = '11A');

-- 2. Create Subjects
INSERT INTO subjects (tenant_id, name)
SELECT (SELECT id FROM tenants WHERE code = 'LAKEWOOD'), unnest(ARRAY['Mathematics', 'Physical Sciences', 'English HL', 'Life Orientation', 'Geography', 'Zulu FAL'])
ON CONFLICT DO NOTHING;

-- 3. Enroll Zola into 11A
INSERT INTO enrollments (class_id, student_id)
SELECT 
    (SELECT id FROM classes WHERE name = '11A'),
    (SELECT id FROM profiles WHERE email = 'zola@lakewood.edu')
ON CONFLICT DO NOTHING;

-- 4. Assign Subjects to 11A (Teacher: Admin for now, or create a teacher)
-- Let's assume Admin is the teacher for Math
INSERT INTO class_subjects (class_id, subject_id, educator_id)
SELECT 
    (SELECT id FROM classes WHERE name = '11A'),
    (SELECT id FROM subjects WHERE name = 'Mathematics'),
    (SELECT id FROM profiles WHERE email = 'admin@lakewood.edu')
ON CONFLICT DO NOTHING;

-- 5. Create Timetable for 11A
INSERT INTO timetables (class_id, subject_id, day_of_week, start_time, end_time, room, type)
SELECT 
    (SELECT id FROM classes WHERE name = '11A'),
    (SELECT id FROM subjects WHERE name = 'Mathematics'),
    'Monday', '08:00', '09:00', 'Room 12', 'Core'
WHERE NOT EXISTS (SELECT 1 FROM timetables WHERE day_of_week='Monday' AND start_time='08:00');
