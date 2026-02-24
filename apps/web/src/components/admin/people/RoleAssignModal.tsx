'use client';

import { useState } from 'react';
import { X, Search, UserPlus } from 'lucide-react';

const ROLES = [
  'TENANT_ADMIN', 'MAIN_BRANCH_ADMIN', 'BRANCH_ADMIN',
  'PRINCIPAL', 'DEPUTY_PRINCIPAL', 'HOD', 'GRADE_HEAD', 'PHASE_HEAD', 'SMT',
  'CLASS_TEACHER', 'SUBJECT_TEACHER', 'TEACHER',
  'ADMISSIONS_OFFICER', 'FINANCE_OFFICER', 'HR_ADMIN', 'RECEPTION', 'IT_ADMIN',
  'COUNSELLOR', 'NURSE', 'TRANSPORT', 'AFTERCARE', 'SECURITY', 'CARETAKER', 'STAFF',
  'PARENT', 'LEARNER', 'APPLICANT',
];

interface Props { tenantId: string; onClose: () => void; onSave: () => void }

export default function RoleAssignModal({ tenantId, onClose, onSave }: Props) {
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [userName, setUserName] = useState('');
  const [role, setRole] = useState('');
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function searchUser() {
    if (!email) return;
    setSearching(true);
    setError('');
    const token = localStorage.getItem('session_token');
    const res = await fetch(`/v1/users/search?q=${encodeURIComponent(email)}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (res.ok) {
      const users = await res.json();
      const user = Array.isArray(users) ? users[0] : null;
      if (user) {
        setUserId(user.id);
        setUserName(user.display_name || user.email);
        setError('');
      } else {
        setError('No user found with that email');
        setUserId('');
        setUserName('');
      }
    } else {
      setError('Search failed');
    }
    setSearching(false);
  }

  async function handleAssign() {
    if (!userId || !role) { setError('Please find a user and select a role'); return; }
    setSaving(true);
    setError('');
    const token = localStorage.getItem('session_token');
    const res = await fetch(`/v1/admin/tenants/${tenantId}/people/roles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ user_id: userId, role }),
    });
    if (res.ok) {
      onSave();
    } else {
      const err = await res.json().catch(() => ({}));
      setError(err.message || 'Failed to assign role');
    }
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-background rounded-2xl shadow-2xl w-full max-w-md border border-border overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <UserPlus size={18} className="text-primary" />
            <h2 className="text-base font-semibold">Assign Role</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors"><X size={16} /></button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Find User by Email</label>
            <div className="flex gap-2">
              <input
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && searchUser()}
                placeholder="user@school.co.za"
                className="input-field flex-1"
              />
              <button onClick={searchUser} disabled={searching} className="h-10 px-3 bg-primary/10 text-primary text-sm font-medium rounded-lg hover:bg-primary/20 transition-colors">
                <Search size={16} />
              </button>
            </div>
            {userName && <p className="text-xs text-green-600 mt-1">Found: {userName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Role</label>
            <select value={role} onChange={e => setRole(e.target.value)} className="input-field w-full">
              <option value="">Select a role...</option>
              {ROLES.map(r => (
                <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-border">
          <div className="flex-1" />
          <button onClick={onClose} className="h-10 px-4 rounded-lg border border-border text-sm">Cancel</button>
          <button onClick={handleAssign} disabled={saving || !userId || !role} className="h-10 px-4 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors">
            {saving ? 'Assigning...' : 'Assign Role'}
          </button>
        </div>
      </div>
    </div>
  );
}
