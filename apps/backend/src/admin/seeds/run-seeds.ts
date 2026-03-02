/**
 * Idempotent seed runner for dictionary tables.
 *
 * Usage:
 *   npx ts-node -r tsconfig-paths/register src/admin/seeds/run-seeds.ts
 *
 * Or import and call seedDictionaries(dataSource) from a bootstrap hook.
 */

import { DataSource } from 'typeorm';
import { SEED_DATA } from './dict-seed-data';

export async function seedDictionaries(dataSource: DataSource): Promise<void> {
    for (const [tableName, entries] of Object.entries(SEED_DATA)) {
        const repo = dataSource.getRepository(tableName);

        for (const entry of entries) {
            const existing = await repo.findOne({ where: { code: entry.code } as any });
            if (!existing) {
                await repo.save(repo.create({
                    code: entry.code,
                    label: entry.label,
                    sort_order: entry.sort_order,
                    is_active: true,
                } as any));
            }
        }

        console.log(`[Seed] ${tableName}: ${entries.length} entries processed`);
    }

    console.log('[Seed] All dictionary seeds complete.');
}

// Standalone runner
if (require.main === module) {
    (async () => {
        // Build a minimal DataSource for seeding
        const ds = new DataSource({
            type: 'postgres',
            url: process.env.DATABASE_URL,
            synchronize: false,
            logging: false,
        });

        await ds.initialize();
        console.log('[Seed] Database connected');

        await seedDictionaries(ds);

        await ds.destroy();
        console.log('[Seed] Done');
    })().catch(err => {
        console.error('[Seed] Error:', err);
        process.exit(1);
    });
}
