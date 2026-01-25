require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Database Connection
const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Routes
const studentRoutes = require('./routes/students');
const policyRoutes = require('./routes/policies');
const disciplineRoutes = require('./routes/discipline');
const authRoutes = require('./routes/auth');
// Helper to safely load routes
const safeUse = (path, routePath) => {
    try {
        const router = require(routePath);
        if (router && (typeof router === 'function' || typeof router.handle === 'function')) {
            app.use(path, router);
            console.log(`Loaded route: ${path}`);
        } else {
            console.error(`Invalid router export for: ${path}`);
        }
    } catch (err) {
        console.error(`Failed to load route: ${path}`, err);
    }
};

safeUse('/v1/tenants', './routes/tenants');
safeUse('/v1/students', './routes/students');
safeUse('/v1/policies', './routes/policies');
safeUse('/v1/discipline', './routes/discipline');
safeUse('/v1/behaviour', './routes/behaviour');
safeUse('/v1/auth', './routes/auth');
safeUse('/v1/rbac', './routes/rbac');
safeUse('/v1/academic', './routes/academic');
safeUse('/v1/gamification', './routes/gamification');
safeUse('/v1/educator', './routes/educator');


// Init Database Schema (Temporary Helper for Local Dev)
app.post('/v1/admin/init-db', async (req, res) => {
    try {
        const fs = require('fs');
        const path = require('path');
        const schemaPath = path.join(__dirname, '../db/schema_v2.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        await pool.query(schemaSql);
        res.json({ status: 'ok', message: 'Database schema initialized' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Seed Integration Data (Phase 5)
app.post('/v1/admin/seed-integration', async (req, res) => {
    try {
        const fs = require('fs');
        const path = require('path');
        const seedPath = path.join(__dirname, '../db/seed_integration.sql');
        const seedSql = fs.readFileSync(seedPath, 'utf8');

        await pool.query(seedSql);
        res.json({ status: 'ok', message: 'Integration data seeded successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Seed Data (Temporary Helper)
app.post('/v1/admin/seed', async (req, res) => {
    try {
        // 1. Create Tenant
        let tenantId;
        try {
            const tenantRes = await pool.query(`
                INSERT INTO tenants (name, code, domain) 
                VALUES ('St. Marks High', 'STMARKS', 'stmarks.edapp.co.za') 
                RETURNING id;
            `);
            tenantId = tenantRes.rows[0].id;
        } catch (e) {
            // Assume it exists or conflict occurred
            const fetchRes = await pool.query("SELECT id FROM tenants WHERE code = 'STMARKS'");
            if (fetchRes.rows.length > 0) {
                tenantId = fetchRes.rows[0].id;
            } else {
                throw e; // Re-throw if it wasn't a conflict we can recover from
            }
        }

        // 1.5 Create Domain Mapping (NEW)
        try {
            const domainCheck = await pool.query("SELECT id FROM tenant_domains WHERE hostname = $1", ['stmarks.edapp.co.za']);
            if (domainCheck.rows.length === 0) {
                await pool.query(`
                    INSERT INTO tenant_domains (tenant_id, hostname, type)
                    VALUES ($1, 'stmarks.edapp.co.za', 'login');
                `, [tenantId]);
            }
        } catch (e) { console.error('Domain seed error', e); }

        // 2. Create Staff (Issuer)
        let staffId;
        const staffEmail = 'admin@stmarks.edu';
        try {
            const staffRes = await pool.query(`SELECT id FROM profiles WHERE email = $1`, [staffEmail]);
            if (staffRes.rows.length > 0) {
                staffId = staffRes.rows[0].id;
            } else {
                const insertRes = await pool.query(`
                INSERT INTO profiles (email, first_name, last_name, role, tenant_id)
                VALUES ($1, 'Admin', 'User', 'staff', $2)
                RETURNING id;
            `, [staffEmail, tenantId]);
                staffId = insertRes.rows[0].id;
            }
        } catch (e) { console.error('Staff seed error', e); }

        // 3. Create Students
        const students = [
            ['john.doe@stmarks.edu', 'John', 'Doe'],
            ['jane.smith@stmarks.edu', 'Jane', 'Smith'],
            ['mike.jones@stmarks.edu', 'Michael', 'Jones']
        ];

        for (const s of students) {
            try {
                const check = await pool.query("SELECT id FROM profiles WHERE email = $1", [s[0]]);
                if (check.rows.length === 0) {
                    await pool.query(`
                    INSERT INTO profiles (email, first_name, last_name, role, tenant_id)
                    VALUES ($1, $2, $3, 'student', $4);
                `, [s[0], s[1], s[2], tenantId]);
                }
            } catch (e) { console.error('Student seed error', e); }
        }

        // 4. Create Categories
        const categories = [
            ['Late Coming', 'demerit', 1, 'Level 1'],
            ['Uniform Violation', 'demerit', 1, 'Level 1'],
            ['Outstanding Citizenship', 'merit', 5, 'Level 1'],
            ['Homework Not Done', 'demerit', 2, 'Level 1']
        ];

        for (const c of categories) {
            try {
                const check = await pool.query("SELECT id FROM behaviour_categories WHERE name = $1 AND tenant_id = $2", [c[0], tenantId]);
                if (check.rows.length === 0) {
                    await pool.query(`
                    INSERT INTO behaviour_categories (name, type, points, severity_level, tenant_id)
                    VALUES ($1, $2, $3, $4, $5);
                `, [c[0], c[1], c[2], c[3], tenantId]);
                }
            } catch (e) { console.error('Category seed error', e); }
        }
        res.json({ status: 'ok', message: 'Data seeded successfully (Tenant, Staff, Students, Categories)' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`[Backend] Server running on port ${PORT}`);
});
