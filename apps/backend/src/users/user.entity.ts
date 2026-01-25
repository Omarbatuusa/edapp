import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Tenant } from '../tenants/tenant.entity';

export enum UserRole {
    PLATFORM_ADMIN = 'platform_admin', // admin.edapp.co.za
    ADMIN = 'admin',
    STAFF = 'staff',
    HEAD_OF_DEPARTMENT = 'hod',
    TEACHER = 'teacher',
    PARENT = 'parent',
    LEARNER = 'learner',
    APPLICANT = 'applicant' // apply-{tenant}.edapp.co.za
}

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    email: string;

    @Column({ nullable: true })
    firebaseUid: string;

    @Column({ type: 'enum', enum: UserRole, default: UserRole.LEARNER })
    role: UserRole;

    @Column({ nullable: true })
    firstName: string;

    @Column({ nullable: true })
    lastName: string;

    // Learner Authentication
    @Column({ nullable: true, unique: true })
    studentNumber: string; // for learner login

    @Column({ nullable: true })
    pinHash: string; // bcrypt hash of PIN (4-6 digits)

    // Security & Rate Limiting
    @Column({ default: 0 })
    loginAttempts: number;

    @Column({ type: 'timestamp', nullable: true })
    lastLoginAt: Date;

    @Column({ type: 'timestamp', nullable: true })
    lockedUntil: Date | null; // progressive lockout

    // Push Notifications (FCM)
    @Column({ type: 'simple-array', nullable: true })
    deviceTokens: string[]; // FCM device tokens

    @ManyToOne(() => Tenant)
    @JoinColumn({ name: 'tenantId' })
    tenant: Tenant;

    @Column()
    tenantId: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
