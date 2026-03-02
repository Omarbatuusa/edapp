import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('family_doctors')
@Index(['tenant_id'])
export class FamilyDoctor {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    tenant_id: string;

    @Column()
    doctor_name: string;

    @Column({ nullable: true })
    contact_number: string;

    @Column({ nullable: true })
    email: string;

    @Column({ type: 'jsonb', nullable: true })
    work_address: Record<string, any>;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
