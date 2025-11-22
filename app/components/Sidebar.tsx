"use client";

//This componenet is the actual UI component (the actual sidebar itself)

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "./SidebarProvider";
import { useState, useEffect } from "react";
import { BookHeart, Home, Dumbbell, BarChart, ArrowLeftFromLine, SettingsIcon, HelpCircleIcon, Zap } from "lucide-react";
// Navigation items - shared across all pages
const navItems = [
  { label: "home", href: "/", icon: Home },
  { label: "journal", href: "/journal", icon: BookHeart },
  { label: "habits", href: "/habits", icon: Dumbbell },
  { label: "stats", href: "/stats", icon: BarChart },
  { label: "settings", href: "/settings", icon: SettingsIcon },
  { label: "help", href: "/help", icon: HelpCircleIcon },
];

// Profile section component to handle localStorage
function ProfileSection() {
  const [userName, setUserName] = useState("your name");
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
      else setUserName("your name");
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

// Compact XP Progress component for sidebar
function CompactXPProgress() {
  const [stats, setStats] = useState({
    totalXP: 0,
    level: 1,
    currentLevelXP: 0,
    nextLevelXP: 500,
    progress: 0,
  });

  useEffect(() => {
    const loadStats = () => {
      const { getUserStats } = require("../../src/lib/gamification/xp");
      const userStats = getUserStats();
      setStats(userStats);
    };

    loadStats();

    const handleXPUpdate = () => {
      loadStats();
    };

    window.addEventListener("xp-updated", handleXPUpdate);

    return () => {
      window.removeEventListener("xp-updated", handleXPUpdate);
    };
  }, []);

  return (
    <div className="px-6 py-4 border-b border-gray-200">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-semibold text-gray-900">Level {stats.level}</span>
          </div>
          <span className="text-xs text-gray-600">{stats.totalXP.toLocaleString()} XP</span>
        </div>
        <div className="relative">
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700"
              style={{ width: `${Math.min(stats.progress, 100)}%` }}
            />
          </div>
        </div>
        <p className="text-xs text-gray-500">
          {stats.currentLevelXP.toLocaleString()} / {stats.nextLevelXP.toLocaleString()} XP
        </p>
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
        <span>lock app</span>
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
        className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 z-10 flex flex-col ${sidebarOpen ? "w-64" : "w-0"
          } transition-all overflow-hidden`}
      >
        {/* Logo Section with Toggle Button */}
        <div className="px-6 py-6 border-b border-gray-200 flex items-center justify-between">
          <h1
            className={`text-2xl font-bold text-gray-900 transition-opacity ${sidebarOpen ? "opacity-100" : "opacity-0"
              }`}
          >
            talkbook
          </h1>
          {/* Toggle Button - Inside sidebar header when open */}
          {sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
            >
              <ArrowLeftFromLine className="w-5 h-5 text-gray-600" />
            </button>
          )}
        </div>

        {/* User Profile Section */}
        <ProfileSection />

        {/* XP Progress Section */}
        <CompactXPProgress />

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
                  <span>{typeof item.icon === "string" ? item.icon : <item.icon />}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Lock Button */}
          <LockButton />
        </nav>

        {/* Scroll Indicator */}
        {/* <div className="px-6 py-4 border-t border-gray-200 text-center">
          <span className="text-gray-400">▼</span>
        </div> */}
      </aside>
    </>
  );
}

