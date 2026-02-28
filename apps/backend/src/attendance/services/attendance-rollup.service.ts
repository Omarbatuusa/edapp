import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AttendanceDailySummary } from '../entities/attendance-daily-summary.entity';
import { AttendanceWeeklySummary } from '../entities/attendance-weekly-summary.entity';
import { SubjectType } from '../entities/attendance-event.entity';
import { StaffAttendanceService } from './staff-attendance.service';
import { LearnerAttendanceService } from './learner-attendance.service';
import { AttendanceAlertService } from './attendance-alert.service';
import { RoleAssignment, UserRole } from '../../users/role-assignment.entity';
import { AttendancePolicy } from '../entities/attendance-policy.entity';
import { Branch } from '../../branches/branch.entity';

@Injectable()
export class AttendanceRollupService {
    private readonly logger = new Logger(AttendanceRollupService.name);

    constructor(
        private staffService: StaffAttendanceService,
        private learnerService: LearnerAttendanceService,
        private alertService: AttendanceAlertService,
        @InjectRepository(AttendanceDailySummary)
        private dailySummaryRepo: Repository<AttendanceDailySummary>,
        @InjectRepository(AttendanceWeeklySummary)
        private weeklySummaryRepo: Repository<AttendanceWeeklySummary>,
        @InjectRepository(RoleAssignment)
        private roleRepo: Repository<RoleAssignment>,
        @InjectRepository(AttendancePolicy)
        private policyRepo: Repository<AttendancePolicy>,
        @InjectRepository(Branch)
        private branchRepo: Repository<Branch>,
    ) {}

    // Run nightly at midnight to compute daily summaries for previous day
    @Cron('0 0 * * *')
    async nightlyDailyRollup(): Promise<void> {
        this.logger.log('Starting nightly daily rollup...');
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const policies = await this.policyRepo.find({ where: { is_active: true } });

        for (const policy of policies) {
            try {
                await this.computeDailyRollupForPolicy(policy, yesterday);
            } catch (error) {
                this.logger.error(`Daily rollup failed for policy ${policy.id}: ${error.message}`);
            }
        }

        this.logger.log('Nightly daily rollup completed');
    }

    // Run weekly on Monday at 1 AM
    @Cron('0 1 * * 1')
    async weeklyRollup(): Promise<void> {
        this.logger.log('Starting weekly rollup...');
        const lastWeekStart = new Date();
        lastWeekStart.setDate(lastWeekStart.getDate() - 7);
        // Adjust to Monday
        const day = lastWeekStart.getDay();
        const diff = lastWeekStart.getDate() - day + (day === 0 ? -6 : 1);
        lastWeekStart.setDate(diff);
        lastWeekStart.setHours(0, 0, 0, 0);

        const lastWeekEnd = new Date(lastWeekStart);
        lastWeekEnd.setDate(lastWeekEnd.getDate() + 4); // Friday

        const policies = await this.policyRepo.find({ where: { is_active: true } });

        for (const policy of policies) {
            try {
                await this.computeWeeklyRollupForPolicy(
                    policy,
                    lastWeekStart.toISOString().split('T')[0],
                    lastWeekEnd.toISOString().split('T')[0],
                );
            } catch (error) {
                this.logger.error(`Weekly rollup failed for policy ${policy.id}: ${error.message}`);
            }
        }

        this.logger.log('Weekly rollup completed');
    }

    private async computeDailyRollupForPolicy(policy: AttendancePolicy, date: Date): Promise<void> {
        const tenant_id = policy.tenant_id;
        const branch_id = policy.branch_id;

        // Get all staff and learners for this tenant
        const staffRoles = await this.roleRepo.find({
            where: { tenant_id, role: UserRole.STAFF, is_active: true },
        });
        const learnerRoles = await this.roleRepo.find({
            where: { tenant_id, role: UserRole.LEARNER, is_active: true },
        });

        const branches = branch_id
            ? [{ id: branch_id }]
            : await this.branchRepo.find({ where: { tenant_id } });

        for (const branch of branches) {
            for (const role of staffRoles) {
                try {
                    const summary = await this.staffService.computeAndStoreDailySummary(
                        tenant_id, branch.id, role.user_id, date,
                    );
                    // Check for missing checkout
                    if (summary.flags?.missing_checkout) {
                        await this.alertService.handleMissingCheckout(tenant_id, branch.id, role.user_id);
                    }
                } catch (e) {
                    this.logger.error(`Staff daily rollup failed: ${e.message}`);
                }
            }

            for (const role of learnerRoles) {
                try {
                    await this.learnerService.computeAndStoreLearnerDailySummary(
                        tenant_id, branch.id, role.user_id, date,
                    );
                } catch (e) {
                    this.logger.error(`Learner daily rollup failed: ${e.message}`);
                }
            }
        }
    }

    private async computeWeeklyRollupForPolicy(
        policy: AttendancePolicy,
        weekStart: string,
        weekEnd: string,
    ): Promise<void> {
        const tenant_id = policy.tenant_id;
        const branch_id = policy.branch_id;

        const branches = branch_id
            ? [{ id: branch_id }]
            : await this.branchRepo.find({ where: { tenant_id } });

        for (const branch of branches) {
            // Get all daily summaries for this week
            const dailySummaries = await this.dailySummaryRepo
                .createQueryBuilder('ds')
                .where('ds.tenant_id = :tenant_id', { tenant_id })
                .andWhere('ds.branch_id = :branch_id', { branch_id: branch.id })
                .andWhere('ds.date >= :weekStart', { weekStart })
                .andWhere('ds.date <= :weekEnd', { weekEnd })
                .getMany();

            // Group by user
            const grouped = new Map<string, AttendanceDailySummary[]>();
            for (const ds of dailySummaries) {
                const key = ds.subject_user_id;
                if (!grouped.has(key)) grouped.set(key, []);
                grouped.get(key)!.push(ds);
            }

            for (const [user_id, userSummaries] of grouped) {
                const weekly: Partial<AttendanceWeeklySummary> = {
                    tenant_id,
                    branch_id: branch.id,
                    subject_type: userSummaries[0].subject_type,
                    subject_user_id: user_id,
                    week_start: weekStart,
                    week_end: weekEnd,
                    days_present: userSummaries.filter(s => s.status === 'PRESENT' || s.status === 'LATE').length,
                    days_absent: userSummaries.filter(s => s.status === 'ABSENT').length,
                    days_late: userSummaries.filter(s => s.status === 'LATE').length,
                    days_excused: userSummaries.filter(s => s.status === 'EXCUSED').length,
                    total_late_minutes: userSummaries.reduce((sum, s) => sum + (s.late_minutes || 0), 0),
                    total_early_minutes: userSummaries.reduce((sum, s) => sum + (s.early_minutes || 0), 0),
                    total_overtime_minutes: userSummaries.reduce((sum, s) => sum + (s.overtime_minutes || 0), 0),
                    total_hours_worked: userSummaries.reduce((sum, s) => sum + Number(s.total_hours_worked || 0), 0),
                    exception_flags: {
                        missing_checkouts: userSummaries.filter(s => s.flags?.missing_checkout).length,
                        overrides: userSummaries.filter(s => s.flags?.overridden).length,
                    },
                    computed_at: new Date(),
                };

                let existing = await this.weeklySummaryRepo.findOne({
                    where: { tenant_id, branch_id: branch.id, subject_user_id: user_id, week_start: weekStart },
                });

                if (existing) {
                    Object.assign(existing, weekly);
                    await this.weeklySummaryRepo.save(existing);
                } else {
                    await this.weeklySummaryRepo.save(this.weeklySummaryRepo.create(weekly));
                }
            }
        }
    }
}
