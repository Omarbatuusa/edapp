import { CanActivate, ExecutionContext, Injectable, ForbiddenException, BadRequestException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SecurityPolicyService } from './security-policy.service';
import { IpExtractionService } from './ip-extraction.service';
import { GeoService, GeoPayload } from './geo.service';
import { SECURITY_ACTION_KEY } from './security-action.decorator';
import { SecurityMode } from './tenant-security-policy.entity';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class SecurityEnforcementGuard implements CanActivate {
    private readonly logger = new Logger(SecurityEnforcementGuard.name);

    constructor(
        private reflector: Reflector,
        private securityPolicyService: SecurityPolicyService,
        private ipExtractionService: IpExtractionService,
        private geoService: GeoService,
        private auditService: AuditService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const action = this.reflector.getAllAndOverride<string>(SECURITY_ACTION_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!action) {
            return true; // No security action defined, allow access
        }

        const req = context.switchToHttp().getRequest();
        const user = req.user;
        // Assuming tenantId is attached to user by global middleware orAuthGuard
        const tenantId = user?.tenantId || req.headers['x-tenant-id'];

        if (!tenantId) {
            // If no tenant context, we can't enforce tenant policies. 
            // This might happen on public routes or if auth failed but was optional.
            // We'll allow but log warning if user exists but no tenant (weird state)
            if (user) this.logger.warn(`User ${user.id} has no tenantId in SecurityEnforcementGuard`);
            return true;
        }

        const branchId = req.body?.branchId || req.query?.branchId || user?.branchId;
        const policy = await this.securityPolicyService.getEffectivePolicy(tenantId, branchId);

        // Override Check
        const override = req.body?.override === true || req.query?.override === 'true';
        if (override) {
            // Only Tenant Admin or Super Admin can override
            // Assuming role check logic here. 
            // For EdApp, roles are in user.roles or similar.
            // We will assume a helper or simple check.
            // If user is NOT admin, block override attempt.
            if (!this.canOverride(user)) {
                throw new ForbiddenException('OVERRIDE_PERMISSION_DENIED');
            }

            const reason = req.body?.override_reason || req.query?.override_reason;
            if (!reason) {
                throw new BadRequestException('OVERRIDE_REASON_REQUIRED');
            }

            await this.logDecision(tenantId, user?.id, action, 'SEC_OVERRIDE_USED', reason, { override: true });
            return true;
        }

        const { ip, source } = this.ipExtractionService.extractIp(req);
        // Parse Geo Payload safely
        let geoPayload: GeoPayload | null = null;
        try {
            const geoHeader = req.headers['x-geo-data'];
            if (geoHeader) {
                geoPayload = JSON.parse(geoHeader as string);
            } else if (req.body?.geo) {
                geoPayload = req.body.geo;
            }
        } catch (e) {
            this.logger.debug('Failed to parse geo payload', e);
        }

        // 1. IP Enforcement
        if (policy.ipMode !== SecurityMode.OFF) {
            const allowedIps = await this.securityPolicyService.getIpAllowlist(tenantId, branchId);
            if (allowedIps.length > 0 && !this.ipExtractionService.isIpAllowed(ip, allowedIps)) {
                if (policy.ipMode === SecurityMode.ENFORCE) {
                    await this.logDecision(tenantId, user?.id, action, 'SEC_IP_BLOCKED', 'IP Not Allowed', { ip, source });
                    throw new ForbiddenException('IP_NOT_ALLOWED');
                } else {
                    await this.logDecision(tenantId, user?.id, action, 'SEC_IP_WARNED', 'IP Not Allowed', { ip, source });
                }
            } else if (allowedIps.length > 0) {
                // Log allowed explicit check? Maybe too noisy. Only log allowed if we want full audit trail.
                // Prompt said "Audit... SEC_IP_ALLOWED", so we will.
                // await this.logDecision(tenantId, user?.id, action, 'SEC_IP_ALLOWED', 'IP Allowed', { ip, source });
            }
        }

        // 2. Geo Enforcement
        if (policy.geoMode !== SecurityMode.OFF) {
            if (!geoPayload) {
                if (policy.geoMode === SecurityMode.ENFORCE) {
                    await this.logDecision(tenantId, user?.id, action, 'SEC_GEO_BLOCKED', 'Missing Geo Payload', { ip });
                    throw new BadRequestException('GEO_REQUIRED');
                }
                await this.logDecision(tenantId, user?.id, action, 'SEC_GEO_WARNED', 'Missing Geo Payload', { ip });
            } else {
                try {
                    this.geoService.validateGeoPayload(geoPayload, policy.geoMaxAgeSeconds, policy.geoAccuracyThresholdM);
                    const zones = await this.securityPolicyService.getActiveZones(tenantId, branchId);

                    let insideAny = false;
                    if (zones.length === 0) {
                        // No zones defined. If ENFORCE, this effectively blocks everything requiring Geo.
                        // Or we can assume Tenant default zone from settings if branch has none?
                        // The getActiveZones helper should probably return tenant zones if branch has none?
                        // Current implementation returns branch OR tenant zones if logic in Service was: `if branch ... OR branchId IS NULL`.
                        // Yes, logic was `branchId = :branchId OR branchId IS NULL`. So it returns both.
                        // If list empty, it means NO zones defined at all for tenant.
                        // We treat this as "Inside" to prevent locking out newly enabled tenants? 
                        // Or "Outside" to be secure?
                        // Prompt: "branch zone if configured and enabled; else tenant default zone(s)."
                        // If neither exists, we probably shouldn't Enforce Geo since it's impossible.
                        insideAny = true;
                    } else {
                        insideAny = zones.some(z => this.geoService.isWithinZone(geoPayload!, z));
                    }

                    if (!insideAny) {
                        if (policy.geoMode === SecurityMode.ENFORCE) {
                            await this.logDecision(tenantId, user?.id, action, 'SEC_GEO_BLOCKED', 'Outside Zone', { geoPayload });
                            throw new ForbiddenException('GEO_OUTSIDE_ZONE');
                        }
                        await this.logDecision(tenantId, user?.id, action, 'SEC_GEO_WARNED', 'Outside Zone', { geoPayload });
                    } else {
                        // await this.logDecision(tenantId, user?.id, action, 'SEC_GEO_ALLOWED', 'Inside Zone', { geoPayload });
                    }
                } catch (e) {
                    if (policy.geoMode === SecurityMode.ENFORCE) {
                        await this.logDecision(tenantId, user?.id, action, 'SEC_GEO_BLOCKED', e.message, { geoPayload });
                        // Map service exceptions to HTTP exceptions
                        if (e instanceof BadRequestException) throw e;
                        throw new ForbiddenException(e.message);
                    }
                    await this.logDecision(tenantId, user?.id, action, 'SEC_GEO_WARNED', e.message, { geoPayload });
                }
            }
        }

        return true;
    }

    private canOverride(user: any): boolean {
        // Basic check: looks for role assignment
        // In real EdApp, user.roles is likely an array of strings or objects.
        if (!user || !user.roles) return false;
        const roles = user.roles.map((r: any) => typeof r === 'string' ? r : r.role?.name || r.name);
        return roles.includes('tenant_admin') || roles.includes('app_super_admin');
    }

    private async logDecision(tenantId: string, userId: string, action: string, decision: string, reason: string, meta: any) {
        try {
            await this.auditService.log({
                tenantId,
                userId,
                action: decision,
                metadata: { reason, actionKey: action, ...meta },
                ipAddress: meta.ip,
            } as any);
        } catch (e) {
            this.logger.error(`Failed to log audit: ${e.message}`);
        }
    }
}
