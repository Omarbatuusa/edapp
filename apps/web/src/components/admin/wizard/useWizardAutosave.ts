'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export function useWizardAutosave(formType: 'MAIN_BRANCH' | 'BRANCH' | 'BRAND', tenantId?: string) {
    const [draftId, setDraftId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    // Create draft on mount if no draftId yet
    useEffect(() => {
        const stored = typeof window !== 'undefined'
            ? sessionStorage.getItem(`wizard_draft_${formType}_${tenantId || ''}`)
            : null;
        if (stored) {
            setDraftId(stored);
        } else {
            createDraft();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formType, tenantId]);

    const createDraft = async () => {
        try {
            const res = await fetch('/v1/admin/drafts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ form_type: formType, tenant_id: tenantId }),
            });
            const data = await res.json();
            if (data.draft_id) {
                setDraftId(data.draft_id);
                sessionStorage.setItem(`wizard_draft_${formType}_${tenantId || ''}`, data.draft_id);
            }
        } catch {
            // Non-critical — wizard still works without autosave
        }
    };

    const save = useCallback((step: number, data: Record<string, any>) => {
        if (!draftId) return;

        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            setSaving(true);
            try {
                await fetch(`/api/admin/drafts/${draftId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ current_step: step, data }),
                });
            } catch {
                // Silent fail — don't interrupt wizard flow
            } finally {
                setSaving(false);
            }
        }, 800);
    }, [draftId]);

    const clearDraft = () => {
        setDraftId(null);
        sessionStorage.removeItem(`wizard_draft_${formType}_${tenantId || ''}`);
    };

    return { draftId, saving, save, clearDraft };
}
