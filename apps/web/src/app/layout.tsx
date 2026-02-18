import type { Metadata, Viewport } from "next";
import { Lexend } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const lexend = Lexend({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EdApp",
  description: "School Management System",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  interactiveWidget: 'resizes-content',
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
        {/* Mobile viewport height script - must run before render */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function setAppVh() {
                  var vh = window.innerHeight * 0.01;
                  document.documentElement.style.setProperty('--app-vh', vh + 'px');
                }
                setAppVh();
                window.addEventListener('resize', setAppVh);
                if (window.visualViewport) {
                  window.visualViewport.addEventListener('resize', setAppVh);
                }
              })();
            `,
          }}
        />
      </head>
      <body className={lexend.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
