'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface SafeguardingInboxProps {
  tenantSlug: string;
  tenantId: string;
  basePath: string;
}

interface Incident {
  id: string;
  title: string;
  caseNumber: string;
  category: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: string;
  learners: string[];
  reporterType: string;
  createdAt: string;
}

type TabKey = 'urgent' | 'new' | 'assigned' | 'closed' | 'escalated';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const TABS: { key: TabKey; label: string }[] = [
  { key: 'urgent', label: 'Urgent' },
  { key: 'new', label: 'New' },
  { key: 'assigned', label: 'Assigned' },
  { key: 'closed', label: 'Closed' },
  { key: 'escalated', label: 'Escalated' },
];

const TAB_QUERY: Record<TabKey, string> = {
  urgent: 'severity=HIGH&severity=CRITICAL',
  new: 'status=SUBMITTED',
  assigned: 'status=ASSIGNED&status=INVESTIGATING',
  closed: 'status=CLOSED&status=RESOLVED',
  escalated: 'status=ESCALATED',
};

const SEVERITY_COLOR: Record<string, string> = {
  LOW: '#3b82f6',
  MEDIUM: '#f59e0b',
  HIGH: '#f97316',
  CRITICAL: '#ef4444',
};

const CATEGORY_ICON: Record<string, string> = {
  Bullying: '\u26a0\ufe0f',
  Abuse: '\ud83d\udea8',
  Neglect: '\ud83d\udeab',
  'Self-Harm': '\ud83d\udc94',
  Harassment: '\ud83d\uded1',
  Violence: '\u2622\ufe0f',
  Other: '\ud83d\udccc',
};

const EMPTY_SUBTITLES: Record<TabKey, string> = {
  urgent: 'No urgent cases requiring immediate attention.',
  new: 'No new reports awaiting triage.',
  assigned: 'No cases currently under investigation.',
  closed: 'No resolved or closed cases.',
  escalated: 'No escalated cases at this time.',
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

function statusBadgeStyle(status: string): React.CSSProperties {
  const map: Record<string, { bg: string; fg: string }> = {
    SUBMITTED: { bg: '#dbeafe', fg: '#1d4ed8' },
    ASSIGNED: { bg: '#fef3c7', fg: '#92400e' },
    INVESTIGATING: { bg: '#fef3c7', fg: '#92400e' },
    ESCALATED: { bg: '#fee2e2', fg: '#991b1b' },
    CLOSED: { bg: '#e5e7eb', fg: '#374151' },
    RESOLVED: { bg: '#d1fae5', fg: '#065f46' },
  };
  const s = map[status] || { bg: '#f3f4f6', fg: '#6b7280' };
  return {
    display: 'inline-block',
    fontSize: 11,
    fontWeight: 600,
    lineHeight: 1,
    padding: '3px 8px',
    borderRadius: 999,
    backgroundColor: s.bg,
    color: s.fg,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.03em',
    whiteSpace: 'nowrap' as const,
  };
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function SafeguardingInbox({
  tenantSlug,
  tenantId,
  basePath,
}: SafeguardingInboxProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>('urgent');
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchIncidents = useCallback(async (tab: TabKey) => {
    setLoading(true);
    try {
      const qs = TAB_QUERY[tab];
      const res = await fetch(
        `/v1/admin/tenants/${tenantId}/incidents?${qs}&take=50`,
      );
      if (!res.ok) throw new Error('fetch failed');
      const data = await res.json();
      setIncidents(Array.isArray(data) ? data : data.data ?? []);
    } catch {
      setIncidents([]);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchIncidents(activeTab);
  }, [activeTab, fetchIncidents]);

  /* ---- Skeleton card ---- */
  const SkeletonCard = () => (
    <div
      style={{
        background: 'hsl(var(--admin-surface))',
        borderRadius: 14,
        padding: '16px 16px 14px 19px',
        borderLeft: '3px solid hsl(var(--admin-border))',
        marginBottom: 10,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ width: '55%', height: 16, borderRadius: 6, background: 'hsl(var(--admin-surface-alt))' }} />
        <div style={{ width: 48, height: 14, borderRadius: 6, background: 'hsl(var(--admin-surface-alt))' }} />
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <div style={{ width: 100, height: 13, borderRadius: 5, background: 'hsl(var(--admin-surface-alt))' }} />
        <div style={{ width: 70, height: 13, borderRadius: 5, background: 'hsl(var(--admin-surface-alt))' }} />
      </div>
      <div style={{ width: '70%', height: 13, borderRadius: 5, background: 'hsl(var(--admin-surface-alt))' }} />
    </div>
  );

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      {/* ---- Header ---- */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 20,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: 'hsl(var(--admin-text-main))',
              margin: 0,
              letterSpacing: '-0.02em',
            }}
          >
            Safeguarding
          </h1>
          <p
            style={{
              fontSize: 14,
              color: 'hsl(var(--admin-text-muted))',
              margin: '4px 0 0',
            }}
          >
            Incident &amp; safety case management
          </p>
        </div>

        <button
          onClick={() => router.push(`${basePath}/safety/new`)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '9px 18px',
            fontSize: 14,
            fontWeight: 600,
            color: '#fff',
            backgroundColor: 'hsl(var(--admin-primary))',
            border: 'none',
            borderRadius: 10,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> New Report
        </button>
      </div>

      {/* ---- Tab bar ---- */}
      <div
        style={{
          display: 'flex',
          gap: 0,
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          borderBottom: '1px solid hsl(var(--admin-border))',
          marginBottom: 16,
          scrollbarWidth: 'none',
        }}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                flex: '0 0 auto',
                padding: '10px 18px',
                fontSize: 14,
                fontWeight: isActive ? 700 : 500,
                color: isActive
                  ? 'hsl(var(--admin-primary))'
                  : 'hsl(var(--admin-text-muted))',
                background: 'transparent',
                border: 'none',
                borderBottom: isActive
                  ? '2.5px solid hsl(var(--admin-primary))'
                  : '2.5px solid transparent',
                cursor: 'pointer',
                transition: 'color 0.15s, border-color 0.15s',
                whiteSpace: 'nowrap',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ---- Loading skeleton ---- */}
      {loading && (
        <div>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {/* ---- Empty state ---- */}
      {!loading && incidents.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '56px 24px',
            color: 'hsl(var(--admin-text-muted))',
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.5 }}>
            {activeTab === 'urgent' ? '\ud83d\udea8' : '\ud83d\udcc2'}
          </div>
          <p
            style={{
              fontSize: 16,
              fontWeight: 600,
              margin: '0 0 4px',
              color: 'hsl(var(--admin-text-main))',
            }}
          >
            No cases found
          </p>
          <p style={{ fontSize: 13, margin: 0 }}>
            {EMPTY_SUBTITLES[activeTab]}
          </p>
        </div>
      )}

      {/* ---- Case cards ---- */}
      {!loading &&
        incidents.map((inc) => {
          const sevColor = SEVERITY_COLOR[inc.severity] || '#94a3b8';
          const catIcon =
            CATEGORY_ICON[inc.category] || CATEGORY_ICON.Other;

          return (
            <div
              key={inc.id}
              onClick={() => router.push(`${basePath}/safety/${inc.id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  router.push(`${basePath}/safety/${inc.id}`);
                }
              }}
              style={{
                background: 'hsl(var(--admin-surface))',
                borderRadius: 14,
                padding: '14px 16px 12px 19px',
                borderLeft: `3px solid ${sevColor}`,
                marginBottom: 10,
                cursor: 'pointer',
                transition: 'box-shadow 0.15s, transform 0.12s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow =
                  '0 4px 12px rgba(0,0,0,0.08)';
                (e.currentTarget as HTMLDivElement).style.transform =
                  'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow =
                  '0 1px 3px rgba(0,0,0,0.04)';
                (e.currentTarget as HTMLDivElement).style.transform =
                  'translateY(0)';
              }}
            >
              {/* Row 1: title + time */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 6,
                  gap: 8,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    minWidth: 0,
                  }}
                >
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      backgroundColor: `${sevColor}18`,
                      fontSize: 14,
                      flexShrink: 0,
                    }}
                  >
                    {catIcon}
                  </span>
                  <span
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: 'hsl(var(--admin-text-main))',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {inc.title}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: 12,
                    color: 'hsl(var(--admin-text-muted))',
                    flexShrink: 0,
                  }}
                >
                  {timeAgo(inc.createdAt)}
                </span>
              </div>

              {/* Row 2: case ID + category + badge */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 6,
                  flexWrap: 'wrap',
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    color: 'hsl(var(--admin-text-muted))',
                    fontFamily: 'monospace',
                  }}
                >
                  {inc.caseNumber}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    color: 'hsl(var(--admin-text-muted))',
                  }}
                >
                  &bull;
                </span>
                <span
                  style={{
                    fontSize: 13,
                    color: 'hsl(var(--admin-text-main))',
                    fontWeight: 500,
                  }}
                >
                  {inc.category}
                </span>
                <span style={statusBadgeStyle(inc.status)}>
                  {inc.status.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Row 3: learners + reporter */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span
                  style={{
                    fontSize: 13,
                    color: 'hsl(var(--admin-text-muted))',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Learner{inc.learners?.length !== 1 ? 's' : ''}:{' '}
                  {inc.learners?.join(', ') || 'N/A'}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    color: 'hsl(var(--admin-text-muted))',
                    flexShrink: 0,
                  }}
                >
                  Reporter: {inc.reporterType || 'Unknown'}
                </span>
              </div>
            </div>
          );
        })}
    </div>
  );
}
