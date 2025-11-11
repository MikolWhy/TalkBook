// pin security system - handles pin hashing, verification, and storage
// uses web crypto api for secure hashing (sha-256)
//
// WHAT WE'RE CREATING:
// - Functions to securely store and verify PIN codes
// - PINs are hashed (never stored in plain text) for security
// - Used by PinGate component to lock/unlock the app
// - All PIN operations happen client-side (no server needed)
//
// OWNERSHIP:
// - Aadil implements this completely
//
// COORDINATION NOTES:
// - Used by PinGate.tsx component (Aadil creates)
// - Used by uiStore.ts for PIN lock state (Aadil creates)
// - Used by app/settings/page.tsx for PIN management (Aadil creates)
//
// CONTEXT FOR AI ASSISTANTS:
// - PINs are NEVER stored in plain text - always hashed
// - Uses Web Crypto API (built into browsers) for secure hashing
// - Hash is stored in localStorage (not IndexedDB) for security separation
// - PIN verification happens client-side (no server needed)
//
// SECURITY NOTES:
// - SHA-256 is a one-way hash function (can't reverse to get original PIN)
// - Even if someone accesses localStorage, they can't get the original PIN
// - PIN must be at least 4 digits and numeric only
// - Each PIN is hashed independently (no salt needed for this use case)
//
// DEVELOPMENT NOTES:
// - All functions are async because Web Crypto API is async
// - Validate PIN format before hashing (length, numeric only)
// - Clear PIN input after verification attempts
// - Consider rate limiting for failed attempts (future enhancement)
//
// TODO: implement all pin functions
//
// - hashPin(pin: string): hash a PIN using SHA-256, return hex string
// - setPin(pin: string): validate, hash, and store PIN in localStorage
// - verifyPin(pin: string): hash entered PIN and compare with stored hash
// - isPinSet(): check if PIN exists in localStorage
// - removePin(): delete PIN hash from localStorage
//
// SYNTAX:
// async function hashPin(pin: string): Promise<string> {
//   const encoder = new TextEncoder();
//   const data = encoder.encode(pin);
//   const hashBuffer = await crypto.subtle.digest("SHA-256", data);
//   // convert to hex string
// }
//
// STORAGE KEY: "talkbook_pin_hash" (localStorage)

// TODO: implement pin security functions

