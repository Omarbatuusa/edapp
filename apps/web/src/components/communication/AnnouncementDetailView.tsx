import React from 'react';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { DetailViewProps } from './types';
import { TranslateButton } from './TranslateButton';

const REACTIONS = [
    { id: 'like', icon: 'thumb_up', label: 'Like' },
    { id: 'check', icon: 'check_circle', label: 'Agree' },
    { id: 'heart', icon: 'favorite', label: 'Love' },
    { id: 'celebrate', icon: 'celebration', label: 'Celebrate' },
];

export function AnnouncementDetailView({ item, isTranslated }: DetailViewProps) {
    if (!item) return null;
    const title = item.title;
    const t = useTranslations();

    // Extract tenantId from URL
    const pathname = usePathname();
    const tenantId = pathname?.match(/\/tenant\/([^\/]+)/)?.[1] || '';

    const [acknowledged, setAcknowledged] = React.useState(false);
    const [activeReaction, setActiveReaction] = React.useState<string | null>(null);

    const handleReaction = (reactionId: string) => {
        setActiveReaction(activeReaction === reactionId ? null : reactionId);
    };

    return (
        <div className="space-y-6">
            {item.image && (
                <div className="w-full h-48 rounded-xl overflow-hidden bg-secondary">
                    <img src={item.image} alt="" className="w-full h-full object-cover" />
                </div>
            )}

            <div>
                <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-secondary rounded text-[10px] font-bold tracking-wider">{item.category}</span>
                    <span className="text-xs text-muted-foreground">{item.timestamp}</span>
                </div>
                <h1 className="text-2xl font-bold leading-tight">{title}</h1>
                <p className="text-lg text-muted-foreground mt-2">{item.subtitle}</p>
                {/* Translate Button */}
                <div className="mt-3">
                    <TranslateButton
                        contentId={item.id}
                        contentType="announcement"
                        text={`${title}. ${item.subtitle}`}
                        tenantId={tenantId}
                    />
                </div>
            </div>

            {/* Acknowledge Button */}
            {!acknowledged ? (
                <button
                    onClick={() => setAcknowledged(true)}
                    className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl shadow-md active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
                >
                    <span className="material-symbols-outlined">check_circle</span>
                    {t('actions.acknowledge')}
                </button>
            ) : (
                <div className="w-full py-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-bold rounded-xl text-sm flex items-center justify-center gap-2 border border-green-200 dark:border-green-800">
                    <span className="material-symbols-outlined">done_all</span>
                    {t('actions.acknowledged')}
                </div>
            )}

            <div className="prose dark:prose-invert text-sm">
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
            </div>

            {item.hasDownload && (
                <button className="w-full flex items-center justify-center gap-2 py-3 bg-primary/10 text-primary font-bold rounded-xl hover:bg-primary/20 transition-colors">
                    <span className="material-symbols-outlined">download</span>
                    {t('announcement.downloadAttachment')}
                </button>
            )}

            <div className="pt-8 border-t border-border">
                <h4 className="text-xs font-bold text-muted-foreground uppercase mb-3">{t('announcement.reactions')}</h4>
                <div className="flex gap-2">
                    {REACTIONS.map(reaction => (
                        <button
                            key={reaction.id}
                            onClick={() => handleReaction(reaction.id)}
                            className={`w-11 h-11 flex items-center justify-center rounded-full transition-all duration-200
                                ${activeReaction === reaction.id
                                    ? 'bg-primary/20 text-primary scale-110 shadow-sm'
                                    : 'bg-secondary text-muted-foreground hover:bg-secondary/80 hover:scale-105'
                                }`}
                            title={reaction.label}
                        >
                            <span className="material-symbols-outlined text-xl">{reaction.icon}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

