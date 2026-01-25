const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// GET /discipline/categories
exports.getCategories = async (req, res) => {
    try {
        const tenantId = req.user.tenantId; // From Auth Middleware
        if (!tenantId) return res.status(400).json({ error: "Tenant ID required" });

        const result = await pool.query(
            "SELECT * FROM discipline_categories WHERE tenant_id = $1 ORDER BY type DESC, name ASC",
            [tenantId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error("Get Categories Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// POST /discipline/issue
exports.issueIncident = async (req, res) => {
    try {
        const { studentId, categoryId, note, date } = req.body;
        const staffId = req.user.id;
        const tenantId = req.user.tenantId;
        const branchId = req.user.branchId;

        // Validation
        if (!studentId || !categoryId) {
            return res.status(400).json({ error: "Student and Category are required" });
        }

        // 1. Get Category Details (Points)
        const catResult = await pool.query(
            "SELECT points, type FROM discipline_categories WHERE id = $1 AND tenant_id = $2",
            [categoryId, tenantId]
        );
        if (catResult.rows.length === 0) {
            return res.status(404).json({ error: "Category not found" });
        }
        const category = catResult.rows[0];

        // 2. Validate Access (Staff Branch matches Student Branch?)
        // Optional strict check: if (branchId) check student.branch_id === branchId
        // For now, trust the UI search which filters students, but good to enforce.

        // 3. Create Incident
        const insertQuery = `
            INSERT INTO incidents (tenant_id, branch_id, student_id, staff_id, category_id, notes, points_at_time, date)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id, created_at
        `;

        await pool.query(insertQuery, [
            tenantId,
            branchId, // Might be null for Tenant Admins, that's okay.
            studentId,
            staffId,
            categoryId,
            note || '',
            category.points,
            date || new Date()
        ]);

        res.json({ message: "Incident recorded successfully", points: category.points });

    } catch (err) {
        console.error("Issue Incident Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// GET /discipline/student/:id/history
exports.getStudentHistory = async (req, res) => {
    try {
        const { id } = req.params;
        const tenantId = req.user.tenantId;

        const query = `
            SELECT i.*, dc.name as category_name, dc.type as category_type,
                   p.first_name as staff_first_name, p.last_name as staff_last_name
            FROM incidents i
            JOIN discipline_categories dc ON i.category_id = dc.id
            LEFT JOIN profiles p ON i.staff_id = p.id
            WHERE i.student_id = $1 AND i.tenant_id = $2
            ORDER BY i.date DESC
        `;

        const result = await pool.query(query, [id, tenantId]);
        res.json(result.rows);

    } catch (err) {
        console.error("Get History Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
