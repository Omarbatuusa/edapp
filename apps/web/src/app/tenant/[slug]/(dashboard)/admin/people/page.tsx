'use client';

import { use, useState, useEffect } from 'react';
import PeopleList from '@/components/admin/people/PeopleList';

interface Props { params: Promise<{ slug: string }> }

export default function PeoplePage({ params }: Props) {
  const { slug } = use(params);
  const [tenantId, setTenantId] = useState<string | null>(null);

  useEffect(() => {
    const id = localStorage.getItem('tenant_id') || localStorage.getItem(`edapp_tenant_id_${slug}`);
    setTenantId(id);
  }, [slug]);

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold tracking-tight">People & Roles</h1>
        <p className="text-sm text-muted-foreground">Manage users and assign roles within your school.</p>
      </div>
      {tenantId ? <PeopleList tenantId={tenantId} /> : (
        <div className="surface-card p-8 text-center text-muted-foreground text-sm">
          Unable to load. Please ensure you are logged in with a valid tenant account.
        </div>
      )}
    </div>
  );
}
