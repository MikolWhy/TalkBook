// pin gate component - protects app with pin verification
// shows pin entry screen when pin is set and not verified
//
// WHAT WE'RE CREATING:
// - A component that wraps the entire app and shows PIN screen when needed
// - Protects all pages - users must enter PIN to access journal entries and habits
// - Shows PIN input screen when PIN is set and not verified
// - Verifies PIN on submit, unlocks app on success
//
// OWNERSHIP:
// - Aadil implements this completely
//
// COORDINATION NOTES:
// - Used in app/layout.tsx to wrap all pages
// - Uses pin.ts functions (Aadil creates)
// - Uses uiStore.ts for PIN lock state (Aadil creates)
//
// CONTEXT FOR AI ASSISTANTS:
// - This component wraps the entire app and shows PIN screen when needed
// - Used in layout.tsx to protect all pages
// - Checks if PIN is set on mount, shows input screen if needed
// - Verifies PIN on submit, unlocks app on success
//
// DEVELOPMENT NOTES:
// - Component should check PIN status on mount and when PIN is set/removed
// - Listen to storage events to detect PIN changes in other tabs
// - Clear PIN input after failed attempts
// - Show error message for incorrect PIN
// - Auto-focus PIN input for better UX
//
// TODO: implement pin gate component
//
// FUNCTIONALITY:
// - Check if PIN is set on mount (use isPinSet from pin.ts)
// - Show PIN input screen if PIN is set and not verified
// - Handle PIN submission (verify with verifyPin from pin.ts)
// - Unlock app on successful verification
// - Show error on incorrect PIN
// - Listen to storage events for PIN changes
//
// UI:
// - Centered modal/screen with PIN input
// - Password input field (type="password")
// - Submit button
// - Error message display
// - Clean, minimal design
//
// SYNTAX:
// "use client";
// import { useEffect, useState } from "react";
// import { isPinSet, verifyPin } from "@/lib/security/pin";
// import { useUIStore } from "@/store/uiStore";
//
// export default function PinGate({ children }: { children: React.ReactNode }) {
//   const { isPinLocked, isPinVerified, setPinLocked, setPinVerified } = useUIStore();
//   // implementation
// }

"use client";

// TODO: implement pin gate component

