import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('eldest_learners')
@Index(['tenant_id'])
export class EldestLearner {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    tenant_id: string;

    @Column({ nullable: true })
    post_id: string;

    @Column({ nullable: true })
    family_code: string;

    @Column({ nullable: true })
    learner_names: string;

    @Column({ nullable: true })
    student_number: string;

    @Column({ type: 'uuid', nullable: true })
    learner_user_id: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
