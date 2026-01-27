import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';

export enum UserStatus {
    ACTIVE = 'active',
    DISABLED = 'disabled'
}

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    email: string;

    @Column({ nullable: true })
    phone_e164: string; // E.164 format: +27123456789

    @Column({ nullable: true })
    display_name: string;

    @Column({ nullable: true })
    first_name: string;

    @Column({ nullable: true })
    last_name: string;

    // Password auth (optional - for email/password login)
    @Column({ nullable: true })
    password_hash: string;

    // Firebase auth (optional - for Google/Apple SSO)
    @Column({ nullable: true })
    firebase_uid: string;

    // Learner-specific fields
    @Column({ nullable: true, unique: true })
    student_number: string;

    @Column({ nullable: true })
    pin_hash: string; // bcrypt hash of PIN (4-6 digits)

    // Security & Rate Limiting
    @Column({ default: 0 })
    login_attempts: number;

    @Column({ type: 'timestamp', nullable: true })
    last_login_at: Date;

    @Column({ type: 'timestamp', nullable: true })
    locked_until: Date | null;

    // Push Notifications (FCM)
    @Column({ type: 'jsonb', nullable: true, default: [] })
    device_tokens: string[];

    @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
    status: UserStatus;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    // Roles are managed via role_assignments table (not directly on user)
    // @OneToMany(() => RoleAssignment, assignment => assignment.user)
    // role_assignments: RoleAssignment[];
}
