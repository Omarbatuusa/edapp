'use client';

import { MenuContent } from '@/components/shell/MenuContent';

export default function LearnerMenuPage() {
    const role = typeof window !== 'undefined'
        ? localStorage.getItem('user_role') || 'learner'
        : 'learner';

    return <MenuContent role={role} />;
}
