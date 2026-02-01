'use client';

import PolicyLayout from '@/components/policies/PolicyLayout';
import { DEFAULT_COOKIES } from '@/lib/default-policies';

export default function CookiesPage() {
    return (
        <PolicyLayout
            policyKey="cookies"
            fallbackTitle="Cookie Policy"
            fallbackContent={DEFAULT_COOKIES}
        />
    );
}
