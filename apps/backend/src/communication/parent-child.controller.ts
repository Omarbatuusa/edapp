import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { ParentChildService } from './parent-child.service';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';

// ============================================================
// PARENT-CHILD CONTROLLER - Parent-child link endpoints
// All endpoints secured via FirebaseAuthGuard
// ============================================================

@Controller('api/v1/parent-children')
@UseGuards(FirebaseAuthGuard)
export class ParentChildController {
    constructor(private readonly parentChildService: ParentChildService) { }

    // Get my children (for parent users)
    @Get('my-children')
    async getMyChildren(@Req() req: any) {
        return this.parentChildService.getChildrenForParent(req.tenant_id, req.user.uid);
    }

    // Link a parent to a child (admin/staff)
    @Post('link')
    async link(
        @Body() body: { parent_user_id: string; child_user_id: string },
        @Req() req: any,
    ) {
        return this.parentChildService.link(req.tenant_id, body.parent_user_id, body.child_user_id);
    }
}
