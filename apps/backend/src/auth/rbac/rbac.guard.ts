import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSION_KEY } from './require-permission.decorator';
import { PermissionService } from './permission.service';

@Injectable()
export class RbacGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private permissionService: PermissionService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredPermission = this.reflector.getAllAndOverride<string>(PERMISSION_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        // No permission required = allow (auth guard handles authentication)
        if (!requiredPermission) return true;

        const request = context.switchToHttp().getRequest();
        const userId = request.user?.uid || request.user?.dbUserId;
        const tenantId = request.tenant_id || request.params?.tenantId || null;

        if (!userId) {
            throw new ForbiddenException('Authentication required');
        }

        const hasPermission = await this.permissionService.hasPermission(userId, tenantId, requiredPermission);
        if (!hasPermission) {
            throw new ForbiddenException(`Missing permission: ${requiredPermission}`);
        }

        return true;
    }
}
