const axios = require('axios');

const API_URL = 'http://localhost:3000/v1';

async function testLogin(label, payload) {
    try {
        console.log(`\nTesting ${label}...`);
        const res = await axios.post(`${API_URL}/auth/login`, payload);
        if (res.status === 200 && res.data.token) {
            console.log(`✅ Success: ${label}`);
            console.log(`   Token: ${res.data.token.substring(0, 20)}...`);
            if (res.data.user.branchId) {
                console.log(`   Branch Scope: ${res.data.user.branchId}`);
            } else {
                console.log(`   Branch Scope: None (Tenant/Global)`);
            }
        } else {
            console.log(`❌ Failed: ${label} (No Token)`);
        }
    } catch (err) {
        console.log(`❌ Failed: ${label}`);
        if (err.response) {
            console.log(`   Status: ${err.response.status}`);
            console.log(`   Error: ${JSON.stringify(err.response.data)}`);
        } else {
            console.log(`   Error: ${err.message}`);
        }
    }
}

async function run() {
    // 1. Lakewood Admin (Tenant Level)
    await testLogin('Lakewood Admin', {
        email: 'admin@lakewood.edu',
        password: 'password123',
        tenantId: 'd6b7b2e1-4c6e-4e4f-b8d3-5b8d2e8d3e2a' // Need to fetch real ID? Or rely on seed known UUIDs? 
        // We might fail if UUIDs are random. 
        // Better: Fetch IDs first? Or assume script runs IN container with DB access? 
        // This is an external script. Accessing localhost:3000 (inside container network if run via exec).
    });

    // Correction: We don't know the exact UUIDs unless we query DB.
    // But we can query via our own API if we had a public search...
    // Let's use the 'debug_users.js' approach: Query DB to get IDs, then calls API?
    // Too complex.
    // Let's just run this INSIDE the container where we can import 'pg' and inspect/test.
}

console.log("Use 'verify_integration.js' instead.");
