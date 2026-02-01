import { Metadata } from "next"
import AuthBrokerLayoutClient from "./AuthBrokerLayoutClient"

export const metadata: Metadata = {
    title: 'EdApp Authentication',
    description: 'Secure authentication for EdApp',
    robots: 'noindex, nofollow'
}

export default function AuthBrokerLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <AuthBrokerLayoutClient>{children}</AuthBrokerLayoutClient>
}
