export function BrandingIllustration() {
    return (
        <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[200px]">
            {/* Canvas frame */}
            <rect x="30" y="20" width="140" height="100" rx="8" fill="white" stroke="#e2e8f0" strokeWidth="2" />
            {/* Image placeholder */}
            <rect x="42" y="32" width="116" height="60" rx="6" fill="#dbeafe" />
            <circle cx="100" cy="62" r="16" fill="#93c5fd" />
            <path d="M88 62 L100 50 L112 62 L106 68 L94 68 Z" fill="#2563eb" />
            {/* Color swatches */}
            <circle cx="50" cy="108" r="10" fill="#2563eb" />
            <circle cx="75" cy="108" r="10" fill="#1e293b" />
            <circle cx="100" cy="108" r="10" fill="#93c5fd" />
            <circle cx="125" cy="108" r="10" fill="#dbeafe" />
            <circle cx="150" cy="108" r="10" fill="#f1f5f9" stroke="#e2e8f0" strokeWidth="1" />
            {/* Upload icon */}
            <circle cx="155" cy="35" r="14" fill="#2563eb" opacity="0.1" />
            <path d="M155 42 L155 30 M150 35 L155 30 L160 35" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" />
            {/* Easel legs */}
            <line x1="60" y1="120" x2="50" y2="145" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
            <line x1="140" y1="120" x2="150" y2="145" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
            <line x1="100" y1="120" x2="100" y2="150" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
}
