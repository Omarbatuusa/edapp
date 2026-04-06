/**
 * Production cleanup — removes ALL demo data, keeps only platform admin users.
 *
 * Usage:
 *   docker exec edapp_api node dist/database/cleanup-demo.js --dry-run
 *   docker exec edapp_api node dist/database/cleanup-demo.js --confirm
 */

import { DataSource } from 'typeorm';

const PRESERVE_EMAILS = ['umarbatuusa@gmail.com', 'admin@edapp.co.za'];

async function cleanup() {
    const dryRun = !process.argv.includes('--confirm');
    console.log(dryRun ? '🔍 DRY RUN mode' : '⚠️  LIVE MODE — data WILL be deleted');

    const ds = new DataSource({
        type: 'postgres',
        url: process.env.DATABASE_URL || 'postgresql://edapp:edapp123@localhost:5432/edapp',
        synchronize: false,
        logging: false,
    });
    await ds.initialize();
    console.log('✅ Connected\n');

    // Find what exists
    const tenants = await ds.query(`SELECT id, tenant_slug, school_code FROM tenants`);
    console.log(`📋 Tenants to remove (${tenants.length}):`);
    tenants.forEach((t: any) => console.log(`   - ${t.school_code} (${t.tenant_slug})`));

    const allUsers = await ds.query(`SELECT id, email FROM users`);
    const preserved = allUsers.filter((u: any) => PRESERVE_EMAILS.includes(u.email.toLowerCase()));
    const demo = allUsers.filter((u: any) => !PRESERVE_EMAILS.includes(u.email.toLowerCase()));
    console.log(`\n👤 Demo users to remove (${demo.length}):`);
    demo.forEach((u: any) => console.log(`   - ${u.email}`));
    console.log(`\n🔒 Preserving (${preserved.length}):`);
    preserved.forEach((u: any) => console.log(`   - ${u.email}`));

    if (dryRun) {
        console.log('\n🔍 DRY RUN complete. Use --confirm to execute.');
        await ds.destroy();
        return;
    }

    // Use TRUNCATE CASCADE — nukes everything in one shot, handles FK automatically
    console.log('\n🗑️  Cleaning...');

    // Get all table names from the database
    const tables = await ds.query(`
        SELECT tablename FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename NOT LIKE 'pg_%'
        AND tablename NOT LIKE 'dict_%'
    `);
    const tableNames: string[] = tables.map((t: any) => t.tablename);
    console.log(`   Found ${tableNames.length} non-dict tables`);

    // Tables to NEVER truncate (dict/reference data we want to keep)
    const KEEP_TABLES = ['migrations', 'typeorm_metadata'];

    // Tables that need selective delete (not full truncate)
    const SELECTIVE = ['users', 'user', 'role_assignment', 'role_assignments'];

    // Phase 1: TRUNCATE all tables except users and role_assignments
    const toTruncate = tableNames.filter(t =>
        !SELECTIVE.includes(t) &&
        !KEEP_TABLES.includes(t) &&
        !t.startsWith('dict_')
    );

    if (toTruncate.length > 0) {
        const quoted = toTruncate.map(t => `"${t}"`).join(', ');
        try {
            await ds.query(`TRUNCATE ${quoted} CASCADE`);
            console.log(`   ✅ Truncated ${toTruncate.length} tables`);
        } catch (e: any) {
            console.log(`   ⚠️  Bulk truncate failed: ${e.message}`);
            // Fall back to one-by-one
            for (const t of toTruncate) {
                try {
                    await ds.query(`TRUNCATE "${t}" CASCADE`);
                    console.log(`   ✅ ${t}`);
                } catch (e2: any) {
                    console.log(`   ⏭️  ${t}: ${e2.message?.substring(0, 60)}`);
                }
            }
        }
    }

    // Phase 2: Delete role assignments for demo users + tenant-scoped for preserved
    const preservedIds = preserved.map((u: any) => u.id);
    const demoIds = demo.map((u: any) => u.id);

    // Find the actual role assignments table name
    const raTable = tableNames.find(t => t === 'role_assignment' || t === 'role_assignments') || 'role_assignment';

    if (preservedIds.length > 0) {
        try {
            const r = await ds.query(
                `DELETE FROM "${raTable}" WHERE user_id = ANY($1) AND tenant_id IS NOT NULL`,
                [preservedIds],
            );
            console.log(`   ✅ ${raTable} (preserved users, tenant-scoped): ${r[1] ?? 0} rows`);
        } catch (e: any) { console.log(`   ⚠️  ${raTable} preserved: ${e.message?.substring(0, 60)}`); }
    }

    if (demoIds.length > 0) {
        try {
            const r = await ds.query(
                `DELETE FROM "${raTable}" WHERE user_id = ANY($1)`,
                [demoIds],
            );
            console.log(`   ✅ ${raTable} (demo users): ${r[1] ?? 0} rows`);
        } catch (e: any) { console.log(`   ⚠️  ${raTable} demo: ${e.message?.substring(0, 60)}`); }
    }

    // Phase 3: Delete demo users
    const usersTable = tableNames.find(t => t === 'user' || t === 'users') || 'user';
    if (demoIds.length > 0) {
        // Clean any remaining FK refs
        for (const fkTable of ['user_policy_acceptance', 'user_policy_acceptances', 'notification_event', 'notification_events']) {
            try { await ds.query(`DELETE FROM "${fkTable}" WHERE user_id = ANY($1)`, [demoIds]); } catch {}
        }
        try {
            const r = await ds.query(`DELETE FROM "${usersTable}" WHERE id = ANY($1)`, [demoIds]);
            console.log(`   ✅ ${usersTable} (demo): ${r[1] ?? 0} rows deleted`);
        } catch (e: any) { console.log(`   ⚠️  ${usersTable}: ${e.message?.substring(0, 80)}`); }
    }

    // Verify
    const remaining = await ds.query(`SELECT email FROM "${usersTable}"`);
    console.log(`\n✨ Done! Remaining users (${remaining.length}):`);
    remaining.forEach((u: any) => console.log(`   - ${u.email}`));

    const remainingTenants = await ds.query(`SELECT count(*) as c FROM tenants`).catch(() => [{ c: 0 }]);
    console.log(`   Tenants: ${remainingTenants[0]?.c ?? 0}`);
    const remainingBrands = await ds.query(`SELECT count(*) as c FROM brands`).catch(() => [{ c: 0 }]);
    console.log(`   Brands: ${remainingBrands[0]?.c ?? 0}`);

    await ds.destroy();
}

cleanup().catch(err => { console.error('❌', err.message); process.exit(1); });
