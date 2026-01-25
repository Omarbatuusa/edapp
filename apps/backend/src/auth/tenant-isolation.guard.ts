import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class TenantIsolationGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest<Request>();

        // Extract tenant from Host header
        const host = request.headers.host || '';
        const tenantFromHost = this.extractTenantFromHost(host);

        // Get user from request (set by auth middleware)
        const user = (request as any).user;

        if (!user) {
            // No user authenticated, allow (auth guard will handle)
            return true;
        }

        // Platform admins can access any tenant
        if (user.role === 'platform_admin') {
            return true;
        }

        // Check if user's tenant matches the requested tenant
        if (user.tenantSlug !== tenantFromHost) {
            throw new ForbiddenException('Access denied: Tenant mismatch');
        }

        return true;
    }

    private extractTenantFromHost(host: string): string | null {
        // Remove port if present
        const hostname = host.split(':')[0];

        // app.edapp.co.za -> null (discovery only)
        if (hostname === 'app.edapp.co.za' || hostname === 'localhost') {
            return null;
        }

        // admin.edapp.co.za -> null (platform admin)
        if (hostname === 'admin.edapp.co.za') {
            return null;
        }

        // {tenant}.edapp.co.za -> tenant
        const parts = hostname.split('.');
        if (parts.length >= 3 && parts[parts.length - 2] === 'edapp') {
            const subdomain = parts[0];

            // apply-{tenant}.edapp.co.za -> tenant
            if (subdomain.startsWith('apply-')) {
                return subdomain.replace('apply-', '');
            }

            return subdomain;
        }

        return null;
    }
}
