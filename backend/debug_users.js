const path = require('path');
const dbPath = path.resolve(__dirname, 'src/config/db');
const db = require(dbPath);

async function run() {
    try {
        const emails = ['admin@lakewood.edu', 'student@lakewood.edu'];
        const res = await db.query('SELECT email, tenant_id FROM profiles WHERE email = ANY($1)', [emails]);
        console.log('--- DATA ---');
        res.rows.forEach(r => console.log(`${r.email} : ${r.tenant_id}`));
        console.log('--- END ---');
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}
run();
