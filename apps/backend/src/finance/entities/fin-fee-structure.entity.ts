import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('fin_fee_structure')
@Index(['tenant_id', 'academic_year', 'is_active'])
export class FinFeeStructure {
    @PrimaryGeneratedColumn('uuid') id: string;
    @Column({ type: 'uuid' }) tenant_id: string;
    @Column({ type: 'varchar', length: 200 }) name: string;
    @Column({ type: 'varchar', length: 10 }) academic_year: string;
    @Column({ type: 'uuid', nullable: true }) branch_id: string;
    @Column({ type: 'varchar', length: 20, nullable: true }) phase_code: string;
    @Column({ type: 'varchar', length: 20, nullable: true }) grade_code: string;
    @Column({ type: 'varchar', length: 50, nullable: true }) programme_code: string;
    @Column({ type: 'boolean', default: true }) is_active: boolean;
    @CreateDateColumn() created_at: Date;
    @UpdateDateColumn() updated_at: Date;
}
