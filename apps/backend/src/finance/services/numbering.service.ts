import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FinTenantSettings } from '../entities';

@Injectable()
export class NumberingService {
    constructor(
        @InjectRepository(FinTenantSettings)
        private readonly settingsRepo: Repository<FinTenantSettings>,
    ) {}

    async getNextNumber(tenantId: string, series: 'invoice' | 'receipt' | 'journal' | 'credit_note' | 'po'): Promise<string> {
        const settings = await this.settingsRepo.findOne({ where: { tenant_id: tenantId } });
        if (!settings) throw new Error('Finance settings not initialized for tenant');

        const config = settings.auto_numbering_config || {};
        const prefixKey = `${series}_prefix` as keyof typeof config;
        const nextKey = `${series}_next` as keyof typeof config;

        const prefix = (config[prefixKey] as string) || this.defaultPrefix(series);
        const next = (config[nextKey] as number) || 1;

        // Increment atomically
        const newConfig = { ...config, [nextKey]: next + 1 };
        await this.settingsRepo.update(
            { tenant_id: tenantId },
            { auto_numbering_config: newConfig as any },
        );

        return `${prefix}${String(next).padStart(6, '0')}`;
    }

    private defaultPrefix(series: string): string {
        const map: Record<string, string> = {
            invoice: 'INV-',
            receipt: 'RCT-',
            journal: 'JNL-',
            credit_note: 'CN-',
            po: 'PO-',
        };
        return map[series] || 'DOC-';
    }
}
