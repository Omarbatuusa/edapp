import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';

/** Platform-scoped roles that can access any tenant */
const PLATFORM_ROLES = [
    'platform_super_admin', 'app_super_admin',
    'platform_secretary', 'app_secretary',
    'platform_support', 'app_support',
    'brand_admin',
];

@Injectable()
export class TenantIsolationGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest<Request>();

        // Extract tenant from Host header
        const host = request.headers.host || '';
        const tenantFromHost = this.extractTenantFromHost(host);

        // No tenant context (platform admin domain or discovery) — allow
        if (!tenantFromHost) return true;

        // Get user from request (set by auth middleware)
        const user = (request as any).user;
        if (!user) return true; // No user yet — auth guard will handle

        // Platform admins can access any tenant
        const userRole = user.role || '';
        if (PLATFORM_ROLES.some(r => userRole.includes(r))) {
            return true;
        }

        // Non-platform users: tenant from JWT must match host tenant
        const userTenant = user.tenant || user.tenantSlug || '';
        if (userTenant && userTenant !== tenantFromHost) {
            throw new ForbiddenException('Access denied: Tenant mismatch');
        }

        return true;
    }

    private extractTenantFromHost(host: string): string | null {
        const hostname = host.split(':')[0];

        if (hostname === 'app.edapp.co.za' || hostname === 'localhost') return null;
        if (hostname === 'admin.edapp.co.za') return null;

        const parts = hostname.split('.');
        if (parts.length >= 3 && parts[parts.length - 2] === 'edapp') {
            const subdomain = parts[0];
            if (subdomain.startsWith('apply-')) return subdomain.replace('apply-', '');
            return subdomain;
        }

        return null;
    }
}
