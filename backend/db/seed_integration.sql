-- Seed Integration Data for Phase 5
-- Run this AFTER schema migration

DO $$
DECLARE
    v_tenant_id UUID;
    v_grade_id UUID;
    v_educator_id UUID;
    v_student_id UUID;
    v_class_id UUID;
    v_math_id UUID;
    v_phys_id UUID;
    v_cs_id UUID;
    v_assignment_id UUID;
    v_register_id UUID;
BEGIN
    -- 1. Get Tenant
    SELECT id INTO v_tenant_id FROM tenants WHERE code = 'LAKE001';
    IF v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'Tenant Lakeview not found';
    END IF;

    -- 2. Ensure Users (Educator & Student)
    -- Educator
    INSERT INTO auth.users (email, encrypted_password, created_at)
    VALUES ('educator@lakewood.edu', '$2a$10$eb7iplRNI5bQyO8kpc1upu3Nwd.n7YINNCr63byr4cm0IVCOk39eC', now())
    ON CONFLICT (email) DO UPDATE SET encrypted_password = EXCLUDED.encrypted_password
    RETURNING id INTO v_educator_id;
    
    INSERT INTO profiles (id, email, first_name, last_name, role, tenant_id)
    VALUES (v_educator_id, 'educator@lakewood.edu', 'Sarah', 'Educator', 'staff', v_tenant_id)
    ON CONFLICT (id) DO NOTHING;

    -- Student
    INSERT INTO auth.users (email, encrypted_password, created_at)
    VALUES ('student@lakewood.edu', '$2a$10$eb7iplRNI5bQyO8kpc1upu3Nwd.n7YINNCr63byr4cm0IVCOk39eC', now())
    ON CONFLICT (email) DO UPDATE SET encrypted_password = EXCLUDED.encrypted_password
    RETURNING id INTO v_student_id;
    
    INSERT INTO profiles (id, email, first_name, last_name, role, tenant_id)
    VALUES (v_student_id, 'student@lakewood.edu', 'John', 'Learner', 'student', v_tenant_id)
    ON CONFLICT (id) DO NOTHING;

    -- 3. Ensure Grade 11
    SELECT id INTO v_grade_id FROM grades WHERE tenant_id = v_tenant_id AND name = 'Grade 11' LIMIT 1;
    IF v_grade_id IS NULL THEN
        INSERT INTO grades (tenant_id, name, phase)
        VALUES (v_tenant_id, 'Grade 11', 'FET')
        RETURNING id INTO v_grade_id;
    END IF;

    -- 4. Create Subjects
    INSERT INTO subjects (tenant_id, name, code) 
    SELECT v_tenant_id, 'Mathematics', 'MATH11'
    WHERE NOT EXISTS (SELECT 1 FROM subjects WHERE tenant_id = v_tenant_id AND name = 'Mathematics');
    SELECT id INTO v_math_id FROM subjects WHERE tenant_id = v_tenant_id AND name = 'Mathematics';

    INSERT INTO subjects (tenant_id, name, code)
    SELECT v_tenant_id, 'Physical Science', 'PHYS11'
    WHERE NOT EXISTS (SELECT 1 FROM subjects WHERE tenant_id = v_tenant_id AND name = 'Physical Science');
    SELECT id INTO v_phys_id FROM subjects WHERE tenant_id = v_tenant_id AND name = 'Physical Science';

    -- 5. Create Class 11A
    SELECT id INTO v_class_id FROM classes WHERE tenant_id = v_tenant_id AND name = '11A';
    IF v_class_id IS NULL THEN
        INSERT INTO classes (tenant_id, grade_id, name)
        VALUES (v_tenant_id, v_grade_id, '11A')
        RETURNING id INTO v_class_id;
    END IF;

    -- 6. Enroll Student
    INSERT INTO enrollments (tenant_id, class_id, student_id)
    VALUES (v_tenant_id, v_class_id, v_student_id)
    ON CONFLICT (class_id, student_id) DO NOTHING;

    -- 7. Assign Educator to Math for 11A
    -- Check if assignment exists
    SELECT id INTO v_cs_id FROM class_subjects WHERE tenant_id = v_tenant_id AND class_id = v_class_id AND subject_id = v_math_id AND educator_id = v_educator_id;
    IF v_cs_id IS NULL THEN
        INSERT INTO class_subjects (tenant_id, class_id, subject_id, educator_id)
        VALUES (v_tenant_id, v_class_id, v_math_id, v_educator_id)
        RETURNING id INTO v_cs_id;
    END IF;

    -- 8. Timetable (Idempotent check by subject and time)
    IF NOT EXISTS (SELECT 1 FROM timetables WHERE tenant_id = v_tenant_id AND class_id = v_class_id AND subject_id = v_math_id AND day_of_week = 'Monday') THEN
        INSERT INTO timetables (tenant_id, class_id, subject_id, day_of_week, start_time, end_time, room)
        VALUES 
        (v_tenant_id, v_class_id, v_math_id, 'Monday', '08:00', '09:00', 'Room 101'),
        (v_tenant_id, v_class_id, v_phys_id, 'Monday', '09:00', '10:00', 'Lab 2');
    END IF;

    -- 9. Assignments
    IF NOT EXISTS (SELECT 1 FROM assignments WHERE tenant_id = v_tenant_id AND class_subject_id = v_cs_id AND title = 'Algebra Homework 1') THEN
        INSERT INTO assignments (tenant_id, class_subject_id, title, description, due_date, status)
        VALUES (v_tenant_id, v_cs_id, 'Algebra Homework 1', 'Solve page 42 #1-10', NOW() + INTERVAL '2 days', 'Active')
        RETURNING id INTO v_assignment_id;

        INSERT INTO student_assignments (tenant_id, assignment_id, student_id, status, grade)
        VALUES (v_tenant_id, v_assignment_id, v_student_id, 'Submitted', 85);
    END IF;

    -- 10. Attendance
    -- Check if register exists for today, else create
    SELECT id INTO v_register_id FROM attendance_registers WHERE tenant_id = v_tenant_id AND class_id = v_class_id AND date = CURRENT_DATE;
    IF v_register_id IS NULL THEN
        INSERT INTO attendance_registers (tenant_id, class_id, date, educator_id)
        VALUES (v_tenant_id, v_class_id, CURRENT_DATE, v_educator_id)
        RETURNING id INTO v_register_id;

        INSERT INTO attendance_entries (tenant_id, register_id, student_id, status)
        VALUES (v_tenant_id, v_register_id, v_student_id, 'Present')
        ON CONFLICT DO NOTHING; -- Assuming conflict on (register_id, student_id) if it exists
    END IF;

    RAISE NOTICE 'Seeding integration data complete (Idempotent run)';
END $$;
