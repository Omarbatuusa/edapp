'use client';

import PolicyLayout from '@/components/policies/PolicyLayout';
import { DEFAULT_TERMS } from '@/lib/default-policies';

export default function TermsPage() {
    return (
        <PolicyLayout
            policyKey="terms"
            fallbackTitle="Terms of Use"
            fallbackContent={DEFAULT_TERMS}
        />
    );
}
