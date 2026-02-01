'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type EmergencyLevel = 'none' | 'low' | 'medium' | 'high';

interface EmergencyState {
    active: boolean;
    level: EmergencyLevel;
    message: string;
    type: 'lockdown' | 'fire' | 'medical' | null;
}

interface EmergencyContextType {
    status: EmergencyState;
    triggerEmergency: (type: EmergencyState['type'], level: EmergencyLevel, message: string) => void;
    clearEmergency: () => void;
}

const EmergencyContext = createContext<EmergencyContextType | undefined>(undefined);

export function EmergencyProvider({ children }: { children: ReactNode }) {
    const [status, setStatus] = useState<EmergencyState>({
        active: false,
        level: 'none',
        message: '',
        type: null
    });

    const triggerEmergency = (type: EmergencyState['type'], level: EmergencyLevel, message: string) => {
        setStatus({
            active: true,
            level,
            message,
            type
        });
        // In a real app, this would emit a socket event
    };

    const clearEmergency = () => {
        setStatus({
            active: false,
            level: 'none',
            message: '',
            type: null
        });
    };

    return (
        <EmergencyContext.Provider value={{ status, triggerEmergency, clearEmergency }}>
            {children}
        </EmergencyContext.Provider>
    );
}

export function useEmergency() {
    const context = useContext(EmergencyContext);
    if (context === undefined) {
        throw new Error('useEmergency must be used within an EmergencyProvider');
    }
    return context;
}
