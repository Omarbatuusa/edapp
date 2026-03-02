import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('emergency_contacts')
@Index(['tenant_id', 'linked_user_id'])
export class EmergencyContact {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    tenant_id: string;

    @Column({ type: 'uuid', nullable: true })
    linked_user_id: string;

    @Column()
    contact_name: string;

    @Column({ nullable: true })
    relationship_code: string;

    @Column({ nullable: true })
    mobile_number: string;

    @Column({ nullable: true })
    alternate_number: string;

    @Column({ nullable: true })
    email: string;

    @Column({ nullable: true })
    preferred_language_code: string;

    @Column({ type: 'jsonb', nullable: true })
    address: Record<string, any>;

    @Column({ type: 'int', default: 1 })
    priority_level: number;

    @Column({ default: false })
    authorized_to_pick_up: boolean;

    @Column({ type: 'text', nullable: true })
    medical_alert_notes: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
