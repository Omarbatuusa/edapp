const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

exports.getSummary = async (req, res) => {
    try {
        const studentId = req.user.id;
        const tenantId = req.user.tenantId;

        // Calculate total merits and demerits
        // We sum 'points'. If category type is 'demerit', points might be negative or positive depending on implementation.
        // Schema says: type behaviour_type as enum ('merit', 'demerit');
        // Let's assume points are always positive integers, and we sum them based on type.

        const summaryQuery = `
            SELECT 
                COALESCE(SUM(CASE WHEN bc.type = 'merit' THEN br.points ELSE 0 END), 0) as total_merits,
                COALESCE(SUM(CASE WHEN bc.type = 'demerit' THEN br.points ELSE 0 END), 0) as total_demerits
            FROM behaviour_records br
            JOIN behaviour_categories bc ON br.category_id = bc.id
            WHERE br.student_id = $1 AND br.tenant_id = $2
        `;

        const { rows } = await pool.query(summaryQuery, [studentId, tenantId]);
        const summary = rows[0];

        // Also get recent records for the feed
        const recentQuery = `
            SELECT br.*, bc.name as category_name, bc.type as category_type
            FROM behaviour_records br
            JOIN behaviour_categories bc ON br.category_id = bc.id
            WHERE br.student_id = $1
            ORDER BY br.incident_date DESC
            LIMIT 5
        `;

        const recentRes = await pool.query(recentQuery, [studentId]);

        res.json({
            merits: parseInt(summary.total_merits),
            demerits: parseInt(summary.total_demerits),
            recent: recentRes.rows
        });

    } catch (err) {
        console.error('Behavior Summary Error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
