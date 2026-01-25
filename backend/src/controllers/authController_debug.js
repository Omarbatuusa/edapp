const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');

const logFile = '/app/debug_login.log';

function log(msg) {
    const time = new Date().toISOString();
    const line = `[${time}] ${msg}\n`;
    try {
        fs.appendFileSync(logFile, line);
    } catch (e) {
        console.error('Log Error:', e);
    }
}

// Login User
const login = async (req, res) => {
    try {
        const { email, password, tenantId } = req.body;
        log(`Login Attempt: ${email} (Tenant: ${tenantId})`);

        if (!email || !password || !tenantId) {
            log('Login Failed: Missing fields');
            return res.status(400).json({ error: 'Email, password, and tenantId are required' });
        }

        // Join profiles with auth.users to get the password hash
        const query = `
            SELECT p.*, u.encrypted_password 
            FROM profiles p
            JOIN auth.users u ON p.id = u.id
            WHERE p.email = $1 AND p.tenant_id = $2
        `;
        log(`Querying user: ${email} in tenant ${tenantId}`);

        const userRes = await pool.query(query, [email, tenantId]);
        log(`DB Result Rows: ${userRes.rows.length}`);

        if (userRes.rows.length === 0) {
            log(`Login Failed: User not found in query.`);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = userRes.rows[0];
        log(`User Found: ${user.id} Role: ${user.role}`);

        const hash = user.encrypted_password;
        if (!hash) {
            log(`Login Failed: No hash for user.`);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const validPassword = await bcrypt.compare(password, hash);
        log(`Password Compare Result: ${validPassword}`);

        if (!validPassword) {
            log(`Login Failed: Password mismatch.`);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate Token
        const token = jwt.sign(
            { id: user.id, role: user.role, tenantId: user.tenant_id },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );
        log(`Login Success: Token generated.`);

        delete user.encrypted_password;
        res.json({ token, user });

    } catch (err) {
        log(`Login Exception: ${err.message}`);
        console.error('Login Error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getMe = async (req, res) => {
    try {
        const userRes = await pool.query('SELECT * FROM profiles WHERE id = $1', [req.user.id]);
        if (userRes.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(userRes.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = { login, getMe };
