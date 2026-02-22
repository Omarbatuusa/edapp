export function MapIllustration() {
    return (
        <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[200px]">
            {/* Map background */}
            <rect x="15" y="20" width="170" height="120" rx="12" fill="#dbeafe" />
            {/* Roads */}
            <path d="M15 80 L185 80" stroke="white" strokeWidth="6" />
            <path d="M100 20 L100 140" stroke="white" strokeWidth="6" />
            <path d="M40 20 L40 80" stroke="white" strokeWidth="3" opacity="0.5" />
            <path d="M160 80 L160 140" stroke="white" strokeWidth="3" opacity="0.5" />
            <path d="M15 110 L100 110" stroke="white" strokeWidth="3" opacity="0.5" />
            <path d="M100 50 L185 50" stroke="white" strokeWidth="3" opacity="0.5" />
            {/* Road dashes */}
            <path d="M15 80 L185 80" stroke="#bfdbfe" strokeWidth="1" strokeDasharray="8 6" />
            <path d="M100 20 L100 140" stroke="#bfdbfe" strokeWidth="1" strokeDasharray="8 6" />
            {/* Blocks */}
            <rect x="44" y="24" width="50" height="50" rx="4" fill="#93c5fd" opacity="0.4" />
            <rect x="106" y="24" width="73" height="50" rx="4" fill="#93c5fd" opacity="0.4" />
            <rect x="44" y="86" width="50" height="48" rx="4" fill="#93c5fd" opacity="0.4" />
            <rect x="106" y="86" width="73" height="48" rx="4" fill="#93c5fd" opacity="0.4" />
            {/* Pin */}
            <circle cx="100" cy="75" r="22" fill="#2563eb" opacity="0.15" />
            <circle cx="100" cy="68" r="12" fill="#2563eb" />
            <circle cx="100" cy="68" r="5" fill="white" />
            <path d="M100 80 L94 92 L100 88 L106 92 Z" fill="#2563eb" />
            {/* Compass */}
            <circle cx="168" cy="32" r="12" fill="white" opacity="0.9" />
            <text x="168" y="36" textAnchor="middle" fill="#2563eb" fontSize="11" fontWeight="700" fontFamily="sans-serif">N</text>
        </svg>
    );
}
