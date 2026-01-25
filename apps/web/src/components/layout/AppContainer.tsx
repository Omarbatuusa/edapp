import { ReactNode } from "react"

interface AppContainerProps {
    children: ReactNode
    className?: string
    gradient?: boolean
}

export default function AppContainer({
    children,
    className = "",
    gradient = true
}: AppContainerProps) {
    return (
        <div className={`app-page ${gradient ? 'bg-app-gradient' : ''} ${className}`}>
            <div className="app-container">
                {children}
            </div>
        </div>
    )
}
