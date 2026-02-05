/**
 * Search types and helpers
 * Role-aware search scopes and recent searches management
 */

import { UserRole, RoleCategory, ROLE_METADATA } from './roles';

// Search scope definitions
export interface SearchScope {
    id: string;
    label: string;
    icon: string; // Material Symbols icon
    placeholder: string;
}

// Search scopes by role category
export const SEARCH_SCOPES: Record<RoleCategory, SearchScope[]> = {
    platform: [
        { id: 'tenants', label: 'Tenants', icon: 'domain', placeholder: 'Search tenants...' },
        { id: 'users', label: 'Users', icon: 'person_search', placeholder: 'Search users...' },
        { id: 'logs', label: 'Logs', icon: 'history', placeholder: 'Search audit logs...' },
    ],
    governance: [
        { id: 'people', label: 'People', icon: 'people', placeholder: 'Search staff, learners, parents...' },
        { id: 'classes', label: 'Classes', icon: 'class', placeholder: 'Search classes...' },
        { id: 'tickets', label: 'Tickets', icon: 'confirmation_number', placeholder: 'Search tickets...' },
        { id: 'settings', label: 'Settings', icon: 'settings', placeholder: 'Search settings...' },
    ],
    operations: [
        { id: 'people', label: 'People', icon: 'people', placeholder: 'Search people...' },
        { id: 'applications', label: 'Applications', icon: 'description', placeholder: 'Search applications...' },
        { id: 'invoices', label: 'Invoices', icon: 'receipt_long', placeholder: 'Search invoices...' },
        { id: 'tickets', label: 'Tickets', icon: 'confirmation_number', placeholder: 'Search tickets...' },
    ],
    academic: [
        { id: 'learners', label: 'Learners', icon: 'school', placeholder: 'Search learners...' },
        { id: 'staff', label: 'Staff', icon: 'badge', placeholder: 'Search staff...' },
        { id: 'classes', label: 'Classes', icon: 'class', placeholder: 'Search classes...' },
        { id: 'reports', label: 'Reports', icon: 'assessment', placeholder: 'Search reports...' },
    ],
    teaching: [
        { id: 'learners', label: 'Learners', icon: 'school', placeholder: 'Search learners...' },
        { id: 'classes', label: 'Classes', icon: 'class', placeholder: 'Search classes...' },
        { id: 'homework', label: 'Homework', icon: 'assignment', placeholder: 'Search homework...' },
        { id: 'parents', label: 'Parents', icon: 'family_restroom', placeholder: 'Search parents...' },
    ],
    support: [
        { id: 'learners', label: 'Learners', icon: 'school', placeholder: 'Search learners...' },
        { id: 'cases', label: 'Cases', icon: 'folder_open', placeholder: 'Search cases...' },
        { id: 'incidents', label: 'Incidents', icon: 'report', placeholder: 'Search incidents...' },
    ],
    enduser: [
        { id: 'children', label: 'Children', icon: 'face', placeholder: 'Search children...' },
        { id: 'announcements', label: 'Announcements', icon: 'campaign', placeholder: 'Search announcements...' },
        { id: 'payments', label: 'Payments', icon: 'payments', placeholder: 'Search payments...' },
        { id: 'events', label: 'Events', icon: 'event', placeholder: 'Search events...' },
    ],
    community: [
        { id: 'events', label: 'Events', icon: 'event', placeholder: 'Search events...' },
        { id: 'members', label: 'Members', icon: 'people', placeholder: 'Search members...' },
        { id: 'documents', label: 'Documents', icon: 'description', placeholder: 'Search documents...' },
    ],
};

// Learner-specific scopes (different from parent)
export const LEARNER_SCOPES: SearchScope[] = [
    { id: 'classes', label: 'Classes', icon: 'class', placeholder: 'Search classes...' },
    { id: 'homework', label: 'Homework', icon: 'assignment', placeholder: 'Search homework...' },
    { id: 'timetable', label: 'Timetable', icon: 'schedule', placeholder: 'Search timetable...' },
    { id: 'resources', label: 'Resources', icon: 'menu_book', placeholder: 'Search resources...' },
];

/**
 * Get search scopes for a given role
 */
export function getSearchScopesForRole(role: string): SearchScope[] {
    // Special case for learner
    if (role === UserRole.LEARNER) {
        return LEARNER_SCOPES;
    }

    const meta = ROLE_METADATA[role as UserRole];
    if (!meta) {
        return SEARCH_SCOPES.enduser; // Default to enduser scopes
    }

    return SEARCH_SCOPES[meta.category] || SEARCH_SCOPES.enduser;
}

// ════════════════════════════════════════════════════════════════════════════
// Recent Searches
// ════════════════════════════════════════════════════════════════════════════

const RECENT_SEARCHES_KEY = 'edapp_recent_searches';
const MAX_RECENT_SEARCHES = 5;

export interface RecentSearch {
    query: string;
    scope: string;
    timestamp: number;
}

/**
 * Get recent searches for a tenant
 */
export function getRecentSearches(tenantSlug: string): RecentSearch[] {
    if (typeof window === 'undefined') return [];

    try {
        const key = `${RECENT_SEARCHES_KEY}_${tenantSlug}`;
        const stored = localStorage.getItem(key);
        if (!stored) return [];
        return JSON.parse(stored) as RecentSearch[];
    } catch {
        return [];
    }
}

/**
 * Add a recent search
 */
export function addRecentSearch(tenantSlug: string, query: string, scope: string): void {
    if (typeof window === 'undefined' || !query.trim()) return;

    try {
        const key = `${RECENT_SEARCHES_KEY}_${tenantSlug}`;
        const existing = getRecentSearches(tenantSlug);

        // Remove duplicates
        const filtered = existing.filter(s => s.query.toLowerCase() !== query.toLowerCase());

        // Add new search at the beginning
        const updated: RecentSearch[] = [
            { query: query.trim(), scope, timestamp: Date.now() },
            ...filtered.slice(0, MAX_RECENT_SEARCHES - 1),
        ];

        localStorage.setItem(key, JSON.stringify(updated));
    } catch {
        // Ignore storage errors
    }
}

/**
 * Clear recent searches for a tenant
 */
export function clearRecentSearches(tenantSlug: string): void {
    if (typeof window === 'undefined') return;

    try {
        const key = `${RECENT_SEARCHES_KEY}_${tenantSlug}`;
        localStorage.removeItem(key);
    } catch {
        // Ignore storage errors
    }
}

// ════════════════════════════════════════════════════════════════════════════
// Mock Search Results (for MVP)
// ════════════════════════════════════════════════════════════════════════════

export interface SearchResult {
    id: string;
    type: string;
    title: string;
    subtitle?: string;
    icon: string;
    url?: string;
}

// Mock data for demo purposes
const MOCK_RESULTS: Record<string, SearchResult[]> = {
    children: [
        { id: '1', type: 'learner', title: 'Emma Johnson', subtitle: 'Grade 5B • Present today', icon: 'face', url: '/children/1' },
        { id: '2', type: 'learner', title: 'Liam Johnson', subtitle: 'Grade 2A • Present today', icon: 'face', url: '/children/2' },
    ],
    announcements: [
        { id: '1', type: 'announcement', title: 'Sports Day Reminder', subtitle: 'Tomorrow at 9:00 AM', icon: 'campaign', url: '/announcements/1' },
        { id: '2', type: 'announcement', title: 'Term Fees Due', subtitle: 'Due by 15 Feb', icon: 'campaign', url: '/announcements/2' },
    ],
    payments: [
        { id: '1', type: 'invoice', title: 'Term 1 Fees - Emma', subtitle: 'R12,500 • Due 15 Feb', icon: 'receipt_long', url: '/pay/1' },
        { id: '2', type: 'payment', title: 'Tuckshop Top-up', subtitle: 'R500 • 2 days ago', icon: 'payments', url: '/pay/history/2' },
    ],
    events: [
        { id: '1', type: 'event', title: 'Sports Day', subtitle: '6 Feb, 9:00 AM', icon: 'event', url: '/calendar/1' },
        { id: '2', type: 'event', title: 'Parent Evening', subtitle: '20 Feb, 6:00 PM', icon: 'event', url: '/calendar/2' },
    ],
    learners: [
        { id: '1', type: 'learner', title: 'Emma Johnson', subtitle: 'Grade 5B', icon: 'school', url: '/learners/1' },
        { id: '2', type: 'learner', title: 'Noah Williams', subtitle: 'Grade 5B', icon: 'school', url: '/learners/2' },
        { id: '3', type: 'learner', title: 'Olivia Brown', subtitle: 'Grade 5A', icon: 'school', url: '/learners/3' },
    ],
    classes: [
        { id: '1', type: 'class', title: 'Grade 5B', subtitle: '28 learners • Mrs. Smith', icon: 'class', url: '/classes/5b' },
        { id: '2', type: 'class', title: 'Grade 2A', subtitle: '25 learners • Mr. Jones', icon: 'class', url: '/classes/2a' },
    ],
    homework: [
        { id: '1', type: 'homework', title: 'Maths Worksheet Ch.5', subtitle: 'Due tomorrow • Grade 5B', icon: 'assignment', url: '/homework/1' },
        { id: '2', type: 'homework', title: 'Science Project', subtitle: 'Due 10 Feb • Grade 5B', icon: 'assignment', url: '/homework/2' },
    ],
    people: [
        { id: '1', type: 'staff', title: 'Jane Smith', subtitle: 'Teacher • Grade 5', icon: 'badge', url: '/people/staff/1' },
        { id: '2', type: 'parent', title: 'Michael Johnson', subtitle: 'Parent • 2 children', icon: 'family_restroom', url: '/people/parents/2' },
    ],
};

/**
 * Mock search function (replace with real API later)
 */
export function searchMock(query: string, scope: string): SearchResult[] {
    if (!query.trim()) return [];

    const results = MOCK_RESULTS[scope] || [];
    const lowQuery = query.toLowerCase();

    return results.filter(r =>
        r.title.toLowerCase().includes(lowQuery) ||
        r.subtitle?.toLowerCase().includes(lowQuery)
    );
}
