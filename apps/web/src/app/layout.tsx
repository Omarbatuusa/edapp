import type { Metadata } from "next";
import { Lexend } from "next/font/google"; // Use Lexend instead of Inter
import "./globals.css";
import Providers from "./providers";

const lexend = Lexend({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EdApp",
  description: "School Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to Google Fonts for faster loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Material Symbols with display=block to prevent text flash */}
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=block" rel="stylesheet" />
      </head>
      <body className={lexend.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
