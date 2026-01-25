require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
    try {
        const sql = fs.readFileSync(path.join(__dirname, 'db/migration_fix_rbac.sql'), 'utf8');
        await pool.query(sql);
        console.log('RBAC Migration applied successfully.');
    } catch (err) {
        console.error('Error applying RBAC migration:', err);
    } finally {
        await pool.end();
    }
}

run();
