'use client';

export function NotifItem({ icon, text, time }: { icon: string; text: string; time: string }) {
    return (
        <div className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-[hsl(var(--admin-surface-alt))] transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-[16px] text-[hsl(var(--admin-primary))] mt-0.5">{icon}</span>
            <div className="flex-1 min-w-0">
                <p className="type-muted text-[hsl(var(--admin-text-main))] leading-snug">{text}</p>
                <p className="type-metadata text-[hsl(var(--admin-text-muted))]">{time}</p>
            </div>
        </div>
    );
}
