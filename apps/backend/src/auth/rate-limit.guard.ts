import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuditService } from '../audit/audit.service';
import { Request } from 'express';

@Injectable()
export class RateLimitGuard implements CanActivate {
    constructor(
        private auditService: AuditService,
        private reflector: Reflector,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();

        // Get rate limit config from decorator (if any)
        const limit = this.reflector.get<number>('rateLimit', context.getHandler()) || 10;
        const windowMinutes = this.reflector.get<number>('rateLimitWindow', context.getHandler()) || 60;

        // Create identifier from IP + User-Agent (simple fingerprint)
        const ipAddress = request.ip || request.socket.remoteAddress || 'unknown';
        const userAgent = request.headers['user-agent'] || 'unknown';
        const identifier = `${ipAddress}:${userAgent}`;

        // Get action from route
        const action = `rate_limit_${request.path}`;

        // Check recent attempts
        const attempts = await this.auditService.getRecentAttempts(
            action,
            identifier,
            windowMinutes,
        );

        if (attempts >= limit) {
            // Log rate limit exceeded
            await this.auditService.log({
                action: 'rate_limit_exceeded',
                metadata: { identifier, path: request.path, attempts },
                ipAddress,
                userAgent,
            });

            throw new HttpException(
                {
                    statusCode: HttpStatus.TOO_MANY_REQUESTS,
                    message: 'Too many requests. Please try again later.',
                    retryAfter: windowMinutes * 60, // seconds
                },
                HttpStatus.TOO_MANY_REQUESTS,
            );
        }

        // Log this attempt
        await this.auditService.log({
            action,
            metadata: { identifier },
            ipAddress,
            userAgent,
        });

        return true;
    }
}

// Decorator to set rate limit
export const RateLimit = (limit: number, windowMinutes: number = 60) => {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        Reflect.defineMetadata('rateLimit', limit, descriptor.value);
        Reflect.defineMetadata('rateLimitWindow', windowMinutes, descriptor.value);
        return descriptor;
    };
};
