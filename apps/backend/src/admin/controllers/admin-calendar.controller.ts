import {
    Controller, Get, Post, Put, Delete, Body, Param, Query,
    UseGuards, Req, ForbiddenException, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FirebaseAuthGuard } from '../../auth/firebase-auth.guard';
import { AcademicCalendarDay, DayType } from '../entities/academic-calendar-day.entity';
import { IsOptional, IsString, IsInt, IsEnum, IsBoolean, IsDateString, IsArray, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

class CreateCalendarDayDto {
    @IsDateString()
    date: string;

    @IsEnum(DayType)
    day_type: DayType;

    @IsOptional() @IsString()
    label?: string;

    @IsInt()
    academic_year: number;

    @IsOptional() @IsInt()
    term?: number;

    @IsOptional() @IsString()
    branch_id?: string;

    @IsOptional() @IsBoolean()
    is_blocked?: boolean;
}

class BulkCreateCalendarDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateCalendarDayDto)
    days: CreateCalendarDayDto[];
}

class UpdateCalendarDayDto {
    @IsOptional() @IsEnum(DayType)
    day_type?: DayType;

    @IsOptional() @IsString()
    label?: string;

    @IsOptional() @IsInt()
    term?: number;

    @IsOptional() @IsBoolean()
    is_blocked?: boolean;
}

const MANAGE_ROLES = ['platform_super_admin', 'brand_admin', 'tenant_admin', 'main_branch_admin'];

@UseGuards(FirebaseAuthGuard)
@Controller('admin/tenants/:tenantId/calendar')
export class AdminCalendarController {
    constructor(
        @InjectRepository(AcademicCalendarDay) private calendarRepo: Repository<AcademicCalendarDay>,
    ) {}

    private getRole(req: any): string {
        return req.user?.role || req.user?.customClaims?.role || '';
    }

    private canManage(req: any): boolean {
        const role = this.getRole(req);
        return MANAGE_ROLES.some(r => role.includes(r));
    }

    @Get()
    async list(
        @Req() req: any,
        @Param('tenantId') tenantId: string,
        @Query('year') year?: string,
        @Query('branch_id') branchId?: string,
        @Query('term') term?: string,
    ) {
        if (!this.canManage(req)) throw new ForbiddenException('Insufficient permissions');

        const where: any = { tenant_id: tenantId };
        if (year) where.academic_year = parseInt(year, 10);
        if (branchId) where.branch_id = branchId;
        if (term) where.term = parseInt(term, 10);

        const days = await this.calendarRepo.find({
            where,
            order: { date: 'ASC' },
        });

        return { days, total: days.length };
    }

    @Post()
    async create(
        @Req() req: any,
        @Param('tenantId') tenantId: string,
        @Body() body: CreateCalendarDayDto,
    ) {
        if (!this.canManage(req)) throw new ForbiddenException('Insufficient permissions');

        const day = this.calendarRepo.create({
            tenant_id: tenantId,
            ...body,
        });
        return this.calendarRepo.save(day);
    }

    @Post('bulk')
    async bulkCreate(
        @Req() req: any,
        @Param('tenantId') tenantId: string,
        @Body() body: BulkCreateCalendarDto,
    ) {
        if (!this.canManage(req)) throw new ForbiddenException('Insufficient permissions');

        const days = body.days.map(d => this.calendarRepo.create({
            tenant_id: tenantId,
            ...d,
        }));
        return this.calendarRepo.save(days);
    }

    @Put(':id')
    async update(
        @Req() req: any,
        @Param('tenantId') tenantId: string,
        @Param('id') id: string,
        @Body() body: UpdateCalendarDayDto,
    ) {
        if (!this.canManage(req)) throw new ForbiddenException('Insufficient permissions');

        const day = await this.calendarRepo.findOne({ where: { id, tenant_id: tenantId } });
        if (!day) throw new NotFoundException('Calendar day not found');

        if (body.day_type !== undefined) day.day_type = body.day_type;
        if (body.label !== undefined) day.label = body.label;
        if (body.term !== undefined) day.term = body.term;
        if (body.is_blocked !== undefined) day.is_blocked = body.is_blocked;

        return this.calendarRepo.save(day);
    }

    @Delete(':id')
    async remove(
        @Req() req: any,
        @Param('tenantId') tenantId: string,
        @Param('id') id: string,
    ) {
        if (!this.canManage(req)) throw new ForbiddenException('Insufficient permissions');

        const day = await this.calendarRepo.findOne({ where: { id, tenant_id: tenantId } });
        if (!day) throw new NotFoundException('Calendar day not found');

        await this.calendarRepo.remove(day);
        return { deleted: true };
    }
}
