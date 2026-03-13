import {
  Controller, Get, Param, Res, Req,
  UseGuards, ForbiddenException, BadRequestException,
} from '@nestjs/common';
import { FirebaseAuthGuard } from '../../auth/firebase-auth.guard';
import { TemplateGeneratorService } from '../services/template-generator.service';

const TEMPLATE_ROLES = [
  'platform_super_admin', 'brand_admin', 'tenant_admin',
  'main_branch_admin', 'branch_admin', 'hr_admin',
  'admissions_officer', 'finance_officer',
];

@UseGuards(FirebaseAuthGuard)
@Controller('admin/templates')
export class AdminTemplateController {
  constructor(private readonly templateService: TemplateGeneratorService) {}

  private getRole(req: any): string {
    return req.user?.role || req.user?.customClaims?.role || '';
  }

  private canAccess(req: any): boolean {
    const role = this.getRole(req);
    return TEMPLATE_ROLES.some(r => role.includes(r));
  }

  /**
   * List available template types
   * GET /v1/admin/templates
   */
  @Get()
  listTypes(@Req() req: any) {
    if (!this.canAccess(req)) throw new ForbiddenException('Not authorized');
    return { types: this.templateService.getRegisteredTypes() };
  }

  /**
   * Download template as .xlsx
   * GET /v1/admin/templates/:type
   */
  @Get(':type')
  async download(
    @Param('type') type: string,
    @Res() res: any,
    @Req() req: any,
  ) {
    if (!this.canAccess(req)) throw new ForbiddenException('Not authorized');

    const buffer = await this.templateService.generateTemplate(type);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=edapp-${type}-template.xlsx`);
    res.setHeader('Content-Length', buffer.length);
    res.end(buffer);
  }
}
