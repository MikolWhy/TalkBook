"use client";

import { SidebarProvider } from "./SidebarProvider";

export default function AppWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      {children}
    </SidebarProvider>
  );
}

