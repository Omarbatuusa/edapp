import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AttendanceEventService } from './attendance-event.service';
import { AttendanceAlertService } from './attendance-alert.service';
import { AttendanceDailySummary, AttendanceStatus } from '../entities/attendance-daily-summary.entity';
import { AttendancePolicy } from '../entities/attendance-policy.entity';
import { AttendanceEventType, SubjectType } from '../entities/attendance-event.entity';
import { User } from '../../users/user.entity';
import { RoleAssignment, UserRole } from '../../users/role-assignment.entity';

@Injectable()
export class LearnerAttendanceService {
    private readonly logger = new Logger(LearnerAttendanceService.name);

    constructor(
        private eventService: AttendanceEventService,
        private alertService: AttendanceAlertService,
        @InjectRepository(AttendanceDailySummary)
        private summaryRepo: Repository<AttendanceDailySummary>,
        @InjectRepository(AttendancePolicy)
        private policyRepo: Repository<AttendancePolicy>,
        @InjectRepository(User)
        private userRepo: Repository<User>,
        @InjectRepository(RoleAssignment)
        private roleRepo: Repository<RoleAssignment>,
    ) {}

    async getLearnersForBranch(
        tenant_id: string,
        branch_id: string,
        date: Date,
    ): Promise<any[]> {
        const dateStr = date.toISOString().split('T')[0];

        // Get all learners in this tenant
        const learnerRoles = await this.roleRepo.find({
            where: { tenant_id, role: UserRole.LEARNER, is_active: true },
            relations: ['user'],
        });

        // Get daily summaries
        const summaries = await this.summaryRepo.find({
            where: { tenant_id, branch_id, date: dateStr, subject_type: SubjectType.LEARNER },
        });

        const summaryMap = new Map(summaries.map(s => [s.subject_user_id, s]));

        return learnerRoles
            .filter(r => r.user)
            .map(r => {
                const summary = summaryMap.get(r.user_id);
                return {
                    user_id: r.user_id,
                    name: r.user?.display_name || `${r.user?.first_name || ''} ${r.user?.last_name || ''}`.trim(),
                    student_number: r.user?.student_number,
                    status: summary?.status || AttendanceStatus.UNKNOWN,
                    check_in: summary?.earliest_check_in || null,
                    check_out: summary?.latest_check_out || null,
                    late_minutes: summary?.late_minutes || 0,
                    flags: summary?.flags || {},
                };
            });
    }

    async getLearnerDailySummary(
        tenant_id: string,
        branch_id: string,
        user_id: string,
        date: Date,
    ): Promise<AttendanceDailySummary | null> {
        const dateStr = date.toISOString().split('T')[0];
        return this.summaryRepo.findOne({
            where: { tenant_id, branch_id, subject_user_id: user_id, date: dateStr },
        });
    }

    async computeAndStoreLearnerDailySummary(
        tenant_id: string,
        branch_id: string,
        user_id: string,
        date: Date,
    ): Promise<AttendanceDailySummary> {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const events = await this.eventService.getEventsForSubject(tenant_id, user_id, startOfDay, endOfDay);
        const policy = await this.getPolicy(tenant_id, branch_id);

        const checkIns = events.filter(e => e.event_type === AttendanceEventType.CHECK_IN);
        const checkOuts = events.filter(e => e.event_type === AttendanceEventType.CHECK_OUT);
        const earlyLeaves = events.filter(e => e.event_type === AttendanceEventType.EARLY_LEAVE_APPROVED);

        const earliestCheckIn = checkIns[0]?.captured_at_server;
        const latestCheckOut = checkOuts[checkOuts.length - 1]?.captured_at_server;

        let status = AttendanceStatus.ABSENT;
        let lateMinutes = 0;
        let earlyMinutes = 0;
        const flags: any = {};

        if (earliestCheckIn) {
            status = AttendanceStatus.PRESENT;
            const checkInDate = new Date(earliestCheckIn);

            if (policy) {
                const schoolStart = this.parseTime(policy.school_start_time, date);
                const grace = policy.grace_minutes || 0;
                lateMinutes = Math.max(0, (checkInDate.getTime() - schoolStart.getTime()) / 60000 - grace);
                if (lateMinutes > 0) status = AttendanceStatus.LATE;
            }

            if (earlyLeaves.length > 0) {
                status = AttendanceStatus.EARLY_PICKUP;
            }

            if (!latestCheckOut) {
                flags.missing_checkout = true;
            } else if (policy) {
                const schoolEnd = this.parseTime(policy.school_end_time, date);
                earlyMinutes = Math.max(0, (schoolEnd.getTime() - new Date(latestCheckOut).getTime()) / 60000);
            }
        }

        const dateStr = date.toISOString().split('T')[0];

        let summary = await this.summaryRepo.findOne({
            where: { tenant_id, branch_id, subject_user_id: user_id, date: dateStr },
        });

        const data: Partial<AttendanceDailySummary> = {
            tenant_id,
            branch_id,
            subject_type: SubjectType.LEARNER,
            subject_user_id: user_id,
            date: dateStr,
            earliest_check_in: earliestCheckIn ? new Date(earliestCheckIn).toTimeString().split(' ')[0] : undefined,
            latest_check_out: latestCheckOut ? new Date(latestCheckOut).toTimeString().split(' ')[0] : undefined,
            status,
            late_minutes: Math.round(lateMinutes),
            early_minutes: Math.round(earlyMinutes),
            flags,
            computed_at: new Date(),
        };

        if (summary) {
            Object.assign(summary, data);
        } else {
            summary = this.summaryRepo.create(data);
        }

        return this.summaryRepo.save(summary);
    }

    private async getPolicy(tenant_id: string, branch_id: string): Promise<AttendancePolicy | null> {
        let policy = await this.policyRepo.findOne({
            where: { tenant_id, branch_id, is_active: true },
        });
        if (!policy) {
            policy = await this.policyRepo.findOne({
                where: { tenant_id, branch_id: null as any, is_active: true },
            });
        }
        return policy;
    }

    private parseTime(timeStr: string, referenceDate: Date): Date {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const d = new Date(referenceDate);
        d.setHours(hours, minutes, 0, 0);
        return d;
    }
}
