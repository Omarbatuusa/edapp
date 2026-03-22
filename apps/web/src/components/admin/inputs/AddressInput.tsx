'use client';

import { useState, useRef, useEffect } from 'react';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';
import { FieldWrapper } from './FieldWrapper';
import { CountrySelectField } from './CountrySelectField';
import { ALL_COUNTRIES } from './countries';

// Augment Window so TypeScript knows about window.google (loaded via Script in layout.tsx)
declare global {
    interface Window {
        google: typeof google;
    }
}

export interface AddressValue {
    formatted_address: string;
    google_place_id: string;
    street: string;
    suburb: string;
    city: string;
    province: string;
    postal_code: string;
    country: string;        // human-readable country name, e.g. "South Africa"
    country_iso2?: string;  // ISO2 from geocoder short_name, e.g. "ZA"
    lat: number | null;
    lng: number | null;
}

const EMPTY_ADDRESS: AddressValue = {
    formatted_address: '',
    google_place_id: '',
    street: '',
    suburb: '',
    city: '',
    province: '',
    postal_code: '',
    country: '',
    country_iso2: '',
    lat: null,
    lng: null,
};

interface AddressInputProps {
    label: string;
    value: AddressValue;
    onChange: (value: AddressValue) => void;
    required?: boolean;
}

function extractComponent(components: google.maps.GeocoderAddressComponent[], type: string): string {
    return components.find(c => c.types.includes(type))?.long_name || '';
}

function extractShortComponent(components: google.maps.GeocoderAddressComponent[], type: string): string {
    return components.find(c => c.types.includes(type))?.short_name || '';
}

/** Build a human-readable formatted address from manual field inputs */
function buildManualFormatted(v: AddressValue): string {
    return [v.street, v.suburb, v.city, v.province, v.postal_code, v.country]
        .filter(Boolean)
        .join(', ');
}

const fieldCls = 'w-full h-[44px] px-4 text-[15px] bg-transparent outline-none text-[hsl(var(--admin-text-main))] placeholder:text-[hsl(var(--admin-text-muted)/0.6)]';

// ── Interactive Map + Nearby Places ──────────────────────────────────────────
function InteractiveMap({ lat, lng }: { lat: number; lng: number }) {
    const mapDivRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<google.maps.Map | null>(null);
    const markerRef = useRef<google.maps.Marker | null>(null);
    const [nearby, setNearby] = useState<google.maps.places.PlaceResult[]>([]);

    useEffect(() => {
        if (!mapDivRef.current) return;
        if (typeof window === 'undefined' || !window.google?.maps) return;

        const center = { lat, lng };

        if (!mapRef.current) {
            mapRef.current = new window.google.maps.Map(mapDivRef.current, {
                center,
                zoom: 16,
                disableDefaultUI: true,
                zoomControl: true,
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: false,
            });
        } else {
            mapRef.current.setCenter(center);
            mapRef.current.setZoom(16);
        }

        // Replace previous marker
        if (markerRef.current) markerRef.current.setMap(null);
        markerRef.current = new window.google.maps.Marker({
            position: center,
            map: mapRef.current,
        });

        // Nearby places
        const svc = new window.google.maps.places.PlacesService(mapRef.current);
        svc.nearbySearch({ location: center, radius: 1000 }, (results, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && results?.length) {
                setNearby(results.slice(0, 5));
            } else {
                setNearby([]);
            }
        });
    }, [lat, lng]);

    return (
        <div className="mt-2 flex flex-col gap-2">
            <div
                ref={mapDivRef}
                className="h-[180px] w-full rounded-xl overflow-hidden border border-[hsl(var(--admin-border)/0.4)]"
            />
            {nearby.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {nearby.map((place, i) => (
                        <span
                            key={place.place_id || i}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[hsl(var(--admin-surface-alt)/0.6)] border border-[hsl(var(--admin-border)/0.4)] text-[12px] text-[hsl(var(--admin-text-sub))]"
                        >
                            <span className="material-symbols-outlined text-[13px] text-[hsl(var(--admin-text-muted))]">
                                location_on
                            </span>
                            <span className="truncate max-w-[140px]">{place.name}</span>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}

// ── Main AddressInput ─────────────────────────────────────────────────────────
//
// LAYOUT — auto search is ALWAYS the primary field at the top.
// Manual mode EXPANDS fields inline below it without replacing the auto field.
// Both modes share the same AddressValue object — values are preserved on switch.
//
export function AddressInput({ label, value, onChange, required }: AddressInputProps) {
    const [manual, setManual] = useState(false);
    // touched: true once the user has interacted (clicked in/out or selected a mode)
    const [touched, setTouched] = useState(false);

    // usePlacesAutocomplete must always be called (hook rules — not inside a conditional)
    const {
        ready,
        value: inputValue,
        suggestions: { status, data },
        setValue,
        clearSuggestions,
    } = usePlacesAutocomplete({
        requestOptions: { types: ['address'] },
        debounce: 300,
        defaultValue: value.formatted_address,
    });

    // ── Derived completion state ─────────────────────────────────────────────
    // Auto mode: complete when a Google Places result was selected (has place_id)
    // Manual mode: complete when at minimum street + city are filled
    const isAutoComplete = !manual && !!value.google_place_id;
    const isManualComplete = manual && !!(value.street && value.city && value.country_iso2);
    const isComplete = isAutoComplete || isManualComplete;

    // Outer FieldWrapper state
    const outerState: 'idle' | 'success' | 'error' = isComplete
        ? 'success'
        : touched && required
        ? 'error'
        : 'idle';
    const outerError = outerState === 'error' ? 'Physical address is required' : undefined;

    // ── Handlers ─────────────────────────────────────────────────────────────
    const handleSelect = async (suggestion: google.maps.places.AutocompletePrediction) => {
        setValue(suggestion.description, false);
        clearSuggestions();
        setTouched(true);
        try {
            const results = await getGeocode({ placeId: suggestion.place_id });
            const { lat, lng } = await getLatLng(results[0]);
            const comps = results[0].address_components;
            onChange({
                formatted_address: suggestion.description,
                google_place_id: suggestion.place_id,
                street: [extractComponent(comps, 'street_number'), extractComponent(comps, 'route')].filter(Boolean).join(' '),
                suburb: extractComponent(comps, 'sublocality') || extractComponent(comps, 'sublocality_level_1'),
                city: extractComponent(comps, 'locality'),
                province: extractComponent(comps, 'administrative_area_level_1'),
                postal_code: extractComponent(comps, 'postal_code'),
                country: extractComponent(comps, 'country'),
                country_iso2: extractShortComponent(comps, 'country'),
                lat,
                lng,
            });
        } catch {
            // Geocoding failed — address string is shown but not geocoded; field stays incomplete
        }
    };

    const switchToManual = () => {
        clearSuggestions();
        setManual(true);
        setTouched(true);
        // Clear Google-specific data — it belongs to the auto-selected address, not a manual entry.
        // Pre-populate street from formatted_address if no street was parsed yet.
        const street = value.street || (value.formatted_address && !value.google_place_id ? value.formatted_address : '');
        onChange({ ...value, google_place_id: '', lat: null, lng: null, street });
    };

    const switchToAuto = () => {
        setManual(false);
        // Restore the hook's input to the previously-selected address (if any)
        // so the auto search field doesn't appear empty on return
        setValue(value.google_place_id ? (value.formatted_address || '') : '', false);
    };

    /** Update a single manual field and rebuild formatted_address from all fields */
    const updateManualField = (field: keyof AddressValue, val: string) => {
        const updated = { ...value, [field]: val };
        updated.formatted_address = buildManualFormatted(updated);
        onChange(updated);
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col">

            {/* ── Primary search field (always visible) ── */}
            {/* Wrapped in relative div so the dropdown anchors correctly */}
            <div className="relative">
                <FieldWrapper
                    label={label}
                    required={required}
                    state={outerState}
                    error={outerError}
                    showIcon={false}  // border colour alone signals state; clear button + manual sub-fields provide visual feedback
                >
                    <div className="flex items-center">
                        <span className="material-symbols-outlined text-[hsl(var(--admin-text-muted))] text-[18px] pl-3 flex-shrink-0">
                            {manual ? 'edit_location' : 'location_on'}
                        </span>

                        {manual ? (
                            // Static display in manual mode — shows auto address if one was selected,
                            // or "Manual address entered below" hint otherwise
                            <div className="flex-1 h-[44px] px-3 flex items-center">
                                {value.google_place_id ? (
                                    <span className="text-[14px] text-[hsl(var(--admin-text-muted))] truncate">
                                        {value.formatted_address}
                                    </span>
                                ) : (
                                    <span className="text-[13px] italic text-[hsl(var(--admin-text-muted)/0.7)]">
                                        Manual address entered below
                                    </span>
                                )}
                            </div>
                        ) : (
                            // Live search input in auto mode
                            <input
                                type="text"
                                value={inputValue}
                                onChange={e => {
                                    setValue(e.target.value);
                                    if (!e.target.value) onChange(EMPTY_ADDRESS);
                                }}
                                onBlur={() => setTouched(true)}
                                disabled={!ready}
                                placeholder={ready ? 'Search for an address...' : 'Loading address search...'}
                                className="flex-1 h-[44px] px-3 text-[15px] bg-transparent outline-none text-[hsl(var(--admin-text-main))] placeholder:text-[hsl(var(--admin-text-muted)/0.6)]"
                            />
                        )}

                        {/* Clear button — only in auto mode with a selected address */}
                        {!manual && value.formatted_address && (
                            <button
                                type="button"
                                onClick={() => { setValue(''); onChange(EMPTY_ADDRESS); setTouched(false); }}
                                className="pr-3 text-[hsl(var(--admin-text-muted))] hover:text-[hsl(var(--admin-text-main))] transition-colors"
                                aria-label="Clear address"
                            >
                                <span className="material-symbols-outlined text-[16px]">close</span>
                            </button>
                        )}
                    </div>
                </FieldWrapper>

                {/* Autocomplete suggestions — only in auto mode */}
                {!manual && status === 'OK' && (
                    <ul className="absolute top-full left-0 right-0 z-40 mt-1 bg-white border border-[hsl(var(--admin-border)/0.5)] rounded-xl shadow-xl overflow-hidden">
                        {data.map(suggestion => (
                            <li key={suggestion.place_id}>
                                <button
                                    type="button"
                                    onClick={() => handleSelect(suggestion)}
                                    className="w-full flex items-center gap-2 px-4 py-3 text-[13px] text-left hover:bg-[hsl(var(--admin-surface-alt))] transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[hsl(var(--admin-text-muted))] text-[16px] flex-shrink-0">
                                        location_on
                                    </span>
                                    <div className="min-w-0">
                                        <span className="font-medium text-[hsl(var(--admin-text-main))]">
                                            {suggestion.structured_formatting.main_text}
                                        </span>
                                        <span className="text-[hsl(var(--admin-text-muted))] ml-1">
                                            {suggestion.structured_formatting.secondary_text}
                                        </span>
                                    </div>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* ── Map + nearby places (auto mode, address geocoded) ── */}
            {!manual && value.lat && value.lng && (
                <InteractiveMap lat={value.lat} lng={value.lng} />
            )}

            {/* ── Manual address fields (expand inline below, no replacement) ── */}
            {manual && (
                <div className="mt-3 flex flex-col gap-3">
                    {/* Section divider */}
                    <div className="flex items-center gap-2">
                        <div className="h-px flex-1 bg-[hsl(var(--admin-border)/0.4)]" />
                        <span className="text-[11px] font-bold text-[hsl(var(--admin-text-muted))] uppercase tracking-wider px-1">
                            Manual address
                        </span>
                        <div className="h-px flex-1 bg-[hsl(var(--admin-border)/0.4)]" />
                    </div>

                    {/* Street — required field in manual mode */}
                    <FieldWrapper
                        label="Street Address"
                        required
                        state={value.street ? 'success' : touched ? 'error' : 'idle'}
                        error={touched && !value.street ? 'Street address is required' : undefined}
                    >
                        <input
                            type="text"
                            value={value.street}
                            onChange={e => updateManualField('street', e.target.value)}
                            onBlur={() => setTouched(true)}
                            placeholder="e.g. 12 Main Street"
                            className={fieldCls}
                            aria-label="Street address"
                        />
                    </FieldWrapper>

                    <div className="grid grid-cols-2 gap-3">
                        <FieldWrapper
                            label="Suburb"
                            state={value.suburb ? 'success' : 'idle'}
                        >
                            <input
                                type="text"
                                value={value.suburb}
                                onChange={e => updateManualField('suburb', e.target.value)}
                                placeholder="Suburb"
                                className={fieldCls}
                                aria-label="Suburb"
                            />
                        </FieldWrapper>

                        {/* City — required field in manual mode */}
                        <FieldWrapper
                            label="City / Town"
                            required
                            state={value.city ? 'success' : touched ? 'error' : 'idle'}
                            error={touched && !value.city ? 'City is required' : undefined}
                        >
                            <input
                                type="text"
                                value={value.city}
                                onChange={e => updateManualField('city', e.target.value)}
                                onBlur={() => setTouched(true)}
                                placeholder="City"
                                className={fieldCls}
                                aria-label="City"
                            />
                        </FieldWrapper>

                        <FieldWrapper
                            label="Province / State"
                            state={value.province ? 'success' : 'idle'}
                        >
                            <input
                                type="text"
                                value={value.province}
                                onChange={e => updateManualField('province', e.target.value)}
                                placeholder="Province"
                                className={fieldCls}
                                aria-label="Province or state"
                            />
                        </FieldWrapper>

                        <FieldWrapper
                            label="Postal Code"
                            state={value.postal_code ? 'success' : 'idle'}
                        >
                            <input
                                type="text"
                                value={value.postal_code}
                                onChange={e => updateManualField('postal_code', e.target.value)}
                                placeholder="0000"
                                className={fieldCls}
                                aria-label="Postal code"
                            />
                        </FieldWrapper>
                    </div>

                    <CountrySelectField
                        label="Country"
                        required
                        value={value.country_iso2 || ''}
                        onChange={iso2 => {
                            const found = ALL_COUNTRIES.find(c => c.iso2 === iso2);
                            const updated = { ...value, country_iso2: iso2, country: found?.name || iso2 };
                            updated.formatted_address = buildManualFormatted(updated);
                            onChange(updated);
                        }}
                        placeholder="— Select country —"
                    />
                </div>
            )}

            {/* ── Mode toggle ── */}
            {!manual ? (
                <button
                    type="button"
                    onClick={switchToManual}
                    className="mt-2 text-[12px] text-[hsl(var(--admin-text-muted))] hover:text-[hsl(var(--admin-primary))] transition-colors self-start px-1"
                >
                    Enter address manually
                </button>
            ) : (
                <button
                    type="button"
                    onClick={switchToAuto}
                    className="mt-2 text-[12px] text-[hsl(var(--admin-primary))] hover:underline self-start px-1 flex items-center gap-1"
                >
                    <span className="material-symbols-outlined text-[13px]">search</span>
                    Use address search instead
                </button>
            )}
        </div>
    );
}
