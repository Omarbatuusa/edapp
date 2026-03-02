import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('curricula')
@Index(['tenant_id'])
export class Curriculum {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid', nullable: true })
    tenant_id: string;

    @Column()
    curriculum_name: string;

    @Column({ unique: true })
    curriculum_code: string;

    @Column({ nullable: true })
    certification_type_code: string;

    @Column({ nullable: true })
    authority_code: string;

    @Column({ default: false })
    is_national: boolean;

    @Column({ type: 'jsonb', nullable: true, default: [] })
    phases_covered: string[];

    @Column({ nullable: true })
    qualification_pathway_code: string;

    @Column({ type: 'jsonb', nullable: true, default: [] })
    grades_covered: string[];

    @Column({ type: 'jsonb', nullable: true, default: [] })
    languages: string[];

    @Column({ type: 'jsonb', nullable: true, default: [] })
    subject_ids: string[];

    @Column({ nullable: true })
    exam_body_code: string;

    @Column({ nullable: true })
    academic_year_structure_code: string;

    @Column({ type: 'jsonb', nullable: true, default: [] })
    offered_at_branch_ids: string[];

    @Column({ type: 'text', nullable: true })
    international_recognition: string;

    @Column({ nullable: true })
    religious_alignment: string;

    @Column({ default: true })
    is_active: boolean;

    @Column({ nullable: true })
    website: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
