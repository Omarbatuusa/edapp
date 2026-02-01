'use client';

import PolicyLayout from '@/components/policies/PolicyLayout';
import { DEFAULT_PRIVACY } from '@/lib/default-policies';

export default function PrivacyPage() {
    return (
        <PolicyLayout
            policyKey="privacy"
            fallbackTitle="Privacy Notice"
            fallbackContent={DEFAULT_PRIVACY}
        />
    );
}
