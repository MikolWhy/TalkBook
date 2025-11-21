// Centralized localStorage cache for journal entries
// Eliminates redundant JSON.parse() calls across the application
// Performance optimization: Parse once, cache in memory, invalidate on changes

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood: string | null;
  tags: string[];
  cardColor?: string;
  journalId?: string;
  createdAt: string;
  updatedAt: string;
  draft?: boolean;
  promptIds?: string[];
  extractedPeople?: string[];
  extractedTopics?: string[];
  extractedDates?: Date[];
}

// In-memory cache
let entriesCache: JournalEntry[] | null = null;
let cacheVersion = 0;

// Storage keys
const ENTRIES_KEY = "journalEntries";
const CACHE_VERSION_KEY = "entriesCacheVersion";

// Get cache version from localStorage
function getCacheVersion(): number {
  if (typeof window === "undefined") return 0;
  const stored = localStorage.getItem(CACHE_VERSION_KEY);
  return stored ? parseInt(stored, 10) : 0;
}

// Increment cache version to invalidate cache
function incrementCacheVersion(): void {
  if (typeof window === "undefined") return;
  const newVersion = getCacheVersion() + 1;
  localStorage.setItem(CACHE_VERSION_KEY, newVersion.toString());
  cacheVersion = newVersion;
}

/**
 * Get all journal entries from cache or localStorage
 * OPTIMIZATION: Only parses JSON once, then caches in memory
 */
export function getEntries(): JournalEntry[] {
  if (typeof window === "undefined") return [];
  
  // Check if cache is valid
  const storedVersion = getCacheVersion();
  if (entriesCache !== null && cacheVersion === storedVersion) {
    console.log("✅ [Cache Hit] Using cached entries, skipping parse");
    return entriesCache;
  }
  
  // Cache miss or invalidated - parse from localStorage
  console.log("⚠️ [Cache Miss] Parsing entries from localStorage");
  try {
    const stored = localStorage.getItem(ENTRIES_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    entriesCache = parsed;
    cacheVersion = storedVersion;
    return parsed;
  } catch (error) {
    console.error("Error parsing entries from localStorage:", error);
    entriesCache = [];
    return [];
  }
}

/**
 * Save entries to localStorage and update cache
 * OPTIMIZATION: Updates cache immediately, no need to re-parse
 */
export function saveEntries(entries: JournalEntry[]): void {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
    entriesCache = entries; // Update cache immediately
    incrementCacheVersion(); // Invalidate cache in other tabs/windows
    console.log("✅ [Cache Update] Saved entries and updated cache");
  } catch (error) {
    console.error("Error saving entries to localStorage:", error);
  }
}

/**
 * Add a new entry
 * OPTIMIZATION: Appends to cache without re-parsing
 */
export function addEntry(entry: JournalEntry): void {
  const entries = getEntries();
  const updatedEntries = [...entries, entry];
  saveEntries(updatedEntries);
}

/**
 * Update an existing entry
 * OPTIMIZATION: Updates cache directly
 */
export function updateEntry(entryId: string, updates: Partial<JournalEntry>): boolean {
  const entries = getEntries();
  const entryIndex = entries.findIndex(e => e.id === entryId);
  
  if (entryIndex === -1) {
    console.error("Entry not found:", entryId);
    return false;
  }
  
  entries[entryIndex] = { ...entries[entryIndex], ...updates };
  saveEntries(entries);
  return true;
}

/**
 * Delete an entry
 * OPTIMIZATION: Updates cache directly
 */
export function deleteEntry(entryId: string): boolean {
  const entries = getEntries();
  const updatedEntries = entries.filter(e => e.id !== entryId);
  
  if (updatedEntries.length === entries.length) {
    console.error("Entry not found:", entryId);
    return false;
  }
  
  saveEntries(updatedEntries);
  return true;
}

/**
 * Get a single entry by ID
 * OPTIMIZATION: Uses cached entries
 */
export function getEntryById(entryId: string): JournalEntry | null {
  const entries = getEntries();
  return entries.find(e => e.id === entryId) || null;
}

/**
 * Invalidate cache manually (useful for debugging or external changes)
 */
export function invalidateCache(): void {
  entriesCache = null;
  incrementCacheVersion();
  console.log("🔄 [Cache Invalidated] Cache cleared");
}

/**
 * Get cache statistics for debugging
 */
export function getCacheStats() {
  return {
    isCached: entriesCache !== null,
    cacheSize: entriesCache?.length || 0,
    cacheVersion,
    storedVersion: getCacheVersion()
  };
}

