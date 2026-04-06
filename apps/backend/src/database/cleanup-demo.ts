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
            await qr.release();
            await ds.destroy();
            return;
        }

        // Helper: delete from table, skip if table doesn't exist
        const del = async (table: string) => {
            try {
                const r = await qr.query(`DELETE FROM "${table}"`);
                const count = Array.isArray(r) ? (r[1] ?? 0) : 0;
                console.log(`   ✅ ${table}: ${count} rows`);
            } catch (e: any) {
                if (e?.code === '42P01') { console.log(`   ⏭️  ${table}: not found (skipped)`); }
                else { console.log(`   ⚠️  ${table}: ${e?.message || 'error'} (skipped)`); }
            }
        };

        // 4. Delete in FK-safe order
        console.log('\n🗑️  Deleting data...');

        // Attendance
        await del('attendance_event');
        await del('attendance_events');
        await del('kiosk_device');
        await del('kiosk_devices');
        await del('school_class');
        await del('school_classes');
        await del('attendance_policy');
        await del('attendance_policies');

        // Communication
        await del('message');
        await del('messages');
        await del('thread_member');
        await del('thread_members');
        await del('thread');
        await del('threads');

        // Family
        await del('parent_child_link');
        await del('parent_child_links');

        // Profiles & applications
        for (const table of [
            'enrollment_application', 'enrollment_applications',
            'learner_profile', 'learner_profiles',
            'staff_profile', 'staff_profiles',
            'guardian_profile', 'guardian_profiles',
            'emergency_contact', 'emergency_contacts',
            'family_doctor', 'family_doctors',
            'family', 'families',
            'eldest_learner', 'eldest_learners',
            'curriculum', 'curricula',
        ]) { await del(table); }

        // Admin data
        await del('admin_draft');
        await del('admin_drafts');
        await del('admissions_process_card');
        await del('admissions_process_cards');
        await del('tenant_feature');
        await del('tenant_features');
        await del('audit_event');
        await del('audit_events');
        await del('platform_settings');

        // Academic
        for (const table of [
            'subject_offering', 'subject_offerings',
            'subject_stream', 'subject_streams',
            'tenant_phase_link', 'tenant_phase_links',
            'tenant_grade_link', 'tenant_grade_links',
        ]) { await del(table); }

        // Role assignments — delete tenant-scoped roles for preserved users,
        // and ALL roles for demo users. Keep platform roles for preserved users.
        const preservedIds = preserved.map((u: any) => u.id);
        if (preservedIds.length > 0) {
            try {
                const r13 = await qr.query(
                    `DELETE FROM "role_assignment" WHERE user_id IN (${preservedIds.map((_: any, i: number) => `$${i + 1}`).join(',')}) AND tenant_id IS NOT NULL`,
                    preservedIds,
                );
                console.log(`   ✅ role_assignment (preserved, tenant-scoped): ${r13[1] ?? 0} rows`);
            } catch {
                try {
                    const r13 = await qr.query(
                        `DELETE FROM "role_assignments" WHERE user_id IN (${preservedIds.map((_: any, i: number) => `$${i + 1}`).join(',')}) AND tenant_id IS NOT NULL`,
                        preservedIds,
                    );
                    console.log(`   ✅ role_assignments (preserved, tenant-scoped): ${r13[1] ?? 0} rows`);
                } catch { console.log(`   ⏭️  role_assignments (preserved): skipped`); }
            }
        }

        if (demoUsers.length > 0) {
            const demoIds = demoUsers.map((u: any) => u.id);
            const placeholders = demoIds.map((_: any, i: number) => `$${i + 1}`).join(',');
            try {
                const r14 = await qr.query(`DELETE FROM "role_assignment" WHERE user_id IN (${placeholders})`, demoIds);
                console.log(`   ✅ role_assignment (demo users): ${r14[1] ?? 0} rows`);
            } catch {
                try {
                    const r14 = await qr.query(`DELETE FROM "role_assignments" WHERE user_id IN (${placeholders})`, demoIds);
                    console.log(`   ✅ role_assignments (demo users): ${r14[1] ?? 0} rows`);
                } catch { console.log(`   ⏭️  role_assignments (demo): skipped`); }
            }
        }

        // Tenant infrastructure
        await del('tenant_domain');
        await del('tenant_domains');
        await del('branch');
        await del('branches');
        await del('tenant');
        await del('tenants');
        await del('brand');
        await del('brands');

        // Demo users — clean up remaining FK references first
        if (demoUsers.length > 0) {
            const demoIds = demoUsers.map((u: any) => u.id);
            const placeholders = demoIds.map((_: any, i: number) => `$${i + 1}`).join(',');
            try { await qr.query(`DELETE FROM "user_policy_acceptance" WHERE user_id IN (${placeholders})`, demoIds); } catch {}
            try { await qr.query(`DELETE FROM "user_policy_acceptances" WHERE user_id IN (${placeholders})`, demoIds); } catch {}
            try { await qr.query(`DELETE FROM "notification_event" WHERE user_id IN (${placeholders})`, demoIds); } catch {}
            try { await qr.query(`DELETE FROM "notification_events" WHERE user_id IN (${placeholders})`, demoIds); } catch {}

            try {
                const r19 = await qr.query(`DELETE FROM "user" WHERE id IN (${placeholders})`, demoIds);
                console.log(`   ✅ user (demo): ${r19[1] ?? 0} rows`);
            } catch {
                try {
                    const r19 = await qr.query(`DELETE FROM "users" WHERE id IN (${placeholders})`, demoIds);
                    console.log(`   ✅ users (demo): ${r19[1] ?? 0} rows`);
                } catch (e: any) { console.log(`   ⚠️  users: ${e?.message || 'error'}`); }
            }
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
