console.log('LOADING AUTH MIDDLEWARE START');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const verifyToken = async (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ error: 'Access denied' });
    try {
        const verified = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
        req.user = verified;

        // Simplified capability fetch
        const sql = `SELECT DISTINCT c.slug FROM user_role_assignments ura 
                     JOIN roles r ON ura.role_id = r.id 
                     JOIN role_capabilities rc ON r.id = rc.role_id 
                     JOIN capabilities c ON rc.capability_id = c.id 
                     WHERE ura.user_id = $1 AND ura.is_active = true`;
        const result = await pool.query(sql, [req.user.id]);
        req.user.capabilities = result.rows.map(row => row.slug);
        next();
    } catch (err) {
        console.error('Initial Token Verify Error:', err);
        res.status(400).json({ error: 'Invalid token' });
    }
};

const requireCapability = (capability) => {
    return (req, res, next) => {
        if (!req.user?.capabilities?.includes(capability)) {
            return res.status(403).json({ error: 'Forbidden: Missing Capability ' + capability });
        }
        next();
    };
};

console.log('LOADING AUTH MIDDLEWARE END - Exporting functions');
module.exports = { verifyToken, requireCapability };
