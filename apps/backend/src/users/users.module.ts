import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { RoleAssignment } from './role-assignment.entity';
import { UsersService } from './users.service';

@Module({
    imports: [TypeOrmModule.forFeature([User, RoleAssignment])],
    providers: [UsersService],
    exports: [TypeOrmModule, UsersService],
})
export class UsersModule { }
