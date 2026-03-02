'use client';

import { ReactNode } from 'react';

interface RepeaterFieldProps<T> {
    label: string;
    items: T[];
    onChange: (items: T[]) => void;
    maxItems?: number;
    minItems?: number;
    renderItem: (item: T, index: number, update: (patch: Partial<T>) => void, remove: () => void) => ReactNode;
    createEmpty: () => T;
    addLabel?: string;
}

export function RepeaterField<T extends Record<string, any>>({
    label,
    items,
    onChange,
    maxItems = 10,
    minItems = 0,
    renderItem,
    createEmpty,
    addLabel = 'Add',
}: RepeaterFieldProps<T>) {
    const canAdd = items.length < maxItems;
    const canRemove = items.length > minItems;

    const handleAdd = () => {
        if (!canAdd) return;
        onChange([...items, createEmpty()]);
    };

    const handleUpdate = (index: number, patch: Partial<T>) => {
        const updated = items.map((item, i) => (i === index ? { ...item, ...patch } : item));
        onChange(updated);
    };

    const handleRemove = (index: number) => {
        if (!canRemove) return;
        onChange(items.filter((_, i) => i !== index));
    };

    const handleMoveUp = (index: number) => {
        if (index === 0) return;
        const updated = [...items];
        [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
        onChange(updated);
    };

    const handleMoveDown = (index: number) => {
        if (index >= items.length - 1) return;
        const updated = [...items];
        [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
        onChange(updated);
    };

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {label}
                    <span className="text-xs text-slate-400 ml-2">
                        ({items.length}{maxItems < 10 ? ` / ${maxItems}` : ''})
                    </span>
                </label>
                {canAdd && (
                    <button
                        type="button"
                        onClick={handleAdd}
                        className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                    >
                        <span className="material-symbols-outlined text-lg">add_circle</span>
                        {addLabel}
                    </button>
                )}
            </div>

            {items.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-6 text-center">
                    <span className="material-symbols-outlined text-3xl text-slate-300 dark:text-slate-600 mb-2 block">playlist_add</span>
                    <p className="text-sm text-slate-400">No items added yet</p>
                    <button
                        type="button"
                        onClick={handleAdd}
                        className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                        {addLabel}
                    </button>
                </div>
            )}

            {items.map((item, index) => (
                <div
                    key={index}
                    className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden"
                >
                    <div className="flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700">
                        <span className="text-xs font-semibold text-slate-500">
                            #{index + 1}
                        </span>
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={() => handleMoveUp(index)}
                                disabled={index === 0}
                                className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30 transition-colors"
                            >
                                <span className="material-symbols-outlined text-sm">arrow_upward</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleMoveDown(index)}
                                disabled={index >= items.length - 1}
                                className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30 transition-colors"
                            >
                                <span className="material-symbols-outlined text-sm">arrow_downward</span>
                            </button>
                            {canRemove && (
                                <button
                                    type="button"
                                    onClick={() => handleRemove(index)}
                                    className="p-1 text-red-400 hover:text-red-600 transition-colors ml-1"
                                >
                                    <span className="material-symbols-outlined text-sm">delete</span>
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="p-4 flex flex-col gap-4">
                        {renderItem(
                            item,
                            index,
                            (patch) => handleUpdate(index, patch),
                            () => handleRemove(index),
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
