import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ParentChildLink } from './parent-child-link.entity';

// ============================================================
// PARENT-CHILD SERVICE - Parent-child link management
// ============================================================

@Injectable()
export class ParentChildService {
    constructor(
        @InjectRepository(ParentChildLink)
        private linkRepo: Repository<ParentChildLink>,
    ) { }

    // Link a parent to a child
    async link(tenant_id: string, parent_user_id: string, child_user_id: string): Promise<ParentChildLink> {
        const existing = await this.linkRepo.findOne({
            where: { tenant_id, parent_user_id, child_user_id },
        });
        if (existing) return existing;

        const link = this.linkRepo.create({ tenant_id, parent_user_id, child_user_id });
        return this.linkRepo.save(link);
    }

    // Get children for a parent
    async getChildrenForParent(tenant_id: string, parent_user_id: string): Promise<ParentChildLink[]> {
        return this.linkRepo.find({
            where: { tenant_id, parent_user_id },
            relations: ['child'],
        });
    }

    // Get parents for a child
    async getParentsForChild(tenant_id: string, child_user_id: string): Promise<ParentChildLink[]> {
        return this.linkRepo.find({
            where: { tenant_id, child_user_id },
            relations: ['parent'],
        });
    }
}
