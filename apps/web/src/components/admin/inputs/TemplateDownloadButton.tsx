'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';

interface Props {
  templateType: string;
  label?: string;
  className?: string;
}

export default function TemplateDownloadButton({ templateType, label, className }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    setLoading(true);
    try {
      const token = localStorage.getItem('session_token');
      const res = await fetch(`/v1/admin/templates/${templateType}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) throw new Error('Download failed');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `edapp-${templateType}-template.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Template download error:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={loading}
      className={className || "h-9 px-3 flex items-center gap-1.5 rounded-xl bg-[hsl(var(--admin-primary)/0.08)] text-[hsl(var(--admin-primary))] text-[13px] font-semibold hover:bg-[hsl(var(--admin-primary)/0.15)] transition-colors disabled:opacity-50"}
    >
      <Download size={14} />
      {loading ? 'Downloading...' : label || 'Download Template'}
    </button>
  );
}
