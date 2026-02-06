import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { Tenant } from '../tenants/tenant.entity';
import { User } from '../users/user.entity';

// ============================================================
// THREAD ENTITY - Conversations container
// ============================================================

export enum ThreadType {
    DM = 'dm',                       // 1:1 direct message
    GROUP = 'group',                 // Class/grade/club/staff/transport groups
    ANNOUNCEMENT = 'announcement',   // Read-only broadcasts
    TICKET = 'ticket',               // Support tickets (fees/admissions/transport/IT)
    SAFEGUARDING = 'safeguarding'    // Restricted visibility
}

export enum TicketCategory {
    FEES = 'fees',
    ADMISSIONS = 'admissions',
    TRANSPORT = 'transport',
    IT = 'it',
    GENERAL = 'general'
}

export enum TicketStatus {
    OPEN = 'open',
    PENDING = 'pending',
    RESOLVED = 'resolved',
    CLOSED = 'closed'
}

@Entity('threads')
@Index(['tenant_id', 'type'])
@Index(['tenant_id', 'created_at'])
export class Thread {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    // Multi-tenant isolation
    @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant;

    @Column()
    @Index()
    tenant_id: string;

    @Column({ type: 'enum', enum: ThreadType })
    type: ThreadType;

    // Thread metadata
    @Column({ nullable: true })
    title: string; // For groups/announcements

    @Column({ nullable: true })
    description: string;

    @Column({ nullable: true })
    avatar_url: string;

    // Creator
    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'created_by' })
    creator: User;

    @Column({ nullable: true })
    created_by: string;

    // For announcements
    @Column({ default: false })
    requires_ack: boolean;

    @Column({ type: 'timestamp', nullable: true })
    ack_deadline: Date; // Optional deadline for acknowledgement

    // For tickets
    @Column({ type: 'enum', enum: TicketCategory, nullable: true })
    ticket_category: TicketCategory;

    @Column({ type: 'enum', enum: TicketStatus, nullable: true })
    ticket_status: TicketStatus;

    @Column({ nullable: true })
    ticket_priority: number; // 1=low, 2=medium, 3=high, 4=urgent

    // For groups - context binding
    @Column({ type: 'jsonb', nullable: true })
    context: {
        grade_id?: string;
        class_id?: string;
        subject_id?: string;
        club_id?: string;
        transport_route_id?: string;
    };

    // Last message cache for inbox display
    @Column({ nullable: true })
    last_message_content: string;

    @Column({ type: 'timestamp', nullable: true })
    last_message_at: Date;

    // Archival
    @Column({ default: false })
    is_archived: boolean;

    @Column({ type: 'timestamp', nullable: true })
    archived_at: Date;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
