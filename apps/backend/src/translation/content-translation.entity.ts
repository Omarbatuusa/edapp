import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
    Unique,
} from 'typeorm';

@Entity('content_translations')
@Unique('UQ_translation_lookup', [
    'tenant_id',
    'content_type',
    'content_id',
    'target_lang',
    'original_hash',
])
export class ContentTranslation {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    @Index()
    tenant_id: string;

    @Column({ length: 50 })
    content_type: string; // 'announcement' | 'chat_message' | 'ticket_message' | 'post'

    @Column()
    @Index()
    content_id: string;

    @Column({ length: 10 })
    source_lang: string; // detected source language

    @Column({ length: 10 })
    target_lang: string;

    @Column({ length: 64 })
    original_hash: string; // SHA-256 of original text

    @Column('text')
    translated_text: string;

    @Column({ length: 20, default: 'gcp' })
    provider: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
