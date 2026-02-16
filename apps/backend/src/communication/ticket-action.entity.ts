import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Thread } from './thread.entity';
import { User } from '../users/user.entity';

// ============================================================
// TICKET ACTION - Workflow actions on tickets
// ============================================================

export enum TicketActionType {
    UPLOAD_DOC = 'upload_doc',
    PAY_NOW = 'pay_now',
    APPROVE = 'approve',
    ACKNOWLEDGE = 'acknowledge',
    SCHEDULE_MEETING = 'schedule_meeting',
    COMPLETE_FORM = 'complete_form',
}

export enum TicketActionStatus {
    PENDING = 'pending',
    COMPLETED = 'completed',
    EXPIRED = 'expired',
}

@Entity('ticket_actions')
@Index(['thread_id'])
@Index(['assigned_to', 'status'])
export class TicketAction {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Thread, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'thread_id' })
    thread: Thread;

    @Column()
    thread_id: string;

    @Column({ type: 'enum', enum: TicketActionType })
    action_type: TicketActionType;

    @Column()
    title: string;

    @Column({ nullable: true })
    description: string;

    @Column({ type: 'enum', enum: TicketActionStatus, default: TicketActionStatus.PENDING })
    status: TicketActionStatus;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'assigned_to' })
    assignee: User;

    @Column({ nullable: true })
    assigned_to: string;

    @Column({ type: 'timestamp', nullable: true })
    due_at: Date;

    @Column({ type: 'timestamp', nullable: true })
    completed_at: Date;

    @Column({ type: 'jsonb', nullable: true })
    metadata: Record<string, any>;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
