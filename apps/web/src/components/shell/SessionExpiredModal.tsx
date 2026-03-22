'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';

/**
 * Site-wide session-expired modal.
 *
 * Listens for the `edapp:session-expired` CustomEvent dispatched by authFetch
 * when an admin session token is rejected by the backend (unrecoverable 401).
 *
 * Saves the current pathname to sessionStorage so that activateRole() in the
 * login page can return the user here after they log back in.
 */
export function SessionExpiredModal() {
    const [visible, setVisible] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        const handler = () => setVisible(true);
        window.addEventListener('edapp:session-expired', handler);
        return () => window.removeEventListener('edapp:session-expired', handler);
    }, []);

    const handleLoginAgain = () => {
        sessionStorage.setItem('edapp_return_to', pathname);
        router.push('/admin/login');
    };

    if (!visible) return null;

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="session-expired-title"
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        >
            <div className="bg-white dark:bg-[hsl(var(--admin-surface))] rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center">
                    <span className="material-symbols-outlined text-amber-500 text-[24px]">lock_clock</span>
                </div>
                <div className="text-center">
                    <h2 id="session-expired-title" className="text-[15px] font-semibold text-[hsl(var(--admin-text))]">
                        Session expired
                    </h2>
                    <p className="text-[13px] text-[hsl(var(--admin-text-sub))] mt-1">
                        Your login session has ended. Any unsaved work has been auto-saved as a draft.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={handleLoginAgain}
                    className="w-full h-[44px] rounded-xl bg-[hsl(var(--admin-primary))] text-white text-[14px] font-semibold hover:opacity-90 active:scale-[0.98] transition-all"
                >
                    Log in again
                </button>
            </div>
        </div>
    );
}
