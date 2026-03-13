export function PersonalIllustration() {
    return (
        <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[200px]">
            <circle cx="100" cy="70" r="55" fill="#ede9fe" />
            {/* Person silhouette */}
            <circle cx="100" cy="50" r="16" fill="#c4b5fd" />
            <path d="M75 95 C75 78 125 78 125 95" fill="#c4b5fd" />
            {/* ID card */}
            <rect x="60" y="100" width="80" height="45" rx="6" fill="white" stroke="#a78bfa" strokeWidth="1.5" />
            <rect x="68" y="108" width="22" height="22" rx="3" fill="#ede9fe" />
            <circle cx="79" cy="115" r="5" fill="#a78bfa" />
            <path d="M72 125 C72 121 86 121 86 125" fill="#a78bfa" />
            {/* Text lines on ID */}
            <rect x="96" y="110" width="36" height="4" rx="2" fill="#c4b5fd" />
            <rect x="96" y="118" width="28" height="3" rx="1.5" fill="#ddd6fe" />
            <rect x="96" y="125" width="32" height="3" rx="1.5" fill="#ddd6fe" />
            {/* Calendar icon */}
            <rect x="148" y="30" width="26" height="24" rx="4" fill="#8b5cf6" />
            <rect x="148" y="30" width="26" height="8" rx="4" fill="#7c3aed" />
            <text x="161" y="49" textAnchor="middle" fill="white" fontSize="10" fontWeight="700" fontFamily="sans-serif">15</text>
        </svg>
    );
}
