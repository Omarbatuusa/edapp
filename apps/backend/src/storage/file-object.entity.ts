import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Tenant } from '../tenants/tenant.entity';

export enum FileVisibility {
    PRIVATE = 'private',
    SIGNED = 'signed',
    PUBLIC = 'public',
}

export enum FileCategory {
    AVATAR = 'avatar',
    LOGO = 'logo',
    COVER = 'cover',
    LEARNER_DOCUMENT = 'learner_document',
    GUARDIAN_DOCUMENT = 'guardian_document',
    STAFF_DOCUMENT = 'staff_document',
    ADMISSION_DOCUMENT = 'admission_document',
    INVOICE_PDF = 'invoice_pdf',
    REPORT_EXPORT = 'report_export',
    MESSAGE_ATTACHMENT = 'message_attachment',
    GENERAL_DOCUMENT = 'general_document',
}

@Entity('file_objects')
@Index(['object_key'], { unique: true })
@Index(['tenant_id', 'entity_type', 'entity_id'])
export class FileObject {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Tenant, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant;

    @Column({ nullable: true })
    tenant_id: string; // nullable for platform-level files

    @Column()
    bucket_name: string;

    @Column()
    object_key: string;

    @Column()
    original_name: string;

    @Column()
    mime_type: string;

    @Column({ type: 'bigint', default: 0 })
    size_bytes: number;

    @Column({ nullable: true })
    checksum: string;

    @Column({ type: 'enum', enum: FileVisibility, default: FileVisibility.PRIVATE })
    visibility: FileVisibility;

    @Column({ type: 'enum', enum: FileCategory, default: FileCategory.GENERAL_DOCUMENT })
    category: FileCategory;

    @Column({ nullable: true })
    entity_type: string; // e.g. 'learner', 'staff', 'admission'

    @Column({ nullable: true })
    entity_id: string; // UUID of the linked entity

    @Column({ nullable: true })
    uploaded_by_user_id: string;

    @CreateDateColumn()
    created_at: Date;
}
