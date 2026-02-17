import { Controller, Get, Param, Query, UseGuards, Req } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { RoleAssignment } from './role-assignment.entity';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';

@Controller('api/v1/users')
@UseGuards(FirebaseAuthGuard)
export class UsersController {
    constructor(
        @InjectRepository(User)
        private usersRepo: Repository<User>,
        @InjectRepository(RoleAssignment)
        private rolesRepo: Repository<RoleAssignment>,
    ) {}

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
