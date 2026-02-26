'use client';

import { use, useState, useEffect } from 'react';
import SchoolDataManager from '@/components/admin/school-data/SchoolDataManager';

interface Props { params: Promise<{ slug: string }> }

export default function SchoolDataPage({ params }: Props) {
  const { slug } = use(params);
  const [tenantId, setTenantId] = useState<string | null>(null);

  useEffect(() => {
    const id = localStorage.getItem('tenant_id') || localStorage.getItem(`edapp_tenant_id_${slug}`);
    setTenantId(id);
  }, [slug]);

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[hsl(var(--admin-text-main))]">School Data</h1>
        <p className="text-[15px] font-medium text-[hsl(var(--admin-text-sub))] mt-1">Configure phases, grade levels, and subject offerings for your school.</p>
      </div>
      {tenantId ? <SchoolDataManager tenantId={tenantId} /> : (
        <div className="ios-card p-8 text-center text-[hsl(var(--admin-text-muted))] text-[15px] font-medium">
          Unable to load. Please ensure you are logged in with a valid tenant account.
        </div>
      )}
    </div>
  );
}
