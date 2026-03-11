import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { FinFiscalYear, FinFiscalPeriod, FiscalPeriodStatus } from '../entities';

@Injectable()
export class PeriodService {
    constructor(
        @InjectRepository(FinFiscalYear)
        private readonly yearRepo: Repository<FinFiscalYear>,
        @InjectRepository(FinFiscalPeriod)
        private readonly periodRepo: Repository<FinFiscalPeriod>,
    ) {}

    async findPeriodForDate(tenantId: string, date: string): Promise<FinFiscalPeriod | null> {
        return this.periodRepo.findOne({
            where: {
                tenant_id: tenantId,
                start_date: LessThanOrEqual(date),
                end_date: MoreThanOrEqual(date),
            },
        });
    }

    async ensurePeriodOpen(tenantId: string, date: string): Promise<FinFiscalPeriod> {
        const period = await this.findPeriodForDate(tenantId, date);
        if (!period) {
            throw new BadRequestException(`No fiscal period found for date ${date}. Please create fiscal periods first.`);
        }
        if (period.status !== FiscalPeriodStatus.OPEN) {
            throw new BadRequestException(`Fiscal period "${period.name}" is ${period.status}. Cannot post to a closed or locked period.`);
        }
        return period;
    }

    async createFiscalYearWithPeriods(
        tenantId: string,
        name: string,
        startDate: string,
        endDate: string,
    ): Promise<{ year: FinFiscalYear; periods: FinFiscalPeriod[] }> {
        const year = await this.yearRepo.save(
            this.yearRepo.create({
                tenant_id: tenantId,
                name,
                start_date: startDate,
                end_date: endDate,
            }),
        );

        // Generate 12 monthly periods
        const periods: FinFiscalPeriod[] = [];
        const start = new Date(startDate);

        for (let i = 0; i < 12; i++) {
            const periodStart = new Date(start.getFullYear(), start.getMonth() + i, 1);
            const periodEnd = new Date(start.getFullYear(), start.getMonth() + i + 1, 0);

            const monthName = periodStart.toLocaleString('en-ZA', { month: 'long', year: 'numeric' });

            const period = await this.periodRepo.save(
                this.periodRepo.create({
                    fiscal_year_id: year.id,
                    tenant_id: tenantId,
                    name: monthName,
                    period_number: i + 1,
                    start_date: periodStart.toISOString().split('T')[0],
                    end_date: periodEnd.toISOString().split('T')[0],
                }),
            );
            periods.push(period);
        }

        return { year, periods };
    }
}
