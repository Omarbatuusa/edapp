/**
 * Backfill default admissions process cards for all existing tenants.
 *
 * Usage:
 *   docker exec edapp_api node dist/admin/seeds/backfill-tenant-forms.js
 *
 * Safe to run multiple times — skips tenants that already have cards.
 */

import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

const DEFAULT_CARDS = [
  {
    title: 'Welcome & Overview',
    card_type: 'INFO',
    sort_order: 0,
    description: 'Welcome to our admissions process. Please complete each step below to apply for enrollment.',
  },
  {
    title: 'Required Documents',
    card_type: 'REQUIREMENT',
    sort_order: 1,
    description: 'Certified copy of birth certificate, parent/guardian ID, latest school report, and immunisation record.',
  },
  {
    title: 'Submit Application Form',
    card_type: 'STEP',
    sort_order: 2,
    description: 'Complete the online application form with learner and guardian details.',
  },
  {
    title: 'Placement Assessment',
    card_type: 'STEP',
    sort_order: 3,
    description: 'Learner completes a grade-appropriate assessment at the school.',
  },
  {
    title: 'Parent / Guardian Interview',
    card_type: 'STEP',
    sort_order: 4,
    description: 'Brief meeting with the principal or admissions coordinator.',
  },
  {
    title: 'Offer & Enrollment Confirmation',
    card_type: 'STEP',
    sort_order: 5,
    description: 'Acceptance letter issued. Complete registration to confirm enrollment.',
  },
];

if (require.main === module) {
  (async () => {
    const ds = new DataSource({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      synchronize: false,
      logging: false,
    });

    await ds.initialize();
    console.log('[BackfillForms] Connected to database');

    const tenants = await ds.query<Array<{ id: string; school_name: string }>>(
      `SELECT id, school_name FROM tenants WHERE status = 'active' ORDER BY created_at ASC`,
    );

    console.log(`[BackfillForms] Found ${tenants.length} active tenant(s)`);

    let provisioned = 0;
    let skipped = 0;

    for (const tenant of tenants) {
      const [{ count }] = await ds.query<Array<{ count: string }>>(
        `SELECT COUNT(*) as count FROM admissions_process_cards WHERE tenant_id = $1`,
        [tenant.id],
      );

      if (parseInt(count, 10) > 0) {
        console.log(`[BackfillForms] SKIP ${tenant.school_name} (${tenant.id}) — already has ${count} card(s)`);
        skipped++;
        continue;
      }

      for (const card of DEFAULT_CARDS) {
        await ds.query(
          `INSERT INTO admissions_process_cards
             (tenant_id, title, card_type, sort_order, description, config, is_published, created_by)
           VALUES ($1, $2, $3, $4, $5, $6, false, 'system')`,
          [tenant.id, card.title, card.card_type, card.sort_order, card.description, '{}'],
        );
      }

      console.log(`[BackfillForms] PROVISIONED ${tenant.school_name} (${tenant.id}) — inserted 6 cards`);
      provisioned++;
    }

    console.log(`\n[BackfillForms] Done. Provisioned: ${provisioned}, Skipped: ${skipped}`);
    await ds.destroy();
  })().catch(err => {
    console.error('[BackfillForms] Error:', err);
    process.exit(1);
  });
}
