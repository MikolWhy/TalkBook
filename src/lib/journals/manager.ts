/**
 * Journal Organization Manager
 * 
 * Handles grouping journal entries into discrete "Journal" containers. 
 * Supports creation, renaming, deletion (with cascading cleanup), and active state management.
 * 
 * @module src/lib/journals/manager.ts
 */

export interface Journal {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

const JOURNALS_KEY = "talkbook-journals";
const ACTIVE_JOURNAL_KEY = "talkbook-active-journal";

// Initialize default journal if none exist
export function initializeJournals(): void {
  const journals = getJournals();
  if (journals.length === 0) {
    const defaultJournal: Journal = {
      id: "journal-1",
      name: "Journal-1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(JOURNALS_KEY, JSON.stringify([defaultJournal]));
    localStorage.setItem(ACTIVE_JOURNAL_KEY, defaultJournal.id);
  }
}

// Get all journals
export function getJournals(): Journal[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(JOURNALS_KEY);
  return stored ? JSON.parse(stored) : [];
}

// Get active journal ID
export function getActiveJournalId(): string {
  if (typeof window === "undefined") return "journal-1";
  return localStorage.getItem(ACTIVE_JOURNAL_KEY) || "journal-1";
}

// Set active journal
export function setActiveJournal(journalId: string): void {
  localStorage.setItem(ACTIVE_JOURNAL_KEY, journalId);
}

// Create new journal
export function createJournal(name: string): Journal {
  const journals = getJournals();

  // Limit to 15 journals
  if (journals.length >= 15) {
    throw new Error("Maximum of 15 journals allowed");
  }

  const newJournal: Journal = {
    id: `journal-${Date.now()}`,
    name: name.trim(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  journals.push(newJournal);
  localStorage.setItem(JOURNALS_KEY, JSON.stringify(journals));

  return newJournal;
}

// Rename journal
export function renameJournal(journalId: string, newName: string): void {
  const journals = getJournals();
  const journal = journals.find(j => j.id === journalId);

  if (journal) {
    journal.name = newName.trim();
    journal.updatedAt = new Date().toISOString();
    localStorage.setItem(JOURNALS_KEY, JSON.stringify(journals));
  }
}

// Delete journal
export function deleteJournal(journalId: string): void {
  const journals = getJournals();

  // Don't allow deleting the last journal
  if (journals.length <= 1) {
    throw new Error("Cannot delete the last journal");
  }

  const filtered = journals.filter(j => j.id !== journalId);
  localStorage.setItem(JOURNALS_KEY, JSON.stringify(filtered));

  // If deleting active journal, switch to first available
  const activeId = getActiveJournalId();
  if (activeId === journalId) {
    setActiveJournal(filtered[0].id);
  }

  // DELETE all entries from deleted journal (don't move them)
  const entries = JSON.parse(localStorage.getItem("journalEntries") || "[]");
  const updatedEntries = entries.filter((entry: any) =>
    (entry.journalId || "journal-1") !== journalId
  );
  localStorage.setItem("journalEntries", JSON.stringify(updatedEntries));
}

// Get journal by ID
export function getJournalById(journalId: string): Journal | undefined {
  return getJournals().find(j => j.id === journalId);
}

