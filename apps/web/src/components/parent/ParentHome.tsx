'use client';

import Link from 'next/link';
import { Heart, MessageCircle, Share2, MoreHorizontal, ChevronRight } from 'lucide-react';
import {
    Child,
    Homework,
    Announcement,
    SchoolPost,
    QuickAction,
    getDueBadgeStyle,
    formatCurrency,
    MOCK_CHILDREN,
    MOCK_HOMEWORK,
    MOCK_ANNOUNCEMENTS,
    MOCK_SCHOOL_POSTS,
    PARENT_QUICK_ACTIONS,
    MOCK_FEES_BALANCE,
    MOCK_PAYMENTS,
} from '@/lib/parent';

interface ParentHomeProps {
    tenantSlug: string;
    tenantName?: string;
    tenantLogo?: string;
}

// ============================================================
// CHILD CARD - Professional Design
// ============================================================
function ChildCard({ child, tenantSlug }: { child: Child; tenantSlug: string }) {
    const isPresent = child.status === 'present';
    const isAbsent = child.status === 'absent';

    return (
        <div className="min-w-[260px] max-w-[300px] bg-card border border-border rounded-2xl p-4 flex-shrink-0 snap-start shadow-sm">
            {/* Header: Avatar + Info */}
            <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="relative shrink-0">
                    <img
                        src={child.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(child.name)}&size=64&background=6366f1&color=fff`}
                        alt={child.name}
                        className="w-14 h-14 rounded-xl object-cover border border-border/50"
                    />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base truncate">{child.name}</h3>
                    <p className="text-xs text-muted-foreground">{child.grade} • {child.class}</p>

                    {/* Status Badge - Clean design */}
                    <div className="mt-1.5 flex items-center gap-1.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-full ${isPresent
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : isAbsent
                                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                            }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isPresent ? 'bg-emerald-500' : isAbsent ? 'bg-red-500' : 'bg-amber-500'
                                }`} />
                            {isPresent ? 'At School' : isAbsent ? 'Absent' : 'Late'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Last Seen */}
            {child.lastSeen && (
                <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">schedule</span>
                    {child.lastSeen.time} at {child.lastSeen.location}
                </p>
            )}

            {/* Action Buttons */}
            <div className="mt-3 flex gap-2">
                <Link
                    href={`/tenant/${tenantSlug}/parent/children/${child.id}`}
                    className="flex-1 text-center text-sm font-medium py-2.5 px-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                >
                    View Profile
                </Link>
                <button
                    className="flex items-center justify-center w-10 h-10 rounded-lg border border-border hover:bg-secondary/50 transition-colors text-muted-foreground"
                    title="Log Absence"
                >
                    <span className="material-symbols-outlined text-lg">event_busy</span>
                </button>
            </div>

            {/* Verification Alert for Absent */}
            {child.needsVerification && (
                <div className="mt-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-2.5 flex items-center justify-between">
                    <span className="text-xs font-medium text-red-700 dark:text-red-400">Please verify absence</span>
                    <button className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline">Verify →</button>
                </div>
            )}
        </div>
    );
}

// ============================================================
// FEES BALANCE CARD
// ============================================================
function FeesBalanceCard({ tenantSlug }: { tenantSlug: string }) {
    const fees = MOCK_FEES_BALANCE;
    const latestPayment = MOCK_PAYMENTS[0];

    return (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
            {/* Balance Header */}
            <div className="p-4 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium opacity-80">Outstanding Balance</p>
                        <p className="text-2xl font-bold">{formatCurrency(fees.totalDue, fees.currency)}</p>
                        <p className="text-xs opacity-70 mt-1">Due: {fees.dueDate}</p>
                    </div>
                    <Link
                        href={`/tenant/${tenantSlug}/parent/pay`}
                        className="flex items-center gap-1 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        Pay Now
                        <ChevronRight size={16} />
                    </Link>
                </div>
            </div>

            {/* Latest Payment */}
            {latestPayment && (
                <div className="p-4 border-t border-border">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400">check_circle</span>
                            </div>
                            <div>
                                <p className="text-sm font-medium">Last Payment</p>
                                <p className="text-xs text-muted-foreground">{latestPayment.date} • {latestPayment.method}</p>
                            </div>
                        </div>
                        <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(latestPayment.amount, latestPayment.currency)}
                        </p>
                    </div>
                    <Link
                        href={`/tenant/${tenantSlug}/parent/pay/history`}
                        className="mt-3 block text-center text-sm text-primary font-medium hover:underline"
                    >
                        View Payment History
                    </Link>
                </div>
            )}
        </div>
    );
}

// ============================================================
// QUICK ACTIONS GRID
// ============================================================
function QuickActionsGrid({ actions, tenantSlug }: { actions: QuickAction[]; tenantSlug: string }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {actions.map((action) => (
                <Link
                    key={action.id}
                    href={`/tenant/${tenantSlug}/parent${action.href}`}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all ${action.primary
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm'
                        : 'bg-card hover:bg-secondary/80 text-foreground border border-border'
                        }`}
                >
                    <span className="material-symbols-outlined text-2xl mb-1">{action.icon}</span>
                    <span className="text-sm font-medium">{action.label}</span>
                </Link>
            ))}
        </div>
    );
}

// ============================================================
// HOMEWORK ITEM
// ============================================================
function HomeworkItem({ hw }: { hw: Homework }) {
    const badge = getDueBadgeStyle(hw.dueBadge);
    return (
        <div className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl hover:bg-secondary/30 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary">{hw.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate">{hw.title}</h4>
                <p className="text-xs text-muted-foreground truncate">{hw.childName} • {hw.subject}</p>
            </div>
            <span className={`px-2 py-1 text-[10px] font-bold rounded-md shrink-0 ${badge.bg} ${badge.text}`}>
                {badge.label}
            </span>
        </div>
    );
}

// ============================================================
// ANNOUNCEMENT CARD
// ============================================================
function AnnouncementCard({ announcement }: { announcement: Announcement }) {
    const isHigh = announcement.priority === 'high';
    return (
        <div className={`p-4 rounded-xl border ${isHigh ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border'}`}>
            <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isHigh ? 'bg-white/20' : 'bg-primary/10'}`}>
                    <span className={`material-symbols-outlined ${isHigh ? 'text-white' : 'text-primary'}`}>
                        campaign
                    </span>
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm">{announcement.title}</h4>
                    <p className={`text-xs mt-1 line-clamp-2 ${isHigh ? 'text-white/80' : 'text-muted-foreground'}`}>
                        {announcement.preview}
                    </p>
                    <p className={`text-xs mt-2 ${isHigh ? 'text-white/60' : 'text-muted-foreground/60'}`}>
                        Posted {announcement.postedAt}
                    </p>
                </div>
            </div>
            {announcement.requiresAcknowledge && !announcement.acknowledged && (
                <button className={`mt-3 w-full py-2 text-xs font-medium rounded-lg ${isHigh
                    ? 'bg-white/20 hover:bg-white/30 text-white'
                    : 'bg-primary text-primary-foreground hover:bg-primary/90'
                    }`}>
                    Acknowledge
                </button>
            )}
        </div>
    );
}

// ============================================================
// SCHOOL LIFE POST CARD
// ============================================================
function SchoolLifeCard({ post, tenantName, tenantLogo }: { post: SchoolPost; tenantName?: string; tenantLogo?: string }) {
    // Use tenant info if author is the school
    const isSchoolPost = post.author.name.toLowerCase().includes('academy') || post.author.name.toLowerCase().includes('school');

    return (
        <div className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border">
            {/* Author header */}
            <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-border/50">
                        {isSchoolPost && tenantLogo ? (
                            <img src={tenantLogo} alt={tenantName} className="w-full h-full object-cover" />
                        ) : post.author.avatar ? (
                            <img src={post.author.avatar} alt={post.author.name} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-primary font-bold text-sm">{post.author.name.substring(0, 2).toUpperCase()}</span>
                        )}
                    </div>
                    <div className="min-w-0">
                        <h4 className="font-semibold text-sm truncate max-w-[150px] sm:max-w-[200px]">
                            {isSchoolPost && tenantName ? tenantName : post.author.name}
                        </h4>
                        <p className="text-xs text-muted-foreground">{post.author.department} • {post.postedAt}</p>
                    </div>
                </div>
                <button className="p-2 hover:bg-secondary rounded-full shrink-0">
                    <MoreHorizontal size={18} className="text-muted-foreground" />
                </button>
            </div>

            {/* Image */}
            {post.image && (
                <img src={post.image} alt="" className="w-full aspect-video object-cover" />
            )}

            {/* Engagement */}
            <div className="p-4">
                <div className="flex items-center gap-4 mb-3">
                    <button className={`flex items-center gap-1.5 ${post.liked ? 'text-red-500' : 'text-muted-foreground hover:text-foreground'}`}>
                        <Heart size={20} fill={post.liked ? 'currentColor' : 'none'} />
                        <span className="text-sm font-medium">{post.likes}</span>
                    </button>
                    <button className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
                        <MessageCircle size={20} />
                        <span className="text-sm font-medium">{post.comments}</span>
                    </button>
                    <button className="ml-auto text-muted-foreground hover:text-foreground">
                        <Share2 size={20} />
                    </button>
                </div>

                {/* Content */}
                <p className="text-sm line-clamp-3">{post.content}</p>
            </div>
        </div>
    );
}

// ============================================================
// SECTION HEADER
// ============================================================
function SectionHeader({ title, href, tenantSlug }: { title: string; href?: string; tenantSlug: string }) {
    return (
        <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-base">{title}</h2>
            {href && (
                <Link
                    href={`/tenant/${tenantSlug}/parent${href}`}
                    className="text-sm text-primary font-medium hover:underline"
                >
                    View All
                </Link>
            )}
        </div>
    );
}

// ============================================================
// SCROLL END INDICATOR
// ============================================================
function ScrollEndIndicator() {
    return (
        <div className="flex flex-col items-center py-8 text-muted-foreground">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center mb-2">
                <span className="material-symbols-outlined text-lg">check</span>
            </div>
            <p className="text-sm font-medium">You're all caught up!</p>
            <p className="text-xs mt-0.5">Check back later for new updates</p>
        </div>
    );
}

// ============================================================
// MAIN PARENT HOME COMPONENT
// ============================================================
export function ParentHome({ tenantSlug, tenantName, tenantLogo }: ParentHomeProps) {
    return (
        <div className="space-y-6 pb-20">
            {/* My Children Carousel - Touch scroll, no scrollbar, with left padding */}
            <section>
                <SectionHeader title="My Children" tenantSlug={tenantSlug} />
                <div
                    className="flex gap-3 overflow-x-auto pb-1 -mr-4 pr-4 snap-x snap-mandatory"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {MOCK_CHILDREN.map((child) => (
                        <ChildCard key={child.id} child={child} tenantSlug={tenantSlug} />
                    ))}
                </div>
            </section>

            {/* Fees Balance Card */}
            <section>
                <FeesBalanceCard tenantSlug={tenantSlug} />
            </section>

            {/* Quick Actions */}
            <section>
                <QuickActionsGrid actions={PARENT_QUICK_ACTIONS} tenantSlug={tenantSlug} />
            </section>

            {/* Homework Due */}
            <section>
                <SectionHeader title="Homework Due" href="/homework" tenantSlug={tenantSlug} />
                <div className="space-y-2">
                    {MOCK_HOMEWORK.map((hw) => (
                        <HomeworkItem key={hw.id} hw={hw} />
                    ))}
                </div>
            </section>

            {/* Announcements */}
            <section>
                <SectionHeader title="Announcements" href="/announcements" tenantSlug={tenantSlug} />
                <div className="space-y-3">
                    {MOCK_ANNOUNCEMENTS.slice(0, 2).map((ann) => (
                        <AnnouncementCard key={ann.id} announcement={ann} />
                    ))}
                </div>
            </section>

            {/* School Life */}
            <section>
                <SectionHeader title="School Life" href="/feed" tenantSlug={tenantSlug} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {MOCK_SCHOOL_POSTS.map((post) => (
                        <SchoolLifeCard key={post.id} post={post} tenantName={tenantName} tenantLogo={tenantLogo} />
                    ))}
                </div>
            </section>

            {/* Scroll End Indicator */}
            <ScrollEndIndicator />
        </div>
    );
}
