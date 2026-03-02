'use client';

import { ReactNode } from 'react';

interface ConditionalFieldGroupProps {
    watchValue: string;
    showWhen: string | string[];
    children: ReactNode;
}

export function ConditionalFieldGroup({ watchValue, showWhen, children }: ConditionalFieldGroupProps) {
    const triggers = Array.isArray(showWhen) ? showWhen : [showWhen];
    if (!triggers.includes(watchValue)) return null;
    return <>{children}</>;
}
