const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const searchStudents = async (req, res) => {
    try {
        const { query } = req.query;
        // Security: Filter by Tenant and optionally Branch
        const tenantId = req.user.tenantId;
        const branchId = req.user.branchId;

        if (!tenantId) {
            // Should verify login
            return res.status(403).json({ error: "Unauthorized: No Tenant Scope" });
        }

        if (!query) {
            return res.status(400).json({ error: 'Query parameter is required' });
        }

        let sql = `
            SELECT id, first_name, last_name, email, grade, student_number 
            FROM profiles 
            WHERE role = 'student' 
        `;

        const params = [];
        let paramIndex = 1;

        // Enforce Tenant
        sql += ` AND tenant_id = $${paramIndex++}`;
        params.push(tenantId);

        // Enforce Branch Isolation (if staff has a branch)
        if (branchId) {
            sql += ` AND branch_id = $${paramIndex++}`;
            params.push(branchId);
        }

        // Search logic
        sql += ` AND (first_name ILIKE $${paramIndex} OR last_name ILIKE $${paramIndex})`;
        params.push(`%${query}%`);

        sql += ` LIMIT 10;`;

        const result = await pool.query(sql, params);

        res.json(result.rows);
    } catch (err) {
        console.error('Error searching students:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = { searchStudents };
