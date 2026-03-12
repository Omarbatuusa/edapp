import {
  Controller, Get, Post, Body, Param, Query,
  UseGuards, Req, ForbiddenException, BadRequestException, ConflictException, NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as firebaseAdmin from 'firebase-admin';
import { FirebaseAuthGuard } from '../../auth/firebase-auth.guard';
import { User, UserStatus } from '../../users/user.entity';
import { RoleAssignment, UserRole } from '../../users/role-assignment.entity';
import { AuditEvent, AuditAction } from '../entities/audit-event.entity';
import { validatePassword } from '../../auth/password-validator';

const PLATFORM_ROLES = ['platform_super_admin', 'app_super_admin', 'platform_secretary', 'app_secretary'];
const CAN_CREATE_USERS = ['platform_super_admin', 'app_super_admin', 'platform_secretary', 'app_secretary', 'tenant_admin'];

@UseGuards(FirebaseAuthGuard)
@Controller('admin/users')
export class AdminUsersController {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(RoleAssignment) private roleRepo: Repository<RoleAssignment>,
    @InjectRepository(AuditEvent) private auditRepo: Repository<AuditEvent>,
  ) {}

  private getRole(req: any): string {
    return req.user?.role || req.user?.customClaims?.role || '';
  }

  private isPlatformAdmin(req: any): boolean {
    const role = this.getRole(req);
    return PLATFORM_ROLES.some(r => role.includes(r));
  }

  private canCreateUsers(req: any): boolean {
    const role = this.getRole(req);
    return CAN_CREATE_USERS.some(r => role.includes(r));
  }

  @Post()
  async createUser(@Req() req: any, @Body() body: {
    email: string;
    display_name?: string;
    first_name?: string;
    last_name?: string;
    phone_e164?: string;
    password?: string;
    role?: string;
    tenant_id?: string;
  }) {
    if (!this.canCreateUsers(req)) {
      throw new ForbiddenException('Insufficient permissions to create users');
    }
    if (!body.email) {
      throw new BadRequestException('Email is required');
    }

    const existing = await this.userRepo.findOne({ where: { email: body.email.toLowerCase().trim() } });
    if (existing) {
      throw new ConflictException('A user with this email already exists');
    }

    let rawPassword: string;
    if (body.password) {
      const validation = validatePassword(body.password);
      if (!validation.valid) {
        throw new BadRequestException(validation.errors.join('. '));
      }
      rawPassword = body.password;
    } else {
      // Generate a readable temp password
      rawPassword = 'Temp' + Math.random().toString(36).slice(2, 6) + '@' + Math.floor(Math.random() * 900 + 100);
    }
    const passwordHash = await bcrypt.hash(rawPassword, 10);

    const user = await this.userRepo.save({
      email: body.email.toLowerCase().trim(),
      display_name: body.display_name || `${body.first_name || ''} ${body.last_name || ''}`.trim() || body.email.split('@')[0],
      first_name: body.first_name || null,
      last_name: body.last_name || null,
      phone_e164: body.phone_e164 || null,
      password_hash: passwordHash,
      must_change_password: true,
      status: UserStatus.ACTIVE,
    } as Partial<User>);

    // Create Firebase account so the user can log in
    try {
      await firebaseAdmin.auth().createUser({
        email: user.email,
        password: rawPassword,
        displayName: user.display_name,
      });
    } catch (e: any) {
      if (e.code !== 'auth/email-already-exists') {
        console.warn('Firebase account creation failed:', e.message);
      }
    }

    let assignment: RoleAssignment | null = null;
    if (body.role) {
      const isPlatformRole = ['platform_super_admin', 'app_super_admin', 'platform_secretary', 'app_secretary', 'platform_support', 'app_support'].includes(body.role);
      if (isPlatformRole && !this.isPlatformAdmin(req)) {
        throw new ForbiddenException('Only platform admins can assign platform roles');
      }
      assignment = await this.roleRepo.save({
        user_id: user.id,
        tenant_id: isPlatformRole ? null : (body.tenant_id || req.tenant_id || null),
        role: body.role as UserRole,
        is_active: true,
      } as Partial<RoleAssignment>) as RoleAssignment;
    }

    await this.auditRepo.save({
      actor_user_id: req.user?.uid || req.user?.dbUserId,
      tenant_id: body.tenant_id || req.tenant_id || null,
      action: AuditAction.USER_CREATE,
      entity_type: 'user',
      entity_id: user.id,
      after: { email: user.email, display_name: user.display_name, role: body.role },
      ip_address: req.ip,
      user_agent: req.headers?.['user-agent'],
    } as Partial<AuditEvent>);

    return {
      id: user.id,
      email: user.email,
      display_name: user.display_name,
      first_name: user.first_name,
      last_name: user.last_name,
      status: user.status,
      role_assignment: assignment,
      tempPassword: rawPassword,
    };
  }

  @Get('search')
  async searchUsers(@Req() req: any, @Query('q') query: string) {
    if (!query || query.length < 2) return [];

    if (this.isPlatformAdmin(req)) {
      return this.userRepo
        .createQueryBuilder('u')
        .select(['u.id', 'u.display_name', 'u.first_name', 'u.last_name', 'u.email'])
        .where('u.email ILIKE :q OR u.display_name ILIKE :q OR u.first_name ILIKE :q OR u.last_name ILIKE :q', { q: `%${query}%` })
        .take(20)
        .getMany();
    }

    const tenantId = req.tenant_id;
    if (!tenantId) return [];
    const assignments = await this.roleRepo.find({ where: { tenant_id: tenantId, is_active: true } });
    if (assignments.length === 0) return [];
    const userIds = [...new Set(assignments.map(a => a.user_id))];
    return this.userRepo
      .createQueryBuilder('u')
      .select(['u.id', 'u.display_name', 'u.first_name', 'u.last_name', 'u.email'])
      .where('u.id IN (:...ids)', { ids: userIds })
      .andWhere('(u.email ILIKE :q OR u.display_name ILIKE :q OR u.first_name ILIKE :q OR u.last_name ILIKE :q)', { q: `%${query}%` })
      .take(20)
      .getMany();
  }

  @Get('platform-roles')
  async listPlatformUsers(@Req() req: any) {
    if (!this.isPlatformAdmin(req)) {
      throw new ForbiddenException('Only platform admins can view platform roles');
    }

    const platformRoleValues = [
      UserRole.PLATFORM_SUPER_ADMIN, UserRole.PLATFORM_SECRETARY, UserRole.PLATFORM_SUPPORT,
      UserRole.APP_SUPER_ADMIN, UserRole.APP_SECRETARY, UserRole.APP_SUPPORT,
      UserRole.BRAND_ADMIN,
    ];

    const assignments = await this.roleRepo.find({ where: { role: In(platformRoleValues), is_active: true } });
    const userIds = [...new Set(assignments.map(a => a.user_id))];
    if (userIds.length === 0) return [];

    const users = await this.userRepo.findByIds(userIds);
    const userMap = Object.fromEntries(users.map(u => [u.id, u]));

    return assignments.map(a => ({
      id: a.id,
      role: a.role,
      user: userMap[a.user_id] ? {
        id: userMap[a.user_id].id,
        email: userMap[a.user_id].email,
        display_name: userMap[a.user_id].display_name,
      } : null,
    }));
  }

  @Post(':userId/roles')
  async assignPlatformRole(@Req() req: any, @Param('userId') userId: string, @Body() body: { role: string; tenant_id?: string }) {
    if (!this.isPlatformAdmin(req)) {
      throw new ForbiddenException('Only platform admins can assign platform roles');
    }
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (!body.role) throw new BadRequestException('Role is required');

    const assignment = await this.roleRepo.save({
      user_id: userId,
      tenant_id: body.tenant_id || null,
      role: body.role as UserRole,
      is_active: true,
    } as Partial<RoleAssignment>) as RoleAssignment;

    await this.auditRepo.save({
      actor_user_id: req.user?.uid || req.user?.dbUserId,
      action: AuditAction.ROLE_ASSIGN,
      entity_type: 'role_assignment',
      entity_id: assignment.id,
      after: { user_id: userId, role: body.role, tenant_id: body.tenant_id },
      ip_address: req.ip,
      user_agent: req.headers?.['user-agent'],
    } as Partial<AuditEvent>);

    return assignment;
  }

  @Get(':id')
  async getUser(@Req() req: any, @Param('id') id: string) {
    if (!this.canCreateUsers(req)) {
      throw new ForbiddenException('Insufficient permissions');
    }
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    const assignments = await this.roleRepo.find({
      where: { user_id: id, is_active: true },
      relations: ['tenant'],
    });

    return {
      id: user.id,
      email: user.email,
      display_name: user.display_name,
      first_name: user.first_name,
      last_name: user.last_name,
      phone_e164: user.phone_e164,
      status: user.status,
      created_at: user.created_at,
      roles: assignments.map(a => ({
        id: a.id,
        role: a.role,
        tenant_id: a.tenant_id,
        tenant_name: a.tenant?.school_name || null,
        tenant_slug: a.tenant?.tenant_slug || null,
        branch_id: a.branch_id,
      })),
    };
  }
}
