'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Save } from 'lucide-react';

interface Feature {
  id: string;
  feature_key: string;
  is_enabled: boolean;
  config: Record<string, any> | null;
}

interface FeaturesResponse {
  features: Feature[];
  conflict: boolean;
  conflicting_features: string[];
}

interface Props { tenantId: string }

export default function IntegrationsPanel({ tenantId }: Props) {
  const [data, setData] = useState<FeaturesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  async function fetchFeatures() {
    const token = localStorage.getItem('session_token');
    const res = await fetch(`/v1/admin/tenants/${tenantId}/features`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (res.ok) setData(await res.json());
    setLoading(false);
  }

  useEffect(() => { fetchFeatures(); }, [tenantId]);

  function getFeature(key: string): Feature | undefined {
    return data?.features.find(f => f.feature_key === key);
  }

  async function toggleFeature(featureKey: string, value: boolean, config?: Record<string, any>) {
    setSaving(featureKey);
    const token = localStorage.getItem('session_token');
    const body: any = { is_enabled: value };
    if (config !== undefined) body.config = config;
    const res = await fetch(`/v1/admin/tenants/${tenantId}/features/${featureKey}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const updated = await res.json();
      setData(d => d ? { ...d, features: updated.features || d.features, conflict: updated.conflict, conflicting_features: updated.conflicting_features } : null);
      fetchFeatures();
    }
    setSaving(null);
  }

  async function setFinanceMode(mode: string) {
    setSaving('FINANCE_MODE');
    const token = localStorage.getItem('session_token');
    const res = await fetch(`/v1/admin/tenants/${tenantId}/features/FINANCE_MODE`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ is_enabled: mode !== 'disabled', config: { mode } }),
    });
    if (res.ok) fetchFeatures();
    setSaving(null);
  }

  if (loading) return <div className="p-8 text-center text-muted-foreground text-sm">Loading features...</div>;

  const financeMode = getFeature('FINANCE_MODE')?.config?.mode || 'disabled';

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Conflict Banner */}
      {data?.conflict && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-orange-50 border border-orange-200">
          <AlertTriangle size={18} className="text-orange-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-orange-800">Finance mode conflict detected</p>
            <p className="text-xs text-orange-700 mt-0.5">You have an integrated finance system enabled but Finance Mode is set to Manual. Update Finance Mode to Integrated or disable the finance integration.</p>
          </div>
        </div>
      )}

      {/* Finance Section */}
      <div className="surface-card p-5 space-y-4">
        <h3 className="font-semibold text-base border-b border-border pb-3">Finance</h3>

        <div className="space-y-1">
          <p className="text-sm font-medium">Finance Mode</p>
          <p className="text-xs text-muted-foreground mb-2">How financial transactions are processed</p>
          <div className="inline-flex rounded-xl border border-border overflow-hidden">
            {['disabled', 'manual', 'integrated'].map(mode => (
              <button
                key={mode}
                onClick={() => setFinanceMode(mode)}
                disabled={saving === 'FINANCE_MODE'}
                className={`px-4 py-2 text-sm font-medium transition-colors capitalize ${financeMode === mode ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted text-foreground'}`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        <ToggleRow
          label="Sage One Integration"
          description="Connect to Sage One for automated billing"
          featureKey="SAGE_ONE"
          feature={getFeature('SAGE_ONE')}
          onToggle={toggleFeature}
          saving={saving}
          conflict={data?.conflicting_features.includes('SAGE_ONE')}
        />
        <ToggleRow
          label="Sage Pastel Integration"
          description="Connect to Sage Pastel for financial management"
          featureKey="SAGE_PASTEL"
          feature={getFeature('SAGE_PASTEL')}
          onToggle={toggleFeature}
          saving={saving}
          conflict={data?.conflicting_features.includes('SAGE_PASTEL')}
        />
      </div>

      {/* Modules Section */}
      <div className="surface-card p-5 space-y-4">
        <h3 className="font-semibold text-base border-b border-border pb-3">Modules</h3>
        <ToggleRow label="Online Admissions" description="Allow online admissions applications" featureKey="ADMISSIONS_ONLINE" feature={getFeature('ADMISSIONS_ONLINE')} onToggle={toggleFeature} saving={saving} />
        <ToggleRow label="Transport Module" description="Manage school transport routes and tracking" featureKey="TRANSPORT_MODULE" feature={getFeature('TRANSPORT_MODULE')} onToggle={toggleFeature} saving={saving} />
        <ToggleRow label="Timetable Module" description="Enable timetable management" featureKey="TIMETABLE_MODULE" feature={getFeature('TIMETABLE_MODULE')} onToggle={toggleFeature} saving={saving} />
        <ToggleRow label="SMS Notifications" description="Send SMS alerts to parents and staff" featureKey="SMS_ENABLED" feature={getFeature('SMS_ENABLED')} onToggle={toggleFeature} saving={saving} />
      </div>
    </div>
  );
}

function ToggleRow({ label, description, featureKey, feature, onToggle, saving, conflict }: {
  label: string; description: string; featureKey: string;
  feature?: Feature; onToggle: (key: string, val: boolean) => void;
  saving: string | null; conflict?: boolean;
}) {
  const isOn = feature?.is_enabled ?? false;
  return (
    <div className={`flex items-center justify-between py-2 ${conflict ? 'text-orange-700' : ''}`}>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${conflict ? 'text-orange-700' : ''}`}>{label} {conflict && <span className="text-xs ml-1">⚠️</span>}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <button
        onClick={() => onToggle(featureKey, !isOn)}
        disabled={saving === featureKey}
        className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${isOn ? 'bg-primary' : 'bg-gray-200'} ${saving === featureKey ? 'opacity-50' : ''}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${isOn ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  );
}
