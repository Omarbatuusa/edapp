'use client';

export default function SupportAccessPage() {
    return (
        <div className="p-4 md:p-6 space-y-5">
            <div>
                <h1 className="text-xl font-bold tracking-tight">Support Access</h1>
                <p className="text-sm text-muted-foreground">
                    Manage time-limited support access grants for platform support staff.
                </p>
            </div>

            <div className="ios-card p-8 flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[hsl(var(--admin-surface-alt))] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[32px] text-[hsl(var(--admin-text-muted))]">support_agent</span>
                </div>
                <div className="text-center">
                    <p className="text-[15px] font-semibold text-[hsl(var(--admin-text-sub))]">Coming Soon</p>
                    <p className="text-[13px] text-[hsl(var(--admin-text-muted))] mt-1 max-w-sm">
                        This feature will allow platform support staff to request time-limited access to tenant dashboards
                        for troubleshooting, with full audit trails.
                    </p>
                </div>
            </div>
        </div>
    );
}
