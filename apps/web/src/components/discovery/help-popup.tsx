"use client"

import { useEffect, useRef } from "react"

interface HelpPopupProps {
    isOpen: boolean
    onClose: () => void
}

export function HelpPopup({ isOpen, onClose }: HelpPopupProps) {
    const popupRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
                onClose()
            }
        }

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside)
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [isOpen, onClose])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                ref={popupRef}
                className="bg-white dark:bg-[#1c2632] rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
            >
                {/* Header */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Help</h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded-full transition-colors"
                        aria-label="Close"
                    >
                        <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Section 1: Support */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Support</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                            Need help signing in? Contact your school administrator or EdApp support.
                        </p>
                        <div className="grid grid-cols-1 gap-2">
                            <button className="w-full bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-primary font-medium py-3 rounded-xl transition-colors text-sm">
                                Contact Support
                            </button>
                            <button className="w-full bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-primary font-medium py-3 rounded-xl transition-colors text-sm">
                                View Updates / News
                            </button>
                        </div>
                    </div>

                    {/* Section 2: New Schools */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">New Schools</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                            Interested in joining EdApp? Request a demo and onboarding.
                        </p>
                        <button className="w-full bg-primary/10 hover:bg-primary/20 text-primary font-bold py-3 rounded-xl transition-colors text-sm">
                            Request a Demo
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
