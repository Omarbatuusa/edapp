import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantsService } from './tenants.service';
import { Tenant } from './tenant.entity';
import { TenantDomainType } from './tenant-domain.entity';

// Extend Request interface for tenant context
declare global {
    namespace Express {
        interface Request {
            tenant?: Tenant;
            tenant_id?: string;
            portal_type?: TenantDomainType;
        }
    }
}

@Injectable()
export class TenantsMiddleware implements NestMiddleware {
    constructor(private readonly tenantsService: TenantsService) { }

    async use(req: Request, res: Response, next: NextFunction) {
        const host = req.headers.host?.split(':')[0]?.toLowerCase(); // remove port, lowercase

        if (host) {
            // Skip tenant resolution for platform admin domain
            if (host === 'admin.edapp.co.za' || host === 'localhost' || host === 'app.edapp.co.za') {
                // No tenant context for discovery/admin
                return next();
            }

            // Look up tenant by host from tenant_domains table
            const result = await this.tenantsService.findByHost(host);

            if (result) {
                req.tenant = result.tenant;
                req.tenant_id = result.tenant.id;
                req.portal_type = result.portal_type;
                // console.log(`[TenantsMiddleware] Resolved tenant: ${result.tenant.tenant_slug} (${result.portal_type})`);
            } else {
                // Try to extract tenant slug from hostname pattern
                // Pattern: {tenant}.edapp.co.za or apply-{tenant}.edapp.co.za
                const match = host.match(/^(apply-)?([a-z0-9-]+)\.edapp\.co\.za$/);
                if (match) {
                    const slug = match[2];
                    const isApply = !!match[1];
                    const tenant = await this.tenantsService.findBySlug(slug);
                    if (tenant) {
                        req.tenant = tenant;
                        req.tenant_id = tenant.id;
                        req.portal_type = isApply ? TenantDomainType.APPLY : TenantDomainType.APP;
                    }
                }
            }
        }

        next();
    }
}
