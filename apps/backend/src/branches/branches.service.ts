import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Branch } from './branch.entity';

@Injectable()
export class BranchesService {
    constructor(
        @InjectRepository(Branch)
        private readonly branchRepo: Repository<Branch>,
    ) { }

    // All queries MUST be tenant-scoped
    async findByTenant(tenant_id: string): Promise<Branch[]> {
        return this.branchRepo.find({ where: { tenant_id } });
    }

    async findMainBranch(tenant_id: string): Promise<Branch | null> {
        return this.branchRepo.findOne({ where: { tenant_id, is_main_branch: true } });
    }

    async findById(id: string, tenant_id: string): Promise<Branch | null> {
        // Enforce tenant scope - never return branch from different tenant
        return this.branchRepo.findOne({ where: { id, tenant_id } });
    }

    async create(tenant_id: string, data: Partial<Branch>): Promise<Branch> {
        const branch = this.branchRepo.create({ ...data, tenant_id });
        return this.branchRepo.save(branch);
    }

    async update(id: string, tenant_id: string, data: Partial<Branch>): Promise<Branch | null> {
        const branch = await this.findById(id, tenant_id);
        if (!branch) return null;
        Object.assign(branch, data);
        return this.branchRepo.save(branch);
    }
}
