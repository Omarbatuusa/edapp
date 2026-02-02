"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronLeft, X, ChevronRight } from "lucide-react"

interface HelpPopupProps {
    isOpen: boolean
    onClose: () => void
}

// Legal page content - professional and concise
const legalPages: Record<string, { title: string; content: string }> = {
    privacy: {
        title: "Privacy Notice",
        content: `EdApp is committed to protecting your privacy. This notice explains how we collect, use, and safeguard your personal information.

**Information We Collect**
We collect information you provide directly, such as account details, and information generated through your use of our services.

**How We Use Information**
Your information is used to provide and improve our services, communicate with you, and ensure security.

**Data Protection**
We implement industry-standard security measures to protect your data. Your information is encrypted in transit and at rest.

**Your Rights**
You have the right to access, correct, or delete your personal information. Contact us at admin@edapp.co.za with any requests.`
    },
    terms: {
        title: "Terms of Use",
        content: `By using EdApp, you agree to these terms. Please read them carefully.

**Account Responsibilities**
You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.

**Acceptable Use**
Use EdApp only for lawful educational purposes. Do not attempt to disrupt or compromise our services.

**Intellectual Property**
All content and materials on EdApp are protected by intellectual property rights. Do not copy or distribute without permission.

**Limitation of Liability**
EdApp is provided "as is" without warranties. We are not liable for any indirect or consequential damages.`
    },
    "child-safety": {
        title: "Child Safety",
        content: `EdApp is committed to the safety and protection of children using our platform.

**Safe Environment**
We maintain a safe learning environment with age-appropriate content moderation and monitoring.

**Parental Controls**
Parents and guardians have access to controls and visibility over their child's activity on the platform.

**Reporting Concerns**
If you observe any concerning behavior or content, please report it immediately to admin@edapp.co.za.

**COPPA Compliance**
We comply with the Children's Online Privacy Protection Act and do not knowingly collect personal information from children under 13 without parental consent.`
    },
    cookies: {
        title: "Cookie Policy",
        content: `EdApp uses cookies and similar technologies to enhance your experience.

**Essential Cookies**
Required for basic functionality such as authentication and security.

**Analytics Cookies**
Help us understand how users interact with our platform to improve our services.

**Preference Cookies**
Remember your settings and preferences for a personalized experience.

**Managing Cookies**
You can control cookies through your browser settings. Note that disabling some cookies may affect functionality.`
    },
    "acceptable-use": {
        title: "Acceptable Use",
        content: `This policy outlines acceptable use of EdApp services.

**Permitted Use**
• Educational activities within your institution
• Communication related to learning
• Accessing assigned materials and resources

**Prohibited Activities**
• Sharing login credentials
• Uploading inappropriate or harmful content
• Attempting to access unauthorized areas
• Using the platform for commercial purposes

**Enforcement**
Violations may result in account suspension or termination.`
    },
    popia: {
        title: "POPIA Compliance",
        content: `EdApp complies with the Protection of Personal Information Act (POPIA) of South Africa.

**Lawful Processing**
We process personal information only for legitimate educational purposes with appropriate consent.

**Information Officer**
Our Information Officer can be reached at admin@edapp.co.za for any POPIA-related inquiries.

**Your Rights Under POPIA**
• Right to access your personal information
• Right to correct inaccurate information
• Right to object to processing
• Right to lodge complaints with the Information Regulator

**Data Retention**
We retain personal information only as long as necessary for educational purposes or as required by law.`
    }
}

const legalLinks = [
    { key: "privacy", label: "Privacy Notice", icon: "shield" },
    { key: "terms", label: "Terms of Use", icon: "description" },
    { key: "child-safety", label: "Child Safety", icon: "child_care" },
    { key: "cookies", label: "Cookie Policy", icon: "cookie" },
    { key: "acceptable-use", label: "Acceptable Use", icon: "verified_user" },
    { key: "popia", label: "POPIA", icon: "security" }
]

export function HelpPopup({ isOpen, onClose }: HelpPopupProps) {
    const popupRef = useRef<HTMLDivElement>(null)
    const [activePage, setActivePage] = useState<string | null>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
                if (activePage) {
                    setActivePage(null)
                } else {
                    onClose()
                }
            }
        }

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside)
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [isOpen, onClose, activePage])

    // Reset active page when popup closes
    useEffect(() => {
        if (!isOpen) {
            setActivePage(null)
        }
    }, [isOpen])

    if (!isOpen) return null

    const handleClose = () => {
        setActivePage(null)
        onClose()
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                ref={popupRef}
                className="bg-white dark:bg-[#1c2632] rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col"
            >
                {/* Header */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3 shrink-0">
                    {activePage ? (
                        <button
                            onClick={() => setActivePage(null)}
                            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                            aria-label="Back"
                        >
                            <ChevronLeft size={20} />
                        </button>
                    ) : null}
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white flex-1">
                        {activePage ? legalPages[activePage]?.title : "Help"}
                    </h2>
                    <button
                        onClick={handleClose}
                        className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded-full transition-colors"
                        aria-label="Close"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    {/* Main Help Menu */}
                    <div className={`transition-all duration-300 ${activePage ? 'hidden' : 'block'}`}>
                        <div className="p-5 space-y-6">
                            {/* Support Section */}
                            <div className="space-y-3">
                                <h3 className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Support
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                    Need help signing in? Contact your school administrator or EdApp support.
                                </p>
                                <a
                                    href="mailto:admin@edapp.co.za"
                                    className="w-full bg-primary/10 hover:bg-primary/20 text-primary font-semibold py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-lg">mail</span>
                                    Contact Support
                                </a>
                            </div>

                            {/* New Schools Section */}
                            <div className="space-y-3">
                                <h3 className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    New Schools
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                    Interested in joining EdApp? Request a demo and onboarding.
                                </p>
                                <button className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl transition-colors text-sm shadow-lg shadow-primary/20">
                                    Request a Demo
                                </button>
                            </div>

                            {/* Legal & Policies */}
                            <div className="space-y-2">
                                <h3 className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                                    Legal & Policies
                                </h3>
                                <div className="space-y-1">
                                    {legalLinks.map((link) => (
                                        <button
                                            key={link.key}
                                            onClick={() => setActivePage(link.key)}
                                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left group"
                                        >
                                            <span className="material-symbols-outlined text-gray-400 dark:text-gray-500 text-xl">
                                                {link.icon}
                                            </span>
                                            <span className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                                {link.label}
                                            </span>
                                            <ChevronRight size={16} className="text-gray-300 dark:text-gray-600 group-hover:text-gray-400 transition-colors" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Legal Page Content - iOS-style slide in */}
                    {activePage && (
                        <div className="animate-in slide-in-from-right-4 fade-in duration-300 p-5">
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                                {legalPages[activePage]?.content.split('\n\n').map((paragraph, idx) => {
                                    if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                                        return (
                                            <h3 key={idx} className="text-sm font-bold text-gray-900 dark:text-white mt-4 mb-2">
                                                {paragraph.replace(/\*\*/g, '')}
                                            </h3>
                                        )
                                    }
                                    if (paragraph.includes('**')) {
                                        const parts = paragraph.split(/(\*\*[^*]+\*\*)/)
                                        return (
                                            <p key={idx} className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                                                {parts.map((part, i) => {
                                                    if (part.startsWith('**') && part.endsWith('**')) {
                                                        return (
                                                            <strong key={i} className="font-semibold text-gray-900 dark:text-white block mt-3 mb-1">
                                                                {part.replace(/\*\*/g, '')}
                                                            </strong>
                                                        )
                                                    }
                                                    return <span key={i}>{part}</span>
                                                })}
                                            </p>
                                        )
                                    }
                                    if (paragraph.startsWith('•')) {
                                        return (
                                            <ul key={idx} className="text-sm text-gray-600 dark:text-gray-400 space-y-1 mb-3 list-none">
                                                {paragraph.split('\n').map((item, i) => (
                                                    <li key={i} className="flex items-start gap-2">
                                                        <span className="text-primary mt-0.5">•</span>
                                                        {item.replace('• ', '')}
                                                    </li>
                                                ))}
                                            </ul>
                                        )
                                    }
                                    return (
                                        <p key={idx} className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                                            {paragraph}
                                        </p>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
