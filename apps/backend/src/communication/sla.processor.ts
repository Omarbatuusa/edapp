import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, In } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue, Job } from 'bullmq';
import { Thread, ThreadType, TicketStatus } from './thread.entity';
import { Notification, NotificationType, NotificationUrgency } from './notification.entity';
import { ThreadMember } from './thread-member.entity';
import { ChatGateway } from './chat.gateway';

// ============================================================
// SLA PROCESSOR - Background job for SLA monitoring
// Runs every 15 minutes, checks for SLA breaches
// ============================================================

@Injectable()
@Processor('sla-monitor')
export class SlaProcessor extends WorkerHost implements OnModuleInit {
    constructor(
        @InjectRepository(Thread)
        private threadRepo: Repository<Thread>,
        @InjectRepository(Notification)
        private notificationRepo: Repository<Notification>,
        @InjectRepository(ThreadMember)
        private memberRepo: Repository<ThreadMember>,
        @InjectQueue('sla-monitor')
        private slaQueue: Queue,
        private chatGateway: ChatGateway,
    ) {
        super();
    }

    async onModuleInit() {
        // Register repeatable job: every 15 minutes
        await this.slaQueue.add(
            'check-sla',
            {},
            {
                repeat: { every: 15 * 60 * 1000 },
                removeOnComplete: true,
                removeOnFail: 5,
            },
        );
    }

    async process(job: Job): Promise<void> {
        if (job.name !== 'check-sla') return;

        const now = new Date();

        // Find open/pending tickets with breached SLAs
        // SLA is computed from ticket_priority:
        //   P4 (urgent) -> 4h, P3 (high) -> 8h, P2 (medium) -> 24h, P1 (low) -> 48h
        // We check if created_at + SLA window < NOW and ticket is still open/pending

        const tickets = await this.threadRepo
            .createQueryBuilder('thread')
            .where('thread.type = :type', { type: ThreadType.TICKET })
            .andWhere('thread.ticket_status IN (:...statuses)', {
                statuses: [TicketStatus.OPEN, TicketStatus.PENDING],
            })
            .andWhere('thread.is_archived = false')
            .getMany();

        for (const ticket of tickets) {
            const slaHours = this.getSlaHours(ticket.ticket_priority);
            const slaDeadline = new Date(ticket.created_at.getTime() + slaHours * 60 * 60 * 1000);

            if (now > slaDeadline) {
                // SLA breached — notify assigned staff
                const members = await this.memberRepo.find({
                    where: { thread_id: ticket.id, has_left: false },
                    select: ['user_id'],
                });

                for (const member of members) {
                    // Check if we already sent a notification for this breach
                    const existing = await this.notificationRepo.findOne({
                        where: {
                            reference_type: 'sla_breach',
                            reference_id: ticket.id,
                            user_id: member.user_id,
                        },
                    });

                    if (!existing) {
                        await this.notificationRepo.save(
                            this.notificationRepo.create({
                                tenant_id: ticket.tenant_id,
                                user_id: member.user_id,
                                type: NotificationType.TICKET_UPDATE,
                                urgency: NotificationUrgency.URGENT,
                                title: `SLA Breach: ${ticket.title || 'Support Ticket'}`,
                                body: `This ticket has exceeded its ${slaHours}h SLA target.`,
                                reference_type: 'sla_breach',
                                reference_id: ticket.id,
                                action: {
                                    type: 'navigate',
                                    target: `/chat`,
                                    params: { thread_id: ticket.id },
                                },
                            }),
                        );

                        // Real-time alert
                        this.chatGateway.broadcastToUser(member.user_id, 'ticket:sla_warning', {
                            thread_id: ticket.id,
                            title: ticket.title,
                            sla_hours: slaHours,
                        });
                    }
                }
            }
        }
    }

    private getSlaHours(priority?: number): number {
        switch (priority) {
            case 4: return 4;   // Urgent
            case 3: return 8;   // High
            case 2: return 24;  // Medium
            case 1: return 48;  // Low
            default: return 24; // Default: medium
        }
    }
}
