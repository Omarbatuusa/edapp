'use client';

import { use } from 'react';
import TenantsList from '@/components/admin/tenants/TenantsList';

interface Props { params: Promise<{ slug: string }> }

export default function TenantsPage({ params }: Props) {
  const { slug } = use(params);
  return (
    <div className="p-4 md:p-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Tenants</h1>
        <p className="text-sm text-muted-foreground">View and manage all school tenants on the platform.</p>
      </div>
      <TenantsList slug={slug} />
    </div>
  );
}
