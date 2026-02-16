'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Circle, Marker, useMapEvents, useMap } from 'react-leaflet';
// Leaflet CSS must be imported in global CSS or here if strictly client-side
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Leaflet markers in Next.js/React
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png';
const iconUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png';

// Only run likely on client
if (typeof window !== 'undefined') {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl,
        iconUrl,
        shadowUrl,
    });
}

interface GeoZoneMapProps {
    lat: number;
    lng: number;
    radius: number;
    editable?: boolean;
    onLocationChange?: (lat: number, lng: number) => void;
}

// Component to handle map clicks
function LocationMarker({ position, onChange, editable }: { position: [number, number], onChange?: (lat: number, lng: number) => void, editable?: boolean }) {
    const map = useMap();

    useMapEvents({
        click(e) {
            if (editable && onChange) {
                onChange(e.latlng.lat, e.latlng.lng);
                map.flyTo(e.latlng, map.getZoom());
            }
        },
    });

    return position === null ? null : (
        <Marker position={position}></Marker>
    );
}

// Component to re-center map when props change
function MapUpdater({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center);
    }, [center, map]);
    return null;
}

export default function GeoZoneMap({ lat, lng, radius, editable = false, onLocationChange }: GeoZoneMapProps) {
    const [position, setPosition] = useState<[number, number]>([lat || -26.2041, lng || 28.0473]); // Default JHB

    useEffect(() => {
        if (lat && lng) {
            setPosition([lat, lng]);
        }
    }, [lat, lng]);

    const handleLocationChange = (newLat: number, newLng: number) => {
        setPosition([newLat, newLng]);
        if (onLocationChange) onLocationChange(newLat, newLng);
    };

    return (
        <div className="h-[400px] w-full rounded-lg overflow-hidden border z-0 relative">
            <MapContainer
                center={position}
                zoom={16}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <LocationMarker
                    position={position}
                    onChange={handleLocationChange}
                    editable={editable}
                />

                <Circle
                    center={position}
                    radius={radius}
                    pathOptions={{ color: editable ? 'blue' : 'green', fillColor: editable ? 'blue' : 'green', fillOpacity: 0.2 }}
                />

                <MapUpdater center={position} />
            </MapContainer>

            {editable && (
                <div className="absolute bottom-4 left-4 bg-white p-2 rounded shadow text-xs z-[1000] opacity-90">
                    Click map to set center
                </div>
            )}
        </div>
    );
}
