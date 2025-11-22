"use client";


//This component is the layout wrapper, for each page -> combines sidebar and content so both show, NOT just content.

import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import { useSidebar } from "./SidebarProvider";

// This wraps all page content and ensures consistent layout
export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { sidebarOpen } = useSidebar();

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "var(--background, #ffffff)" }}>
      <Sidebar />
      <main
        className={`${
          sidebarOpen ? "ml-64" : "ml-0"
        } flex-1 p-8 transition-all ${!sidebarOpen ? "pt-20" : "pt-8"}`}
      >
        {children}
      </main>
    </div>
  );
}

