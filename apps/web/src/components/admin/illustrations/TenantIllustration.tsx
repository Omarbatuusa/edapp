export function TenantIllustration() {
    return (
        <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[200px]">
            {/* Background */}
            <rect x="30" y="30" width="140" height="100" rx="16" fill="#dbeafe" />
            {/* Building body */}
            <rect x="60" y="50" width="80" height="70" rx="6" fill="#2563eb" />
            {/* Roof */}
            <path d="M55 55 L100 30 L145 55" stroke="#1d4ed8" strokeWidth="3" fill="#3b82f6" />
            {/* Windows row 1 */}
            <rect x="72" y="62" width="14" height="12" rx="2" fill="#bfdbfe" />
            <rect x="93" y="62" width="14" height="12" rx="2" fill="#bfdbfe" />
            <rect x="114" y="62" width="14" height="12" rx="2" fill="#bfdbfe" />
            {/* Windows row 2 */}
            <rect x="72" y="82" width="14" height="12" rx="2" fill="#bfdbfe" />
            <rect x="114" y="82" width="14" height="12" rx="2" fill="#bfdbfe" />
            {/* Door */}
            <rect x="93" y="88" width="14" height="32" rx="3" fill="#1e40af" />
            <circle cx="104" cy="104" r="1.5" fill="#93c5fd" />
            {/* Flag */}
            <line x1="100" y1="30" x2="100" y2="18" stroke="#1d4ed8" strokeWidth="1.5" />
            <rect x="100" y="18" width="16" height="8" rx="1" fill="#f59e0b" />
            {/* Ground */}
            <rect x="30" y="120" width="140" height="6" rx="3" fill="#93c5fd" opacity="0.5" />
            {/* Label */}
            <rect x="65" y="135" width="70" height="18" rx="9" fill="#2563eb" />
            <text x="100" y="147" textAnchor="middle" fill="white" fontSize="9" fontWeight="600" fontFamily="sans-serif">School</text>
        </svg>
    );
}
