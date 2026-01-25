const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const getMyContext = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Get assigned roles
        const rolesSql = `
            SELECT r.slug, r.name, ura.scope, ura.tenant_id
            FROM user_role_assignments ura
            JOIN roles r ON ura.role_id = r.id
            WHERE ura.user_id = $1 AND ura.is_active = true
        `;
        const rolesRes = await pool.query(rolesSql, [userId]);

        // 2. Get active capabilities (already computed in middleware, but let's be explicit)
        const capsSql = `
            SELECT DISTINCT c.slug
            FROM user_role_assignments ura
            JOIN roles r ON ura.role_id = r.id
            JOIN role_capabilities rc ON r.id = rc.role_id
            JOIN capabilities c ON rc.capability_id = c.id
            WHERE ura.user_id = $1 AND ura.is_active = true
        `;
        const capsRes = await pool.query(capsSql, [userId]);

        res.json({
            roles: rolesRes.rows,
            capabilities: capsRes.rows.map(r => r.slug)
        });
    } catch (err) {
        console.error('RBAC Context Error:', err);
        res.status(500).json({ error: 'Server Error' });
    }
};

module.exports = { getMyContext };
