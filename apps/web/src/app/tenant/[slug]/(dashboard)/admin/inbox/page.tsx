'use client';

import InboxPanel from '@/components/admin/secretary/InboxPanel';

export default function InboxPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Inbox / Tasks</h1>
        <p className="text-muted-foreground">Review pending tasks and items awaiting your attention.</p>
      </div>
      <InboxPanel />
    </div>
  );
}
