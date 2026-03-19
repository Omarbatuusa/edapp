import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';

/**
 * Stores illustration overrides (SVG replacements) so changes
 * sync across all devices, not just the browser that made the change.
 */
@Entity('illustration_overrides')
@Unique(['slot_key'])
export class IllustrationOverride {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 100 })
    slot_key: string; // e.g. 'brand_step_1'

    @Column({ length: 500 })
    object_key: string; // GCS object key

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
