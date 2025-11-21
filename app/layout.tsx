// Root Layout - Original Next.js Starter Code
//
// This is the root layout that wraps all pages in your app.
// Next.js requires this file - it sets up the HTML structure, fonts, and metadata.
//
// WHAT THIS FILE DOES:
// - Wraps all pages with <html> and <body> tags
// - Sets up fonts (Geist Sans and Geist Mono)
// - Defines metadata (title, description) for SEO
// - Imports global CSS styles
//
// LATER: We'll add PinGate component here to protect all pages with PIN

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SidebarProvider } from "./components/SidebarProvider";
import LockScreen from "./components/LockScreen";

// ============================================================================
// FONT SETUP
// ============================================================================
//
// Geist fonts = modern, clean fonts from Vercel
// - Geist Sans = for body text (main font)
// - Geist Mono = for code/monospace text
//
// next/font/google = Next.js optimizes fonts automatically
// - Downloads fonts at build time
// - Self-hosts fonts (faster than Google Fonts CDN)
// - Zero layout shift (fonts are optimized)

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ============================================================================
// METADATA (SEO)
// ============================================================================
//
// Metadata = information about your page (for search engines, social media)
// - title = shows in browser tab
// - description = shows in search results
//
// export const metadata = ... = Next.js uses this for SEO

export const metadata: Metadata = {
  title: "TalkBook",
  description: "Your personal journaling companion",
};

// ============================================================================
// ROOT LAYOUT COMPONENT
// ============================================================================
//
// RootLayout = wraps every page in your app
// - children = the page content (automatically passed by Next.js)
//
// Props type:
// - { children: React.ReactNode } = TypeScript type for props
// - React.ReactNode = can be any React element (component, text, etc.)
//
// Return:
// - Must return <html> and <body> tags
// - className = applies font variables to use Geist fonts
// - suppressHydrationWarning = prevents hydration warnings from browser extensions
//
// WHY suppressHydrationWarning?
// Browser extensions (like Grammarly, ad blockers, etc.) inject attributes into <body>
// This causes server HTML to not match client HTML, triggering hydration errors
// suppressHydrationWarning tells React: "Ignore mismatches on this element, it's expected"
// This is safe because browser extensions commonly modify the body tag

// ============================================================================
// FUNCTION SIGNATURE EXPLANATION (Lines 78-82)
// ============================================================================
//
// SYNTAX BREAKDOWN:
// export default function RootLayout({ children }: Type) { ... }
//
// Let's break this down piece by piece:
//
// 1. export default
//    - export = makes this function available to other files
//    - default = this is the main export (Next.js looks for this)
//
// 2. function RootLayout
//    - function = JavaScript function keyword
//    - RootLayout = function name (must start with capital - React convention)
//
// 3. ({ children })
//    - This is DESTRUCTURING - extracting properties from an object
//    - Instead of: function RootLayout(props) { props.children }
//    - We write: function RootLayout({ children }) { children }
//    - children = the page content Next.js passes to this component
//
// 4. : Readonly<{ children: React.ReactNode; }>
//    - This is TypeScript TYPE ANNOTATION (tells TypeScript what data to expect)
//    - : = "this parameter has this type"
//    - Readonly<...> = makes the object read-only (can't be modified)
//    - { children: React.ReactNode; } = object with one property:
//      - children = property name
//      - React.ReactNode = type (can be any React element, text, component, etc.)
//    - The weird brackets {} inside <> are TypeScript GENERICS syntax
//      - Readonly is a generic type that takes another type as input
//      - Think of it like: Readonly<YourTypeHere>
//
// WHY THE WEIRD BRACKET PLACEMENT?
// - ({ children }: Type) = destructuring + type annotation
// - The : comes AFTER the destructuring, not before
// - This is TypeScript syntax: destructure first, then specify the type
//
// ALTERNATIVE SYNTAX (easier to read but longer):
// function RootLayout(props: Readonly<{ children: React.ReactNode }>) {
//   const { children } = props;
//   ...
// }
// But destructuring in parameters is cleaner!

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // ========================================================================
  // RETURN STATEMENT (Lines 83-92)
  // ========================================================================
  //
  // return = what the component displays
  // JSX = HTML-like syntax (but it's actually JavaScript)
  
  return (
    // ====================================================================
    // HTML TAG (Line 84)
    // ====================================================================
    // <html lang="en">
    // - <html> = root HTML element (required by Next.js)
    // - lang="en" = language attribute (tells browsers/search engines it's English)
    
    <html lang="en">
      
      {/* ================================================================
          BODY TAG (Lines 85-90)
          ================================================================
          
          TEMPLATE LITERAL SYNTAX (Line 86):
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          
          Breaking it down:
          - className = HTML attribute (React uses className instead of class)
          - Backticks `` = TEMPLATE LITERAL (allows inserting variables)
          - ${variable} = inserts the value of the variable
          
          Step by step:
          1. geistSans.variable = "--font-geist-sans" (CSS variable name)
          2. geistMono.variable = "--font-geist-mono" (CSS variable name)
          3. antialiased = Tailwind class (makes text smoother)
          
          After JavaScript processes it, becomes:
          className="--font-geist-sans --font-geist-mono antialiased"
          
          WHY BACKTICKS INSTEAD OF QUOTES?
          - Regular quotes: "text" = just text, can't insert variables
          - Template literals: `text ${variable}` = can insert variables
          - Example:
            const name = "John";
            "Hello " + name        // Old way (concatenation)
            `Hello ${name}`        // New way (template literal)
          
          MULTI-LINE ATTRIBUTES:
          React/JSX allows attributes to span multiple lines for readability
          The browser/React doesn't care about line breaks in attributes
      */}
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {/* ================================================================
            SIDEBAR PROVIDER
            ================================================================
            
            SidebarProvider wraps all pages to provide sidebar state globally
            - Manages sidebar open/closed state
            - Available to all pages via useSidebar() hook
        */}
        <SidebarProvider>
          <LockScreen />
          {/* ================================================================
              CHILDREN PROP
              ================================================================
              
              {children}
              - { } = JSX expression (inserts JavaScript value)
              - children = the page content passed from Next.js
              - This is where your page.tsx content gets inserted!
              
              HOW IT WORKS:
              - Next.js automatically passes page content as "children"
              - When you visit "/", it passes <HomePage /> as children
              - When you visit "/journal", it passes <JournalPage /> as children
              - This is how the layout wraps all pages
          */}
          {children}
        </SidebarProvider>
      </body>
    </html>
  );
}
