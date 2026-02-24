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
      <div className="surface-card p-5">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Bell size={16} className="text-orange-500" /> Pending Tasks
        </h3>
        <div className="space-y-3">
          {tasks.map(task => (
            <div key={task.id} className="flex items-start gap-3 p-3 rounded-xl border border-border hover:bg-muted/20 transition-colors cursor-pointer">
              <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${task.urgent ? 'bg-red-500' : 'bg-blue-400'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{task.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{task.time}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${task.type === 'approval' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'}`}>
                {task.type}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="surface-card p-5">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <FileText size={16} className="text-blue-500" /> Approvals Queue
        </h3>
        <p className="text-sm text-muted-foreground">No pending approvals at this time.</p>
      </div>

      <div className="surface-card p-5">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Clock size={16} className="text-gray-400" /> Recent Activity
        </h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>• Approved branch profile for Jeppe College (yesterday)</p>
          <p>• Created new tenant LAK-001 (2 days ago)</p>
          <p>• Updated dictionary entries (3 days ago)</p>
        </div>
      </div>
    </div>
  );
}
