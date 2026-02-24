'use client';

import { use } from 'react';
import TenantsList from '@/components/admin/tenants/TenantsList';

interface Props { params: Promise<{ slug: string }> }

export default function TenantsPage({ params }: Props) {
  const { slug } = use(params);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tenants</h1>
        <p className="text-muted-foreground">View and manage all school tenants on the platform.</p>
      </div>
      <TenantsList slug={slug} />
    </div>
  );
}
