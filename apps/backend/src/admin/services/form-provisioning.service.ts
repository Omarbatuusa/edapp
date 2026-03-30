import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdmissionsProcessCard, AdmissionsCardType } from '../entities/admissions-process-card.entity';

const DEFAULT_CARDS: Array<{
    title: string;
    card_type: AdmissionsCardType;
    sort_order: number;
    description: string;
}> = [
    {
        title: 'Welcome & Overview',
        card_type: AdmissionsCardType.INFO,
        sort_order: 0,
        description: 'Welcome to our admissions process. Please complete each step below to apply for enrollment.',
    },
    {
        title: 'Required Documents',
        card_type: AdmissionsCardType.REQUIREMENT,
        sort_order: 1,
        description: 'Certified copy of birth certificate, parent/guardian ID, latest school report, and immunisation record.',
    },
    {
        title: 'Submit Application Form',
        card_type: AdmissionsCardType.STEP,
        sort_order: 2,
        description: 'Complete the online application form with learner and guardian details.',
    },
    {
        title: 'Placement Assessment',
        card_type: AdmissionsCardType.STEP,
        sort_order: 3,
        description: 'Learner completes a grade-appropriate assessment at the school.',
    },
    {
        title: 'Parent / Guardian Interview',
        card_type: AdmissionsCardType.STEP,
        sort_order: 4,
        description: 'Brief meeting with the principal or admissions coordinator.',
    },
    {
        title: 'Offer & Enrollment Confirmation',
        card_type: AdmissionsCardType.STEP,
        sort_order: 5,
        description: 'Acceptance letter issued. Complete registration to confirm enrollment.',
    },
];

@Injectable()
export class FormProvisioningService {
    constructor(
        @InjectRepository(AdmissionsProcessCard)
        private readonly cardRepo: Repository<AdmissionsProcessCard>,
    ) {}

    /**
     * Provision default admissions cards for a new tenant.
     * Idempotent — skips if cards already exist for this tenant.
     */
    async provisionTenant(tenantId: string, createdBy: string): Promise<void> {
        const existing = await this.cardRepo.count({ where: { tenant_id: tenantId } });
        if (existing > 0) return;

        for (const card of DEFAULT_CARDS) {
            await this.cardRepo.save(
                this.cardRepo.create({
                    tenant_id: tenantId,
                    title: card.title,
                    card_type: card.card_type,
                    sort_order: card.sort_order,
                    description: card.description,
                    config: {},
                    is_published: false,
                    created_by: createdBy,
                }),
            );
        }
    }
}
