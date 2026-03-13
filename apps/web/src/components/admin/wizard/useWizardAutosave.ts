'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

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

    const getHeaders = (): Record<string, string> => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('session_token') : null;
        return {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };
    };

    // Check for existing draft on mount
    useEffect(() => {
        const stored = typeof window !== 'undefined'
            ? sessionStorage.getItem(`wizard_draft_${formType}_${tenantId || ''}`)
            : null;

        if (stored) {
            // Try to load the existing draft
            loadDraft(stored);
        } else {
            // Check server for existing draft
            checkExistingDraft();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formType, tenantId]);

    const checkExistingDraft = async () => {
        try {
            const res = await fetch(
                `/v1/admin/drafts?form_type=${formType}${tenantId ? `&tenant_id=${tenantId}` : ''}`,
                { headers: getHeaders() },
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
            const res = await fetch(`/v1/admin/drafts/${id}`, { headers: getHeaders() });
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
                // Draft expired or deleted, create new one
                sessionStorage.removeItem(`wizard_draft_${formType}_${tenantId || ''}`);
                createDraft();
            }
        } catch {
            createDraft();
        }
    };

    const createDraft = async () => {
        try {
            const res = await fetch('/v1/admin/drafts', {
                method: 'POST',
                headers: getHeaders(),
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
                await fetch(`/v1/admin/drafts/${draftId}`, {
                    method: 'PUT',
                    headers: getHeaders(),
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
                await fetch(`/v1/admin/drafts/${existingDraft.draftId}`, {
                    method: 'DELETE',
                    headers: getHeaders(),
                });
            } catch { /* silent */ }
        }
        setExistingDraft(null);
        setVersionMismatch(false);
        sessionStorage.removeItem(`wizard_draft_${formType}_${tenantId || ''}`);
        createDraft();
    };

    const clearDraft = () => {
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
