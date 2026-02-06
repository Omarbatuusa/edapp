'use client';

import React from 'react';

// ============================================================
// FILTER CHIPS - Horizontal scrollable filter row
// ============================================================

export interface FilterChip {
    id: string;
    label: string;
    count?: number;
}

export interface FilterChipsProps {
    filters: FilterChip[];
    activeFilter: string;
    onFilterChange: (id: string) => void;
}

// Default filters as specified
export const DEFAULT_CHAT_FILTERS: FilterChip[] = [
    { id: 'all', label: 'All' },
    { id: 'unread', label: 'Unread' },
    { id: 'groups', label: 'Groups' },
    { id: 'staff', label: 'Staff' },
    { id: 'grades', label: 'Grades' },
    { id: 'support', label: 'Support' },
    { id: 'announcements', label: 'Announcements' },
];

export function FilterChips({ filters, activeFilter, onFilterChange }: FilterChipsProps) {
    return (
        <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
            <div className="flex gap-2 pb-2">
                {filters.map((filter) => {
                    const isActive = activeFilter === filter.id;
                    return (
                        <button
                            key={filter.id}
                            onClick={() => onFilterChange(filter.id)}
                            className={`
                                flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium shrink-0 transition-all
                                ${isActive
                                    ? 'bg-primary text-white shadow-sm'
                                    : 'bg-secondary/70 text-muted-foreground hover:bg-secondary hover:text-foreground'
                                }
                            `}
                        >
                            {filter.label}
                            {filter.count !== undefined && filter.count > 0 && (
                                <span className={`
                                    min-w-[18px] h-[18px] px-1 rounded-full text-[11px] font-bold flex items-center justify-center
                                    ${isActive
                                        ? 'bg-white/20 text-white'
                                        : 'bg-primary/10 text-primary'
                                    }
                                `}>
                                    {filter.count > 99 ? '99+' : filter.count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
