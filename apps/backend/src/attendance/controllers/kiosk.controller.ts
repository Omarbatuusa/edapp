import { Controller, Post, Get, Body, Req, Query, Param, Patch, Logger } from '@nestjs/common';
import { KioskDeviceService } from '../services/kiosk-device.service';
import { QrTokenService } from '../services/qr-token.service';
import { AttendanceEventService } from '../services/attendance-event.service';
import { KioskScanDto, RegisterDeviceDto } from '../dto/record-event.dto';
import { SubjectType, AttendanceEventType, AttendanceSourceType } from '../entities/attendance-event.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/user.entity';
import { AttendancePolicy } from '../entities/attendance-policy.entity';
import { EarlyLeaveRequest, EarlyLeaveStatus } from '../entities/early-leave-request.entity';
import { v4 as uuidv4 } from 'uuid';

@Controller('attendance/kiosk')
export class KioskController {
    private readonly logger = new Logger(KioskController.name);

    constructor(
        private kioskDeviceService: KioskDeviceService,
        private qrTokenService: QrTokenService,
        private eventService: AttendanceEventService,
        @InjectRepository(User)
        private userRepo: Repository<User>,
        @InjectRepository(AttendancePolicy)
        private policyRepo: Repository<AttendancePolicy>,
        @InjectRepository(EarlyLeaveRequest)
        private earlyLeaveRepo: Repository<EarlyLeaveRequest>,
    ) {}

    @Post('scan')
    async processKioskScan(@Body() dto: KioskScanDto, @Req() req: any) {
        const tenant_id = req.tenant_id;
        if (!tenant_id) {
            return { status: 'error', message: 'Tenant not resolved' };
        }

        // 1. Verify QR token
        let learner_user_id: string;
        try {
            learner_user_id = await this.qrTokenService.verifyToken(tenant_id, dto.qr_token);
        } catch {
            return { status: 'error', message: 'Invalid QR code' };
        }

        // 2. Look up learner
        const user = await this.userRepo.findOne({
            where: { id: learner_user_id },
            select: ['id', 'display_name', 'first_name', 'last_name', 'student_number'],
        });
        if (!user) {
            return { status: 'error', message: 'Learner not found' };
        }

        // 3. Get policy for anti-passback
        let policy = await this.policyRepo.findOne({
            where: { tenant_id, branch_id: dto.branch_id, is_active: true },
        });
        if (!policy) {
            policy = await this.policyRepo.findOne({
                where: { tenant_id, branch_id: null as any, is_active: true },
            });
        }
        const antiPassbackMinutes = policy?.anti_passback_minutes ?? 5;

        // 4. Check anti-passback
        const isRecentScan = await this.eventService.checkAntiPassback(
            tenant_id, learner_user_id, antiPassbackMinutes,
        );
        if (isRecentScan) {
            return {
                status: 'warning',
                message: `Already scanned within ${antiPassbackMinutes} minutes`,
                learner: {
                    id: user.id,
                    name: user.display_name || `${user.first_name || ''} ${user.last_name || ''}`.trim(),
                    student_number: user.student_number,
                },
            };
        }

        // 5. Determine CHECK_IN or CHECK_OUT based on last event today
        const today = new Date();
        const lastEvent = await this.eventService.getLastEventForSubject(tenant_id, learner_user_id, today);
        const eventType = (!lastEvent || lastEvent.event_type === AttendanceEventType.CHECK_OUT)
            ? AttendanceEventType.CHECK_IN
            : AttendanceEventType.CHECK_OUT;

        // 6. If checking out, check early leave approval
        let earlyLeaveInfo: any = null;
        if (eventType === AttendanceEventType.CHECK_OUT) {
            const pendingLeave = await this.earlyLeaveRepo.findOne({
                where: {
                    tenant_id,
                    learner_user_id,
                    status: EarlyLeaveStatus.APPROVED,
                },
                order: { created_at: 'DESC' },
            });
            if (pendingLeave) {
                earlyLeaveInfo = {
                    id: pendingLeave.id,
                    pickup_person_name: pendingLeave.pickup_person_name,
                    pickup_person_relation: pendingLeave.pickup_person_relation,
                    reason: pendingLeave.reason,
                };
            }
        }

        // 7. Record event
        const event = await this.eventService.recordEvent({
            tenant_id,
            branch_id: dto.branch_id,
            subject_type: SubjectType.LEARNER,
            subject_user_id: learner_user_id,
            event_type: eventType,
            source: AttendanceSourceType.KIOSK_SCAN,
            device_id: dto.device_id,
            captured_at_device: dto.captured_at_device || new Date().toISOString(),
            idempotency_key: dto.idempotency_key || uuidv4(),
            is_offline_synced: false,
        });

        // 8. If early leave checkout, complete the request
        if (earlyLeaveInfo) {
            await this.earlyLeaveRepo.update(
                { id: earlyLeaveInfo.id },
                { status: EarlyLeaveStatus.COMPLETED, checkout_event_id: event.id },
            );
        }

        return {
            status: 'success',
            event_type: eventType,
            learner: {
                id: user.id,
                name: user.display_name || `${user.first_name || ''} ${user.last_name || ''}`.trim(),
                student_number: user.student_number,
            },
            early_leave: earlyLeaveInfo,
            event_id: event.id,
            timestamp: event.captured_at_server,
        };
    }

    @Post('device/register')
    async registerDevice(@Body() dto: RegisterDeviceDto, @Req() req: any) {
        const tenant_id = req.tenant_id;
        if (!tenant_id) {
            return { status: 'error', message: 'Tenant not resolved' };
        }
        const device = await this.kioskDeviceService.registerDevice(tenant_id, {
            ...dto,
            registered_by_user_id: req.user?.id,
        });
        return { status: 'success', device };
    }

    @Post('device/heartbeat')
    async heartbeat(@Body() body: { device_id: string }, @Req() req: any) {
        const tenant_id = req.tenant_id;
        if (!tenant_id) {
            return { status: 'error', message: 'Tenant not resolved' };
        }
        await this.kioskDeviceService.heartbeat(tenant_id, body.device_id);
        return { status: 'ok' };
    }

    @Get('devices')
    async listDevices(@Req() req: any, @Query('branch_id') branch_id?: string) {
        const tenant_id = req.tenant_id;
        if (!tenant_id) {
            return { status: 'error', message: 'Tenant not resolved' };
        }
        const devices = await this.kioskDeviceService.listDevices(tenant_id, branch_id);
        return { devices };
    }

    @Patch('device/:id/deactivate')
    async deactivateDevice(@Param('id') id: string, @Req() req: any) {
        const tenant_id = req.tenant_id;
        if (!tenant_id) {
            return { status: 'error', message: 'Tenant not resolved' };
        }
        await this.kioskDeviceService.deactivateDevice(tenant_id, id, req.user?.id);
        return { status: 'success' };
    }
}
