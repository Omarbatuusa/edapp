'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { SubPageHeader, SubPageWrapper } from '@/components/parent/SubPageHeader';
import { MOCK_CHAT_ANNOUNCEMENTS } from '@/lib/parent';

export default function AnnouncementsPage() {
    const params = useParams();
    const tenantSlug = params.slug as string;

    const badgeConfig: Record<string, { icon: string; color: string; label: string }> = {
        urgent: { icon: 'priority_high', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400', label: 'Urgent' },
        ack: { icon: 'check_circle', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', label: 'Requires Ack' },
        doc: { icon: 'attach_file', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', label: 'Has Attachment' },
        event: { icon: 'event', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', label: 'Event' },
    };

    return (
        <SubPageWrapper>
            <SubPageHeader
                title="Announcements"
                backHref={`/tenant/${tenantSlug}/parent/chat`}
            />

            <div className="space-y-3">
                {MOCK_CHAT_ANNOUNCEMENTS.map((announcement) => (
                    <Link
                        key={announcement.id}
                        href={`/tenant/${tenantSlug}/parent/announcements/${announcement.id}`}
                        className="block bg-card border border-border rounded-xl p-4 hover:bg-secondary/30 transition-colors"
                    >
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-primary">campaign</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-sm">{announcement.title}</h3>
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{announcement.preview}</p>
                                <div className="flex items-center gap-2 mt-3">
                                    <span className="text-xs text-muted-foreground">{announcement.time}</span>
                                    {announcement.badges.map((badge) => (
                                        <span
                                            key={badge}
                                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${badgeConfig[badge]?.color}`}
                                        >
                                            <span className="material-symbols-outlined text-xs">{badgeConfig[badge]?.icon}</span>
                                            {badgeConfig[badge]?.label}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            {announcement.requiresAck && !announcement.acknowledged && (
                                <button
                                    onClick={(e) => { e.preventDefault(); console.log('Ack:', announcement.id); }}
                                    className="px-3 py-2 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shrink-0"
                                >
                                    Acknowledge
                                </button>
                            )}
                            {announcement.acknowledged && (
                                <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 shrink-0">
                                    <span className="material-symbols-outlined text-sm">check_circle</span>
                                    Done
                                </span>
                            )}
                        </div>
                    </Link>
                ))}
            </div>
        </SubPageWrapper>
    );
}
