'use client';

import { use, useState, useEffect } from 'react';
import AdmissionsBuilder from '@/components/admin/admissions/AdmissionsBuilder';

interface Props { params: Promise<{ slug: string }> }

export default function AdmissionsPage({ params }: Props) {
  const { slug } = use(params);
  const [tenantId, setTenantId] = useState<string | null>(null);

  useEffect(() => {
    const id = localStorage.getItem('tenant_id') || localStorage.getItem(`edapp_tenant_id_${slug}`);
    setTenantId(id);
  }, [slug]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admissions Process Builder</h1>
        <p className="text-muted-foreground">Design the step-by-step admissions process applicants will follow.</p>
      </div>
      {tenantId ? <AdmissionsBuilder tenantId={tenantId} /> : (
        <div className="surface-card p-8 text-center text-muted-foreground text-sm">
          Unable to load. Please ensure you are logged in with a valid tenant account.
        </div>
      )}
    </div>
  );
}
