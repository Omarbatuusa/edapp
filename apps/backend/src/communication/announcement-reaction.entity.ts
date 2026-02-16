import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Unique, Index } from 'typeorm';
import { Thread } from './thread.entity';
import { User } from '../users/user.entity';

// ============================================================
// ANNOUNCEMENT REACTION - Thread-level reactions (emoji)
// ============================================================

@Entity('announcement_reactions')
@Unique(['thread_id', 'user_id', 'emoji'])
@Index(['thread_id'])
export class AnnouncementReaction {
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

    @Column()
    emoji: string;

    @CreateDateColumn()
    created_at: Date;
}
