import {
  Controller, Get, Post, Put, Patch, Delete, Body, Param, Query,
  UseGuards, Req, ForbiddenException, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { FirebaseAuthGuard } from '../../auth/firebase-auth.guard';
import { FamilyDoctor } from '../entities/family-doctor.entity';

const PLATFORM_ROLES = ['platform_super_admin', 'brand_admin'];
const TENANT_ROLES = ['tenant_admin', 'main_branch_admin'];

@UseGuards(FirebaseAuthGuard)
@Controller('admin/tenants/:tenantId/family-doctors')
export class AdminFamilyDoctorsController {
  constructor(
    @InjectRepository(FamilyDoctor) private doctorRepo: Repository<FamilyDoctor>,
  ) {}

  private getRole(req: any): string {
    return req.user?.role || req.user?.customClaims?.role || '';
  }

  private canManage(req: any): boolean {
    const role = this.getRole(req);
    return [...PLATFORM_ROLES, ...TENANT_ROLES].some(r => role.includes(r));
  }

  @Get()
  async list(@Req() req: any, @Param('tenantId') tenantId: string) {
    if (!this.canManage(req)) throw new ForbiddenException('Insufficient permissions');
    return this.doctorRepo.find({
      where: { tenant_id: tenantId },
      order: { doctor_name: 'ASC' },
    });
  }

  @Get(':id')
  async findOne(@Req() req: any, @Param('tenantId') tenantId: string, @Param('id') id: string) {
    if (!this.canManage(req)) throw new ForbiddenException('Insufficient permissions');
    const item = await this.doctorRepo.findOne({ where: { id, tenant_id: tenantId } });
    if (!item) throw new NotFoundException('Family doctor not found');
    return item;
  }

  @Post()
  async create(@Req() req: any, @Param('tenantId') tenantId: string, @Body() body: Partial<FamilyDoctor>) {
    if (!this.canManage(req)) throw new ForbiddenException('Insufficient permissions');
    if (!body.doctor_name) throw new BadRequestException('doctor_name is required');

    const doctor = this.doctorRepo.create({
      doctor_name: body.doctor_name,
      contact_number: body.contact_number,
      email: body.email,
      work_address: body.work_address,
      tenant_id: tenantId,
    });
    return this.doctorRepo.save(doctor);
  }

  @Put(':id')
  async update(
    @Req() req: any,
    @Param('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body() body: Partial<FamilyDoctor>,
  ) {
    if (!this.canManage(req)) throw new ForbiddenException('Insufficient permissions');
    const existing = await this.doctorRepo.findOne({ where: { id, tenant_id: tenantId } });
    if (!existing) throw new NotFoundException('Family doctor not found');

    Object.assign(existing, body);
    existing.tenant_id = tenantId; // Prevent tenant_id override
    return this.doctorRepo.save(existing);
  }

  @Delete(':id')
  async remove(@Req() req: any, @Param('tenantId') tenantId: string, @Param('id') id: string) {
    if (!this.canManage(req)) throw new ForbiddenException('Insufficient permissions');
    const existing = await this.doctorRepo.findOne({ where: { id, tenant_id: tenantId } });
    if (!existing) throw new NotFoundException('Family doctor not found');
    await this.doctorRepo.remove(existing);
    return { success: true };
  }
}
