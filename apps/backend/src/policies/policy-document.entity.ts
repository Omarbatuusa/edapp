import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { PolicyVersion } from './policy-version.entity';

export enum PolicyScope {
    PLATFORM = 'platform',
    TENANT = 'tenant'
}

export enum PolicyKey {
    TERMS = 'terms',
    PRIVACY = 'privacy',
    COOKIES = 'cookies',
    ACCEPTABLE_USE = 'acceptable_use',
    POPIA_NOTICE = 'popia_notice',
    CHILD_SAFETY = 'child_safety',
    COMMUNICATIONS_NOTICES = 'communications_notices',
    APPLICATION_TERMS = 'application_terms'
}

@Entity('policy_documents')
export class PolicyDocument {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'enum', enum: PolicyScope })
    scope: PolicyScope;

    @Column({ nullable: true })
    tenant_id: string; // Null for platform policies

    @Column({ type: 'enum', enum: PolicyKey })
    policy_key: PolicyKey;

    @Column()
    title: string;

    @Column({ default: true })
    is_active: boolean;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @OneToMany(() => PolicyVersion, (version) => version.document)
    versions: PolicyVersion[];
}
