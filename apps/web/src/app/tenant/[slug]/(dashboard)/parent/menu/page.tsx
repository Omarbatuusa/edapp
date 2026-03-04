'use client';

import { MenuContent } from '@/components/shell/MenuContent';

export default function ParentMenuPage() {
    const role = typeof window !== 'undefined'
        ? localStorage.getItem('user_role') || 'parent'
        : 'parent';

    return <MenuContent role={role} />;
}
