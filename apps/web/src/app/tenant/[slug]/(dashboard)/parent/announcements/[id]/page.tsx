'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { SubPageHeader, SubPageWrapper } from '@/components/parent/SubPageHeader';
import { MOCK_CHAT_ANNOUNCEMENTS } from '@/lib/parent';

export default function AnnouncementDetailPage() {
    const params = useParams();
    const tenantSlug = params.slug as string;
    const announcementId = params.id as string;

    // Find the announcement
    const announcement = MOCK_CHAT_ANNOUNCEMENTS.find((a) => a.id === announcementId) || {
        id: announcementId,
        title: 'Announcement',
        preview: 'Details not available.',
        time: 'Now',
        badges: [],
        requiresAck: false,
        acknowledged: false,
    };

    return (
        <SubPageWrapper>
            <SubPageHeader
                title="Announcement"
                backHref={`/tenant/${tenantSlug}/parent/announcements`}
            />

            <div className="bg-card border border-border rounded-2xl overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-border">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary">campaign</span>
                        </div>
                        <div>
                            <p className="text-sm font-medium">School Administration</p>
                            <p className="text-xs text-muted-foreground">{announcement.time}</p>
                        </div>
                    </div>
                    <h1 className="text-lg font-bold">{announcement.title}</h1>
                </div>

                {/* Content */}
                <div className="p-4">
                    <p className="text-sm text-foreground leading-relaxed">
                        {announcement.preview}
                    </p>
                    <p className="text-sm text-foreground leading-relaxed mt-4">
                        This is a sample announcement with additional details. In production,
                        this would contain the full announcement content with rich text formatting,
                        links, and any additional information from the school.
                    </p>
                </div>

                {/* Attachments */}
                {announcement.badges.includes('doc') && (
                    <div className="p-4 border-t border-border">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Attachments</h3>
                        <button className="flex items-center gap-3 p-3 bg-secondary rounded-xl w-full text-left hover:bg-secondary/80 transition-colors">
                            <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                <span className="material-symbols-outlined text-red-600 dark:text-red-400">picture_as_pdf</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">Term1_Calendar_2026.pdf</p>
                                <p className="text-xs text-muted-foreground">245 KB</p>
                            </div>
                            <span className="material-symbols-outlined text-muted-foreground">download</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="mt-6 space-y-3">
                {announcement.requiresAck && !announcement.acknowledged && (
                    <button className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors">
                        Acknowledge
                    </button>
                )}
                {announcement.badges.includes('event') && (
                    <button className="w-full py-3.5 bg-secondary text-foreground rounded-xl font-medium hover:bg-secondary/80 transition-colors flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-lg">calendar_add_on</span>
                        Add to Calendar
                    </button>
                )}
                <Link
                    href={`/tenant/${tenantSlug}/parent/chat`}
                    className="w-full py-3.5 border border-border text-foreground rounded-xl font-medium hover:bg-secondary/30 transition-colors flex items-center justify-center gap-2"
                >
                    <span className="material-symbols-outlined text-lg">chat</span>
                    Ask a Question
                </Link>
            </div>
        </SubPageWrapper>
    );
}
