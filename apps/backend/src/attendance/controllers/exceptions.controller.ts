import { Controller, Get, Patch, Param, Body, Query, Req } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AttendanceDailySummary } from '../entities/attendance-daily-summary.entity';
import { AttendanceEvent } from '../entities/attendance-event.entity';
import { AttendanceAuditService } from '../services/attendance-audit.service';

@Controller('attendance/exceptions')
export class ExceptionsController {
    constructor(
        @InjectRepository(AttendanceDailySummary)
        private summaryRepo: Repository<AttendanceDailySummary>,
        @InjectRepository(AttendanceEvent)
        private eventRepo: Repository<AttendanceEvent>,
        private auditService: AttendanceAuditService,
    ) {}

    @Get()
    async listExceptions(
        @Req() req: any,
        @Query('branch_id') branch_id?: string,
        @Query('date') date?: string,
        @Query('type') type?: string, // missing_checkout, outside_policy, register_conflict
    ) {
        const tenant_id = req.tenant_id;
        const query = this.summaryRepo.createQueryBuilder('s')
            .where('s.tenant_id = :tenant_id', { tenant_id });

        if (branch_id) query.andWhere('s.branch_id = :branch_id', { branch_id });
        if (date) query.andWhere('s.date = :date', { date });

        // Filter by flag type
        if (type === 'missing_checkout') {
            query.andWhere("s.flags->>'missing_checkout' = 'true'");
        } else if (type === 'outside_policy') {
            query.andWhere("s.flags->>'outside_policy' = 'true'");
        } else if (type === 'register_conflict') {
            query.andWhere("s.flags->>'register_conflict' = 'true'");
        } else {
            // All exceptions: any flag set
            query.andWhere(
                "(s.flags->>'missing_checkout' = 'true' OR s.flags->>'outside_policy' = 'true' OR s.flags->>'register_conflict' = 'true' OR s.flags->>'overridden' = 'true')"
            );
        }

        query.orderBy('s.date', 'DESC').take(200);
        const exceptions = await query.getMany();

        return { exceptions };
    }

    @Patch(':summaryId/resolve')
    async resolveException(
        @Param('summaryId') summaryId: string,
        @Body() body: { override_reason: string; new_status?: string },
        @Req() req: any,
    ) {
        const tenant_id = req.tenant_id;
        const actor_id = req.user?.id;

        const summary = await this.summaryRepo.findOne({
            where: { id: summaryId, tenant_id },
        });

        if (!summary) {
            return { status: 'error', message: 'Summary not found' };
        }

        const before = { ...summary.flags, status: summary.status };

        // Mark as overridden
        summary.flags = { ...summary.flags, overridden: true, missing_checkout: false, outside_policy: false, register_conflict: false };
        if (body.new_status) {
            summary.status = body.new_status as any;
        }

        await this.summaryRepo.save(summary);

        await this.auditService.logOverride(
            tenant_id,
            actor_id,
            summaryId,
            body.override_reason,
            before,
            { flags: summary.flags, status: summary.status },
        );

        return { status: 'success', summary };
    }
}
