export interface Tenant {
    id: string;
    name: string;
    code: string;
    logoUrl?: string;
    logo?: string;
    domain?: string;
    portalType?: 'login' | 'apply' | 'marketing';
    themeColor?: string;
    config?: {
        modules: string[];
    };
}

export const MOCK_TENANTS: Tenant[] = [
    {
        id: "tenant_1",
        name: "St. Marks High School",
        code: "STMARKS",
        logoUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBHWulANizLBV6h9lghmURJjM6_161HnhmMjP18F87W02xV5ryaMfNhmFNFOFmSg40upRtGF01ZSTllJT8TVbwuNVQfXROfsLVKOUjM88JKn5dc0kMJEGwjElqV2SOO5LA6Er8FzhWCe2Ry-eWf_VF2RYwdv7Qk-vTcT6hjgjWdSWrT_6Nc5A444aARrS5sfEFWamwlJQ5lREA5vXTrDn3dEPLi5IeJa0XE4GUyKEjd9W_TrFMX1NG7xEKhsaoTAtziW6827PvL5Po",
        themeColor: "#135bec",
        config: { modules: ['academics', 'discipline', 'attendance', 'finance', 'communication'] }
    },
    {
        id: "tenant_2",
        name: "Greenwood Primary",
        code: "GREENWOOD",
        themeColor: "#10b981",
        config: { modules: ['academics', 'attendance'] }
    },
    {
        id: "tenant_lakewood",
        name: "Lakewood International",
        code: "LAKE001",
        domain: "lakewood.edapp.co.za",
        logo: "https://ui-avatars.com/api/?name=Lakewood+Int&background=0D8ABC&color=fff&size=200",
        themeColor: "#0D8ABC",
        config: { modules: ['academics', 'discipline', 'attendance'] } // Finance/Comms Hidden
    },
    {
        id: "tenant_allied",
        name: "Allied High School",
        code: "ALLIED",
        domain: "allied.edapp.co.za",
        logo: "https://ui-avatars.com/api/?name=Allied+High&background=d97706&color=fff&size=200",
        themeColor: "#d97706",
        config: { modules: ['academics', 'discipline', 'attendance', 'finance'] }
    },
    {
        id: "tenant_jeppe",
        name: "Jeppe Education Centre",
        code: "JEPPE",
        domain: "jeppe.edapp.co.za",
        logo: "https://ui-avatars.com/api/?name=Jeppe+Edu&background=dc2626&color=fff&size=200",
        themeColor: "#dc2626",
        config: { modules: ['academics', 'discipline', 'attendance'] }
    }
];

export async function searchTenant(code: string): Promise<Tenant | null> {
    return new Promise((resolve) => {
        setTimeout(() => {
            const tenant = MOCK_TENANTS.find((t) => t.code.toLowerCase() === code.toLowerCase());
            resolve(tenant || null);
        }, 800); // Simulate network delay
    });
}
