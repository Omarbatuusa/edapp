'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BulkAddBranches } from './BulkAddBranches';

interface Branch {
    id: string;
    branch_name: string;
    branch_code: string;
    is_main_branch: boolean;
    curriculum_framework: string;
    formatted_address: string;
    branch_email: string;
    mobile_e164: string;
    school_logo_url: string;
}

interface BranchListProps {
    tenantSlug: string;
    tenantId?: string;
}

export function BranchList({ tenantSlug, tenantId }: BranchListProps) {
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'all' | 'main' | 'sub'>('all');
    const [bulkOpen, setBulkOpen] = useState(false);

    const loadBranches = () => {
        const token = localStorage.getItem('session_token');
        setLoading(true);
        fetch('/v1/admin/branches', {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
            .then(r => r.json())
            .then(data => setBranches(Array.isArray(data) ? data : []))
            .catch(() => {})
            .finally(() => setLoading(false));
    };

    useEffect(() => { loadBranches(); }, []);

    const mainBranch = branches.find(b => b.is_main_branch);

    const filtered = branches.filter(b => {
        const matchesSearch = b.branch_name.toLowerCase().includes(search.toLowerCase()) ||
            b.branch_code.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === 'all' || (filter === 'main' && b.is_main_branch) || (filter === 'sub' && !b.is_main_branch);
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="flex flex-col gap-4">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-[200px] relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search branches..."
                        className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-blue-500 transition-colors"
                    />
                </div>
                <div className="flex rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden text-xs font-medium">
                    {(['all', 'main', 'sub'] as const).map(f => (
                        <button key={f} onClick={() => setFilter(f)} className={`px-3 py-2.5 transition-colors ${filter === f ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-900 text-slate-500 hover:bg-slate-50'}`}>
                            {f === 'all' ? 'All' : f === 'main' ? 'Main' : 'Branches'}
                        </button>
                    ))}
                </div>
                {mainBranch && (
                    <button
                        onClick={() => setBulkOpen(true)}
                        className="flex items-center gap-1.5 px-4 py-2.5 border border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 text-sm font-medium rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                    >
                        <span className="material-symbols-outlined text-sm">upload</span>
                        Bulk Add
                    </button>
                )}
                <Link
                    href={`/tenant/${tenantSlug}/admin/branches/new`}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
                >
                    <span className="material-symbols-outlined text-sm">add</span>
                    Add Branch
                </Link>
            </div>

            {/* List */}
            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                    <span className="material-symbols-outlined text-4xl mb-2 block">account_balance</span>
                    <p className="font-medium">{search ? 'No branches match your search' : 'No branches yet'}</p>
                </div>
            ) : (
                <div className="grid gap-3">
                    {filtered.map(branch => (
                        <div key={branch.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 flex items-center gap-4">
                            {branch.school_logo_url ? (
                                <img src={branch.school_logo_url} alt="" className="w-10 h-10 rounded-xl object-contain border border-slate-200 dark:border-slate-700 bg-white flex-shrink-0" />
                            ) : (
                                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-sm">account_balance</span>
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="font-semibold text-slate-800 dark:text-slate-100 truncate">{branch.branch_name}</p>
                                    {branch.is_main_branch && (
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-medium flex-shrink-0">Main</span>
                                    )}
                                </div>
                                <p className="text-xs text-slate-400 mt-0.5 truncate">
                                    <span className="font-mono">{branch.branch_code}</span>
                                    {branch.curriculum_framework && ` · ${branch.curriculum_framework}`}
                                    {branch.formatted_address && ` · ${branch.formatted_address}`}
                                </p>
                            </div>
                            <Link
                                href={`/tenant/${tenantSlug}/admin/branches/${branch.id}/edit`}
                                className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors flex-shrink-0"
                            >
                                <span className="material-symbols-outlined text-sm">edit</span>
                                Edit
                            </Link>
                        </div>
                    ))}
                </div>
            )}

            {bulkOpen && mainBranch && (
                <BulkAddBranches
                    mainBranchId={mainBranch.id}
                    tenantId={tenantId}
                    isOpen={bulkOpen}
                    onClose={() => setBulkOpen(false)}
                    onSuccess={(count) => { loadBranches(); setBulkOpen(false); }}
                />
            )}
        </div>
    );
}
