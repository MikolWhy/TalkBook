# NLP System Explanation

## How the NLP System Works

The TalkBook app uses local NLP (Natural Language Processing) to extract meaningful information from your journal entries and generate personalized prompts. Here's how it works:

## Step-by-Step Process

### 1. **Entry Creation** (`src/app/journal/new/page.tsx`)
When you save a journal entry:
- Your text is sent to the extraction function
- Metadata is extracted and stored in the database

### 2. **Entity Extraction** (`src/lib/nlp/extract.ts`)

The system uses three libraries to analyze your text:

#### **A. People Extraction (compromise library)**
```typescript
const people = doc.people().out("array");
```
- **What it does**: Identifies person names in your text
- **How it works**: Uses linguistic patterns to detect proper nouns that refer to people
- **Example**: 
  - Text: "Had lunch with Sarah and talked to John about the project"
  - Extracted: ["Sarah", "John"]

#### **B. Topics Extraction (compromise library)**
```typescript
const topics = doc.nouns().out("array")
  .filter((noun: string) => noun.length > 2)
  .slice(0, 10);
```
- **What it does**: Extracts important nouns (topics/subjects)
- **How it works**: 
  - Finds all nouns in the text
  - Filters out short words (2 characters or less) - removes words like "it", "is", etc.
  - Takes top 10 most mentioned topics
- **Example**:
  - Text: "Working on the project deadline. The meeting was about the budget."
  - Extracted: ["project", "deadline", "meeting", "budget"]

#### **C. Date Extraction (chrono-node library)**
```typescript
const dateParsed = chrono.parse(text);
const dates = dateParsed.map((result) => result.text);
```
- **What it does**: Finds date references in natural language
- **How it works**: Parses phrases that refer to dates/times
- **Example**:
  - Text: "Meeting tomorrow at 3pm. Next week we have the presentation."
  - Extracted: ["tomorrow", "next week"]

#### **D. Sentiment Analysis (wink-sentiment library)**
```typescript
const sentiment = winkSentiment(text).score; // -1 to +1
```
- **What it does**: Calculates emotional tone of the entry
- **How it works**: Analyzes words for positive/negative sentiment
- **Example**:
  - Text: "Great day! Everything went perfectly."
  - Score: ~0.8 (positive)
  - Text: "Terrible day. Nothing worked."
  - Score: ~-0.7 (negative)

### 3. **Entity Storage** (`src/lib/db/repo.ts`)

Extracted entities are saved to the database:
```typescript
const entities = [
  { entryId: 1, type: "person", value: "Sarah" },
  { entryId: 1, type: "topic", value: "project" },
  { entryId: 1, type: "date", value: "tomorrow" }
];
await saveEntities(entities);
```

### 4. **Prompt Generation** (`src/lib/nlp/prompts.ts`)

When generating prompts for the home page:

#### **A. Query Recent Entities** (`src/lib/db/repo.ts`)
```typescript
// Get entities from last 7 days of entries
const people = await getEntitiesForPrompts(entryIds, "person", blacklist);
const topics = await getEntitiesForPrompts(entryIds, "topic", blacklist);
const dates = await getEntitiesForPrompts(entryIds, "date", blacklist);
```

#### **B. Filter Blacklisted Items**
- Removes any entities you've blacklisted in settings
- Case-insensitive matching
- Example: If "work" is blacklisted, it won't appear in prompts

#### **C. Prioritize and Select** (`src/lib/nlp/prompts.ts`)

The system prioritizes entities in this order:
1. **People** (highest priority) - most engaging prompts
2. **Topics** (medium priority) - good for variety
3. **Dates** (lower priority) - fill remaining slots
4. **Fallback** - generic prompts if no entities found

#### **D. Apply Tone Templates**

Each entity type has template functions:

**Cozy Tone:**
- Person: `"how did things go with {name}?"`
- Topic: `"any progress on {topic} since yesterday?"`
- Date: `"you mentioned {ref}. did it happen?"`

**Neutral Tone:**
- Person: `"how did your interaction with {name} go?"`
- Topic: `"any updates on {topic}?"`
- Date: `"did {ref} occur as mentioned?"`

#### **E. Generate Final Prompts**

```typescript
// Example flow:
// 1. Get unique people: ["Sarah", "John"]
// 2. Generate: "how did things go with Sarah?"
// 3. If need more, get topics: ["project", "meeting"]
// 4. Generate: "any progress on project since yesterday?"
// 5. Fill remaining with fallback if needed
```

## Example Flow

### Input Journal Entry:
```
"Had a great meeting with Sarah today about the project deadline. 
We decided to push it to next week. Feeling optimistic!"
```

### Step 1: Extraction
- **People**: ["Sarah"]
- **Topics**: ["meeting", "project", "deadline", "week"]
- **Dates**: ["today", "next week"]
- **Sentiment**: 0.6 (positive)

### Step 2: Storage
Entities saved to database linked to this entry.

### Step 3: Prompt Generation (Next Day)
- Query last 7 days of entries
- Find entities: People=["Sarah"], Topics=["project", "deadline"]
- Apply blacklist (if any)
- Generate prompts:
  1. "how did things go with Sarah?" (person prompt)
  2. "any progress on project since yesterday?" (topic prompt)

## Key Features

### **Blacklist System**
- You can blacklist specific people, topics, or phrases
- Blacklisted items are **never** used in prompts
- Stored in settings, persists across sessions

### **Lookback Window**
- Only uses entities from **last 7 days** of entries
- Keeps prompts relevant to recent activity
- Prevents stale prompts from old entries

### **Deduplication**
- Uses `Set` to remove duplicate entities
- Example: If "Sarah" appears in 3 entries, only one prompt is generated

### **Priority System**
- People prompts are generated first (most engaging)
- Topics fill remaining slots
- Dates are last resort
- Fallback prompts ensure you always get the requested number

## Limitations

1. **English Only**: NLP libraries work best with English text
2. **Local Processing**: All processing happens in your browser (no cloud)
3. **Simple Extraction**: Not as sophisticated as cloud AI, but privacy-first
4. **Context**: Doesn't understand full context, just extracts entities

## Customization

You can customize:
- **Prompt Count**: 1-3 prompts per day (settings)
- **Tone**: Cozy or Neutral (settings)
- **Blacklist**: Add items to exclude from prompts (settings)
- **AI Toggle**: Turn prompts on/off completely (settings)

