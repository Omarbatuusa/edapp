'use client';

import { useState } from 'react';
import { FieldWrapper } from '../inputs/FieldWrapper';
import { PhoneInput, PhoneValue } from '../inputs/PhoneInput';
import { AddressInput, AddressValue } from '../inputs/AddressInput';
import { LogoUpload } from '../inputs/LogoUpload';

interface BranchCard {
    branch_name: string;
    branch_code: string;
    about: string;
    address: AddressValue;
    mobile: PhoneValue;
    landline: PhoneValue;
    branch_email: string;
    school_logo_url: string;
}

interface BulkResult {
    index: number;
    success: boolean;
    error?: string;
    branchId?: string;
}

interface BulkAddBranchesProps {
    mainBranchId: string;
    tenantId?: string;
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (count: number) => void;
}

const EMPTY_PHONE: PhoneValue = { raw: '', e164: '', country_iso2: 'ZA', dial_code: '+27' };
const EMPTY_ADDRESS: AddressValue = { formatted_address: '', google_place_id: '', street: '', suburb: '', city: '', province: '', postal_code: '', country: '', lat: null, lng: null };

const EMPTY_CARD: BranchCard = {
    branch_name: '', branch_code: '', about: '', address: EMPTY_ADDRESS,
    mobile: EMPTY_PHONE, landline: EMPTY_PHONE, branch_email: '', school_logo_url: '',
};

export function BulkAddBranches({ mainBranchId, tenantId, isOpen, onClose, onSuccess }: BulkAddBranchesProps) {
    const [cards, setCards] = useState<BranchCard[]>([{ ...EMPTY_CARD }]);
    const [results, setResults] = useState<BulkResult[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [done, setDone] = useState(false);

    if (!isOpen) return null;

    const updateCard = (idx: number, patch: Partial<BranchCard>) => {
        setCards(prev => prev.map((c, i) => i === idx ? { ...c, ...patch } : c));
    };

    const addCard = () => setCards(prev => [...prev, { ...EMPTY_CARD }]);
    const removeCard = (idx: number) => setCards(prev => prev.filter((_, i) => i !== idx));

    const handleSubmit = async () => {
        setSubmitting(true);
        setResults([]);
        const token = localStorage.getItem('session_token');
        try {
            const res = await fetch('/v1/admin/branches/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                body: JSON.stringify({
                    branches: cards.map(c => ({
                        is_main_branch: false,
                        tenant_id: tenantId,
                        parent_branch_id: mainBranchId,
                        branch_name: c.branch_name,
                        branch_code: c.branch_code,
                        about: c.about || null,
                        school_logo_url: c.school_logo_url || null,
                        physical_address: c.address?.formatted_address || null,
                        formatted_address: c.address?.formatted_address || null,
                        google_place_id: c.address?.google_place_id || null,
                        mobile_whatsapp: c.mobile?.raw || null,
                        mobile_e164: c.mobile?.e164 || null,
                        phone_landline: c.landline?.raw || null,
                        landline_e164: c.landline?.e164 || null,
                        branch_email: c.branch_email || null,
                    })),
                }),
            });
            const data = await res.json();
            const r: BulkResult[] = data.results || [];
            setResults(r);
            setDone(true);
            const successCount = r.filter(x => x.success).length;
            if (successCount > 0) onSuccess?.(successCount);
        } catch (err: any) {
            setResults([{ index: 0, success: false, error: err.message || 'Network error' }]);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 w-full sm:max-w-[90vw] sm:max-h-[90vh] max-h-[95vh] rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Bulk Add Branches</h2>
                        <p className="text-sm text-slate-400">Add multiple branches at once</p>
                    </div>
                    <button type="button" onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                        <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-5">
                    {done ? (
                        <div className="flex flex-col gap-3">
                            <h3 className="font-semibold text-slate-700 dark:text-slate-200">Results</h3>
                            {results.map((r, i) => (
                                <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${r.success ? 'border-green-200 bg-green-50 dark:bg-green-900/10' : 'border-red-200 bg-red-50 dark:bg-red-900/10'}`}>
                                    <span className={`material-symbols-outlined text-sm ${r.success ? 'text-green-600' : 'text-red-500'}`}>{r.success ? 'check_circle' : 'error'}</span>
                                    <div>
                                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{cards[r.index]?.branch_name || `Branch ${r.index + 1}`}</p>
                                        {r.error && <p className="text-xs text-red-500">{r.error}</p>}
                                    </div>
                                </div>
                            ))}
                            <button type="button" onClick={onClose} className="mt-2 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-xl text-sm hover:bg-blue-700 transition-colors">Done</button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-6">
                            {cards.map((card, idx) => (
                                <div key={idx} className="border border-slate-200 dark:border-slate-700 rounded-2xl p-4 relative">
                                    {results[idx] && !results[idx].success && (
                                        <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 text-xs text-red-600">{results[idx].error}</div>
                                    )}
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Branch {idx + 1}</span>
                                        {cards.length > 1 && (
                                            <button type="button" onClick={() => removeCard(idx)} className="text-xs text-red-500 hover:text-red-700">Remove</button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <FieldWrapper label="Branch Name" required state={card.branch_name ? 'success' : 'idle'}>
                                            <input type="text" value={card.branch_name} onChange={e => updateCard(idx, { branch_name: e.target.value })} placeholder="Branch name" className="w-full px-3 py-2.5 text-sm bg-transparent outline-none" />
                                        </FieldWrapper>
                                        <FieldWrapper label="Branch Code" required state={card.branch_code ? 'success' : 'idle'}>
                                            <input type="text" value={card.branch_code} onChange={e => updateCard(idx, { branch_code: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') })} placeholder="CODE" maxLength={20} className="w-full px-3 py-2.5 text-sm bg-transparent outline-none font-mono" />
                                        </FieldWrapper>
                                        <div className="sm:col-span-2">
                                            <FieldWrapper label="About" state="idle">
                                                <input type="text" value={card.about} onChange={e => updateCard(idx, { about: e.target.value })} placeholder="Short description..." className="w-full px-3 py-2.5 text-sm bg-transparent outline-none" />
                                            </FieldWrapper>
                                        </div>
                                        <div className="sm:col-span-2">
                                            <AddressInput label="Address" value={card.address} onChange={addr => updateCard(idx, { address: addr })} />
                                        </div>
                                        <PhoneInput label="Mobile" value={card.mobile} onChange={v => updateCard(idx, { mobile: v })} />
                                        <PhoneInput label="Landline" value={card.landline} onChange={v => updateCard(idx, { landline: v })} />
                                        <div className="sm:col-span-2">
                                            <FieldWrapper label="Email" state="idle">
                                                <input type="email" value={card.branch_email} onChange={e => updateCard(idx, { branch_email: e.target.value })} placeholder="branch@school.co.za" className="w-full px-3 py-2.5 text-sm bg-transparent outline-none" />
                                            </FieldWrapper>
                                        </div>
                                        <div className="sm:col-span-2">
                                            <LogoUpload value={card.school_logo_url} onChange={url => updateCard(idx, { school_logo_url: url })} required />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button type="button" onClick={addCard} className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-2xl text-blue-600 dark:text-blue-400 text-sm font-medium hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors">
                                <span className="material-symbols-outlined text-sm">add</span>
                                Add another branch
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {!done && (
                    <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 dark:border-slate-800 flex-shrink-0">
                        <span className="text-sm text-slate-400">{cards.length} {cards.length === 1 ? 'branch' : 'branches'} to create</span>
                        <div className="flex gap-2">
                            <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm text-slate-500 hover:text-slate-700 transition-colors">Cancel</button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={submitting || cards.some(c => !c.branch_name || !c.branch_code)}
                                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {submitting && <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />}
                                {submitting ? 'Creating...' : 'Create All'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
