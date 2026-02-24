'use client';

import { use } from 'react';
import ControlDashboard from '@/components/admin/control/ControlDashboard';

interface Props { params: Promise<{ slug: string }> }

export default function ControlPage({ params }: Props) {
  const { slug } = use(params);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Control Dashboard</h1>
        <p className="text-muted-foreground">Overview of your school configuration and quick links.</p>
      </div>
      <ControlDashboard slug={slug} />
    </div>
  );
}
