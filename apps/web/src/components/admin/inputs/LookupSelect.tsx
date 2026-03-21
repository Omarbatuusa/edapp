'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { FieldWrapper } from './FieldWrapper';
import { authFetch } from '@/lib/authFetch';

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
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);

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

            const res = await authFetch(url);
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

    // Close dropdown on outside click
    useEffect(() => {
        if (!isOpen) return;
        const handleClick = (e: MouseEvent) => {
            if (
                dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
                triggerRef.current && !triggerRef.current.contains(e.target as Node)
            ) {
                setIsOpen(false);
                setSearch('');
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [isOpen]);

    const activeOptions = options.filter(o => (o as any).is_active !== false);
    const currentValue = multiple ? (Array.isArray(value) ? value : []) : (typeof value === 'string' ? value : '');
    const hasValue = multiple
        ? (currentValue as string[]).length > 0
        : (currentValue as string).length > 0;
    const state = error ? 'error' as const : hasValue ? 'success' as const : 'idle' as const;

    // ── Multi-select (checkbox list) ───────────────────────────────────────
    if (multiple) {
        const selectedValues = currentValue as string[];
        return (
            <FieldWrapper label={label} required={required} state={state} error={error}>
                <div className="p-2 space-y-1 max-h-48 overflow-y-auto">
                    {loading ? (
                        <p className="text-xs text-[hsl(var(--admin-text-muted))] px-2 py-1">Loading...</p>
                    ) : activeOptions.length === 0 ? (
                        <p className="text-xs text-[hsl(var(--admin-text-muted))] px-2 py-1">No options available</p>
                    ) : (
                        activeOptions.map(opt => {
                            const val = resolveValue(opt);
                            const checked = selectedValues.includes(val);
                            return (
                                <label
                                    key={val}
                                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[hsl(var(--admin-surface-alt))] cursor-pointer text-sm"
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
                                    <span className="text-[hsl(var(--admin-text-main))]">{resolveLabel(opt)}</span>
                                </label>
                            );
                        })
                    )}
                </div>
            </FieldWrapper>
        );
    }

    // ── Single-select (custom searchable dropdown) ─────────────────────────
    const singleValue = currentValue as string;
    const selectedLabel = singleValue
        ? resolveLabel(activeOptions.find(o => resolveValue(o) === singleValue) || {})
        : '';

    const filtered = activeOptions.filter(o =>
        resolveLabel(o).toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="relative">
            <FieldWrapper label={label} required={required} state={state} error={error} showIcon={false}>
                <button
                    ref={triggerRef}
                    type="button"
                    onClick={() => { setIsOpen(!isOpen); setSearch(''); }}
                    className="w-full flex items-center justify-between px-4 h-[44px] text-[15px] bg-transparent outline-none text-left"
                    aria-haspopup="listbox"
                    aria-expanded={isOpen ? 'true' : 'false'}
                >
                    <span className={selectedLabel
                        ? 'text-[hsl(var(--admin-text-main))]'
                        : 'text-[hsl(var(--admin-text-muted)/0.6)]'
                    }>
                        {loading ? 'Loading...' : selectedLabel || placeholder}
                    </span>
                    <span className="material-symbols-outlined text-[18px] text-[hsl(var(--admin-text-muted))] flex-shrink-0">
                        expand_more
                    </span>
                </button>
            </FieldWrapper>

            {isOpen && (
                <div
                    ref={dropdownRef}
                    className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-[hsl(var(--admin-border)/0.5)] rounded-xl shadow-xl overflow-hidden"
>
                    <div className="p-2 border-b border-[hsl(var(--admin-border)/0.3)]">
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search..."
                            aria-label="Search options"
                            title="Search options"
                            className="w-full px-3 py-1.5 text-[13px] bg-[hsl(var(--admin-surface-alt)/0.5)] rounded-lg border border-[hsl(var(--admin-border)/0.4)] outline-none text-[hsl(var(--admin-text-main))] placeholder:text-[hsl(var(--admin-text-muted))]"
                            autoFocus
                        />
                    </div>
                    <div className="max-h-48 overflow-y-auto" role="listbox">
                        {filtered.length === 0 ? (
                            <p className="px-4 py-3 text-[13px] text-[hsl(var(--admin-text-muted))]">
                                {activeOptions.length === 0
                                    ? (loading ? 'Loading...' : 'No options available')
                                    : 'No results'}
                            </p>
                        ) : (
                            filtered.map(opt => {
                                const val = resolveValue(opt);
                                const isSelected = val === singleValue;
                                return (
                                    <button
                                        key={val}
                                        type="button"
                                        role="option"
                                        aria-selected={isSelected ? 'true' : 'false'}
                                        onClick={() => { onChange(val); setIsOpen(false); setSearch(''); }}
                                        className={`w-full flex items-center px-4 py-2.5 text-[13px] text-left hover:bg-[hsl(var(--admin-surface-alt))] transition-colors ${
                                            isSelected
                                                ? 'text-[hsl(var(--admin-primary))] bg-[hsl(var(--admin-primary)/0.06)]'
                                                : 'text-[hsl(var(--admin-text-main))]'
                                        }`}
                                    >
                                        <span className="flex-1">{resolveLabel(opt)}</span>
                                        {isSelected && (
                                            <span className="material-symbols-outlined text-[15px] text-[hsl(var(--admin-primary))]">
                                                check
                                            </span>
                                        )}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
