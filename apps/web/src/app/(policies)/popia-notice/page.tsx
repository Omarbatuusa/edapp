'use client';

import PolicyLayout from '@/components/policies/PolicyLayout';
import { DEFAULT_POPIA } from '@/lib/default-policies';

export default function PopiaNoticePage() {
    return (
        <PolicyLayout
            policyKey="popia_notice"
            fallbackTitle="POPIA Notice"
            fallbackContent={DEFAULT_POPIA}
        />
    );
}
