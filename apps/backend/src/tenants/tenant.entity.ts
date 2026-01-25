import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('tenants')
export class Tenant {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    name: string;

    @Column({ unique: true })
    slug: string; // school code or subdomain part

    @Column({ type: 'simple-array', nullable: true })
    hosts: string[]; // e.g. ["lia.edapp.co.za", "app.edapp.co.za"]

    @Column({ nullable: true })
    schoolCode: string; // "LIA", "TAS"

    @Column({ nullable: true })
    logo: string; // URL to school logo

    @Column({ nullable: true })
    campus: string; // Campus or branch name

    @Column({ default: true })
    isActive: boolean;

    @Column({ type: 'jsonb', nullable: true })
    config: Record<string, any>; // branding, policies

    // Adaptive Authentication Configuration
    @Column({ type: 'jsonb', nullable: true })
    authConfig: {
        enableEmailPassword?: boolean;
        enableEmailMagicLink?: boolean;
        enableGoogleSignIn?: boolean;
        enableAppleSignIn?: boolean;
        enableStudentPin?: boolean;
        pinLength?: number; // 4-6 digits
    };

    // Tenant Branding (subtle accents only)
    @Column({ type: 'jsonb', nullable: true })
    brandingConfig: {
        primaryColor?: string; // hex color for accents
        logoUrl?: string;
        faviconUrl?: string;
    };

    // QR Code Security
    @Column({ nullable: true })
    qrTokenSecret: string; // for signing QR tokens

    // Rate Limiting Configuration
    @Column({ type: 'jsonb', nullable: true })
    rateLimitConfig: {
        discoveryAttemptsPerHour?: number;
        loginAttemptsBeforeLockout?: number;
        lockoutDurationMinutes?: number;
        turnstileThreshold?: number;
    };

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
