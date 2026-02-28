import { Injectable, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { AttendanceEvent } from '../entities/attendance-event.entity';
import { RecordEventDto } from '../dto/record-event.dto';
import { AuditService } from '../../audit/audit.service';

@Injectable()
export class AttendanceEventService {
    private readonly logger = new Logger(AttendanceEventService.name);

    constructor(
        @InjectRepository(AttendanceEvent)
        private eventRepo: Repository<AttendanceEvent>,
        private auditService: AuditService,
    ) {}

    async recordEvent(dto: RecordEventDto): Promise<AttendanceEvent> {
        // Idempotency check
        const existing = await this.eventRepo.findOne({
            where: { idempotency_key: dto.idempotency_key },
        });
        if (existing) {
            this.logger.debug(`Duplicate event skipped: ${dto.idempotency_key}`);
            return existing;
        }

        const event = this.eventRepo.create({
            ...dto,
            captured_at_device: new Date(dto.captured_at_device),
            captured_at_server: new Date(),
            policy_decision: 'ALLOW' as any,
        });

        const saved = await this.eventRepo.save(event);

        this.logger.log(`Event recorded: ${saved.event_type} for ${saved.subject_user_id} at ${saved.branch_id}`);
        return saved;
    }

    async recordBatch(dtos: RecordEventDto[]): Promise<{ results: { idempotency_key: string; status: 'created' | 'duplicate'; event_id: string }[] }> {
        const results: { idempotency_key: string; status: 'created' | 'duplicate'; event_id: string }[] = [];

        for (const dto of dtos) {
            try {
                const event = await this.recordEvent(dto);
                const isDuplicate = event.idempotency_key === dto.idempotency_key &&
                    event.captured_at_server < new Date(Date.now() - 1000);
                results.push({
                    idempotency_key: dto.idempotency_key,
                    status: isDuplicate ? 'duplicate' : 'created',
                    event_id: event.id,
                });
            } catch (error) {
                this.logger.error(`Failed to record event ${dto.idempotency_key}: ${error.message}`);
                results.push({
                    idempotency_key: dto.idempotency_key,
                    status: 'duplicate',
                    event_id: '',
                });
            }
        }

        return { results };
    }

    async getEventsForSubject(
        tenant_id: string,
        subject_user_id: string,
        startDate: Date,
        endDate: Date,
    ): Promise<AttendanceEvent[]> {
        return this.eventRepo.find({
            where: {
                tenant_id,
                subject_user_id,
                captured_at_server: Between(startDate, endDate),
            },
            order: { captured_at_server: 'ASC' },
        });
    }

    async getEventsForBranch(
        tenant_id: string,
        branch_id: string,
        date: Date,
    ): Promise<AttendanceEvent[]> {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        return this.eventRepo.find({
            where: {
                tenant_id,
                branch_id,
                captured_at_server: Between(startOfDay, endOfDay),
            },
            order: { captured_at_server: 'ASC' },
        });
    }

    async getLastEventForSubject(
        tenant_id: string,
        subject_user_id: string,
        date: Date,
    ): Promise<AttendanceEvent | null> {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        return this.eventRepo.findOne({
            where: {
                tenant_id,
                subject_user_id,
                captured_at_server: Between(startOfDay, endOfDay),
            },
            order: { captured_at_server: 'DESC' },
        });
    }

    async checkAntiPassback(
        tenant_id: string,
        subject_user_id: string,
        antiPassbackMinutes: number,
    ): Promise<boolean> {
        const since = new Date(Date.now() - antiPassbackMinutes * 60 * 1000);
        const recentEvent = await this.eventRepo.findOne({
            where: {
                tenant_id,
                subject_user_id,
                captured_at_server: MoreThanOrEqual(since),
            },
            order: { captured_at_server: 'DESC' },
        });
        return !!recentEvent;
    }
}
