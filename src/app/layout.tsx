import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "AgentCalc Pro — Real Estate Agent Calculator Suite",
  description:
    "Professional calculator suite for real estate agents. Loan calculator, commission calculator, ROI, amortization, and more. Free to start!",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AgentCalc Pro",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    title: "AgentCalc Pro — Real Estate Calculator Suite",
    description: "12 professional calculators for real estate agents. Loan, mortgage, commission, ROI, and more.",
    siteName: "AgentCalc Pro",
  },
  twitter: {
    card: "summary_large_image",
    title: "AgentCalc Pro — Real Estate Calculator Suite",
    description: "12 professional calculators for real estate agents.",
  },
  keywords: [
    "real estate calculator",
    "loan calculator",
    "mortgage calculator",
    "commission calculator",
    "Philippines real estate",
    "property calculator",
    "ROI calculator",
    "amortization schedule",
  ],
};

export const viewport: Viewport = {
  themeColor: "#1e40af",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="AgentCalc" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#1e40af" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body className="bg-gray-50 text-gray-900 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
