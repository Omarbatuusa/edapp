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
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email or role..." className="w-full pl-9 pr-4 h-10 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <button onClick={() => setShowAssign(true)} className="h-10 px-4 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
          <Plus size={16} /> Assign Role
        </button>
      </div>

      <div className="surface-card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">Loading...</div>
        ) : grouped.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">No people found</div>
        ) : (
          <div className="divide-y divide-border">
            <div className="grid grid-cols-[2fr_2fr_1fr_auto] gap-4 px-4 py-3 bg-muted/30 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <span>Name</span><span>Email</span><span>Roles</span><span></span>
            </div>
            {grouped.map(({ user, roles }) => (
              <div key={user?.id || roles[0].user_id} className="grid grid-cols-[2fr_2fr_1fr_auto] gap-4 px-4 py-3 items-center">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                    {user?.display_name?.[0] || '?'}
                  </div>
                  <span className="text-sm font-medium truncate">{user?.display_name || 'Unknown'}</span>
                </div>
                <span className="text-sm text-muted-foreground truncate">{user?.email || '—'}</span>
                <div className="flex flex-wrap gap-1">
                  {roles.map(r => (
                    <span key={r.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                      {r.role.toLowerCase().replace(/_/g, ' ')}
                      <button onClick={() => revokeRole(r.id)} className="hover:text-red-500 transition-colors"><Trash2 size={10} /></button>
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
