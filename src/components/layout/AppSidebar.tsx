/**
 * App Sidebar
 * 
 * The primary navigation component for the application. 
 * 
 * Features:
 * - Dynamic route highlighting via Next.js `usePathname`.
 * - Integrated ProfileSection for user identity.
 * - Live XP progression bar and leveling stats.
 * - Global lock functionality for privacy.
 * - Responsive collapse state managed via `SidebarProvider`.
 * 
 * @module src/components/layout/AppSidebar.tsx
 */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/components/providers/SidebarProvider";
import { useState, useEffect } from "react";
import { BookHeart, Home, Dumbbell, BarChart, ArrowLeftFromLine, SettingsIcon, HelpCircleIcon, Zap, Lock as LockIcon } from "lucide-react";
import { getUserStats } from "@/lib/gamification/xp";
import { BACKGROUND_COLORS, type BackgroundColorKey } from "@/components/providers/BackgroundColorProvider";

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
            // Dynamic import to avoid issues if module isn't loaded yet? Or just standard require?
            // Using standard import would be better if possible, but keeping logic similar.
            // Changing to dynamic import or just standard import.
            // Since this is client side, let's use standard import if possible, but keep require if it was conditional.
            // However, require in useEffect is a bit odd practice for simple util.
            // I'll switch to a functional call if the module is available.
            // For now, I'll keep the dynamic require but cleanup the path.
            // Actually, better to import at top if it's not huge.
            // Let's use standard import.
            // Using standard import now
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
    const [hoverColor, setHoverColor] = useState<string>("rgb(243, 244, 246)");

    useEffect(() => {
        setHasPassword(!!localStorage.getItem("appPassword"));

        const handleStorageChange = () => {
            setHasPassword(!!localStorage.getItem("appPassword"));
        };

        const handleBackgroundColorChange = () => {
            const savedColor = localStorage.getItem("appBackgroundColor") as BackgroundColorKey | null;
            const colorKey = savedColor && savedColor in BACKGROUND_COLORS 
                ? savedColor 
                : "white";
            setHoverColor(getHoverColor(colorKey));
        };

        // Set initial hover color
        handleBackgroundColorChange();

        window.addEventListener("storage", handleStorageChange);
        window.addEventListener("background-color-changed", handleBackgroundColorChange);

        return () => {
            window.removeEventListener("storage", handleStorageChange);
            window.removeEventListener("background-color-changed", handleBackgroundColorChange);
        };
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
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${hasPassword
                    ? "text-gray-600"
                    : "text-gray-400 cursor-not-allowed"
                    }`}
                style={{ backgroundColor: "transparent" }}
                onMouseEnter={(e) => {
                    if (hasPassword) {
                        e.currentTarget.style.backgroundColor = hoverColor;
                    }
                }}
                onMouseLeave={(e) => {
                    if (hasPassword) {
                        e.currentTarget.style.backgroundColor = "transparent";
                    }
                }}
                title={!hasPassword ? "Set a password in Settings first" : "Lock app"}
            >
                <LockIcon className="w-4 h-4" />
                <span>lock app</span>
            </button>
        </div>
    );
}

// Function to get hover color based on background color theme
function getHoverColor(backgroundColorKey: BackgroundColorKey | null): string {
    const hoverColors: Record<BackgroundColorKey, string> = {
        white: "rgb(243, 244, 246)", // gray-100
        orange: "rgb(254, 215, 170)", // orange-200 - darker, more saturated orange
        pink: "rgb(251, 207, 232)", // pink-200 - darker, more saturated pink
        green: "rgb(187, 247, 208)", // green-200 - darker, more saturated green
        blue: "rgb(191, 219, 254)", // blue-200 - darker, more saturated blue
    };
    
    return hoverColors[backgroundColorKey || "white"];
}

export default function AppSidebar() {
    const { sidebarOpen, setSidebarOpen } = useSidebar();
    const pathname = usePathname(); // Get current route to highlight active nav item
    const [hoverColor, setHoverColor] = useState<string>("rgb(243, 244, 246)"); // Default gray-100

    // Get current background color and set hover color
    useEffect(() => {
        const updateHoverColor = () => {
            const savedColor = localStorage.getItem("appBackgroundColor") as BackgroundColorKey | null;
            const colorKey = savedColor && savedColor in BACKGROUND_COLORS 
                ? savedColor 
                : "white";
            setHoverColor(getHoverColor(colorKey));
        };

        updateHoverColor();

        // Listen for background color changes
        window.addEventListener("background-color-changed", updateHoverColor);
        window.addEventListener("storage", updateHoverColor);

        return () => {
            window.removeEventListener("background-color-changed", updateHoverColor);
            window.removeEventListener("storage", updateHoverColor);
        };
    }, []);

    return (
        <>
            {/* Toggle Button - Fixed at top-left when sidebar is closed */}
            {!sidebarOpen && (
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="fixed top-4 left-4 z-30 p-2.5 border border-gray-300 rounded-lg shadow-md hover:shadow-lg transition-all"
                    style={{ backgroundColor: "var(--background, #ffffff)" }}
                    aria-label="Open sidebar"
                    title="Open sidebar"
                >
                    <span className="text-xl text-gray-700">☰</span>
                </button>
            )}

            {/* Sidebar */}
            <aside
                className={`fixed left-0 top-0 h-full border-r border-gray-200 z-10 flex flex-col ${sidebarOpen ? "w-64" : "w-0"
                    } transition-all overflow-hidden`}
                style={{ backgroundColor: "var(--background, #ffffff)" }}
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
                            className="p-2 rounded-lg transition-colors"
                            style={{ backgroundColor: "transparent" }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = hoverColor;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "transparent";
                            }}
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
                                            : "flex items-center gap-3 px-4 py-3 text-gray-600 rounded-lg transition"
                                    }
                                    style={!isActive ? { 
                                        backgroundColor: "transparent",
                                    } : undefined}
                                    onMouseEnter={(e) => {
                                        if (!isActive) {
                                            e.currentTarget.style.backgroundColor = hoverColor;
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isActive) {
                                            e.currentTarget.style.backgroundColor = "transparent";
                                        }
                                    }}
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
            </aside>
        </>
    );
}
