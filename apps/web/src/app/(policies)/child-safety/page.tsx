'use client';

import PolicyLayout from '@/components/policies/PolicyLayout';
import { DEFAULT_CHILD_SAFETY } from '@/lib/default-policies';

export default function ChildSafetyPage() {
    return (
        <PolicyLayout
            policyKey="child_safety"
            fallbackTitle="Child Safety & Community Rules"
            fallbackContent={DEFAULT_CHILD_SAFETY}
        />
    );
}
