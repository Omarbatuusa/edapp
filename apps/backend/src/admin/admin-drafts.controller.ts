import { Controller, Post, Put, Get, Delete, Param, Body, Query, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminDraft, DraftFormType } from './admin-draft.entity';

@Controller('admin/drafts')
export class AdminDraftsController {
    constructor(
        @InjectRepository(AdminDraft)
        private readonly draftRepo: Repository<AdminDraft>,
    ) {}

    @Post()
    async create(
        @Body() body: { form_type: DraftFormType; tenant_id?: string; user_id?: string; data?: Record<string, any> },
    ) {
        if (!body.form_type || !Object.values(DraftFormType).includes(body.form_type)) {
            throw new BadRequestException('Invalid form_type');
        }

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const draft = this.draftRepo.create({
            form_type: body.form_type,
            tenant_id: body.tenant_id ?? undefined,
            user_id: body.user_id ?? undefined,
            data: body.data || {},
            current_step: 1,
            expires_at: expiresAt,
        } as Partial<AdminDraft>);

        const saved = await this.draftRepo.save(draft as AdminDraft);
        return { draft_id: (saved as AdminDraft).id };
    }

    /** List drafts by form_type and/or tenant_id — must be declared BEFORE :id route */
    @Get()
    async findByFormType(
        @Query('form_type') formType?: string,
        @Query('tenant_id') tenantId?: string,
    ) {
        const where: any = {};
        if (formType) where.form_type = formType as DraftFormType;
        if (tenantId) where.tenant_id = tenantId;

        const drafts = await this.draftRepo.find({ where, order: { updated_at: 'DESC' } });

        const now = new Date();
        const valid: AdminDraft[] = [];
        const expired: AdminDraft[] = [];
        for (const d of drafts) {
            (d.expires_at > now ? valid : expired).push(d);
        }
        if (expired.length) await this.draftRepo.remove(expired);
        return valid;
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const draft = await this.draftRepo.findOne({ where: { id } });
        if (!draft) throw new NotFoundException('Draft not found');

        if (draft.expires_at < new Date()) {
            await this.draftRepo.remove(draft);
            throw new NotFoundException('Draft has expired');
        }

        return draft;
    }

    @Put(':id')
    async update(
        @Param('id') id: string,
        @Body() body: { current_step?: number; data?: Record<string, any> },
    ) {
        const draft = await this.draftRepo.findOne({ where: { id } });
        if (!draft) throw new NotFoundException('Draft not found');

        if (draft.expires_at < new Date()) {
            await this.draftRepo.remove(draft);
            throw new NotFoundException('Draft has expired');
        }

        if (body.current_step !== undefined) draft.current_step = body.current_step;
        if (body.data !== undefined) draft.data = { ...draft.data, ...body.data };

        await this.draftRepo.save(draft);
        return { ok: true };
    }

    /** Delete a draft — silent success if not found (frontend clears sessionStorage either way) */
    @Delete(':id')
    async remove(@Param('id') id: string) {
        const draft = await this.draftRepo.findOne({ where: { id } });
        if (draft) await this.draftRepo.remove(draft);
        return { deleted: true };
    }
}
