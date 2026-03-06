import { Controller, Get, Param, Query, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { RoleAssignment } from './role-assignment.entity';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';

@Controller('users')
@UseGuards(FirebaseAuthGuard)
export class UsersController {
    constructor(
        @InjectRepository(User)
        private usersRepo: Repository<User>,
        @InjectRepository(RoleAssignment)
        private rolesRepo: Repository<RoleAssignment>,
    ) {}

    @Get('me')
    async getMe(@Req() req: any) {
        const userId = req.user?.dbUserId || req.user?.uid;
        if (!userId) throw new UnauthorizedException('User not resolved');

        const user = await this.usersRepo.findOne({ where: { id: userId } });
        if (!user) throw new UnauthorizedException('User not found');

        const assignments = await this.rolesRepo.find({
            where: { user_id: userId, is_active: true },
            relations: ['tenant', 'branch'],
        });

        return {
            id: user.id,
            email: user.email,
            display_name: user.display_name,
            first_name: user.first_name,
            last_name: user.last_name,
            roles: assignments.map(a => ({
                id: a.id,
                role: a.role,
                tenant_id: a.tenant_id,
                tenant_name: a.tenant?.school_name || null,
                tenant_slug: a.tenant?.tenant_slug || null,
                branch_id: a.branch_id,
                branch_name: a.branch?.branch_name || null,
                is_active: a.is_active,
            })),
        };
    }

    @Get('by-role/:role')
    async getByRole(
        @Req() req: any,
        @Param('role') role: string,
    ) {
        const assignments = await this.rolesRepo.find({
            where: { tenant_id: req.tenant_id, role: role as any, is_active: true },
        });

        if (assignments.length === 0) return [];

        const userIds = assignments.map(a => a.user_id);
        const users = await this.usersRepo
            .createQueryBuilder('u')
            .select(['u.id', 'u.display_name', 'u.first_name', 'u.last_name', 'u.email'])
            .where('u.id IN (:...ids)', { ids: userIds })
            .getMany();

        return users.map(u => ({
            id: u.id,
            display_name: u.display_name,
            first_name: u.first_name,
            last_name: u.last_name,
        }));
    }

    @Get('search')
    async search(
        @Req() req: any,
        @Query('q') query: string,
    ) {
        if (!query || query.length < 2) return [];

        const assignments = await this.rolesRepo.find({
            where: { tenant_id: req.tenant_id, is_active: true },
        });

        if (assignments.length === 0) return [];

        const userIds = assignments.map(a => a.user_id);
        const users = await this.usersRepo
            .createQueryBuilder('u')
            .select(['u.id', 'u.display_name', 'u.first_name', 'u.last_name'])
            .where('u.id IN (:...ids)', { ids: userIds })
            .andWhere('(u.display_name ILIKE :q OR u.first_name ILIKE :q OR u.last_name ILIKE :q)', { q: `%${query}%` })
            .getMany();

        return users.map(u => ({
            id: u.id,
            display_name: u.display_name,
            first_name: u.first_name,
            last_name: u.last_name,
        }));
    }
}
