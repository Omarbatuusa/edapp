import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Tenant } from '../../tenants/tenant.entity';
import { Branch } from '../../branches/branch.entity';

@Entity('classes')
@Index(['tenant_id', 'branch_id', 'grade_id', 'academic_year'])
@Index(['tenant_id', 'class_code'], { unique: true })
export class SchoolClass {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant;

    @Column()
    tenant_id: string;

    @ManyToOne(() => Branch, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'branch_id' })
    branch: Branch;

    @Column()
    branch_id: string;

    @Column({ nullable: true })
    grade_id: string;

    @Column()
    section_name: string; // e.g., "10A", "Grade 8 Blue"

    @Column()
    class_code: string; // Unique per tenant, e.g., "GR10A-2026"

    @Column({ nullable: true })
    class_teacher_id: string; // FK to User (homeroom teacher)

    @Column({ default: '2026' })
    academic_year: string;

    @Column({ default: true })
    is_active: boolean;

    @Column({ type: 'jsonb', nullable: true, default: [] })
    learner_user_ids: string[]; // Enrolled learner IDs

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
