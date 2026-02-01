import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { PolicyDocument } from './policy-document.entity';

@Entity('policy_versions')
export class PolicyVersion {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => PolicyDocument, (doc) => doc.versions)
    @JoinColumn({ name: 'policy_document_id' })
    document: PolicyDocument;

    @Column()
    policy_document_id: string;

    @Column()
    version: string; // e.g. "2026.02"

    @Column({ type: 'date' })
    effective_date: Date;

    @Column({ type: 'text' })
    content_markdown: string;

    @CreateDateColumn()
    created_at: Date;
}
