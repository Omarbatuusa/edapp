import { Controller, Post, Get, Body, Param, Query, Req } from '@nestjs/common';
import { ClassRegisterService } from '../services/class-register.service';
import { RegisterMark } from '../entities/class-register.entity';

@Controller('attendance/register')
export class ClassRegisterController {
    constructor(private registerService: ClassRegisterService) {}

    @Post()
    async submitRegister(
        @Body() body: { class_id: string; date: string; marks: RegisterMark[] },
        @Req() req: any,
    ) {
        const tenant_id = req.tenant_id;
        const teacher_id = req.user?.id;
        // Derive branch_id from class or request
        const branch_id = req.body?.branch_id || '';

        const register = await this.registerService.submitRegister(
            tenant_id, branch_id, body.class_id, body.date, teacher_id, body.marks,
        );
        return { status: 'success', register };
    }

    @Get('my-classes')
    async getMyClasses(@Req() req: any) {
        const tenant_id = req.tenant_id;
        const teacher_id = req.user?.id;
        const classes = await this.registerService.getTeacherClasses(tenant_id, teacher_id);
        return { classes };
    }

    @Get(':classId/:date')
    async getRegister(
        @Param('classId') classId: string,
        @Param('date') date: string,
        @Req() req: any,
    ) {
        const tenant_id = req.tenant_id;
        const register = await this.registerService.getRegister(tenant_id, classId, date);
        return { register };
    }
}
