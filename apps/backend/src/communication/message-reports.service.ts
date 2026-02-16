import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageReport, ReportReason, ReportStatus } from './message-report.entity';
import { AuditService } from '../audit/audit.service';

// ============================================================
// MESSAGE REPORTS SERVICE - Message flagging/reporting
// ============================================================

@Injectable()
export class MessageReportsService {
    constructor(
        @InjectRepository(MessageReport)
        private reportRepo: Repository<MessageReport>,
        private readonly auditService: AuditService,
    ) { }

    // Report a message
    async reportMessage(
        tenant_id: string,
        reporter_id: string,
        message_id: string,
        reason: ReportReason,
        details?: string,
    ): Promise<MessageReport> {
        const report = this.reportRepo.create({
            tenant_id,
            reporter_id,
            message_id,
            reason,
            details,
        });

        const saved = await this.reportRepo.save(report);

        await this.auditService.log({
            action: 'message.report',
            userId: reporter_id,
            tenantId: tenant_id,
            metadata: { message_id, reason },
        });

        return saved;
    }

    // Get reports for a tenant (staff/admin)
    async getReports(
        tenant_id: string,
        status?: ReportStatus,
    ): Promise<MessageReport[]> {
        const where: any = { tenant_id };
        if (status) where.status = status;

        return this.reportRepo.find({
            where,
            relations: ['message', 'reporter'],
            order: { created_at: 'DESC' },
        });
    }

    // Review a report (staff/admin)
    async reviewReport(
        report_id: string,
        reviewer_id: string,
        status: ReportStatus,
        review_notes?: string,
    ): Promise<MessageReport> {
        const report = await this.reportRepo.findOne({ where: { id: report_id } });
        if (!report) throw new NotFoundException('Report not found');

        report.status = status;
        report.reviewed_by = reviewer_id;
        report.review_notes = review_notes || null;

        const saved = await this.reportRepo.save(report);

        await this.auditService.log({
            action: 'message_report.review',
            userId: reviewer_id,
            metadata: { report_id, status, message_id: report.message_id },
        });

        return saved;
    }
}
