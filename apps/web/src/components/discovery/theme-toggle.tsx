"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return <div className="size-10" /> // Placeholder to prevent layout shift
    }

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark")
    }

    return (
        <button
            onClick={toggleTheme}
            className="text-[#0d141b] dark:text-white flex size-10 shrink-0 items-center justify-center cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors"
            title="Toggle Theme"
        >
            <span className="material-symbols-outlined">
                {theme === "dark" ? "light_mode" : "dark_mode"}
            </span>
        </button>
    )
}
