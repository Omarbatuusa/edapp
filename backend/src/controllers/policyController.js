const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const { uploadFile } = require('../services/r2Storage');
const { v4: uuidv4 } = require('uuid');

const getPolicies = async (req, res) => {
    try {
        const { tenantId } = req.query; // Assuming tenantId passed in query or req.user
        // In real auth, get tenantId from req.user.tenantId

        let sql = `
            SELECT id, title, content, category, version, is_active, file_url, created_at 
            FROM policies 
            WHERE is_active = true 
        `;
        const params = [];

        if (tenantId) {
            sql += ` AND tenant_id = $1`;
            params.push(tenantId);
        }

        sql += ` ORDER BY created_at DESC`;

        const result = await pool.query(sql, params);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching policies:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const createPolicy = async (req, res) => {
    try {
        const { tenantId, title, content, category, version } = req.body;
        const file = req.file;
        let fileUrl = null;

        if (file) {
            const key = `policies/${tenantId}/${uuidv4()}-${file.originalname}`;
            fileUrl = await uploadFile(key, file.buffer, file.mimetype);
        }

        const sql = `
            INSERT INTO policies (tenant_id, title, content, category, version, file_url)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `;
        const values = [tenantId, title, content, category, version || '1.0', fileUrl];
        const result = await pool.query(sql, values);

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating policy:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const updatePolicy = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, category, isActive } = req.body;

        // Dynamic update query
        // Simplification: just updating non-file fields for now
        const sql = `
            UPDATE policies 
            SET title = COALESCE($1, title), 
                content = COALESCE($2, content),
                category = COALESCE($3, category),
                is_active = COALESCE($4, is_active)
            WHERE id = $5
            RETURNING *;
        `;
        const values = [title, content, category, isActive, id];
        const result = await pool.query(sql, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Policy not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating policy:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const deletePolicy = async (req, res) => {
    try {
        const { id } = req.params;
        const sql = `DELETE FROM policies WHERE id = $1 RETURNING id`;
        const result = await pool.query(sql, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Policy not found' });
        }

        res.json({ message: 'Policy deleted successfully' });
    } catch (err) {
        console.error('Error deleting policy:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = {
    getPolicies,
    createPolicy,
    updatePolicy,
    deletePolicy
};
