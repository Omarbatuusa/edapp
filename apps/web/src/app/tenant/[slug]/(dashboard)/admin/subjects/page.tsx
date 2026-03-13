'use client';

import { use, useState } from 'react';
import SubjectManager from '@/components/admin/school-data/SubjectManager';
import SubjectStreamManager from '@/components/admin/school-data/SubjectStreamManager';
import SubjectOfferingManager from '@/components/admin/school-data/SubjectOfferingManager';

interface Props { params: Promise<{ slug: string }> }

type Tab = 'subjects' | 'streams' | 'offerings';

export default function SubjectsPage({ params }: Props) {
    const { slug } = use(params);
    const tenantId = typeof window !== 'undefined' ? localStorage.getItem('admin_tenant_id') || '' : '';
    const [tab, setTab] = useState<Tab>('subjects');

    if (!tenantId) {
        return (
            <div className="app-content-padding">
                <div className="ios-card p-8 text-center text-[hsl(var(--admin-text-muted))] text-[15px] font-medium">
                    Unable to load. Please ensure you are logged in.
                </div>
            </div>
        );
    }

    const tabs: { key: Tab; label: string }[] = [
        { key: 'subjects', label: 'Subjects' },
        { key: 'streams', label: 'Streams' },
        { key: 'offerings', label: 'Offerings' },
    ];

    return (
        <div className="app-content-padding space-y-5">
            <div>
                <h1 className="text-xl font-bold tracking-tight text-[hsl(var(--admin-text-main))]">Subjects</h1>
                <p className="text-sm text-[hsl(var(--admin-text-sub))]">Manage subjects, streams, and offerings for your school.</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-[hsl(var(--admin-surface-alt))] p-1 rounded-xl w-fit">
                {tabs.map(t => (
                    <button
                        key={t.key}
                        type="button"
                        onClick={() => setTab(t.key)}
                        className={`px-4 py-2 text-[13px] font-semibold rounded-lg transition-all ${
                            tab === t.key
                                ? 'bg-[hsl(var(--admin-bg))] text-[hsl(var(--admin-primary))] shadow-sm'
                                : 'text-[hsl(var(--admin-text-muted))] hover:text-[hsl(var(--admin-text-main))]'
                        }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            <div className="ios-card p-5">
                {tab === 'subjects' && <SubjectManager tenantId={tenantId} />}
                {tab === 'streams' && <SubjectStreamManager tenantId={tenantId} />}
                {tab === 'offerings' && <SubjectOfferingManager tenantId={tenantId} />}
            </div>
        </div>
    );
}
