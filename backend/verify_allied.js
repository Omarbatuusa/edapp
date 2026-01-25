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
    console.log("🔍 Verifying Allied Login...");

    // Allied Tenant ID (Retrieved from check_tenant.sql output)
    const alliedId = '5954c8b1-98f3-4226-98b4-9eb4b437db97';

    console.log(`✅ Allied ID: ${alliedId}`);

    const payload = {
        studentNumber: 'ALLI001',
        pin: 'password123',
        tenantId: alliedId
    };

    // Execute API Call (Internal to Container)
    console.log(`Testing Student Login (ALLI001)...`);
    const res = await post('http://localhost:3000/v1/auth/login', payload);

    if (res.data.token) {
        console.log(`✅ [PASS] Student Login Success!`);
        const user = res.data.user;
        console.log(`   Role: ${user.role} | Branch: ${user.branchId || 'None'}`);
    } else {
        console.log(`❌ [FAIL] Student Login Failed`);
        console.log(`   ${res.status} - ${JSON.stringify(res.data)}`);
    }
}

run();
