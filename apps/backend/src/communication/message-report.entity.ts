import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Message } from './message.entity';
import { User } from '../users/user.entity';
import { Tenant } from '../tenants/tenant.entity';

// ============================================================
// MESSAGE REPORT - Message flagging/reporting
// ============================================================

export enum ReportReason {
    INAPPROPRIATE = 'inappropriate',
    SPAM = 'spam',
    HARASSMENT = 'harassment',
    MISINFORMATION = 'misinformation',
    OTHER = 'other',
}

export enum ReportStatus {
    PENDING = 'pending',
    REVIEWED = 'reviewed',
    ACTIONED = 'actioned',
    DISMISSED = 'dismissed',
}

@Entity('message_reports')
@Index(['tenant_id', 'status'])
export class MessageReport {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant;

    @Column()
    tenant_id: string;

    @ManyToOne(() => Message, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'message_id' })
    message: Message;

    @Column()
    message_id: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'reporter_id' })
    reporter: User;

    @Column()
    reporter_id: string;

    @Column({ type: 'enum', enum: ReportReason })
    reason: ReportReason;

    @Column({ type: 'text', nullable: true })
    details: string;

    @Column({ type: 'enum', enum: ReportStatus, default: ReportStatus.PENDING })
    status: ReportStatus;

    @Column({ nullable: true })
    reviewed_by: string;

    @Column({ type: 'text', nullable: true })
    review_notes: string | null;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
