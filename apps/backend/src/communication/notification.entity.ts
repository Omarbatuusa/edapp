import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Tenant } from '../tenants/tenant.entity';
import { User } from '../users/user.entity';

// ============================================================
// NOTIFICATION ENTITY - Push notifications and alerts
// ============================================================

export enum NotificationType {
    MESSAGE = 'message',           // New message in thread
    MENTION = 'mention',           // @mentioned in message
    ANNOUNCEMENT = 'announcement', // New school announcement
    ACK_REQUIRED = 'ack_required', // Acknowledgement needed
    TICKET_UPDATE = 'ticket_update', // Support ticket status change
    SAFEGUARDING = 'safeguarding', // Safeguarding alert
    TASK = 'task',                 // Task/action required
    PAYMENT = 'payment',           // Payment reminder/confirmation
    CALENDAR = 'calendar',         // Calendar event reminder
    GENERAL = 'general'            // General notification
}

export enum NotificationUrgency {
    LOW = 'low',
    NORMAL = 'normal',
    HIGH = 'high',
    URGENT = 'urgent'
}

@Entity('notifications')
@Index(['user_id', 'is_read', 'created_at'])
@Index(['tenant_id', 'created_at'])
export class Notification {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    // Multi-tenant isolation
    @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant;

    @Column()
    @Index()
    tenant_id: string;

    // Recipient
    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column()
    @Index()
    user_id: string;

    @Column({ type: 'enum', enum: NotificationType })
    type: NotificationType;

    @Column({ type: 'enum', enum: NotificationUrgency, default: NotificationUrgency.NORMAL })
    urgency: NotificationUrgency;

    // Content
    @Column()
    title: string;

    @Column({ type: 'text', nullable: true })
    body: string;

    @Column({ nullable: true })
    icon_url: string;

    // Action - what to do when tapped
    @Column({ type: 'jsonb', nullable: true })
    action: {
        type: 'navigate' | 'open_url' | 'deep_link';
        target: string; // Route, URL, or deep link
        params?: Record<string, any>;
    };

    // Quick actions (buttons in notification)
    @Column({ type: 'jsonb', nullable: true, default: [] })
    quick_actions: {
        id: string;
        label: string;
        action_type: 'navigate' | 'api_call' | 'dismiss';
        action_target?: string;
        style?: 'primary' | 'secondary' | 'danger';
    }[];

    // Reference to source entity
    @Column({ nullable: true })
    reference_type: string; // 'thread', 'message', 'announcement', 'ticket', etc.

    @Column({ nullable: true })
    reference_id: string;

    // Read/interaction state
    @Column({ default: false })
    is_read: boolean;

    @Column({ type: 'timestamp', nullable: true })
    read_at: Date;

    @Column({ default: false })
    is_actioned: boolean;

    @Column({ type: 'timestamp', nullable: true })
    actioned_at: Date;

    // Push notification tracking
    @Column({ default: false })
    push_sent: boolean;

    @Column({ type: 'timestamp', nullable: true })
    push_sent_at: Date;

    // Expiry
    @Column({ type: 'timestamp', nullable: true })
    expires_at: Date;

    @CreateDateColumn()
    created_at: Date;
}
