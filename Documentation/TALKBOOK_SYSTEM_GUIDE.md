# TalkBook System Guide
**Educational Overview of Core Systems**

---

## Table of Contents
1. [Unused Files](#unused-files)
2. [Password Lock System](#password-lock-system)
3. [NLP & Entity Extraction System](#nlp--entity-extraction-system)
4. [Prompt Generation & Filtering](#prompt-generation--filtering)
5. [Card Color System](#card-color-system)

---

## Unused Files

### Currently Not Used:
- **`src/components/PinGate.tsx`** - Original implementation, replaced by `app/components/LockScreen.tsx`
- **`src/components/NLPResultsDisplay.tsx`** - Debug component, removed from production UI
- **`src/components/PromptCard.tsx`** - Not currently imported anywhere

### Why They Exist:
These were created during development but are now superseded by newer implementations or removed for cleaner UX.

---

## Password Lock System

### Overview
Simple password protection that locks the entire app until the correct password is entered.

### Key Files
- **`app/components/LockScreen.tsx`** - The lock screen UI
- **`app/settings/page.tsx`** - Password management interface
- **`app/components/Sidebar.tsx`** - Lock button

### How It Works

#### 1. Storage (localStorage)
```javascript
localStorage.setItem("appPassword", password);    // Store password
localStorage.setItem("appLocked", "true");         // Lock status
```

**Why localStorage?** 
- Client-side only, no server needed
- Persists across browser sessions
- Simple API for small data

#### 2. Lock Screen Component (`LockScreen.tsx`)
```javascript
useEffect(() => {
  const locked = localStorage.getItem("appLocked");
  const hasPassword = localStorage.getItem("appPassword");
  
  if (locked === "true" && hasPassword) {
    setIsLocked(true);  // Show lock screen
  }
}, []);
```

**Key Concepts:**
- **`useEffect`** - React hook that runs code when component mounts
- **Conditional Rendering** - `if (isLocked) return <LockScreen />` hides all content
- **State Management** - `useState` tracks locked/unlocked state

#### 3. Unlocking Flow
```javascript
const handleUnlock = (e: React.FormEvent) => {
  e.preventDefault();  // Stop form from submitting to server
  
  if (password === savedPassword) {
    localStorage.removeItem("appLocked");  // Unlock
    setIsLocked(false);                    // Hide lock screen
  }
};
```

**Security Note:** This is basic protection, not cryptographic security. Real apps would hash passwords and use secure authentication.

#### 4. Integration (app/layout.tsx)
```javascript
<SidebarProvider>
  <LockScreen />    {/* Wraps entire app */}
  {children}
</SidebarProvider>
```

The lock screen is at the root level, so it protects ALL pages.

---

## NLP & Entity Extraction System

### Core Purpose
Extract **people's names**, **topics**, and **dates** from journal entries to generate personalized writing prompts.

### Libraries Used

#### 1. **compromise.js** (`compromise`)
- **What:** Natural Language Processing library for JavaScript
- **Why:** Understands English grammar, identifies parts of speech, extracts entities
- **Install:** `npm install compromise`
- **Docs:** https://compromise.cool/

#### 2. **chrono-node** (`chrono-node`)
- **What:** Date parsing library
- **Why:** Extracts dates from natural language (e.g., "next Friday", "June 2020")
- **Install:** `npm install chrono-node`
- **Docs:** https://github.com/wanasit/chrono

### Key File: `src/lib/nlp/extract.ts`

#### The Main Function: `extractMetadata`
```typescript
export function extractMetadata(text: string): ExtractedMetadata {
  // Returns: { people: string[], topics: string[], dates: Date[] }
}
```

### Step-by-Step Extraction

#### **STEP 1: Text Preprocessing**
```javascript
const doc = nlp(text);  // Parse text with compromise
```

**What happens:** compromise reads the text and tags every word:
- "Michael" → `#Person` `#ProperNoun`
- "happy" → `#Adjective`
- "ran" → `#Verb` `#PastTense`

#### **STEP 2: Extract People (Names)**

##### A. Get Proper Nouns
```javascript
const allPeople = doc.people().out('array');  // Get all #Person entities
```

**What `doc.people()` does:**
- Looks for capitalized words
- Checks patterns like "talking to [Name]"
- Identifies multi-word names ("Sarah Johnson")

##### B. Enhanced Name Detection
```javascript
const nameIndicators = [
  "with", "to", "about", "from", "by",     // Prepositions
  "met", "saw", "called", "texted", "visited"  // Verbs
];
```

**Pattern Matching:**
```javascript
// Detects: "talked with henry" → extracts "henry"
if (appearsAfterIndicatorInText(word, text, nameIndicators)) {
  people.add(capitalize(word));  // "henry" → "Henry"
}
```

##### C. Name Normalization
```javascript
// Problem: "Michael Michael" should become "Michael"
const uniqueWords = new Set<string>();
name.split(/\s+/).forEach(word => {
  const cleaned = word.trim();
  if (cleaned) uniqueWords.add(cleaned);
});
return Array.from(uniqueWords).join(" ");
```

**Why?** Users might accidentally type names twice. We deduplicate within each name.

##### D. Filtering False Positives
```javascript
const commonNonNames = new Set([
  "for", "the", "january", "monday", "mom", "dad"
]);

if (commonNonNames.has(name.toLowerCase())) {
  return false;  // Skip it
}
```

#### **STEP 3: Extract Topics (Keywords)**

##### A. Get Nouns, Exclude Names
```javascript
const nounDoc = doc
  .nouns()                    // Get all nouns
  .not("#ProperNoun")         // Remove proper nouns (names)
  .not("#Person")             // Remove people
  .not("#Date")               // Remove dates
  .not("#Pronoun");           // Remove "he", "she", "it"
```

**Why each filter:**
- `#ProperNoun` - Names like "Michael"
- `#Person` - References to people
- `#Date` - Calendar terms
- `#Pronoun` - Not meaningful as topics

##### B. Multi-word Topics
```javascript
const nounsArray = nounDoc.json().map((item: any) => item.text);
// ["machine learning", "coffee shop", "pizza"]
```

**Why?** Topics like "machine learning" are more meaningful than just "machine" or "learning".

##### C. Additional Filtering
```javascript
const stopWords = new Set(["thing", "something", "anything", "everything"]);

if (stopWords.has(word) || word.length < 3) {
  return;  // Skip it
}
```

#### **STEP 4: Extract Dates**
```javascript
const parsedDates = chrono.parse(text);
const dates = parsedDates.map(result => result.start.date());
// "I saw her in June 2020" → [Date(2020-06-01)]
```

**What chrono does:**
- Recognizes date formats ("June 2020", "last Friday")
- Converts to JavaScript `Date` objects
- Handles relative dates ("next week")

#### **STEP 5: Return Results**
```javascript
return {
  people: Array.from(peopleSet),    // ["Michael", "Sarah", "Henry"]
  topics: Array.from(topicsSet),    // ["coffee", "work", "vacation"]
  dates: Array.from(datesSet)       // [Date(...), Date(...)]
};
```

---

## Prompt Generation & Filtering

### Key File: `src/lib/nlp/prompts.ts`

### The Process

#### **STEP 1: Generate Prompts from Metadata**
```javascript
export function generatePrompts(metadata: ExtractedMetadata): Prompt[] {
  const prompts: Prompt[] = [];
  
  // For each person, create prompts
  metadata.people.forEach(person => {
    prompts.push({
      id: generatePromptId('person', person),
      text: `Tell me about ${person}.`,
      entity: person,
      type: 'person'
    });
  });
  
  return prompts;
}
```

**Prompt Templates:**
```javascript
const personTemplates = [
  "Tell me about {entity}.",
  "What did you do with {entity}?",
  "How is {entity} doing?"
];
```

The `{entity}` placeholder gets replaced with the actual name.

#### **STEP 2: Prompt ID Generation**
```javascript
function generatePromptId(type: string, entity: string): string {
  return `${type}-${entity.toLowerCase().replace(/\s+/g, '-')}`;
  // Example: "person-michael" or "person-sarah-johnson"
}
```

**Why stable IDs?** So we can track which prompts have been used across sessions.

#### **STEP 3: Filter Expired Prompts**
```javascript
export function filterExpiredPrompts(
  prompts: Prompt[], 
  entries: JournalEntry[]
): Prompt[] {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  return prompts.filter(prompt => {
    const sourceEntry = entries.find(e => 
      e.promptIds?.includes(prompt.id)
    );
    
    if (!sourceEntry) return true;
    
    const entryDate = new Date(sourceEntry.createdAt);
    return entryDate > sevenDaysAgo;  // Keep if less than 7 days old
  });
}
```

**Logic:** Prompts expire after 7 days if not used.

#### **STEP 4: Filter Used Prompts**
```javascript
const USED_PROMPTS_KEY = "talkbook-used-prompts";

export function markPromptAsUsed(promptId: string): void {
  const usedPrompts = JSON.parse(
    localStorage.getItem(USED_PROMPTS_KEY) || "[]"
  );
  
  if (!usedPrompts.includes(promptId)) {
    usedPrompts.push(promptId);
    localStorage.setItem(USED_PROMPTS_KEY, JSON.stringify(usedPrompts));
  }
}
```

**When a prompt is used:**
1. User clicks a prompt → inserted into editor
2. User saves entry → `markPromptAsUsed(promptId)` is called
3. Prompt ID stored in localStorage
4. Next time, `filterUsedPrompts()` excludes it

#### **STEP 5: Get Topic Suggestions (Separate from Prompts)**
```javascript
export function getTopicSuggestions(
  recentEntries: JournalEntry[],
  allExtractedNames: string[]
): TopicSuggestion[] {
  // Get topics from last 3 entries only
  const lastThree = recentEntries.slice(0, 3);
  
  lastThree.forEach(entry => {
    const metadata = extractMetadata(entry.content);
    
    metadata.topics.forEach(topic => {
      // Exclude names from topics
      if (!isLikelyName(topic, allExtractedNames)) {
        topics.add(topic.toLowerCase());
      }
    });
  });
  
  return Array.from(topics).map(topic => ({ text: topic }));
}
```

**Key Differences:**
- **Prompts**: Clickable, from all entries, expire after 7 days
- **Topics**: Not clickable, from last 3 entries only, refreshed constantly

#### **STEP 6: Name Filtering in Topics**
```javascript
function isLikelyName(word: string, knownNames: string[]): boolean {
  // Check against known names (case-insensitive)
  if (knownNames.some(name => 
    name.toLowerCase() === word.toLowerCase()
  )) {
    return true;
  }
  
  // Use compromise to check if it's a person
  const wordDoc = nlp(word);
  if (wordDoc.has("#Person") || wordDoc.has("#ProperNoun")) {
    return true;
  }
  
  return false;
}
```

---

## Card Color System

### Files
- **`app/journal/new/page.tsx`** - Color selector in new entry form
- **`app/journal/[id]/page.tsx`** - Color selector in edit form
- **`app/journal/page.tsx`** - Display colored cards in list
- **`app/components/IOSList.tsx`** - List component that renders colors

### Color Options
```javascript
const cardColorOptions = [
  { id: "default", bgClass: "bg-white", borderClass: "border-gray-200" },
  { id: "mint", bgClass: "bg-emerald-50", borderClass: "border-emerald-200" },
  { id: "blue", bgClass: "bg-blue-50", borderClass: "border-blue-200" },
  // ... 10 colors total
];
```

### Tailwind CSS Classes
- **`bg-emerald-50`** - Background color (Tailwind utility class)
- **`border-emerald-200`** - Border color (slightly darker for contrast)
- **`-50` suffix** - Very light shade (scale: 50, 100, 200...900)

### How It Works

#### 1. Selection
```javascript
const [cardColor, setCardColor] = useState<string>("default");

<button onClick={() => setCardColor("mint")}>
  Mint Green
</button>
```

#### 2. Saving
```javascript
const entry = {
  id: Date.now().toString(),
  title: title,
  content: content,
  cardColor: cardColor,  // "mint", "blue", etc.
  // ...
};
```

#### 3. Display
```javascript
const colorConfig = cardColorOptions[entry.cardColor] || cardColorOptions.default;

<div className={`${colorConfig.bgClass} ${colorConfig.borderClass}`}>
  {/* Entry content */}
</div>
```

---

## Data Flow Summary

### Creating an Entry
1. User writes in editor → `content` state updates
2. User selects mood, tags, color → state updates
3. User clicks "Save"
4. **Extraction:** `extractMetadata(content)` runs
5. **Storage:** Entry saved to `localStorage` with metadata
6. **Prompt Generation:** `generatePrompts(metadata)` creates new prompts
7. **Mark Used:** Clicked prompts marked as used
8. Navigate to journal list

### Viewing Journal List
1. Load entries from `localStorage`
2. For each entry:
   - Get mood emoji from `moodMap`
   - Get card color from `cardColorOptions`
   - Extract content preview (strip HTML)
3. **Filtering:**
   - Apply search query (title/content/tags)
   - Apply tag filter
4. Render `IOSList` with colored cards

### New Entry Page Load
1. Load past entries
2. **Extract metadata** from last 7 days
3. **Generate prompts** from extracted people/dates
4. **Filter out:**
   - Used prompts (clicked in previous entries)
   - Expired prompts (>7 days old)
5. Display prompts as clickable suggestions
6. **Get topics** from last 3 entries (separate)
7. Display topics as non-clickable inspiration

---

## Key Concepts

### React Hooks
- **`useState`** - Stores component data (like form values)
- **`useEffect`** - Runs code when component loads or data changes
- **`useRef`** - References DOM elements (like the text editor)

### TypeScript
- **Interfaces** - Define data shapes (`interface Prompt { id: string; text: string; }`)
- **Type Annotations** - Specify types (`: string`, `: Date[]`)
- **Optional Properties** - `?` means optional (`mood?: string`)

### Tailwind CSS
- **Utility Classes** - Pre-built CSS classes (`bg-blue-50`, `text-gray-900`)
- **Responsive Design** - Classes like `md:flex`, `lg:w-1/2`
- **Color Scale** - 50 (lightest) to 900 (darkest)

### localStorage
```javascript
// Save data
localStorage.setItem("key", JSON.stringify(data));

// Load data
const data = JSON.parse(localStorage.getItem("key") || "[]");

// Remove data
localStorage.removeItem("key");
```

**Limitations:**
- Only stores strings (use `JSON.stringify`/`JSON.parse`)
- Max ~5-10MB per domain
- Cleared if user clears browser data

---

## File Reference

### Core NLP Files
- **`src/lib/nlp/extract.ts`** - Entity extraction (names, topics, dates)
- **`src/lib/nlp/prompts.ts`** - Prompt generation, filtering, storage

### UI Components
- **`src/components/PromptSuggestions.tsx`** - Displays clickable prompts
- **`src/components/TopicSuggestions.tsx`** - Displays topic keywords
- **`src/components/RichTextEditor.tsx`** - Text editor with formatting

### Pages
- **`app/journal/new/page.tsx`** - Create new journal entries
- **`app/journal/[id]/page.tsx`** - Edit existing entries
- **`app/journal/page.tsx`** - List all entries
- **`app/settings/page.tsx`** - Password and profile settings

### Security
- **`app/components/LockScreen.tsx`** - Password lock overlay

---

## Further Learning

### compromise.js
- Docs: https://compromise.cool/
- Try it: https://observablehq.com/@spencermountain/compromise-tags

### chrono-node
- GitHub: https://github.com/wanasit/chrono

### React Hooks
- Official Guide: https://react.dev/reference/react

### Tailwind CSS
- Docs: https://tailwindcss.com/docs
- Cheat Sheet: https://nerdcave.com/tailwind-cheat-sheet

---

**Last Updated:** 2025-01-21

