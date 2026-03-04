'use client';

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import type { NavItem } from '@/config/navigation';

interface SubpageDetection {
    /** True if the current route is deeper than any bottom tab root. */
    isSubpage: boolean;
    /** True if the route matches a fullscreen pattern (e.g. /chat). */
    isFullscreen: boolean;
    /** The bottom tab path that is the closest parent, or null. */
    parentTabPath: string | null;
}

const FULLSCREEN_PATTERNS = ['/chat'];

/**
 * Detects whether the current route is a "subpage" (not a primary bottom tab).
 * When on a subpage, the bottom nav should be hidden and a SubpageBar shown.
 */
export function useSubpageDetection(bottomTabs: NavItem[], basePath: string): SubpageDetection {
    const pathname = usePathname();

    return useMemo(() => {
        if (!pathname) return { isSubpage: false, isFullscreen: false, parentTabPath: null };

        // Check fullscreen patterns
        const isFullscreen = FULLSCREEN_PATTERNS.some(p => pathname.includes(p));

        // Build absolute tab paths
        const tabPaths = bottomTabs
            .filter(t => t.id !== 'menu')
            .map(t => {
                const full = basePath + t.href;
                return full.endsWith('/') ? full.slice(0, -1) : full;
            });

        // Normalize current path
        const normalizedPath = pathname.endsWith('/') && pathname.length > 1
            ? pathname.slice(0, -1)
            : pathname;

        // Check if current path exactly matches any tab root
        const isTabRoot = tabPaths.some(tp => normalizedPath === tp);

        // Menu page is also a tab root
        const isMenuPage = normalizedPath === basePath + '/menu';

        const isSubpage = !isTabRoot && !isMenuPage;

        // Find closest parent tab
        let parentTabPath: string | null = null;
        if (isSubpage) {
            for (const tp of tabPaths) {
                if (normalizedPath.startsWith(tp + '/') || normalizedPath === tp) {
                    parentTabPath = tp;
                    break;
                }
            }
        }

        return { isSubpage, isFullscreen, parentTabPath };
    }, [pathname, bottomTabs, basePath]);
}
