'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Building2, Users, GitBranch, Award } from 'lucide-react';

interface Branch {
  id: string;
  branch_name: string;
  branch_code: string;
  curriculum_framework?: string;
  formatted_address?: string;
  physical_address?: string;
  branch_email?: string;
}

interface Props { slug: string; tenantId?: string }

export default function ControlDashboard({ slug, tenantId }: Props) {
  const [mainBranch, setMainBranch] = useState<Branch | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const token = localStorage.getItem('session_token');
      const res = await fetch('/v1/admin/branches?is_main_branch=true', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        const branches = Array.isArray(data) ? data : (data.branches || []);
        setMainBranch(branches.find((b: Branch) => b) || null);
      }
      setLoading(false);
    }
    load();
  }, []);

  const cards = [
    {
      title: 'School Profile',
      icon: Building2,
      color: 'text-blue-600 bg-blue-50',
      content: mainBranch ? (
        <div className="space-y-1 text-sm">
          <p className="font-medium">{mainBranch.branch_name}</p>
          <p className="text-muted-foreground text-xs">{mainBranch.branch_code}</p>
          <p className="text-muted-foreground text-xs">{mainBranch.curriculum_framework || 'Curriculum not set'}</p>
          <p className="text-muted-foreground text-xs truncate">{mainBranch.formatted_address || mainBranch.physical_address || 'Address not set'}</p>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{loading ? 'Loading...' : 'No main branch configured'}</p>
      ),
      link: `/tenant/${slug}/admin/main-branch`,
      linkLabel: 'Edit Profile',
    },
    {
      title: 'Subscription',
      icon: Award,
      color: 'text-amber-600 bg-amber-50',
      content: (
        <div className="space-y-1">
          <p className="text-sm font-medium text-green-600">Active — Pro Plan</p>
          <p className="text-xs text-muted-foreground">Renews annually</p>
        </div>
      ),
      link: null,
      linkLabel: null,
    },
    {
      title: 'People & Roles',
      icon: Users,
      color: 'text-teal-600 bg-teal-50',
      content: (
        <p className="text-sm text-muted-foreground">Manage users and assign roles to staff, teachers, and administrators.</p>
      ),
      link: `/tenant/${slug}/admin/people`,
      linkLabel: 'Manage People',
    },
    {
      title: 'Branches',
      icon: GitBranch,
      color: 'text-green-600 bg-green-50',
      content: (
        <p className="text-sm text-muted-foreground">View all campuses and branches associated with this school.</p>
      ),
      link: `/tenant/${slug}/admin/branches`,
      linkLabel: 'View Branches',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cards.map(card => (
          <div key={card.title} className="surface-card p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center flex-shrink-0`}>
                <card.icon size={20} />
              </div>
              <h3 className="font-semibold text-sm">{card.title}</h3>
            </div>
            <div>{card.content}</div>
            {card.link && (
              <Link href={card.link} className="inline-flex items-center gap-1.5 text-xs text-primary font-medium hover:underline">
                {card.linkLabel} <ArrowRight size={12} />
              </Link>
            )}
          </div>
        ))}
      </div>

      <div className="surface-card p-5">
        <h3 className="font-semibold mb-4">Quick Links</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: 'Integrations', href: `/tenant/${slug}/admin/integrations`, icon: 'integration_instructions' },
            { label: 'School Data', href: `/tenant/${slug}/admin/school-data`, icon: 'school' },
            { label: 'Admissions', href: `/tenant/${slug}/admin/admissions`, icon: 'assignment' },
          ].map(item => (
            <Link key={item.href} href={item.href} className="flex items-center gap-2 p-3 rounded-xl border border-border hover:bg-muted/30 transition-colors text-sm font-medium">
              <span className="material-symbols-outlined text-[20px] text-muted-foreground">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
