export function BrandIllustration() {
    return (
        <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[200px]">
            {/* Background circles */}
            <circle cx="100" cy="80" r="60" fill="#dbeafe" />
            <circle cx="100" cy="80" r="45" fill="#bfdbfe" />
            <circle cx="100" cy="80" r="30" fill="#93c5fd" />
            {/* Center icon */}
            <circle cx="100" cy="80" r="18" fill="#2563eb" />
            <path d="M93 80 L100 73 L107 80 L100 87 Z" fill="white" />
            {/* Orbiting dots */}
            <circle cx="56" cy="60" r="6" fill="#2563eb" opacity="0.6" />
            <circle cx="144" cy="60" r="6" fill="#2563eb" opacity="0.6" />
            <circle cx="56" cy="100" r="6" fill="#2563eb" opacity="0.6" />
            <circle cx="144" cy="100" r="6" fill="#2563eb" opacity="0.6" />
            {/* Link lines */}
            <line x1="62" y1="63" x2="82" y2="72" stroke="#2563eb" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.4" />
            <line x1="138" y1="63" x2="118" y2="72" stroke="#2563eb" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.4" />
            <line x1="62" y1="97" x2="82" y2="88" stroke="#2563eb" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.4" />
            <line x1="138" y1="97" x2="118" y2="88" stroke="#2563eb" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.4" />
            {/* Label */}
            <rect x="70" y="120" width="60" height="18" rx="9" fill="#2563eb" />
            <text x="100" y="132" textAnchor="middle" fill="white" fontSize="9" fontWeight="600" fontFamily="sans-serif">Brand</text>
        </svg>
    );
}
