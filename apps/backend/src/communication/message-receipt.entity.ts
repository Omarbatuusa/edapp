import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index, Unique } from 'typeorm';
import { Message } from './message.entity';
import { User } from '../users/user.entity';

// ============================================================
// MESSAGE RECEIPT ENTITY - Delivery and read tracking
// ============================================================

@Entity('message_receipts')
@Unique(['message_id', 'user_id'])
@Index(['message_id'])
@Index(['user_id', 'read_at'])
export class MessageReceipt {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    // Message reference
    @ManyToOne(() => Message, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'message_id' })
    message: Message;

    @Column()
    message_id: string;

    // Recipient
    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column()
    user_id: string;

    // Delivery tracking
    @Column({ type: 'timestamp', nullable: true })
    delivered_at: Date;

    // Read tracking
    @Column({ type: 'timestamp', nullable: true })
    read_at: Date;
}
