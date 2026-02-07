'use client';

import React from 'react';
import type { FilterType, SortType, DensityType } from '@/lib/communication-store';

// ============================================================
// FEED FILTERS - Filter chips, sort dropdown, density toggle
// ============================================================

interface FilterChip {
    id: FilterType;
    label: string;
    count?: number;
}

interface FeedFiltersProps {
    filters: FilterChip[];
    activeFilter: FilterType;
    sort: SortType;
    density: DensityType;
    onFilterChange: (filter: FilterType) => void;
    onSortChange: (sort: SortType) => void;
    onDensityChange: (density: DensityType) => void;
    showDensityToggle?: boolean;
}

const SORT_OPTIONS: { value: SortType; label: string }[] = [
    { value: 'newest', label: 'Newest' },
    { value: 'unread', label: 'Unread first' },
    { value: 'urgent', label: 'Urgent first' },
];

export function FeedFilters({
    filters,
    activeFilter,
    sort,
    density,
    onFilterChange,
    onSortChange,
    onDensityChange,
    showDensityToggle = false,
}: FeedFiltersProps) {
    return (
        <div className="py-3">
            {/* Filter chips row - wrap instead of scroll */}
            <div className="flex flex-wrap items-center gap-2">
                {filters.map((filter) => (
                    <button
                        key={filter.id}
                        onClick={() => onFilterChange(filter.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeFilter === filter.id
                                ? 'bg-foreground text-background'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            }`}
                    >
                        {filter.label}
                        {filter.count !== undefined && filter.count > 0 && (
                            <span className={`px-1.5 py-0.5 rounded text-xs font-semibold ${activeFilter === filter.id
                                    ? 'bg-background/20 text-background'
                                    : 'bg-background text-muted-foreground'
                                }`}>
                                {filter.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Sort + Density row */}
            <div className="flex items-center justify-between pt-3">
                {/* Sort dropdown */}
                <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Sort:</span>
                    <select
                        value={sort}
                        onChange={(e) => onSortChange(e.target.value as SortType)}
                        className="text-sm bg-transparent border-none text-foreground font-medium focus:outline-none focus:ring-0 cursor-pointer pr-6"
                    >
                        {SORT_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Density toggle (desktop only) */}
                {showDensityToggle && (
                    <div className="hidden md:flex items-center gap-1 bg-muted rounded-lg p-0.5">
                        <button
                            onClick={() => onDensityChange('comfortable')}
                            className={`px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${density === 'comfortable'
                                    ? 'bg-background text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            <span className="material-symbols-outlined text-sm">view_agenda</span>
                        </button>
                        <button
                            onClick={() => onDensityChange('compact')}
                            className={`px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${density === 'compact'
                                    ? 'bg-background text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            <span className="material-symbols-outlined text-sm">view_list</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default FeedFilters;
