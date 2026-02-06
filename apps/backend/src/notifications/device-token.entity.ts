import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { User } from '../users/user.entity';
import { Tenant } from '../tenants/tenant.entity';

// ============================================================
// DEVICE TOKEN ENTITY - FCM push notification tokens
// ============================================================

export enum DevicePlatform {
    WEB = 'web',
    IOS = 'ios',
    ANDROID = 'android',
}

@Entity('device_tokens')
@Index(['user_id', 'token'], { unique: true })
export class DeviceToken {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    user_id: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ type: 'uuid' })
    tenant_id: string;

    @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant;

    @Column({ type: 'text' })
    token: string;

    @Column({
        type: 'enum',
        enum: DevicePlatform,
        default: DevicePlatform.WEB,
    })
    platform: DevicePlatform;

    @Column({ type: 'varchar', length: 255, nullable: true })
    device_name?: string;

    @Column({ type: 'boolean', default: true })
    is_active: boolean;

    @Column({ type: 'timestamp', nullable: true })
    last_used_at?: Date;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
