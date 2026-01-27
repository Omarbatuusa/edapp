"use client"

import { useState, use } from "react"
import { useRouter } from "next/navigation"
import { AuthFooter } from "@/components/layout/AuthFooter"
import { ThemeToggle } from "@/components/discovery/theme-toggle"
import { HelpPopup } from "@/components/discovery/help-popup"

export default function LearnerLoginPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params)
    const router = useRouter()

    const [showHelp, setShowHelp] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [showPin, setShowPin] = useState(false)

    const [studentNumber, setStudentNumber] = useState("")
    const [pin, setPin] = useState("")
    const [rememberDevice, setRememberDevice] = useState(true)
    const [rememberDuration, setRememberDuration] = useState('30')

    const handleBack = () => {
        router.push(`/tenant/${slug}/login`)
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setTimeout(() => {
            setIsLoading(false)
            alert(`Learner Login: ${studentNumber}\nRemember: ${rememberDuration} days`)
        }, 1000)
    }

    return (
        <div className="bg-[#f6f7f8] dark:bg-[#101922] text-[#0d141b] dark:text-slate-100 min-h-screen flex flex-col font-display transition-colors duration-300">
            {/* Header - consistent */}
            <header className="flex items-center justify-between p-4 sticky top-0 bg-[#f6f7f8]/80 dark:bg-[#101922]/80 backdrop-blur-md z-10">
                <button
                    onClick={handleBack}
                    className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors"
                    aria-label="Back"
                >
                    <span className="material-symbols-outlined text-2xl">chevron_left</span>
                </button>
                <div className="flex items-center gap-1">
                    <ThemeToggle />
                    <button
                        onClick={() => setShowHelp(true)}
                        className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors"
                        aria-label="Help"
                    >
                        <span className="material-symbols-outlined text-2xl">help_outline</span>
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center px-6 pb-8 max-w-md mx-auto w-full">
                {/* Icon */}
                <div className="mt-8 mb-5 h-14 w-14 bg-primary rounded-2xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-3xl">school</span>
                </div>

                {/* Headline */}
                <h1 className="text-2xl font-bold tracking-tight text-center">
                    Learner Sign In
                </h1>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 text-center">
                    Enter your student number and PIN.
                </p>

                {/* Form */}
                <form onSubmit={handleLogin} className="w-full max-w-sm mt-8 space-y-4">
                    {/* Student Number with icon */}
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xl">
                            badge
                        </span>
                        <input
                            type="text"
                            value={studentNumber}
                            onChange={(e) => setStudentNumber(e.target.value)}
                            placeholder="Student number"
                            className="w-full h-14 rounded-xl bg-slate-100 dark:bg-slate-800 px-5 pl-12 text-base border-none focus:ring-2 focus:ring-primary/20 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none"
                            autoFocus
                            required
                        />
                    </div>

                    {/* PIN with icon + show/hide */}
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xl">
                            pin
                        </span>
                        <input
                            type={showPin ? "text" : "password"}
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            placeholder="PIN"
                            className="w-full h-14 rounded-xl bg-slate-100 dark:bg-slate-800 px-5 pl-12 pr-16 text-base border-none focus:ring-2 focus:ring-primary/20 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none tracking-widest"
                            maxLength={6}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPin(!showPin)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-primary font-medium text-xs uppercase tracking-wide hover:opacity-80"
                        >
                            {showPin ? 'Hide' : 'Show'}
                        </button>
                    </div>

                    {/* Remember Device */}
                    <div className="space-y-3 pt-2">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${rememberDevice ? 'bg-primary border-primary' : 'border-slate-300 dark:border-slate-600'
                                }`}>
                                {rememberDevice && <span className="material-symbols-outlined text-white text-sm">check</span>}
                            </div>
                            <input
                                type="checkbox"
                                className="hidden"
                                checked={rememberDevice}
                                onChange={() => setRememberDevice(!rememberDevice)}
                            />
                            <span className="text-sm text-slate-600 dark:text-slate-300">Remember this device</span>
                        </label>

                        {rememberDevice && (
                            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                                {['7', '30', '90'].map((d) => (
                                    <button
                                        key={d}
                                        type="button"
                                        onClick={() => setRememberDuration(d)}
                                        className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${rememberDuration === d
                                                ? 'bg-white dark:bg-slate-700 text-primary shadow-sm'
                                                : 'text-slate-500 hover:text-slate-700'
                                            }`}
                                    >
                                        {d} days
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isLoading || !studentNumber || pin.length < 4}
                        className="w-full h-14 bg-primary text-white font-semibold rounded-xl active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading ? 'Signing in...' : (
                            <>
                                <span>Continue</span>
                                <span className="material-symbols-outlined text-xl">arrow_forward</span>
                            </>
                        )}
                    </button>
                </form>
            </main>

            <AuthFooter />

            <HelpPopup isOpen={showHelp} onClose={() => setShowHelp(false)} />
        </div>
    )
}
