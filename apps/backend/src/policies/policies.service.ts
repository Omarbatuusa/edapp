import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PolicyDocument, PolicyScope, PolicyKey } from './policy-document.entity';
import { PolicyVersion } from './policy-version.entity';
import { UserPolicyAcceptance, UserIntent } from './user-policy-acceptance.entity';

@Injectable()
export class PoliciesService {
    constructor(
        @InjectRepository(PolicyDocument)
        private policyDocumentRepo: Repository<PolicyDocument>,
        @InjectRepository(PolicyVersion)
        private policyVersionRepo: Repository<PolicyVersion>,
        @InjectRepository(UserPolicyAcceptance)
        private acceptanceRepo: Repository<UserPolicyAcceptance>,
    ) { }

    /**
     * Get active policy versions for a specific scope (Platform or Tenant).
     * If tenant policies are requested but not found, falls back to platform defaults.
     */
    async getActivePolicies(tenantId?: string): Promise<any[]> {
        // Fetch all active documents for platform
        const platformDocs = await this.policyDocumentRepo.find({
            where: { scope: PolicyScope.PLATFORM, is_active: true },
            relations: ['versions']
        });

        let tenantDocs: PolicyDocument[] = [];
        if (tenantId) {
            tenantDocs = await this.policyDocumentRepo.find({
                where: { scope: PolicyScope.TENANT, tenant_id: tenantId, is_active: true },
                relations: ['versions']
            });
        }

        // Map keys to documents, preferring tenant version if exists
        const policyMap = new Map<PolicyKey, PolicyDocument>();

        // 1. Load platform defaults first
        platformDocs.forEach(doc => {
            policyMap.set(doc.policy_key, doc);
        });

        // 2. Override with tenant versions if available
        tenantDocs.forEach(doc => {
            policyMap.set(doc.policy_key, doc);
        });

        // 3. Format result
        const result: any[] = [];
        for (const [key, doc] of policyMap.entries()) {
            // Get latest effective version
            const latestVersion = doc.versions
                .sort((a, b) => new Date(b.effective_date).getTime() - new Date(a.effective_date).getTime())[0];

            if (latestVersion) {
                result.push({
                    key: key,
                    title: doc.title,
                    version: latestVersion.version,
                    content: latestVersion.content_markdown,
                    effective_date: latestVersion.effective_date,
                    is_tenant_specific: doc.scope === PolicyScope.TENANT
                });
            }
        }

        return result;
    }

    /**
     * Check if a user has accepted the required policies for a specific intent and tenant.
     */
    async checkAcceptance(userId: string, tenantId: string, intent: UserIntent): Promise<boolean> {
        const acceptance = await this.acceptanceRepo.findOne({
            where: {
                user_id: userId,
                tenant_id: tenantId,
                intent: intent,
                accepted_required: true
            },
            order: { accepted_at: 'DESC' }
        });

        // In a real scenario, we would check if the accepted version matches the current active version.
        // For Milestone 1, existence of an acceptance record is sufficient logic.
        return !!acceptance;
    }

    /**
     * Record user consent
     */
    async recordAcceptance(data: {
        userId: string;
        tenantId: string;
        intent: UserIntent;
        role: string;
        ipAddress: string;
        userAgent: string;
        consents: any; // Object mapping keys to versions/booleans
    }): Promise<UserPolicyAcceptance> {
        const acceptance = this.acceptanceRepo.create({
            user_id: data.userId,
            tenant_id: data.tenantId,
            intent: data.intent,
            role: data.role,
            ip_address: data.ipAddress,
            user_agent: data.userAgent,

            // Map known preferences
            accepted_required: true,
            notifications_opt_in: !!data.consents.notifications,
            email_opt_in: !!data.consents.email,
            sms_opt_in: !!data.consents.sms,

            // Map versions (if provided in payload)
            terms_version: data.consents.terms_version,
            privacy_version: data.consents.privacy_version,
            child_safety_version: data.consents.child_safety_version,
            communications_version: data.consents.communications_version,
            application_terms_version: data.consents.application_terms_version,
        });

        return this.acceptanceRepo.save(acceptance);
    }
}
