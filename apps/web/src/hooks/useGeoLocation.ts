import { useState, useCallback } from 'react';

export interface GeoLocationState {
    lat: number | null;
    lng: number | null;
    accuracy: number | null;
    timestamp: number | null;
    error: string | null;
    loading: boolean;
}

export const useGeoLocation = () => {
    const [state, setState] = useState<GeoLocationState>({
        lat: null,
        lng: null,
        accuracy: null,
        timestamp: null,
        error: null,
        loading: false,
    });

    const getLocation = useCallback((): Promise<GeoLocationState> => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        return new Promise((resolve) => {
            if (!navigator.geolocation) {
                const errorState = {
                    lat: null, lng: null, accuracy: null, timestamp: null,
                    error: 'Geolocation is not supported by your browser',
                    loading: false
                };
                setState(errorState);
                resolve(errorState);
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const newState = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                        timestamp: position.timestamp,
                        error: null,
                        loading: false
                    };
                    setState(newState);
                    resolve(newState);
                },
                (error) => {
                    let errorMessage = 'Unknown error';
                    switch (error.code) {
                        case error.PERMISSION_DENIED: errorMessage = 'User denied the request for Geolocation'; break;
                        case error.POSITION_UNAVAILABLE: errorMessage = 'Location information is unavailable'; break;
                        case error.TIMEOUT: errorMessage = 'The request to get user location timed out'; break;
                    }
                    const errorState = {
                        lat: null, lng: null, accuracy: null, timestamp: null,
                        error: errorMessage,
                        loading: false
                    };
                    setState(errorState);
                    resolve(errorState);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        });
    }, []);

    return { ...state, getLocation };
};
