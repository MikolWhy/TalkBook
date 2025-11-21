# Code Approach Explanation - TalkBook Features

This document explains the code approaches, design decisions, and implementation details for all features we've built.

---

## 1. NLP Prompt System

### Overview
The NLP system extracts meaningful information from journal entries and generates personalized writing prompts. It uses three libraries: **compromise**, **chrono-node**, and **wink-sentiment**.

### Architecture

#### A. Text Extraction (`src/lib/nlp/extract.ts`)

**Approach:** Client-side processing using linguistic analysis libraries

**Why this approach:**
- **Privacy-first**: All processing happens in the browser, no data sent to servers
- **Offline-capable**: Works without internet connection
- **Fast**: No network latency, instant results
- **Free**: No API costs

**How it works:**

```typescript
export async function extractMetadata(
  text: string,
  excludePromptTexts?: string[]
): Promise<{
  people: string[];
  topics: string[];
  dates: Date[];
  sentiment: number;
}>
```

**Step-by-step process:**

1. **HTML Stripping** (lines 66-70)
   ```typescript
   function stripHTML(html: string): string {
     return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
   }
   ```
   - **Why**: Rich text editor stores HTML, but NLP libraries need plain text
   - **How**: Regex removes HTML tags (`<[^>]*>`), replaces with spaces
   - **Safety**: Only processes user's own entries, safe regex usage

2. **Prompt Exclusion** (lines 98-107)
   ```typescript
   if (excludePromptTexts && excludePromptTexts.length > 0) {
     excludePromptTexts.forEach((promptText) => {
       const escapedPrompt = promptText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
       const headingPattern = new RegExp(`<h3[^>]*>.*?${escapedPrompt}.*?</h3>`, "gi");
       textToProcess = textToProcess.replace(headingPattern, "");
     });
   }
   ```
   - **Why**: Prevents extracting entities from prompt headings themselves
   - **How**: Removes H3 headings that match inserted prompts before extraction
   - **Syntax**: `\\$&` escapes special regex characters, `gi` flags = global + case-insensitive

3. **People Extraction** (lines 120-288)
   
   **Library: compromise**
   - **What it does**: Analyzes text using linguistic patterns and grammar rules
   - **Why compromise**: More accurate than regex, understands context
   
   **Two-pronged approach:**
   
   a. **Compromise's built-in detection**:
   ```typescript
   const doc = nlp(plainText);
   const people = doc.people().out("array");
   ```
   - Uses compromise's knowledge base of common names
   - Catches names like "John", "Sarah", "Michael"
   
   b. **Custom detection using linguistic tags**:
   ```typescript
   const allTerms = doc.terms().out("array");
   // Check for ProperNoun tags (capitalized words compromise identifies)
   const isProperNoun = tags.some(tag => tag.includes("ProperNoun"));
   ```
   - **Why**: Catches names compromise might miss (like "Zayn")
   - **How**: Analyzes grammatical tags, checks capitalization, looks for name indicators
   - **Name indicators**: Words like "with", "met", "talked" that often precede names
   
   **Filtering logic** (lines 156-262):
   - Skips grammatical words (pronouns, determiners, verbs, adjectives)
   - Checks if word appears after name indicators ("with Zayn")
   - Validates in sentence context to avoid false positives
   - **Result**: Array of unique, normalized names

4. **Topics Extraction** (lines 290-361)
   
   **Library: compromise**
   ```typescript
   const nouns = doc
     .nouns()
     .not("#Pronoun")      // Exclude: our, your, my
     .not("#Determiner")   // Exclude: the, a, an
     .not("#Preposition")  // Exclude: in, on, at
     .not("#Conjunction")  // Exclude: and, or, but
     .not("#Adjective")    // Exclude: great, good, bad
     .not("#Adverb")       // Exclude: very, really, today
     .not("#Value")        // Exclude: numbers
     .out("array");
   ```
   
   **Why this approach:**
   - **Linguistic filtering**: Uses grammar rules instead of hardcoded word lists
   - **More accurate**: Understands context, not just word matching
   - **Maintainable**: No need to update stop word lists constantly
   
   **Additional filtering** (lines 336-350):
   - Splits noun phrases into individual words
   - Filters out stop words and invalid topics (adjectives/adverbs)
   - Limits to top 10 topics
   - **Result**: Array of meaningful topic words

5. **Date Extraction** (lines 363-373)
   
   **Library: chrono-node**
   ```typescript
   const dateResults = chrono.parse(plainText);
   result.dates = dateResults.map((result) => result.start.date());
   ```
   - **What it does**: Parses natural language date references
   - **Examples**: "yesterday", "next week", "tomorrow", "in 3 days"
   - **Why chrono-node**: Handles natural language, not just formatted dates
   - **Result**: Array of Date objects

6. **Sentiment Analysis** (lines 375-394)
   
   **Library: wink-sentiment**
   ```typescript
   const sentimentResult = sentimentFn(plainText);
   result.sentiment = sentimentResult.score; // Range: -1 to +1
   ```
   - **Score range**: -1 (very negative) to +1 (very positive), 0 = neutral
   - **Why**: Helps generate contextually appropriate prompts
   - **Example**: Negative sentiment → supportive prompts
   - **Result**: Single number representing emotional tone

**Connections:**
- Used by `prompts.ts` to generate prompts from extracted data
- Called from `app/journal/new/page.tsx` after entry is saved
- Results stored in database for future prompt generation

---

#### B. Prompt Generation (`src/lib/nlp/prompts.ts`)

**Approach:** Template-based generation with context-aware selection

**Why this approach:**
- **Natural language**: Templates create grammatically correct prompts
- **Variety**: Multiple templates prevent repetition
- **Context-aware**: Different templates for different entity types
- **Flexible**: Easy to add new templates without changing logic

**How it works:**

1. **Template Structure** (lines 153-234)
   ```typescript
   const PROMPT_TEMPLATES = {
     cozy: {
       person: ["How did things go with {entity}?", ...],
       topic: {
         possessive: ["How's your {entity} going?", ...],
         work: ["How's {entity} going?", ...],
         activity: ["How did {entity} go?", ...],
         general: ["Tell me more about {entity}.", ...],
       },
       date: ["Tell me about {entity}.", ...],
     },
     neutral: { ... }
   };
   ```
   
   **Why nested structure:**
   - **Tone separation**: Different styles (cozy vs neutral)
   - **Entity type separation**: People, topics, dates need different templates
   - **Topic categorization**: Topics have subcategories (possessive, work, activity, general)
   - **{entity} placeholder**: Where extracted words get inserted

2. **Template Selection** (lines 297-348)

   **Function: `selectBestTemplate()`**
   
   **For People** (simple):
   ```typescript
   if (Array.isArray(templates)) {
     const rotationIndex = index % templates.length;
     return templates[rotationIndex];
   }
   ```
   - Rotates through templates for variety
   - Uses sentiment to prefer supportive prompts if negative
   
   **For Topics** (context-aware):
   ```typescript
   const topicCategory = getTopicCategory(entity); // "work" | "activity" | "general"
   const usePossessive = shouldUsePossessive(entity, originalText);
   
   if (usePossessive && templates.possessive) {
     templateSet = templates.possessive; // "How's your project going?"
   } else if (topicCategory === "work" && templates.work) {
     templateSet = templates.work; // "How's work going?"
   }
   ```
   
   **Why context-aware:**
   - **Possessive check**: "project" → "your project" sounds natural
   - **Category check**: "meeting" → uses activity templates
   - **Grammar**: Prevents awkward prompts like "How's great going?"

3. **Prompt Generation Flow** (lines 351-473)

   **Function: `generatePromptsFromMetadata()`**
   
   **Priority order:**
   1. **People** (highest priority - most engaging)
   2. **Topics** (medium priority - good variety)
   3. **Dates** (lowest priority - fill remaining slots)
   
   **Process:**
   ```typescript
   // 1. Generate person prompts
   for (let i = 0; i < metadata.people.length && prompts.length < count; i++) {
     const template = selectBestTemplate(person, personTemplates, "person", ...);
     const promptText = template.replace("{entity}", person);
     prompts.push({ id: generatePromptId(...), text: promptText, ... });
   }
   
   // 2. Generate topic prompts (if needed)
   for (let i = 0; i < metadata.topics.length && prompts.length < count; i++) {
     const template = selectBestTemplate(topic, topicTemplates, "topic", ...);
     const promptText = template.replace("{entity}", topic);
     prompts.push({ ... });
   }
   
   // 3. Generate date prompts (if needed)
   // Similar process...
   ```
   
   **Why this priority:**
   - People prompts are more engaging and personal
   - Topics provide good variety
   - Dates fill remaining slots
   - Fallback to default prompts if no entities found

4. **Blacklist Filtering** (in `generatePrompts()` function)

   **How it works:**
   ```typescript
   // Filter out blacklisted entities before generating prompts
   const filteredPeople = metadata.people.filter(
     person => !blacklist.some(bl => 
       person.toLowerCase().includes(bl.toLowerCase())
     )
   );
   ```
   
   **Why case-insensitive:**
   - User might type "work" but entity is "Work"
   - Ensures blacklist works regardless of capitalization
   
   **Where it's used:**
   - Applied before template selection
   - Prevents blacklisted items from appearing in prompts
   - Stored in `settingsStore` and persisted to localStorage

5. **Word Insertion** (line 375, 407, 459)

   **Simple string replacement:**
   ```typescript
   const promptText = template.replace("{entity}", person);
   // "How did things go with {entity}?" 
   // → "How did things go with Sarah?"
   ```
   
   **Why simple replacement:**
   - Templates are designed to work with any entity
   - No complex grammar rules needed
   - Fast and reliable

**Connections:**
- Uses extracted metadata from `extract.ts`
- Reads blacklist from `settingsStore`
- Called from `app/journal/new/page.tsx` when page loads
- Generates prompts that get auto-inserted into editor

---

#### C. Word Categories & Filtering

**Categories:**

1. **People** (`type: "person"`)
   - Extracted using compromise's `.people()` and custom detection
   - Templates: Simple, personal questions
   - Example: "How did things go with {entity}?"

2. **Topics** (`type: "topic"`)
   - Extracted as nouns, filtered by grammar
   - **Subcategories:**
     - **Possessive**: Topics that work with "your" (project, work, meeting)
     - **Work**: Work-related topics (project, deadline, meeting)
     - **Activity**: Activity-related (meeting, conversation, call)
     - **General**: Everything else
   - Templates vary by category
   - Example: "How's your {entity} going?" (possessive) vs "Tell me more about {entity}." (general)

3. **Dates** (`type: "date"`)
   - Extracted using chrono-node
   - Formatted to relative strings ("yesterday", "2 days ago")
   - Templates: Questions about time references
   - Example: "Tell me about {entity}."

**Filtering Logic:**

**Blacklist filtering** (in `generatePrompts()`):
```typescript
// Case-insensitive matching
const isBlacklisted = blacklist.some(bl => 
  entity.toLowerCase().includes(bl.toLowerCase())
);
```

**Invalid topic filtering** (lines 256-295):
```typescript
function isValidPrompt(topic: string, template: string, type: EntityType): boolean {
  // Skip very short topics
  if (topic.length < 3) return false;
  
  // Skip common words that don't work as topics
  const invalidTopics = new Set(["great", "good", "bad", ...]);
  if (invalidTopics.has(lowerTopic)) return false;
  
  // Check if template creates awkward phrases
  const testPrompt = template.replace("{entity}", topic);
  if (awkwardPatterns.some(pattern => pattern.test(testPrompt))) {
    return false;
  }
  
  return true;
}
```

**Why this filtering:**
- Prevents awkward prompts like "How's great going?"
- Ensures prompts are grammatically correct
- Improves user experience

---

#### D. Prompt Tracking & Removal

**Approach:** Temporary tracking during entry creation, permanent marking after save

**How it works:**

1. **Temporary Tracking** (`app/journal/new/page.tsx`)

   **State management:**
   ```typescript
   const [insertedPromptIds, setInsertedPromptIds] = useState<Set<string>>(new Set());
   ```
   - **Why Set**: Fast lookups, prevents duplicates
   - **Tracks**: Which prompts are currently in the editor
   
   **When prompt is inserted:**
   ```typescript
   const handlePromptInserted = (promptId: string) => {
     setInsertedPromptIds((prev) => {
       const newSet = new Set(prev);
       newSet.add(promptId);
       return newSet;
     });
   };
   ```
   - Adds prompt ID to set
   - Removes prompt from available list (filtered out)
   
   **Monitoring editor for removals** (lines 157-187):
   ```typescript
   useEffect(() => {
     // Check which inserted prompts are still in editor content
     insertedPromptIds.forEach((promptId) => {
       const prompt = allPrompts.find(p => p.id === promptId);
       const headingPattern = new RegExp(`<h3[^>]*>.*?${promptText}.*?</h3>`, "i");
       if (headingPattern.test(content)) {
         stillInEditor.add(promptId);
       }
     });
     
     // Remove prompts that were deleted from editor
     const removed = Array.from(insertedPromptIds).filter(id => !stillInEditor.has(id));
     setInsertedPromptIds((prev) => {
       const newSet = new Set(prev);
       removed.forEach(id => newSet.delete(id));
       return newSet;
     });
   }, [content, insertedPromptIds, allPrompts]);
   ```
   
   **Why this approach:**
   - **Real-time**: Detects when user deletes a prompt heading
   - **Regex matching**: Finds prompts in HTML content
   - **Re-enables**: Makes prompt available again if deleted

2. **Permanent Tracking** (`src/lib/nlp/prompts.ts`)

   **Functions:**
   ```typescript
   // Mark prompt as permanently used (after entry is saved)
   export function markPromptAsUsed(promptId: string): void {
     const used = getUsedPrompts();
     used.add(promptId);
     localStorage.setItem("talkbook_used_prompts", JSON.stringify(Array.from(used)));
   }
   
   // Filter out used prompts
   export function filterUsedPrompts(prompts: Prompt[]): Prompt[] {
     const usedPrompts = getUsedPrompts();
     return prompts.filter((prompt) => !usedPrompts.has(prompt.id));
   }
   ```
   
   **Storage:**
   - Uses `localStorage` (persists across sessions)
   - Stores as JSON array of prompt IDs
   - **Why localStorage**: Simple, persistent, no database needed for this
   
   **When prompts are marked as used:**
   - After entry is saved successfully
   - Prevents same prompt from appearing again
   - **Note**: Prompts can reappear if same topic comes up in future entries (by design)

3. **Expiry System** (lines 561-574)

   ```typescript
   export function filterExpiredPrompts(
     prompts: Prompt[],
     expiryDays: number = 7
   ): Prompt[] {
     const now = new Date();
     return prompts.filter((prompt) => {
       const ageInDays = (now.getTime() - prompt.createdAt.getTime()) / (1000 * 60 * 60 * 24);
       return ageInDays <= expiryDays;
     });
   }
   ```
   
   **Why expiry:**
   - Prevents stale prompts from old entries
   - Keeps prompts relevant to recent activity
   - Default: 7 days (configurable)

**Connections:**
- Temporary tracking: `app/journal/new/page.tsx` → `insertedPromptIds` state
- Permanent tracking: `prompts.ts` → `localStorage`
- Used when entry is saved: Mark prompts as used, clear temporary tracking

---

## 2. Settings Page

### Overview
Central configuration page for app settings. Uses Zustand for state management with persistence.

### Architecture

#### A. State Management (`src/store/settingsStore.ts`)

**Approach:** Zustand with persistence middleware

**Why Zustand:**
- **Lightweight**: Only 1KB, minimal overhead
- **Simple API**: No complex setup like Redux
- **TypeScript-friendly**: Great type inference
- **Persistence**: Built-in middleware for localStorage

**How it works:**

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      // State
      blacklist: [],
      
      // Actions
      addToBlacklist: (item: string) =>
        set((state) => {
          const normalizedItem = item.toLowerCase().trim();
          if (!normalizedItem || state.blacklist.includes(normalizedItem)) {
            return state; // No change if duplicate or empty
          }
          return { blacklist: [...state.blacklist, normalizedItem] };
        }),
    }),
    {
      name: STORAGE_KEY, // "talkbook_settings"
    }
  )
);
```

**Syntax explanation:**

1. **`create<SettingsState>()`**
   - TypeScript generic: Ensures type safety
   - Returns a hook: `useSettingsStore()`

2. **`persist()` middleware**
   - **What it does**: Automatically saves state to localStorage
   - **When**: Every time state changes
   - **Storage key**: `"talkbook_settings"` (configurable)

3. **`set()` function**
   - **What it does**: Updates state and triggers re-renders
   - **How**: Returns new state object
   - **Immutable**: Always returns new object, doesn't mutate

4. **State updater pattern**:
   ```typescript
   set((state) => {
     // Access current state
     // Return new state
     return { blacklist: [...state.blacklist, newItem] };
   })
   ```
   - **Why**: Functional update pattern, can access current state
   - **Spread operator**: `[...state.blacklist]` creates new array

**Connections:**
- Used by `app/settings/page.tsx` for UI
- Used by `prompts.ts` to read blacklist
- Persisted automatically to localStorage

---

#### B. Blacklist Management (`app/settings/page.tsx`)

**Approach:** Simple array management with normalization

**How it works:**

1. **Adding to blacklist** (lines 31-37):
   ```typescript
   const handleAddToBlacklist = () => {
     const trimmed = blacklistInput.trim();
     if (trimmed) {
       addToBlacklist(trimmed);
       setBlacklistInput("");
     }
   };
   ```
   
   **Store action** (`settingsStore.ts` lines 70-77):
   ```typescript
   addToBlacklist: (item: string) =>
     set((state) => {
       const normalizedItem = item.toLowerCase().trim();
       if (!normalizedItem || state.blacklist.includes(normalizedItem)) {
         return state; // Prevent duplicates
       }
       return { blacklist: [...state.blacklist, normalizedItem] };
     }),
   ```
   
   **Why normalization:**
   - **Lowercase**: Case-insensitive matching
   - **Trim**: Removes whitespace
   - **Duplicate check**: Prevents adding same item twice

2. **Removing from blacklist** (lines 79-84):
   ```typescript
   removeFromBlacklist: (item: string) =>
     set((state) => ({
       blacklist: state.blacklist.filter(
         (i) => i.toLowerCase() !== item.toLowerCase()
       ),
     })),
   ```
   
   **Why filter:**
   - Creates new array without removed item
   - Case-insensitive removal (matches how it's stored)
   - Immutable update pattern

3. **UI Display** (lines 206-222):
   ```typescript
   {blacklist.map((item, index) => (
     <div key={index} className="flex items-center gap-2 ...">
       <span>{item}</span>
       <button onClick={() => removeFromBlacklist(item)}>×</button>
     </div>
   ))}
   ```
   
   **Why this UI:**
   - **Chip design**: Each item is a removable chip
   - **Visual feedback**: Clear what's blacklisted
   - **Easy removal**: Click × to remove

**Connections:**
- Stored in `settingsStore` (persisted)
- Used by `prompts.ts` to filter entities
- UI in `app/settings/page.tsx`

---

## 3. PIN/Password System

### Overview
Secure password protection using SHA-256 hashing. All operations happen client-side.

### Architecture

#### A. Password Hashing (`src/lib/security/pin.ts`)

**Approach:** Web Crypto API with SHA-256

**Why SHA-256:**
- **Built-in**: Available in all modern browsers
- **Secure**: Industry-standard hash function
- **One-way**: Cannot reverse hash to get password
- **Fast**: Efficient for client-side use

**How it works:**

1. **Hashing Function** (lines 45-55):
   ```typescript
   export async function hashPin(password: string): Promise<string> {
     const encoder = new TextEncoder();
     const data = encoder.encode(password);
     const hashBuffer = await crypto.subtle.digest("SHA-256", data);
     
     const hashArray = Array.from(new Uint8Array(hashBuffer));
     const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
     
     return hashHex;
   }
   ```
   
   **Step-by-step:**
   - **TextEncoder**: Converts string to bytes (UTF-8 encoding)
   - **crypto.subtle.digest()**: Browser's Web Crypto API, async operation
   - **SHA-256**: Hash algorithm (256 bits = 32 bytes)
   - **Array.from()**: Converts ArrayBuffer to regular array
   - **toString(16)**: Converts each byte to hexadecimal (0-9, a-f)
   - **padStart(2, '0')**: Ensures 2 digits (e.g., "a" → "0a")
   - **join('')**: Combines into single hex string
   
   **Example:**
   - Input: `"mypass123"`
   - Output: `"a1b2c3d4e5f6..."` (64 character hex string)
   
   **Why async:**
   - Web Crypto API is asynchronous
   - Doesn't block the UI thread
   - Returns Promise

2. **Validation** (lines 62-73):
   ```typescript
   export function validatePassword(password: string): { valid: boolean; error?: string } {
     if (!password || password.length === 0) {
       return { valid: false, error: "Password cannot be empty" };
     }
     
     if (password.length > 12) {
       return { valid: false, error: "Password must be 12 characters or less" };
     }
     
     return { valid: true };
   }
   ```
   
   **Why this validation:**
   - **Length check**: Enforces 12 character limit (user requirement)
   - **Empty check**: Prevents setting empty password
   - **No character restrictions**: Allows letters, numbers, special chars (as requested)
   - **Return object**: Provides both validation result and error message

3. **Setting Password** (lines 80-93):
   ```typescript
   export async function setPin(password: string): Promise<{ success: boolean; error?: string }> {
     const validation = validatePassword(password);
     if (!validation.valid) {
       return { success: false, error: validation.error };
     }
     
     try {
       const hash = await hashPin(password);
       localStorage.setItem(STORAGE_KEY, hash);
       return { success: true };
     } catch (error) {
       return { success: false, error: "Failed to set password" };
     }
   }
   ```
   
   **Why this pattern:**
   - **Validation first**: Check before hashing (faster)
   - **Try-catch**: Handles errors gracefully
   - **Return object**: Consistent API (success + optional error)
   - **localStorage**: Simple storage, separate from app data

4. **Verification** (lines 100-112):
   ```typescript
   export async function verifyPin(password: string): Promise<boolean> {
     const storedHash = localStorage.getItem(STORAGE_KEY);
     if (!storedHash) {
       return false; // No password set
     }
     
     const inputHash = await hashPin(password);
     return inputHash === storedHash;
   }
   ```
   
   **How it works:**
   - Hash the entered password
   - Compare with stored hash
   - **Why compare hashes**: Original password is never stored
   - **Security**: Even if someone accesses localStorage, they can't get the password

**Storage:**
- **Key**: `"talkbook_pin_hash"`
- **Location**: `localStorage` (separate from app data)
- **Value**: Hex string (64 characters)

**Connections:**
- Used by `PinGate.tsx` for verification
- Used by `app/settings/page.tsx` for setting/removing
- Used by `uiStore.ts` to check if PIN is set

---

#### B. PinGate Component (`src/components/PinGate.tsx`)

**Approach:** Wrapper component that blocks app access until password is verified

**Why this approach:**
- **Single point of control**: One component manages all locking logic
- **Wraps entire app**: Blocks all pages automatically
- **State-driven**: Uses Zustand store for lock state
- **Route-aware**: Checks on every navigation

**How it works:**

1. **Component Structure**:
   ```typescript
   export default function PinGate({ children }: { children: React.ReactNode }) {
     const { isPinLocked, isPinVerified, setPinLocked, setPinVerified } = useUIStore();
     // ...
   }
   ```
   
   **Why wrapper pattern:**
   - **children prop**: Receives all page content from Next.js
   - **Conditional rendering**: Shows lock screen OR children
   - **Single responsibility**: Only handles PIN logic

2. **PIN Status Checking** (lines 15-32):
   ```typescript
   const checkPinStatus = () => {
     const pinExists = isPinSet();
     
     if (pinExists && !isPinVerified) {
       setPinLocked(true); // Lock if PIN exists but not verified
     } else if (!pinExists) {
       setPinLocked(false);
       setPinVerified(true); // No PIN means unlocked
     }
   };
   
   useEffect(() => {
     setIsChecking(true);
     checkPinStatus();
     setIsChecking(false);
   }, [pathname, isPinVerified, setPinLocked, setPinVerified]);
   ```
   
   **Why check on route changes:**
   - **pathname dependency**: Re-checks when user navigates
   - **Prevents bypass**: Can't navigate around lock screen
   - **State sync**: Ensures lock state matches PIN status
   
   **Loading state:**
   - Shows "Loading..." while checking
   - Prevents flash of content before lock screen

3. **Event Listeners** (lines 34-62):
   ```typescript
   useEffect(() => {
     // Listen for storage changes (other tabs)
     const handleStorageChange = (e: StorageEvent) => {
       if (e.key === "talkbook_pin_hash" || e.key === null) {
         checkPinStatus();
       }
     };
     
     // Listen for custom event (same tab)
     const handlePinSet = () => {
       checkPinStatus();
     };
     
     window.addEventListener("storage", handleStorageChange);
     window.addEventListener("pinSet", handlePinSet);
     
     // Periodic check (every 1 second)
     const interval = setInterval(() => {
       if (isPinSet() && !isPinVerified) {
         setPinLocked(true);
       }
     }, 1000);
     
     return () => {
       // Cleanup: remove listeners
       window.removeEventListener("storage", handleStorageChange);
       window.removeEventListener("pinSet", handlePinSet);
       clearInterval(interval);
     };
   }, [isPinVerified, setPinLocked, setPinVerified]);
   ```
   
   **Why multiple detection methods:**
   - **storage event**: Detects PIN set/removed in other browser tabs
   - **custom event**: Detects PIN set in same tab (storage event doesn't fire for same tab)
   - **interval**: Catches any state inconsistencies (safety net)
   - **Cleanup**: Prevents memory leaks, removes listeners on unmount

4. **Navigation Blocking** (lines 64-80):
   ```typescript
   useEffect(() => {
     if (isPinLocked) {
       const handlePopState = (e: PopStateEvent) => {
         e.preventDefault();
         window.history.pushState(null, "", window.location.href);
       };
       
       window.history.pushState(null, "", window.location.href);
       window.addEventListener("popstate", handlePopState);
       
       return () => {
         window.removeEventListener("popstate", handlePopState);
       };
     }
   }, [isPinLocked]);
   ```
   
   **How it works:**
   - **pushState()**: Adds entry to history, prevents back button from working
   - **popstate event**: Fires when back/forward button is pressed
   - **preventDefault()**: Stops navigation
   - **pushState again**: Keeps user on same URL
   
   **Why this approach:**
   - Prevents browser back button bypass
   - Prevents direct URL access bypass
   - Keeps user locked until password entered

5. **Lock Screen Rendering** (lines 113-152):
   ```typescript
   if (isPinLocked) {
     return (
       <div className="min-h-screen flex items-center justify-center bg-gray-50 fixed inset-0 z-50">
         {/* Lock screen UI */}
       </div>
     );
   }
   
   return <>{children}</>;
   ```
   
   **Why fixed positioning:**
   - **`fixed inset-0`**: Covers entire viewport
   - **`z-50`**: High z-index, appears above all content
   - **Blocks everything**: Can't interact with app content underneath

6. **Password Verification** (lines 82-101):
   ```typescript
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     const isValid = await verifyPin(pinInput);
     if (isValid) {
       setPinVerified(true);
       setPinLocked(false);
       setPinInput("");
       setError("");
     } else {
       setError("Incorrect password. Please try again.");
       setPinInput("");
     }
   };
   ```
   
   **Why clear input on error:**
   - Security: Doesn't leave password visible
   - UX: Forces user to re-enter
   - Prevents accidental submission

**Connections:**
- Wraps app in `app/components/AppWrapper.tsx`
- Uses `uiStore` for lock state
- Uses `pin.ts` for verification
- Listens for "pinSet" event from settings page

---

#### C. Settings Page Integration (`app/settings/page.tsx`)

**Approach:** Immediate lock after setting password

**How it works:**

1. **Setting Password** (lines 39-68):
   ```typescript
   const handleSetPin = async () => {
     // Validation...
     const result = await setPin(pinInput);
     if (result.success) {
       setPinSuccess("Password set successfully!");
       setHasPin(true);
       
       // Immediately lock the app
       lockApp();
       
       // Trigger custom event
       window.dispatchEvent(new CustomEvent("pinSet"));
     }
   };
   ```
   
   **Why immediate lock:**
   - **Security**: Tests password immediately
   - **UX**: Confirms password works
   - **Consistency**: App is locked right away
   
   **Why custom event:**
   - **Same-tab detection**: Storage event doesn't fire for same tab
   - **Immediate**: PinGate detects change instantly
   - **Custom event**: `"pinSet"` triggers re-check

2. **Removing Password** (lines 70-88):
   ```typescript
   const handleRemovePin = async () => {
     // Verify password first
     const isValid = await verifyPin(removePinInput);
     if (!isValid) {
       setPinError("Incorrect password");
       return;
     }
     
     removePin();
     setHasPin(false);
     // App unlocks automatically (PinGate detects PIN removal)
   };
   ```
   
   **Why verify before removal:**
   - **Security**: Prevents accidental removal
   - **Confirmation**: User must know password to remove it
   - **UX**: Clear feedback if wrong password

**Connections:**
- Uses `lockApp()` from `uiStore`
- Uses `setPin()`, `removePin()`, `verifyPin()` from `pin.ts`
- Triggers events that `PinGate` listens to

---

## 4. UI State Management (`src/store/uiStore.ts`)

### Overview
Manages UI-related state (not data) using Zustand. Separate from settings store.

### Architecture

**Why separate store:**
- **Separation of concerns**: UI state vs app settings
- **Different persistence**: UI state is session-only, settings persist
- **Performance**: Smaller store, faster updates

**How it works:**

```typescript
export const useUIStore = create<UIState>((set) => ({
  // Initial state
  isPinLocked: false,
  isPinVerified: false,
  
  // Actions
  setPinLocked: (locked: boolean) => set({ isPinLocked: locked }),
  setPinVerified: (verified: boolean) => set({ isPinVerified: verified }),
  lockApp: () => set({ isPinLocked: true, isPinVerified: false }),
}));
```

**Key actions:**

1. **`lockApp()`** (line 61):
   ```typescript
   lockApp: () => set({ isPinLocked: true, isPinVerified: false })
   ```
   - **Why separate function**: Convenience, sets both states at once
   - **Used by**: Settings page when password is set, homepage lock button

2. **State flow:**
   - **Unlocked**: `isPinLocked: false`, `isPinVerified: true`
   - **Locked**: `isPinLocked: true`, `isPinVerified: false`
   - **Verified**: `isPinLocked: false`, `isPinVerified: true`

**Why no persistence:**
- **Session-only**: Lock state resets on page reload
- **Security**: Forces re-authentication after refresh
- **Simplicity**: No need to persist temporary UI state

**Connections:**
- Used by `PinGate.tsx` for lock state
- Used by `app/page.tsx` for lock button
- Used by `app/settings/page.tsx` to trigger lock

---

## 5. App Wrapper (`app/components/AppWrapper.tsx`)

### Overview
Client component wrapper that combines SidebarProvider and PinGate.

**Why this approach:**
- **Next.js constraint**: `layout.tsx` is server component, can't use hooks directly
- **Separation**: Keeps layout.tsx clean, moves client logic to wrapper
- **Composition**: Combines multiple providers in one place

**How it works:**

```typescript
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
```

**Component hierarchy:**
```
RootLayout (server)
  └─ AppWrapper (client)
      └─ SidebarProvider
          └─ PinGate
              └─ {children} (all pages)
```

**Why this order:**
- **SidebarProvider first**: Provides sidebar state to all components
- **PinGate second**: Can access sidebar state, wraps all pages
- **Children last**: All pages receive both providers

**Connections:**
- Used in `app/layout.tsx` to wrap all pages
- Provides context to entire app
- Enables PIN protection and sidebar state globally

---

## Summary: How Everything Connects

### Data Flow

1. **Journal Entry → Extraction → Prompts**
   ```
   User writes entry
     → extractMetadata() extracts entities
     → generatePrompts() creates prompts
     → Prompts auto-inserted into editor
     → User writes under prompts
     → Entry saved → Prompts marked as used
   ```

2. **Settings → Blacklist → Prompt Filtering**
   ```
   User adds word to blacklist
     → Stored in settingsStore (persisted)
     → generatePrompts() reads blacklist
     → Filters out blacklisted entities
     → Only non-blacklisted prompts shown
   ```

3. **Password Setting → Lock → Verification**
   ```
   User sets password in settings
     → Password hashed and stored
     → lockApp() called
     → PinGate detects change
     → Lock screen shown
     → User enters password
     → verifyPin() checks hash
     → App unlocks if correct
   ```

### Key Design Decisions

1. **Client-side NLP**: Privacy-first, no server needed
2. **Template-based prompts**: Natural language, easy to customize
3. **Zustand for state**: Simple, lightweight, TypeScript-friendly
4. **SHA-256 hashing**: Secure, built-in, no external dependencies
5. **Wrapper pattern**: Clean separation of concerns
6. **Event-driven updates**: Real-time synchronization across components

This architecture provides a solid foundation that's maintainable, secure, and user-friendly.

