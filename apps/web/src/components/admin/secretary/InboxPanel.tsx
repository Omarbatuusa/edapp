'use client';

import { CheckCircle, Clock, FileText, Bell } from 'lucide-react';

export default function InboxPanel() {
  const tasks = [
    { id: 1, type: 'approval', title: 'New tenant application — Greenfield Academy', time: '2h ago', urgent: true },
    { id: 2, type: 'review', title: 'Branch profile update — Allied Sandton', time: '4h ago', urgent: false },
    { id: 3, type: 'approval', title: 'Bulk user import — Jeppe College', time: '1d ago', urgent: false },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="ios-card p-0 overflow-hidden">
        <h3 className="font-semibold px-5 py-4 pb-2 flex items-center gap-2 text-[16px] tracking-tight text-[hsl(var(--admin-text-main))] border-b border-[hsl(var(--admin-border))]">
          <Bell size={18} className="text-orange-500" /> Pending Tasks
        </h3>
        <div className="divide-y divide-[hsl(var(--admin-border))]">
          {tasks.map(task => (
            <div key={task.id} className="flex items-start gap-4 p-4 hover:bg-[hsl(var(--admin-surface-alt))] transition-colors cursor-pointer active:bg-[hsl(var(--admin-surface-alt))/0.8]">
              <div className={`w-2.5 h-2.5 mt-1.5 rounded-full flex-shrink-0 ${task.urgent ? 'bg-[hsl(var(--admin-danger))]' : 'bg-blue-400'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-semibold text-[hsl(var(--admin-text-main))] tracking-tight">{task.title}</p>
                <p className="text-[13px] font-medium text-[hsl(var(--admin-text-sub))] mt-0.5">{task.time}</p>
              </div>
              <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${task.type === 'approval' ? 'bg-amber-100/50 text-amber-700' : 'bg-[hsl(var(--admin-primary)/0.1)] text-[hsl(var(--admin-primary))]'}`}>
                {task.type}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="ios-card p-5">
        <h3 className="font-semibold mb-2 flex items-center gap-2 text-[16px] tracking-tight text-[hsl(var(--admin-text-main))]">
          <FileText size={18} className="text-blue-500" /> Approvals Queue
        </h3>
        <p className="text-[14px] text-[hsl(var(--admin-text-sub))] font-medium">No pending approvals at this time.</p>
      </div>

      <div className="ios-card p-5">
        <h3 className="font-semibold mb-3 flex items-center gap-2 text-[16px] tracking-tight text-[hsl(var(--admin-text-main))]">
          <Clock size={18} className="text-[hsl(var(--admin-text-sub))]" /> Recent Activity
        </h3>
        <div className="space-y-3 text-[14px] font-medium text-[hsl(var(--admin-text-sub))]">
          <p className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--admin-border))]"></span> Approved branch profile for Jeppe College (yesterday)</p>
          <p className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--admin-border))]"></span> Created new tenant LAK-001 (2 days ago)</p>
          <p className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--admin-border))]"></span> Updated dictionary entries (3 days ago)</p>
        </div>
      </div>
    </div>
  );
}
