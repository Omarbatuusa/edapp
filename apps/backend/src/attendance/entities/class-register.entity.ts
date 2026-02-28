import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Tenant } from '../../tenants/tenant.entity';
import { Branch } from '../../branches/branch.entity';

export interface RegisterMark {
    learner_user_id: string;
    status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
    notes?: string;
}

@Entity('class_registers')
@Index(['tenant_id', 'class_id', 'date'], { unique: true })
@Index(['tenant_id', 'teacher_user_id', 'date'])
export class ClassRegister {
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

    @Column()
    class_id: string; // FK to SchoolClass

    @Column({ type: 'date' })
    date: string; // YYYY-MM-DD

    @Column()
    teacher_user_id: string; // FK to User

    @Column({ type: 'timestamp', nullable: true })
    submitted_at: Date;

    @Column({ type: 'jsonb', default: [] })
    marks: RegisterMark[];

    @Column({ default: false })
    is_final: boolean;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
