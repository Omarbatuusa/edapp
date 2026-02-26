'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, MoreVertical, Trash2 } from 'lucide-react';
import RoleAssignModal from './RoleAssignModal';

interface RoleAssignment {
  id: string;
  user_id: string;
  role: string;
  branch_id?: string;
  user?: {
    id: string;
    display_name: string;
    email: string;
    first_name?: string;
    last_name?: string;
  };
}

interface Props { tenantId: string }

export default function PeopleList({ tenantId }: Props) {
  const [assignments, setAssignments] = useState<RoleAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAssign, setShowAssign] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  async function fetchPeople() {
    const token = localStorage.getItem('session_token');
    const res = await fetch(`/v1/admin/tenants/${tenantId}/people`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (res.ok) setAssignments(await res.json());
    setLoading(false);
  }

  useEffect(() => { fetchPeople(); }, [tenantId]);

  async function revokeRole(roleId: string) {
    if (!confirm('Revoke this role assignment?')) return;
    const token = localStorage.getItem('session_token');
    await fetch(`/v1/admin/tenants/${tenantId}/people/roles/${roleId}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    fetchPeople();
  }

  const filtered = assignments.filter(a => {
    const q = search.toLowerCase();
    return !q || a.role.toLowerCase().includes(q) || a.user?.display_name?.toLowerCase().includes(q) || a.user?.email?.toLowerCase().includes(q);
  });

  // Group by user
  const userMap = new Map<string, { user: RoleAssignment['user']; roles: RoleAssignment[] }>();
  for (const a of filtered) {
    const existing = userMap.get(a.user_id);
    if (existing) {
      existing.roles.push(a);
    } else {
      userMap.set(a.user_id, { user: a.user, roles: [a] });
    }
  }
  const grouped = Array.from(userMap.values());

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--admin-text-muted))]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email or role..." className="w-full pl-9 pr-4 h-10 rounded-[12px] border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface))] text-[15px] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--admin-primary))/0.2]" />
        </div>
        <button onClick={() => setShowAssign(true)} className="h-10 px-4 bg-[hsl(var(--admin-primary))] text-white text-[15px] font-semibold rounded-[12px] hover:bg-[hsl(var(--admin-primary))/0.9] active:scale-[0.96] transition-all flex items-center gap-2 shadow-sm">
          <Plus size={18} /> Assign Role
        </button>
      </div>

      <div className="ios-card overflow-hidden p-0">
        {loading ? (
          <div className="p-8 text-center text-[hsl(var(--admin-text-muted))] text-[15px] font-medium">Loading...</div>
        ) : grouped.length === 0 ? (
          <div className="p-8 text-center text-[hsl(var(--admin-text-muted))] text-[15px] font-medium">No people found</div>
        ) : (
          <div className="divide-y divide-[hsl(var(--admin-border))]">
            <div className="grid grid-cols-[2fr_2fr_1fr_auto] gap-4 px-5 py-3 bg-[hsl(var(--admin-surface-alt))] text-[12px] font-semibold text-[hsl(var(--admin-text-sub))] uppercase tracking-wider">
              <span>Name</span><span>Email</span><span>Roles</span><span></span>
            </div>
            {grouped.map(({ user, roles }) => (
              <div key={user?.id || roles[0].user_id} className="grid grid-cols-[2fr_2fr_1fr_auto] gap-4 px-5 py-3.5 items-center hover:bg-[hsl(var(--admin-surface-alt))/0.5] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[hsl(var(--admin-primary)/0.1)] flex items-center justify-center text-[13px] font-bold text-[hsl(var(--admin-primary))] flex-shrink-0">
                    {user?.display_name?.[0] || '?'}
                  </div>
                  <span className="text-[15px] font-semibold text-[hsl(var(--admin-text-main))] truncate tracking-tight">{user?.display_name || 'Unknown'}</span>
                </div>
                <span className="text-[14px] text-[hsl(var(--admin-text-sub))] truncate">{user?.email || '—'}</span>
                <div className="flex flex-wrap gap-1.5">
                  {roles.map(r => (
                    <span key={r.id} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[hsl(var(--admin-primary)/0.1)] text-[hsl(var(--admin-primary))] text-[12px] font-semibold tracking-tight">
                      {r.role.toLowerCase().replace(/_/g, ' ')}
                      <button onClick={() => revokeRole(r.id)} className="hover:text-[hsl(var(--admin-danger))] transition-colors ml-0.5"><Trash2 size={12} /></button>
                    </span>
                  ))}
                </div>
                <div className="w-6" />
              </div>
            ))}
          </div>
        )}
      </div>

      {showAssign && (
        <RoleAssignModal
          tenantId={tenantId}
          onClose={() => setShowAssign(false)}
          onSave={() => { setShowAssign(false); fetchPeople(); }}
        />
      )}
    </div>
  );
}
