import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

/**
 * Tracks password hashes a user has previously used.
 * Prevents password reuse — users cannot set a password they've used before.
 */
@Entity('password_history')
export class PasswordHistory {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    user_id: string;

    @Column()
    password_hash: string;

    @Column({ nullable: true })
    source: string; // 'temp', 'onboarding', 'reset', 'admin'

    @CreateDateColumn()
    created_at: Date;
}
