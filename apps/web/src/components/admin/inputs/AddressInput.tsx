'use client';

import { useState } from 'react';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';
import { FieldWrapper } from './FieldWrapper';

export interface AddressValue {
    formatted_address: string;
    google_place_id: string;
    street: string;
    suburb: string;
    city: string;
    province: string;
    postal_code: string;
    country: string;
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
    const comp = components.find(c => c.types.includes(type));
    return comp?.long_name || '';
}

const fieldCls = 'w-full h-[44px] px-4 text-[15px] bg-transparent outline-none text-[hsl(var(--admin-text-main))] placeholder:text-[hsl(var(--admin-text-muted)/0.6)]';

export function AddressInput({ label, value, onChange, required }: AddressInputProps) {
    const [manual, setManual] = useState(false);
    const [fieldState, setFieldState] = useState<'idle' | 'success' | 'error'>('idle');

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

    const handleSelect = async (suggestion: google.maps.places.AutocompletePrediction) => {
        setValue(suggestion.description, false);
        clearSuggestions();
        try {
            const results = await getGeocode({ placeId: suggestion.place_id });
            const { lat, lng } = await getLatLng(results[0]);
            const comps = results[0].address_components;

            const parsed: AddressValue = {
                formatted_address: suggestion.description,
                google_place_id: suggestion.place_id,
                street: [extractComponent(comps, 'street_number'), extractComponent(comps, 'route')].filter(Boolean).join(' '),
                suburb: extractComponent(comps, 'sublocality') || extractComponent(comps, 'sublocality_level_1'),
                city: extractComponent(comps, 'locality'),
                province: extractComponent(comps, 'administrative_area_level_1'),
                postal_code: extractComponent(comps, 'postal_code'),
                country: extractComponent(comps, 'country'),
                lat,
                lng,
            };
            onChange(parsed);
            setFieldState('success');
        } catch {
            setFieldState('error');
        }
    };

    if (manual) {
        return (
            <div className="flex flex-col gap-3">
                <FieldWrapper label={label} required={required} state={fieldState}>
                    <input
                        type="text"
                        value={value.street}
                        onChange={e => onChange({ ...value, street: e.target.value, formatted_address: e.target.value })}
                        placeholder="Street address"
                        className={fieldCls}
                    />
                </FieldWrapper>
                <div className="grid grid-cols-2 gap-3">
                    <FieldWrapper label="Suburb" state="idle">
                        <input type="text" value={value.suburb} onChange={e => onChange({ ...value, suburb: e.target.value })} placeholder="Suburb" className={fieldCls} />
                    </FieldWrapper>
                    <FieldWrapper label="City" state="idle">
                        <input type="text" value={value.city} onChange={e => onChange({ ...value, city: e.target.value })} placeholder="City" className={fieldCls} />
                    </FieldWrapper>
                    <FieldWrapper label="Province" state="idle">
                        <input type="text" value={value.province} onChange={e => onChange({ ...value, province: e.target.value })} placeholder="Province" className={fieldCls} />
                    </FieldWrapper>
                    <FieldWrapper label="Postal Code" state="idle">
                        <input type="text" value={value.postal_code} onChange={e => onChange({ ...value, postal_code: e.target.value })} placeholder="Postal code" className={fieldCls} />
                    </FieldWrapper>
                    <FieldWrapper label="Country" state="idle">
                        <input type="text" value={value.country} onChange={e => onChange({ ...value, country: e.target.value })} placeholder="Country" className={fieldCls} />
                    </FieldWrapper>
                </div>
                <button
                    type="button"
                    onClick={() => setManual(false)}
                    className="text-[12px] text-[hsl(var(--admin-primary))] hover:underline self-start px-1"
                >
                    Use address search instead
                </button>
            </div>
        );
    }

    return (
        <div className="relative">
            <FieldWrapper label={label} required={required} state={value.formatted_address ? 'success' : fieldState}>
                <div className="flex items-center">
                    <span className="material-symbols-outlined text-[hsl(var(--admin-text-muted))] text-[18px] pl-3">location_on</span>
                    <input
                        type="text"
                        value={inputValue}
                        onChange={e => {
                            setValue(e.target.value);
                            if (!e.target.value) onChange(EMPTY_ADDRESS);
                        }}
                        disabled={!ready}
                        placeholder="Search for an address..."
                        className="flex-1 h-[44px] px-3 text-[15px] bg-transparent outline-none text-[hsl(var(--admin-text-main))] placeholder:text-[hsl(var(--admin-text-muted)/0.6)]"
                    />
                    {value.formatted_address && (
                        <button
                            type="button"
                            onClick={() => { setValue(''); onChange(EMPTY_ADDRESS); setFieldState('idle'); }}
                            className="pr-3 text-[hsl(var(--admin-text-muted))] hover:text-[hsl(var(--admin-text-main))]"
                            aria-label="Clear address"
                        >
                            <span className="material-symbols-outlined text-[16px]">close</span>
                        </button>
                    )}
                </div>
            </FieldWrapper>

            {status === 'OK' && (
                <ul className="absolute top-full left-0 right-0 z-40 mt-1 bg-white border border-[hsl(var(--admin-border)/0.5)] rounded-xl shadow-xl overflow-hidden">
                    {data.map(suggestion => (
                        <li key={suggestion.place_id}>
                            <button
                                type="button"
                                onClick={() => handleSelect(suggestion)}
                                className="w-full flex items-center gap-2 px-4 py-3 text-[13px] text-left hover:bg-[hsl(var(--admin-surface-alt))] transition-colors"
                            >
                                <span className="material-symbols-outlined text-[hsl(var(--admin-text-muted))] text-[16px] flex-shrink-0">location_on</span>
                                <div>
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

            <button
                type="button"
                onClick={() => setManual(true)}
                className="mt-1.5 text-[12px] text-[hsl(var(--admin-text-muted))] hover:text-[hsl(var(--admin-primary))] transition-colors px-1"
            >
                Enter address manually
            </button>
        </div>
    );
}
