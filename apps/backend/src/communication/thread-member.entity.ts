import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index, Unique } from 'typeorm';
import { Thread } from './thread.entity';
import { User } from '../users/user.entity';

// ============================================================
// THREAD MEMBER ENTITY - Membership in threads
// ============================================================

export enum MemberRole {
    OWNER = 'owner',       // Created the thread/group
    ADMIN = 'admin',       // Can manage members
    MODERATOR = 'moderator', // Can moderate messages
    MEMBER = 'member'      // Regular participant
}

export enum MemberPermission {
    READ = 'read',
    WRITE = 'write',
    FULL = 'full' // Read + Write + Can see member list
}

@Entity('thread_members')
@Unique(['thread_id', 'user_id'])
@Index(['user_id', 'last_read_at'])
export class ThreadMember {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    // Thread reference
    @ManyToOne(() => Thread, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'thread_id' })
    thread: Thread;

    @Column()
    @Index()
    thread_id: string;

    // User reference
    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column()
    @Index()
    user_id: string;

    // Role within thread
    @Column({ type: 'enum', enum: MemberRole, default: MemberRole.MEMBER })
    role: MemberRole;

    // Permissions
    @Column({ type: 'enum', enum: MemberPermission, default: MemberPermission.FULL })
    permission: MemberPermission;

    // Read tracking for unread counts
    @Column({ type: 'timestamp', nullable: true })
    last_read_at: Date;

    @Column({ nullable: true })
    last_read_message_id: string;

    // Notification preferences for this thread
    @Column({ default: false })
    is_muted: boolean;

    @Column({ type: 'timestamp', nullable: true })
    muted_until: Date; // Temporary mute

    // Pinned for user
    @Column({ default: false })
    is_pinned: boolean;

    // For announcements - acknowledgement tracking
    @Column({ default: false })
    has_acknowledged: boolean;

    @Column({ type: 'timestamp', nullable: true })
    acknowledged_at: Date;

    // Left/removed status
    @Column({ default: false })
    has_left: boolean;

    @Column({ type: 'timestamp', nullable: true })
    left_at: Date;

    @CreateDateColumn()
    joined_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
