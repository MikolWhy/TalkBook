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
// TODO: update layout
// - Import PinGate component
// - Wrap children with <PinGate>
// - Update metadata (title, description, manifest)
// - Add viewport export with themeColor
// - Keep font setup (Geist Sans and Mono)

// Minimal blank layout for now - just wraps children
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
