'use client';

import { CheckCircle } from 'lucide-react';

export default function ApprovalsPage() {
  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[hsl(var(--admin-text-main))]">Approvals</h1>
        <p className="text-[15px] font-medium text-[hsl(var(--admin-text-sub))] mt-1">Process pending approvals from tenants and administrators.</p>
      </div>
      <div className="ios-card p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
        <CheckCircle size={56} className="text-[hsl(var(--admin-primary))] mb-5" />
        <p className="text-[20px] font-bold text-[hsl(var(--admin-text-main))] tracking-tight">All caught up!</p>
        <p className="text-[15px] text-[hsl(var(--admin-text-sub))] font-medium mt-1">No pending approvals at this time.</p>
      </div>
    </div>
  );
}
