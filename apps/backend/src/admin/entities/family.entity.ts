import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('families')
@Index(['tenant_id', 'family_code'], { unique: true })
export class Family {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    tenant_id: string;

    @Column()
    family_name: string;

    @Column()
    family_code: string;

    @Column({ type: 'uuid', nullable: true })
    eldest_learner_id: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
