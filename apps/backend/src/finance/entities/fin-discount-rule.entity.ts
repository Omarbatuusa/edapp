import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum DiscountType { SIBLING = 'SIBLING', STAFF_CHILD = 'STAFF_CHILD', BURSARY = 'BURSARY', SCHOLARSHIP = 'SCHOLARSHIP', EARLY_PAYMENT = 'EARLY_PAYMENT' }
export enum DiscountCalculation { PERCENTAGE = 'PERCENTAGE', FIXED = 'FIXED' }

@Entity('fin_discount_rule')
@Index(['tenant_id', 'is_active'])
export class FinDiscountRule {
    @PrimaryGeneratedColumn('uuid') id: string;
    @Column({ type: 'uuid' }) tenant_id: string;
    @Column({ type: 'varchar', length: 200 }) name: string;
    @Column({ type: 'enum', enum: DiscountType }) type: DiscountType;
    @Column({ type: 'enum', enum: DiscountCalculation }) calculation: DiscountCalculation;
    @Column({ type: 'decimal', precision: 15, scale: 2 }) value: number;
    @Column({ type: 'int', nullable: true }) max_siblings: number;
    @Column({ type: 'jsonb', nullable: true }) conditions: Record<string, any>;
    @Column({ type: 'boolean', default: true }) is_active: boolean;
    @CreateDateColumn() created_at: Date;
    @UpdateDateColumn() updated_at: Date;
}
