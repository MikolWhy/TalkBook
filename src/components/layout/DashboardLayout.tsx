"use client";

import { ReactNode } from "react";
import AppSidebar from "./AppSidebar";
import { useSidebar } from "@/components/providers/SidebarProvider";

/**
 * Dashboard Layout
 * 
 * Shared UI wrapper for all dashboard-style pages. 
 * Manages the high-level arrangement of the sidebar and main content area.
 * 
 * @module src/components/layout/DashboardLayout.tsx
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
    const { sidebarOpen } = useSidebar();

    return (
        <div className="min-h-screen flex" style={{ backgroundColor: "var(--background, #ffffff)" }}>
            <AppSidebar />
            <main
                className={`${sidebarOpen ? "ml-64" : "ml-0"
                    } flex-1 p-8 transition-all ${!sidebarOpen ? "pt-20" : "pt-8"}`}
            >
                {children}
            </main>
        </div>
    );
}
