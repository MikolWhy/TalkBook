# TalkBook - Complete Setup Manual

## ⚡ Quick Setup Commands

**Copy and paste these commands in order:**

```bash
# 1. Create Next.js project (if starting from scratch) SKIP - Already Done.
npx create-next-app@latest talkbook
cd talkbook

# 2. Install all dependencies
npm install zustand dexie compromise chrono-node wink-sentiment recharts dayjs next-pwa

# 3. Install type definitions
npm install -D @types/minimatch

# 4. Verify setup works
npm run dev
```

**That's it!** The skeleton files are already created. If you want to understand what each command does, read the detailed sections below.

---

## 📑 Table of Contents ⚡ = Skim plz; otherwise skip unless you curious

1. [Quick Setup Commands](#quick-setup-commands) ⬆️
2. [Visual Project Structure](#visual-project-structure)⚡
   - [App Flow Diagram](#app-flow-diagram)⚡
   - [Journal Entry Flow](#journal-entry-flow)⚡
   - [Habit Tracking Flow](#habit-tracking-flow)⚡
   - [Complete File Structure](#complete-file-structure-with-tags)⚡
   - [File Purpose Tags](#file-purpose-tags-reference)⚡
   - [Data Flow Diagram](#data-flow-diagram)⚡
   - [Component Relationships](#component-relationships)⚡
   - [Quick Reference: Folders](#quick-reference-what-each-folder-does)⚡
3. [Overview](#overview)
4. [Prerequisites](#prerequisites)
5. [Part 1: Initial Project Setup](#part-1-initial-project-setup)
   - [Step 1: Create Next.js Project](#step-1-create-nextjs-project)
   - [Step 2: Navigate to Project](#step-2-navigate-to-project)
   - [Step 3: Install ALL Required Dependencies](#step-3-install-all-required-dependencies) ⚡
   - [Step 4: Install Type Definitions](#step-4-install-type-definitions)
6. [Part 2: Configuration Files (Reference Only)](#part-2-configuration-files-reference-only---already-done-)
7. [Part 3: Skeleton Files Already Created](#part-3-skeleton-files-already-created-)
8. [Part 4: Files Already Created](#part-4-files-already-created-)
9. [Part 5: Verification](#part-5-verification)
10. [Summary: Setup Commands](#summary-setup-commands)
11. [Learning Resources](#learning-resources)
12. [Quick Reference](#quick-reference)

---

## Overview
This is your **single, comprehensive manual** for setting up TalkBook from scratch. Follow this step-by-step to create a clean skeleton project structure.

**Want to learn WHY we chose each library?** See `LIBRARY_CHOICES.md` for detailed explanations of every library, alternatives we considered, and how to make informed technology decisions.

**After setup, see `TASK_DELEGATION.md` for your Quick Start Checklist!**

---

## 📊 Visual Project Structure

### App Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    APP STARTUP FLOW                          │
└─────────────────────────────────────────────────────────────┘

User Opens App
    ↓
┌─────────────────┐
│  layout.tsx     │ ← Wraps all pages, sets up fonts/metadata
│  (Root Layout)  │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  PinGate.tsx    │ ← Checks if PIN is set
│  (PIN Screen)   │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
  PIN?      No PIN?
    │         │
    ↓         ↓
┌─────────┐ ┌─────────┐
│ Enter   │ │  Skip   │
│ PIN     │ │  to     │
└────┬────┘ └────┬────┘
     │           │
     └─────┬─────┘
           ↓
    ┌──────────────┐
    │  page.tsx    │ ← Home Page (Dashboard)
    │  (Home)      │
    └──────┬───────┘
           │
    ┌──────┴──────┬──────────────┬──────────────┐
    │             │              │              │
    ↓             ↓              ↓              ↓
┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐
│ Journal │  │ Habits  │  │  Stats  │  │Settings │
│  Tab    │  │   Tab    │  │   Tab   │  │   Tab   │
└────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘
     │            │             │            │
     │            │             │            │
     ↓            ↓             │            ↓
┌─────────┐  ┌─────────┐       │      ┌─────────┐
│ List    │  │  List   │       │      │  Config │
│ Entries │  │ Habits  │       │      │  Page   │
└────┬────┘  └────┬────┘       │      └─────────┘
     │            │             │
     │            │             │
  ┌──┴──┐      ┌──┴──┐          │
  │ New │      │ New │          │
  │Entry│      │Habit│          │
  └──┬──┘      └──┬──┘          │
     │            │             │
     │            │             │
  ┌──┴──┐      ┌──┴──┐          │
  │Edit │      │Edit │          │
  │Entry│      │Habit│          │
  └─────┘      └─────┘          │
                                 │
                            ┌────┴────┐
                            │  Charts  │
                            │ Dashboard│
                            └──────────┘
```

### Journal Entry Flow

```
┌─────────────────────────────────────────────────────────────┐
│              JOURNAL ENTRY CREATION FLOW                     │
└─────────────────────────────────────────────────────────────┘

User clicks "New Entry"
    ↓
┌─────────────────────────┐
│ journal/new/page.tsx   │ ← New Entry Page
│ (Entry Form)           │
└───────────┬─────────────┘
            │
    ┌───────┴────────┐
    │               │
    ↓               ↓
┌──────────┐  ┌──────────────┐
│  NLP     │  │ RichText     │
│ Prompts  │  │ Editor       │
│ (Auto)   │  │ (User Types) │
└────┬─────┘  └──────┬───────┘
     │               │
     └───────┬───────┘
             │
             ↓
    ┌────────────────┐
    │ User Saves     │
    │ Entry          │
    └────────┬───────┘
             │
    ┌────────┴────────┐
    │                 │
    ↓                 ↓
┌──────────┐    ┌──────────┐
│ Save to  │    │ Extract  │
│ Database │    │ Entities │
│ (repo.ts)│    │(extract)  │
└────┬─────┘    └────┬─────┘
     │               │
     └───────┬───────┘
             │
             ↓
    ┌────────────────┐
    │ Save Entities   │
    │ (repo.ts)       │
    └────────────────┘
```

### Habit Tracking Flow

```
┌─────────────────────────────────────────────────────────────┐
│              HABIT TRACKING FLOW                            │
└─────────────────────────────────────────────────────────────┘

User goes to Habits Tab
    ↓
┌──────────────────┐
│ habits/page.tsx  │ ← Habits List Page
│ (List View)      │
└────────┬─────────┘
         │
    ┌────┴────┐
    │        │
    ↓        ↓
┌────────┐ ┌──────────┐
│ Create │ │  View    │
│ Habit  │ │  Habits  │
└───┬────┘ └─────┬─────┘
    │           │
    │           ↓
    │    ┌──────────────┐
    │    │ HabitCard    │ ← Displays each habit
    │    │ (Component)  │
    │    └──────┬───────┘
    │           │
    │           ↓
    │    ┌──────────────┐
    │    │ Log Habit    │ ← User logs completion
    │    │ (Button)     │
    │    └──────┬───────┘
    │           │
    │           ↓
    │    ┌──────────────┐
    │    │ Update DB    │ ← Save to database
    │    │ (repo.ts)    │
    │    └──────┬───────┘
    │           │
    │           ↓
    │    ┌──────────────┐
    │    │ Calculate    │ ← Update streak
    │    │ Streak       │
    │    └──────────────┘
    │
    ↓
┌──────────────┐
│ new/page.tsx │ ← Create Habit Form
│ (Habit Form) │
└──────┬───────┘
       │
       ↓
┌──────────────┐
│ Save Habit   │
│ (repo.ts)    │
└──────────────┘
```

---

## 📁 Complete File Structure with Tags

```
talkbook/
│
├── 📄 Configuration Files (Root)
│   ├── package.json          [📦 Dependencies & Scripts]
│   ├── tsconfig.json         [⚙️ TypeScript Config]
│   ├── next.config.ts        [⚙️ Next.js Config + PWA]
│   ├── eslint.config.mjs     [⚙️ Code Quality Rules]
│   └── postcss.config.mjs    [⚙️ CSS Processing]
│
├── 📁 app/                    [📱 Pages (Next.js App Router)]
│   ├── layout.tsx            [🔒 Root Layout + PinGate Wrapper]
│   ├── page.tsx               [🏠 Home Page (Dashboard)]
│   ├── globals.css            [🎨 Global Styles]
│   │
│   ├── 📁 journal/            [📝 Journal Pages]
│   │   ├── page.tsx           [📋 Journal List (All Entries)]
│   │   ├── new/
│   │   │   └── page.tsx       [✍️ New Entry Form + NLP Prompts]
│   │   └── [id]/
│   │       └── page.tsx       [✏️ Edit Entry Form]
│   │
│   ├── 📁 habits/             [✅ Habit Tracking Pages]
│   │   ├── page.tsx          [📋 Habits List]
│   │   ├── new/
│   │   │   └── page.tsx       [➕ Create Habit Form]
│   │   └── [id]/
│   │       └── page.tsx       [✏️ Edit Habit Form]
│   │
│   ├── 📁 settings/           [⚙️ Settings Page]
│   │   └── page.tsx           [🔧 App Configuration]
│   │
│   └── 📁 stats/              [📊 Statistics Page]
│       └── page.tsx           [📈 Charts & Analytics Dashboard]
│
├── 📁 src/                    [💻 Source Code]
│   │
│   ├── 📁 components/         [🧩 Reusable UI Components]
│   │   ├── RichTextEditor.tsx [✍️ Text Editor (Bold, Italic, etc.)]
│   │   ├── PinGate.tsx        [🔒 PIN Lock Screen]
│   │   ├── HabitCard.tsx     [📦 Habit Display Card]
│   │   └── PromptCard.tsx    [❌ NOT NEEDED (Auto-insert approach)]
│   │
│   ├── 📁 lib/                [🛠️ Utility Libraries]
│   │   │
│   │   ├── 📁 db/             [💾 Database Layer]
│   │   │   ├── schema.ts      [📐 Data Structure (Interfaces)]
│   │   │   ├── dexie.ts       [🔌 Database Connection]
│   │   │   └── repo.ts        [📚 CRUD Operations (All Tables)]
│   │   │
│   │   ├── 📁 nlp/            [🤖 NLP & AI Prompts]
│   │   │   ├── extract.ts     [🔍 Extract People/Topics/Dates]
│   │   │   └── prompts.ts     [💡 Generate Writing Prompts]
│   │   │
│   │   ├── 📁 security/       [🔐 Security]
│   │   │   └── pin.ts         [🔑 PIN Hashing & Verification]
│   │   │
│   │   ├── 📁 weather/        [🌤️ Weather Integration]
│   │   │   ├── openMeteo.ts   [🌐 Weather API Client]
│   │   │   └── weatherCodes.ts [📖 Weather Code Mappings]
│   │   │
│   │   └── utils.ts           [🔧 Helper Functions]
│   │
│   ├── 📁 store/              [💾 State Management (Zustand)]
│   │   ├── settingsStore.ts   [⚙️ App Settings State]
│   │   └── uiStore.ts         [🖥️ UI State (PIN, Loading, Modals)]
│   │
│   └── 📁 types/               [📝 TypeScript Type Definitions]
│       └── wink-sentiment.d.ts [📦 Library Type Definitions]
│
├── 📁 public/                 [🌐 Static Assets]
│   ├── manifest.json          [📱 PWA Manifest]
│   └── *.svg                  [🖼️ Icons & Images]
│
└── 📄 Documentation
    ├── COMPLETE_SETUP_MANUAL.md [📖 This File]
    ├── TASK_DELEGATION.md      [👥 Team Task Assignment]
    └── *.md                    [📚 Other Docs]
```

---

## 🏷️ File Purpose Tags Reference

### Pages (`app/`)
- **🏠 Home** (`page.tsx`) - Landing page after PIN, shows recent entries & quick actions
- **📝 Journal** (`journal/page.tsx`) - List all journal entries
- **✍️ New Entry** (`journal/new/page.tsx`) - Create entry with rich text editor + NLP prompts
- **✏️ Edit Entry** (`journal/[id]/page.tsx`) - Edit existing entry
- **✅ Habits** (`habits/page.tsx`) - List all habits with progress & streaks
- **➕ New Habit** (`habits/new/page.tsx`) - Create new habit
- **✏️ Edit Habit** (`habits/[id]/page.tsx`) - Edit existing habit
- **📊 Stats** (`stats/page.tsx`) - Charts & analytics dashboard
- **⚙️ Settings** (`settings/page.tsx`) - App configuration (PIN, AI, appearance)

### Components (`src/components/`)
- **✍️ RichTextEditor** - Text editor with formatting toolbar (bold, italic, colors)
- **🔒 PinGate** - PIN lock screen that protects all pages
- **📦 HabitCard** - Displays one habit with progress bar & log button
- **❌ PromptCard** - NOT NEEDED (prompts auto-insert into editor)

### Database (`src/lib/db/`)
- **📐 schema.ts** - TypeScript interfaces defining data structure
- **🔌 dexie.ts** - IndexedDB connection & table setup
- **📚 repo.ts** - All database operations (CRUD for all tables)

### NLP (`src/lib/nlp/`)
- **🔍 extract.ts** - Extracts people, topics, dates, sentiment from text
- **💡 prompts.ts** - Generates personalized writing prompts

### Security (`src/lib/security/`)
- **🔑 pin.ts** - PIN hashing, verification, storage

### Weather (`src/lib/weather/`)
- **🌐 openMeteo.ts** - Fetches weather data from API
- **📖 weatherCodes.ts** - Converts weather codes to descriptions

### Stores (`src/store/`)
- **⚙️ settingsStore.ts** - App settings (appearance, AI preferences)
- **🖥️ uiStore.ts** - UI state (PIN lock, loading, modals)

### Utils (`src/lib/`)
- **🔧 utils.ts** - Helper functions (date formatting, text processing)

---

## 🔄 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    DATA FLOW OVERVIEW                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────┐
│   User      │
│  (Browser)  │
└──────┬──────┘
       │
       │ User Actions (Click, Type, Save)
       ↓
┌─────────────────────────────────────┐
│         Pages (app/*.tsx)           │
│  - Display UI                       │
│  - Handle user input                │
│  - Call stores & repo functions     │
└──────┬──────────────────────────────┘
       │
       ├─────────────────┬─────────────────┐
       │                 │                 │
       ↓                 ↓                 ↓
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│   Stores    │  │    Repo     │  │ Components  │
│ (Zustand)   │  │  (Database) │  │  (UI)       │
│             │  │             │  │             │
│ - UI State  │  │ - CRUD Ops  │  │ - RichText  │
│ - Settings  │  │ - Queries   │  │ - PinGate   │
└──────┬──────┘  └──────┬──────┘  └──────┬──────┘
       │                 │                 │
       │                 │                 │
       └─────────────────┴─────────────────┘
                         │
                         ↓
              ┌──────────────────┐
              │   IndexedDB      │
              │  (Browser DB)    │
              │                  │
              │ - Entries        │
              │ - Habits         │
              │ - Entities       │
              │ - Settings       │
              └──────────────────┘
```

---

## 🎯 Component Relationships

```
┌─────────────────────────────────────────────────────────────┐
│              COMPONENT DEPENDENCY TREE                       │
└─────────────────────────────────────────────────────────────┘

layout.tsx (Root)
    │
    ├── PinGate.tsx
    │   ├── Uses: pin.ts (verify PIN)
    │   └── Uses: uiStore.ts (PIN lock state)
    │
    └── All Pages
        │
        ├── page.tsx (Home)
        │   ├── Uses: repo.ts (get recent entries)
        │   └── Links to: journal, habits, stats, settings
        │
        ├── journal/new/page.tsx
        │   ├── Uses: RichTextEditor.tsx
        │   ├── Uses: prompts.ts (auto-insert prompts)
        │   ├── Uses: repo.ts (save entry)
        │   ├── Uses: extract.ts (extract entities)
        │   └── Uses: settingsStore.ts (appearance settings)
        │
        ├── habits/page.tsx
        │   ├── Uses: HabitCard.tsx
        │   ├── Uses: repo.ts (get habits, log habits)
        │   └── Uses: repo.ts (calculate streaks)
        │
        ├── stats/page.tsx
        │   ├── Uses: repo.ts (get entries, habits, aggregates)
        │   └── Uses: Recharts (display charts)
        │
        └── settings/page.tsx
            ├── Uses: pin.ts (set/remove PIN)
            ├── Uses: settingsStore.ts (all settings)
            └── Uses: repo.ts (export/import data)
```

---

## 📋 Quick Reference: What Each Folder Does

| Folder | Purpose | Contains |
|--------|---------|----------|
| `app/` | **Pages** - Next.js routes | All page components (home, journal, habits, etc.) |
| `src/components/` | **Reusable UI** | Components used across multiple pages |
| `src/lib/db/` | **Database** | Schema, connection, CRUD operations |
| `src/lib/nlp/` | **AI/NLP** | Entity extraction, prompt generation |
| `src/lib/security/` | **Security** | PIN hashing & verification |
| `src/lib/weather/` | **Weather** | API client & code mappings |
| `src/store/` | **State** | Zustand stores (settings, UI state) |
| `src/lib/` | **Utils** | Helper functions |
| `public/` | **Static** | Images, icons, PWA manifest |

---

## Prerequisites

Before starting, you need these tools installed:

- **Node.js 18+ or 20+** - This is the JavaScript runtime that runs on your computer. It allows you to run JavaScript outside of a browser. Think of it like Python or Java - it's a programming language runtime.
  - **How to check:** Open terminal and type `node --version`
  - **Why we need it:** Next.js and all our tools run on Node.js
  - **Where to get it:** https://nodejs.org/


---

## Part 1: Initial Project Setup

### Step 1: Create Next.js Project


**What is Next.js?**
- Next.js is a **React framework** - it's built on top of React but adds features like routing, server-side rendering, and easy deployment.
- **Why use a framework?** Instead of building everything from scratch (routing, file structure, build tools), Next.js provides a structure and tools so you can focus on building features.
- **What does it give us?** Automatic routing (pages are files), fast development server, production optimizations, and PWA support.

Open your terminal in your desired project directory and run (SKIP - ALREADY DONE):

```bash
npx create-next-app@latest talkbook
```
**What this command does:**
1. Downloads the `create-next-app` tool temporarily
2. Creates a new folder called `talkbook`
3. Sets up a Next.js project inside that folder
4. Asks you questions about what features to include

**When prompted, select:**
- ✅ **TypeScript**: Yes
  - **What is TypeScript?** JavaScript with types. It catches errors before you run code.
  - **Why use it?** Prevents bugs, better IDE support, self-documenting code.
  - **Example:** Instead of `let name = "John"` (could be anything), TypeScript lets you say `let name: string = "John"` (must be a string).

- ✅ **ESLint**: Yes
  - **What is ESLint?** A code quality tool that finds problems in your code.
  - **Why use it?** Catches bugs, enforces consistent style, teaches best practices.
  - **Example:** If you use `var` instead of `const`, ESLint will warn you.

- ✅ **Tailwind CSS**: Yes
  - **What is Tailwind?** A utility-first CSS framework. Instead of writing custom CSS, you use pre-made classes.
  - **Why use it?** Faster development, consistent design, smaller file sizes (unused CSS is removed).
  - **Example:** Instead of writing CSS for a blue button, you use `className="bg-blue-500 text-white px-4 py-2"`.

- ✅ **`src/` directory**: Yes
  - **What is this?** Puts all your source code in a `src` folder instead of the root.
  - **Why use it?** Better organization, separates source code from config files.

- ✅ **App Router**: Yes (default)
  - **What is App Router?** Next.js 13+ routing system. Uses a `app/` folder with special files.
  - **Why use it?** Modern, supports React Server Components, better performance.
  - **Alternative:** Pages Router (older, uses `pages/` folder) - we're using the newer one.

- ✅ **Import alias**: `@/*` (default)
  - **What is this?** Lets you import files using `@/components/Button` instead of `../../components/Button`.
  - **Why use it?** Cleaner imports, easier to refactor, less confusion with relative paths.

This creates the base Next.js project with TypeScript and Tailwind CSS.

### Step 2: Navigate to Project

```bash
cd talkbook
```

### Step 3: Install ALL Required Dependencies

**This is the only other setup command you need** - it installs all libraries including NLP, charting, database, etc.

**What is `npm install`?**
- `npm` (Node Package Manager) is the tool that comes with Node.js for installing JavaScript packages.
- **What are packages?** Pre-written code libraries that solve common problems (like date formatting, database access, etc.).
- **Where do they go?** Into a `node_modules/` folder in your project. This folder is usually ignored by Git (it's huge!).
- **How does it work?** npm reads `package.json` to know what to install, downloads packages from the npm registry, and installs them locally.

**Why install all at once?**
- Faster than installing one by one
- npm resolves dependencies automatically (if package A needs package B, it installs both)
- All packages are compatible versions

Run this single command to install everything:

```bash
npm install zustand dexie compromise chrono-node wink-sentiment recharts dayjs next-pwa
```

**What each package does (detailed explanations):**

- **`zustand`** - State management library
  - **What is state?** Data that changes over time (like user settings, current entry being edited).
  - **Why do we need it?** React components need to share data. Zustand makes this easy without complex setup.
  - **How we know to use it:** Simple, small (1KB), TypeScript-friendly, perfect for our needs.
  - **Learn more:** See `LIBRARY_CHOICES.md` for why we chose this over Redux or Context API.

- **`dexie`** - IndexedDB wrapper
  - **What is IndexedDB?** Browser's built-in database. Stores data locally on the user's device.
  - **Why do we need it?** We want to store journal entries and habits locally (privacy-first, works offline).
  - **Why Dexie?** IndexedDB is complex. Dexie makes it simple with a clean API.
  - **How we know to use it:** Specifically designed for IndexedDB, TypeScript support, well-maintained.

- **`compromise`** - NLP for extracting people and topics
  - **What is NLP?** Natural Language Processing - understanding human language with code.
  - **What does it do?** Reads journal text and finds names of people, topics mentioned, etc.
  - **Why do we need it?** To generate personalized prompts (e.g., "How did your conversation with Sarah go?").
  - **How we know to use it:** Lightweight, runs in browser (privacy-friendly), good for English text.

- **`chrono-node`** - NLP for extracting dates
  - **What does it do?** Finds dates in text like "yesterday", "next Monday", "March 15th".
  - **Why do we need it?** Users might write "I went to the park last Tuesday" - we want to extract that date.
  - **How we know to use it:** Handles natural language dates better than regular date parsing.

- **`wink-sentiment`** - Sentiment analysis
  - **What does it do?** Analyzes text to determine if it's positive, negative, or neutral.
  - **Why do we need it?** To understand the emotional tone of entries (helps generate appropriate prompts).
  - **How we know to use it:** Lightweight, runs locally (privacy), good accuracy for journal entries.

- **`recharts`** - Charting library
  - **What does it do?** Creates beautiful charts and graphs (line charts, bar charts, etc.).
  - **Why do we need it?** For the statistics page - showing habit progress, word counts, mood trends.
  - **How we know to use it:** Built for React, beautiful defaults, TypeScript support, responsive.

- **`dayjs`** - Date utilities
  - **What does it do?** Makes working with dates easier (formatting, comparing, calculating differences).
  - **Why do we need it?** Dates are hard in JavaScript. dayjs makes them simple.
  - **How we know to use it:** Tiny (2KB), modern replacement for Moment.js, great documentation.

- **`next-pwa`** - Progressive Web App support
  - **What is a PWA?** A web app that works offline and can be installed like a native app.
  - **What does it do?** Sets up service workers, manifest file, offline caching automatically.
  - **Why do we need it?** We want the journal to work offline and be installable on phones.
  - **How we know to use it:** Specifically for Next.js, handles complex PWA setup automatically.

**Want to learn more about why we chose these?** See `LIBRARY_CHOICES.md` for detailed explanations, alternatives we considered, and how to make your own library choices.

### Step 4: Install Type Definitions

**What are type definitions?**
- TypeScript needs to know the types (shapes) of JavaScript libraries.
- **What are types?** Information about what data a function expects and returns.
- **Example:** A function might expect a `string` and return a `number`. TypeScript needs to know this.
- **Why do we need them?** Some libraries (like `minimatch`) don't have built-in TypeScript types. We install separate type definition packages.

**What is `@types/`?**
- Packages starting with `@types/` are TypeScript type definitions for JavaScript packages.
- **Why separate?** The original package might not have TypeScript support, so the community creates type definitions separately.

**What is `-D`?**
- The `-D` flag means "dev dependency" - only needed during development, not in production.
- **Why separate?** Production code doesn't need TypeScript types (they're removed during compilation).
- **Where does it go?** In `package.json` under `devDependencies` instead of `dependencies`.

Install TypeScript type definitions:

```bash
npm install -D @types/minimatch
```

**Why `@types/minimatch`?**
- `minimatch` is used internally by Next.js for file matching.
- It doesn't have built-in TypeScript types, so we need the `@types` package.
- Without this, TypeScript would show errors when compiling.

---

## Part 2: Configuration Files (Reference Only - Already Done ✅)

**Note:** If you're following this manual and the project is already set up, you can **skip this section**. It's kept as reference for understanding what the configuration files do.

**What are configuration files?**
- Files that tell tools how to behave (like settings in a video game).
- **Why do we need them?** To customize how Next.js builds and runs our app.
- **Where are they?** In the root of the project (same level as `package.json`).

### Step 5: Update `next.config.ts`

**What is `next.config.ts`?**
- Next.js configuration file. Tells Next.js how to build and run your app.
- **What does `.ts` mean?** TypeScript file (`.js` would be JavaScript).
- **Why do we modify it?** To add PWA support and configure build settings.

**Understanding the code:**

```typescript
import type { NextConfig } from "next";
import withPWA from "next-pwa";
```

**What is `import`?**
- Brings code from other files/packages into this file.
- **`import type`** - Only imports the type (for TypeScript), not the actual code.
- **`from "next"`** - Gets `NextConfig` type from Next.js package.
- **`from "next-pwa"`** - Gets the `withPWA` function from next-pwa package.

```typescript
const nextConfig: NextConfig = {
  turbopack: undefined,
};
```

**What is `const`?**
- Creates a constant (can't be changed after creation).
- **`nextConfig: NextConfig`** - TypeScript: `nextConfig` must match the `NextConfig` type.
- **`turbopack: undefined`** - Disables Turbopack (Next.js's new bundler).
- **Why disable Turbopack?** next-pwa doesn't work with Turbopack yet, needs Webpack.

**What is a bundler?**
- Tool that combines all your code files into files the browser can use.
- **Webpack vs Turbopack:** Webpack is older but more compatible, Turbopack is newer but faster (but less compatible).

```typescript
export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
})(nextConfig);
```

**What is `export default`?**
- Makes this the main thing this file exports (other files can import it).
- **`withPWA(...)`** - A function that wraps your config to add PWA features.
- **`dest: "public"`** - Where to put PWA files (service worker, etc.).
- **`register: true`** - Automatically register the service worker.
- **`skipWaiting: true`** - Service worker updates immediately (not on next page load).
- **`disable: process.env.NODE_ENV === "development"`** - Disable PWA in development (faster dev server).
- **`(nextConfig)`** - Passes our config to `withPWA` function.

Replace the entire file with:

```typescript
import type { NextConfig } from "next";
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  // pwa configuration
  // why: next-pwa requires webpack, not turbopack
  // how: set turbopack to undefined to force webpack
  // syntax: turbopack: undefined
  turbopack: undefined,
};

// wrap config with pwa
// why: enables progressive web app features
// how: withPWA() wrapper adds service worker and manifest support
// syntax: export default withPWA(nextConfig)
export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
})(nextConfig);
```

### Step 6: Update `tsconfig.json`

**What is `tsconfig.json`?**
- TypeScript configuration file. Tells TypeScript how to compile your code.
- **Why do we need it?** TypeScript needs to know what JavaScript version to target, what features to allow, etc.
- **What does it do?** Controls how TypeScript checks and compiles your code.

**Understanding key options:**

```json
{
  "compilerOptions": {
    "target": "ES2017",
```
- **What is `target`?** What JavaScript version to compile to.
- **Why ES2017?** Modern enough for features we need, compatible with all browsers.

```json
    "lib": ["dom", "dom.iterable", "esnext"],
```
- **What is `lib`?** What built-in JavaScript APIs TypeScript knows about.
- **`"dom"`** - Browser APIs (document, window, etc.).
- **`"dom.iterable"`** - Iterable DOM APIs.
- **`"esnext"`** - Latest JavaScript features.

```json
    "strict": true,
```
- **What is `strict`?** Enables all strict type checking.
- **Why use it?** Catches more errors, forces better code quality.
- **What does it do?** Makes TypeScript very picky about types (which is good!).

```json
    "paths": {
      "@/*": ["./src/*"]
    },
```
- **What is `paths`?** Allows importing with custom paths.
- **`"@/*": ["./src/*"]`** - `@/components/Button` maps to `./src/components/Button`.
- **Why use it?** Cleaner imports, easier refactoring.

```json
    "types": []
```
- **What is `types`?** Which type definition packages to include.
- **Why empty array?** Prevents TypeScript from automatically including all `@types/*` packages.
- **Why do this?** More control, faster compilation.

Ensure it includes (should already be mostly correct, just verify):

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    },
    "types": []
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### Step 7: Update `package.json` Scripts

Ensure your `package.json` has these scripts (should already be there, just verify):

```json
{
  "scripts": {
    "dev": "next dev --webpack",
    "build": "next build --webpack",
    "start": "next start",
    "lint": "next lint"
  }
}
```

### Step 8: Update `.gitignore`

Add these lines to your `.gitignore` (if not already present):

```
# pwa generated files
/public/sw.js
/public/sw.js.map
/public/workbox-*.js
/public/workbox-*.js.map
/public/fallback-*.js
/public/fallback-*.js.map
```

---

## Part 3: Skeleton Files Already Created ✅

**The skeleton files with proper headers have already been created.** 

If you need to see what each file should contain, check the actual files in your project - they all have detailed header comments explaining:
- What the file is for
- What needs to be implemented
- Who owns it (Michael, Aadil, or Zayn)
- Coordination notes for shared files

**To see the file structure visually, check the [Visual Project Structure](#-visual-project-structure) section above.**

---

## Part 4: Files Already Created ✅

**All skeleton files have already been created with proper header comments.**

Each file contains:
- **What the file is for** - Clear explanation of purpose
- **What needs to be implemented** - Specific TODOs
- **Ownership** - Who implements it (Michael, Aadil, or Zayn)
- **Coordination notes** - How to work together on shared files

**To see the complete file structure, check the [Visual Project Structure](#-visual-project-structure) section above.**

**To see what each file should contain, check the actual files in your project - they all have detailed comments.**

---

## Part 5: Verification

### Step 10: Verify Setup

Run the development server:

```bash
npm run dev
```

**You should see:**
- ✅ Next.js starting on http://localhost:3000
- ✅ No compilation errors
- ✅ Empty pages loading (with "TODO" messages)

If you see errors, check:
1. All dependencies are installed (`npm install`)
2. All files are created in correct locations
3. TypeScript configuration is correct
4. No syntax errors in files

---

## Summary: Setup Commands

**Quick reference - see [Quick Setup Commands](#-quick-setup-commands) at the top for the actual commands.**

**What each command does:**

1. **Create Next.js project:**
   - Creates the base Next.js project structure
   - Sets up routing, build tools, and project structure automatically

2. **Install all dependencies:**
   - Downloads and installs all libraries we need
   - Provides functionality (state management, database, NLP, charts, etc.)
   - **Learn more:** See `LIBRARY_CHOICES.md` for why we chose each one

3. **Install type definitions:**
   - Installs TypeScript type definitions
   - TypeScript needs type information to check your code



---

## Project Structure Summary

```
talkbook/
├── src/
│   ├── app/                    # Next.js pages
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home dashboard
│   │   ├── journal/           # Journal pages
│   │   ├── habits/           # Habit pages
│   │   ├── stats/            # Statistics page (NEW)
│   │   └── settings/         # Settings page
│   ├── components/           # React components
│   ├── lib/                  # Core libraries
│   │   ├── db/              # Database
│   │   ├── nlp/             # NLP processing
│   │   ├── security/        # PIN security
│   │   ├── weather/         # Weather API
│   │   └── utils.ts         # Utilities
│   ├── store/               # Zustand stores
│   └── types/               # TypeScript types
├── public/
│   └── manifest.json        # PWA manifest
└── [config files]


## Learning Resources

### Understanding What You're Building

**Project Structure Concepts:**
- **Component-based architecture:** UI is built from reusable components
- **Client vs Server components:** Some code runs in browser, some on server
- **State management:** How data flows through your app
- **Local-first:** Data stored on device, not on server
- **PWA:** Web app that works like a native app

### Key Concepts to Learn

1. **React Basics:**
   - Components (reusable UI pieces)
   - Props (data passed to components)
   - State (data that changes)
   - Hooks (useState, useEffect, etc.)

2. **Next.js Concepts:**
   - App Router (file-based routing)
   - Server Components vs Client Components
   - Layouts and Pages
   - Dynamic Routes

3. **TypeScript:**
   - Types (string, number, object, etc.)
   - Interfaces (defining object shapes)
   - Type safety (catching errors early)

4. **State Management:**
   - What is state?
   - When to use Zustand vs local state
   - How data flows through app

### Recommended Learning Path

1. **React Fundamentals** (if new to React)
   - Components, props, state
   - Event handling
   - Conditional rendering

2. **Next.js Basics**
   - File-based routing
   - Pages and layouts
   - Client vs Server components

3. **TypeScript Basics**
   - Basic types
   - Interfaces
   - Type annotations

4. **Our Specific Libraries**
   - Read `LIBRARY_CHOICES.md` for each library
   - Try simple examples
   - Read official documentation

### Where to Learn More

- **Next.js Docs:** https://nextjs.org/docs
- **React Docs:** https://react.dev
- **TypeScript Handbook:** https://www.typescriptlang.org/docs/
- **Zustand Docs:** https://docs.pmnd.rs/zustand
- **Dexie Docs:** https://dexie.org
- **Tailwind CSS Docs:** https://tailwindcss.com/docs

### Questions to Ask Yourself

As you work through the setup:
- ✅ Do I understand what each command does?
- ✅ Can I explain why we chose each library?
- ✅ Do I understand the file structure?
- ✅ Can I explain what each config file does?
- ✅ Do I know where to find documentation?


---

## Quick Reference

**Setup Commands:**
```bash
npx create-next-app@latest talkbook
cd talkbook
npm install zustand dexie compromise chrono-node wink-sentiment recharts dayjs next-pwa
npm install -D @types/minimatch
npm run dev
```

**Key Features:**
- Journal system (rich text, mood, weather, prompts)
- Habit tracking (boolean/numeric, streaks)
- Statistics dashboard (charts with Recharts)
- AI prompts (NLP extraction, personalized)
- PIN security (SHA-256 hashing)
- Settings (all configuration)
- PWA support (offline, installable)

**All files include:**
- Header comments explaining purpose
- TODO items for implementation
- Why/how/syntax explanations

