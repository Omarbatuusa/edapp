import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, Unique, Index } from 'typeorm';

// ============================================================
// USER LANGUAGE PREFERENCE - Persists user's language settings
// ============================================================

@Entity('user_language_preferences')
@Unique(['tenant_id', 'user_id'])
@Index(['tenant_id', 'user_id'])
export class UserLanguagePreference {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    tenant_id: string;

    @Column()
    user_id: string;

    @Column({ default: 'en' })
    preferred_language: string;

    @Column({ default: false })
    auto_translate: boolean;

    @UpdateDateColumn()
    updated_at: Date;
}
