import {
  Controller, Get, Post, Param, Query, Req, Res,
  UseGuards, UseInterceptors, UploadedFile,
  BadRequestException, ForbiddenException, NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DataSource } from 'typeorm';
import { Response } from 'express';
import { FirebaseAuthGuard } from '../../auth/firebase-auth.guard';
import { BulkImportService } from '../services/bulk-import.service';

const IMPORT_ROLES = [
  'platform_super_admin', 'brand_admin', 'tenant_admin',
  'main_branch_admin', 'branch_admin', 'hr_admin',
  'admissions_officer', 'finance_officer',
];

@UseGuards(FirebaseAuthGuard)
@Controller('admin/tenants/:tenantId/import')
export class AdminBulkImportController {
  constructor(
    private readonly bulkImportService: BulkImportService,
    private readonly dataSource: DataSource,
  ) {}

  private getRole(req: any): string {
    return req.user?.role || req.user?.customClaims?.role || '';
  }

  private canImport(req: any): boolean {
    const role = this.getRole(req);
    return IMPORT_ROLES.some(r => role.includes(r));
  }

  /**
   * Upload Excel file and create audit record
   * POST /v1/admin/tenants/:tenantId/import/upload?type=brand
   */
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
    fileFilter: (_req, file, cb) => {
      const allowed = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
      ];
      if (allowed.includes(file.mimetype) || file.originalname.endsWith('.xlsx')) {
        cb(null, true);
      } else {
        cb(new BadRequestException('Only .xlsx files are accepted'), false);
      }
    },
  }))
  async upload(
    @Param('tenantId') tenantId: string,
    @Query('type') importType: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    if (!this.canImport(req)) throw new ForbiddenException('Not authorized to import');
    if (!importType) throw new BadRequestException('Import type is required (?type=brand)');
    if (!file) throw new BadRequestException('File is required');

    // Verify strategy exists
    this.bulkImportService.getStrategy(importType);

    const userId = req.user?.sub || req.user?.uid || '';
    const audit = await this.bulkImportService.createAudit(
      importType, file.originalname, userId, tenantId,
    );

    // Store buffer temporarily on audit for validate/execute steps
    // In production, store to GCS and retrieve later
    (audit as any)._buffer = file.buffer;
    this._bufferCache.set(audit.id, file.buffer);

    return { auditId: audit.id, filename: file.originalname, importType };
  }

  // Temporary in-memory buffer cache (production: use GCS)
  private _bufferCache = new Map<string, Buffer>();

  /**
   * Validate uploaded file — returns preview with errors
   * POST /v1/admin/tenants/:tenantId/import/:auditId/validate
   */
  @Post(':auditId/validate')
  async validate(
    @Param('tenantId') tenantId: string,
    @Param('auditId') auditId: string,
    @Req() req: any,
  ) {
    if (!this.canImport(req)) throw new ForbiddenException('Not authorized to import');

    const buffer = this._bufferCache.get(auditId);
    if (!buffer) throw new BadRequestException('File not found. Please re-upload.');

    return this.dataSource.transaction(async manager => {
      return this.bulkImportService.validate(auditId, buffer, tenantId, manager);
    });
  }

  /**
   * Execute validated import
   * POST /v1/admin/tenants/:tenantId/import/:auditId/execute
   */
  @Post(':auditId/execute')
  async execute(
    @Param('tenantId') tenantId: string,
    @Param('auditId') auditId: string,
    @Req() req: any,
  ) {
    if (!this.canImport(req)) throw new ForbiddenException('Not authorized to import');

    const buffer = this._bufferCache.get(auditId);
    if (!buffer) throw new BadRequestException('File not found. Please re-upload.');

    const userId = req.user?.sub || req.user?.uid || '';

    const result = await this.dataSource.transaction(async manager => {
      return this.bulkImportService.execute(auditId, buffer, tenantId, userId, manager);
    });

    // Clean up buffer after successful execution
    this._bufferCache.delete(auditId);

    return result;
  }

  /**
   * Get import audit status
   * GET /v1/admin/tenants/:tenantId/import/:auditId
   */
  @Get(':auditId')
  async getAudit(
    @Param('auditId') auditId: string,
    @Req() req: any,
  ) {
    if (!this.canImport(req)) throw new ForbiddenException('Not authorized');
    return this.bulkImportService.getAudit(auditId);
  }

  /**
   * List import history for tenant
   * GET /v1/admin/tenants/:tenantId/import
   */
  @Get()
  async listAudits(
    @Param('tenantId') tenantId: string,
    @Query('limit') limit: string,
    @Req() req: any,
  ) {
    if (!this.canImport(req)) throw new ForbiddenException('Not authorized');
    return this.bulkImportService.listAudits(tenantId, parseInt(limit || '50', 10));
  }

  /**
   * Get available import types
   * GET /v1/admin/tenants/:tenantId/import/meta/types
   */
  @Get('meta/types')
  getTypes(@Req() req: any) {
    if (!this.canImport(req)) throw new ForbiddenException('Not authorized');
    return { types: this.bulkImportService.getRegisteredTypes() };
  }
}
