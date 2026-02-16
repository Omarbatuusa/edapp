import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TicketAction, TicketActionType, TicketActionStatus } from './ticket-action.entity';
import { ThreadMember } from './thread-member.entity';
import { AuditService } from '../audit/audit.service';

// ============================================================
// TICKET ACTIONS SERVICE - Workflow actions on tickets
// ============================================================

export interface CreateTicketActionDto {
    thread_id: string;
    action_type: TicketActionType;
    title: string;
    description?: string;
    assigned_to?: string;
    due_at?: Date;
    metadata?: Record<string, any>;
}

@Injectable()
export class TicketActionsService {
    constructor(
        @InjectRepository(TicketAction)
        private actionRepo: Repository<TicketAction>,
        @InjectRepository(ThreadMember)
        private memberRepo: Repository<ThreadMember>,
        private readonly auditService: AuditService,
    ) { }

    // Create a new ticket action
    async createAction(dto: CreateTicketActionDto): Promise<TicketAction> {
        const action = this.actionRepo.create(dto);
        return this.actionRepo.save(action);
    }

    // Complete a ticket action
    async completeAction(action_id: string, user_id: string): Promise<TicketAction> {
        const action = await this.actionRepo.findOne({ where: { id: action_id } });
        if (!action) throw new NotFoundException('Action not found');

        action.status = TicketActionStatus.COMPLETED;
        action.completed_at = new Date();

        const saved = await this.actionRepo.save(action);

        await this.auditService.log({
            action: 'ticket_action.complete',
            userId: user_id,
            metadata: { action_id, thread_id: action.thread_id, action_type: action.action_type },
        });

        return saved;
    }

    // Get actions for a specific thread
    async getThreadActions(thread_id: string): Promise<TicketAction[]> {
        return this.actionRepo.find({
            where: { thread_id },
            order: { created_at: 'DESC' },
        });
    }

    // Get all pending actions assigned to a user across a tenant
    async getPendingActions(tenant_id: string, user_id: string): Promise<TicketAction[]> {
        return this.actionRepo
            .createQueryBuilder('action')
            .innerJoin('threads', 'thread', 'thread.id = action.thread_id')
            .where('thread.tenant_id = :tenant_id', { tenant_id })
            .andWhere('action.assigned_to = :user_id', { user_id })
            .andWhere('action.status = :status', { status: TicketActionStatus.PENDING })
            .orderBy('action.due_at', 'ASC', 'NULLS LAST')
            .getMany();
    }
}
