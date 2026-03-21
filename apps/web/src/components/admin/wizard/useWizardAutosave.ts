'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { authFetch } from '@/lib/authFetch';

interface AutosaveOptions {
  schemaVersion?: string;
}

interface DraftData {
  draftId: string;
  data: Record<string, any>;
  current_step: number;
  schema_version?: string;
}

export function useWizardAutosave(formType: string, tenantId?: string, options?: AutosaveOptions) {
    const schemaVersion = options?.schemaVersion || '1.0';
    const [draftId, setDraftId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [existingDraft, setExistingDraft] = useState<DraftData | null>(null);
    const [versionMismatch, setVersionMismatch] = useState(false);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    // Check for existing draft on mount
    useEffect(() => {
        const stored = typeof window !== 'undefined'
            ? sessionStorage.getItem(`wizard_draft_${formType}_${tenantId || ''}`)
            : null;

        if (stored) {
            loadDraft(stored);
        } else {
            checkExistingDraft();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formType, tenantId]);

    const checkExistingDraft = async () => {
        try {
            const res = await authFetch(
                `/v1/admin/drafts?form_type=${encodeURIComponent(formType)}${tenantId ? `&tenant_id=${tenantId}` : ''}`,
            );
            if (res.ok) {
                const drafts = await res.json();
                if (Array.isArray(drafts) && drafts.length > 0) {
                    const draft = drafts[0];
                    setExistingDraft({
                        draftId: draft.id,
                        data: draft.data || {},
                        current_step: draft.current_step || 0,
                        schema_version: draft.schema_version,
                    });
                    if (draft.schema_version && draft.schema_version !== schemaVersion) {
                        setVersionMismatch(true);
                    }
                    return;
                }
            }
        } catch { /* silent */ }
        createDraft();
    };

    const loadDraft = async (id: string) => {
        try {
            const res = await authFetch(`/v1/admin/drafts/${id}`);
            if (res.ok) {
                const draft = await res.json();
                setDraftId(id);
                setExistingDraft({
                    draftId: id,
                    data: draft.data || {},
                    current_step: draft.current_step || 0,
                    schema_version: draft.schema_version,
                });
                if (draft.schema_version && draft.schema_version !== schemaVersion) {
                    setVersionMismatch(true);
                }
            } else {
                sessionStorage.removeItem(`wizard_draft_${formType}_${tenantId || ''}`);
                createDraft();
            }
        } catch {
            createDraft();
        }
    };

    const createDraft = async () => {
        try {
            const res = await authFetch('/v1/admin/drafts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    form_type: formType,
                    tenant_id: tenantId,
                    schema_version: schemaVersion,
                }),
            });
            const data = await res.json();
            const id = data.draft_id || data.id;
            if (id) {
                setDraftId(id);
                sessionStorage.setItem(`wizard_draft_${formType}_${tenantId || ''}`, id);
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
                await authFetch(`/v1/admin/drafts/${draftId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        current_step: step,
                        data,
                        schema_version: schemaVersion,
                    }),
                });
            } catch {
                // Silent fail — don't interrupt wizard flow
            } finally {
                setSaving(false);
            }
        }, 800);
    }, [draftId, schemaVersion]);

    const resumeDraft = () => {
        if (existingDraft) {
            setDraftId(existingDraft.draftId);
            sessionStorage.setItem(`wizard_draft_${formType}_${tenantId || ''}`, existingDraft.draftId);
        }
    };

    const discardDraft = async () => {
        if (existingDraft) {
            try {
                await authFetch(`/v1/admin/drafts/${existingDraft.draftId}`, { method: 'DELETE' });
            } catch { /* silent */ }
        }
        setExistingDraft(null);
        setVersionMismatch(false);
        sessionStorage.removeItem(`wizard_draft_${formType}_${tenantId || ''}`);
        createDraft();
    };

    const clearDraft = () => {
        if (draftId) {
            authFetch(`/v1/admin/drafts/${draftId}`, { method: 'DELETE' }).catch(() => {});
        }
        setDraftId(null);
        setExistingDraft(null);
        sessionStorage.removeItem(`wizard_draft_${formType}_${tenantId || ''}`);
    };

    return {
        draftId,
        saving,
        save,
        clearDraft,
        existingDraft,
        versionMismatch,
        resumeDraft,
        discardDraft,
    };
}
