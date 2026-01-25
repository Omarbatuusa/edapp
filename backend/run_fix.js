require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
    try {
        const sql = fs.readFileSync(path.join(__dirname, 'db/fix_login_v2.sql'), 'utf8');
        await pool.query(sql);
        console.log('Login fix applied successfully.');
    } catch (err) {
        console.error('Error applying login fix:', err);
    } finally {
        await pool.end();
    }
}

run();
