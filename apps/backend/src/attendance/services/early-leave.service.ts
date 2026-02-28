import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EarlyLeaveRequest, EarlyLeaveStatus } from '../entities/early-leave-request.entity';
import { AttendanceAlertService } from './attendance-alert.service';
import { AuditService } from '../../audit/audit.service';

export class CreateEarlyLeaveDto {
    branch_id: string;
    learner_user_id: string;
    reason: string;
    pickup_person_name: string;
    pickup_person_relation: string;
    pickup_person_id_number?: string;
    notes?: string;
}

@Injectable()
export class EarlyLeaveService {
    private readonly logger = new Logger(EarlyLeaveService.name);

    constructor(
        @InjectRepository(EarlyLeaveRequest)
        private earlyLeaveRepo: Repository<EarlyLeaveRequest>,
        private alertService: AttendanceAlertService,
        private auditService: AuditService,
    ) {}

    async createRequest(
        tenant_id: string,
        requested_by_user_id: string,
        dto: CreateEarlyLeaveDto,
    ): Promise<EarlyLeaveRequest> {
        const request = this.earlyLeaveRepo.create({
            tenant_id,
            branch_id: dto.branch_id,
            learner_user_id: dto.learner_user_id,
            requested_by_user_id,
            reason: dto.reason,
            pickup_person_name: dto.pickup_person_name,
            pickup_person_relation: dto.pickup_person_relation,
            pickup_person_id_number: dto.pickup_person_id_number,
            notes: dto.notes,
            status: EarlyLeaveStatus.PENDING,
        });

        const saved = await this.earlyLeaveRepo.save(request);

        await this.auditService.log({
            action: 'early_leave_requested',
            tenantId: tenant_id,
            userId: requested_by_user_id,
            metadata: {
                request_id: saved.id,
                learner_user_id: dto.learner_user_id,
                pickup_person: dto.pickup_person_name,
            },
        });

        return saved;
    }

    async approveRequest(
        tenant_id: string,
        request_id: string,
        approved_by_user_id: string,
    ): Promise<EarlyLeaveRequest> {
        const request = await this.earlyLeaveRepo.findOne({
            where: { id: request_id, tenant_id },
        });

        if (!request) throw new NotFoundException('Early leave request not found');
        if (request.status !== EarlyLeaveStatus.PENDING) {
            throw new BadRequestException(`Request is already ${request.status}`);
        }

        request.status = EarlyLeaveStatus.APPROVED;
        request.approved_by_user_id = approved_by_user_id;
        request.approved_at = new Date();

        const saved = await this.earlyLeaveRepo.save(request);

        // Notify gate/reception
        await this.alertService.handleEarlyLeaveApproved(
            tenant_id,
            request.branch_id,
            request.learner_user_id,
            request.pickup_person_name,
        );

        await this.auditService.log({
            action: 'early_leave_approved',
            tenantId: tenant_id,
            userId: approved_by_user_id,
            metadata: { request_id, learner_user_id: request.learner_user_id },
        });

        return saved;
    }

    async rejectRequest(
        tenant_id: string,
        request_id: string,
        rejected_by_user_id: string,
        reason: string,
    ): Promise<EarlyLeaveRequest> {
        const request = await this.earlyLeaveRepo.findOne({
            where: { id: request_id, tenant_id },
        });

        if (!request) throw new NotFoundException('Early leave request not found');
        if (request.status !== EarlyLeaveStatus.PENDING) {
            throw new BadRequestException(`Request is already ${request.status}`);
        }

        request.status = EarlyLeaveStatus.REJECTED;
        request.rejected_reason = reason;

        const saved = await this.earlyLeaveRepo.save(request);

        await this.auditService.log({
            action: 'early_leave_rejected',
            tenantId: tenant_id,
            userId: rejected_by_user_id,
            metadata: { request_id, reason },
        });

        return saved;
    }

    async completePickup(
        tenant_id: string,
        request_id: string,
        checkout_event_id: string,
    ): Promise<EarlyLeaveRequest> {
        const request = await this.earlyLeaveRepo.findOne({
            where: { id: request_id, tenant_id },
        });

        if (!request) throw new NotFoundException('Early leave request not found');
        if (request.status !== EarlyLeaveStatus.APPROVED) {
            throw new BadRequestException('Request must be approved before completing');
        }

        request.status = EarlyLeaveStatus.COMPLETED;
        request.checkout_event_id = checkout_event_id;

        return this.earlyLeaveRepo.save(request);
    }

    async listRequests(
        tenant_id: string,
        branch_id?: string,
        status?: EarlyLeaveStatus,
        date?: string,
    ): Promise<EarlyLeaveRequest[]> {
        const where: any = { tenant_id };
        if (branch_id) where.branch_id = branch_id;
        if (status) where.status = status;

        return this.earlyLeaveRepo.find({
            where,
            order: { created_at: 'DESC' },
            take: 100,
        });
    }
}
