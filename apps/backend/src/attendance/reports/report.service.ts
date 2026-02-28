import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const PDFDocument = require('pdfkit');
import { AttendanceDailySummary } from '../entities/attendance-daily-summary.entity';
import { AttendanceWeeklySummary } from '../entities/attendance-weekly-summary.entity';
import { SubjectType } from '../entities/attendance-event.entity';
import { Branch } from '../../branches/branch.entity';
import { Tenant } from '../../tenants/tenant.entity';
import { User } from '../../users/user.entity';
import { SchoolClass } from '../entities/class.entity';

@Injectable()
export class ReportService {
    private readonly logger = new Logger(ReportService.name);

    constructor(
        @InjectRepository(AttendanceDailySummary)
        private dailySummaryRepo: Repository<AttendanceDailySummary>,
        @InjectRepository(AttendanceWeeklySummary)
        private weeklySummaryRepo: Repository<AttendanceWeeklySummary>,
        @InjectRepository(Branch)
        private branchRepo: Repository<Branch>,
        @InjectRepository(Tenant)
        private tenantRepo: Repository<Tenant>,
        @InjectRepository(User)
        private userRepo: Repository<User>,
        @InjectRepository(SchoolClass)
        private classRepo: Repository<SchoolClass>,
    ) {}

    async generateLearnerDailyRegister(params: {
        tenant_id: string;
        branch_id: string;
        class_id?: string;
        date: string;
    }): Promise<Buffer> {
        const { tenant_id, branch_id, date, class_id } = params;

        const branch = await this.branchRepo.findOne({ where: { id: branch_id, tenant_id } });
        const tenant = await this.tenantRepo.findOne({ where: { id: tenant_id } });

        const where: any = { tenant_id, branch_id, date, subject_type: SubjectType.LEARNER };
        if (class_id) where.class_id = class_id;

        const summaries = await this.dailySummaryRepo.find({ where, order: { subject_user_id: 'ASC' } });

        // Get user names
        const userIds = summaries.map(s => s.subject_user_id);
        const users = userIds.length > 0
            ? await this.userRepo.createQueryBuilder('u').where('u.id IN (:...ids)', { ids: userIds }).getMany()
            : [];
        const userMap = new Map(users.map(u => [u.id, u]));

        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ layout: 'landscape', size: 'A4', margin: 40 });
            const buffers: Buffer[] = [];
            doc.on('data', (chunk: Buffer) => buffers.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', reject);

            // Header
            this.addHeader(doc, tenant?.school_name || 'School', branch?.branch_name || 'Branch', `Learner Daily Register - ${date}`);

            // Table headers
            const cols = [
                { label: '#', width: 30, x: 40 },
                { label: 'Name', width: 180, x: 70 },
                { label: 'Student #', width: 80, x: 250 },
                { label: 'Status', width: 70, x: 330 },
                { label: 'Check-In', width: 70, x: 400 },
                { label: 'Check-Out', width: 70, x: 470 },
                { label: 'Late (min)', width: 60, x: 540 },
                { label: 'Notes', width: 150, x: 600 },
            ];

            let y = 140;
            doc.fontSize(8).font('Helvetica-Bold');
            cols.forEach(col => doc.text(col.label, col.x, y, { width: col.width }));

            doc.moveTo(40, y + 12).lineTo(760, y + 12).stroke();
            y += 16;

            doc.font('Helvetica').fontSize(7);
            summaries.forEach((s, i) => {
                if (y > 540) {
                    doc.addPage();
                    y = 40;
                    doc.fontSize(8).font('Helvetica-Bold');
                    cols.forEach(col => doc.text(col.label, col.x, y, { width: col.width }));
                    doc.moveTo(40, y + 12).lineTo(760, y + 12).stroke();
                    y += 16;
                    doc.font('Helvetica').fontSize(7);
                }

                const user = userMap.get(s.subject_user_id);
                const name = user?.display_name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Unknown';

                doc.text(String(i + 1), cols[0].x, y, { width: cols[0].width });
                doc.text(name, cols[1].x, y, { width: cols[1].width });
                doc.text(user?.student_number || '', cols[2].x, y, { width: cols[2].width });
                doc.text(s.status, cols[3].x, y, { width: cols[3].width });
                doc.text(s.earliest_check_in || '-', cols[4].x, y, { width: cols[4].width });
                doc.text(s.latest_check_out || '-', cols[5].x, y, { width: cols[5].width });
                doc.text(s.late_minutes > 0 ? String(s.late_minutes) : '-', cols[6].x, y, { width: cols[6].width });
                doc.text(s.flags?.missing_checkout ? 'Missing checkout' : '', cols[7].x, y, { width: cols[7].width });

                y += 14;
            });

            this.addFooter(doc);
            doc.end();
        });
    }

    async generateLearnerWeeklyRegister(params: {
        tenant_id: string;
        branch_id: string;
        class_id?: string;
        week_start: string;
    }): Promise<Buffer> {
        const { tenant_id, branch_id, week_start, class_id } = params;

        const branch = await this.branchRepo.findOne({ where: { id: branch_id, tenant_id } });
        const tenant = await this.tenantRepo.findOne({ where: { id: tenant_id } });

        // Get all daily summaries for the week
        const weekEnd = new Date(week_start);
        weekEnd.setDate(weekEnd.getDate() + 4);
        const weekEndStr = weekEnd.toISOString().split('T')[0];

        const query = this.dailySummaryRepo.createQueryBuilder('s')
            .where('s.tenant_id = :tenant_id', { tenant_id })
            .andWhere('s.branch_id = :branch_id', { branch_id })
            .andWhere('s.subject_type = :type', { type: SubjectType.LEARNER })
            .andWhere('s.date >= :start', { start: week_start })
            .andWhere('s.date <= :end', { end: weekEndStr });

        if (class_id) query.andWhere('s.class_id = :class_id', { class_id });
        query.orderBy('s.subject_user_id', 'ASC').addOrderBy('s.date', 'ASC');

        const summaries = await query.getMany();

        // Group by user
        const grouped = new Map<string, Map<string, AttendanceDailySummary>>();
        for (const s of summaries) {
            if (!grouped.has(s.subject_user_id)) grouped.set(s.subject_user_id, new Map());
            grouped.get(s.subject_user_id)!.set(s.date, s);
        }

        // Get user names
        const userIds = [...grouped.keys()];
        const users = userIds.length > 0
            ? await this.userRepo.createQueryBuilder('u').where('u.id IN (:...ids)', { ids: userIds }).getMany()
            : [];
        const userMap = new Map(users.map(u => [u.id, u]));

        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
        const dayDates: string[] = [];
        for (let i = 0; i < 5; i++) {
            const d = new Date(week_start);
            d.setDate(d.getDate() + i);
            dayDates.push(d.toISOString().split('T')[0]);
        }

        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ layout: 'landscape', size: 'A4', margin: 40 });
            const buffers: Buffer[] = [];
            doc.on('data', (chunk: Buffer) => buffers.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', reject);

            this.addHeader(doc, tenant?.school_name || 'School', branch?.branch_name || 'Branch', `Learner Weekly Register - Week of ${week_start}`);

            let y = 140;
            doc.fontSize(7).font('Helvetica-Bold');
            doc.text('#', 40, y, { width: 25 });
            doc.text('Name', 65, y, { width: 120 });

            days.forEach((day, i) => {
                const x = 185 + i * 100;
                doc.text(`${day} (${dayDates[i].slice(5)})`, x, y, { width: 100 });
            });

            doc.text('P', 685, y, { width: 20 });
            doc.text('A', 705, y, { width: 20 });
            doc.text('L', 725, y, { width: 20 });

            doc.moveTo(40, y + 10).lineTo(760, y + 10).stroke();
            y += 14;

            doc.font('Helvetica').fontSize(6);
            let rowNum = 0;
            for (const [userId, daySummaries] of grouped) {
                if (y > 540) {
                    doc.addPage();
                    y = 40;
                }
                rowNum++;
                const user = userMap.get(userId);
                const name = user?.display_name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim();

                doc.text(String(rowNum), 40, y, { width: 25 });
                doc.text(name, 65, y, { width: 120 });

                let present = 0, absent = 0, late = 0;
                dayDates.forEach((dd, i) => {
                    const ds = daySummaries.get(dd);
                    const x = 185 + i * 100;
                    if (ds) {
                        const inTime = ds.earliest_check_in?.slice(0, 5) || '-';
                        const outTime = ds.latest_check_out?.slice(0, 5) || '-';
                        doc.text(`${ds.status.slice(0, 1)} ${inTime}/${outTime}`, x, y, { width: 100 });
                        if (ds.status === 'PRESENT' || ds.status === 'LATE') present++;
                        if (ds.status === 'ABSENT') absent++;
                        if (ds.status === 'LATE') late++;
                    } else {
                        doc.text('-', x, y, { width: 100 });
                    }
                });

                doc.text(String(present), 685, y, { width: 20 });
                doc.text(String(absent), 705, y, { width: 20 });
                doc.text(String(late), 725, y, { width: 20 });

                y += 12;
            }

            this.addFooter(doc);
            doc.end();
        });
    }

    async generateBranchWeeklySummary(params: {
        tenant_id: string;
        branch_id: string;
        week_start: string;
    }): Promise<Buffer> {
        const { tenant_id, branch_id, week_start } = params;

        const branch = await this.branchRepo.findOne({ where: { id: branch_id, tenant_id } });
        const tenant = await this.tenantRepo.findOne({ where: { id: tenant_id } });

        const weeklySummaries = await this.weeklySummaryRepo.find({
            where: { tenant_id, branch_id, week_start, subject_type: SubjectType.LEARNER },
        });

        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ layout: 'landscape', size: 'A4', margin: 40 });
            const buffers: Buffer[] = [];
            doc.on('data', (chunk: Buffer) => buffers.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', reject);

            this.addHeader(doc, tenant?.school_name || 'School', branch?.branch_name || 'Branch', `Branch Weekly Summary - Week of ${week_start}`);

            let y = 140;

            // Summary stats
            const totalLearners = weeklySummaries.length;
            const avgPresent = totalLearners > 0
                ? (weeklySummaries.reduce((sum, s) => sum + s.days_present, 0) / totalLearners).toFixed(1)
                : '0';
            const chronicAbsentees = weeklySummaries.filter(s => s.days_absent >= 3);

            doc.fontSize(10).font('Helvetica-Bold');
            doc.text(`Total Learners: ${totalLearners}`, 40, y);
            doc.text(`Avg Days Present: ${avgPresent}/5`, 250, y);
            doc.text(`Chronic Absentees (3+ days): ${chronicAbsentees.length}`, 500, y);
            y += 30;

            // Chronic absentee list
            if (chronicAbsentees.length > 0) {
                doc.fontSize(9).font('Helvetica-Bold');
                doc.text('Chronic Absentee List', 40, y);
                y += 14;

                doc.fontSize(7).font('Helvetica');
                for (const ca of chronicAbsentees.slice(0, 50)) {
                    doc.text(`${ca.subject_user_id} - ${ca.days_absent} days absent, ${ca.days_late} days late`, 40, y);
                    y += 10;
                    if (y > 540) { doc.addPage(); y = 40; }
                }
            }

            this.addFooter(doc);
            doc.end();
        });
    }

    async generateStaffWeeklyTimeReport(params: {
        tenant_id: string;
        branch_id: string;
        week_start: string;
    }): Promise<Buffer> {
        const { tenant_id, branch_id, week_start } = params;

        const branch = await this.branchRepo.findOne({ where: { id: branch_id, tenant_id } });
        const tenant = await this.tenantRepo.findOne({ where: { id: tenant_id } });

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
            .addOrderBy('s.date', 'ASC')
            .getMany();

        const grouped = new Map<string, Map<string, AttendanceDailySummary>>();
        for (const s of summaries) {
            if (!grouped.has(s.subject_user_id)) grouped.set(s.subject_user_id, new Map());
            grouped.get(s.subject_user_id)!.set(s.date, s);
        }

        const userIds = [...grouped.keys()];
        const users = userIds.length > 0
            ? await this.userRepo.createQueryBuilder('u').where('u.id IN (:...ids)', { ids: userIds }).getMany()
            : [];
        const userMap = new Map(users.map(u => [u.id, u]));

        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
        const dayDates: string[] = [];
        for (let i = 0; i < 5; i++) {
            const d = new Date(week_start);
            d.setDate(d.getDate() + i);
            dayDates.push(d.toISOString().split('T')[0]);
        }

        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ layout: 'landscape', size: 'A4', margin: 40 });
            const buffers: Buffer[] = [];
            doc.on('data', (chunk: Buffer) => buffers.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', reject);

            this.addHeader(doc, tenant?.school_name || 'School', branch?.branch_name || 'Branch', `Staff Weekly Time Report - Week of ${week_start}`);

            let y = 140;
            doc.fontSize(7).font('Helvetica-Bold');
            doc.text('#', 40, y, { width: 20 });
            doc.text('Name', 60, y, { width: 110 });

            days.forEach((day, i) => {
                const x = 170 + i * 95;
                doc.text(`${day} In/Out/Hrs`, x, y, { width: 95 });
            });

            doc.text('Total', 645, y, { width: 35 });
            doc.text('OT', 680, y, { width: 25 });
            doc.text('Late', 705, y, { width: 25 });

            doc.moveTo(40, y + 10).lineTo(760, y + 10).stroke();
            y += 14;

            doc.font('Helvetica').fontSize(6);
            let rowNum = 0;
            for (const [userId, daySummaries] of grouped) {
                if (y > 540) { doc.addPage(); y = 40; }
                rowNum++;
                const user = userMap.get(userId);
                const name = user?.display_name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim();

                doc.text(String(rowNum), 40, y, { width: 20 });
                doc.text(name, 60, y, { width: 110 });

                let totalHours = 0, totalOT = 0, lateCount = 0;
                dayDates.forEach((dd, i) => {
                    const ds = daySummaries.get(dd);
                    const x = 170 + i * 95;
                    if (ds) {
                        const inTime = ds.earliest_check_in?.slice(0, 5) || '-';
                        const outTime = ds.latest_check_out?.slice(0, 5) || '-';
                        const hrs = Number(ds.total_hours_worked || 0).toFixed(1);
                        doc.text(`${inTime}/${outTime}/${hrs}h`, x, y, { width: 95 });
                        totalHours += Number(ds.total_hours_worked || 0);
                        totalOT += ds.overtime_minutes || 0;
                        if (ds.late_minutes > 0) lateCount++;
                    } else {
                        doc.text('-', x, y, { width: 95 });
                    }
                });

                doc.text(totalHours.toFixed(1), 645, y, { width: 35 });
                doc.text(totalOT > 0 ? `${totalOT}m` : '-', 680, y, { width: 25 });
                doc.text(String(lateCount), 705, y, { width: 25 });

                y += 12;
            }

            this.addFooter(doc);
            doc.end();
        });
    }

    private addHeader(doc: any, schoolName: string, branchName: string, title: string): void {
        doc.fontSize(14).font('Helvetica-Bold').text(schoolName, 40, 40);
        doc.fontSize(10).font('Helvetica').text(branchName, 40, 58);
        doc.fontSize(12).font('Helvetica-Bold').text(title, 40, 80);
        doc.fontSize(7).font('Helvetica').text(`Generated: ${new Date().toISOString().replace('T', ' ').slice(0, 19)}`, 40, 100);
        doc.moveTo(40, 120).lineTo(760, 120).stroke();
    }

    private addFooter(doc: any): void {
        const pages = doc.bufferedPageRange();
        for (let i = 0; i < pages.count; i++) {
            doc.switchToPage(i);
            doc.fontSize(7).font('Helvetica')
                .text(`Page ${i + 1} of ${pages.count}`, 40, 560, { align: 'center', width: 720 });
        }
    }
}
