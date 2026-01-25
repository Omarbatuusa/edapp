const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Login User
// Login User
const login = async (req, res) => {
    try {
        const { email, password, studentNumber, pin, tenantId } = req.body;

        if (!tenantId) {
            return res.status(400).json({ error: 'Tenant ID is required' });
        }

        // --- STUDENT LOGIN FLOW ---
        if (studentNumber && pin) {
            console.log(`[Login] Student Attempt: ${studentNumber} for Tenant: ${tenantId}`);

            const query = `
                SELECT p.*, p.pin_hash 
                FROM profiles p
                WHERE p.student_number = $1 AND p.tenant_id = $2
            `;
            const userRes = await pool.query(query, [studentNumber, tenantId]);

            if (userRes.rows.length === 0) {
                console.log(`[Login] Student not found: ${studentNumber}`);
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            const user = userRes.rows[0];
            const hash = user.pin_hash;

            if (!hash) {
                console.error('[Login] Student has no PIN hash');
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            const validPin = await bcrypt.compare(pin, hash);
            if (!validPin) {
                console.log(`[Login] PIN mismatch for ${studentNumber}`);
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Generate Token
            const token = jwt.sign(
                {
                    id: user.id,
                    role: user.role,
                    tenantId: user.tenant_id,
                    branchId: user.branch_id // Embed Branch Context
                },
                process.env.JWT_SECRET,
                { expiresIn: '1d' }
            );

            delete user.pin_hash;
            delete user.password_hash; // if exists

            return res.json({ token, user });
        }

        // --- STANDARD LOGIN FLOW (Email/Password) ---
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        console.log(`[Login] Attempt: ${email} for Tenant: ${tenantId}`);

        // Join profiles with auth.users to get the password hash
        const query = `
            SELECT p.*, u.encrypted_password 
            FROM profiles p
            JOIN auth.users u ON p.id = u.id
            WHERE p.email = $1 AND p.tenant_id = $2
        `;

        const userRes = await pool.query(query, [email, tenantId]);

        if (userRes.rows.length === 0) {
            console.log(`[Login] User not found or not in tenant: ${tenantId}`);
            // Security: Don't reveal if user exists
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = userRes.rows[0];

        // Compare Password
        // Handle case where encrypted_password might be null or old format
        const hash = user.encrypted_password;
        if (!hash) {
            console.error('[Login] User has no password hash');
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const validPassword = await bcrypt.compare(password, hash);
        if (!validPassword) {
            console.log(`[Login] Password mismatch for ${email}`);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate Token
        // payload: id, role, tenantId, branchId (if applicable)
        const token = jwt.sign(
            {
                id: user.id,
                role: user.role,
                tenantId: user.tenant_id,
                branchId: user.branch_id // Embed Branch Context
            },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // Remove sensitive data
        delete user.encrypted_password;

        res.json({ token, user });

    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get Current User
const getMe = async (req, res) => {
    try {
        const userRes = await pool.query('SELECT * FROM profiles WHERE id = $1', [req.user.id]);
        if (userRes.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(userRes.rows[0]);
    } catch (err) {
        console.error('Get Me Error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = {
    login,
    getMe
};
