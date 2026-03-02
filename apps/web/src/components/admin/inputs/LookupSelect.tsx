'use client';

import { useState, useEffect, useCallback } from 'react';
import { FieldWrapper } from './FieldWrapper';

interface LookupOption {
    code?: string;
    id?: string;
    label?: string;
    [key: string]: any;
}

interface LookupSelectProps {
    label: string;
    value: string | string[];
    onChange: (value: string | string[]) => void;
    dictName?: string;
    endpoint?: string;
    filterParams?: Record<string, string>;
    required?: boolean;
    multiple?: boolean;
    placeholder?: string;
    error?: string;
    labelKey?: string;
    valueKey?: string;
}

function getAuthHeaders(): Record<string, string> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('session_token') : null;
    return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

export function LookupSelect({
    label,
    value,
    onChange,
    dictName,
    endpoint,
    filterParams,
    required,
    multiple,
    placeholder = '— Select —',
    error,
    labelKey = 'label',
    valueKey,
}: LookupSelectProps) {
    const [options, setOptions] = useState<LookupOption[]>([]);
    const [loading, setLoading] = useState(false);

    const resolveValue = (opt: LookupOption): string => {
        if (valueKey) return opt[valueKey] || '';
        return opt.code || opt.id || '';
    };

    const resolveLabel = (opt: LookupOption): string => {
        return opt[labelKey] || opt.label || opt.code || opt.id || '';
    };

    const fetchOptions = useCallback(async () => {
        setLoading(true);
        try {
            let url: string;
            if (dictName) {
                url = `/v1/admin/dict/${dictName}`;
            } else if (endpoint) {
                url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
            } else {
                return;
            }

            if (filterParams) {
                const params = new URLSearchParams(filterParams);
                url += `?${params}`;
            }

            const res = await fetch(url, { headers: getAuthHeaders() });
            if (res.ok) {
                const data = await res.json();
                setOptions(Array.isArray(data) ? data : data.items || data.data || []);
            }
        } catch {
            // Silent fail
        } finally {
            setLoading(false);
        }
    }, [dictName, endpoint, filterParams]);

    useEffect(() => {
        fetchOptions();
    }, [fetchOptions]);

    const currentValue = multiple ? (Array.isArray(value) ? value : []) : (typeof value === 'string' ? value : '');

    const hasValue = multiple
        ? (currentValue as string[]).length > 0
        : (currentValue as string).length > 0;

    const state = error ? 'error' as const : hasValue ? 'success' as const : 'idle' as const;

    if (multiple) {
        const selectedValues = currentValue as string[];
        return (
            <FieldWrapper label={label} required={required} state={state} error={error}>
                <div className="p-2 space-y-1 max-h-48 overflow-y-auto">
                    {loading ? (
                        <p className="text-xs text-slate-400 px-2 py-1">Loading...</p>
                    ) : options.length === 0 ? (
                        <p className="text-xs text-slate-400 px-2 py-1">No options available</p>
                    ) : (
                        options.filter(o => (o as any).is_active !== false).map(opt => {
                            const val = resolveValue(opt);
                            const checked = selectedValues.includes(val);
                            return (
                                <label
                                    key={val}
                                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer text-sm"
                                >
                                    <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={() => {
                                            const next = checked
                                                ? selectedValues.filter(v => v !== val)
                                                : [...selectedValues, val];
                                            onChange(next);
                                        }}
                                        className="rounded border-slate-300"
                                    />
                                    <span className="text-slate-700 dark:text-slate-200">{resolveLabel(opt)}</span>
                                </label>
                            );
                        })
                    )}
                </div>
            </FieldWrapper>
        );
    }

    return (
        <FieldWrapper label={label} required={required} state={state} error={error}>
            <select
                value={currentValue as string}
                onChange={e => onChange(e.target.value)}
                className="w-full px-3 py-3 text-sm bg-transparent outline-none text-slate-800 dark:text-slate-100"
            >
                <option value="">{loading ? 'Loading...' : placeholder}</option>
                {options
                    .filter(o => (o as any).is_active !== false)
                    .map(opt => (
                        <option key={resolveValue(opt)} value={resolveValue(opt)}>
                            {resolveLabel(opt)}
                        </option>
                    ))}
            </select>
        </FieldWrapper>
    );
}
