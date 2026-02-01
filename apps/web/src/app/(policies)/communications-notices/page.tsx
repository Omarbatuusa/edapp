'use client';

import PolicyLayout from '@/components/policies/PolicyLayout';
import { DEFAULT_COMMUNICATIONS } from '@/lib/default-policies';

export default function CommunicationsNoticesPage() {
    return (
        <PolicyLayout
            policyKey="communications_notices"
            fallbackTitle="Communications Notices"
            fallbackContent={DEFAULT_COMMUNICATIONS}
        />
    );
}
