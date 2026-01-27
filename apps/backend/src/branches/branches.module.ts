import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Branch } from './branch.entity';
import { BranchesService } from './branches.service';

@Module({
    imports: [TypeOrmModule.forFeature([Branch])],
    providers: [BranchesService],
    exports: [BranchesService, TypeOrmModule],
})
export class BranchesModule { }
