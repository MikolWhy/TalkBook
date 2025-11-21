"use client";

//This componenet is the actual UI component (the actual sidebar itself)

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "./SidebarProvider";
import { useState, useEffect } from "react";

// Navigation items - shared across all pages
const navItems = [
  { label: "Home", href: "/", icon: "🏠" },
  { label: "Journal", href: "/journal", icon: "📝" },
  { label: "Habits", href: "/habits", icon: "✅" },
  { label: "Stats", href: "/stats", icon: "📊" },
  { label: "Settings", href: "/settings", icon: "⚙️" },
  { label: "Help", href: "/help", icon: "❓" },
];

// Profile section component to handle localStorage
function ProfileSection() {
  const [userName, setUserName] = useState("Your Name");
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  useEffect(() => {
    // Load user data from localStorage
    const savedName = localStorage.getItem("userName");
    const savedPicture = localStorage.getItem("userProfilePicture");
    
    if (savedName) setUserName(savedName);
    if (savedPicture) setProfilePicture(savedPicture);

    // Listen for storage changes
    const handleStorageChange = () => {
      const newName = localStorage.getItem("userName");
      const newPicture = localStorage.getItem("userProfilePicture");
      if (newName) setUserName(newName);
      else setUserName("Your Name");
      setProfilePicture(newPicture);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <div className="px-6 py-4 border-b border-gray-200">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
          {profilePicture ? (
            <img 
              src={profilePicture} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500"></div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate">
            {userName}
          </p>
        </div>
      </div>
    </div>
  );
}

// Lock button component to handle localStorage
function LockButton() {
  const [hasPassword, setHasPassword] = useState(false);

  useEffect(() => {
    setHasPassword(!!localStorage.getItem("appPassword"));

    const handleStorageChange = () => {
      setHasPassword(!!localStorage.getItem("appPassword"));
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleLock = () => {
    if (hasPassword) {
      localStorage.setItem("appLocked", "true");
      window.location.reload();
    }
  };

  return (
    <div className="mt-4">
      <button
        onClick={handleLock}
        disabled={!hasPassword}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
          hasPassword
            ? "text-gray-600 hover:bg-gray-100"
            : "text-gray-400 bg-gray-50 cursor-not-allowed"
        }`}
        title={!hasPassword ? "Set a password in Settings first" : "Lock app"}
      >
        <span>🔒</span>
        <span>Lock App</span>
      </button>
    </div>
  );
}

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
        <ProfileSection />

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

          {/* Lock Button */}
          <LockButton />
        </nav>

        {/* Scroll Indicator */}
        <div className="px-6 py-4 border-t border-gray-200 text-center">
          <span className="text-gray-400">▼</span>
        </div>
      </aside>
    </>
  );
}

