import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnnouncementRead } from './announcement-read.entity';
import { AnnouncementReaction } from './announcement-reaction.entity';
import { Thread, ThreadType } from './thread.entity';
import { ThreadMember } from './thread-member.entity';
import { AuditService } from '../audit/audit.service';

// ============================================================
// ANNOUNCEMENTS SERVICE - Announcement-specific operations
// ============================================================

@Injectable()
export class AnnouncementsService {
    constructor(
        @InjectRepository(AnnouncementRead)
        private readRepo: Repository<AnnouncementRead>,
        @InjectRepository(AnnouncementReaction)
        private reactionRepo: Repository<AnnouncementReaction>,
        @InjectRepository(Thread)
        private threadRepo: Repository<Thread>,
        @InjectRepository(ThreadMember)
        private memberRepo: Repository<ThreadMember>,
        private readonly auditService: AuditService,
    ) { }

    // Mark an announcement as read by a user
    async markRead(thread_id: string, user_id: string): Promise<AnnouncementRead> {
        const existing = await this.readRepo.findOne({ where: { thread_id, user_id } });
        if (existing) return existing;

        const read = this.readRepo.create({ thread_id, user_id });
        return this.readRepo.save(read);
    }

    // Add a reaction to an announcement
    async addReaction(thread_id: string, user_id: string, emoji: string): Promise<AnnouncementReaction> {
        const existing = await this.reactionRepo.findOne({ where: { thread_id, user_id, emoji } });
        if (existing) return existing;

        const reaction = this.reactionRepo.create({ thread_id, user_id, emoji });
        return this.reactionRepo.save(reaction);
    }

    // Remove a reaction from an announcement
    async removeReaction(thread_id: string, user_id: string, emoji: string): Promise<void> {
        await this.reactionRepo.delete({ thread_id, user_id, emoji });
    }

    // Get announcement stats (read count, reaction counts, ack count)
    async getStats(thread_id: string): Promise<{
        total_members: number;
        read_count: number;
        ack_count: number;
        reactions: { emoji: string; count: number }[];
    }> {
        const [total_members, read_count, ack_count] = await Promise.all([
            this.memberRepo.count({ where: { thread_id, has_left: false } }),
            this.readRepo.count({ where: { thread_id } }),
            this.memberRepo.count({ where: { thread_id, has_acknowledged: true } }),
        ]);

        // Get reaction counts grouped by emoji
        const reactionCounts = await this.reactionRepo
            .createQueryBuilder('r')
            .select('r.emoji', 'emoji')
            .addSelect('COUNT(*)', 'count')
            .where('r.thread_id = :thread_id', { thread_id })
            .groupBy('r.emoji')
            .getRawMany();

        return {
            total_members,
            read_count,
            ack_count,
            reactions: reactionCounts.map(r => ({ emoji: r.emoji, count: parseInt(r.count, 10) })),
        };
    }

    // Get all reactions for an announcement
    async getReactions(thread_id: string): Promise<AnnouncementReaction[]> {
        return this.reactionRepo.find({
            where: { thread_id },
            relations: ['user'],
        });
    }
}
