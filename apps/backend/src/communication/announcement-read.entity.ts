import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Unique, Index } from 'typeorm';
import { Thread } from './thread.entity';
import { User } from '../users/user.entity';

// ============================================================
// ANNOUNCEMENT READ - Tracks "seen" per user per announcement thread
// ============================================================

@Entity('announcement_reads')
@Unique(['thread_id', 'user_id'])
@Index(['thread_id'])
export class AnnouncementRead {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Thread, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'thread_id' })
    thread: Thread;

    @Column()
    thread_id: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column()
    user_id: string;

    @CreateDateColumn()
    read_at: Date;
}
