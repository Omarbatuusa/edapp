'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import {
    SearchScope,
    SearchResult,
    getSearchScopesForRole,
    getRecentSearches,
    addRecentSearch,
    clearRecentSearches,
    searchMock,
    RecentSearch
} from '@/lib/search';

interface SearchSheetProps {
    isOpen: boolean;
    onClose: () => void;
    tenantSlug: string;
    currentRole?: string;
}

/**
 * Search takeover screen.
 * Mobile: fullwidth edge-to-edge.
 * Tablet/Desktop: centered panel within Admin container width.
 */
export function SearchSheet({
    isOpen,
    onClose,
    tenantSlug,
    currentRole = 'parent'
}: SearchSheetProps) {
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);
    const [query, setQuery] = useState('');
    const [activeScope, setActiveScope] = useState<string>('');
    const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const scopes = getSearchScopesForRole(currentRole);

    useEffect(() => {
        if (scopes.length > 0 && !activeScope) {
            setActiveScope(scopes[0].id);
        }
    }, [scopes, activeScope]);

    useEffect(() => {
        if (isOpen) {
            setRecentSearches(getRecentSearches(tenantSlug));
        }
    }, [isOpen, tenantSlug]);

    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => inputRef.current?.focus(), 150);
            return () => clearTimeout(timer);
        } else {
            setQuery('');
            setResults([]);
        }
    }, [isOpen]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            return;
        }
        setIsSearching(true);
        const timer = setTimeout(() => {
            const searchResults = searchMock(query, activeScope);
            setResults(searchResults);
            setIsSearching(false);
        }, 200);
        return () => clearTimeout(timer);
    }, [query, activeScope]);

    const handleSearch = useCallback(() => {
        if (!query.trim()) return;
        addRecentSearch(tenantSlug, query, activeScope);
        setRecentSearches(getRecentSearches(tenantSlug));
    }, [query, activeScope, tenantSlug]);

    const handleResultClick = (result: SearchResult) => {
        addRecentSearch(tenantSlug, query, activeScope);
        onClose();
        if (result.url) {
            router.push(`/tenant/${tenantSlug}${result.url}`);
        }
    };

    const handleRecentClick = (recent: RecentSearch) => {
        setQuery(recent.query);
        setActiveScope(recent.scope);
    };

    const handleClearRecent = () => {
        clearRecentSearches(tenantSlug);
        setRecentSearches([]);
    };

    const currentScope = scopes.find(s => s.id === activeScope) || scopes[0];

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop — tablet/desktop only */}
            <div
                className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm hidden md:block"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Search panel */}
            <div
                className="
                    fixed inset-0 z-50 flex flex-col
                    bg-[hsl(var(--admin-background))]
                    md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2
                    md:w-[min(600px,calc(100vw-48px))] md:h-[min(80vh,720px)]
                    md:rounded-2xl md:shadow-2xl md:overflow-hidden
                    animate-in slide-in-from-bottom duration-300 md:fade-in md:zoom-in-95
                "
                role="dialog"
                aria-modal="true"
                aria-label="Search"
            >
                {/* Search header */}
                <div
                    className="flex items-center gap-3 px-4 py-3 border-b border-[hsl(var(--admin-border)/0.5)] bg-[hsl(var(--admin-background))] flex-shrink-0"
                    style={{ paddingTop: 'max(12px, env(safe-area-inset-top, 12px))' }}
                >
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center rounded-full text-[hsl(var(--admin-text-sub))] hover:bg-[hsl(var(--admin-surface-alt))] transition-colors active:scale-[0.92] flex-shrink-0"
                        aria-label="Close search"
                    >
                        <span className="material-symbols-outlined text-[22px] md:hidden">arrow_back</span>
                        <X size={20} className="hidden md:block" />
                    </button>

                    <div className="flex-1 relative">
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder={currentScope?.placeholder || 'Search...'}
                            className="w-full h-11 pl-4 pr-10 rounded-xl bg-[hsl(var(--admin-surface-alt))] border border-[hsl(var(--admin-border)/0.5)] text-[15px] text-[hsl(var(--admin-text-main))] placeholder:text-[hsl(var(--admin-text-muted))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--admin-primary)/0.4)] transition-all"
                        />
                        {query && (
                            <button
                                onClick={() => setQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[hsl(var(--admin-surface-alt))] hover:bg-[hsl(var(--admin-border))] flex items-center justify-center transition-colors"
                            >
                                <X size={14} className="text-[hsl(var(--admin-text-muted))]" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Scope tabs */}
                <div className="flex gap-1.5 px-4 py-2.5 border-b border-[hsl(var(--admin-border)/0.3)] overflow-x-auto scrollbar-hide flex-shrink-0">
                    {scopes.map((scope) => (
                        <button
                            key={scope.id}
                            onClick={() => setActiveScope(scope.id)}
                            className={`
                                flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium transition-all whitespace-nowrap shrink-0
                                ${activeScope === scope.id
                                    ? 'bg-[hsl(var(--admin-primary))] text-white'
                                    : 'bg-[hsl(var(--admin-surface-alt))] text-[hsl(var(--admin-text-muted))] hover:text-[hsl(var(--admin-text-main))] hover:bg-[hsl(var(--admin-border))]'
                                }
                            `}
                        >
                            <span className="material-symbols-outlined text-[15px]">{scope.icon}</span>
                            {scope.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    {/* Loading */}
                    {isSearching && (
                        <div className="flex items-center justify-center py-12">
                            <div className="w-6 h-6 border-2 border-[hsl(var(--admin-primary)/0.3)] border-t-[hsl(var(--admin-primary))] rounded-full animate-spin" />
                        </div>
                    )}

                    {/* Results */}
                    {!isSearching && query && results.length > 0 && (
                        <div className="divide-y divide-[hsl(var(--admin-border)/0.3)]">
                            {results.map((result) => (
                                <button
                                    key={result.id}
                                    onClick={() => handleResultClick(result)}
                                    className="w-full flex items-center gap-3 p-4 text-left hover:bg-[hsl(var(--admin-surface-alt)/0.5)] transition-colors"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-[hsl(var(--admin-surface-alt))] flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined text-xl text-[hsl(var(--admin-text-muted))]">
                                            {result.icon}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-[14px] font-medium text-[hsl(var(--admin-text-main))] truncate">{result.title}</h4>
                                        {result.subtitle && (
                                            <p className="text-[12px] text-[hsl(var(--admin-text-muted))] truncate">
                                                {result.subtitle}
                                            </p>
                                        )}
                                    </div>
                                    <span className="material-symbols-outlined text-[18px] text-[hsl(var(--admin-text-muted))]">chevron_right</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* No results */}
                    {!isSearching && query && results.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                            <div className="w-14 h-14 rounded-full bg-[hsl(var(--admin-surface-alt))] flex items-center justify-center mb-3">
                                <span className="material-symbols-outlined text-[28px] text-[hsl(var(--admin-text-muted))]">search_off</span>
                            </div>
                            <h3 className="text-[15px] font-medium text-[hsl(var(--admin-text-main))] mb-1">No results found</h3>
                            <p className="text-[13px] text-[hsl(var(--admin-text-muted))]">
                                Try a different search term or category
                            </p>
                        </div>
                    )}

                    {/* Recent searches */}
                    {!query && recentSearches.length > 0 && (
                        <div className="p-4">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-[11px] font-semibold text-[hsl(var(--admin-text-muted))] uppercase tracking-wider">
                                    Recent Searches
                                </h4>
                                <button
                                    onClick={handleClearRecent}
                                    className="text-[12px] text-[hsl(var(--admin-primary))] font-medium hover:underline"
                                >
                                    Clear
                                </button>
                            </div>
                            <div className="space-y-0.5">
                                {recentSearches.map((recent, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleRecentClick(recent)}
                                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[hsl(var(--admin-surface-alt)/0.5)] transition-colors text-left"
                                    >
                                        <span className="material-symbols-outlined text-[18px] text-[hsl(var(--admin-text-muted))]">history</span>
                                        <span className="text-[14px] text-[hsl(var(--admin-text-main))] truncate flex-1">{recent.query}</span>
                                        <span className="text-[11px] text-[hsl(var(--admin-text-muted))] capitalize shrink-0">
                                            {recent.scope}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Empty state */}
                    {!query && recentSearches.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                            <div className="w-14 h-14 rounded-full bg-[hsl(var(--admin-primary)/0.1)] flex items-center justify-center mb-3">
                                <span className="material-symbols-outlined text-[28px] text-[hsl(var(--admin-primary))]">search</span>
                            </div>
                            <h3 className="text-[15px] font-medium text-[hsl(var(--admin-text-main))] mb-1">Search EdApp</h3>
                            <p className="text-[13px] text-[hsl(var(--admin-text-muted))] max-w-[260px]">
                                Find {currentScope?.label.toLowerCase()}, announcements, events, and more
                            </p>
                        </div>
                    )}
                </div>

                {/* Desktop footer hint */}
                <div className="hidden md:flex items-center justify-center gap-4 p-3 border-t border-[hsl(var(--admin-border)/0.3)] bg-[hsl(var(--admin-surface-alt)/0.3)] text-[11px] text-[hsl(var(--admin-text-muted))] flex-shrink-0">
                    <span className="flex items-center gap-1.5">
                        <kbd className="px-1.5 py-0.5 rounded bg-[hsl(var(--admin-surface))] border border-[hsl(var(--admin-border))] text-[10px] font-mono">Enter</kbd>
                        to search
                    </span>
                    <span className="flex items-center gap-1.5">
                        <kbd className="px-1.5 py-0.5 rounded bg-[hsl(var(--admin-surface))] border border-[hsl(var(--admin-border))] text-[10px] font-mono">Esc</kbd>
                        to close
                    </span>
                </div>
            </div>
        </>
    );
}
