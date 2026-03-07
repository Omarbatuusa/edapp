import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum DayType {
    SCHOOL_DAY = 'school_day',
    HOLIDAY = 'holiday',
    EXAM = 'exam',
    ADMIN = 'admin',
    HALF_DAY = 'half_day',
}

@Entity('academic_calendar_days')
@Index(['tenant_id', 'date'])
@Index(['tenant_id', 'academic_year'])
export class AcademicCalendarDay {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    tenant_id: string;

    @Column({ type: 'uuid', nullable: true })
    branch_id: string;

    @Column({ type: 'date' })
    date: string;

    @Column({ type: 'enum', enum: DayType, default: DayType.SCHOOL_DAY })
    day_type: DayType;

    @Column({ type: 'varchar', nullable: true })
    label: string;

    @Column({ type: 'int' })
    academic_year: number;

    @Column({ type: 'int', nullable: true })
    term: number;

    @Column({ default: false })
    is_blocked: boolean;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
