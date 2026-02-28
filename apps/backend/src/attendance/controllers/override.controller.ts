import { Controller, Patch, Param, Body, Req, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AttendanceEvent } from '../entities/attendance-event.entity';
import { AttendanceDailySummary } from '../entities/attendance-daily-summary.entity';
import { AttendanceAuditService } from '../services/attendance-audit.service';

@Controller('attendance/override')
export class OverrideController {
    constructor(
        @InjectRepository(AttendanceEvent)
        private eventRepo: Repository<AttendanceEvent>,
        @InjectRepository(AttendanceDailySummary)
        private summaryRepo: Repository<AttendanceDailySummary>,
        private auditService: AttendanceAuditService,
    ) {}

    @Patch('event/:id')
    async overrideEvent(
        @Param('id') id: string,
        @Body() body: { reason: string; new_event_type?: string; metadata?: any },
        @Req() req: any,
    ) {
        const tenant_id = req.tenant_id;
        const actor_id = req.user?.id;

        if (!body.reason) {
            return { status: 'error', message: 'Override reason is required' };
        }

        const event = await this.eventRepo.findOne({
            where: { id, tenant_id },
        });

        if (!event) {
            return { status: 'error', message: 'Event not found' };
        }

        const before = {
            event_type: event.event_type,
            override_reason: event.override_reason,
        };

        event.override_reason = body.reason;
        if (body.new_event_type) {
            event.event_type = body.new_event_type as any;
        }
        if (body.metadata) {
            event.metadata = { ...event.metadata, ...body.metadata };
        }

        await this.eventRepo.save(event);

        await this.auditService.logOverride(
            tenant_id, actor_id, id, body.reason,
            before,
            { event_type: event.event_type, override_reason: event.override_reason },
        );

        return { status: 'success', event };
    }

    @Patch('summary/:id')
    async overrideSummary(
        @Param('id') id: string,
        @Body() body: { reason: string; new_status: string },
        @Req() req: any,
    ) {
        const tenant_id = req.tenant_id;
        const actor_id = req.user?.id;

        if (!body.reason) {
            return { status: 'error', message: 'Override reason is required' };
        }

        const summary = await this.summaryRepo.findOne({
            where: { id, tenant_id },
        });

        if (!summary) {
            return { status: 'error', message: 'Summary not found' };
        }

        const before = { status: summary.status, flags: summary.flags };

        summary.status = body.new_status as any;
        summary.flags = { ...summary.flags, overridden: true };

        await this.summaryRepo.save(summary);

        await this.auditService.logOverride(
            tenant_id, actor_id, id, body.reason,
            before,
            { status: summary.status, flags: summary.flags },
        );

        return { status: 'success', summary };
    }
}
