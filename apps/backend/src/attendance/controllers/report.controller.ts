import { Controller, Get, Query, Req, Res } from '@nestjs/common';
import { ReportService } from '../reports/report.service';
import { ExportService } from '../reports/export.service';

@Controller('attendance/reports')
export class ReportController {
    constructor(
        private reportService: ReportService,
        private exportService: ExportService,
    ) {}

    @Get('learner-daily')
    async learnerDaily(
        @Req() req: any,
        @Res() res: any,
        @Query('branch_id') branch_id: string,
        @Query('date') date: string,
        @Query('class_id') class_id?: string,
        @Query('format') format?: string,
    ) {
        const tenant_id = req.tenant_id;

        if (format === 'csv' || format === 'xlsx') {
            const result = await this.exportService.exportLearnerDaily({
                tenant_id, branch_id, class_id, date,
                format: format as 'csv' | 'xlsx',
            });
            res.setHeader('Content-Type', result.contentType);
            res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
            return res.send(result.buffer);
        }

        const pdf = await this.reportService.generateLearnerDailyRegister({ tenant_id, branch_id, class_id, date });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="learner-daily-${date}.pdf"`);
        return res.send(pdf);
    }

    @Get('learner-weekly')
    async learnerWeekly(
        @Req() req: any,
        @Res() res: any,
        @Query('branch_id') branch_id: string,
        @Query('week_start') week_start: string,
        @Query('class_id') class_id?: string,
        @Query('format') format?: string,
    ) {
        const tenant_id = req.tenant_id;

        if (format === 'csv' || format === 'xlsx') {
            // Reuse daily export for weekly with date range
            const result = await this.exportService.exportLearnerDaily({
                tenant_id, branch_id, class_id, date: week_start,
                format: format as 'csv' | 'xlsx',
            });
            res.setHeader('Content-Type', result.contentType);
            res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
            return res.send(result.buffer);
        }

        const pdf = await this.reportService.generateLearnerWeeklyRegister({ tenant_id, branch_id, class_id, week_start });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="learner-weekly-${week_start}.pdf"`);
        return res.send(pdf);
    }

    @Get('branch-summary')
    async branchSummary(
        @Req() req: any,
        @Res() res: any,
        @Query('branch_id') branch_id: string,
        @Query('week_start') week_start: string,
    ) {
        const tenant_id = req.tenant_id;
        const pdf = await this.reportService.generateBranchWeeklySummary({ tenant_id, branch_id, week_start });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="branch-summary-${week_start}.pdf"`);
        return res.send(pdf);
    }

    @Get('staff-weekly')
    async staffWeekly(
        @Req() req: any,
        @Res() res: any,
        @Query('branch_id') branch_id: string,
        @Query('week_start') week_start: string,
        @Query('format') format?: string,
    ) {
        const tenant_id = req.tenant_id;

        if (format === 'csv' || format === 'xlsx') {
            const result = await this.exportService.exportStaffWeekly({
                tenant_id, branch_id, week_start,
                format: format as 'csv' | 'xlsx',
            });
            res.setHeader('Content-Type', result.contentType);
            res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
            return res.send(result.buffer);
        }

        const pdf = await this.reportService.generateStaffWeeklyTimeReport({ tenant_id, branch_id, week_start });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="staff-weekly-${week_start}.pdf"`);
        return res.send(pdf);
    }
}
