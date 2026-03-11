'use client';

import { useEffect, useState } from 'react';

function getAuthHeaders(): Record<string, string> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('session_token') : null;
    return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

export default function PurchaseOrdersPage() {
    const tenantId = typeof window !== 'undefined' ? localStorage.getItem('admin_tenant_id') || '' : '';
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!tenantId) return;
        fetch(`/v1/admin/tenants/${tenantId}/finance/vendors/purchase-orders`, { headers: getAuthHeaders() })
            .then(r => r.json())
            .then(d => setOrders(d.data || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [tenantId]);

    const statusColor = (s: string) => {
        const map: Record<string, string> = { approved: 'bg-green-100 text-green-700', pending: 'bg-yellow-100 text-yellow-700', draft: 'bg-gray-100 text-gray-600', cancelled: 'bg-red-100 text-red-700', received: 'bg-blue-100 text-blue-700' };
        return map[s] || 'bg-gray-100 text-gray-600';
    };

    return (
        <div className="app-content-padding space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-[hsl(var(--admin-text-main))]">Purchase Orders</h1>
                    <p className="text-[14px] text-[hsl(var(--admin-text-sub))]">Track and manage purchase orders to vendors.</p>
                </div>
                <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-[hsl(var(--admin-primary))] text-white hover:opacity-90"><span className="material-symbols-outlined text-[18px]">add</span>New PO</button>
            </div>

            {loading ? (
                <div className="ios-card text-center py-16"><span className="material-symbols-outlined text-4xl text-[hsl(var(--admin-text-muted))] animate-spin block mb-3">progress_activity</span></div>
            ) : orders.length === 0 ? (
                <div className="ios-card text-center py-16">
                    <span className="material-symbols-outlined text-5xl text-[hsl(var(--admin-text-muted))] mb-4 block">shopping_cart</span>
                    <p className="text-[15px] text-[hsl(var(--admin-text-sub))]">No purchase orders found.</p>
                </div>
            ) : (
                <div className="ios-card p-0 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead><tr className="border-b border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface-alt))]">
                                <th className="text-left p-3 px-5 font-semibold text-[hsl(var(--admin-text-sub))]">PO #</th>
                                <th className="text-left p-3 font-semibold text-[hsl(var(--admin-text-sub))]">Vendor</th>
                                <th className="text-left p-3 font-semibold text-[hsl(var(--admin-text-sub))]">Order Date</th>
                                <th className="text-right p-3 font-semibold text-[hsl(var(--admin-text-sub))]">Total</th>
                                <th className="text-center p-3 font-semibold text-[hsl(var(--admin-text-sub))]">Status</th>
                            </tr></thead>
                            <tbody>{orders.map((po: any) => (
                                <tr key={po.id} className="border-b border-[hsl(var(--admin-border))] hover:bg-[hsl(var(--admin-surface-alt))] transition-colors cursor-pointer">
                                    <td className="p-3 px-5 font-mono text-[13px] font-medium text-[hsl(var(--admin-text-main))]">{po.po_number}</td>
                                    <td className="p-3 text-[hsl(var(--admin-text-main))]">{po.vendor_name || po.vendor_id || '—'}</td>
                                    <td className="p-3 text-[hsl(var(--admin-text-sub))]">{po.order_date?.slice(0, 10) || '—'}</td>
                                    <td className="p-3 text-right font-semibold text-[hsl(var(--admin-text-main))]">R {Number(po.total || 0).toFixed(2)}</td>
                                    <td className="p-3 text-center"><span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${statusColor(po.status)}`}>{po.status}</span></td>
                                </tr>
                            ))}</tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
