import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { SequenceCounter } from '../entities/sequence-counter.entity';

@Injectable()
export class IdentifierGeneratorService {
    constructor(
        @InjectRepository(SequenceCounter)
        private readonly counterRepo: Repository<SequenceCounter>,
        private readonly dataSource: DataSource,
    ) {}

    /**
     * Atomically increment and return the next value for a sequence.
     * Creates the counter row if it doesn't exist.
     */
    private async nextValue(tenantId: string, sequenceType: string, prefix: string): Promise<number> {
        const result = await this.dataSource.query(
            `INSERT INTO sequence_counters (id, tenant_id, sequence_type, current_value, prefix)
             VALUES (gen_random_uuid(), $1, $2, 1, $3)
             ON CONFLICT (tenant_id, sequence_type)
             DO UPDATE SET current_value = sequence_counters.current_value + 1
             RETURNING current_value`,
            [tenantId, sequenceType, prefix],
        );
        return parseInt(result[0].current_value, 10);
    }

    /** Generate family code: {TENANT_CODE}-F000001 */
    async generateFamilyCode(tenantId: string, tenantCode: string): Promise<string> {
        const val = await this.nextValue(tenantId, 'family', tenantCode);
        return `${tenantCode}-F${String(val).padStart(6, '0')}`;
    }

    /** Generate learner number: {TENANT_CODE}-S000001 */
    async generateLearnerNumber(tenantId: string, tenantCode: string): Promise<string> {
        const val = await this.nextValue(tenantId, 'learner', tenantCode);
        return `${tenantCode}-S${String(val).padStart(6, '0')}`;
    }

    /** Generate staff code: {TENANT_CODE}-T000001 */
    async generateStaffCode(tenantId: string, tenantCode: string): Promise<string> {
        const val = await this.nextValue(tenantId, 'staff', tenantCode);
        return `${tenantCode}-T${String(val).padStart(6, '0')}`;
    }

    /** Generate invoice number: {TENANT_CODE}-INV-{YEAR}-000001 */
    async generateInvoiceNumber(tenantId: string, tenantCode: string): Promise<string> {
        const year = new Date().getFullYear();
        const val = await this.nextValue(tenantId, `invoice_${year}`, tenantCode);
        return `${tenantCode}-INV-${year}-${String(val).padStart(6, '0')}`;
    }
}
