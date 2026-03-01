import {
  Controller, Get, Post, Delete, Body, Param,
  UseGuards, Req, ForbiddenException, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FirebaseAuthGuard } from '../../auth/firebase-auth.guard';
import { RoleAssignment, UserRole } from '../../users/role-assignment.entity';
import { User } from '../../users/user.entity';
import { AuditEvent, AuditAction } from '../entities/audit-event.entity';

const PLATFORM_ROLES = ['PLATFORM_SUPER_ADMIN', 'BRAND_ADMIN', 'platform_admin'];
const CAN_MANAGE = ['PLATFORM_SUPER_ADMIN', 'BRAND_ADMIN', 'platform_admin', 'TENANT_ADMIN', 'MAIN_BRANCH_ADMIN'];

@UseGuards(FirebaseAuthGuard)
@Controller('admin/tenants/:tenantId/people')
export class AdminPeopleController {
  constructor(
    @InjectRepository(RoleAssignment) private roleRepo: Repository<RoleAssignment>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(AuditEvent) private auditRepo: Repository<AuditEvent>,
  ) {}

  private checkAccess(req: any, tenantId: string) {
    const role = req.user?.role || req.user?.customClaims?.role || '';
    const isPlatform = PLATFORM_ROLES.some(r => role.includes(r));
    const canManage = CAN_MANAGE.some(r => role.includes(r));
    if (!canManage) throw new ForbiddenException('Insufficient permissions');
    if (!isPlatform && req.tenant_id !== tenantId) throw new ForbiddenException('Cannot access another tenant');
  }

  private async log(req: any, tenantId: string, action: AuditAction, entityId: string, before?: any, after?: any) {
    await this.auditRepo.save(this.auditRepo.create({
      actor_user_id: req.user?.uid || req.user?.dbUserId,
      tenant_id: tenantId,
      action,
      entity_type: 'role_assignment',
      entity_id: entityId,
      before: before || null,
      after: after || null,
      ip_address: req.ip,
      user_agent: req.headers?.['user-agent'],
    } as any));
  }

  @Get()
  async list(@Req() req: any, @Param('tenantId') tenantId: string) {
    this.checkAccess(req, tenantId);
    const assignments = await this.roleRepo.find({
      where: { tenant_id: tenantId, is_active: true },
      order: { created_at: 'DESC' },
    });
    const userIds = [...new Set(assignments.map(a => a.user_id))];
    const users = await this.userRepo.findByIds(userIds);
    const userMap = Object.fromEntries(users.map(u => [u.id, u]));
    return assignments.map(a => ({
      ...a,
      user: userMap[a.user_id] ? {
        id: userMap[a.user_id].id,
        display_name: userMap[a.user_id].display_name,
        email: userMap[a.user_id].email,
        first_name: userMap[a.user_id].first_name,
        last_name: userMap[a.user_id].last_name,
      } : null,
    }));
  }

  @Post('roles')
  async assignRole(@Req() req: any, @Param('tenantId') tenantId: string, @Body() body: { user_id: string; role: UserRole; branch_id?: string }) {
    this.checkAccess(req, tenantId);
    if (!body.user_id || !body.role) throw new BadRequestException('user_id and role are required');
    const user = await this.userRepo.findOne({ where: { id: body.user_id } });
    if (!user) throw new NotFoundException('User not found');
    const assignment = await this.roleRepo.save(this.roleRepo.create({
      user_id: body.user_id,
      tenant_id: tenantId,
      branch_id: body.branch_id || null,
      role: body.role,
      is_active: true,
    } as any)) as unknown as RoleAssignment;
    await this.log(req, tenantId, AuditAction.ROLE_ASSIGN, assignment.id, null, { user_id: body.user_id, role: body.role, branch_id: body.branch_id });
    return assignment;
  }

  @Delete('roles/:roleId')
  async revokeRole(@Req() req: any, @Param('tenantId') tenantId: string, @Param('roleId') roleId: string) {
    this.checkAccess(req, tenantId);
    const assignment = await this.roleRepo.findOne({ where: { id: roleId, tenant_id: tenantId } });
    if (!assignment) throw new NotFoundException('Role assignment not found');
    const before = { user_id: assignment.user_id, role: assignment.role };
    assignment.is_active = false;
    await this.roleRepo.save(assignment);
    await this.log(req, tenantId, AuditAction.ROLE_REVOKE, roleId, before, { is_active: false });
    return { success: true };
  }

  @Get('roles/by-user/:userId')
  async getUserRoles(@Req() req: any, @Param('tenantId') tenantId: string, @Param('userId') userId: string) {
    this.checkAccess(req, tenantId);
    return this.roleRepo.find({ where: { tenant_id: tenantId, user_id: userId, is_active: true } });
  }
}
