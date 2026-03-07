'use client';

import { useState } from 'react';
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
// ATTENDANCE OVERVIEW CARD — per-learner toggle
// ============================================================
function AttendanceCard({ children: childrenList, tenantSlug }: { children: Child[]; tenantSlug: string }) {
    const [mode, setMode] = useState<'all' | string>('all');

    const filtered = mode === 'all' ? childrenList : childrenList.filter(c => c.id === mode);
    const avgAttendance = filtered.length > 0
        ? Math.round(filtered.reduce((sum, c) => sum + (c.attendancePercentage || 0), 0) / filtered.length)
        : 0;

    const present = filtered.filter(c => c.status === 'present').length;
    const absent = filtered.filter(c => c.status === 'absent').length;
    const late = filtered.filter(c => c.status === 'late').length;

    return (
        <div className="ios-card">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-[hsl(var(--admin-text-main))]">Attendance</h3>
                <Link
                    href={`/tenant/${tenantSlug}/parent/children`}
                    className="text-xs font-semibold text-[hsl(var(--admin-primary))] hover:underline flex items-center gap-0.5"
                >
                    Details <ChevronRight size={12} />
                </Link>
            </div>

            {/* Learner Toggle */}
            <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                <button
                    type="button"
                    onClick={() => setMode('all')}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                        mode === 'all'
                            ? 'bg-[hsl(var(--admin-primary))] text-white'
                            : 'bg-[hsl(var(--admin-surface-alt))] text-[hsl(var(--admin-text-sub))]'
                    }`}
                >
                    All Children
                </button>
                {childrenList.map(child => (
                    <button
                        key={child.id}
                        type="button"
                        onClick={() => setMode(child.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                            mode === child.id
                                ? 'bg-[hsl(var(--admin-primary))] text-white'
                                : 'bg-[hsl(var(--admin-surface-alt))] text-[hsl(var(--admin-text-sub))]'
                        }`}
                    >
                        {child.name.split(' ')[0]}
                    </button>
                ))}
            </div>

            {/* Rate */}
            <div className="flex items-center justify-between p-3 bg-[hsl(var(--admin-surface-alt))] rounded-xl mb-3">
                <span className="text-xs font-medium text-[hsl(var(--admin-text-sub))]">Attendance Rate</span>
                <span className={`text-2xl font-bold ${
                    avgAttendance >= 90 ? 'text-green-600 dark:text-green-400' :
                    avgAttendance >= 75 ? 'text-amber-600 dark:text-amber-400' :
                    'text-red-600 dark:text-red-400'
                }`}>
                    {avgAttendance}%
                </span>
            </div>

            {/* Breakdown */}
            <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2.5 bg-green-50 dark:bg-green-900/20 rounded-xl">
                    <span className="material-symbols-outlined text-green-600 text-lg">check_circle</span>
                    <p className="text-lg font-bold text-green-600 mt-0.5">{present}</p>
                    <p className="text-[10px] text-[hsl(var(--admin-text-muted))] font-medium">Present</p>
                </div>
                <div className="text-center p-2.5 bg-red-50 dark:bg-red-900/20 rounded-xl">
                    <span className="material-symbols-outlined text-red-500 text-lg">cancel</span>
                    <p className="text-lg font-bold text-red-500 mt-0.5">{absent}</p>
                    <p className="text-[10px] text-[hsl(var(--admin-text-muted))] font-medium">Absent</p>
                </div>
                <div className="text-center p-2.5 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                    <span className="material-symbols-outlined text-amber-600 text-lg">schedule</span>
                    <p className="text-lg font-bold text-amber-600 mt-0.5">{late}</p>
                    <p className="text-[10px] text-[hsl(var(--admin-text-muted))] font-medium">Late</p>
                </div>
            </div>
        </div>
    );
}

// ============================================================
// MERIT / DEMERIT CARD
// ============================================================
const MOCK_MERITS = [
    { id: 'm1', child: 'Bart Simpson', type: 'merit', points: 5, reason: 'Excellent teamwork in Science project', date: '2026-03-05', teacher: 'Mrs. Smith' },
    { id: 'm2', child: 'Lisa Simpson', type: 'merit', points: 10, reason: 'First place in Spelling Bee', date: '2026-03-04', teacher: 'Mr. Johnson' },
    { id: 'd1', child: 'Bart Simpson', type: 'demerit', points: -2, reason: 'Late to class', date: '2026-03-03', teacher: 'Mrs. Smith' },
];

function MeritDemeritCard({ tenantSlug }: { tenantSlug: string }) {
    const merits = MOCK_MERITS.filter(m => m.type === 'merit');
    const demerits = MOCK_MERITS.filter(m => m.type === 'demerit');
    const totalMerits = merits.reduce((s, m) => s + m.points, 0);
    const totalDemerits = Math.abs(demerits.reduce((s, m) => s + m.points, 0));

    return (
        <div className="ios-card">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-[hsl(var(--admin-text-main))]">Merits &amp; Demerits</h3>
                <Link
                    href={`/tenant/${tenantSlug}/parent/children`}
                    className="text-xs font-semibold text-[hsl(var(--admin-primary))] hover:underline flex items-center gap-0.5"
                >
                    View All <ChevronRight size={12} />
                </Link>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 text-center">
                    <span className="material-symbols-outlined text-green-600 text-xl">emoji_events</span>
                    <p className="text-xl font-bold text-green-600 mt-1">{totalMerits}</p>
                    <p className="text-[10px] text-[hsl(var(--admin-text-muted))] font-medium">Merit Points</p>
                </div>
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-center">
                    <span className="material-symbols-outlined text-red-500 text-xl">warning</span>
                    <p className="text-xl font-bold text-red-500 mt-1">{totalDemerits}</p>
                    <p className="text-[10px] text-[hsl(var(--admin-text-muted))] font-medium">Demerit Points</p>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="space-y-2">
                {MOCK_MERITS.slice(0, 3).map(item => (
                    <div key={item.id} className="flex items-start gap-3 p-2.5 rounded-xl bg-[hsl(var(--admin-background))]">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            item.type === 'merit'
                                ? 'bg-green-100 dark:bg-green-900/30'
                                : 'bg-red-100 dark:bg-red-900/30'
                        }`}>
                            <span className={`material-symbols-outlined text-sm ${
                                item.type === 'merit' ? 'text-green-600' : 'text-red-500'
                            }`}>
                                {item.type === 'merit' ? 'add_circle' : 'remove_circle'}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-[hsl(var(--admin-text-main))] truncate">{item.reason}</p>
                            <p className="text-[10px] text-[hsl(var(--admin-text-muted))]">
                                {item.child} &bull; {item.teacher}
                            </p>
                        </div>
                        <span className={`text-xs font-bold shrink-0 ${
                            item.type === 'merit' ? 'text-green-600' : 'text-red-500'
                        }`}>
                            {item.points > 0 ? '+' : ''}{item.points}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ============================================================
// CHILD CARD — iOS-style
// ============================================================
function ChildCard({ child, tenantSlug }: { child: Child; tenantSlug: string }) {
    const isPresent = child.status === 'present';
    const isAbsent = child.status === 'absent';

    return (
        <div className="min-w-[240px] max-w-[280px] ios-card p-4 flex-shrink-0 snap-start">
            <div className="flex items-start gap-3">
                <div className="relative shrink-0">
                    <img
                        src={child.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(child.name)}&size=64&background=6366f1&color=fff`}
                        alt={child.name}
                        className="w-12 h-12 rounded-xl object-cover"
                    />
                    <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[hsl(var(--admin-surface))] ${
                        isPresent ? 'bg-green-500' : isAbsent ? 'bg-red-500' : 'bg-amber-500'
                    }`} />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-[hsl(var(--admin-text-main))] truncate">{child.name}</h3>
                    <p className="text-xs text-[hsl(var(--admin-text-sub))]">{child.grade} &bull; {child.class}</p>
                    <div className="mt-1.5 flex items-center gap-1.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                            isPresent ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : isAbsent ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        }`}>
                            {isPresent ? 'At School' : isAbsent ? 'Absent' : 'Late'}
                        </span>
                        {child.attendancePercentage != null && (
                            <span className={`text-[10px] font-bold ${
                                child.attendancePercentage >= 90 ? 'text-green-600 dark:text-green-400' :
                                child.attendancePercentage >= 75 ? 'text-amber-600 dark:text-amber-400' :
                                'text-red-600 dark:text-red-400'
                            }`}>
                                {child.attendancePercentage}%
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {child.lastSeen && (
                <p className="text-[10px] text-[hsl(var(--admin-text-muted))] mt-2.5 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">schedule</span>
                    {child.lastSeen.time} &bull; {child.lastSeen.location}
                </p>
            )}

            <div className="mt-3 flex gap-2">
                <Link
                    href={`/tenant/${tenantSlug}/parent/children/${child.id}`}
                    className="flex-1 text-center text-xs font-semibold py-2 rounded-lg bg-[hsl(var(--admin-surface-alt))] text-[hsl(var(--admin-text-main))] hover:bg-[hsl(var(--admin-border))] transition-colors"
                >
                    Profile
                </Link>
                <Link
                    href={`/tenant/${tenantSlug}/parent/report-absence`}
                    className="flex items-center justify-center w-9 h-9 rounded-lg bg-[hsl(var(--admin-surface-alt))] hover:bg-[hsl(var(--admin-border))] transition-colors"
                    title="Log Absence"
                >
                    <span className="material-symbols-outlined text-[hsl(var(--admin-text-sub))] text-base">event_busy</span>
                </Link>
            </div>

            {child.needsVerification && (
                <div className="mt-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-2 flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-red-700 dark:text-red-400">Please verify absence</span>
                    <button className="text-[10px] font-bold text-red-600 dark:text-red-400 hover:underline">Verify</button>
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
        <div className="ios-card p-0 overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-[hsl(var(--admin-primary))] to-[hsl(var(--admin-primary)/0.8)] text-white">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-[10px] font-semibold text-white/70 uppercase tracking-wider">School Fees Balance</p>
                        <p className="text-2xl font-bold mt-1 text-white">{formatCurrency(fees.totalDue, fees.currency)}</p>
                        <p className="text-xs text-white/60 mt-1">Due by {fees.dueDate}</p>
                    </div>
                    <Link
                        href={`/tenant/${tenantSlug}/parent/accounts`}
                        className="flex items-center gap-1 bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg text-xs font-semibold transition-colors"
                    >
                        View <ChevronRight size={12} />
                    </Link>
                </div>
            </div>
            {latestPayment && (
                <div className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <span className="material-symbols-outlined text-green-600 text-base">check_circle</span>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-[hsl(var(--admin-text-main))]">Last Payment</p>
                            <p className="text-[10px] text-[hsl(var(--admin-text-muted))]">{latestPayment.date} &bull; {latestPayment.method}</p>
                        </div>
                    </div>
                    <p className="text-xs font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(latestPayment.amount, latestPayment.currency)}
                    </p>
                </div>
            )}
        </div>
    );
}

// ============================================================
// QUICK ACTIONS — admin-style grid
// ============================================================
function QuickActionsGrid({ actions, tenantSlug }: { actions: QuickAction[]; tenantSlug: string }) {
    return (
        <div className="grid grid-cols-4 gap-2">
            {actions.map(action => (
                <Link
                    key={action.id}
                    href={`/tenant/${tenantSlug}/parent${action.href}`}
                    className={`flex flex-col items-center justify-center p-3 rounded-[16px] transition-all active:scale-[0.96] ${
                        action.primary
                            ? 'bg-[hsl(var(--admin-primary))] text-white ios-shadow'
                            : 'bg-[hsl(var(--admin-surface))] ios-shadow hover:bg-[hsl(var(--admin-surface-alt))]'
                    }`}
                >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1.5 ${
                        action.primary
                            ? 'bg-white/20'
                            : 'bg-[hsl(var(--admin-surface-alt))]'
                    }`}>
                        <span className={`material-symbols-outlined text-xl ${
                            action.primary ? 'text-white' : 'text-[hsl(var(--admin-primary))]'
                        }`}>{action.icon}</span>
                    </div>
                    <span className={`text-[10px] font-semibold text-center leading-tight ${
                        action.primary ? '' : 'text-[hsl(var(--admin-text-main))]'
                    }`}>{action.label}</span>
                </Link>
            ))}
        </div>
    );
}

// ============================================================
// HOMEWORK ITEM — compact ios-card style
// ============================================================
function HomeworkItem({ hw }: { hw: Homework }) {
    const badge = getDueBadgeStyle(hw.dueBadge);
    return (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[hsl(var(--admin-background))]">
            <div className="w-9 h-9 rounded-xl bg-[hsl(var(--admin-primary)/0.1)] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[hsl(var(--admin-primary))] text-lg">{hw.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-xs text-[hsl(var(--admin-text-main))] truncate">{hw.title}</h4>
                <p className="text-[10px] text-[hsl(var(--admin-text-muted))] truncate">{hw.childName} &bull; {hw.subject}</p>
            </div>
            <span className={`px-2 py-0.5 text-[9px] font-bold rounded-md shrink-0 ${badge.bg} ${badge.text}`}>
                {badge.label}
            </span>
        </div>
    );
}

// ============================================================
// ANNOUNCEMENT CARD — admin-style
// ============================================================
function AnnouncementCard({ announcement, tenantSlug }: { announcement: Announcement; tenantSlug: string }) {
    const isHigh = announcement.priority === 'high' || announcement.priority === 'urgent';
    return (
        <Link
            href={`/tenant/${tenantSlug}/parent/announcements/${announcement.id}`}
            className={`block p-3.5 rounded-xl transition-all active:scale-[0.98] ${
                isHigh
                    ? 'bg-[hsl(var(--admin-primary))] text-white'
                    : 'bg-[hsl(var(--admin-background))]'
            }`}
        >
            <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    isHigh ? 'bg-white/20' : 'bg-[hsl(var(--admin-primary)/0.1)]'
                }`}>
                    <span className={`material-symbols-outlined text-lg ${isHigh ? 'text-white' : 'text-[hsl(var(--admin-primary))]'}`}>
                        campaign
                    </span>
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-xs">{announcement.title}</h4>
                    <p className={`text-[10px] mt-0.5 line-clamp-2 ${isHigh ? 'text-white/70' : 'text-[hsl(var(--admin-text-muted))]'}`}>
                        {announcement.preview}
                    </p>
                    <p className={`text-[10px] mt-1.5 ${isHigh ? 'text-white/50' : 'text-[hsl(var(--admin-text-muted))]'}`}>
                        {announcement.postedAt}
                    </p>
                </div>
            </div>
            {announcement.requiresAcknowledge && !announcement.acknowledged && (
                <button type="button" className={`mt-2.5 w-full py-2 text-[10px] font-semibold rounded-lg ${
                    isHigh ? 'bg-white/20 text-white' : 'bg-[hsl(var(--admin-primary))] text-white'
                }`}>
                    Acknowledge
                </button>
            )}
        </Link>
    );
}

// ============================================================
// SCHOOL LIFE POST — professional, compact on desktop
// ============================================================
function SchoolLifeCard({ post, tenantName, tenantLogo }: { post: SchoolPost; tenantName?: string; tenantLogo?: string }) {
    const isSchoolPost = post.author.name.toLowerCase().includes('academy') || post.author.name.toLowerCase().includes('school');

    return (
        <div className="ios-card p-0 overflow-hidden">
            {/* Author */}
            <div className="flex items-center justify-between px-4 pt-3 pb-2">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-[hsl(var(--admin-surface-alt))] flex items-center justify-center overflow-hidden">
                        {isSchoolPost && tenantLogo ? (
                            <img src={tenantLogo} alt={tenantName} className="w-full h-full object-cover" />
                        ) : post.author.avatar ? (
                            <img src={post.author.avatar} alt={post.author.name} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-[hsl(var(--admin-primary))] font-bold text-xs">{post.author.name.substring(0, 2).toUpperCase()}</span>
                        )}
                    </div>
                    <div className="min-w-0">
                        <h4 className="font-semibold text-xs text-[hsl(var(--admin-text-main))] truncate">
                            {isSchoolPost && tenantName ? tenantName : post.author.name}
                        </h4>
                        <p className="text-[10px] text-[hsl(var(--admin-text-muted))]">{post.author.department} &bull; {post.postedAt}</p>
                    </div>
                </div>
                <button type="button" title="More options" className="p-1.5 hover:bg-[hsl(var(--admin-surface-alt))] rounded-full shrink-0">
                    <MoreHorizontal size={16} className="text-[hsl(var(--admin-text-muted))]" />
                </button>
            </div>

            {/* Image */}
            {post.image && (
                <img src={post.image} alt="" className="w-full aspect-[16/9] object-cover" />
            )}

            {/* Content + Engagement */}
            <div className="px-4 py-3">
                <p className="text-xs text-[hsl(var(--admin-text-main))] line-clamp-3 leading-relaxed">{post.content}</p>
                <div className="flex items-center gap-4 mt-3 pt-2.5 border-t border-[hsl(var(--admin-border)/0.5)]">
                    <button type="button" title="Like" className={`flex items-center gap-1 text-xs font-medium ${post.liked ? 'text-red-500' : 'text-[hsl(var(--admin-text-muted))]'}`}>
                        <Heart size={15} fill={post.liked ? 'currentColor' : 'none'} />
                        {post.likes}
                    </button>
                    <button type="button" title="Comment" className="flex items-center gap-1 text-xs font-medium text-[hsl(var(--admin-text-muted))]">
                        <MessageCircle size={15} />
                        {post.comments}
                    </button>
                    <button type="button" title="Share" className="ml-auto text-[hsl(var(--admin-text-muted))]">
                        <Share2 size={15} />
                    </button>
                </div>
            </div>
        </div>
    );
}

// ============================================================
// SECTION HEADER — admin-style
// ============================================================
function SectionHeader({ title, href, tenantSlug }: { title: string; href?: string; tenantSlug: string }) {
    return (
        <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-[hsl(var(--admin-text-main))]">{title}</h2>
            {href && (
                <Link
                    href={`/tenant/${tenantSlug}/parent${href}`}
                    className="text-xs text-[hsl(var(--admin-primary))] font-semibold hover:underline flex items-center gap-0.5"
                >
                    View All <ChevronRight size={12} />
                </Link>
            )}
        </div>
    );
}

// ============================================================
// MAIN PARENT HOME COMPONENT
// ============================================================
export function ParentHome({ tenantSlug, tenantName, tenantLogo }: ParentHomeProps) {
    return (
        <div className="max-w-3xl mx-auto space-y-4 pb-20">
            {/* My Children Carousel */}
            <section>
                <SectionHeader title="My Children" tenantSlug={tenantSlug} />
                <div
                    className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4 snap-x snap-mandatory"
                    style={{ scrollbarWidth: 'none' }}
                >
                    {MOCK_CHILDREN.map(child => (
                        <ChildCard key={child.id} child={child} tenantSlug={tenantSlug} />
                    ))}
                </div>
            </section>

            {/* Quick Actions */}
            <section>
                <QuickActionsGrid actions={PARENT_QUICK_ACTIONS} tenantSlug={tenantSlug} />
            </section>

            {/* Attendance + Fees — 2-col on desktop */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <AttendanceCard tenantSlug={tenantSlug}>{MOCK_CHILDREN}</AttendanceCard>
                <FeesBalanceCard tenantSlug={tenantSlug} />
            </section>

            {/* Merit & Demerit */}
            <section>
                <MeritDemeritCard tenantSlug={tenantSlug} />
            </section>

            {/* Homework Due */}
            <section>
                <SectionHeader title="Homework Due" href="/homework" tenantSlug={tenantSlug} />
                <div className="ios-card space-y-1.5">
                    {MOCK_HOMEWORK.map(hw => (
                        <HomeworkItem key={hw.id} hw={hw} />
                    ))}
                </div>
            </section>

            {/* Announcements */}
            <section>
                <SectionHeader title="Announcements" href="/announcements" tenantSlug={tenantSlug} />
                <div className="ios-card space-y-2">
                    {MOCK_ANNOUNCEMENTS.slice(0, 2).map(ann => (
                        <AnnouncementCard key={ann.id} announcement={ann} tenantSlug={tenantSlug} />
                    ))}
                </div>
            </section>

            {/* School Life — max-2-col grid on desktop */}
            <section>
                <SectionHeader title="School Life" href="/feed" tenantSlug={tenantSlug} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {MOCK_SCHOOL_POSTS.map(post => (
                        <SchoolLifeCard key={post.id} post={post} tenantName={tenantName} tenantLogo={tenantLogo} />
                    ))}
                </div>
            </section>

            {/* End */}
            <div className="flex flex-col items-center py-6 text-[hsl(var(--admin-text-muted))]">
                <div className="w-7 h-7 rounded-full bg-[hsl(var(--admin-surface-alt))] flex items-center justify-center mb-1.5">
                    <span className="material-symbols-outlined text-base">check</span>
                </div>
                <p className="text-xs font-medium">You&apos;re all caught up!</p>
            </div>
        </div>
    );
}
