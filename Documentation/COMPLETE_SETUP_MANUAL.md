# TalkBook - Complete Setup Manual

## 📑 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Part 1: Initial Project Setup](#part-1-initial-project-setup)
   - [Step 1: Create Next.js Project](#step-1-create-nextjs-project)
   - [Step 2: Install Dependencies](#step-2-install-dependencies)
   - [Step 3: Configure Next.js](#step-3-configure-nextjs)
4. [Part 2: Create Skeleton Files](#part-2-create-skeleton-files)
   - [Database Files](#database-files)
   - [NLP Files](#nlp-files)
   - [Security Files](#security-files)
   - [Weather Files](#weather-files)
   - [Utils](#utils)
   - [Stores](#stores)
   - [Components](#components)
   - [Pages](#pages)
   - [Types](#types)
5. [Part 3: Verification](#part-3-verification)
6. [Next Steps](#next-steps)

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

**Yes, you need to run this command** - it creates the base Next.js project structure.

**What is Next.js?**
- Next.js is a **React framework** - it's built on top of React but adds features like routing, server-side rendering, and easy deployment.
- **Why use a framework?** Instead of building everything from scratch (routing, file structure, build tools), Next.js provides a structure and tools so you can focus on building features.
- **What does it give us?** Automatic routing (pages are files), fast development server, production optimizations, and PWA support.

**What is `npx`?**
- `npx` is a package runner that comes with npm. It downloads and runs packages temporarily.
- **Why use it?** Instead of installing `create-next-app` globally, `npx` downloads it, runs it, then discards it. Keeps your system clean.
- **The `@latest` part:** Ensures you get the newest version of the tool.

Open your terminal in your desired project directory and run:

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

## Part 2: Configuration Files

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

## Part 3: Create Directory Structure

### Step 9: Create All Directories

Create these directories in your project:

```bash
# Windows PowerShell
New-Item -ItemType Directory -Force -Path "src/app/journal/new"
New-Item -ItemType Directory -Force -Path "src/app/journal/[id]"
New-Item -ItemType Directory -Force -Path "src/app/habits/new"
New-Item -ItemType Directory -Force -Path "src/app/habits/[id]"
New-Item -ItemType Directory -Force -Path "src/app/settings"
New-Item -ItemType Directory -Force -Path "src/app/stats"
New-Item -ItemType Directory -Force -Path "src/components"
New-Item -ItemType Directory -Force -Path "src/lib/db"
New-Item -ItemType Directory -Force -Path "src/lib/nlp"
New-Item -ItemType Directory -Force -Path "src/lib/security"
New-Item -ItemType Directory -Force -Path "src/lib/weather"
New-Item -ItemType Directory -Force -Path "src/store"
New-Item -ItemType Directory -Force -Path "src/types"
```

Or manually create these folders:
- `src/app/journal/new/`
- `src/app/journal/[id]/`
- `src/app/habits/new/`
- `src/app/habits/[id]/`
- `src/app/settings/`
- `src/app/stats/`
- `src/components/`
- `src/lib/db/`
- `src/lib/nlp/`
- `src/lib/security/`
- `src/lib/weather/`
- `src/store/`
- `src/types/`

---

## Part 4: Create All Files with Headers

### App Pages (`src/app/`)

#### `src/app/layout.tsx`
Replace the entire file with:

```typescript
// root layout component - wraps entire app
// provides pin gate protection, global styles, and metadata
// TODO: implement pin gate wrapper, add fonts, configure metadata and viewport
// why: next.js app router requires root layout for all pages
// how: default export function component with children prop
// syntax: export default function RootLayout({ children }: { children: React.ReactNode })

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TalkBook - Local Journal & Habits",
  description: "Privacy-first journaling and habit tracking PWA",
  manifest: "/manifest.json",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#3b82f6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

#### `src/app/page.tsx`
Replace the entire file with:

```typescript
// home page - dashboard view
// displays recent journal entries, quick actions, and summary stats
// TODO: implement home dashboard with recent entries list, quick action buttons, stats summary
// why: main landing page after login, provides overview and quick access
// how: client component fetching recent entries, displaying cards with links
// syntax: "use client"; export default function HomePage()

"use client";

export default function HomePage() {
  return (
    <div>
      <h1>TalkBook</h1>
      <p>Home page - TODO: implement dashboard</p>
    </div>
  );
}
```

#### `src/app/globals.css`
Replace the entire file with:

```css
/* global styles and tailwind directives */
/* TODO: add tailwind base, components, utilities directives */
/* why: tailwind requires base styles to be imported */
/* how: @tailwind directives at top of file */
/* syntax: @tailwind base; @tailwind components; @tailwind utilities; */

@tailwind base;
@tailwind components;
@tailwind utilities;
```

#### `src/app/journal/page.tsx`
Create new file:

```typescript
// journal list page - displays all journal entries
// shows entries in chronological order with preview and actions
// TODO: implement entry list view, filtering, search, entry cards with preview
// why: allows users to browse and access all journal entries
// how: client component fetching entries, rendering cards with dates and previews
// syntax: "use client"; export default function JournalPage()

"use client";

export default function JournalPage() {
  return (
    <div>
      <h1>Journal</h1>
      <p>TODO: implement journal list</p>
    </div>
  );
}
```

#### `src/app/journal/new/page.tsx`
Create new file:

```typescript
// new journal entry page - create entry form
// includes rich text editor, mood selector, weather, prompts, and save functionality
// TODO: implement entry creation form, rich text editor integration, mood/weather inputs, auto-insert prompts as headers, save handler
// why: interface for creating new journal entries with all features
// how: client component with form state, rich text editor, async save to database
// syntax: "use client"; export default function NewEntryPage()

"use client";

export default function NewEntryPage() {
  return (
    <div>
      <h1>New Entry</h1>
      <p>TODO: implement entry creation form</p>
    </div>
  );
}
```

#### `src/app/journal/[id]/page.tsx`
Create new file:

```typescript
// edit journal entry page - update existing entry
// similar to new page but pre-fills with existing entry data
// TODO: implement entry editing form, load existing entry data, update handler, delete option
// why: allows users to edit or delete existing journal entries
// how: client component fetching entry by id, pre-filling form, async update/delete
// syntax: "use client"; export default function EditEntryPage({ params }: { params: { id: string } })

"use client";

export default function EditEntryPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div>
      <h1>Edit Entry</h1>
      <p>TODO: implement entry editing form</p>
    </div>
  );
}
```

#### `src/app/habits/page.tsx`
Create new file:

```typescript
// habits list page - displays all active habits
// shows habits with progress, streaks, and logging interface
// TODO: implement habits list view, progress display, streak calculation, logging interface, archive option
// why: main interface for viewing and managing habits
// how: client component fetching habits, displaying cards with stats, logging handlers
// syntax: "use client"; export default function HabitsPage()

"use client";

export default function HabitsPage() {
  return (
    <div>
      <h1>Habits</h1>
      <p>TODO: implement habits list</p>
    </div>
  );
}
```

#### `src/app/habits/new/page.tsx`
Create new file:

```typescript
// new habit page - create habit form
// includes name, type (bool/number), target, unit, color selection
// TODO: implement habit creation form, type selection, target input, color picker, save handler
// why: interface for creating new habits with all configuration options
// how: client component with form state, validation, async save to database
// syntax: "use client"; export default function NewHabitPage()

"use client";

export default function NewHabitPage() {
  return (
    <div>
      <h1>New Habit</h1>
      <p>TODO: implement habit creation form</p>
    </div>
  );
}
```

#### `src/app/habits/[id]/page.tsx`
Create new file:

```typescript
// edit habit page - update existing habit
// similar to new page but pre-fills with existing habit data
// TODO: implement habit editing form, load existing habit data, update handler, delete option
// why: allows users to edit or delete existing habits
// how: client component fetching habit by id, pre-filling form, async update/delete
// syntax: "use client"; export default function EditHabitPage({ params }: { params: { id: string } })

"use client";

export default function EditHabitPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div>
      <h1>Edit Habit</h1>
      <p>TODO: implement habit editing form</p>
    </div>
  );
}
```

#### `src/app/stats/page.tsx`
Create new file:

```typescript
// statistics page - displays charts and analytics
// shows journal word counts, habit progress, streaks, mood trends, and other insights
// TODO: implement stats dashboard with recharts, word count charts, habit progress charts, mood trends, streak visualizations
// why: provides visual insights into journaling and habit tracking progress
// how: client component fetching aggregated data, rendering charts with recharts library
// syntax: "use client"; export default function StatsPage()

"use client";

export default function StatsPage() {
  return (
    <div>
      <h1>Statistics</h1>
      <p>TODO: implement statistics dashboard with charts</p>
    </div>
  );
}
```

#### `src/app/settings/page.tsx`
Create new file:

```typescript
// settings page - app configuration interface
// includes pin management, ai settings, appearance, blacklist, export/import, clear data
// TODO: implement settings form, pin set/remove, ai toggle, appearance options, blacklist management, export/import handlers
// why: central location for all app configuration and data management
// how: client component with multiple sections, form handlers, file operations
// syntax: "use client"; export default function SettingsPage()

"use client";

export default function SettingsPage() {
  return (
    <div>
      <h1>Settings</h1>
      <p>TODO: implement settings form</p>
    </div>
  );
}
```

### Components (`src/components/`)

#### `src/components/PinGate.tsx`
Create new file:

```typescript
// pin gate component - protects app with pin verification
// shows pin entry screen when pin is set and not verified
// TODO: implement pin verification screen, check pin status on mount, verify pin on submit, unlock app on success
// why: privacy protection for journal entries and habits
// how: client component checking pin status, showing input screen, verifying on submit
// syntax: "use client"; export default function PinGate({ children }: { children: React.ReactNode })

"use client";

export default function PinGate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
```

#### `src/components/RichTextEditor.tsx`
Create new file:

```typescript
// rich text editor component - contentEditable editor with formatting toolbar
// provides bold, italic, font size, color, and other formatting options
// TODO: implement contentEditable div, formatting toolbar, format handlers, lined paper background, page color
// why: allows users to format journal entry text with rich styling
// how: client component with contentEditable, execCommand for formatting, state management
// syntax: "use client"; export default function RichTextEditor({ value, onChange, ...props })

"use client";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  pageColor?: string;
  linedPaper?: boolean;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder,
  pageColor,
  linedPaper,
}: RichTextEditorProps) {
  return (
    <div>
      <p>TODO: implement rich text editor</p>
    </div>
  );
}
```

#### `src/components/PromptCard.tsx`
Create new file:

```typescript
// prompt component - NOT NEEDED with auto-insert approach
// prompts are automatically inserted as headers when page loads
// TODO: this file can be deleted or left empty - auto-insert logic goes in app/journal/new/page.tsx
// why: with auto-insert, prompts go directly into editor, no separate component needed
// how: Person 1 implements auto-insert in new entry page using useEffect and insertPromptAsHeading()
// syntax: prompts auto-inserted via editorRef.current?.insertPromptAsHeading(prompt)

"use client";

// TODO: this component is not needed with auto-insert approach
// delete this file or leave empty
```

#### `src/components/HabitCard.tsx`
Create new file:

```typescript
// habit card component - displays habit with progress and actions
// shows habit info, streak, progress, and logging interface
// TODO: implement habit card ui, progress display, streak badge, log button, recent activity
// why: reusable component for displaying habits consistently
// how: client component receiving habit data, displaying stats, handling log actions
// syntax: "use client"; export default function HabitCard({ habit, onLog }: { habit: Habit, onLog: (value?: number) => void })

"use client";

interface HabitCardProps {
  habit: any; // TODO: import Habit type
  onLog: (value?: number) => void;
}

export default function HabitCard({ habit, onLog }: HabitCardProps) {
  return (
    <div>
      <p>TODO: implement habit card</p>
    </div>
  );
}
```

### Database (`src/lib/db/`)

#### `src/lib/db/schema.ts`
Create new file:

```typescript
// database schema definitions - typescript interfaces for all database tables
// defines structure for profiles, entries, entities, habits, habitLogs, dailyAggregates, settings
// TODO: define all interfaces (Profile, Entry, Entity, Habit, HabitLog, DailyAggregate, Settings)
// why: type safety for database operations, clear data structure
// how: typescript interfaces with optional id fields, required fields, optional metadata
// syntax: export interface TableName { id?: number; field: type; ... }

// TODO: add all schema interfaces
```

#### `src/lib/db/dexie.ts`
Create new file:

```typescript
// dexie database instance - initializes indexeddb connection
// configures database schema, versions, and indexes
// TODO: create dexie database class, define tables, set up indexes, configure versions
// why: dexie provides typed indexeddb wrapper, manages schema migrations
// how: extend dexie class, define tables in schema, create indexes for queries
// syntax: export class TalkBookDB extends Dexie { ... }

// TODO: implement dexie database class
```

#### `src/lib/db/repo.ts`
Create new file:

```typescript
// database repository - crud operations for all tables
// provides typed functions for creating, reading, updating, deleting data
// TODO: Aadil implements entry and profile functions first, then Michael adds entity functions, Zayn adds habit functions
// why: centralized data access layer, type-safe database operations
// how: async functions using dexie instance, proper error handling, return typed data
// syntax: export async function operationName(params): Promise<ReturnType> { ... }
// coordination: Use Git branches - Aadil creates file, Michael and Zayn add functions on separate branches

// TODO: Aadil implements entry and profile functions first
// TODO: Michael adds entity functions (on separate branch)
// TODO: Zayn adds habit and aggregate functions (on separate branch)
```

### NLP (`src/lib/nlp/`)

#### `src/lib/nlp/extract.ts`
Create new file:

```typescript
// nlp extraction - extracts entities and sentiment from text
// uses compromise for people/topics, chrono-node for dates, wink-sentiment for sentiment
// TODO: implement extractMetadata function, extract people, topics, dates, sentiment from text
// why: provides data for prompt generation and insights
// how: async function processing text with nlp libraries, returning structured data
// syntax: export async function extractMetadata(text: string): Promise<{ people: string[], topics: string[], dates: Date[], sentiment: number }>

// TODO: implement extractMetadata function
```

#### `src/lib/nlp/prompts.ts`
Create new file:

```typescript
// prompt generation - generates personalized ai prompts based on journal history
// analyzes past entries to create relevant follow-up prompts
// prompts are auto-inserted as headers when new entry page loads
// TODO: implement generatePrompts function, analyze entities from past entries, create prompts with tone packs, filter blacklist
// why: provides personalized prompts to guide journaling
// how: async function fetching entities, analyzing patterns, generating prompts with templates
// syntax: export async function generatePrompts(count: number, tone: string, blacklist: string[], profileId: number): Promise<string[]>

// TODO: implement generatePrompts function
```

### Security (`src/lib/security/`)

#### `src/lib/security/pin.ts`
Create new file:

```typescript
// pin security system - handles pin hashing, verification, and storage
// uses web crypto api for secure hashing
// TODO: implement hashPin, setPin, verifyPin, isPinSet, removePin functions
// why: secure pin protection without storing plain text
// how: web crypto sha-256 hashing, localStorage for hash storage, async verification
// syntax: export async function functionName(pin: string): Promise<ReturnType>

// TODO: implement pin security functions
```

### Weather (`src/lib/weather/`)

#### `src/lib/weather/openMeteo.ts`
Create new file:

```typescript
// open-meteo api client - fetches current weather data
// gets weather for user's location or default location
// TODO: implement fetchWeather function, call open-meteo api, return weather code and temperature
// why: auto-fill weather in journal entries
// how: async function calling external api, error handling, return structured data
// syntax: export async function fetchWeather(lat?: number, lon?: number): Promise<{ code: number, temp: number }>

// TODO: implement fetchWeather function
```

#### `src/lib/weather/weatherCodes.ts`
Create new file:

```typescript
// weather code mapping - maps wmo weather codes to descriptions
// provides human-readable weather descriptions
// TODO: implement weatherCodeDescriptions object and getWeatherDescription function
// why: converts numeric weather codes to readable text
// how: object mapping codes to strings, function to lookup description
// syntax: const weatherCodeDescriptions: Record<number, string> = { ... }; export function getWeatherDescription(code: number): string

// TODO: implement weather code mapping
```

### Utils (`src/lib/utils.ts`)
Create new file:

```typescript
// utility functions - helper functions used throughout app
// date formatting, text processing, and other utilities
// TODO: implement formatDateKey, formatDate, truncateText, and other helper functions
// why: reusable utility functions to avoid code duplication
// how: pure functions with clear inputs and outputs
// syntax: export function functionName(params): ReturnType { ... }

// TODO: implement utility functions
```

### Stores (`src/store/`)

#### `src/store/uiStore.ts`
Create new file:

```typescript
// ui state management - manages client-side ui state
// pin lock state, loading states, modal states
// TODO: implement zustand store with isPinLocked, isPinVerified, isLoading, modal states and actions
// why: centralized ui state management, reactive updates
// how: zustand create() function, define state and actions
// syntax: export const useUIStore = create<UIState>((set) => ({ state, actions }))

import { create } from "zustand";

// TODO: implement ui store
```

#### `src/store/settingsStore.ts`
Create new file:

```typescript
// settings state management - manages user settings
// ai settings, appearance, blacklist, prompt preferences
// TODO: Aadil implements store structure and appearance settings first, then Michael adds AI settings
// why: centralized settings management, persistence to indexeddb
// how: zustand store with async load/save to database
// syntax: export const useSettingsStore = create<SettingsState>((set, get) => ({ state, actions }))
// coordination: Use Git branches - Aadil creates store, Michael adds AI settings on separate branch

import { create } from "zustand";

// TODO: Aadil implements store structure and appearance settings first
// TODO: Michael adds AI settings (on separate branch)
```


### Types (`src/types/`)

#### `src/types/wink-sentiment.d.ts`
Create new file:

```typescript
// type declaration for wink-sentiment package
// why: wink-sentiment doesn't have built-in typescript types
// how: declare module to tell typescript about the package
// syntax: declare module "wink-sentiment" { export function sentiment(text: string): { score: number; tokens: string[] }; }

declare module "wink-sentiment" {
  export function sentiment(text: string): {
    score: number;
    tokens: string[];
  };
}
```

### Root Files

#### `next-pwa.d.ts` (in root)
Create new file:

```typescript
// type declaration for next-pwa package
// why: next-pwa doesn't have built-in typescript types
// how: declare module to tell typescript about the package
// syntax: declare module "next-pwa";

declare module "next-pwa";
```

#### `public/manifest.json`
Create new file:

```json
{
  "name": "TalkBook",
  "short_name": "TalkBook",
  "description": "Privacy-first journaling and habit tracking PWA",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "icons": []
}
```

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

**You only need these 3 commands:**

1. **Create Next.js project:**
   ```bash
   npx create-next-app@latest talkbook
   ```
   - **What it does:** Creates the base Next.js project structure
   - **When:** First thing you do
   - **Why:** Sets up routing, build tools, and project structure automatically

2. **Install all dependencies (NLP, charts, database, etc.):**
   ```bash
   npm install zustand dexie compromise chrono-node wink-sentiment recharts dayjs next-pwa
   ```
   - **What it does:** Downloads and installs all libraries we need
   - **When:** After creating the project
   - **Why:** These libraries provide functionality (state management, database, NLP, charts, etc.)
   - **Learn more:** See `LIBRARY_CHOICES.md` for why we chose each one

3. **Install type definitions:**
   ```bash
   npm install -D @types/minimatch
   ```
   - **What it does:** Installs TypeScript type definitions
   - **When:** After installing main dependencies
   - **Why:** TypeScript needs type information to check your code

That's it! Then follow Part 2-4 to create all the files.

**What happens next?**
- You'll create all the skeleton files with proper structure
- Each file will have header comments explaining what to implement
- You'll verify everything works with `npm run dev`
- Then you can start implementing features!

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
```

---

## Next Steps

Once skeleton is complete and verified:

1. ✅ All files created with proper headers
2. ✅ `npm run dev` runs without errors
3. ✅ All pages load (even if empty)

**Then ask for help:**
- Delegating tasks to team members
- Adding detailed implementation comments
- Planning development order
- Starting implementation

---

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

**Remember:** It's okay to not understand everything immediately. Learning happens through doing. Use this manual, `LIBRARY_CHOICES.md`, and documentation to learn as you go!

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

