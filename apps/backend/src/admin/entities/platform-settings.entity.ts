import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('platform_settings')
export class PlatformSettings {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    key: string;

    @Column({ type: 'jsonb', nullable: true })
    value: any;

    @UpdateDateColumn()
    updated_at: Date;
}
