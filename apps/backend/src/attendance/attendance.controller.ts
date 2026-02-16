import { Controller, Post, UseGuards, Body, Req } from '@nestjs/common';
import { SecurityEnforcementGuard } from '../security/security-enforcement.guard';
import { SecurityAction } from '../security/security-action.decorator';

@Controller('attendance')
@UseGuards(SecurityEnforcementGuard)
export class AttendanceController {

    @Post('learner/mark')
    @SecurityAction('attendance.learner.mark')
    async markLearnerAttendance(@Body() body: any, @Req() req: any) {
        return {
            status: 'success',
            message: 'Attendance marked',
            geo: req.body.geo,
            ip: req.ip // or extracted IP 
        };
    }

    @Post('staff/check-in')
    @SecurityAction('attendance.staff.clock_in')
    async staffCheckIn(@Body() body: any) {
        return { status: 'success', message: 'Staff checked in' };
    }
}
