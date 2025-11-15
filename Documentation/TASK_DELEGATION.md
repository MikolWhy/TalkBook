# TalkBook - Task Delegation Plan (Visual & Clear)

## 🎯 What We're Building

A journaling app with:
- **Journal entries** (write, edit, delete entries with rich text)
- **AI prompts** (suggestions to help you write)
- **Habit tracking** (track daily habits, see streaks)
- **Statistics** (charts showing your progress)

---

## 👥 Team Structure

- **Michael**: AI Prompts & NLP
- **Aadil**: Journal System & Database
- **Zayn**: Habits & Statistics

---

## 📁 File Structure Explained (Simple Terms)

### What is `repo.ts`? (Database Operations File)

**Think of it like a filing cabinet helper:**
- It's a file that contains functions to save/load data from the database
- Functions like: `createEntry()`, `getEntries()`, `updateEntry()`, `deleteEntry()`
- Instead of writing database code everywhere, we put it all in one place

**Problem:** All 3 people need to add functions here → potential merge conflicts

**Solution:** Use Git branches and coordinate merges
- Aadil creates file structure and entry functions
- Michael adds entity functions (on separate branch, merge after Aadil)
- Zayn adds habit and aggregate functions (on separate branch, merge after Aadil)
- Coordinate merges to avoid conflicts

**Why this approach?** Simpler file structure, easier for beginners, Git handles most conflict prevention

---

### What are "Stores"? (State Management)

**Think of stores like memory for the app:**
- They remember things like "is the PIN screen showing?" or "what color is the journal page?"
- Instead of passing data through many components, stores hold it centrally
- When store data changes, all components using it update automatically

**What is `settingsStore.ts`?**
- Remembers all user settings: AI toggle, page color, lined paper, blacklist, etc.

**Problem:** Michael needs AI settings, Aadil needs appearance settings → both editing same file

**Solution:** Use Git branches and coordinate merges
- Aadil creates store structure and appearance settings
- Michael adds AI settings (on separate branch, merge after Aadil)
- Coordinate merges to avoid conflicts

**Why this approach?** Simpler file structure, easier for beginners, Git handles most conflict prevention

---

### What is `PromptCard.tsx`? (Component)

**Auto-Insert Approach (Current Design):**
- Prompts are automatically inserted as headers when new entry page loads
- No clicking needed - prompts appear directly in the editor
- User can delete any header they don't want
- User writes under each header
- When entry is saved, prompts reset (temporary tracking)

**Note:** `PromptCard.tsx` component is NOT NEEDED with auto-insert approach - prompts go directly into editor.

---

## 📊 Visual File Assignment

```
┌─────────────────────────────────────────────────────────────┐
│                    MICHAEL: AI & NLP                        │
│                                                              │
│  Core Files:                                                 │
│  ├─ src/lib/nlp/extract.ts          (Extract people/topics) │
│  ├─ src/lib/nlp/prompts.ts          (Generate prompts)      │
│  (entity functions in repo.ts)      (Save entities to DB)   │
│  (AI settings in settingsStore.ts) (AI settings memory)    │
│  └─ src/components/PromptCard.tsx  (Optional: prompt button component) │
│                                                              │
│  Integration:                                                │
│  └─ app/journal/new/page.tsx        (Show prompts section)  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              AADIL: Journal & Foundation                    │
│                                                              │
│  Database Foundation:                                        │
│  ├─ src/lib/db/schema.ts            (Data structure)        │
│  ├─ src/lib/db/dexie.ts             (Database setup)        │
│  ├─ src/lib/db/repo.ts             (Entry save/load + all DB ops) │
│                                                              │
│  Journal System:                                             │
│  ├─ src/components/RichTextEditor.tsx  (Text editor)       │
│  ├─ app/journal/page.tsx             (Entry list)           │
│  ├─ app/journal/new/page.tsx         (Create entry)         │
│  └─ app/journal/[id]/page.tsx        (Edit entry)            │
│                                                              │
│  Supporting:                                                 │
│  ├─ src/store/settingsStore.ts      (Settings memory - shared with Michael) │
│  ├─ src/store/uiStore.ts            (UI state memory)        │
│  ├─ src/lib/utils.ts                (Helper functions)      │
│  ├─ src/lib/weather/openMeteo.ts    (Weather API)           │
│  ├─ src/lib/weather/weatherCodes.ts (Weather names)         │
│  ├─ src/components/PinGate.tsx      (PIN screen)            │
│  ├─ src/lib/security/pin.ts         (PIN security)          │
│  ├─ app/layout.tsx                  (App wrapper)           │
│  └─ app/settings/page.tsx            (Settings page)        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│            ZAYN: Habits & Statistics                         │
│                                                              │
│  Habits:                                                      │
│  (habit functions in repo.ts)        (Habit save/load)       │
│  (aggregate functions in repo.ts)    (Stats save/load)       │
│  ├─ src/components/HabitCard.tsx    (Habit display card)    │
│  ├─ app/habits/page.tsx              (Habit list)           │
│  ├─ app/habits/new/page.tsx          (Create habit)          │
│  └─ app/habits/[id]/page.tsx         (Edit habit)            │
│                                                              │
│  Statistics:                                                 │
│  └─ app/stats/page.tsx               (Charts dashboard)     │
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 What Each File Actually Does

### Michael's Files

| File | What It Does | Simple Explanation |
|------|-------------|-------------------|
| `extract.ts` | Extracts information from text | Reads journal text, finds names like "Sarah", topics like "work", dates like "yesterday", and emotional tone |
| `prompts.ts` | Generates writing prompts | Looks at past entries, creates suggestions like "Tell me more about Sarah". Prompts are auto-inserted as headers when new entry page loads. |
| `repo.ts` (entity functions) | Saves extracted info to database | Functions to save/load the people/topics found in entries (Michael adds these to repo.ts on separate branch) |
| `settingsStore.ts` (AI settings part) | Remembers AI settings | Stores: AI on/off, how many prompts to show, tone (cozy/neutral), blacklist, usedPrompts (temporary, cleared when entry saved). Michael adds AI settings to settingsStore.ts on separate branch |
| `PromptCard.tsx` | NOT NEEDED | With auto-insert approach, no separate component needed - prompts go directly into editor |
| `new/page.tsx` (prompts section) | Auto-inserts prompts | Automatically inserts prompts as headers when page loads (no buttons needed) |

### Aadil's Files

| File | What It Does | Simple Explanation |
|------|-------------|-------------------|
| `schema.ts` | Defines data structure | Like a blueprint: "An entry has: id, date, content, mood..." |
| `dexie.ts` | Sets up the database | Creates the database connection and tables |
| `repo.ts` (entry functions) | Entry database functions | Functions: create entry, get entries, update entry, delete entry (Aadil creates file first, Michael and Zayn add their functions on separate branches) |
| `RichTextEditor.tsx` | Text editor with formatting | The writing area where users type, with bold/italic/color buttons |
| `journal/page.tsx` | Shows all entries | List page showing all journal entries with previews |
| `journal/new/page.tsx` | Create new entry | Form page: editor + mood selector + weather + save button |
| `journal/[id]/page.tsx` | Edit existing entry | Same as new page, but pre-filled with existing entry data |
| `settingsStore.ts` (appearance part) | Remembers app settings | Stores: page color, lined paper on/off, weather auto-fill (Aadil creates, Michael adds AI settings) |
| `utils.ts` | Helper functions | Reusable functions: format dates, count words, strip HTML |
| `openMeteo.ts` | Gets weather data | Calls weather API, returns current weather |
| `weatherCodes.ts` | Converts weather codes | Turns "0" into "Clear sky" for display |
| `PinGate.tsx` | PIN lock screen | Shows PIN input screen when app is locked |
| `pin.ts` | PIN security | Hashes PIN, verifies PIN, stores PIN hash |
| `uiStore.ts` | Remembers UI state | Stores: is PIN locked?, is loading?, is modal open? |
| `layout.tsx` | App wrapper | Wraps all pages, includes PIN gate, sets up fonts |
| `settings/page.tsx` | Settings page | Page with all settings: PIN, appearance, export/import |

### Zayn's Files

| File | What It Does | Simple Explanation |
|------|-------------|-------------------|
| `repo.ts` (habit functions) | Habit database functions | Functions: create habit, get habits, log habit, calculate streak (Zayn adds these to repo.ts on separate branch) |
| `repo.ts` (aggregate functions) | Statistics database functions | Functions: save/load daily statistics (word counts, etc.) (Zayn adds these to repo.ts on separate branch) |
| `HabitCard.tsx` | Displays one habit | Card showing: habit name, progress bar, streak, log button |
| `habits/page.tsx` | Shows all habits | List page showing all habits with their cards |
| `habits/new/page.tsx` | Create new habit | Form: name, type (done/not done or number), target, color |
| `habits/[id]/page.tsx` | Edit existing habit | Same as new page, but pre-filled |
| `stats/page.tsx` | Statistics dashboard | Page with charts: word counts, mood trends, habit progress, streaks |

---

## 🔄 How Files Work Together

### Example: Creating a Journal Entry

```
User clicks "New Entry"
    ↓
app/journal/new/page.tsx (Aadil creates, Michael adds prompts)
    ├─ Shows RichTextEditor (Aadil)
    ├─ Shows prompts from prompts.ts (Michael)
    └─ User writes and saves
        ↓
repo.ts (Aadil) saves entry
    ↓
extract.ts (Michael) processes text
    ↓
repo.ts (Michael) saves entities (entity functions added to repo.ts)
    ↓
Done! Entry saved, entities extracted
```

### Example: Showing Statistics

```
User goes to Stats page
    ↓
app/stats/page.tsx (Zayn)
    ├─ Calls repo.ts (Aadil's entry functions) for journal data
    ├─ Calls repo.ts (Zayn's habit functions) for habit data
    ├─ Calls repo.ts (Zayn's aggregate functions) for daily stats
    └─ Displays charts
```

---

## ⚠️ Shared Files (Coordination Needed - Use Git Branches!)

### 1. `src/lib/db/repo.ts` (Database Functions)
- **Aadil** creates file structure and entry functions first
- **Michael** adds entity functions (on separate branch, merge after Aadil)
- **Zayn** adds habit and aggregate functions (on separate branch, merge after Aadil)
- **Solution:** Use Git branches, coordinate merges, Aadil reviews shared file changes

### 2. `src/lib/db/schema.ts` (Database Structure)
- **Aadil** creates the file with all interfaces
- **Michael** adds Entity interface details (on separate branch)
- **Zayn** requests any additional fields early
- **Solution:** Aadil creates first, others review before coding, use branches

### 3. `src/store/settingsStore.ts` (Settings Store)
- **Aadil** creates store structure and appearance settings
- **Michael** adds AI settings (on separate branch, merge after Aadil)
- **Solution:** Use Git branches, coordinate merges

### 4. `app/journal/new/page.tsx` (New Entry Page)
- **Aadil** creates the page structure (editor, mood, weather, save)
- **Michael** adds auto-insert prompt logic
- **Solution:** Aadil leaves clear marker: `{/* MICHAEL: Add prompt auto-insert here */}`

### 5. `app/settings/page.tsx` (Settings Page)
- **Aadil** creates page structure
- **Michael** adds AI settings section
- **Solution:** Separate sections, Aadil creates skeleton first

---

## 🚀 Development Order

### Week 1: Foundation
**Aadil (Critical - Do First):**
1. `schema.ts` - Define all data structures
2. `dexie.ts` - Set up database
3. `repo.ts` - Create file structure and entry functions (Michael and Zayn add their functions later)
4. `utils.ts` - Helper functions

**Michael:**
- Study NLP libraries (compromise, chrono-node, wink-sentiment)
- Plan entity extraction
- Review schema.ts to understand Entry structure

**Zayn:**
- Study Recharts library
- Plan statistics layout
- Review schema.ts to understand Habit and HabitLog structure

### Week 2-3: Core Features
**Aadil:**
- Rich text editor
- Journal pages
- PIN security
- Settings page structure

**Michael:**
- Entity extraction
- Prompt generation
- Add entity functions to `repo.ts` (on separate branch, merge after Aadil)
- Add AI settings to `settingsStore.ts` (on separate branch, merge after Aadil)
- Auto-insert prompts into new entry page (prompts automatically appear as headers when page loads)

**Zayn:**
- Habit CRUD
- Habit logging
- Streak calculation
- HabitCard component
- Add habit and aggregate functions to `repo.ts` (on separate branch, merge after Aadil)

### Week 4: Polish
**Aadil:**
- Home page
- Export/import
- UI polish

**Michael:**
- Prompt quality improvements
- Blacklist integration

**Zayn:**
- Statistics dashboard
- Charts
- Gamification

---

## ✅ Success Checklist

### Michael
- [ ] Extracts people, topics, dates, sentiment from text
- [ ] Generates relevant, personalized prompts
- [ ] Prompts respect blacklist and tone
- [ ] Prompts auto-insert as headers in new entry page
- [ ] Entity functions added to repo.ts (merged successfully)
- [ ] AI settings added to settingsStore.ts (merged successfully)
- [ ] No merge conflicts

### Aadil
- [ ] Database is stable
- [ ] Rich text editor works smoothly
- [ ] All journal CRUD works
- [ ] PIN security works
- [ ] Settings page complete
- [ ] On-time delivery (critical path)

### Zayn
- [ ] Habit tracking works
- [ ] Streak calculation is accurate
- [ ] Statistics dashboard complete
- [ ] Charts are responsive
- [ ] Habit and aggregate functions added to repo.ts (merged successfully)

---

## 🎯 Quick Reference

**What is a "repo" file?** = Database helper functions (save/load data)

**What is a "store" file?** = Memory for the app (remembers state)

**What is a "component"?** = Reusable UI piece (like a button or card)

**Why use Git branches?** = Simpler file structure, easier for beginners, Git handles conflict prevention

**Who does what?** = See visual diagram above ↑

---

## 📞 Communication

- **Daily sync:** Share progress, blockers, API changes
- **Git workflow:** 
  - Each person works on feature branches
  - For shared files (`repo.ts`, `settingsStore.ts`): Aadil creates first, others branch from that
  - Coordinate merges (Aadil reviews shared file changes)
  - Merge frequently to avoid large conflicts
- **Interface contracts:** Define function signatures Week 1
- **Test together:** Share test data, coordinate integration

## 🔀 Git Branch Strategy for Shared Files

**For `repo.ts` and `settingsStore.ts`:**
1. Aadil creates file and commits to main branch
2. Michael creates branch: `git checkout -b michael/entity-functions`
3. Michael adds their functions, commits
4. Michael creates pull request or coordinates merge with Aadil
5. Aadil reviews and merges
6. Zayn does same process for their functions

**This prevents conflicts and keeps code organized!**

---

## 🚀 Quick Start Checklists

### Michael's Quick Start (AI & NLP)

**Before you start:**
- [ ] Read `NLP_EXPLANATION.md` to understand how NLP works
- [ ] Review `schema.ts` to understand Entry and Entity structures
- [ ] Wait for Aadil to create `repo.ts` and `settingsStore.ts` first

**Week 1:**
- [ ] Study compromise library (people/topics extraction)
- [ ] Study chrono-node library (date parsing)
- [ ] Study wink-sentiment library (sentiment analysis)
- [ ] Review existing entries structure in schema.ts

**Week 2-3:**
- [ ] Implement `extract.ts` - extractMetadata function
- [ ] Implement `prompts.ts` - generatePrompts function
- [ ] Create branch: `git checkout -b michael/entity-functions`
- [ ] Add entity functions to `repo.ts` (createEntity, getEntitiesForPrompts, getEntitiesByType)
- [ ] Create branch: `git checkout -b michael/ai-settings`
- [ ] Add AI settings to `settingsStore.ts` (aiEnabled, promptCount, tone, blacklist, usedPrompts)
- [ ] Add auto-insert logic to `app/journal/new/page.tsx`
- [ ] Coordinate merges with Aadil

**Files you own:**
- `src/lib/nlp/extract.ts` - You implement this completely
- `src/lib/nlp/prompts.ts` - You implement this completely
- `src/lib/db/repo.ts` - You add entity functions (on branch)
- `src/store/settingsStore.ts` - You add AI settings (on branch)
- `app/journal/new/page.tsx` - You add prompt auto-insert (after Aadil creates page)

---

### Aadil's Quick Start (Journal & Foundation)

**Before you start:**
- [ ] Read `COMPLETE_SETUP_MANUAL.md` for setup instructions
- [ ] Review Next.js App Router documentation
- [ ] Review Dexie documentation for IndexedDB

**Week 1 (Critical - Do First):**
- [ ] Implement `schema.ts` - Define all interfaces (Profile, Entry, Entity, Habit, HabitLog, DailyAggregate, Settings)
- [ ] Implement `dexie.ts` - Create database instance with tables and indexes
- [ ] Implement `repo.ts` - Create file structure and entry functions (createEntry, getEntries, getEntryById, updateEntry, deleteEntry, getRecentEntries)
- [ ] Implement `utils.ts` - Helper functions (formatDateKey, formatDate, stripHtml, wordCount)
- [ ] Commit to main branch - others need this!

**Week 2-3:**
- [ ] Implement `RichTextEditor.tsx` - Rich text editor with formatting toolbar
- [ ] Implement `app/journal/page.tsx` - Journal list page
- [ ] Implement `app/journal/new/page.tsx` - New entry page (leave marker for Michael's prompts)
- [ ] Implement `app/journal/[id]/page.tsx` - Edit entry page
- [ ] Implement `pin.ts` - PIN hashing and verification
- [ ] Implement `PinGate.tsx` - PIN lock screen
- [ ] Implement `uiStore.ts` - UI state (PIN lock, loading)
- [ ] Implement `settingsStore.ts` - Settings store structure and appearance settings (leave room for Michael's AI settings)
- [ ] Implement `app/settings/page.tsx` - Settings page (leave section for Michael's AI settings)
- [ ] Implement `app/layout.tsx` - App wrapper with PinGate
- [ ] Review and merge Michael's branches for repo.ts and settingsStore.ts

**Files you own:**
- `src/lib/db/schema.ts` - You create this first
- `src/lib/db/dexie.ts` - You create this
- `src/lib/db/repo.ts` - You create file structure, others add functions
- `src/lib/utils.ts` - You implement completely
- `src/lib/security/pin.ts` - You implement completely
- `src/lib/weather/openMeteo.ts` - You implement completely
- `src/lib/weather/weatherCodes.ts` - You implement completely
- `src/store/uiStore.ts` - You implement completely
- `src/store/settingsStore.ts` - You create structure, Michael adds AI settings
- `src/components/RichTextEditor.tsx` - You implement completely
- `src/components/PinGate.tsx` - You implement completely
- All journal pages - You implement completely
- `app/settings/page.tsx` - You create structure, Michael adds AI section
- `app/layout.tsx` - You implement completely

---

### Zayn's Quick Start (Habits & Statistics)

**Before you start:**
- [ ] Review `schema.ts` to understand Habit and HabitLog structures
- [ ] Study Recharts library for charts
- [ ] Wait for Aadil to create `repo.ts` first

**Week 1:**
- [ ] Study Recharts library (LineChart, BarChart, PieChart)
- [ ] Review Habit and HabitLog interfaces in schema.ts
- [ ] Plan habit tracking UI/UX

**Week 2-3:**
- [ ] Implement `HabitCard.tsx` - Habit display component
- [ ] Implement `app/habits/page.tsx` - Habits list page
- [ ] Implement `app/habits/new/page.tsx` - Create habit page
- [ ] Implement `app/habits/[id]/page.tsx` - Edit habit page
- [ ] Create branch: `git checkout -b zayn/habit-functions`
- [ ] Add habit functions to `repo.ts` (createHabit, getActiveHabits, getHabitById, updateHabit, archiveHabit)
- [ ] Add habit log functions to `repo.ts` (logHabit, getHabitLogs, calculateStreak)
- [ ] Add aggregate functions to `repo.ts` (createOrUpdateDailyAggregate, getDailyAggregates)
- [ ] Coordinate merges with Aadil

**Week 4:**
- [ ] Implement `app/stats/page.tsx` - Statistics dashboard
- [ ] Add charts: word counts, mood trends, habit progress, streaks
- [ ] Add gamification elements (progress bars, achievements)

**Files you own:**
- `src/components/HabitCard.tsx` - You implement completely
- `app/habits/page.tsx` - You implement completely
- `app/habits/new/page.tsx` - You implement completely
- `app/habits/[id]/page.tsx` - You implement completely
- `app/stats/page.tsx` - You implement completely
- `src/lib/db/repo.ts` - You add habit and aggregate functions (on branch)

---

Good luck! 🚀
