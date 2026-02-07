'use client';

import { CommunicationHub } from '@/components/communication';

// ============================================================
// PARENT CHAT PAGE - Unified Communication Hub
// ============================================================

export default function ParentChatPage() {
    return (
        <CommunicationHub
            tenantName="LIA"
            officeHours="Mon–Fri 08:00–15:00"
            isAfterHours={false}
        />
    );
}
