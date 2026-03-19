import {
    Controller, Get, Put, Delete, Param, Body, Req,
    UseGuards, ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IllustrationOverride } from './illustration-override.entity';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { StorageService } from '../storage/storage.service';

const SUPER_ADMIN_ROLES = ['platform_super_admin', 'app_super_admin'];

@Controller('admin/illustrations')
@UseGuards(FirebaseAuthGuard)
export class AdminIllustrationsController {
    constructor(
        @InjectRepository(IllustrationOverride)
        private readonly repo: Repository<IllustrationOverride>,
        private readonly storageService: StorageService,
    ) {}

    private checkSuperAdmin(req: any) {
        const role = req.user?.role || req.user?.customClaims?.role || '';
        if (!SUPER_ADMIN_ROLES.some(r => role.includes(r))) {
            throw new ForbiddenException('Only super admins can manage illustrations');
        }
    }

    /** Get all overrides with fresh signed URLs */
    @Get()
    async findAll() {
        const overrides = await this.repo.find();
        const results: Record<string, string> = {};
        for (const o of overrides) {
            try {
                const url = await this.storageService.generateSignedReadUrl(o.object_key);
                if (url) results[o.slot_key] = url;
            } catch { /* skip if GCS unavailable */ }
        }
        return results;
    }

    /** Get a single override's signed URL */
    @Get(':slotKey')
    async findOne(@Param('slotKey') slotKey: string) {
        const override = await this.repo.findOne({ where: { slot_key: slotKey } });
        if (!override) return { url: null, object_key: null };
        try {
            const url = await this.storageService.generateSignedReadUrl(override.object_key);
            return { url, object_key: override.object_key };
        } catch {
            return { url: null, object_key: override.object_key };
        }
    }

    /** Set or update an illustration override */
    @Put(':slotKey')
    async upsert(
        @Req() req: any,
        @Param('slotKey') slotKey: string,
        @Body() body: { object_key: string },
    ) {
        this.checkSuperAdmin(req);
        const existing = await this.repo.findOne({ where: { slot_key: slotKey } });
        if (existing) {
            existing.object_key = body.object_key;
            return this.repo.save(existing);
        }
        const fresh = new IllustrationOverride();
        fresh.slot_key = slotKey;
        fresh.object_key = body.object_key;
        return this.repo.save(fresh);
    }

    /** Remove an illustration override (revert to default) */
    @Delete(':slotKey')
    async remove(@Req() req: any, @Param('slotKey') slotKey: string) {
        this.checkSuperAdmin(req);
        await this.repo.delete({ slot_key: slotKey });
        return { deleted: true };
    }
}
