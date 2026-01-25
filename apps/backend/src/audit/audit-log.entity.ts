import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Tenant } from '../tenants/tenant.entity';
import { User } from '../users/user.entity';

@Entity('audit_logs')
export class AuditLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Tenant, { nullable: true })
    @JoinColumn({ name: 'tenantId' })
    tenant: Tenant;

    @Column({ nullable: true })
    tenantId: string;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column({ nullable: true })
    userId: string;

    @Column()
    action: string; // 'discovery_attempt', 'login_success', 'login_failure', 'role_switch', 'tenant_switch'

    @Column({ type: 'jsonb', nullable: true })
    metadata: Record<string, any>; // additional context

    @Column({ nullable: true })
    ipAddress: string;

    @Column({ nullable: true })
    userAgent: string;

    @CreateDateColumn()
    createdAt: Date;
}
