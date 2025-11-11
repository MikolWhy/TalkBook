// root layout component - wraps entire app
// provides pin gate protection, global styles, and metadata
//
// WHAT WE'RE CREATING:
// - The root layout that wraps all pages in the app
// - Includes PinGate component to protect all pages with PIN
// - Sets up fonts, global styles, and PWA metadata
// - Required by Next.js - every page uses this layout
//
// OWNERSHIP:
// - Aadil implements this completely
//
// COORDINATION NOTES:
// - Uses PinGate component (Aadil creates)
// - No conflicts - Aadil owns this entirely
//
// CONTEXT FOR AI ASSISTANTS:
// - This is the root layout for all pages in Next.js App Router
// - Wraps all pages with PinGate for security
// - Sets up fonts, global styles, and metadata
// - Required by Next.js - every page uses this layout
//
// DEVELOPMENT NOTES:
// - Wrap children with PinGate component
// - Include global CSS file
// - Set up fonts (Geist Sans and Mono from Next.js)
// - Configure metadata for PWA (manifest, theme color)
// - Separate viewport export (Next.js 16 requirement)
//
// TODO: update layout
// - Import PinGate component
// - Wrap children with <PinGate>
// - Update metadata (title, description, manifest)
// - Add viewport export with themeColor
// - Keep font setup (Geist Sans and Mono)

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// TODO: import PinGate from "@/components/PinGate";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TalkBook - Local Journal & Habits",
  description: "Privacy-first journaling and habit tracking PWA",
  manifest: "/manifest.json",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#3b82f6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* TODO: wrap with PinGate */}
        {children}
      </body>
    </html>
  );
}
