import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Thread } from './thread.entity';
import { User } from '../users/user.entity';

// ============================================================
// MESSAGE ENTITY - Individual messages in threads
// ============================================================

export enum MessageType {
    TEXT = 'text',
    IMAGE = 'image',
    DOCUMENT = 'document',
    VOICE = 'voice',
    SYSTEM = 'system' // For system messages like "User joined"
}

@Entity('messages')
@Index(['thread_id', 'created_at'])
export class Message {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    // Thread reference
    @ManyToOne(() => Thread, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'thread_id' })
    thread: Thread;

    @Column()
    @Index()
    thread_id: string;

    // Sender
    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'sender_id' })
    sender: User;

    @Column({ nullable: true })
    sender_id: string; // Null for system messages

    @Column({ type: 'enum', enum: MessageType, default: MessageType.TEXT })
    type: MessageType;

    // Content
    @Column({ type: 'text', nullable: true })
    content: string;

    // Attachments
    @Column({ type: 'jsonb', nullable: true, default: [] })
    attachments: {
        type: 'image' | 'document' | 'voice';
        url: string;
        name?: string;
        size_bytes?: number;
        mime_type?: string;
        duration_seconds?: number; // For voice notes
    }[];

    // Reply threading
    @ManyToOne(() => Message, { nullable: true })
    @JoinColumn({ name: 'reply_to_id' })
    reply_to: Message;

    @Column({ nullable: true })
    reply_to_id: string;

    // Reactions (emoji counts)
    @Column({ type: 'jsonb', nullable: true, default: {} })
    reactions: { [emoji: string]: string[] }; // emoji -> user_ids

    // Edited
    @Column({ default: false })
    is_edited: boolean;

    @Column({ type: 'timestamp', nullable: true })
    edited_at: Date;

    // Deleted (soft delete for "message deleted" display)
    @Column({ default: false })
    is_deleted: boolean;

    @Column({ type: 'timestamp', nullable: true })
    deleted_at: Date;

    @CreateDateColumn()
    created_at: Date;
}
