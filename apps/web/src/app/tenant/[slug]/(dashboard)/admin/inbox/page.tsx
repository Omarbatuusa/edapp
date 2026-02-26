'use client';

import InboxPanel from '@/components/admin/secretary/InboxPanel';

export default function InboxPage() {
  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[hsl(var(--admin-text-main))]">Inbox / Tasks</h1>
        <p className="text-[15px] font-medium text-[hsl(var(--admin-text-sub))] mt-1">Review pending tasks and items awaiting your attention.</p>
      </div>
      <InboxPanel />
    </div>
  );
}
