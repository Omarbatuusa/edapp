'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { X, ArrowLeft, Clock, Trash2 } from 'lucide-react';
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

    // Get scopes for current role
    const scopes = getSearchScopesForRole(currentRole);

    // Set default scope on mount
    useEffect(() => {
        if (scopes.length > 0 && !activeScope) {
            setActiveScope(scopes[0].id);
        }
    }, [scopes, activeScope]);

    // Load recent searches
    useEffect(() => {
        if (isOpen) {
            setRecentSearches(getRecentSearches(tenantSlug));
        }
    }, [isOpen, tenantSlug]);

    // Auto-focus input when opened
    useEffect(() => {
        if (isOpen) {
            // Small delay for animation
            const timer = setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    // Close on escape key
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

    // Search handler with debounce
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

    // Handle search submit
    const handleSearch = useCallback(() => {
        if (!query.trim()) return;
        addRecentSearch(tenantSlug, query, activeScope);
        setRecentSearches(getRecentSearches(tenantSlug));
        // In a real app, this would navigate to search results page
    }, [query, activeScope, tenantSlug]);

    // Handle result click
    const handleResultClick = (result: SearchResult) => {
        addRecentSearch(tenantSlug, query, activeScope);
        onClose();
        if (result.url) {
            router.push(`/tenant/${tenantSlug}${result.url}`);
        }
    };

    // Handle recent search click
    const handleRecentClick = (recent: RecentSearch) => {
        setQuery(recent.query);
        setActiveScope(recent.scope);
    };

    // Clear recent searches
    const handleClearRecent = () => {
        clearRecentSearches(tenantSlug);
        setRecentSearches([]);
    };

    // Get current scope info
    const currentScope = scopes.find(s => s.id === activeScope) || scopes[0];

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Search Sheet */}
            <div
                className="fixed inset-0 z-50 bg-background animate-in slide-in-from-bottom duration-300 md:inset-4 md:rounded-2xl md:shadow-2xl overflow-hidden flex flex-col"
                role="dialog"
                aria-modal="true"
                aria-label="Search"
            >
                {/* Header */}
                <div className="flex items-center gap-3 p-4 border-b border-border/50 bg-background/95 backdrop-blur-xl">
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary/60 transition-colors shrink-0"
                        aria-label="Close search"
                    >
                        <ArrowLeft size={22} />
                    </button>

                    {/* Search Input */}
                    <div className="flex-1 relative">
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder={currentScope?.placeholder || 'Search...'}
                            className="w-full h-11 pl-4 pr-10 rounded-xl bg-secondary/50 border border-border/50 text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                        />
                        {query && (
                            <button
                                onClick={() => setQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-colors"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Scope Tabs */}
                <div className="flex gap-2 px-4 py-3 border-b border-border/30 overflow-x-auto scrollbar-hide">
                    {scopes.map((scope) => (
                        <button
                            key={scope.id}
                            onClick={() => setActiveScope(scope.id)}
                            className={`
                                flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap shrink-0
                                ${activeScope === scope.id
                                    ? 'bg-primary text-white shadow-sm'
                                    : 'bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary'
                                }
                            `}
                        >
                            <span className="material-symbols-outlined text-base">{scope.icon}</span>
                            {scope.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto">
                    {/* Loading State */}
                    {isSearching && (
                        <div className="flex items-center justify-center py-12">
                            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                        </div>
                    )}

                    {/* Results */}
                    {!isSearching && query && results.length > 0 && (
                        <div className="divide-y divide-border/30">
                            {results.map((result) => (
                                <button
                                    key={result.id}
                                    onClick={() => handleResultClick(result)}
                                    className="w-full flex items-center gap-3 p-4 text-left hover:bg-secondary/30 transition-colors"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-secondary/80 flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined text-xl text-muted-foreground">
                                            {result.icon}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-medium truncate">{result.title}</h4>
                                        {result.subtitle && (
                                            <p className="text-xs text-muted-foreground truncate">
                                                {result.subtitle}
                                            </p>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* No Results */}
                    {!isSearching && query && results.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                            <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
                                <span className="material-symbols-outlined text-3xl text-muted-foreground">
                                    search_off
                                </span>
                            </div>
                            <h3 className="font-medium text-foreground mb-1">No results found</h3>
                            <p className="text-sm text-muted-foreground">
                                Try a different search term or category
                            </p>
                        </div>
                    )}

                    {/* Recent Searches (when no query) */}
                    {!query && recentSearches.length > 0 && (
                        <div className="p-4">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Recent Searches
                                </h4>
                                <button
                                    onClick={handleClearRecent}
                                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                                >
                                    <Trash2 size={12} />
                                    Clear
                                </button>
                            </div>
                            <div className="space-y-1">
                                {recentSearches.map((recent, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleRecentClick(recent)}
                                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-colors text-left"
                                    >
                                        <Clock size={16} className="text-muted-foreground shrink-0" />
                                        <span className="text-sm truncate">{recent.query}</span>
                                        <span className="text-xs text-muted-foreground ml-auto capitalize shrink-0">
                                            {recent.scope}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Empty State (no query, no recent) */}
                    {!query && recentSearches.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                <span className="material-symbols-outlined text-3xl text-primary">
                                    search
                                </span>
                            </div>
                            <h3 className="font-medium text-foreground mb-1">Search EdApp</h3>
                            <p className="text-sm text-muted-foreground max-w-xs">
                                Find {currentScope?.label.toLowerCase()}, announcements, events, and more
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer Hint */}
                <div className="hidden md:flex items-center justify-center gap-4 p-3 border-t border-border/30 bg-secondary/20 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                        <kbd className="px-1.5 py-0.5 rounded bg-secondary border border-border text-[10px] font-mono">↵</kbd>
                        to search
                    </span>
                    <span className="flex items-center gap-1.5">
                        <kbd className="px-1.5 py-0.5 rounded bg-secondary border border-border text-[10px] font-mono">esc</kbd>
                        to close
                    </span>
                </div>
            </div>
        </>
    );
}
