import {
    Controller, Get, Put, Post, Param, Body, Req, UseGuards,
    ForbiddenException, NotFoundException, UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileInterceptor } from '@nestjs/platform-express';
import { FirebaseAuthGuard } from '../../auth/firebase-auth.guard';
import { StorageService } from '../../storage/storage.service';
import { PlatformSettings } from '../entities/platform-settings.entity';

const SUPER_ROLES = ['platform_super_admin', 'app_super_admin'];

@Controller('admin/platform-settings')
@UseGuards(FirebaseAuthGuard)
export class AdminPlatformSettingsController {
    constructor(
        @InjectRepository(PlatformSettings)
        private readonly settingsRepo: Repository<PlatformSettings>,
        private readonly storageService: StorageService,
    ) {}

    private getRole(req: any): string {
        return req.user?.role || req.user?.customClaims?.role || '';
    }

    private checkSuperAdmin(req: any) {
        const role = this.getRole(req);
        if (!SUPER_ROLES.some(r => role.includes(r))) {
            throw new ForbiddenException('Only platform super admins can modify settings');
        }
    }

    /** GET /admin/platform-settings — public readable (for logo etc.) */
    @Get()
    async getAll() {
        const settings = await this.settingsRepo.find();
        const result: Record<string, any> = {};
        for (const s of settings) result[s.key] = s.value;
        return result;
    }

    /** GET /admin/platform-settings/:key */
    @Get(':key')
    async getOne(@Param('key') key: string) {
        const setting = await this.settingsRepo.findOne({ where: { key } });
        if (!setting) throw new NotFoundException(`Setting '${key}' not found`);
        return { key: setting.key, value: setting.value };
    }

    /** PUT /admin/platform-settings/:key — super admin only */
    @Put(':key')
    async update(@Req() req: any, @Param('key') key: string, @Body() body: { value: any }) {
        this.checkSuperAdmin(req);
        let setting = await this.settingsRepo.findOne({ where: { key } });
        if (setting) {
            setting.value = body.value;
        } else {
            setting = this.settingsRepo.create({ key, value: body.value });
        }
        return this.settingsRepo.save(setting);
    }

    /** POST /admin/platform-settings/logo — upload platform logo */
    @Post('logo')
    @UseInterceptors(FileInterceptor('file'))
    async uploadLogo(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
        this.checkSuperAdmin(req);
        if (!file) throw new ForbiddenException('No file uploaded');

        const allowed = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'];
        if (!allowed.includes(file.mimetype)) {
            throw new ForbiddenException('File type not allowed. Use PNG, JPEG, SVG, or WebP.');
        }

        // Upload to GCS
        const objectKey = `uploads/platform-logos/${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
        await this.storageService.uploadBuffer(objectKey, file.buffer, file.mimetype);
        const fileKey = objectKey;

        // Save setting
        let setting = await this.settingsRepo.findOne({ where: { key: 'platform_logo' } });
        if (setting) {
            setting.value = { file_key: fileKey, mime: file.mimetype, name: file.originalname };
        } else {
            setting = this.settingsRepo.create({
                key: 'platform_logo',
                value: { file_key: fileKey, mime: file.mimetype, name: file.originalname },
            });
        }
        await this.settingsRepo.save(setting);

        // Generate read URL
        let url: string | null = null;
        try { url = await this.storageService.generateSignedReadUrl(fileKey); } catch {}

        return { success: true, file_key: fileKey, url };
    }
}
