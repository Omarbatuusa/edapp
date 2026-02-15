"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"
import { AuthProvider } from "@/contexts/AuthContext"
import { ThemeProvider } from "next-themes"
import { IntlProvider } from "@/components/providers/IntlProvider"

export default function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000,
            },
        },
    }))

    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
                <AuthProvider>
                    <IntlProvider>
                        {children}
                    </IntlProvider>
                </AuthProvider>
            </ThemeProvider>
        </QueryClientProvider>
    )
}
