'use client';

import { use, useState, useEffect } from 'react';
import IntegrationsPanel from '@/components/admin/integrations/IntegrationsPanel';

interface Props { params: Promise<{ slug: string }> }

export default function IntegrationsPage({ params }: Props) {
  const { slug } = use(params);
  const [tenantId, setTenantId] = useState<string | null>(null);

  useEffect(() => {
    const id = localStorage.getItem('tenant_id') || localStorage.getItem(`edapp_tenant_id_${slug}`);
    setTenantId(id);
  }, [slug]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Integrations & Features</h1>
        <p className="text-muted-foreground">Enable or disable feature modules and external system integrations.</p>
      </div>
      {tenantId ? <IntegrationsPanel tenantId={tenantId} /> : (
        <div className="surface-card p-8 text-center text-muted-foreground text-sm">
          <p>Unable to load tenant features. Please ensure you are logged in with a valid tenant account.</p>
        </div>
      )}
    </div>
  );
}
