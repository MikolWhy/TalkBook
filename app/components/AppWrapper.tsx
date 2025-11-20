"use client";

import { SidebarProvider } from "./SidebarProvider";
import PinGate from "@/components/PinGate";

export default function AppWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <PinGate>{children}</PinGate>
    </SidebarProvider>
  );
}

