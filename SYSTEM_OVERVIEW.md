# TalkBook System Overview

This document provides a high-level overview of the TalkBook architecture, directory structure, and key components.

## Directory Structure

The project follows a separation of concerns between standard Next.js routing and core application logic.

### `app/` (Next.js App Router)
Handles routing and page layouts. Files here are primarily containers that fetch data and render components from `src/`.
- `layout.tsx`: Root layout with global providers (`SidebarProvider`, `BackgroundColorProvider`).
- `page.tsx`: Home dashboard.
- `journal/`: Journal feature routes (`list`, `new`, `edit`).
- `habits/`: Habits feature routes.
- `stats/`: Statistics page.
- `settings/`: Settings page.

### `src/components/` (UI & Logic)
All reusable components are located here, organized by type:

- **`layout/`**: Structural components.
  - `DashboardLayout`: Main wrapper for authenticated pages.
  - `Sidebar`: Navigation sidebar.
- **`features/`**: Feature-specific complex components.
  - `journal/`: Journal management (`EntryView`, `ListSidebar`, `ManageDialog`).
  - `gamification/`: XP bars, notifications.
  - `LockScreen`: Privacy lock.
- **`ui/`**: Generic, reusable UI elements.
  - `IOSList`: iOS-style scrollable list.
  - `RichTextEditor`: TipTap-based editor.
- **`providers/`**: React Context providers.

### `src/lib/` (Business Logic)
Core logic decoupled from UI.

- **`db/`**: Database layer (Dexie.js).
  - `repo.ts`: Repository pattern for DB access.
  - `schema.ts`: Database schema definitions.
- **`cache/`**: Performance optimization.
  - `entriesCache.ts`: Caching layer for journal entries.
- **`gamification/`**: Gamification logic.
  - `xp.ts`: XP calculation and leveling.
  - `pr.ts`: Personal Record tracking.
- **`nlp/`**: Natural Language Processing.
  - `extract.ts`: Entity extraction from text.
  - `prompts.ts`: Smart prompt generation.
- **`journals/`**: Journal management logic.

## Key Architectural Decisions

1.  **Strict Separation**: `app/` contains *only* routing and page-level data fetching. All UI and logic reside in `src/`.
2.  **Feature Modules**: Complex features like "Journal" are modularized in `src/components/features/journal`.
3.  **Local vs Global State**: 
    - Global UI state (Sidebar, Theme) uses Context.
    - Data state (Entries, Habits) is fetched in Pages and passed down, or managed via specialized Managers (e.g. `journals/manager.ts`).
4.  **Client-Side Storage**: The app relies heavily on `localStorage` (Settings, Cache) and `IndexedDB` (Habits) for persistence, treating the browser as the database.

## Development Guidelines

- **Imports**: Always use the `@/` alias for imports from `src/` (e.g., `import { foo } from "@/lib/foo"`).
- **New Components**: Place in `src/components/ui` if generic, or `src/components/features/[feature]` if specific.
- **State**: Prefer passing props for simple component trees. Use Context only for truly global UI state.
