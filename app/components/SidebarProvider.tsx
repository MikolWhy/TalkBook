"use client";


//This component keeps state across all pagesand available (eg: sidebaropen true/false)
//but doesn't render the actual UI, that's what dashboardLayout.tsx does.
import { createContext, useContext, useState, ReactNode } from "react";

// Context for sidebar state management
// This allows any component to access and control the sidebar state
interface SidebarContextType {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

// Provider component that wraps the app and manages sidebar state
export function SidebarProvider({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <SidebarContext.Provider value={{ sidebarOpen, setSidebarOpen, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
}

// Hook to use sidebar context in any component
export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}

