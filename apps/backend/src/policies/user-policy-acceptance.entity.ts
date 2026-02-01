import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum UserIntent {
    APP = 'app',
    APPLY = 'apply',
    ADMIN = 'admin'
}

@Entity('user_policy_acceptances')
export class UserPolicyAcceptance {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    tenant_id: string;

    @Column()
    user_id: string;

    @Column({ type: 'enum', enum: UserIntent })
    intent: UserIntent;

    @Column()
    role: string; // Role at acceptance time

    // Store accepted versions
    @Column({ nullable: true })
    terms_version: string;

    @Column({ nullable: true })
    privacy_version: string;

    @Column({ nullable: true })
    child_safety_version: string;

    @Column({ nullable: true })
    communications_version: string;

    @Column({ nullable: true })
    application_terms_version: string;

    // Preferences
    @Column({ default: true })
    accepted_required: boolean;

    @Column({ default: false })
    notifications_opt_in: boolean;

    @Column({ default: false })
    email_opt_in: boolean;

    @Column({ default: false })
    sms_opt_in: boolean;

    @CreateDateColumn()
    accepted_at: Date;

    @Column()
    ip_address: string;

    @Column({ type: 'text' })
    user_agent: string;
}
