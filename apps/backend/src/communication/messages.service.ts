import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message, MessageType } from './message.entity';
import { MessageReceipt } from './message-receipt.entity';
import { Thread } from './thread.entity';
import { ThreadMember } from './thread-member.entity';

// ============================================================
// MESSAGES SERVICE - Message management
// ============================================================

export interface SendMessageDto {
    thread_id: string;
    sender_id: string;
    content?: string;
    type?: MessageType;
    attachments?: {
        type: 'image' | 'document' | 'voice';
        url: string;
        name?: string;
        size_bytes?: number;
        mime_type?: string;
        duration_seconds?: number;
    }[];
    reply_to_id?: string;
}

export interface MessageWithSender extends Message {
    sender_name?: string;
    sender_avatar?: string;
}

@Injectable()
export class MessagesService {
    constructor(
        @InjectRepository(Message)
        private messageRepo: Repository<Message>,
        @InjectRepository(MessageReceipt)
        private receiptRepo: Repository<MessageReceipt>,
        @InjectRepository(Thread)
        private threadRepo: Repository<Thread>,
        @InjectRepository(ThreadMember)
        private memberRepo: Repository<ThreadMember>,
    ) { }

    // ============================================
    // SEND MESSAGE
    // ============================================

    async sendMessage(dto: SendMessageDto): Promise<Message> {
        // Verify sender is member
        const membership = await this.memberRepo.findOne({
            where: { thread_id: dto.thread_id, user_id: dto.sender_id, has_left: false },
        });

        if (!membership) {
            throw new ForbiddenException('Not a member of this thread');
        }

        // Create message
        const message = this.messageRepo.create({
            thread_id: dto.thread_id,
            sender_id: dto.sender_id,
            content: dto.content,
            type: dto.type || MessageType.TEXT,
            attachments: dto.attachments || [],
            reply_to_id: dto.reply_to_id,
        });

        const savedMessage = await this.messageRepo.save(message);

        // Update thread's last message
        await this.threadRepo.update(dto.thread_id, {
            last_message_content: dto.content?.substring(0, 100) || '[Attachment]',
            last_message_at: new Date(),
        });

        // Create receipts for all members (for delivery tracking)
        const members = await this.memberRepo.find({
            where: { thread_id: dto.thread_id, has_left: false },
            select: ['user_id'],
        });

        const receipts = members
            .filter(m => m.user_id !== dto.sender_id)
            .map(m => this.receiptRepo.create({
                message_id: savedMessage.id,
                user_id: m.user_id,
            }));

        if (receipts.length > 0) {
            await this.receiptRepo.save(receipts);
        }

        return savedMessage;
    }

    // ============================================
    // GET THREAD MESSAGES (paginated)
    // ============================================

    async getThreadMessages(
        thread_id: string,
        user_id: string,
        options: {
            limit?: number;
            before?: string; // message_id for pagination
        } = {}
    ): Promise<MessageWithSender[]> {
        const limit = options.limit || 50;

        // Verify membership
        const membership = await this.memberRepo.findOne({
            where: { thread_id, user_id, has_left: false },
        });

        if (!membership) {
            throw new ForbiddenException('Not a member of this thread');
        }

        // Build query
        const query = this.messageRepo.createQueryBuilder('message')
            .leftJoinAndSelect('message.sender', 'sender')
            .where('message.thread_id = :thread_id', { thread_id })
            .andWhere('message.is_deleted = false')
            .orderBy('message.created_at', 'DESC')
            .take(limit);

        if (options.before) {
            const beforeMessage = await this.messageRepo.findOne({
                where: { id: options.before },
                select: ['created_at'],
            });
            if (beforeMessage) {
                query.andWhere('message.created_at < :before', {
                    before: beforeMessage.created_at,
                });
            }
        }

        const messages = await query.getMany();

        // Map to include sender info
        return messages.map(msg => ({
            ...msg,
            sender_name: msg.sender?.display_name || msg.sender?.first_name,
            sender_avatar: undefined, // Could add avatar_url to user entity
        }));
    }

    // ============================================
    // MARK MESSAGE AS DELIVERED
    // ============================================

    async markDelivered(message_id: string, user_id: string): Promise<void> {
        await this.receiptRepo.update(
            { message_id, user_id },
            { delivered_at: new Date() }
        );
    }

    // ============================================
    // MARK MESSAGE AS READ
    // ============================================

    async markRead(message_id: string, user_id: string): Promise<void> {
        const now = new Date();
        await this.receiptRepo.update(
            { message_id, user_id },
            {
                delivered_at: now,
                read_at: now,
            }
        );
    }

    // ============================================
    // MARK ALL THREAD MESSAGES AS READ
    // ============================================

    async markAllRead(thread_id: string, user_id: string): Promise<void> {
        const now = new Date();

        // Update all unread receipts for this user in this thread
        await this.receiptRepo
            .createQueryBuilder()
            .update(MessageReceipt)
            .set({ read_at: now })
            .where('user_id = :user_id', { user_id })
            .andWhere('read_at IS NULL')
            .andWhere('message_id IN (SELECT id FROM messages WHERE thread_id = :thread_id)', { thread_id })
            .execute();

        // Update thread membership
        await this.memberRepo.update(
            { thread_id, user_id },
            { last_read_at: now }
        );
    }

    // ============================================
    // GET UNREAD COUNT FOR USER
    // ============================================

    async getUnreadCount(user_id: string, tenant_id: string): Promise<number> {
        const result = await this.receiptRepo
            .createQueryBuilder('receipt')
            .innerJoin('messages', 'message', 'message.id = receipt.message_id')
            .innerJoin('threads', 'thread', 'thread.id = message.thread_id')
            .where('receipt.user_id = :user_id', { user_id })
            .andWhere('receipt.read_at IS NULL')
            .andWhere('thread.tenant_id = :tenant_id', { tenant_id })
            .getCount();

        return result;
    }

    // ============================================
    // EDIT MESSAGE
    // ============================================

    async editMessage(
        message_id: string,
        user_id: string,
        new_content: string
    ): Promise<Message> {
        const message = await this.messageRepo.findOne({
            where: { id: message_id, sender_id: user_id },
        });

        if (!message) {
            throw new NotFoundException('Message not found or not authorized');
        }

        message.content = new_content;
        message.is_edited = true;
        message.edited_at = new Date();

        return this.messageRepo.save(message);
    }

    // ============================================
    // DELETE MESSAGE (soft)
    // ============================================

    async deleteMessage(message_id: string, user_id: string): Promise<void> {
        const message = await this.messageRepo.findOne({
            where: { id: message_id, sender_id: user_id },
        });

        if (!message) {
            throw new NotFoundException('Message not found or not authorized');
        }

        message.is_deleted = true;
        message.deleted_at = new Date();
        message.content = '';
        message.attachments = [];

        await this.messageRepo.save(message);
    }

    // ============================================
    // ADD REACTION
    // ============================================

    async addReaction(
        message_id: string,
        user_id: string,
        emoji: string
    ): Promise<Message> {
        const message = await this.messageRepo.findOne({
            where: { id: message_id },
        });

        if (!message) {
            throw new NotFoundException('Message not found');
        }

        const reactions = message.reactions || {};
        if (!reactions[emoji]) {
            reactions[emoji] = [];
        }

        if (!reactions[emoji].includes(user_id)) {
            reactions[emoji].push(user_id);
        }

        message.reactions = reactions;
        return this.messageRepo.save(message);
    }

    // ============================================
    // REMOVE REACTION
    // ============================================

    async removeReaction(
        message_id: string,
        user_id: string,
        emoji: string
    ): Promise<Message> {
        const message = await this.messageRepo.findOne({
            where: { id: message_id },
        });

        if (!message) {
            throw new NotFoundException('Message not found');
        }

        const reactions = message.reactions || {};
        if (reactions[emoji]) {
            reactions[emoji] = reactions[emoji].filter((id: string) => id !== user_id);
            if (reactions[emoji].length === 0) {
                delete reactions[emoji];
            }
        }

        message.reactions = reactions;
        return this.messageRepo.save(message);
    }
}
