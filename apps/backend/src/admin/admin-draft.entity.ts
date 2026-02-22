import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum DraftFormType {
    MAIN_BRANCH = 'MAIN_BRANCH',
    BRANCH = 'BRANCH',
    BRAND = 'BRAND',
}

@Entity('admin_drafts')
export class AdminDraft {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: true })
    tenant_id: string;

    @Column({ nullable: true })
    user_id: string;

    @Column({
        type: 'enum',
        enum: DraftFormType,
    })
    form_type: DraftFormType;

    @Column({ default: 1 })
    current_step: number;

    @Column({ type: 'jsonb', default: {} })
    data: Record<string, any>;

    @Column({ type: 'timestamp' })
    expires_at: Date;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
