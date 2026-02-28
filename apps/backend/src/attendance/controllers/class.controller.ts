import { Controller, Post, Get, Patch, Body, Param, Query, Req } from '@nestjs/common';
import { ClassService } from '../services/class.service';

@Controller('classes')
export class ClassController {
    constructor(private classService: ClassService) {}

    @Post()
    async create(@Body() dto: any, @Req() req: any) {
        const tenant_id = req.tenant_id;
        const cls = await this.classService.createClass(tenant_id, dto);
        return { status: 'success', class: cls };
    }

    @Get()
    async list(
        @Req() req: any,
        @Query('branch_id') branch_id?: string,
        @Query('grade_id') grade_id?: string,
        @Query('academic_year') academic_year?: string,
    ) {
        const tenant_id = req.tenant_id;
        const classes = await this.classService.listClasses(tenant_id, branch_id, {
            grade_id,
            is_active: true,
            academic_year,
        });
        return { classes };
    }

    @Get(':id')
    async get(@Param('id') id: string, @Req() req: any) {
        const tenant_id = req.tenant_id;
        const cls = await this.classService.getClass(tenant_id, id);
        return { class: cls };
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() dto: any, @Req() req: any) {
        const tenant_id = req.tenant_id;
        const cls = await this.classService.updateClass(tenant_id, id, dto);
        return { status: 'success', class: cls };
    }
}
