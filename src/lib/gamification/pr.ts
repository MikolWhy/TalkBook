// Personal Record (PR) Tracking System
// Tracks best performance for each habit (case-insensitive)

const PR_STORAGE_KEY = "talkbook-habit-prs";

// Normalize habit name for case-insensitive comparison
function normalizeHabitName(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '');
}

// Get all PRs from localStorage
function getAllPRs(): Record<string, number> {
  if (typeof window === "undefined") return {};
  const stored = localStorage.getItem(PR_STORAGE_KEY);
  return stored ? JSON.parse(stored) : {};
}

// Save all PRs to localStorage
function saveAllPRs(prs: Record<string, number>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PR_STORAGE_KEY, JSON.stringify(prs));
}

// Get PR for a specific habit
export function getHabitPR(habitName: string): number | null {
  const normalizedName = normalizeHabitName(habitName);
  const prs = getAllPRs();
  return prs[normalizedName] ?? null;
}

// Update PR for a habit if the new value is higher
export function updateHabitPR(habitName: string, value: number): { 
  isNewPR: boolean; 
  previousPR: number | null; 
  newPR: number 
} {
  const normalizedName = normalizeHabitName(habitName);
  const prs = getAllPRs();
  const previousPR = prs[normalizedName] ?? null;
  
  // Only update if new value is higher than current PR
  if (previousPR === null || value > previousPR) {
    prs[normalizedName] = value;
    saveAllPRs(prs);
    return {
      isNewPR: true,
      previousPR,
      newPR: value
    };
  }
  
  return {
    isNewPR: false,
    previousPR,
    newPR: previousPR
  };
}

// Clear PR for a specific habit
export function clearHabitPR(habitName: string): void {
  const normalizedName = normalizeHabitName(habitName);
  const prs = getAllPRs();
  delete prs[normalizedName];
  saveAllPRs(prs);
}

// Clear all PRs
export function clearAllPRs(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PR_STORAGE_KEY);
}

