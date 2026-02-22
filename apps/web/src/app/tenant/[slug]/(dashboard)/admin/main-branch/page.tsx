'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';

interface Props { params: Promise<{ slug: string }> }

interface Branch {
    id: string;
    branch_name: string;
    branch_code: string;
    brand_id: string;
    school_logo_url: string;
    curriculum_framework: string;
    formatted_address: string;
    branch_email: string;
    mobile_e164: string;
    branch_email_verified: boolean;
    is_main_branch: boolean;
}

export default function MainBranchPage({ params }: Props) {
    const { slug } = use(params);
    const [branch, setBranch] = useState<Branch | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('session_token');
        fetch('/api/admin/branches', {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
            .then(r => r.json())
            .then((data: Branch[]) => {
                const main = Array.isArray(data) ? data.find(b => b.is_main_branch) : null;
                setBranch(main || null);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
        );
    }

    if (!branch) {
        return (
            <div className="p-4 sm:p-6 max-w-2xl mx-auto">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1">Main Branch Setup</h1>
                <p className="text-sm text-slate-500 mb-8">Set up your school's primary location and profile</p>
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-8 text-center">
                    <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-3xl">account_balance</span>
                    </div>
                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">No Main Branch Yet</h2>
                    <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">Your main branch is the primary school profile. Set it up with your school's details, branding, and contact info.</p>
                    <Link
                        href={`/tenant/${slug}/admin/main-branch/new`}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
                    >
                        <span className="material-symbols-outlined text-sm">add</span>
                        Set Up Main Branch
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Main Branch</h1>
                    <p className="text-sm text-slate-500 mt-1">Your school's primary profile</p>
                </div>
                <Link
                    href={`/tenant/${slug}/admin/main-branch/${branch.id}/edit`}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
                >
                    <span className="material-symbols-outlined text-sm">edit</span>
                    Edit
                </Link>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                {/* Cover */}
                <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600 relative">
                    {branch.school_logo_url && (
                        <img src={branch.school_logo_url} alt="Logo" className="absolute bottom-0 left-6 translate-y-1/2 w-16 h-16 rounded-2xl border-4 border-white dark:border-slate-900 object-contain bg-white" />
                    )}
                </div>
                <div className="pt-12 pb-6 px-6">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{branch.branch_name}</h2>
                    <p className="text-sm text-slate-400 font-mono">{branch.branch_code}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                        {[
                            { icon: 'school', label: 'Curriculum', value: branch.curriculum_framework },
                            { icon: 'location_on', label: 'Address', value: branch.formatted_address },
                            { icon: 'phone', label: 'Mobile', value: branch.mobile_e164 },
                            { icon: 'mail', label: 'Email', value: branch.branch_email, badge: branch.branch_email_verified ? '✓ Verified' : undefined },
                        ].filter(i => i.value).map(item => (
                            <div key={item.label} className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-sm">{item.icon}</span>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400">{item.label}</p>
                                    <div className="flex items-center gap-1.5">
                                        <p className="text-sm text-slate-700 dark:text-slate-200 break-all">{item.value}</p>
                                        {item.badge && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">{item.badge}</span>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
