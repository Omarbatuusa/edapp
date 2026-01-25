const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function post(url, body) {
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const data = await res.json();
        return { status: res.status, data };
    } catch (e) {
        return { status: 500, data: { error: e.message } };
    }
}

async function run() {
    try {
        console.log("🔍 Fetching Tenants...");

        // Get Lakewood ID
        const lakeRes = await pool.query("SELECT id FROM tenants WHERE code = 'LAKEWOOD'");
        const lakewoodId = lakeRes.rows[0]?.id;

        // Get Allied ID
        const alliedRes = await pool.query("SELECT id FROM tenants WHERE code = 'ALLIED'");
        const alliedId = alliedRes.rows[0]?.id;

        if (!lakewoodId || !alliedId) {
            console.error("❌ Critical: Tenants not found in DB");
            return;
        }

        console.log(`✅ Lakewood ID: ${lakewoodId}`);
        console.log(`✅ Allied ID:   ${alliedId}`);

        // Define Tests
        const tests = [
            {
                label: "Admin Login (Lakewood)",
                payload: { email: 'admin@lakewood.edu', password: 'password123', tenantId: lakewoodId }
            },
            {
                label: "Student Login (Allied)",
                payload: { studentNumber: 'ALLI001', pin: 'password123', tenantId: alliedId }
            }
        ];

        // Execute API Calls (Internal to Container)
        for (const test of tests) {
            console.log(`Testing ${test.label}...`);
            const res = await post('http://localhost:3000/v1/auth/login', test.payload);

            if (res.data.token) {
                console.log(`✅ [PASS] ${test.label}`);
                const user = res.data.user;
                console.log(`   Role: ${user.role} | Branch: ${user.branchId || 'None (Tenant Level)'}`);
            } else {
                console.log(`❌ [FAIL] ${test.label}`);
                console.log(`   ${res.status} - ${JSON.stringify(res.data)}`);
            }
        }

    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}

run();
