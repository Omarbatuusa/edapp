'use client';

import { useState } from 'react';

type ReportType = 'trial-balance' | 'profit-loss' | 'balance-sheet';

function getAuthHeaders(): Record<string, string> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('session_token') : null;
    return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

export default function FinanceReportsPage() {
    const tenantId = typeof window !== 'undefined' ? localStorage.getItem('admin_tenant_id') || '' : '';
    const [activeReport, setActiveReport] = useState<ReportType>('trial-balance');
    const [reportData, setReportData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [asOf, setAsOf] = useState(new Date().toISOString().split('T')[0]);
    const [fromDate, setFromDate] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]);
    const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
    const fmtAmount = (n: number) => `R ${Number(n).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`;

    const fetchReport = async (type?: ReportType) => {
        const report = type || activeReport;
        setActiveReport(report); setLoading(true); setReportData(null);
        try {
            const params = new URLSearchParams();
            if (report === 'profit-loss') { params.set('from', fromDate); params.set('to', toDate); } else { params.set('as_of', asOf); }
            const res = await fetch(`/v1/admin/tenants/${tenantId}/finance/reports/${report}?${params}`, { headers: getAuthHeaders() });
            const data = await res.json(); setReportData(data.data);
        } catch {} setLoading(false);
    };

    const reports: { key: ReportType; icon: string; label: string }[] = [
        { key: 'trial-balance', icon: 'balance', label: 'Trial Balance' },
        { key: 'profit-loss', icon: 'trending_up', label: 'Profit & Loss' },
        { key: 'balance-sheet', icon: 'account_balance', label: 'Balance Sheet' },
    ];

    return (
        <div className="app-content-padding space-y-6">
            <div><h1 className="text-2xl font-bold tracking-tight text-[hsl(var(--admin-text-main))]">Financial Reports</h1><p className="text-[14px] text-[hsl(var(--admin-text-sub))]">Generate trial balance, profit & loss, and balance sheet reports.</p></div>
            <div className="flex gap-2 flex-wrap">
                {reports.map(r => (<button key={r.key} type="button" onClick={() => { setActiveReport(r.key); setReportData(null); }} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${activeReport === r.key ? 'bg-[hsl(var(--admin-primary))] text-white' : 'bg-[hsl(var(--admin-surface-alt))] text-[hsl(var(--admin-text-main))] hover:bg-[hsl(var(--admin-border))]'}`}><span className="material-symbols-outlined text-[18px]">{r.icon}</span>{r.label}</button>))}
            </div>
            <div className="ios-card flex flex-wrap items-end gap-4">
                {activeReport === 'profit-loss' ? (<>
                    <div><label className="block text-[12px] font-semibold text-[hsl(var(--admin-text-sub))] mb-1">From</label><input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} aria-label="From date" className="border border-[hsl(var(--admin-border))] rounded-xl px-3 py-2 text-sm bg-[hsl(var(--admin-surface))]" /></div>
                    <div><label className="block text-[12px] font-semibold text-[hsl(var(--admin-text-sub))] mb-1">To</label><input type="date" value={toDate} onChange={e => setToDate(e.target.value)} aria-label="To date" className="border border-[hsl(var(--admin-border))] rounded-xl px-3 py-2 text-sm bg-[hsl(var(--admin-surface))]" /></div>
                </>) : (<div><label className="block text-[12px] font-semibold text-[hsl(var(--admin-text-sub))] mb-1">As of</label><input type="date" value={asOf} onChange={e => setAsOf(e.target.value)} aria-label="As of date" className="border border-[hsl(var(--admin-border))] rounded-xl px-3 py-2 text-sm bg-[hsl(var(--admin-surface))]" /></div>)}
                <button type="button" onClick={() => fetchReport()} className="bg-[hsl(var(--admin-primary))] text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-[hsl(var(--admin-primary))/0.9] active:scale-[0.96] transition-all">Generate</button>
            </div>

            {loading && <div className="ios-card text-center py-16"><span className="material-symbols-outlined text-4xl text-[hsl(var(--admin-text-muted))] animate-spin block mb-3">progress_activity</span><p className="text-[14px] text-[hsl(var(--admin-text-sub))]">Generating report...</p></div>}

            {!loading && reportData && activeReport === 'trial-balance' && (
                <div className="ios-card p-0 overflow-hidden">
                    <div className="p-4 px-5 bg-[hsl(var(--admin-surface-alt))] border-b border-[hsl(var(--admin-border))]"><h3 className="font-semibold text-[16px] text-[hsl(var(--admin-text-main))]">Trial Balance as of {reportData.as_of}</h3></div>
                    <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface-alt))/0.5]"><th className="text-left p-3 px-5">Code</th><th className="text-left p-3">Account</th><th className="text-right p-3">Debit</th><th className="text-right p-3 px-5">Credit</th></tr></thead>
                    <tbody>{(reportData.accounts || []).map((a: any) => (<tr key={a.id} className="border-b border-[hsl(var(--admin-border))]"><td className="p-3 px-5 font-mono text-[12px]">{a.code}</td><td className="p-3 text-[13px]">{a.name}</td><td className="p-3 text-right font-mono text-[13px]">{a.total_debit > 0 ? fmtAmount(a.total_debit) : ''}</td><td className="p-3 px-5 text-right font-mono text-[13px]">{a.total_credit > 0 ? fmtAmount(a.total_credit) : ''}</td></tr>))}</tbody>
                    <tfoot><tr className="bg-[hsl(var(--admin-surface-alt))] font-bold"><td colSpan={2} className="p-3 px-5">Total</td><td className="p-3 text-right font-mono">{fmtAmount(reportData.totals?.total_debit || 0)}</td><td className="p-3 px-5 text-right font-mono">{fmtAmount(reportData.totals?.total_credit || 0)}</td></tr></tfoot></table></div>
                </div>
            )}

            {!loading && reportData && activeReport === 'profit-loss' && (
                <div className="ios-card p-0 overflow-hidden">
                    <div className="p-4 px-5 bg-[hsl(var(--admin-surface-alt))] border-b border-[hsl(var(--admin-border))]"><h3 className="font-semibold text-[16px]">Profit & Loss: {reportData.from} to {reportData.to}</h3></div>
                    <div className="p-5 space-y-6">
                        <ReportSection title="Revenue" items={reportData.revenue} total={reportData.total_revenue} fmtAmount={fmtAmount} color="text-green-700" />
                        <ReportSection title="Expenses" items={reportData.expenses} total={reportData.total_expenses} fmtAmount={fmtAmount} color="text-red-700" />
                        <div className="border-t-2 border-[hsl(var(--admin-text-main))] pt-3 flex justify-between"><span className="font-bold text-[16px]">Net Income</span><span className={`font-bold text-[16px] font-mono ${reportData.net_income >= 0 ? 'text-green-700' : 'text-red-700'}`}>{fmtAmount(reportData.net_income)}</span></div>
                    </div>
                </div>
            )}

            {!loading && reportData && activeReport === 'balance-sheet' && (
                <div className="ios-card p-0 overflow-hidden">
                    <div className="p-4 px-5 bg-[hsl(var(--admin-surface-alt))] border-b border-[hsl(var(--admin-border))]"><h3 className="font-semibold text-[16px]">Balance Sheet as of {reportData.as_of}</h3></div>
                    <div className="p-5 space-y-6">
                        <ReportSection title="Assets" items={reportData.assets} total={reportData.total_assets} fmtAmount={fmtAmount} color="text-blue-700" fieldKey="balance" />
                        <ReportSection title="Liabilities" items={reportData.liabilities} total={reportData.total_liabilities} fmtAmount={fmtAmount} color="text-orange-700" fieldKey="balance" />
                        <ReportSection title="Equity" items={reportData.equity} total={reportData.total_equity} fmtAmount={fmtAmount} color="text-purple-700" fieldKey="balance" />
                        <div className="border-t-2 border-[hsl(var(--admin-text-main))] pt-3 space-y-2">
                            <div className="flex justify-between"><span className="font-bold">Total Assets</span><span className="font-bold font-mono">{fmtAmount(reportData.total_assets)}</span></div>
                            <div className="flex justify-between"><span className="font-bold">Total Liabilities + Equity</span><span className="font-bold font-mono">{fmtAmount(reportData.total_liabilities_and_equity)}</span></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function ReportSection({ title, items, total, fmtAmount, color, fieldKey = 'amount' }: any) {
    return (<div>
        <h4 className={`font-bold text-[14px] ${color} mb-2`}>{title}</h4>
        <div className="space-y-1">{(items || []).map((item: any) => (<div key={item.id} className="flex justify-between text-[13px] py-1"><span><span className="font-mono text-[11px] text-[hsl(var(--admin-text-muted))] mr-2">{item.code}</span>{item.name}</span><span className="font-mono font-semibold">{fmtAmount(item[fieldKey])}</span></div>))}</div>
        <div className="flex justify-between border-t border-[hsl(var(--admin-border))] mt-2 pt-2 font-semibold text-[14px]"><span>Total {title}</span><span className="font-mono">{fmtAmount(total)}</span></div>
    </div>);
}
