import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantsService } from './tenants.service';

// Extend Request interface
declare global {
    namespace Express {
        interface Request {
            tenant?: any; // typed correctly in real app
        }
    }
}

@Injectable()
export class TenantsMiddleware implements NestMiddleware {
    constructor(private readonly tenantsService: TenantsService) { }

    async use(req: Request, res: Response, next: NextFunction) {
        const host = req.headers.host?.split(':')[0]; // remove port if present
        if (host) {
            const tenant = await this.tenantsService.findByHost(host);
            if (tenant) {
                req.tenant = tenant;
                // console.log(`[TenantsMiddleware] Found tenant: ${tenant.slug} for host: ${host}`);
            } else {
                // console.log(`[TenantsMiddleware] No tenant found for host: ${host}`);
            }
        }
        next();
    }
}
