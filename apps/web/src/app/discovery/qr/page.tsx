'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, X, Flashlight } from 'lucide-react';

export default function QRScanPage() {
    const router = useRouter();
    const [torchOn, setTorchOn] = useState(false);

    const handleManualEntry = () => {
        router.push('/discovery');
    };

    return (
        <div className="app-page bg-black">
            <div className="app-container">
                <div className="flex flex-col items-center justify-center min-h-screen py-8">
                    {/* Header */}
                    <div className="w-full max-w-md mb-4 flex justify-between items-center">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.back()}
                            className="text-white hover:bg-white/10"
                        >
                            <X className="h-6 w-6" />
                        </Button>
                        <h1 className="text-white font-semibold">Scan QR Code</h1>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setTorchOn(!torchOn)}
                            className="text-white hover:bg-white/10"
                        >
                            <Flashlight className={`h-6 w-6 ${torchOn ? 'fill-white' : ''}`} />
                        </Button>
                    </div>

                    {/* Camera Placeholder */}
                    <Card className="w-full max-w-md bg-gray-900 border-gray-700">
                        <CardContent className="p-8">
                            <div className="aspect-square bg-gray-800 rounded-lg flex items-center justify-center relative overflow-hidden">
                                {/* Reticle */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-64 h-64 border-4 border-white/50 rounded-lg relative">
                                        {/* Corner indicators */}
                                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg"></div>
                                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg"></div>
                                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg"></div>
                                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg"></div>
                                    </div>
                                </div>

                                {/* Camera Icon */}
                                <Camera className="h-16 w-16 text-gray-600" />
                            </div>

                            <p className="text-center text-white mt-4 text-sm">
                                Position the QR code within the frame
                            </p>
                        </CardContent>
                    </Card>

                    {/* Manual Entry Button */}
                    <Button
                        onClick={handleManualEntry}
                        variant="outline"
                        className="mt-4 bg-white/10 text-white border-white/20 hover:bg-white/20"
                    >
                        Enter Code Instead
                    </Button>

                    {/* Note: In production, integrate actual QR scanner library like react-qr-reader */}
                    <p className="text-xs text-gray-500 mt-4 text-center max-w-md">
                        Note: QR scanning requires camera permissions. Make sure to allow camera access when prompted.
                    </p>
                </div>
            </div>
        </div>
    );
}
