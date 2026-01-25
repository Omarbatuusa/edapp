const db = require('../config/db');

const educatorController = {
    // GET /v1/educator/class
    getClassList: async (req, res) => {
        try {
            // For Phase 5 Demo: Assuming Educator is assigned to 11A.
            // Real app would check `class_subjects` or `form_teacher` mapping.
            // Let's hardcode fetching 11A for now as per seed data.
            // Get Educator's Classes
            // For now, we fetch the first class the educator is assigned to, or all of them if we had a proper selector.
            // Simplified: Fetch students in classes taught by this educator.
            const educatorId = req.user.id;
            const tenantId = req.user.tenantId;

            const result = await db.query(
                `SELECT DISTINCT
                    p.id, 
                    p.first_name, 
                    p.last_name, 
                    c.name as grade, 
                    95 as attendance, -- Mock calc
                    75 as average,    -- Mock calc
                    '' as avatar
                 FROM profiles p
                 JOIN enrollments e ON p.id = e.student_id
                 JOIN classes c ON e.class_id = c.id
                 JOIN class_subjects cs ON c.id = cs.class_id
                 WHERE cs.educator_id = $1 AND c.tenant_id = $2
                 ORDER BY p.last_name`,
                [educatorId, tenantId]
            );

            // Determine className from result or query
            const className = result.rows.length > 0 ? result.rows[0].grade : 'No Class';

            res.json({ className, students: result.rows });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Server Error' });
        }
    },

    // POST /v1/educator/attendance
    submitAttendance: async (req, res) => {
        const { date, records } = req.body;
        const educatorId = req.user.id; // Who marked it

        try {
            const tenantId = req.user.tenantId;

            // 1. Get Class ID from records (assuming all records are for same class)
            // Or better, pass classId in body. For now, infer from first student enrollment or passed classId.
            // Let's assume passed classId or we find it.
            // Simplified: If '11A' was hardcoded, let's find the class the educator teaches.
            // Ideally frontend sends classId.
            // Fallback: Query class of first student.
            if (!records || records.length === 0) return res.json({ status: 'success', count: 0 });

            const firstStudent = records[0].studentId;
            const classRes = await db.query(
                `SELECT c.id FROM classes c 
                  JOIN enrollments e ON c.id = e.class_id 
                  WHERE e.student_id = $1 LIMIT 1`,
                [firstStudent]
            );

            if (classRes.rows.length === 0) return res.status(404).json({ error: 'Class not found' });
            const classId = classRes.rows[0].id;

            // 2. Create Register
            const regRes = await db.query(
                `INSERT INTO attendance_registers (tenant_id, class_id, date, educator_id) 
                 VALUES ($1, $2, $3, $4) 
                 ON CONFLICT (class_id, date) DO UPDATE 
                 SET educator_id = EXCLUDED.educator_id
                 RETURNING id`,
                [tenantId, classId, date, educatorId]
            );
            const registerId = regRes.rows[0].id;

            // 3. Upsert Entries
            for (const record of records) {
                await db.query(
                    `INSERT INTO attendance_entries (tenant_id, register_id, student_id, status)
                     VALUES ($1, $2, $3, $4)
                     ON CONFLICT (register_id, student_id) DO UPDATE
                     SET status = EXCLUDED.status`,
                    [tenantId, registerId, record.studentId, record.status]
                );
            }

            res.json({ status: 'success', message: 'Attendance saved successfully', count: records.length });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Server Error' });
        }
    }
};

module.exports = educatorController;
