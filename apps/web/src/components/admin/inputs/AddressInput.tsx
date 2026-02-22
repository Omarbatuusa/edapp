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
                        onChange={e => onChange({ ...value, street: e.target.value })}
                        placeholder="Street address"
                        className="w-full px-3 py-3 text-sm bg-transparent outline-none"
                    />
                </FieldWrapper>
                <div className="grid grid-cols-2 gap-3">
                    {(['suburb', 'city', 'province', 'postal_code', 'country'] as const).map(field => (
                        <FieldWrapper key={field} label={field.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())} state="idle">
                            <input
                                type="text"
                                value={value[field]}
                                onChange={e => onChange({ ...value, [field]: e.target.value })}
                                placeholder={field.replace('_', ' ')}
                                className="w-full px-3 py-2 text-sm bg-transparent outline-none"
                            />
                        </FieldWrapper>
                    ))}
                </div>
                <button
                    type="button"
                    onClick={() => setManual(false)}
                    className="text-xs text-blue-600 hover:underline self-start"
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
                    <span className="material-symbols-outlined text-slate-400 text-lg pl-3">location_on</span>
                    <input
                        type="text"
                        value={inputValue}
                        onChange={e => {
                            setValue(e.target.value);
                            if (!e.target.value) onChange(EMPTY_ADDRESS);
                        }}
                        disabled={!ready}
                        placeholder="Search for an address..."
                        className="flex-1 px-3 py-3 text-sm bg-transparent outline-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
                    />
                    {value.formatted_address && (
                        <button
                            type="button"
                            onClick={() => { setValue(''); onChange(EMPTY_ADDRESS); setFieldState('idle'); }}
                            className="pr-3 text-slate-400 hover:text-slate-600"
                        >
                            <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                    )}
                </div>
            </FieldWrapper>

            {status === 'OK' && (
                <ul className="absolute top-full left-0 right-0 z-40 mt-1 bg-white dark:bg-slate-800 border border-[#e2e8f0] dark:border-slate-700 rounded-xl shadow-xl overflow-hidden">
                    {data.map(suggestion => (
                        <li key={suggestion.place_id}>
                            <button
                                type="button"
                                onClick={() => handleSelect(suggestion)}
                                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                            >
                                <span className="material-symbols-outlined text-slate-400 text-sm flex-shrink-0">location_on</span>
                                <div>
                                    <span className="font-medium text-slate-800 dark:text-slate-100">
                                        {suggestion.structured_formatting.main_text}
                                    </span>
                                    <span className="text-slate-400 ml-1">
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
                className="mt-1.5 text-xs text-slate-400 hover:text-blue-600 transition-colors"
            >
                Can't find your address? Enter it manually
            </button>
        </div>
    );
}
