# TalkBook System Overview

This document provides a high-level overview of the TalkBook architecture, directory structure, and key components for developers.

## Directory Structure

The project follows a separation of concerns between standard Next.js routing and core application logic.

### `app/` (Next.js App Router)
Handles routing and page layouts. Files here are primarily containers that fetch data and render components from `src/`.

- `layout.tsx`: Root layout with global providers (`SidebarProvider`, `BackgroundColorProvider`, `LockScreen`).
- `page.tsx`: Home dashboard with progress overview.
- `api/quote/route.ts`: API route for fetching inspirational quotes.
- `journal/`: Journal feature routes.
  - `page.tsx`: Journal list view.
  - `new/page.tsx`: Create new journal entry.
  - `[id]/page.tsx`: View/edit individual journal entry.
- `habits/`: Habits feature routes.
  - `page.tsx`: Habits list view.
  - `new/page.tsx`: Create new habit.
  - `[id]/page.tsx`: View/edit individual habit.
- `stats/`: Statistics and analytics page.
- `settings/`: Settings and preferences page.
- `help/`: Help and documentation page.

### `src/components/` (UI & Logic)
All reusable components are located here, organized by type:

- **`layout/`**: Structural components.
  - `DashboardLayout`: Main wrapper for authenticated pages.
  - `AppSidebar`: Navigation sidebar with menu items.
- **`features/`**: Feature-specific complex components.
  - `journal/`: Journal management components.
    - `JournalEntryView`: Displays a single journal entry.
    - `JournalListSidebar`: Sidebar list of journal entries.
    - `JournalHeader`: Header for journal pages.
    - `JournalManageDialog`: Dialog for managing journals.
  - `stats/`: Statistics visualization components.
    - `ChartsSection`: Chart visualizations for stats.
    - `InsightsPanel`: Insights and analytics display.
    - `WordCloud`: Word cloud visualization.
  - `gamification/`: XP bars and notifications.
    - `XPProgressBar`: Progress bar for XP/level.
    - `XPNotification`: Notification component for XP gains.
  - `HabitCard`: Card component for displaying habits.
  - `LockScreen`: PIN-protected privacy lock screen.
  - `PromptSuggestions`: Smart prompt suggestions for journaling.
  - `TopicSuggestions`: Topic suggestions for journal entries.
- **`ui/`**: Generic, reusable UI elements.
  - `IOSList`: iOS-style scrollable list component.
  - `RichTextEditor`: TipTap-based rich text editor.
  - `ConfirmationModal`: Modal for confirmations.
  - `MoodSelector`: Mood selection component.
- **`providers/`**: React Context providers.
  - `SidebarProvider`: Manages sidebar open/closed state.
  - `BackgroundColorProvider`: Manages app background color theme.

### `src/lib/` (Business Logic)
Core logic decoupled from UI.

- **`db/`**: Database layer (Dexie.js for IndexedDB).
  - `dexie.ts`: Database initialization and configuration.
  - `repo.ts`: Repository pattern for DB access.
  - `schema.ts`: Database schema definitions (Habit, HabitLog).
- **`cache/`**: Performance optimization.
  - `entriesCache.ts`: Caching layer for journal entries.
  - `rebuildCache.ts`: Cache rebuilding utilities.
- **`gamification/`**: Gamification logic.
  - `xp.ts`: XP calculation and leveling system.
  - `pr.ts`: Personal Record tracking.
- **`journals/`**: Journal management logic.
  - `manager.ts`: Journal CRUD operations and management.
- **`nlp/`**: Natural Language Processing.
  - `extract.ts`: Entity extraction from text.
  - `prompts.ts`: Smart prompt generation for journaling.
  - `test-extraction.ts`: Testing utilities for NLP.
- **`analytics/`**: Analytics and insights.
  - `insights.ts`: Analytics calculations and insights generation.
- **`blacklist/`**: Content filtering.
  - `manager.ts`: Blacklist management for filtering content.
- **`security/`**: Security utilities.
  - `pin.ts`: PIN management and validation.
- **`utils.ts`**: General utility functions.

### `src/store/` (State Management)
Zustand stores for global state management.

- `settingsStore.ts`: Application settings and preferences.
- `uiStore.ts`: UI state (sidebar, modals, etc.).

## Data Storage Strategy

TalkBook uses a hybrid storage approach:

- **IndexedDB** (via Dexie.js): Stores habits and habit logs. Provides structured, queryable storage for habit tracking data.
- **localStorage**: Stores journal entries, settings, cache, XP data, and user preferences. Used for simpler key-value storage needs.
- **In-Memory Cache**: `entriesCache.ts` provides a caching layer for journal entries to improve performance.

### Storage Breakdown

| Data Type | Storage | Location |
|-----------|---------|----------|
| Habits | IndexedDB | `db.habits` table |
| Habit Logs | IndexedDB | `db.habitLogs` table |
| Journal Entries | localStorage | `journalEntries` key |
| Settings | localStorage | Various keys (e.g., `appBackgroundColor`) |
| XP/Level Data | localStorage | Managed by `xp.ts` |
| Cache | localStorage | Managed by `entriesCache.ts` |
| Blacklist | localStorage | `talkbook-blacklist` key |

## Key Architectural Decisions

1. **Strict Separation**: `app/` contains *only* routing and page-level data fetching. All UI and logic reside in `src/`.
2. **Feature Modules**: Complex features like "Journal" are modularized in `src/components/features/[feature]`.
3. **State Management**:
   - Global UI state (Sidebar, Theme) uses React Context (`providers/`).
   - Application settings use Zustand stores (`store/`).
   - Data state (Entries, Habits) is fetched in Pages and passed down, or managed via specialized Managers (e.g. `journals/manager.ts`).
4. **Client-Side Storage**: The app relies heavily on `localStorage` (Settings, Cache, Journals) and `IndexedDB` (Habits) for persistence, treating the browser as the database. No backend required.
5. **API Routes**: Minimal API usage - only `/api/quote` for external inspirational quotes. All other functionality is client-side.
6. **PWA Support**: Configured with `next-pwa` for offline capability and installability.

## Development Guidelines

- **Imports**: Always use the `@/` alias for imports from `src/` (e.g., `import { foo } from "@/lib/foo"`).
- **New Components**: 
  - Place in `src/components/ui` if generic and reusable.
  - Place in `src/components/features/[feature]` if feature-specific.
- **State Management**: 
  - Prefer passing props for simple component trees.
  - Use Context (`providers/`) only for truly global UI state.
  - Use Zustand stores (`store/`) for application-wide settings and preferences.
- **Data Access**: 
  - Use repository pattern (`lib/db/repo.ts`) for database operations.
  - Use managers (`lib/journals/manager.ts`) for complex feature logic.
  - Use cache layer (`lib/cache/entriesCache.ts`) for frequently accessed data.
- **Build Configuration**: The app uses webpack (not Turbopack) due to PWA requirements in `next.config.ts`.
