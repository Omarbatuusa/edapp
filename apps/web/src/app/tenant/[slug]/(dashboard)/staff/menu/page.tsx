'use client';

import { MenuContent } from '@/components/shell/MenuContent';

export default function StaffMenuPage() {
    const role = typeof window !== 'undefined'
        ? localStorage.getItem('user_role') || 'staff'
        : 'staff';

    return <MenuContent role={role} />;
}
