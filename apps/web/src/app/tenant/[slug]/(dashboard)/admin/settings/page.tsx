'use client';

import { use } from 'react';
import SettingsHub from '@/app/tenant/[slug]/(dashboard)/settings/page';

interface Props { params: Promise<{ slug: string }> }

export default function AdminSettingsPage({ params }: Props) {
    const { slug } = use(params);
    return <SettingsHub />;
}
