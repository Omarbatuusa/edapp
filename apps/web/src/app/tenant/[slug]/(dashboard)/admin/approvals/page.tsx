'use client';

import { CheckCircle } from 'lucide-react';

export default function ApprovalsPage() {
  return (
    <div className="p-4 md:p-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Approvals</h1>
        <p className="text-sm text-muted-foreground">Process pending approvals from tenants and administrators.</p>
      </div>
      <div className="surface-card p-12 text-center">
        <CheckCircle size={48} className="mx-auto text-green-400 mb-4" />
        <p className="text-lg font-semibold text-foreground">All caught up!</p>
        <p className="text-muted-foreground text-sm mt-1">No pending approvals at this time.</p>
      </div>
    </div>
  );
}
