// XP and Leveling System
// Manages user progression, experience points, and level calculations

const XP_STORAGE_KEY = "talkbook-xp";
const LEVEL_STORAGE_KEY = "talkbook-level";
const LAST_ENTRY_DATE_KEY = "talkbook-last-entry-date";

// XP Rewards Configuration
export const XP_CONFIG = {
  ENTRY_BASE: 25,           // Base XP per entry saved
  WORD_MULTIPLIER: 1,       // XP per word
  DAILY_BONUS: 100,         // Bonus for first entry of the day
  
  // Streak Multipliers
  STREAK_7_DAYS: 1.5,       // 7-day streak
  STREAK_14_DAYS: 1.75,     // 14-day streak
  STREAK_30_DAYS: 1.85,     // 30-day streak
  STREAK_60_DAYS: 2.0,      // 60-day streak

  // Habit XP Rewards
  HABIT_BOOLEAN: 2,         // XP per checkbox/boolean habit
  HABIT_NUMERIC: 1,         // XP per numeric value logged
  HABIT_3_BONUS: 5,         // Bonus for completing 3+ habits in a day
  HABIT_5_BONUS: 10,        // Total bonus for completing 5+ habits in a day (5 + 5)
  
  // Habit Streak Multipliers
  HABIT_STREAK_7_DAYS: 2.0,   // 7-day habit streak
  HABIT_STREAK_14_DAYS: 3.0,  // 14-day habit streak
  HABIT_STREAK_30_DAYS: 4.0,  // 30-day habit streak
  HABIT_STREAK_60_DAYS: 5.0,  // 60-day habit streak
  HABIT_STREAK_90_DAYS: 6.0,  // 90-day habit streak
};

// Level Curve Configuration
// Hybrid curve: Easy early levels (1-10), then gradually increases
export function getXPForLevel(level: number): number {
  if (level <= 1) return 0;
  
  // Levels 2-10: Linear and easy (500 XP per level)
  if (level <= 10) {
    return (level - 1) * 500;
  }
  
  // Levels 11-30: Moderate increase (exponential starts)
  if (level <= 30) {
    const baseXP = 10 * 500; // XP from levels 2-10
    const additionalLevels = level - 10;
    return baseXP + (additionalLevels * 800) + (additionalLevels * additionalLevels * 50);
  }
  
  // Levels 31-60: Steeper curve
  if (level <= 60) {
    const baseXP = 10 * 500 + (20 * 800) + (20 * 20 * 50); // Up to level 30
    const additionalLevels = level - 30;
    return baseXP + (additionalLevels * 1500) + (additionalLevels * additionalLevels * 100);
  }
  
  // Levels 61+: Very steep (for long-term users)
  const baseXP = 10 * 500 + (20 * 800) + (20 * 20 * 50) + (30 * 1500) + (30 * 30 * 100);
  const additionalLevels = level - 60;
  return baseXP + (additionalLevels * 2500) + (additionalLevels * additionalLevels * 200);
}

// Get total XP needed to reach a specific level from level 1
export function getTotalXPForLevel(level: number): number {
  let total = 0;
  for (let i = 2; i <= level; i++) {
    total += getXPForLevel(i);
  }
  return total;
}

// Calculate level from total XP
export function calculateLevelFromXP(totalXP: number): { level: number; currentLevelXP: number; nextLevelXP: number; progress: number } {
  let level = 1;
  let xpInCurrentLevel = totalXP;
  
  while (xpInCurrentLevel >= getXPForLevel(level + 1)) {
    xpInCurrentLevel -= getXPForLevel(level + 1);
    level++;
    
    // Safety cap at level 100
    if (level >= 100) break;
  }
  
  const nextLevelXP = getXPForLevel(level + 1);
  const progress = nextLevelXP > 0 ? (xpInCurrentLevel / nextLevelXP) * 100 : 0;
  
  return {
    level,
    currentLevelXP: xpInCurrentLevel,
    nextLevelXP,
    progress,
  };
}

// Get current XP and level
export function getCurrentXP(): number {
  if (typeof window === "undefined") return 0;
  const stored = localStorage.getItem(XP_STORAGE_KEY);
  return stored ? parseInt(stored, 10) : 0;
}

export function getCurrentLevel(): number {
  if (typeof window === "undefined") return 1;
  const stored = localStorage.getItem(LEVEL_STORAGE_KEY);
  return stored ? parseInt(stored, 10) : 1;
}

// Award XP for a journal entry
export function awardEntryXP(
  wordCount: number,
  journalStreak: number
): { xp: number; breakdown: { base: number; words: number; dailyBonus: number; streakMultiplier: number; total: number }; leveledUp: boolean; oldLevel: number; newLevel: number } {
  
  const today = new Date().toISOString().split("T")[0];
  const lastEntryDate = typeof window !== "undefined" ? localStorage.getItem(LAST_ENTRY_DATE_KEY) : null;
  const isFirstEntryToday = lastEntryDate !== today;
  
  // Base XP
  let baseXP = XP_CONFIG.ENTRY_BASE;
  
  // Word count XP
  const wordXP = wordCount * XP_CONFIG.WORD_MULTIPLIER;
  
  // Daily bonus
  const dailyBonus = isFirstEntryToday ? XP_CONFIG.DAILY_BONUS : 0;
  
  // Calculate streak multiplier
  let streakMultiplier = 1.0;
  if (journalStreak >= 60) {
    streakMultiplier = XP_CONFIG.STREAK_60_DAYS;
  } else if (journalStreak >= 30) {
    streakMultiplier = XP_CONFIG.STREAK_30_DAYS;
  } else if (journalStreak >= 14) {
    streakMultiplier = XP_CONFIG.STREAK_14_DAYS;
  } else if (journalStreak >= 7) {
    streakMultiplier = XP_CONFIG.STREAK_7_DAYS;
  }
  
  // Calculate total XP with streak multiplier
  const subtotal = baseXP + wordXP + dailyBonus;
  const totalXP = Math.round(subtotal * streakMultiplier);
  
  // Get current state
  const currentTotalXP = getCurrentXP();
  const currentLevel = calculateLevelFromXP(currentTotalXP).level;
  
  // Add XP
  const newTotalXP = currentTotalXP + totalXP;
  const newState = calculateLevelFromXP(newTotalXP);
  
  // Save to localStorage
  if (typeof window !== "undefined") {
    localStorage.setItem(XP_STORAGE_KEY, newTotalXP.toString());
    localStorage.setItem(LEVEL_STORAGE_KEY, newState.level.toString());
    if (isFirstEntryToday) {
      localStorage.setItem(LAST_ENTRY_DATE_KEY, today);
    }
  }
  
  const leveledUp = newState.level > currentLevel;
  
  return {
    xp: totalXP,
    breakdown: {
      base: baseXP,
      words: wordXP,
      dailyBonus,
      streakMultiplier,
      total: totalXP,
    },
    leveledUp,
    oldLevel: currentLevel,
    newLevel: newState.level,
  };
}

// Award XP for habit logging
export function awardHabitXP(
  habitType: 'boolean' | 'numeric',
  numericValue: number,
  habitStreak: number,
  totalHabitsCompletedToday: number
): { 
  xp: number; 
  breakdown: { 
    base: number; 
    bonus: number; 
    streakMultiplier: number; 
    total: number 
  }; 
  leveledUp: boolean; 
  oldLevel: number;
  newLevel: number;
} {
  // Base XP calculation with diminishing returns for numeric habits
  let baseXP = 0;
  if (habitType === 'boolean') {
    baseXP = XP_CONFIG.HABIT_BOOLEAN; // 2 XP for checkbox
  } else {
    // Diminishing returns for numeric habits to prevent abuse
    // 0-100: 1 XP per rep
    // 101-300: 1 XP per 2 reps
    // 301-500: 1 XP per 3 reps
    // 501+: 1 XP per 5 reps
    
    if (numericValue <= 100) {
      baseXP = numericValue;
    } else if (numericValue <= 300) {
      baseXP = 100 + Math.floor((numericValue - 100) / 2);
    } else if (numericValue <= 500) {
      baseXP = 100 + 100 + Math.floor((numericValue - 300) / 3);
    } else {
      baseXP = 100 + 100 + 66 + Math.floor((numericValue - 500) / 5);
    }
  }
  
  // Daily completion bonus
  let bonusXP = 0;
  if (totalHabitsCompletedToday >= 5) {
    bonusXP = XP_CONFIG.HABIT_5_BONUS; // 10 XP total (5 + 5)
  } else if (totalHabitsCompletedToday >= 3) {
    bonusXP = XP_CONFIG.HABIT_3_BONUS; // 5 XP
  }
  
  // Calculate habit streak multiplier
  let streakMultiplier = 1.0;
  if (habitStreak >= 90) {
    streakMultiplier = XP_CONFIG.HABIT_STREAK_90_DAYS;
  } else if (habitStreak >= 60) {
    streakMultiplier = XP_CONFIG.HABIT_STREAK_60_DAYS;
  } else if (habitStreak >= 30) {
    streakMultiplier = XP_CONFIG.HABIT_STREAK_30_DAYS;
  } else if (habitStreak >= 14) {
    streakMultiplier = XP_CONFIG.HABIT_STREAK_14_DAYS;
  } else if (habitStreak >= 7) {
    streakMultiplier = XP_CONFIG.HABIT_STREAK_7_DAYS;
  }
  
  // Apply multiplier to base + bonus
  const subtotal = baseXP + bonusXP;
  const totalXP = Math.round(subtotal * streakMultiplier);
  
  // Get current state
  const currentTotalXP = getCurrentXP();
  const currentLevel = calculateLevelFromXP(currentTotalXP).level;
  
  // Add XP
  const newTotalXP = currentTotalXP + totalXP;
  const newState = calculateLevelFromXP(newTotalXP);
  
  // Save to localStorage
  if (typeof window !== "undefined") {
    localStorage.setItem(XP_STORAGE_KEY, newTotalXP.toString());
    localStorage.setItem(LEVEL_STORAGE_KEY, newState.level.toString());
  }
  
  const leveledUp = newState.level > currentLevel;
  
  return {
    xp: totalXP,
    breakdown: {
      base: baseXP,
      bonus: bonusXP,
      streakMultiplier,
      total: totalXP,
    },
    leveledUp,
    oldLevel: currentLevel,
    newLevel: newState.level,
  };
}

// Get user's current stats
export function getUserStats(): {
  totalXP: number;
  level: number;
  currentLevelXP: number;
  nextLevelXP: number;
  progress: number;
} {
  const totalXP = getCurrentXP();
  const stats = calculateLevelFromXP(totalXP);
  
  return {
    totalXP,
    ...stats,
  };
}

// Calculate global habit streak (days with at least 1 habit completed)
// This should be called from the habits page with habit log data
export async function calculateGlobalHabitStreak(): Promise<number> {
  if (typeof window === "undefined") return 0;
  
  try {
    const { db } = await import("../db/dexie");
    const { getActiveHabits } = await import("../db/repo");
    
    const habits = await getActiveHabits(1); // TODO: get profileId from context
    if (habits.length === 0) return 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let currentDate = new Date(today);
    let streak = 0;
    
    // Go backwards day by day
    while (true) {
      const dateString = currentDate.toISOString().split('T')[0];
      
      // Check if at least one habit was completed this day
      let anyCompleted = false;
      
      for (const habit of habits) {
        if (!habit.id) continue;
        
        const log = await db.habitLogs
          .where('[habitId+date]')
          .equals([habit.id, dateString])
          .first();
        
        if (log && log.value > 0) {
          anyCompleted = true;
          break;
        }
      }
      
      if (anyCompleted) {
        streak++;
        // Move to previous day
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        // Gap in streak, stop counting
        break;
      }
      
      // Safety limit
      if (streak > 10000) break;
    }
    
    return streak;
  } catch (error) {
    console.error("Failed to calculate global habit streak:", error);
    return 0;
  }
}

// Reset XP and level (for reset button in settings)
export function resetXP(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(XP_STORAGE_KEY);
    localStorage.removeItem(LEVEL_STORAGE_KEY);
    localStorage.removeItem(LAST_ENTRY_DATE_KEY);
  }
}

