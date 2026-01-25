import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './audit-log.entity';

@Injectable()
export class AuditService {
    constructor(
        @InjectRepository(AuditLog)
        private auditLogRepository: Repository<AuditLog>,
    ) { }

    async log(data: {
        action: string;
        tenantId?: string;
        userId?: string;
        metadata?: Record<string, any>;
        ipAddress?: string;
        userAgent?: string;
    }): Promise<void> {
        const auditLog = this.auditLogRepository.create(data);
        await this.auditLogRepository.save(auditLog);
    }

    async getRecentAttempts(
        action: string,
        identifier: string,
        windowMinutes: number = 60,
    ): Promise<number> {
        const since = new Date(Date.now() - windowMinutes * 60 * 1000);

        const count = await this.auditLogRepository.count({
            where: {
                action,
                createdAt: since as any,
                metadata: { identifier } as any,
            },
        });

        return count;
    }
}
