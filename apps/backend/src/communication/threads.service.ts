import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Thread, ThreadType, TicketCategory, TicketStatus } from './thread.entity';
import { ThreadMember, MemberRole, MemberPermission } from './thread-member.entity';

// ============================================================
// THREADS SERVICE - Thread management
// ============================================================

export interface CreateThreadDto {
    tenant_id: string;
    type: ThreadType;
    title?: string;
    description?: string;
    created_by: string;
    members: { user_id: string; role?: MemberRole }[];
    // For tickets
    ticket_category?: TicketCategory;
    // For groups
    context?: {
        grade_id?: string;
        class_id?: string;
        subject_id?: string;
    };
    // For announcements
    requires_ack?: boolean;
    ack_deadline?: Date;
}

export interface ThreadWithMeta extends Thread {
    unread_count?: number;
    last_message_sender_name?: string;
}

@Injectable()
export class ThreadsService {
    constructor(
        @InjectRepository(Thread)
        private threadRepo: Repository<Thread>,
        @InjectRepository(ThreadMember)
        private memberRepo: Repository<ThreadMember>,
    ) { }

    // ============================================
    // CREATE THREAD
    // ============================================

    async createThread(dto: CreateThreadDto): Promise<Thread> {
        // Create thread
        const thread = this.threadRepo.create({
            tenant_id: dto.tenant_id,
            type: dto.type,
            title: dto.title,
            description: dto.description,
            created_by: dto.created_by,
            requires_ack: dto.requires_ack || false,
            ack_deadline: dto.ack_deadline,
            ticket_category: dto.ticket_category,
            ticket_status: dto.type === ThreadType.TICKET ? TicketStatus.OPEN : undefined,
            context: dto.context,
        });

        const savedThread = await this.threadRepo.save(thread);

        // Add members
        const members = dto.members.map(m => this.memberRepo.create({
            thread_id: savedThread.id,
            user_id: m.user_id,
            role: m.role || (m.user_id === dto.created_by ? MemberRole.OWNER : MemberRole.MEMBER),
            permission: MemberPermission.FULL,
        }));

        await this.memberRepo.save(members);

        return savedThread;
    }

    // ============================================
    // GET USER'S THREADS (Inbox)
    // ============================================

    async getUserThreads(
        tenant_id: string,
        user_id: string,
        filters?: {
            type?: ThreadType;
            unread_only?: boolean;
            search?: string;
        }
    ): Promise<ThreadWithMeta[]> {
        // Get user's memberships
        const memberships = await this.memberRepo.find({
            where: {
                user_id,
                has_left: false,
            },
            select: ['thread_id', 'last_read_at', 'is_pinned', 'is_muted', 'has_acknowledged'],
        });

        if (memberships.length === 0) return [];

        const threadIds = memberships.map(m => m.thread_id);

        // Build query
        const query = this.threadRepo.createQueryBuilder('thread')
            .where('thread.id IN (:...threadIds)', { threadIds })
            .andWhere('thread.tenant_id = :tenant_id', { tenant_id })
            .andWhere('thread.is_archived = false');

        if (filters?.type) {
            query.andWhere('thread.type = :type', { type: filters.type });
        }

        if (filters?.search) {
            query.andWhere('(thread.title ILIKE :search OR thread.last_message_content ILIKE :search)', {
                search: `%${filters.search}%`
            });
        }

        query.orderBy('thread.last_message_at', 'DESC', 'NULLS LAST');

        const threads = await query.getMany();

        // Add member metadata
        const memberMap = new Map(memberships.map(m => [m.thread_id, m]));

        return threads.map(thread => ({
            ...thread,
            is_pinned: memberMap.get(thread.id)?.is_pinned || false,
            is_muted: memberMap.get(thread.id)?.is_muted || false,
            has_acknowledged: memberMap.get(thread.id)?.has_acknowledged || false,
        })) as ThreadWithMeta[];
    }

    // ============================================
    // GET SINGLE THREAD WITH AUTH CHECK
    // ============================================

    async getThread(thread_id: string, user_id: string, tenant_id: string): Promise<Thread> {
        const thread = await this.threadRepo.findOne({
            where: { id: thread_id, tenant_id },
        });

        if (!thread) {
            throw new NotFoundException('Thread not found');
        }

        // Check membership
        const membership = await this.memberRepo.findOne({
            where: { thread_id, user_id, has_left: false },
        });

        if (!membership) {
            throw new ForbiddenException('Not a member of this thread');
        }

        return thread;
    }

    // ============================================
    // GET THREAD MEMBERS
    // ============================================

    async getThreadMembers(thread_id: string): Promise<ThreadMember[]> {
        return this.memberRepo.find({
            where: { thread_id, has_left: false },
            relations: ['user'],
        });
    }

    // ============================================
    // ADD MEMBER TO THREAD
    // ============================================

    async addMember(
        thread_id: string,
        user_id: string,
        added_by: string,
        role: MemberRole = MemberRole.MEMBER
    ): Promise<ThreadMember> {
        // Check if already a member
        const existing = await this.memberRepo.findOne({
            where: { thread_id, user_id },
        });

        if (existing) {
            if (existing.has_left) {
                existing.has_left = false;
                existing.left_at = undefined as unknown as Date;
                return this.memberRepo.save(existing);
            }
            throw new ForbiddenException('User is already a member');
        }

        const member = this.memberRepo.create({
            thread_id,
            user_id,
            role,
            permission: MemberPermission.FULL,
        });

        return this.memberRepo.save(member);
    }

    // ============================================
    // UPDATE TICKET STATUS
    // ============================================

    async updateTicketStatus(
        thread_id: string,
        status: TicketStatus,
        user_id: string
    ): Promise<Thread> {
        const thread = await this.threadRepo.findOne({
            where: { id: thread_id, type: ThreadType.TICKET },
        });

        if (!thread) {
            throw new NotFoundException('Ticket not found');
        }

        thread.ticket_status = status;
        return this.threadRepo.save(thread);
    }

    // ============================================
    // ACKNOWLEDGE ANNOUNCEMENT
    // ============================================

    async acknowledgeAnnouncement(
        thread_id: string,
        user_id: string
    ): Promise<ThreadMember> {
        const membership = await this.memberRepo.findOne({
            where: { thread_id, user_id },
        });

        if (!membership) {
            throw new NotFoundException('Not a member of this thread');
        }

        membership.has_acknowledged = true;
        membership.acknowledged_at = new Date();

        return this.memberRepo.save(membership);
    }

    // ============================================
    // MARK THREAD AS READ
    // ============================================

    async markAsRead(
        thread_id: string,
        user_id: string,
        message_id?: string
    ): Promise<void> {
        await this.memberRepo.update(
            { thread_id, user_id },
            {
                last_read_at: new Date(),
                last_read_message_id: message_id,
            }
        );
    }

    // ============================================
    // FIND OR CREATE DM THREAD
    // ============================================

    async findOrCreateDM(
        tenant_id: string,
        user1_id: string,
        user2_id: string
    ): Promise<Thread> {
        // Find existing DM between these two users
        const existingMemberships = await this.memberRepo
            .createQueryBuilder('m1')
            .innerJoin('thread_members', 'm2', 'm1.thread_id = m2.thread_id')
            .innerJoin('threads', 't', 't.id = m1.thread_id')
            .where('m1.user_id = :user1_id', { user1_id })
            .andWhere('m2.user_id = :user2_id', { user2_id })
            .andWhere('t.type = :type', { type: ThreadType.DM })
            .andWhere('t.tenant_id = :tenant_id', { tenant_id })
            .select('m1.thread_id')
            .getRawOne();

        if (existingMemberships) {
            const thread = await this.threadRepo.findOne({
                where: { id: existingMemberships.thread_id },
            });
            if (thread) return thread;
        }

        // Create new DM thread
        return this.createThread({
            tenant_id,
            type: ThreadType.DM,
            created_by: user1_id,
            members: [
                { user_id: user1_id },
                { user_id: user2_id }
            ],
        });
    }
}
