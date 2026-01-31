"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    // Don't render anything until mounted to prevent hydration mismatch
    if (!mounted) {
        return (
            <div className="size-10 flex items-center justify-center">
                <div className="size-5 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
            </div>
        )
    }

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark")
    }

    return (
        <button
            onClick={toggleTheme}
            className="text-[#0d141b] dark:text-white flex size-10 shrink-0 items-center justify-center cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
            <span className="material-symbols-outlined" aria-hidden="true">
                {theme === "dark" ? "light_mode" : "dark_mode"}
            </span>
        </button>
    )
}
