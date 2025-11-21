# Code Cleanup & Bug Fixes Summary

## 🐛 **Bug Fix: "Michael Michael"**

### **The Issue:**
Repeated names like "Michael michael" were being extracted as a single entity "Michael Michael".

### **The Fix:**
Updated the normalization logic in `src/lib/nlp/extract.ts`.
- **Before:** Capitalized words but didn't check for duplicates within the string.
- **After:** Now splits the name into words and deduplicates them (case-insensitive).
  - "Michael michael" → "Michael"
  - "Mary Jane" → "Mary Jane" (preserved)

---

## 🧹 **Code Cleanup**

### **Removed Unused Code:**
1. **Debug Logs:** Removed all `console.log` statements from extraction and prompt generation.
2. **Testing UI:** Removed the "Reset Used Prompts" button and debug display from the New Entry page.
3. **Unused Functions:** Removed `clearUsedPrompts` and `getUsedPromptsCount` from `prompts.ts`.
4. **Unused Logic:** Removed the disabled `useEffect` that was causing prompts to reappear when edited.
5. **Dead Code:** Removed unused `excludePromptTexts` parameter logic from `extractMetadata`.

### **Files Cleaned:**
- `app/journal/new/page.tsx` - Cleaned imports, removed debug UI/logic.
- `src/lib/nlp/extract.ts` - Removed logs, simplified function signature.
- `src/lib/nlp/prompts.ts` - Removed logs, removed unused helpers.

---

## 🔍 **Code Quality & Hardcoded Values**

### **Identified Hardcoded Parts:**
These are currently hardcoded. We can move them to a config file (`src/lib/constants.ts`) if you want better organization:

1. **Mood Options (`app/journal/new/page.tsx`):**
   - The emoji list (happy, sad, etc.) is defined directly in the component.
   - *Recommendation:* Move to a constants file if used elsewhere.

2. **Tag Colors (`app/journal/new/page.tsx`):**
   - The list of Tailwind color classes for tags.
   - *Recommendation:* Move to constants or a theme config.

3. **Prompt Templates (`src/lib/nlp/prompts.ts`):**
   - The templates ("Tell me about {entity}") are hardcoded.
   - *Recommendation:* Keep here for now as they are core logic, but could move to a JSON file for easier editing without touching code.

4. **NLP Word Lists (`src/lib/nlp/extract.ts`):**
   - Lists like `commonNonNames`, `nameIndicators`.
   - *Recommendation:* Keep here as they are tightly coupled to the extraction logic.

### **General Quality Check:**
- **Type Safety:** Good usage of TypeScript interfaces.
- **Performance:** Logic is efficient (client-side processing).
- **Modularity:** NLP logic is well-separated from UI components.
- **Cleanliness:** Debug clutter is now gone.

The codebase is now much cleaner and ready for production use!

