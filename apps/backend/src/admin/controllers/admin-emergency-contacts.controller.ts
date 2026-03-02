import {
  Controller, Get, Post, Put, Patch, Delete, Body, Param, Query,
  UseGuards, Req, ForbiddenException, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { FirebaseAuthGuard } from '../../auth/firebase-auth.guard';
import { EmergencyContact } from '../entities/emergency-contact.entity';

const PLATFORM_ROLES = ['platform_super_admin', 'brand_admin'];
const TENANT_ROLES = ['tenant_admin', 'main_branch_admin'];

@UseGuards(FirebaseAuthGuard)
@Controller('admin/tenants/:tenantId/emergency-contacts')
export class AdminEmergencyContactsController {
  constructor(
    @InjectRepository(EmergencyContact) private contactRepo: Repository<EmergencyContact>,
  ) {}

  private getRole(req: any): string {
    return req.user?.role || req.user?.customClaims?.role || '';
  }

  private canManage(req: any): boolean {
    const role = this.getRole(req);
    return [...PLATFORM_ROLES, ...TENANT_ROLES].some(r => role.includes(r));
  }

  @Get()
  async list(
    @Req() req: any,
    @Param('tenantId') tenantId: string,
    @Query('linked_user_id') linkedUserId?: string,
  ) {
    if (!this.canManage(req)) throw new ForbiddenException('Insufficient permissions');
    const where: any = { tenant_id: tenantId };
    if (linkedUserId) where.linked_user_id = linkedUserId;
    return this.contactRepo.find({
      where,
      order: { priority_level: 'ASC', contact_name: 'ASC' },
    });
  }

  @Get(':id')
  async findOne(@Req() req: any, @Param('tenantId') tenantId: string, @Param('id') id: string) {
    if (!this.canManage(req)) throw new ForbiddenException('Insufficient permissions');
    const item = await this.contactRepo.findOne({ where: { id, tenant_id: tenantId } });
    if (!item) throw new NotFoundException('Emergency contact not found');
    return item;
  }

  @Post()
  async create(@Req() req: any, @Param('tenantId') tenantId: string, @Body() body: Partial<EmergencyContact>) {
    if (!this.canManage(req)) throw new ForbiddenException('Insufficient permissions');
    if (!body.contact_name) throw new BadRequestException('contact_name is required');

    const contact = this.contactRepo.create({
      linked_user_id: body.linked_user_id,
      contact_name: body.contact_name,
      relationship_code: body.relationship_code,
      mobile_number: body.mobile_number,
      alternate_number: body.alternate_number,
      email: body.email,
      priority_level: body.priority_level,
      authorized_to_pick_up: body.authorized_to_pick_up,
      medical_alert_notes: body.medical_alert_notes,
      tenant_id: tenantId,
    });
    return this.contactRepo.save(contact);
  }

  @Put(':id')
  async update(
    @Req() req: any,
    @Param('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body() body: Partial<EmergencyContact>,
  ) {
    if (!this.canManage(req)) throw new ForbiddenException('Insufficient permissions');
    const existing = await this.contactRepo.findOne({ where: { id, tenant_id: tenantId } });
    if (!existing) throw new NotFoundException('Emergency contact not found');

    Object.assign(existing, body);
    existing.tenant_id = tenantId; // Prevent tenant_id override
    return this.contactRepo.save(existing);
  }

  @Delete(':id')
  async remove(@Req() req: any, @Param('tenantId') tenantId: string, @Param('id') id: string) {
    if (!this.canManage(req)) throw new ForbiddenException('Insufficient permissions');
    const existing = await this.contactRepo.findOne({ where: { id, tenant_id: tenantId } });
    if (!existing) throw new NotFoundException('Emergency contact not found');
    await this.contactRepo.remove(existing);
    return { success: true };
  }
}
