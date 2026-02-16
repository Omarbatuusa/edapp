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
        const tenantId = user?.tenantId || req.headers['x-tenant-id'];

        if (!tenantId) {
            if (user) this.logger.warn(`User ${user.id} has no tenantId in SecurityEnforcementGuard`);
            return true;
        }

        const branchId = req.body?.branchId || req.query?.branchId || user?.branchId;
        const policy = await this.securityPolicyService.getEffectivePolicy(tenantId, branchId);

        // Prepare Decision Object
        const decisionResults = {
            allowed: true,
            flagged: false,
            reasons: [] as string[],
            decision: 'ALLOW', // ALLOW, ALLOW_FLAGGED, BLOCK
            geo: null as any,
            ip: '',
        };

        // Override Check
        const override = req.body?.override === true || req.query?.override === 'true';
        if (override) {
            if (!this.canOverride(user)) {
                throw new ForbiddenException('OVERRIDE_PERMISSION_DENIED');
            }
            const reason = req.body?.override_reason || req.query?.override_reason;
            if (!reason) {
                throw new BadRequestException('OVERRIDE_REASON_REQUIRED');
            }
            await this.logDecision(tenantId, user?.id, action, 'SEC_OVERRIDE_USED', reason, { override: true });

            // Allow but mark as overridden
            req.securityDecision = { ...decisionResults, decision: 'ALLOW', overrideReason: reason };
            return true;
        }

        const { ip, source } = this.ipExtractionService.extractIp(req);
        decisionResults.ip = ip;

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
        decisionResults.geo = geoPayload;

        // 1. IP Enforcement
        if (policy.ipMode !== SecurityMode.OFF) {
            const allowedIps = await this.securityPolicyService.getIpAllowlist(tenantId, branchId);
            if (allowedIps.length > 0 && !this.ipExtractionService.isIpAllowed(ip, allowedIps)) {
                if (policy.ipMode === SecurityMode.ENFORCE) {
                    decisionResults.allowed = false;
                    decisionResults.reasons.push('IP_NOT_ALLOWED');
                    decisionResults.decision = 'BLOCK';
                } else {
                    decisionResults.flagged = true;
                    decisionResults.reasons.push('IP_NOT_ALLOWED');
                    decisionResults.decision = 'ALLOW_FLAGGED';
                }
            }
        }

        // 2. Geo Enforcement
        if (policy.geoMode !== SecurityMode.OFF && decisionResults.allowed) {
            const isStaff = this.checkRole(user, 'staff');
            const isLearner = this.checkRole(user, 'learner');

            let required = false;
            if (isStaff && policy.geoRequiredForStaff) required = true;
            if (isLearner && policy.geoRequiredForLearners) required = true;

            if (required) {
                if (!geoPayload) {
                    if (policy.geoMode === SecurityMode.ENFORCE) {
                        decisionResults.allowed = false;
                        decisionResults.reasons.push('GEO_MISSING');
                        decisionResults.decision = 'BLOCK';
                    } else {
                        decisionResults.flagged = true;
                        decisionResults.reasons.push('GEO_MISSING');
                        if (decisionResults.decision !== 'BLOCK') decisionResults.decision = 'ALLOW_FLAGGED';
                    }
                } else {
                    try {
                        // Check accuracy
                        if (geoPayload.accuracy && geoPayload.accuracy > policy.geoAccuracyThresholdM) {
                            if (policy.geoMode === SecurityMode.ENFORCE) {
                                decisionResults.allowed = false;
                                decisionResults.reasons.push('GEO_LOW_ACCURACY');
                                decisionResults.decision = 'BLOCK';
                            } else {
                                decisionResults.flagged = true;
                                decisionResults.reasons.push('GEO_LOW_ACCURACY');
                                if (decisionResults.decision !== 'BLOCK') decisionResults.decision = 'ALLOW_FLAGGED';
                            }
                        } else {
                            this.geoService.validateGeoPayload(geoPayload, policy.geoMaxAgeSeconds, policy.geoAccuracyThresholdM);
                            const zones = await this.securityPolicyService.getActiveZones(tenantId, branchId);

                            let insideAny = false;
                            if (zones.length === 0) {
                                insideAny = true;
                            } else {
                                insideAny = zones.some(z => this.geoService.isWithinZone(geoPayload!, z));
                            }

                            if (!insideAny) {
                                if (policy.geoMode === SecurityMode.ENFORCE) {
                                    decisionResults.allowed = false;
                                    decisionResults.reasons.push('GEO_OUTSIDE_ZONE');
                                    decisionResults.decision = 'BLOCK';
                                } else {
                                    decisionResults.flagged = true;
                                    decisionResults.reasons.push('GEO_OUTSIDE_ZONE');
                                    if (decisionResults.decision !== 'BLOCK') decisionResults.decision = 'ALLOW_FLAGGED';
                                }
                            }
                        }
                    } catch (e) {
                        if (policy.geoMode === SecurityMode.ENFORCE) {
                            decisionResults.allowed = false;
                            decisionResults.reasons.push(e.message || 'GEO_INVALID');
                            decisionResults.decision = 'BLOCK';
                        } else {
                            decisionResults.flagged = true;
                            decisionResults.reasons.push(e.message || 'GEO_INVALID');
                            if (decisionResults.decision !== 'BLOCK') decisionResults.decision = 'ALLOW_FLAGGED';
                        }
                    }
                }
            }
        }

        req.securityDecision = decisionResults;

        if (decisionResults.decision === 'BLOCK') {
            await this.logDecision(tenantId, user?.id, action, 'SEC_BLOCKED', decisionResults.reasons.join(', '), decisionResults);
            throw new ForbiddenException(decisionResults.reasons.join(', '));
        } else if (decisionResults.decision === 'ALLOW_FLAGGED') {
            await this.logDecision(tenantId, user?.id, action, 'SEC_FLAGGED', decisionResults.reasons.join(', '), decisionResults);
        }

        return true;
    }

    private checkRole(user: any, roleFragment: string): boolean {
        if (!user || !user.roles) return false;
        return user.roles.some((r: any) => {
            const roleName = typeof r === 'string' ? r : r.role?.name || r.name || '';
            return roleName.toLowerCase().includes(roleFragment);
        });
    }

    private canOverride(user: any): boolean {
        // Basic check: looks for role assignment
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
