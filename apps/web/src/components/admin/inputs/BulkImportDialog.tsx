'use client';

import { useState, useRef } from 'react';
import { X, Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import TemplateDownloadButton from './TemplateDownloadButton';

interface Props {
  importType: string;
  tenantId: string;
  templateType?: string;
  onComplete: () => void;
  onClose: () => void;
}

type Step = 'upload' | 'validating' | 'preview' | 'importing' | 'done';

interface RowError {
  row_index: number;
  field: string;
  error: string;
  severity: 'error' | 'warning';
}

export default function BulkImportDialog({ importType, tenantId, templateType, onComplete, onClose }: Props) {
  const [step, setStep] = useState<Step>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [auditId, setAuditId] = useState('');
  const [errors, setErrors] = useState<RowError[]>([]);
  const [validRows, setValidRows] = useState(0);
  const [totalRows, setTotalRows] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('session_token') : null;
  const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

  async function handleUpload() {
    if (!file) return;
    setErrorMsg('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`/v1/admin/tenants/${tenantId}/import/upload?type=${importType}`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setErrorMsg(err.message || 'Upload failed');
        return;
      }

      const data = await res.json();
      setAuditId(data.auditId);

      // Auto-validate
      setStep('validating');
      const valRes = await fetch(`/v1/admin/tenants/${tenantId}/import/${data.auditId}/validate`, {
        method: 'POST',
        headers,
      });

      if (!valRes.ok) {
        const err = await valRes.json().catch(() => ({}));
        setErrorMsg(err.message || 'Validation failed');
        setStep('upload');
        return;
      }

      const valData = await valRes.json();
      setTotalRows(valData.totalRows);
      setValidRows(valData.validRows);
      setErrors(valData.errors || []);
      setStep('preview');
    } catch (err: any) {
      setErrorMsg(err.message || 'Upload failed');
    }
  }

  async function handleExecute() {
    setStep('importing');
    setErrorMsg('');

    try {
      const res = await fetch(`/v1/admin/tenants/${tenantId}/import/${auditId}/execute`, {
        method: 'POST',
        headers,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setErrorMsg(err.message || 'Import failed');
        setStep('preview');
        return;
      }

      const data = await res.json();
      setSuccessCount(data.successCount);
      setErrors(data.errors || []);
      setStep('done');
    } catch (err: any) {
      setErrorMsg(err.message || 'Import failed');
      setStep('preview');
    }
  }

  const blockingErrors = errors.filter(e => e.severity === 'error');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-[hsl(var(--admin-bg))] rounded-2xl shadow-2xl w-full max-w-lg border border-[hsl(var(--admin-border))] overflow-hidden max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[hsl(var(--admin-border))]">
          <div className="flex items-center gap-2">
            <FileSpreadsheet size={18} className="text-[hsl(var(--admin-primary))]" />
            <h2 className="text-base font-bold text-[hsl(var(--admin-text-main))]">Bulk Import — {importType}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="p-1.5 rounded-lg hover:bg-[hsl(var(--admin-surface-alt))] transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Step 1: Upload */}
          {step === 'upload' && (
            <>
              <div className="flex items-center gap-3 mb-3">
                <TemplateDownloadButton templateType={templateType || importType} label="Download Template" />
                <span className="text-[12px] text-[hsl(var(--admin-text-muted))]">Fill in the template, then upload below</span>
              </div>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[hsl(var(--admin-border))] rounded-2xl p-8 text-center cursor-pointer hover:border-[hsl(var(--admin-primary))] transition-colors"
              >
                <Upload size={32} className="mx-auto text-[hsl(var(--admin-text-muted))] mb-3" />
                <p className="text-[14px] font-medium text-[hsl(var(--admin-text-main))]">
                  {file ? file.name : 'Click to select .xlsx file'}
                </p>
                {file && <p className="text-[12px] text-[hsl(var(--admin-text-muted))] mt-1">{(file.size / 1024).toFixed(1)} KB</p>}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx"
                  className="hidden"
                  onChange={e => {
                    const f = e.target.files?.[0];
                    if (f) setFile(f);
                  }}
                />
              </div>
            </>
          )}

          {/* Step 2: Validating */}
          {step === 'validating' && (
            <div className="flex flex-col items-center py-8">
              <Loader2 size={32} className="animate-spin text-[hsl(var(--admin-primary))] mb-3" />
              <p className="text-[14px] font-semibold text-[hsl(var(--admin-text-main))]">Validating rows...</p>
            </div>
          )}

          {/* Step 3: Preview */}
          {step === 'preview' && (
            <>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[hsl(var(--admin-surface-alt))] rounded-xl p-3 text-center">
                  <p className="text-[20px] font-extrabold text-[hsl(var(--admin-text-main))]">{totalRows}</p>
                  <p className="text-[11px] font-medium text-[hsl(var(--admin-text-sub))]">Total Rows</p>
                </div>
                <div className="bg-green-50 rounded-xl p-3 text-center">
                  <p className="text-[20px] font-extrabold text-green-700">{validRows}</p>
                  <p className="text-[11px] font-medium text-green-600">Valid</p>
                </div>
                <div className="bg-red-50 rounded-xl p-3 text-center">
                  <p className="text-[20px] font-extrabold text-red-700">{blockingErrors.length}</p>
                  <p className="text-[11px] font-medium text-red-600">Errors</p>
                </div>
              </div>

              {errors.length > 0 && (
                <div className="max-h-48 overflow-y-auto space-y-1.5">
                  {errors.slice(0, 50).map((e, i) => (
                    <div key={i} className={`flex items-start gap-2 px-3 py-1.5 rounded-lg text-[12px] ${e.severity === 'error' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>
                      {e.severity === 'error' ? <AlertTriangle size={12} className="mt-0.5 shrink-0" /> : <AlertTriangle size={12} className="mt-0.5 shrink-0" />}
                      <span>Row {e.row_index}: <strong>{e.field}</strong> — {e.error}</span>
                    </div>
                  ))}
                  {errors.length > 50 && (
                    <p className="text-[11px] text-[hsl(var(--admin-text-muted))] text-center">...and {errors.length - 50} more</p>
                  )}
                </div>
              )}
            </>
          )}

          {/* Step 4: Importing */}
          {step === 'importing' && (
            <div className="flex flex-col items-center py-8">
              <Loader2 size={32} className="animate-spin text-[hsl(var(--admin-primary))] mb-3" />
              <p className="text-[14px] font-semibold text-[hsl(var(--admin-text-main))]">Importing {validRows} rows...</p>
            </div>
          )}

          {/* Step 5: Done */}
          {step === 'done' && (
            <div className="text-center py-6">
              <CheckCircle2 size={48} className="mx-auto text-green-500 mb-3" />
              <p className="text-[16px] font-bold text-[hsl(var(--admin-text-main))]">Import Complete</p>
              <p className="text-[14px] text-[hsl(var(--admin-text-sub))] mt-1">{successCount} rows imported successfully</p>
              {errors.length > 0 && (
                <p className="text-[13px] text-amber-600 mt-1">{errors.length} rows had issues</p>
              )}
            </div>
          )}

          {errorMsg && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              <p className="text-[13px] text-red-600 font-medium">{errorMsg}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-[hsl(var(--admin-border))]">
          <div className="flex-1" />
          {step === 'upload' && (
            <>
              <button type="button" onClick={onClose} className="h-10 px-4 rounded-xl border border-[hsl(var(--admin-border))] text-[14px] font-medium text-[hsl(var(--admin-text-sub))]">Cancel</button>
              <button type="button" onClick={handleUpload} disabled={!file}
                className="h-10 px-5 bg-[hsl(var(--admin-primary))] text-white text-[14px] font-bold rounded-xl active:scale-95 disabled:opacity-50 transition-all">
                Upload & Validate
              </button>
            </>
          )}
          {step === 'preview' && (
            <>
              <button type="button" onClick={() => { setStep('upload'); setFile(null); setErrors([]); }}
                className="h-10 px-4 rounded-xl border border-[hsl(var(--admin-border))] text-[14px] font-medium text-[hsl(var(--admin-text-sub))]">
                Re-upload
              </button>
              <button type="button" onClick={handleExecute} disabled={validRows === 0}
                className="h-10 px-5 bg-[hsl(var(--admin-primary))] text-white text-[14px] font-bold rounded-xl active:scale-95 disabled:opacity-50 transition-all">
                Import {validRows} Rows
              </button>
            </>
          )}
          {step === 'done' && (
            <button type="button" onClick={() => { onComplete(); onClose(); }}
              className="h-10 px-5 bg-[hsl(var(--admin-primary))] text-white text-[14px] font-bold rounded-xl active:scale-95 transition-all">
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
