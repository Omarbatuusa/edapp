import { Controller, Post, Get, Body, Req, Query, UseGuards } from '@nestjs/common';
import { SecurityEnforcementGuard } from '../security/security-enforcement.guard';
import { SecurityAction } from '../security/security-action.decorator';
import { StaffAttendanceService } from './services/staff-attendance.service';
import { LearnerAttendanceService } from './services/learner-attendance.service';
import { AttendanceEventService } from './services/attendance-event.service';
import { AttendanceSourceType, SubjectType, AttendanceEventType } from './entities/attendance-event.entity';
import { StaffCheckinDto } from './dto/record-event.dto';
import { v4 as uuidv4 } from 'uuid';

@Controller('attendance')
@UseGuards(SecurityEnforcementGuard)
export class AttendanceController {
    constructor(
        private staffService: StaffAttendanceService,
        private learnerService: LearnerAttendanceService,
        private eventService: AttendanceEventService,
    ) {}

    // ========== STAFF ENDPOINTS ==========

    @Post('staff/check-in')
    @SecurityAction('attendance.staff.clock_in')
    async staffCheckIn(@Body() body: StaffCheckinDto, @Req() req: any) {
        const tenant_id = req.tenant_id;
        const user_id = req.user?.id;
        if (!tenant_id || !user_id) {
            return { status: 'error', message: 'Authentication required' };
        }

        const { event, summary } = await this.staffService.checkIn(
            tenant_id,
            body.branch_id,
            user_id,
            body.device_id ? AttendanceSourceType.KIOSK_SCAN : AttendanceSourceType.PWA_GEO,
            body.geo,
            body.device_id,
            body.idempotency_key || uuidv4(),
        );

        return {
            status: 'success',
            message: summary.status === 'LATE'
                ? `Checked in (${summary.late_minutes} min late)`
                : 'Checked in on time',
            event_id: event.id,
            late_minutes: summary.late_minutes,
            timestamp: event.captured_at_server,
        };
    }

    @Post('staff/check-out')
    @SecurityAction('attendance.staff.clock_out')
    async staffCheckOut(@Body() body: StaffCheckinDto, @Req() req: any) {
        const tenant_id = req.tenant_id;
        const user_id = req.user?.id;
        if (!tenant_id || !user_id) {
            return { status: 'error', message: 'Authentication required' };
        }

        const { event, summary } = await this.staffService.checkOut(
            tenant_id,
            body.branch_id,
            user_id,
            body.device_id ? AttendanceSourceType.KIOSK_SCAN : AttendanceSourceType.PWA_GEO,
            body.geo,
            body.device_id,
            body.idempotency_key || uuidv4(),
        );

        return {
            status: 'success',
            message: 'Checked out',
            event_id: event.id,
            hours_worked: summary?.total_hours_worked || 0,
            overtime_minutes: summary?.overtime_minutes || 0,
            timestamp: event.captured_at_server,
        };
    }

    @Get('staff/today')
    async staffToday(@Req() req: any, @Query('branch_id') branch_id: string) {
        const tenant_id = req.tenant_id;
        const user_id = req.user?.id;
        if (!tenant_id || !user_id) {
            return { status: 'error', message: 'Authentication required' };
        }
        const summary = await this.staffService.getStaffToday(tenant_id, branch_id, user_id);
        return { status: 'success', ...summary };
    }

    // ========== LEARNER ENDPOINTS ==========

    @Post('learner/mark')
    @SecurityAction('attendance.learner.mark')
    async markLearnerAttendance(@Body() body: any, @Req() req: any) {
        const tenant_id = req.tenant_id;
        const user_id = body.learner_user_id || req.user?.id;
        if (!tenant_id || !user_id) {
            return { status: 'error', message: 'Learner not identified' };
        }

        const event = await this.eventService.recordEvent({
            tenant_id,
            branch_id: body.branch_id,
            subject_type: SubjectType.LEARNER,
            subject_user_id: user_id,
            event_type: body.event_type || AttendanceEventType.CHECK_IN,
            source: body.source || AttendanceSourceType.PWA_GEO,
            captured_at_device: body.captured_at_device || new Date().toISOString(),
            captured_lat: body.geo?.lat,
            captured_lng: body.geo?.lng,
            captured_accuracy_m: body.geo?.accuracy,
            client_ip: req.ip,
            idempotency_key: body.idempotency_key || uuidv4(),
        });

        return {
            status: 'success',
            message: 'Attendance marked',
            event_id: event.id,
            security: req.securityDecision,
        };
    }

    @Get('learner/branch')
    async learnersForBranch(
        @Req() req: any,
        @Query('branch_id') branch_id: string,
        @Query('date') date?: string,
    ) {
        const tenant_id = req.tenant_id;
        const d = date ? new Date(date) : new Date();
        const learners = await this.learnerService.getLearnersForBranch(tenant_id, branch_id, d);
        return { status: 'success', learners };
    }
}
