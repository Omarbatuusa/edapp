import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { AttendanceEventService } from './attendance-event.service';
import { AttendanceAlertService } from './attendance-alert.service';
import { AttendanceEvent, SubjectType, AttendanceEventType, AttendanceSourceType } from '../entities/attendance-event.entity';
import { AttendanceDailySummary, AttendanceStatus } from '../entities/attendance-daily-summary.entity';
import { AttendancePolicy } from '../entities/attendance-policy.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StaffAttendanceService {
    private readonly logger = new Logger(StaffAttendanceService.name);

    constructor(
        private eventService: AttendanceEventService,
        private alertService: AttendanceAlertService,
        @InjectRepository(AttendanceDailySummary)
        private summaryRepo: Repository<AttendanceDailySummary>,
        @InjectRepository(AttendancePolicy)
        private policyRepo: Repository<AttendancePolicy>,
    ) {}

    async checkIn(
        tenant_id: string,
        branch_id: string,
        user_id: string,
        source: AttendanceSourceType,
        geo?: { lat: number; lng: number; accuracy: number },
        device_id?: string,
        idempotency_key?: string,
    ): Promise<{ event: AttendanceEvent; summary: any }> {
        const event = await this.eventService.recordEvent({
            tenant_id,
            branch_id,
            subject_type: SubjectType.STAFF,
            subject_user_id: user_id,
            event_type: AttendanceEventType.CHECK_IN,
            source,
            device_id,
            captured_at_device: new Date().toISOString(),
            captured_lat: geo?.lat,
            captured_lng: geo?.lng,
            captured_accuracy_m: geo?.accuracy,
            idempotency_key: idempotency_key || uuidv4(),
        });

        // Compute and check late
        const policy = await this.getPolicy(tenant_id, branch_id);
        const checkInTime = new Date(event.captured_at_server);
        const summary = this.computeCheckInSummary(checkInTime, policy);

        // Send late alert if applicable
        if (summary.late_minutes > 0) {
            await this.alertService.handleStaffLate(tenant_id, branch_id, user_id, summary.late_minutes);
        }

        return { event, summary };
    }

    async checkOut(
        tenant_id: string,
        branch_id: string,
        user_id: string,
        source: AttendanceSourceType,
        geo?: { lat: number; lng: number; accuracy: number },
        device_id?: string,
        idempotency_key?: string,
    ): Promise<{ event: AttendanceEvent; summary: any }> {
        const event = await this.eventService.recordEvent({
            tenant_id,
            branch_id,
            subject_type: SubjectType.STAFF,
            subject_user_id: user_id,
            event_type: AttendanceEventType.CHECK_OUT,
            source,
            device_id,
            captured_at_device: new Date().toISOString(),
            captured_lat: geo?.lat,
            captured_lng: geo?.lng,
            captured_accuracy_m: geo?.accuracy,
            idempotency_key: idempotency_key || uuidv4(),
        });

        // Recompute daily summary
        const dailySummary = await this.computeAndStoreDailySummary(tenant_id, branch_id, user_id, new Date());

        return { event, summary: dailySummary };
    }

    async getStaffToday(tenant_id: string, branch_id: string, user_id: string) {
        const today = new Date();
        const startOfDay = new Date(today);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);

        const events = await this.eventService.getEventsForSubject(tenant_id, user_id, startOfDay, endOfDay);

        const checkIn = events.find(e => e.event_type === AttendanceEventType.CHECK_IN);
        const checkOut = events.filter(e => e.event_type === AttendanceEventType.CHECK_OUT).pop();

        const policy = await this.getPolicy(tenant_id, branch_id);
        let hoursWorked = 0;
        let lateMinutes = 0;
        let earlyMinutes = 0;
        let overtimeMinutes = 0;

        if (checkIn) {
            const checkInTime = new Date(checkIn.captured_at_server);
            const endTime = checkOut ? new Date(checkOut.captured_at_server) : new Date();
            hoursWorked = (endTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);

            if (policy) {
                const shiftStart = this.parseTime(policy.staff_shift_start, today);
                const shiftEnd = this.parseTime(policy.staff_shift_end, today);
                const grace = policy.grace_minutes || 0;
                const otGrace = policy.overtime_grace_minutes || 0;

                lateMinutes = Math.max(0, (checkInTime.getTime() - shiftStart.getTime()) / 60000 - grace);
                if (checkOut) {
                    earlyMinutes = Math.max(0, (shiftEnd.getTime() - new Date(checkOut.captured_at_server).getTime()) / 60000);
                    overtimeMinutes = Math.max(0, (new Date(checkOut.captured_at_server).getTime() - shiftEnd.getTime()) / 60000 - otGrace);
                }
            }
        }

        return {
            checked_in: !!checkIn && !checkOut,
            check_in_time: checkIn?.captured_at_server || null,
            check_out_time: checkOut?.captured_at_server || null,
            hours_worked: Math.round(hoursWorked * 100) / 100,
            late_minutes: Math.round(lateMinutes),
            early_minutes: Math.round(earlyMinutes),
            overtime_minutes: Math.round(overtimeMinutes),
            events_count: events.length,
        };
    }

    async computeAndStoreDailySummary(
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

        const earliestCheckIn = checkIns[0]?.captured_at_server;
        const latestCheckOut = checkOuts[checkOuts.length - 1]?.captured_at_server;

        let status = AttendanceStatus.ABSENT;
        let lateMinutes = 0;
        let earlyMinutes = 0;
        let overtimeMinutes = 0;
        let totalHours = 0;
        const flags: any = {};

        if (earliestCheckIn) {
            status = AttendanceStatus.PRESENT;
            const checkInDate = new Date(earliestCheckIn);

            if (policy) {
                const shiftStart = this.parseTime(policy.staff_shift_start, date);
                const grace = policy.grace_minutes || 0;
                lateMinutes = Math.max(0, (checkInDate.getTime() - shiftStart.getTime()) / 60000 - grace);
                if (lateMinutes > 0) status = AttendanceStatus.LATE;
            }

            if (latestCheckOut) {
                totalHours = (new Date(latestCheckOut).getTime() - checkInDate.getTime()) / 3600000;
                if (policy) {
                    const shiftEnd = this.parseTime(policy.staff_shift_end, date);
                    const otGrace = policy.overtime_grace_minutes || 0;
                    earlyMinutes = Math.max(0, (shiftEnd.getTime() - new Date(latestCheckOut).getTime()) / 60000);
                    overtimeMinutes = Math.max(0, (new Date(latestCheckOut).getTime() - shiftEnd.getTime()) / 60000 - otGrace);
                    if (earlyMinutes > 0) earlyMinutes = Math.round(earlyMinutes);
                    if (overtimeMinutes < 0) overtimeMinutes = 0;
                }
            } else {
                flags.missing_checkout = true;
            }
        }

        const dateStr = date.toISOString().split('T')[0];

        let summary = await this.summaryRepo.findOne({
            where: { tenant_id, branch_id, subject_user_id: user_id, date: dateStr },
        });

        const data: Partial<AttendanceDailySummary> = {
            tenant_id,
            branch_id,
            subject_type: SubjectType.STAFF,
            subject_user_id: user_id,
            date: dateStr,
            earliest_check_in: earliestCheckIn ? new Date(earliestCheckIn).toTimeString().split(' ')[0] : undefined,
            latest_check_out: latestCheckOut ? new Date(latestCheckOut).toTimeString().split(' ')[0] : undefined,
            status,
            late_minutes: Math.round(lateMinutes),
            early_minutes: Math.round(earlyMinutes),
            overtime_minutes: Math.round(overtimeMinutes),
            total_hours_worked: Math.round(totalHours * 100) / 100,
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

    private computeCheckInSummary(checkInTime: Date, policy: AttendancePolicy | null) {
        let lateMinutes = 0;
        if (policy) {
            const shiftStart = this.parseTime(policy.staff_shift_start, checkInTime);
            const grace = policy.grace_minutes || 0;
            lateMinutes = Math.max(0, (checkInTime.getTime() - shiftStart.getTime()) / 60000 - grace);
        }
        return {
            late_minutes: Math.round(lateMinutes),
            status: lateMinutes > 0 ? 'LATE' : 'ON_TIME',
        };
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
