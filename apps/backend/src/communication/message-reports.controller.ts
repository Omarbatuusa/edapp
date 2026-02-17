import { Controller, Get, Post, Patch, Param, Body, Query, Req, UseGuards } from '@nestjs/common';
import { MessageReportsService } from './message-reports.service';
import { ReportReason, ReportStatus } from './message-report.entity';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';

// ============================================================
// MESSAGE REPORTS CONTROLLER - Message flagging endpoints
// All endpoints secured via FirebaseAuthGuard
// ============================================================

@Controller('message-reports')
@UseGuards(FirebaseAuthGuard)
export class MessageReportsController {
    constructor(private readonly reportsService: MessageReportsService) { }

    // Report a message
    @Post()
    async reportMessage(
        @Body() body: { message_id: string; reason: ReportReason; details?: string },
        @Req() req: any,
    ) {
        return this.reportsService.reportMessage(
            req.tenant_id,
            req.user.uid,
            body.message_id,
            body.reason,
            body.details,
        );
    }

    // Get reports (staff/admin)
    @Get()
    async getReports(
        @Req() req: any,
        @Query('status') status?: ReportStatus,
    ) {
        return this.reportsService.getReports(req.tenant_id, status);
    }

    // Review a report (staff/admin)
    @Patch(':id/review')
    async reviewReport(
        @Param('id') id: string,
        @Body() body: { status: ReportStatus; review_notes?: string },
        @Req() req: any,
    ) {
        return this.reportsService.reviewReport(id, req.user.uid, body.status, body.review_notes);
    }
}
