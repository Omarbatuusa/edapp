'use client';

import { CommunicationHub } from '@/components/communication';

// ============================================================
// PARENT CHAT PAGE - Communication Hub
// ============================================================

export default function ParentChatPage() {
    return (
        <CommunicationHub
            officeHours="Mon-Fri, 8 AM - 3 PM"
        />
    );
}
