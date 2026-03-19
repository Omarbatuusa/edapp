'use client';

export function TaskItem({ title, time, urgent }: { title: string; time: string; urgent?: boolean }) {
    return (
        <div className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[hsl(var(--admin-surface-alt))] active:scale-[0.98] transition-all cursor-pointer">
            <div className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${urgent ? 'bg-[hsl(var(--admin-danger))]' : 'bg-[hsl(var(--admin-primary))]'}`} />
            <div className="flex-1 min-w-0">
                <p className="type-muted text-[hsl(var(--admin-text-main))] truncate">{title}</p>
                <p className="type-metadata text-[hsl(var(--admin-text-muted))]">{time}</p>
            </div>
        </div>
    );
}
