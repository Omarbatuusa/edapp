'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Brand {
    id: string;
    brand_name: string;
    brand_code: string;
    status: string;
    connected_branch_count: number;
    created_at: string;
}

interface BrandListProps {
    tenantSlug: string;
}

export function BrandList({ tenantSlug }: BrandListProps) {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('session_token');
        fetch('/v1/admin/brands', {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
            .then(r => r.json())
            .then(data => setBrands(Array.isArray(data) ? data : []))
            .catch(() => setBrands([]))
            .finally(() => setLoading(false));
    }, []);

    const filtered = brands.filter(b =>
        b.brand_name.toLowerCase().includes(search.toLowerCase()) ||
        b.brand_code.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            {/* Toolbar */}
            <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search brands..."
                        className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-blue-500 transition-colors"
                    />
                </div>
                <Link
                    href={`/tenant/${tenantSlug}/admin/brands/new`}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
                >
                    <span className="material-symbols-outlined text-sm">add</span>
                    New Brand
                </Link>
            </div>

            {/* List */}
            {filtered.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                    <span className="material-symbols-outlined text-4xl mb-2 block">category</span>
                    <p className="font-medium">{search ? 'No brands match your search' : 'No brands yet'}</p>
                    {!search && <p className="text-sm mt-1">Create your first brand to get started</p>}
                </div>
            ) : (
                <div className="grid gap-3">
                    {filtered.map(brand => (
                        <div key={brand.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 flex items-center gap-4">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">category</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="font-semibold text-slate-800 dark:text-slate-100 truncate">{brand.brand_name}</p>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${brand.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-amber-100 text-amber-700'}`}>
                                        {brand.status}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    Code: <span className="font-mono">{brand.brand_code}</span>
                                    {' · '}
                                    {brand.connected_branch_count} {brand.connected_branch_count === 1 ? 'branch' : 'branches'}
                                </p>
                            </div>
                            <Link
                                href={`/tenant/${tenantSlug}/admin/brands/${brand.id}/edit`}
                                className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            >
                                <span className="material-symbols-outlined text-sm">edit</span>
                                Edit
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
