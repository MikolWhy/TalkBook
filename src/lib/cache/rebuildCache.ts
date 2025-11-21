// Utility to rebuild cached metadata for all entries
// Use this when extraction logic changes to update old entries

import { getEntries, saveEntries } from "./entriesCache";
import { extractMetadata } from "../nlp/extract";

/**
 * Re-extract metadata for all entries
 * This updates cached extractedPeople, extractedTopics, extractedDates
 * Use when NLP logic changes to fix old entries
 */
export async function rebuildAllMetadata(): Promise<{ updated: number; failed: number }> {
  console.log("🔄 [Rebuild Cache] Starting metadata rebuild for all entries...");
  
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
          extractedDates: metadata.dates,
        };
      } catch (error) {
        console.error(`❌ [Rebuild] Failed for entry ${entry.id}:`, error);
        failed++;
        return entry;
      }
    })
  );
  
  saveEntries(updatedEntries);
  console.log(`✅ [Rebuild Cache] Complete! Updated: ${updated}, Failed: ${failed}`);
  
  return { updated, failed };
}

