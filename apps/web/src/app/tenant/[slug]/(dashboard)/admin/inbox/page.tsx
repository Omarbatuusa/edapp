'use client';

import InboxPanel from '@/components/admin/secretary/InboxPanel';

export default function InboxPage() {
  return (
    <div className="p-4 md:p-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Inbox / Tasks</h1>
        <p className="text-sm text-muted-foreground">Review pending tasks and items awaiting your attention.</p>
      </div>
      <InboxPanel />
    </div>
  );
}
