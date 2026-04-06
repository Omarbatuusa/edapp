/**
 * Production cleanup script — removes all demo/test data.
 * Keeps ONLY platform admin users (umarbatuusa@gmail.com, admin@edapp.co.za).
 *
 * Usage:
 *   docker exec edapp_api node dist/database/cleanup-demo.js --dry-run
 *   docker exec edapp_api node dist/database/cleanup-demo.js --confirm
 */

import { DataSource } from 'typeorm';

const PRESERVE_EMAILS = ['umarbatuusa@gmail.com', 'admin@edapp.co.za'];

async function cleanup() {
    const dryRun = !process.argv.includes('--confirm');
    if (dryRun) {
        console.log('🔍 DRY RUN — no data will be deleted. Use --confirm to execute.');
    } else {
        console.log('⚠️  LIVE MODE — data will be permanently deleted.');
    }

    const ds = new DataSource({
        type: 'postgres',
        url: process.env.DATABASE_URL || 'postgresql://edapp:edapp123@localhost:5432/edapp',
        synchronize: false,
        logging: false,
    });
    await ds.initialize();
    console.log('✅ Connected to database');

    const qr = ds.createQueryRunner();
    await qr.startTransaction();

    try {
        // 1. Find demo tenants (everything except platform-level)
        const tenants = await qr.query(`SELECT id, tenant_slug, school_code FROM tenants`);
        const tenantIds = tenants.map((t: any) => t.id);
        console.log(`\n📋 Found ${tenants.length} tenants to remove:`);
        tenants.forEach((t: any) => console.log(`   - ${t.school_code} (${t.tenant_slug})`));

        // 2. Find demo users (everyone except preserved platform admins)
        const demoUsers = await qr.query(
            `SELECT id, email FROM users WHERE email NOT IN (${PRESERVE_EMAILS.map((_, i) => `$${i + 1}`).join(',')})`,
            PRESERVE_EMAILS,
        );
        console.log(`\n👤 Found ${demoUsers.length} demo users to remove:`);
        demoUsers.forEach((u: any) => console.log(`   - ${u.email}`));

        // 3. Find preserved users
        const preserved = await qr.query(
            `SELECT id, email FROM users WHERE email IN (${PRESERVE_EMAILS.map((_, i) => `$${i + 1}`).join(',')})`,
            PRESERVE_EMAILS,
        );
        console.log(`\n🔒 Preserving ${preserved.length} platform admin users:`);
        preserved.forEach((u: any) => console.log(`   - ${u.email}`));

        if (dryRun) {
            console.log('\n🔍 DRY RUN complete. Run with --confirm to execute deletions.');
            await qr.rollbackTransaction();
            await ds.destroy();
            return;
        }

        // 4. Delete in FK-safe order
        console.log('\n🗑️  Deleting data...');

        // Attendance
        const r1 = await qr.query(`DELETE FROM attendance_events`);
        console.log(`   ✅ attendance_events: ${r1[1]} rows`);
        const r2 = await qr.query(`DELETE FROM kiosk_devices`);
        console.log(`   ✅ kiosk_devices: ${r2[1]} rows`);
        const r3 = await qr.query(`DELETE FROM school_classes`);
        console.log(`   ✅ school_classes: ${r3[1]} rows`);
        const r4 = await qr.query(`DELETE FROM attendance_policies`);
        console.log(`   ✅ attendance_policies: ${r4[1]} rows`);

        // Communication
        const r5 = await qr.query(`DELETE FROM messages`);
        console.log(`   ✅ messages: ${r5[1]} rows`);
        const r6 = await qr.query(`DELETE FROM thread_members`);
        console.log(`   ✅ thread_members: ${r6[1]} rows`);
        const r7 = await qr.query(`DELETE FROM threads`);
        console.log(`   ✅ threads: ${r7[1]} rows`);

        // Family
        const r8 = await qr.query(`DELETE FROM parent_child_links`);
        console.log(`   ✅ parent_child_links: ${r8[1]} rows`);

        // Profiles & applications
        for (const table of ['enrollment_applications', 'learner_profiles', 'staff_profiles', 'guardian_profiles', 'emergency_contacts', 'family_doctors', 'families', 'eldest_learners', 'curricula']) {
            try {
                const r = await qr.query(`DELETE FROM ${table}`);
                console.log(`   ✅ ${table}: ${r[1]} rows`);
            } catch { console.log(`   ⏭️  ${table}: table not found (skipped)`); }
        }

        // Admin data
        const r9 = await qr.query(`DELETE FROM admin_drafts`);
        console.log(`   ✅ admin_drafts: ${r9[1]} rows`);
        const r10 = await qr.query(`DELETE FROM admissions_process_cards`);
        console.log(`   ✅ admissions_process_cards: ${r10[1]} rows`);
        const r11 = await qr.query(`DELETE FROM tenant_features`);
        console.log(`   ✅ tenant_features: ${r11[1]} rows`);
        const r12 = await qr.query(`DELETE FROM audit_events`);
        console.log(`   ✅ audit_events: ${r12[1]} rows`);

        // Academic
        for (const table of ['subject_offerings', 'subject_streams', 'tenant_phase_links', 'tenant_grade_links']) {
            try {
                const r = await qr.query(`DELETE FROM ${table}`);
                console.log(`   ✅ ${table}: ${r[1]} rows`);
            } catch { console.log(`   ⏭️  ${table}: skipped`); }
        }

        // Role assignments — delete tenant-scoped roles for ALL users,
        // and ALL roles for demo users. Keep platform roles for preserved users.
        const preservedIds = preserved.map((u: any) => u.id);
        if (preservedIds.length > 0) {
            // Delete tenant-scoped role assignments for preserved users
            const r13 = await qr.query(
                `DELETE FROM role_assignments WHERE user_id IN (${preservedIds.map((_: any, i: number) => `$${i + 1}`).join(',')}) AND tenant_id IS NOT NULL`,
                preservedIds,
            );
            console.log(`   ✅ role_assignments (preserved users, tenant-scoped): ${r13[1]} rows`);
        }

        // Delete ALL role assignments for demo users
        if (demoUsers.length > 0) {
            const demoIds = demoUsers.map((u: any) => u.id);
            const r14 = await qr.query(
                `DELETE FROM role_assignments WHERE user_id IN (${demoIds.map((_: any, i: number) => `$${i + 1}`).join(',')})`,
                demoIds,
            );
            console.log(`   ✅ role_assignments (demo users): ${r14[1]} rows`);
        }

        // Tenant infrastructure
        const r15 = await qr.query(`DELETE FROM tenant_domains`);
        console.log(`   ✅ tenant_domains: ${r15[1]} rows`);
        const r16 = await qr.query(`DELETE FROM branches`);
        console.log(`   ✅ branches: ${r16[1]} rows`);
        const r17 = await qr.query(`DELETE FROM tenants`);
        console.log(`   ✅ tenants: ${r17[1]} rows`);
        const r18 = await qr.query(`DELETE FROM brands`);
        console.log(`   ✅ brands: ${r18[1]} rows`);

        // Demo users
        if (demoUsers.length > 0) {
            const demoIds = demoUsers.map((u: any) => u.id);
            // Delete any remaining references first
            try { await qr.query(`DELETE FROM user_policy_acceptances WHERE user_id IN (${demoIds.map((_: any, i: number) => `$${i + 1}`).join(',')})`, demoIds); } catch {}
            try { await qr.query(`DELETE FROM notification_events WHERE user_id IN (${demoIds.map((_: any, i: number) => `$${i + 1}`).join(',')})`, demoIds); } catch {}

            const r19 = await qr.query(
                `DELETE FROM users WHERE id IN (${demoIds.map((_: any, i: number) => `$${i + 1}`).join(',')})`,
                demoIds,
            );
            console.log(`   ✅ users (demo): ${r19[1]} rows`);
        }

        await qr.commitTransaction();
        console.log('\n✨ Cleanup complete! Only platform admin users remain.');

        // Verify
        const remaining = await ds.query(`SELECT email, id FROM users`);
        console.log(`\n📊 Remaining users (${remaining.length}):`);
        remaining.forEach((u: any) => console.log(`   - ${u.email}`));

    } catch (err) {
        console.error('\n❌ Cleanup failed:', err);
        await qr.rollbackTransaction();
    } finally {
        await qr.release();
        await ds.destroy();
    }
}

cleanup().catch(err => { console.error(err); process.exit(1); });
