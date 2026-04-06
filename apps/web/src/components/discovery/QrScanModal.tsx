'use client';

import { useEffect, useRef, useState } from 'react';

interface QrScanModalProps {
    open: boolean;
    onClose: () => void;
}

export function QrScanModal({ open, onClose }: QrScanModalProps) {
    const scannerRef = useRef<any>(null);
    const [error, setError] = useState('');
    const [scanning, setScanning] = useState(false);

    useEffect(() => {
        if (!open) return;

        let html5QrCode: any = null;

        const startScanner = async () => {
            try {
                const { Html5Qrcode } = await import('html5-qrcode');
                html5QrCode = new Html5Qrcode('qr-reader');
                scannerRef.current = html5QrCode;
                setScanning(true);
                setError('');

                await html5QrCode.start(
                    { facingMode: 'environment' },
                    { fps: 10, qrbox: { width: 250, height: 250 } },
                    (decodedText: string) => {
                        // Stop scanner
                        html5QrCode.stop().catch(() => {});
                        setScanning(false);

                        // Handle the scanned URL
                        if (decodedText.includes('app.edapp.co.za/scan/')) {
                            window.location.href = decodedText;
                        } else if (/^[A-Z]{3}[0-9\-]+$/i.test(decodedText.trim())) {
                            // Raw school code
                            window.location.href = `/scan/${decodedText.trim()}`;
                        } else {
                            setError('Invalid QR code. Please scan an EdApp school QR code.');
                        }
                    },
                    () => { /* ignore scan failures */ },
                );
            } catch (err: any) {
                setError(err?.message?.includes('Permission')
                    ? 'Camera permission denied. Please allow camera access.'
                    : 'Unable to start camera. Please try again.');
                setScanning(false);
            }
        };

        startScanner();

        return () => {
            if (scannerRef.current) {
                scannerRef.current.stop().catch(() => {});
                scannerRef.current = null;
            }
        };
    }, [open]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white">Scan QR Code</h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 transition-colors"
                    >
                        <span className="material-symbols-outlined text-[18px] text-slate-500">close</span>
                    </button>
                </div>

                {/* Scanner */}
                <div className="p-4">
                    <div id="qr-reader" className="w-full rounded-xl overflow-hidden bg-black min-h-[280px]" />

                    {!scanning && !error && (
                        <div className="flex items-center justify-center min-h-[280px] -mt-[280px] relative z-10">
                            <div className="text-center">
                                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3" />
                                <p className="text-sm text-slate-500">Starting camera...</p>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="mt-3 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800">
                            <p className="text-sm text-red-600 dark:text-red-400 font-medium text-center">{error}</p>
                        </div>
                    )}

                    <p className="text-xs text-center text-slate-400 mt-3">
                        Point your camera at a school QR code to find your school
                    </p>
                </div>
            </div>
        </div>
    );
}
