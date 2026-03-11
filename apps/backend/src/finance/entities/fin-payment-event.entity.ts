import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('fin_payment_event')
@Index(['payment_id'])
export class FinPaymentEvent {
    @PrimaryGeneratedColumn('uuid') id: string;
    @Column({ type: 'uuid' }) payment_id: string;
    @Column({ type: 'varchar', length: 50 }) event_type: string;
    @Column({ type: 'varchar', length: 200, nullable: true }) provider_event_id: string;
    @Column({ type: 'jsonb', nullable: true }) payload: Record<string, any>;
    @Column({ type: 'timestamp', nullable: true }) processed_at: Date;
    @CreateDateColumn() created_at: Date;
}
