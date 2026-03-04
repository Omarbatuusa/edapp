'use client';

import { MenuContent } from '@/components/shell/MenuContent';

export default function AdminMenuPage() {
    const role = typeof window !== 'undefined'
        ? localStorage.getItem('user_role') || 'admin'
        : 'admin';

    return <MenuContent role={role} />;
}
