// Utility to rebuild cached metadata for all entries
// Use this when extraction logic changes to update old entries
// Re-extracts all names/keywords from entries for fresh prompt generation

import { getEntries, saveEntries, invalidateCache } from "./entriesCache";
import { extractMetadata } from "../nlp/extract";

/**
 * Re-extract metadata for all entries
 * This updates cached extractedPeople, extractedTopics with fresh extraction
 * Used prompts remain marked as used (not cleared)
 * Use when NLP logic changes to fix old entries or to refresh extracted metadata
 */
export async function rebuildAllMetadata(): Promise<{ updated: number; failed: number }> {
  console.log("🔄 [Rebuild Cache] Starting metadata rebuild for all entries...");
  console.log("ℹ️ [Rebuild Cache] Note: Used prompts will remain marked as used");
  
  const entries = getEntries();
  let updated = 0;
  let failed = 0;
  
  const updatedEntries = await Promise.all(
    entries.map(async (entry) => {
      // Skip drafts
      if (entry.draft) {
        return entry;
      }
      
      try {
        console.log(`🔄 [Rebuild] Processing entry: ${entry.id}`);
        const metadata = await extractMetadata(entry.content);
        updated++;
        
        return {
          ...entry,
          extractedPeople: metadata.people,
          extractedTopics: metadata.topics,
          // Remove extractedDates since we no longer extract dates
          extractedDates: undefined,
        };
      } catch (error) {
        console.error(`❌ [Rebuild] Failed for entry ${entry.id}:`, error);
        failed++;
        return entry;
      }
    })
  );
  
  saveEntries(updatedEntries);
  
  // Invalidate cache to ensure fresh data is loaded
  invalidateCache();
  
  console.log(`✅ [Rebuild Cache] Complete! Updated: ${updated}, Failed: ${failed}`);
  console.log("✅ [Rebuild Cache] Metadata cache rebuilt - future entries will use fresh extraction");
  console.log("ℹ️ [Rebuild Cache] Used prompts remain marked as used (not cleared)");
  
  return { updated, failed };
}

