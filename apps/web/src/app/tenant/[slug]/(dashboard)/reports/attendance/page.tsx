'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { FileText, Download, Eye, Printer, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '../../../../../../lib/api-client';

type ReportType = 'learner-daily' | 'learner-weekly' | 'branch-summary' | 'staff-weekly';
type ExportFormat = 'pdf' | 'csv' | 'xlsx';

export default function AttendanceReportsPage() {
    const params = useParams();
    const slug = params.slug as string;
    const [branchId, setBranchId] = useState('');
    const [reportType, setReportType] = useState<ReportType>('learner-daily');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [weekStart, setWeekStart] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - d.getDay() + 1); // Monday
        return d.toISOString().split('T')[0];
    });
    const [classId, setClassId] = useState('');
    const [classes, setClasses] = useState<any[]>([]);
    const [generating, setGenerating] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        apiClient.get('/auth/me').then(res => {
            if (res.data?.branch_id) setBranchId(res.data.branch_id);
        }).catch(() => {});
    }, []);

    useEffect(() => {
        if (!branchId) return;
        apiClient.get(`/classes?branch_id=${branchId}`).then(res => {
            if (res.data?.status === 'success') {
                setClasses(res.data.classes || []);
            }
        }).catch(() => {});
    }, [branchId]);

    const buildUrl = (format: ExportFormat) => {
        const base = `/attendance/reports/${reportType}`;
        const params = new URLSearchParams();
        params.set('branch_id', branchId);
        if (format !== 'pdf') params.set('format', format);

        if (reportType === 'learner-daily') {
            params.set('date', date);
            if (classId) params.set('class_id', classId);
        } else {
            params.set('week_start', weekStart);
            if (classId && reportType === 'learner-weekly') params.set('class_id', classId);
        }

        return `${base}?${params.toString()}`;
    };

    const handleGenerate = async (format: ExportFormat) => {
        if (!branchId) return;
        setGenerating(true);
        setError(null);

        try {
            const url = buildUrl(format);
            const res = await apiClient.get(url, { responseType: 'blob' });

            const blob = new Blob([res.data], { type: res.headers['content-type'] });
            const blobUrl = URL.createObjectURL(blob);

            if (format === 'pdf') {
                setPreviewUrl(blobUrl);
            } else {
                // Download
                const a = document.createElement('a');
                a.href = blobUrl;
                const ext = format === 'csv' ? 'csv' : 'xlsx';
                a.download = `${reportType}-${date || weekStart}.${ext}`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(blobUrl);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to generate report');
        } finally {
            setGenerating(false);
        }
    };

    const handlePrint = () => {
        if (previewUrl) {
            const w = window.open(previewUrl, '_blank');
            w?.addEventListener('load', () => w.print());
        }
    };

    const reportTypes: { key: ReportType; label: string; description: string }[] = [
        { key: 'learner-daily', label: 'Learner Daily', description: 'Daily class register with check-in/out times' },
        { key: 'learner-weekly', label: 'Learner Weekly', description: 'Weekly attendance summary per learner' },
        { key: 'branch-summary', label: 'Branch Summary', description: 'Weekly overview with attendance rates' },
        { key: 'staff-weekly', label: 'Staff Weekly', description: 'Staff time report with hours and overtime' },
    ];

    const isDaily = reportType === 'learner-daily';

    return (
        <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Link href={`/tenant/${slug}/admin/attendance`} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-[hsl(var(--admin-text-main))]">
                        Attendance Reports
                    </h1>
                    <p className="text-sm text-[hsl(var(--admin-text-sub))]">
                        Generate and export attendance reports
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Config Panel */}
                <div className="lg:col-span-1 space-y-4">
                    {/* Report Type */}
                    <div className="ios-card">
                        <h3 className="font-semibold text-sm mb-3">Report Type</h3>
                        <div className="space-y-2">
                            {reportTypes.map(rt => (
                                <button
                                    key={rt.key}
                                    type="button"
                                    onClick={() => { setReportType(rt.key); setPreviewUrl(null); }}
                                    className={`w-full text-left p-3 rounded-xl border transition-colors ${
                                        reportType === rt.key
                                            ? 'bg-blue-50 border-blue-300'
                                            : 'bg-white border-gray-200 hover:bg-gray-50'
                                    }`}
                                >
                                    <p className="font-bold text-sm">{rt.label}</p>
                                    <p className="text-xs text-gray-500">{rt.description}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Date Selection */}
                    <div className="ios-card">
                        <h3 className="font-semibold text-sm mb-3">
                            {isDaily ? 'Date' : 'Week Starting'}
                        </h3>
                        <input
                            type="date"
                            value={isDaily ? date : weekStart}
                            onChange={e => isDaily ? setDate(e.target.value) : setWeekStart(e.target.value)}
                            className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            title={isDaily ? 'Select date' : 'Select week start date'}
                        />

                        {(reportType === 'learner-daily' || reportType === 'learner-weekly') && classes.length > 0 && (
                            <div className="mt-3">
                                <label className="block text-xs font-medium mb-1">Class (optional)</label>
                                <select
                                    value={classId}
                                    onChange={e => setClassId(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    title="Select class"
                                >
                                    <option value="">All Classes</option>
                                    {classes.map((c: any) => (
                                        <option key={c.id} value={c.id}>
                                            {c.section_name || c.class_code}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Generate Buttons */}
                    <div className="ios-card space-y-2">
                        <button
                            type="button"
                            onClick={() => handleGenerate('pdf')}
                            disabled={generating || !branchId}
                            className="w-full py-3 bg-[hsl(var(--admin-primary))] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
                        >
                            <Eye size={16} />
                            {generating ? 'Generating...' : 'Preview PDF'}
                        </button>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => handleGenerate('csv')}
                                disabled={generating || !branchId}
                                className="py-2.5 bg-green-100 text-green-700 rounded-xl text-sm font-bold flex items-center justify-center gap-1 hover:bg-green-200 disabled:opacity-50 transition-colors"
                            >
                                <Download size={14} /> CSV
                            </button>
                            <button
                                type="button"
                                onClick={() => handleGenerate('xlsx')}
                                disabled={generating || !branchId}
                                className="py-2.5 bg-blue-100 text-blue-700 rounded-xl text-sm font-bold flex items-center justify-center gap-1 hover:bg-blue-200 disabled:opacity-50 transition-colors"
                            >
                                <Download size={14} /> XLSX
                            </button>
                        </div>
                    </div>

                    {error && <p className="text-sm text-red-500">{error}</p>}
                </div>

                {/* Preview Panel */}
                <div className="lg:col-span-2">
                    <div className="ios-card h-full min-h-[600px]">
                        {previewUrl ? (
                            <div className="h-full flex flex-col">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-semibold text-sm">PDF Preview</h3>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={handlePrint}
                                            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-200 flex items-center gap-1 transition-colors"
                                        >
                                            <Printer size={12} /> Print
                                        </button>
                                        <a
                                            href={previewUrl}
                                            download={`${reportType}-${date || weekStart}.pdf`}
                                            className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-200 flex items-center gap-1 transition-colors"
                                        >
                                            <Download size={12} /> Download
                                        </a>
                                    </div>
                                </div>
                                <iframe
                                    src={previewUrl}
                                    className="flex-1 w-full rounded-xl border"
                                    title="Report Preview"
                                />
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                    <FileText size={32} className="text-gray-400" />
                                </div>
                                <h3 className="font-bold text-gray-500">No Report Generated</h3>
                                <p className="text-sm text-gray-400 mt-1">Select options and click Preview PDF</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
