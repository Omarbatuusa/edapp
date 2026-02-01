'use client';

import { useState } from 'react';
import { UserCheck, Delete, CheckCircle, XCircle } from 'lucide-react';

export default function GateKiosk() {
    const [pin, setPin] = useState('');
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [scannedUser, setScannedUser] = useState<any>(null);

    const handleNumberClick = (num: string) => {
        if (pin.length < 4) {
            const newPin = pin + num;
            setPin(newPin);
            if (newPin.length === 4) {
                verifyPin(newPin);
            }
        }
    };

    const handleClear = () => {
        setPin('');
        setStatus('idle');
        setScannedUser(null);
    };

    const verifyPin = (inputPin: string) => {
        // Mock verification
        if (inputPin === '1234') {
            setScannedUser({ name: 'Bart Simpson', grade: 'Grade 10', status: 'On Time' });
            setStatus('success');
            setTimeout(() => handleClear(), 3000); // Auto reset
        } else {
            setStatus('error');
            setTimeout(() => {
                setPin('');
                setStatus('idle');
            }, 1000);
        }
    };

    return (
        <div className="max-w-md mx-auto h-[calc(100vh-140px)] flex flex-col items-center justify-center">

            {status === 'idle' && (
                <>
                    <div className="mb-8 text-center">
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                            <UserCheck size={40} />
                        </div>
                        <h1 className="text-2xl font-bold">Gate Check-in</h1>
                        <p className="text-muted-foreground">Enter your 4-digit PIN</p>
                    </div>

                    <div className="flex gap-4 mb-8">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div
                                key={i}
                                className={`w-4 h-4 rounded-full transition-all ${i < pin.length ? 'bg-primary scale-110' : 'bg-secondary'
                                    }`}
                            />
                        ))}
                    </div>

                    <div className="grid grid-cols-3 gap-4 w-full max-w-xs">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                            <button
                                key={num}
                                onClick={() => handleNumberClick(num.toString())}
                                className="h-20 rounded-2xl bg-secondary/30 hover:bg-secondary text-2xl font-bold transition-all active:scale-95"
                            >
                                {num}
                            </button>
                        ))}
                        <div />
                        <button
                            onClick={() => handleNumberClick('0')}
                            className="h-20 rounded-2xl bg-secondary/30 hover:bg-secondary text-2xl font-bold transition-all active:scale-95"
                        >
                            0
                        </button>
                        <button
                            onClick={handleClear}
                            className="h-20 rounded-2xl text-red-500 hover:bg-red-50 flex items-center justify-center transition-all active:scale-95"
                        >
                            <Delete size={24} />
                        </button>
                    </div>
                </>
            )}

            {status === 'success' && (
                <div className="text-center animate-in zoom-in duration-300">
                    <div className="w-32 h-32 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={64} />
                    </div>
                    <h2 className="text-3xl font-bold mb-2">Welcome Back!</h2>
                    <p className="text-xl font-medium text-primary">{scannedUser.name}</p>
                    <p className="text-muted-foreground">{scannedUser.grade}</p>
                </div>
            )}

            {status === 'error' && (
                <div className="text-center animate-in shake">
                    <div className="w-32 h-32 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <XCircle size={64} />
                    </div>
                    <h2 className="text-2xl font-bold text-red-600">Invalid PIN</h2>
                    <p className="text-muted-foreground">Please try again.</p>
                </div>
            )}

        </div>
    );
}
