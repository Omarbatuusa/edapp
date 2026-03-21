import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum DraftFormType {
    MAIN_BRANCH = 'MAIN_BRANCH',
    BRANCH = 'BRANCH',
    BRAND = 'BRAND',
    LEARNER_ENROLLMENT = 'LEARNER_ENROLLMENT',
    STAFF = 'STAFF',
    SUBJECT = 'SUBJECT',
    CURRICULUM = 'CURRICULUM',
    STREAM = 'STREAM',
    SUBJECT_OFFERING = 'SUBJECT_OFFERING',
    GRADES_CLASSES = 'GRADES_CLASSES',
    FAMILY = 'FAMILY',
}

@Entity('admin_drafts')
export class AdminDraft {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: true })
    tenant_id: string;

    @Column({ nullable: true })
    user_id: string;

    @Column({ type: 'varchar', length: 50 })
    form_type: string;

    @Column({ default: 1 })
    current_step: number;

    @Column({ type: 'jsonb', default: {} })
    data: Record<string, any>;

    @Column({ type: 'varchar', nullable: true, default: '1.0' })
    schema_version: string;

    @Column({ type: 'timestamp' })
    expires_at: Date;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
