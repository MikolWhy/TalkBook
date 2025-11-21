// Blacklist management - prevent certain words from appearing in prompts/topics

const BLACKLIST_KEY = "talkbook-blacklist";

// Get blacklisted words
export function getBlacklist(): string[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(BLACKLIST_KEY);
  return stored ? JSON.parse(stored) : [];
}

// Add word to blacklist
export function addToBlacklist(word: string): void {
  if (typeof window === "undefined") return;
  
  const blacklist = getBlacklist();
  const normalized = word.trim().toLowerCase();
  
  if (normalized && !blacklist.includes(normalized)) {
    blacklist.push(normalized);
    localStorage.setItem(BLACKLIST_KEY, JSON.stringify(blacklist));
  }
}

// Remove word from blacklist
export function removeFromBlacklist(word: string): void {
  if (typeof window === "undefined") return;
  
  const blacklist = getBlacklist();
  const normalized = word.toLowerCase();
  const filtered = blacklist.filter(w => w !== normalized);
  
  localStorage.setItem(BLACKLIST_KEY, JSON.stringify(filtered));
}

// Check if word is blacklisted (case-insensitive)
export function isBlacklisted(word: string): boolean {
  const blacklist = getBlacklist();
  return blacklist.includes(word.toLowerCase());
}

// Clear all blacklisted words
export function clearBlacklist(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(BLACKLIST_KEY);
}

