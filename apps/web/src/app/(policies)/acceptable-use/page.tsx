'use client';

import PolicyLayout from '@/components/policies/PolicyLayout';
import { DEFAULT_ACCEPTABLE_USE } from '@/lib/default-policies';

export default function AcceptableUsePage() {
    return (
        <PolicyLayout
            policyKey="acceptable_use"
            fallbackTitle="Acceptable Use Policy"
            fallbackContent={DEFAULT_ACCEPTABLE_USE}
        />
    );
}
