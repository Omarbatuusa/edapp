'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface AccountOption { id: string; code: string; name: string; }
interface JournalLine { account_id: string; debit_amount: string; credit_amount: string; description: string; }

function getAuthHeaders(): Record<string, string> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('session_token') : null;
    return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

const emptyLine = (): JournalLine => ({ account_id: '', debit_amount: '', credit_amount: '', description: '' });

export default function NewJournalPage() {
    const { slug } = useParams<{ slug: string }>();
    const router = useRouter();
    const tenantId = typeof window !== 'undefined' ? localStorage.getItem('admin_tenant_id') || '' : '';
    const [accounts, setAccounts] = useState<AccountOption[]>([]);
    const [journalDate, setJournalDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('');
    const [lines, setLines] = useState<JournalLine[]>([emptyLine(), emptyLine()]);
    const [autoPost, setAutoPost] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!tenantId) return;
        fetch(`/v1/admin/tenants/${tenantId}/finance/accounts?header=false`, { headers: getAuthHeaders() })
            .then(r => r.json()).then(d => setAccounts(d.data || [])).catch(() => {});
    }, [tenantId]);

    const updateLine = (idx: number, field: keyof JournalLine, value: string) => {
        const updated = [...lines]; updated[idx] = { ...updated[idx], [field]: value }; setLines(updated);
    };
    const addLine = () => setLines([...lines, emptyLine()]);
    const removeLine = (idx: number) => { if (lines.length <= 2) return; setLines(lines.filter((_, i) => i !== idx)); };

    const totalDebit = lines.reduce((s, l) => s + (parseFloat(l.debit_amount) || 0), 0);
    const totalCredit = lines.reduce((s, l) => s + (parseFloat(l.credit_amount) || 0), 0);
    const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0;

    const handleSubmit = async () => {
        setError('');
        if (!description.trim()) { setError('Description is required'); return; }
        if (!isBalanced) { setError('Journal must be balanced (debits = credits)'); return; }
        const payload = {
            journal_date: journalDate, description, auto_post: autoPost,
            lines: lines.filter(l => l.account_id && (parseFloat(l.debit_amount) || parseFloat(l.credit_amount)))
                .map(l => ({ account_id: l.account_id, debit_amount: parseFloat(l.debit_amount) || 0, credit_amount: parseFloat(l.credit_amount) || 0, description: l.description })),
        };
        setSubmitting(true);
        try {
            const res = await fetch(`/v1/admin/tenants/${tenantId}/finance/journals`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(payload) });
            const data = await res.json();
            if (data.status === 'success') router.push(`/tenant/${slug}/admin/finance/journals`);
            else setError(data.message || 'Failed to create journal');
        } catch (e: any) { setError(e.message || 'Network error'); }
        setSubmitting(false);
    };

    return (
        <div className="app-content-padding space-y-6 max-w-4xl">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-[hsl(var(--admin-text-main))]">New Journal Entry</h1>
                <p className="text-[14px] text-[hsl(var(--admin-text-sub))]">Create a manual double-entry journal.</p>
            </div>
            {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">{error}</div>}
            <div className="ios-card space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label className="block text-[13px] font-semibold text-[hsl(var(--admin-text-sub))] mb-1">Date</label><input type="date" value={journalDate} onChange={e => setJournalDate(e.target.value)} aria-label="Journal date" className="w-full border border-[hsl(var(--admin-border))] rounded-xl px-3 py-2 text-sm bg-[hsl(var(--admin-surface))]" /></div>
                    <div><label className="block text-[13px] font-semibold text-[hsl(var(--admin-text-sub))] mb-1">Description</label><input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g. Record tuition fee payment" aria-label="Journal description" className="w-full border border-[hsl(var(--admin-border))] rounded-xl px-3 py-2 text-sm bg-[hsl(var(--admin-surface))]" /></div>
                </div>
                <div>
                    <h3 className="text-[14px] font-semibold text-[hsl(var(--admin-text-main))] mb-3">Lines</h3>
                    <div className="space-y-3">
                        {lines.map((line, idx) => (
                            <div key={idx} className="grid grid-cols-12 gap-2 items-start">
                                <div className="col-span-5"><select value={line.account_id} onChange={e => updateLine(idx, 'account_id', e.target.value)} aria-label={`Line ${idx + 1} account`} className="w-full border border-[hsl(var(--admin-border))] rounded-lg px-2 py-2 text-[13px] bg-[hsl(var(--admin-surface))]"><option value="">Select account...</option>{accounts.map(a => (<option key={a.id} value={a.id}>{a.code} — {a.name}</option>))}</select></div>
                                <div className="col-span-2"><input type="number" placeholder="Debit" value={line.debit_amount} onChange={e => updateLine(idx, 'debit_amount', e.target.value)} aria-label={`Line ${idx + 1} debit`} className="w-full border border-[hsl(var(--admin-border))] rounded-lg px-2 py-2 text-[13px] bg-[hsl(var(--admin-surface))] text-right font-mono" min="0" step="0.01" /></div>
                                <div className="col-span-2"><input type="number" placeholder="Credit" value={line.credit_amount} onChange={e => updateLine(idx, 'credit_amount', e.target.value)} aria-label={`Line ${idx + 1} credit`} className="w-full border border-[hsl(var(--admin-border))] rounded-lg px-2 py-2 text-[13px] bg-[hsl(var(--admin-surface))] text-right font-mono" min="0" step="0.01" /></div>
                                <div className="col-span-2"><input type="text" placeholder="Note" value={line.description} onChange={e => updateLine(idx, 'description', e.target.value)} aria-label={`Line ${idx + 1} note`} className="w-full border border-[hsl(var(--admin-border))] rounded-lg px-2 py-2 text-[13px] bg-[hsl(var(--admin-surface))]" /></div>
                                <div className="col-span-1 flex justify-center"><button type="button" onClick={() => removeLine(idx)} disabled={lines.length <= 2} className="p-1.5 rounded-lg text-[hsl(var(--admin-text-muted))] hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-30"><span className="material-symbols-outlined text-[18px]">close</span></button></div>
                            </div>
                        ))}
                    </div>
                    <button type="button" onClick={addLine} className="mt-3 text-[13px] font-semibold text-[hsl(var(--admin-primary))] hover:underline">+ Add Line</button>
                </div>
                <div className="flex items-center justify-between border-t border-[hsl(var(--admin-border))] pt-4">
                    <div className="flex items-center gap-4">
                        <div className="text-[13px]"><span className="text-[hsl(var(--admin-text-sub))]">Debit: </span><span className="font-bold font-mono">R {totalDebit.toFixed(2)}</span></div>
                        <div className="text-[13px]"><span className="text-[hsl(var(--admin-text-sub))]">Credit: </span><span className="font-bold font-mono">R {totalCredit.toFixed(2)}</span></div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${isBalanced ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{isBalanced ? 'Balanced' : 'Unbalanced'}</span>
                    </div>
                    <label className="flex items-center gap-2 text-[13px] text-[hsl(var(--admin-text-sub))]"><input type="checkbox" checked={autoPost} onChange={e => setAutoPost(e.target.checked)} className="rounded" />Post immediately</label>
                </div>
            </div>
            <div className="flex gap-3">
                <button type="button" onClick={() => router.back()} className="px-5 py-2.5 rounded-xl font-semibold text-sm border border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text-main))]">Cancel</button>
                <button type="button" onClick={handleSubmit} disabled={submitting || !isBalanced} className="bg-[hsl(var(--admin-primary))] text-white hover:bg-[hsl(var(--admin-primary))/0.9] active:scale-[0.96] px-6 py-2.5 rounded-xl font-semibold transition-all shadow-sm text-sm disabled:opacity-50">{submitting ? 'Creating...' : autoPost ? 'Create & Post' : 'Create Draft'}</button>
            </div>
        </div>
    );
}
