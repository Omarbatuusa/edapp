import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('fin_saved_payment_method')
@Index(['tenant_id', 'user_id'])
export class FinSavedPaymentMethod {
    @PrimaryGeneratedColumn('uuid') id: string;
    @Column({ type: 'uuid' }) tenant_id: string;
    @Column({ type: 'uuid' }) user_id: string;
    @Column({ type: 'varchar', length: 20 }) provider: string;
    @Column({ type: 'varchar', length: 200 }) token: string;
    @Column({ type: 'varchar', length: 20 }) method_type: string;
    @Column({ type: 'varchar', length: 4, nullable: true }) last_four: string;
    @Column({ type: 'varchar', length: 7, nullable: true }) expiry: string;
    @Column({ type: 'boolean', default: false }) is_default: boolean;
    @CreateDateColumn() created_at: Date;
}
