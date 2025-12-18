"use client";

/**
 * Journal Dashboard
 * 
 * Main view for managing journal entries. Includes search, filtering, 
 * and detailed entry viewing.
 * 
 * Flow:
 * - Wraps navigation in `DashboardLayout`.
 * - Manages selection state and broad journal organization.
 * - Composes specialized sub-components like `JournalListSidebar` and `JournalEntryView`.
 * - Syncs with the `entriesCache` for fast, offline-first data loading.
 * 
 * @module app/journal/page.tsx
 */

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  initializeJournals,
  getJournals,
  getActiveJournalId,
  setActiveJournal,
  type Journal
} from "@/lib/journals/manager";
import { getEntries, deleteEntry as deleteCachedEntry, type JournalEntry } from "@/lib/cache/entriesCache";

// New Components
import JournalHeader from "@/components/features/journal/JournalHeader";
import JournalListSidebar from "@/components/features/journal/JournalListSidebar";
import JournalEntryView from "@/components/features/journal/JournalEntryView";
import JournalManageDialog from "@/components/features/journal/JournalManageDialog";

export default function JournalPage() {
  const [selectedEntryId, setSelectedEntryId] = useState<string | number | null>(null);
  const [entries, setEntries] = useState<JournalEntry[]>([]);

  // Journal management state
  const [journals, setJournals] = useState<Journal[]>([]);
  const [activeJournalId, setActiveJournalIdState] = useState<string>("");
  const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);

  // Initialize journals on mount
  useEffect(() => {
    initializeJournals();
    updateJournalsList();
  }, []);

  const updateJournalsList = () => {
    const loadedJournals = getJournals();
    setJournals(loadedJournals);
    setActiveJournalIdState(getActiveJournalId());
  };

  const handleSetActiveJournal = (id: string) => {
    setActiveJournalIdState(id);
    setActiveJournal(id);
  };

  const loadEntries = () => {
    try {
      // OPTIMIZATION: Use cached entries
      const storedEntries = getEntries();

      // Filter entries by active journal
      const journalEntries = storedEntries.filter(
        (entry) => (entry.journalId || "journal-1") === activeJournalId
      );

      // Sort by createdAt (newest first)
      const sortedEntries = journalEntries.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setEntries(sortedEntries);
    } catch (error) {
      console.error("Error loading entries from localStorage:", error);
      setEntries([]);
    }
  };

  // Load entries on mount and when page becomes visible or active journal changes
  useEffect(() => {
    if (activeJournalId) {
      loadEntries();
    }

    // Reload when page becomes visible (user navigates back from new entry page)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadEntries();
      }
    };

    // Listen for storage changes (in case entries are added from another tab)
    window.addEventListener("storage", loadEntries);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Also reload on focus (when user switches back to this tab)
    window.addEventListener("focus", loadEntries);

    return () => {
      window.removeEventListener("storage", loadEntries);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", loadEntries);
    };
  }, [activeJournalId]);

  const handleDeleteEntry = (entryId: string | number) => {
    if (!confirm("Are you sure you want to delete this entry? This action cannot be undone.")) {
      return;
    }

    try {
      // OPTIMIZATION: Use cache deletion
      deleteCachedEntry(entryId as string);

      // Reload entries
      loadEntries();

      // Clear selection if deleted entry was selected
      if (selectedEntryId === entryId) {
        setSelectedEntryId(null);
      }
    } catch (error) {
      console.error("Error deleting entry:", error);
      alert("Failed to delete entry. Please try again.");
    }
  };

  const selectedEntry = entries.find((e) => e.id === selectedEntryId) || null;

  return (
    <DashboardLayout>
      <div className="container">
        {/* Header Section */}
        <JournalHeader
          journals={journals}
          activeJournalId={activeJournalId}
          onSetActiveJournal={handleSetActiveJournal}
          onManageJournals={() => setIsManageDialogOpen(true)}
        />

        {/* Manage Journals Dialog */}
        <JournalManageDialog
          isOpen={isManageDialogOpen}
          onClose={() => setIsManageDialogOpen(false)}
          journals={journals}
          onJournalsUpdated={() => {
            updateJournalsList();
            // Just in case current journal was deleted or renamed, we refresh everything
            // The dialog component handles logic, but parent refresh is good.
          }}
          activeJournalId={activeJournalId}
          onSetActiveJournal={handleSetActiveJournal}
        />

        <div className=" flex h-[calc(100vh-200px)] gap-4 mt-6">
          {/* Left Sidebar - 1/3 width: Search and Scrollable List */}
          <JournalListSidebar
            entries={entries}
            selectedEntryId={selectedEntryId}
            onSelectEntry={setSelectedEntryId}
          />

          {/* Right Section - 2/3 width: View Selected Page */}
          <JournalEntryView
            entry={selectedEntry}
            onDelete={(id) => handleDeleteEntry(id)}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
