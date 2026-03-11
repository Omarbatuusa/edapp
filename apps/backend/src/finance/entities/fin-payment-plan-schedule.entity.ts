import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

export enum ScheduleStatus { PENDING = 'PENDING', PAID = 'PAID', OVERDUE = 'OVERDUE' }

@Entity('fin_payment_plan_schedule')
@Index(['plan_id'])
export class FinPaymentPlanSchedule {
    @PrimaryGeneratedColumn('uuid') id: string;
    @Column({ type: 'uuid' }) plan_id: string;
    @Column({ type: 'date' }) due_date: string;
    @Column({ type: 'decimal', precision: 15, scale: 2 }) amount: number;
    @Column({ type: 'enum', enum: ScheduleStatus, default: ScheduleStatus.PENDING }) status: ScheduleStatus;
}
