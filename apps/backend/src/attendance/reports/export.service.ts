import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as ExcelJS from 'exceljs';
import { AttendanceDailySummary } from '../entities/attendance-daily-summary.entity';
import { AttendanceWeeklySummary } from '../entities/attendance-weekly-summary.entity';
import { SubjectType } from '../entities/attendance-event.entity';
import { User } from '../../users/user.entity';

@Injectable()
export class ExportService {
    private readonly logger = new Logger(ExportService.name);

    constructor(
        @InjectRepository(AttendanceDailySummary)
        private dailySummaryRepo: Repository<AttendanceDailySummary>,
        @InjectRepository(AttendanceWeeklySummary)
        private weeklySummaryRepo: Repository<AttendanceWeeklySummary>,
        @InjectRepository(User)
        private userRepo: Repository<User>,
    ) {}

    async exportLearnerDaily(params: {
        tenant_id: string;
        branch_id: string;
        class_id?: string;
        date: string;
        format: 'csv' | 'xlsx';
    }): Promise<{ buffer: Buffer; contentType: string; filename: string }> {
        const { tenant_id, branch_id, date, class_id, format } = params;

        const where: any = { tenant_id, branch_id, date, subject_type: SubjectType.LEARNER };
        if (class_id) where.class_id = class_id;

        const summaries = await this.dailySummaryRepo.find({ where });

        const userIds = summaries.map(s => s.subject_user_id);
        const users = userIds.length > 0
            ? await this.userRepo.createQueryBuilder('u').where('u.id IN (:...ids)', { ids: userIds }).getMany()
            : [];
        const userMap = new Map(users.map(u => [u.id, u]));

        const rows = summaries.map((s, i) => {
            const user = userMap.get(s.subject_user_id);
            return {
                '#': i + 1,
                'Name': user?.display_name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim(),
                'Student Number': user?.student_number || '',
                'Status': s.status,
                'Check-In': s.earliest_check_in || '',
                'Check-Out': s.latest_check_out || '',
                'Late (min)': s.late_minutes,
                'Missing Checkout': s.flags?.missing_checkout ? 'Yes' : '',
            };
        });

        if (format === 'csv') {
            const csv = this.toCSV(rows);
            return {
                buffer: Buffer.from(csv),
                contentType: 'text/csv',
                filename: `learner-daily-${date}.csv`,
            };
        }

        const buffer = await this.toXLSX(rows, `Learner Daily ${date}`);
        return {
            buffer,
            contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            filename: `learner-daily-${date}.xlsx`,
        };
    }

    async exportStaffWeekly(params: {
        tenant_id: string;
        branch_id: string;
        week_start: string;
        format: 'csv' | 'xlsx';
    }): Promise<{ buffer: Buffer; contentType: string; filename: string }> {
        const { tenant_id, branch_id, week_start, format } = params;

        const weekEnd = new Date(week_start);
        weekEnd.setDate(weekEnd.getDate() + 4);
        const weekEndStr = weekEnd.toISOString().split('T')[0];

        const summaries = await this.dailySummaryRepo.createQueryBuilder('s')
            .where('s.tenant_id = :tenant_id', { tenant_id })
            .andWhere('s.branch_id = :branch_id', { branch_id })
            .andWhere('s.subject_type = :type', { type: SubjectType.STAFF })
            .andWhere('s.date >= :start', { start: week_start })
            .andWhere('s.date <= :end', { end: weekEndStr })
            .orderBy('s.subject_user_id', 'ASC')
            .getMany();

        const userIds = [...new Set(summaries.map(s => s.subject_user_id))];
        const users = userIds.length > 0
            ? await this.userRepo.createQueryBuilder('u').where('u.id IN (:...ids)', { ids: userIds }).getMany()
            : [];
        const userMap = new Map(users.map(u => [u.id, u]));

        const rows = summaries.map(s => {
            const user = userMap.get(s.subject_user_id);
            return {
                'Date': s.date,
                'Name': user?.display_name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim(),
                'Check-In': s.earliest_check_in || '',
                'Check-Out': s.latest_check_out || '',
                'Hours Worked': Number(s.total_hours_worked || 0).toFixed(2),
                'Late (min)': s.late_minutes,
                'Early (min)': s.early_minutes,
                'Overtime (min)': s.overtime_minutes,
                'Status': s.status,
            };
        });

        if (format === 'csv') {
            return {
                buffer: Buffer.from(this.toCSV(rows)),
                contentType: 'text/csv',
                filename: `staff-weekly-${week_start}.csv`,
            };
        }

        return {
            buffer: await this.toXLSX(rows, `Staff Weekly ${week_start}`),
            contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            filename: `staff-weekly-${week_start}.xlsx`,
        };
    }

    private toCSV(rows: Record<string, any>[]): string {
        if (rows.length === 0) return '';
        const headers = Object.keys(rows[0]);
        const lines = [
            headers.join(','),
            ...rows.map(r => headers.map(h => {
                const val = String(r[h] ?? '');
                return val.includes(',') || val.includes('"') ? `"${val.replace(/"/g, '""')}"` : val;
            }).join(',')),
        ];
        return lines.join('\n');
    }

    private async toXLSX(rows: Record<string, any>[], sheetName: string): Promise<Buffer> {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet(sheetName);

        if (rows.length > 0) {
            const headers = Object.keys(rows[0]);
            sheet.addRow(headers);

            // Style header row
            sheet.getRow(1).font = { bold: true };
            sheet.getRow(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFE2E8F0' },
            };

            for (const row of rows) {
                sheet.addRow(headers.map(h => row[h]));
            }

            // Auto-width columns
            headers.forEach((_, i) => {
                const col = sheet.getColumn(i + 1);
                col.width = Math.max(12, ...rows.map(r => String(r[headers[i]] ?? '').length + 2));
            });
        }

        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }
}
