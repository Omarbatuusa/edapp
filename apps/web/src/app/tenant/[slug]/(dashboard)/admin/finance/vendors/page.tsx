'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

function getAuthHeaders(): Record<string, string> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('session_token') : null;
    return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

export default function VendorsPage() {
    const params = useParams();
    const slug = params?.slug as string;
    const tenantId = typeof window !== 'undefined' ? localStorage.getItem('admin_tenant_id') || '' : '';
    const [vendors, setVendors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!tenantId) return;
        fetch(`/v1/admin/tenants/${tenantId}/finance/vendors`, { headers: getAuthHeaders() })
            .then(r => r.json())
            .then(d => setVendors(d.data || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [tenantId]);

    const statusColor = (s: string) => s === 'active' ? 'bg-green-100 text-green-700' : s === 'blocked' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600';

    return (
        <div className="app-content-padding space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-[hsl(var(--admin-text-main))]">Vendors</h1>
                    <p className="text-[14px] text-[hsl(var(--admin-text-sub))]">Manage suppliers and service providers.</p>
                </div>
                <div className="flex gap-2">
                    <Link href={`/tenant/${slug}/admin/finance/vendors/bills`} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text-main))] hover:bg-[hsl(var(--admin-surface-alt))]"><span className="material-symbols-outlined text-[18px]">description</span>Bills</Link>
                    <Link href={`/tenant/${slug}/admin/finance/vendors/purchase-orders`} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text-main))] hover:bg-[hsl(var(--admin-surface-alt))]"><span className="material-symbols-outlined text-[18px]">shopping_cart</span>Purchase Orders</Link>
                    <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-[hsl(var(--admin-primary))] text-white hover:opacity-90"><span className="material-symbols-outlined text-[18px]">add</span>Add Vendor</button>
                </div>
            </div>

            {loading ? (
                <div className="ios-card text-center py-16"><span className="material-symbols-outlined text-4xl text-[hsl(var(--admin-text-muted))] animate-spin block mb-3">progress_activity</span></div>
            ) : vendors.length === 0 ? (
                <div className="ios-card text-center py-16">
                    <span className="material-symbols-outlined text-5xl text-[hsl(var(--admin-text-muted))] mb-4 block">storefront</span>
                    <p className="text-[15px] text-[hsl(var(--admin-text-sub))]">No vendors found.</p>
                </div>
            ) : (
                <div className="ios-card p-0 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead><tr className="border-b border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface-alt))]">
                                <th className="text-left p-3 px-5 font-semibold text-[hsl(var(--admin-text-sub))]">Name</th>
                                <th className="text-left p-3 font-semibold text-[hsl(var(--admin-text-sub))]">Reg. Number</th>
                                <th className="text-left p-3 font-semibold text-[hsl(var(--admin-text-sub))]">Category</th>
                                <th className="text-left p-3 font-semibold text-[hsl(var(--admin-text-sub))]">Contact Email</th>
                                <th className="text-center p-3 font-semibold text-[hsl(var(--admin-text-sub))]">Status</th>
                            </tr></thead>
                            <tbody>{vendors.map((v: any) => (
                                <tr key={v.id} className="border-b border-[hsl(var(--admin-border))] hover:bg-[hsl(var(--admin-surface-alt))] transition-colors cursor-pointer">
                                    <td className="p-3 px-5 font-medium text-[hsl(var(--admin-text-main))]">{v.name}</td>
                                    <td className="p-3 font-mono text-[13px] text-[hsl(var(--admin-text-sub))]">{v.registration_number || '—'}</td>
                                    <td className="p-3 text-[hsl(var(--admin-text-sub))]">{v.category || '—'}</td>
                                    <td className="p-3 text-[hsl(var(--admin-text-sub))]">{v.contact_email || '—'}</td>
                                    <td className="p-3 text-center"><span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${statusColor(v.status)}`}>{v.status || 'active'}</span></td>
                                </tr>
                            ))}</tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
