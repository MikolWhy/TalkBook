"use client";

//This componenet is the actual UI component (the actual sidebar itself)

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "./SidebarProvider";

// Navigation items - shared across all pages
const navItems = [
  { label: "Home", href: "/", icon: "🏠" },
  { label: "Journal", href: "/journal", icon: "📝" },
  { label: "Habits", href: "/habits", icon: "✅" },
  { label: "Stats", href: "/stats", icon: "📊" },
];

const insightItems = [
  { label: "Article", href: "/articles", icon: "📰", badge: "New" },
  { label: "Bookmark", href: "/bookmarks", icon: "🔖" },
];

export default function Sidebar() {
  const { sidebarOpen, setSidebarOpen } = useSidebar();
  const pathname = usePathname(); // Get current route to highlight active nav item

  return (
    <>
      {/* Toggle Button - Fixed at top-left when sidebar is closed */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-4 left-4 z-30 p-2.5 bg-white border border-gray-300 rounded-lg shadow-md hover:bg-gray-50 hover:shadow-lg transition-all"
          aria-label="Open sidebar"
          title="Open sidebar"
        >
          {/* Change text-gray-700 to any color you want (e.g., text-blue-600, text-purple-500) */}
          <span className="text-xl text-gray-700">☰</span>
        </button>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 z-10 flex flex-col ${
          sidebarOpen ? "w-64" : "w-0"
        } transition-all overflow-hidden`}
      >
        {/* Logo Section with Toggle Button */}
        <div className="px-6 py-6 border-b border-gray-200 flex items-center justify-between">
          <h1
            className={`text-2xl font-bold text-gray-900 transition-opacity ${
              sidebarOpen ? "opacity-100" : "opacity-0"
            }`}
          >
            TalkBook
          </h1>
          {/* Toggle Button - Inside sidebar header when open */}
          {sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
            >
              <span className="text-xl text-gray-600">←</span>
            </button>
          )}
        </div>

        {/* User Profile Section */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-xl">👤</span>
              </div>
              <div className="absolute -bottom-1 -right-1 bg-yellow-400 rounded-full w-5 h-5 flex items-center justify-center">
                <span className="text-xs">👑</span>
              </div>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Your Name</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-4 overflow-y-auto">
          <div className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    isActive
                      ? "flex items-center gap-3 px-4 py-3 bg-gray-900 text-white rounded-lg"
                      : "flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                  }
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Separator */}
          <div className="border-t border-gray-200 my-4"></div>

          {/* Insight Section */}
          <div className="flex flex-col gap-1">
            <p className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Insight</p>
            {insightItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                <div className="flex items-center gap-3">
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </nav>

        {/* Scroll Indicator */}
        <div className="px-6 py-4 border-t border-gray-200 text-center">
          <span className="text-gray-400">▼</span>
        </div>
      </aside>
    </>
  );
}

