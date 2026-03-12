'use client';

import { useState } from 'react';
import { X, Search, UserPlus, Plus } from 'lucide-react';

const ROLE_GROUPS: { label: string; roles: string[] }[] = [
  { label: 'Platform', roles: ['PLATFORM_SUPER_ADMIN', 'APP_SUPER_ADMIN', 'PLATFORM_SECRETARY', 'APP_SECRETARY', 'PLATFORM_SUPPORT', 'APP_SUPPORT'] },
  { label: 'Brand', roles: ['BRAND_ADMIN', 'BRAND_OPERATIONS_MANAGER', 'BRAND_FINANCE_SUPERVISOR', 'BRAND_AUDITOR'] },
  { label: 'Tenant Leadership', roles: ['TENANT_ADMIN', 'MAIN_BRANCH_ADMIN', 'BRANCH_ADMIN', 'SCHOOL_OPERATIONS_MANAGER', 'SCHOOL_ADMINISTRATOR'] },
  { label: 'School Leadership', roles: ['PRINCIPAL', 'DEPUTY_PRINCIPAL', 'SMT', 'HOD', 'GRADE_HEAD', 'PHASE_HEAD'] },
  { label: 'Academic', roles: ['TIMETABLE_OFFICER', 'EXAM_OFFICER', 'CURRICULUM_COORDINATOR'] },
  { label: 'Teaching', roles: ['TEACHER', 'CLASS_TEACHER', 'SUBJECT_TEACHER', 'EDUCATOR', 'TEACHER_ASSISTANT', 'LEARNING_SUPPORT_EDUCATOR', 'REMEDIAL_TEACHER', 'INTERN_TEACHER', 'COACH'] },
  { label: 'Operations', roles: ['ADMISSIONS_OFFICER', 'FINANCE_OFFICER', 'HR_ADMIN', 'RECEPTION', 'RECEPTIONIST', 'SECRETARY', 'IT_ADMIN', 'ATTENDANCE_OFFICER', 'PRINTING_ADMIN'] },
  { label: 'Branch', roles: ['BRANCH_OPERATIONS_ADMIN', 'BRANCH_FINANCE_CLERK', 'AFTERCARE_SUPERVISOR', 'HOSTEL_SUPERVISOR'] },
  { label: 'Support Staff', roles: ['STAFF', 'COUNSELLOR', 'NURSE', 'SCHOOL_NURSE', 'SOCIAL_WORKER', 'LIBRARIAN', 'LAB_TECHNICIAN', 'TRANSPORT', 'DRIVER', 'SECURITY', 'CARETAKER', 'GROUNDSKEEPER', 'MAINTENANCE', 'CLEANER', 'KITCHEN_STAFF'] },
  { label: 'Specialist', roles: ['CONTENT_MODERATOR', 'COMMUNICATIONS_MANAGER', 'DATA_STEWARD', 'DISCIPLINARY_OFFICER', 'PASTORAL_CARE_LEAD', 'EVENTS_COORDINATOR', 'ALUMNI_LIAISON', 'SCHOOL_AUDITOR'] },
  { label: 'Parent / Family', roles: ['PARENT', 'GUARDIAN', 'PARENT_GUARDIAN', 'PRIMARY_GUARDIAN', 'SECONDARY_GUARDIAN', 'AUTHORIZED_PICKUP'] },
  { label: 'Learner', roles: ['LEARNER', 'STUDENT', 'LEARNER_PREFECT'] },
  { label: 'Applicant', roles: ['APPLICANT', 'APPLICANT_GUARDIAN', 'APPLICANT_LEARNER_PROFILE'] },
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
  const [notFound, setNotFound] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newFirst, setNewFirst] = useState('');
  const [newLast, setNewLast] = useState('');
  const [newPassword, setNewPassword] = useState('');

  async function searchUser() {
    if (!email) return;
    setSearching(true);
    setError('');
    setNotFound(false);
    const token = localStorage.getItem('session_token');
    const res = await fetch(`/v1/admin/users/search?q=${encodeURIComponent(email)}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (res.ok) {
      const users = await res.json();
      const user = Array.isArray(users) ? users.find((u: any) => u.email?.toLowerCase() === email.toLowerCase().trim()) || users[0] : null;
      if (user) {
        setUserId(user.id);
        setUserName(user.display_name || user.email);
        setNotFound(false);
      } else {
        setNotFound(true);
        setUserId('');
        setUserName('');
      }
    } else {
      setError('Search failed');
    }
    setSearching(false);
  }

  async function handleCreateUser() {
    if (!email) return;
    setCreating(true);
    setError('');
    const token = localStorage.getItem('session_token');
    const res = await fetch('/v1/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({
        email: email.trim(),
        first_name: newFirst || undefined,
        last_name: newLast || undefined,
        password: newPassword || undefined,
        display_name: (newFirst && newLast) ? `${newFirst} ${newLast}` : undefined,
      }),
    });
    if (res.ok) {
      const user = await res.json();
      setUserId(user.id);
      setUserName(user.display_name || user.email);
      setNotFound(false);
    } else {
      const err = await res.json().catch(() => ({}));
      setError(err.message || 'Failed to create user');
    }
    setCreating(false);
  }

  async function handleAssign() {
    if (!userId || !role) { setError('Please find a user and select a role'); return; }
    setSaving(true);
    setError('');
    const token = localStorage.getItem('session_token');

    const isPlatformRole = ['PLATFORM_SUPER_ADMIN', 'APP_SUPER_ADMIN', 'PLATFORM_SECRETARY', 'APP_SECRETARY', 'PLATFORM_SUPPORT', 'APP_SUPPORT', 'BRAND_ADMIN', 'BRAND_OPERATIONS_MANAGER', 'BRAND_FINANCE_SUPERVISOR', 'BRAND_AUDITOR'].includes(role);

    let url: string;
    let payload: any;

    if (isPlatformRole) {
      url = `/v1/admin/users/${userId}/roles`;
      payload = { role };
    } else {
      url = `/v1/admin/tenants/${tenantId}/people/roles`;
      payload = { user_id: userId, role };
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(payload),
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
      <div className="relative bg-[hsl(var(--admin-bg))] rounded-2xl shadow-2xl w-full max-w-md border border-[hsl(var(--admin-border))] overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[hsl(var(--admin-border))]">
          <div className="flex items-center gap-2">
            <UserPlus size={18} className="text-[hsl(var(--admin-primary))]" />
            <h2 className="text-base font-bold text-[hsl(var(--admin-text-main))]">Assign Role</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="p-1.5 rounded-lg hover:bg-[hsl(var(--admin-surface-alt))] transition-colors"><X size={16} /></button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Find user */}
          <div>
            <label className="block text-[13px] font-semibold text-[hsl(var(--admin-text-sub))] mb-1.5">Find User by Email</label>
            <div className="flex gap-2">
              <input
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && searchUser()}
                placeholder="user@school.co.za"
                className="flex-1 h-10 px-3 rounded-xl bg-[hsl(var(--admin-surface-alt))] text-[14px] text-[hsl(var(--admin-text-main))] placeholder:text-[hsl(var(--admin-text-muted))] border border-[hsl(var(--admin-border))] outline-none focus:border-[hsl(var(--admin-primary))]"
              />
              <button type="button" onClick={searchUser} disabled={searching} aria-label="Search user" className="h-10 px-3 bg-[hsl(var(--admin-primary)/0.1)] text-[hsl(var(--admin-primary))] text-sm font-medium rounded-xl hover:bg-[hsl(var(--admin-primary)/0.2)] transition-colors">
                <Search size={16} />
              </button>
            </div>
            {userName && <p className="text-[13px] text-green-600 font-semibold mt-1.5">Found: {userName}</p>}
          </div>

          {/* Not found — create user */}
          {notFound && (
            <div className="ios-card p-4 space-y-3 border-dashed border-[hsl(var(--admin-primary)/0.3)]">
              <p className="text-[13px] font-semibold text-[hsl(var(--admin-text-sub))]">
                No user found. Create a new account?
              </p>
              <input value={newFirst} onChange={e => setNewFirst(e.target.value)} placeholder="First name"
                className="w-full h-9 px-3 rounded-lg bg-[hsl(var(--admin-surface-alt))] text-[14px] text-[hsl(var(--admin-text-main))] border border-[hsl(var(--admin-border))] outline-none focus:border-[hsl(var(--admin-primary))]" />
              <input value={newLast} onChange={e => setNewLast(e.target.value)} placeholder="Last name"
                className="w-full h-9 px-3 rounded-lg bg-[hsl(var(--admin-surface-alt))] text-[14px] text-[hsl(var(--admin-text-main))] border border-[hsl(var(--admin-border))] outline-none focus:border-[hsl(var(--admin-primary))]" />
              <input value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Password (optional — random if empty)" type="password"
                className="w-full h-9 px-3 rounded-lg bg-[hsl(var(--admin-surface-alt))] text-[14px] text-[hsl(var(--admin-text-main))] border border-[hsl(var(--admin-border))] outline-none focus:border-[hsl(var(--admin-primary))]" />
              <button type="button" onClick={handleCreateUser} disabled={creating}
                className="w-full h-9 bg-[hsl(var(--admin-primary))] text-white text-[13px] font-bold rounded-lg flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 transition-all">
                <Plus size={14} />
                {creating ? 'Creating...' : 'Create User Account'}
              </button>
            </div>
          )}

          {/* Role selector */}
          <div>
            <label className="block text-[13px] font-semibold text-[hsl(var(--admin-text-sub))] mb-1.5">Role</label>
            <select value={role} onChange={e => setRole(e.target.value)} aria-label="Role"
              className="w-full h-10 px-3 rounded-xl bg-[hsl(var(--admin-surface-alt))] text-[14px] text-[hsl(var(--admin-text-main))] border border-[hsl(var(--admin-border))] outline-none focus:border-[hsl(var(--admin-primary))]">
              <option value="">Select a role...</option>
              {ROLE_GROUPS.map(g => (
                <optgroup key={g.label} label={g.label}>
                  {g.roles.map(r => (
                    <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              <p className="text-[13px] text-red-600 font-medium">{error}</p>
            </div>
          )}
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-[hsl(var(--admin-border))]">
          <div className="flex-1" />
          <button type="button" onClick={onClose} className="h-10 px-4 rounded-xl border border-[hsl(var(--admin-border))] text-[14px] font-medium text-[hsl(var(--admin-text-sub))]">Cancel</button>
          <button type="button" onClick={handleAssign} disabled={saving || !userId || !role}
            className="h-10 px-5 bg-[hsl(var(--admin-primary))] text-white text-[14px] font-bold rounded-xl active:scale-95 disabled:opacity-50 transition-all">
            {saving ? 'Assigning...' : 'Assign Role'}
          </button>
        </div>
      </div>
    </div>
  );
}
