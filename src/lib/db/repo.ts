// database repository - crud operations for all tables
// provides typed functions for creating, reading, updating, deleting data
//
// WHAT WE'RE CREATING:
// - A centralized file with all database operations (save, load, update, delete)
// - Functions for entries, entities, habits, habit logs, aggregates, settings, profiles
// - All database code goes here (not scattered across components)
// - Type-safe functions that use interfaces from schema.ts
//
// OWNERSHIP:
// - Aadil creates file structure and entry/profile/settings functions first
// - Michael adds entity functions (on separate branch, merge after Aadil)
// - Zayn adds habit and aggregate functions (on separate branch, merge after Aadil)
//
// COORDINATION NOTES:
// - Aadil creates file first - this is critical, others wait for this
// - Michael creates branch: `git checkout -b michael/entity-functions`
// - Zayn creates branch: `git checkout -b zayn/habit-functions`
// - Coordinate merges with Aadil (he reviews shared file changes)
//
// CONTEXT FOR AI ASSISTANTS:
// - This is the data access layer - all database operations go through here
// - Functions are async because IndexedDB operations are asynchronous
// - Always use try/catch for error handling
// - Return typed data (use interfaces from schema.ts)
// - This file is imported by pages and components to interact with the database
//
// DEVELOPMENT NOTES:
// - Keep functions focused - one function per operation
// - Use Dexie query methods: .add(), .get(), .where(), .update(), .delete()
// - For complex queries, use .filter() after .where()
// - Always validate input data before saving
// - Consider transaction safety for multi-table operations
//
// COORDINATION NOTES:
// - Aadil creates file structure and entry functions first
// - Michael adds entity functions (use Git branch, merge after Aadil)
// - Zayn adds habit and aggregate functions (use Git branch, merge after Aadil)
// - Use Git branches to avoid conflicts, coordinate merges
//
// TODO: implement all crud functions
//
// PROFILE OPERATIONS (Aadil):
// - getOrCreateDefaultProfile(): get existing profile or create default one
//
// ENTRY OPERATIONS (Aadil):
// - createEntry(entry): create new journal entry
// - getEntries(startDate?, endDate?): get entries, optionally filtered by date range
// - getEntryById(id): get single entry by id
// - updateEntry(id, updates): update existing entry
// - deleteEntry(id): delete entry (soft delete by setting archived flag)
// - getRecentEntries(limit): get most recent entries for home page
//
// ENTITY OPERATIONS (Michael - add after Aadil creates file):
// - createEntity(entity): save extracted entity (person, topic, date, sentiment)
// - getEntitiesForPrompts(profileId, daysBack): get entities from recent entries for prompt generation
// - getEntitiesByType(type, profileId): get entities filtered by type (person, topic, etc.)
//
// HABIT OPERATIONS (Zayn - add after Aadil creates file):
// - createHabit(habit): create new habit
// - getActiveHabits(profileId): get all non-archived habits
// - getHabitById(id): get single habit by id
// - updateHabit(id, updates): update existing habit
// - archiveHabit(id): soft delete habit (set archived flag)
//
// HABIT LOG OPERATIONS (Zayn - add after Aadil creates file):
// - logHabit(habitId, date, value?): log habit completion (upsert - replaces if exists)
// - getHabitLogs(habitId, startDate?, endDate?): get logs for date range
// - calculateStreak(habitId): calculate current streak (consecutive days with logs)
//
// DAILY AGGREGATE OPERATIONS (Zayn - add after Aadil creates file):
// - createOrUpdateDailyAggregate(date, data): store pre-computed daily stats
// - getDailyAggregates(startDate, endDate): get aggregates for date range (for stats page)
//
// SETTINGS OPERATIONS (Aadil):
// - getSettings(profileId): get user settings
// - updateSettings(profileId, updates): update settings
//
// SYNTAX: export async function operationName(params): Promise<ReturnType> { ... }

// TODO: Aadil implements entry and profile functions first, then Michael and Zayn add their functions on separate branches

import { db } from './dexie';
import { Habit, HabitLog } from './schema';

// ============================================================================
// HABIT OPERATIONS (Zayn)
// ============================================================================

export async function createHabit(habit: Omit<Habit, 'id'>): Promise<Habit> {
  try {
    // Get the current max order to place new habit at the end
    const existingHabits = await db.habits
      .where('profileId')
      .equals(habit.profileId)
      .filter(h => !h.archived)
      .toArray();
    
    const maxOrder = existingHabits.reduce((max, h) => {
      return Math.max(max, h.order ?? 0);
    }, -1);
    
    const habitWithOrder = {
      ...habit,
      order: maxOrder + 1
    };
    
    const id = await db.habits.add(habitWithOrder);
    return { ...habitWithOrder, id };
  } catch (error) {
    console.error('Failed to create habit:', error);
    throw error;
  }
}

export async function getActiveHabits(profileId: number): Promise<Habit[]> {
  try {
    const habits = await db.habits
      .where('profileId')
      .equals(profileId)
      .filter(habit => !habit.archived)
      .toArray();
    
    // Sort by order, then by createdAt
    return habits.sort((a, b) => {
      const orderA = a.order ?? 999999;
      const orderB = b.order ?? 999999;
      if (orderA !== orderB) return orderA - orderB;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  } catch (error) {
    console.error('Failed to get active habits:', error);
    throw error;
  }
}

export async function updateHabitOrder(habitIds: number[]): Promise<void> {
  try {
    // Update order for all habits based on their position in the array
    for (let i = 0; i < habitIds.length; i++) {
      await db.habits.update(habitIds[i], { order: i });
    }
  } catch (error) {
    console.error('Failed to update habit order:', error);
    throw error;
  }
}

export async function getHabitById(id: number): Promise<Habit | undefined> {
  try {
    return await db.habits.get(id);
  } catch (error) {
    console.error('Failed to get habit by id:', error);
    throw error;
  }
}

export async function updateHabit(
  id: number,
  updates: Partial<Habit>
): Promise<void> {
  try {
    await db.habits.update(id, updates);
  } catch (error) {
    console.error('Failed to update habit:', error);
    throw error;
  }
}

export async function archiveHabit(id: number): Promise<void> {
  try {
    await db.habits.update(id, { archived: true });
  } catch (error) {
    console.error('Failed to archive habit:', error);
    throw error;
  }
}

// ============================================================================
// HABIT LOG OPERATIONS (Zayn)
// ============================================================================

export async function logHabit(
  habitId: number,
  date: string,
  value: number
): Promise<HabitLog> {
  try {
    // Check if log already exists for this date (upsert logic)
    const existing = await db.habitLogs
      .where('[habitId+date]')
      .equals([habitId, date])
      .first();

    if (existing) {
      // Update existing log
      await db.habitLogs.update(existing.id!, {
        value,
        completedAt: new Date().toISOString(),
      });
      return { ...existing, value, completedAt: new Date().toISOString() };
    } else {
      // Create new log
      const id = await db.habitLogs.add({
        habitId,
        date,
        value,
        completedAt: new Date().toISOString(),
      });
      return { id, habitId, date, value, completedAt: new Date().toISOString() };
    }
  } catch (error) {
    console.error('Failed to log habit:', error);
    throw error;
  }
}

export async function getHabitLogs(
  habitId: number,
  startDate?: string,
  endDate?: string
): Promise<HabitLog[]> {
  try {
    let logs = await db.habitLogs.where('habitId').equals(habitId).toArray();

    // Filter by date range if provided
    if (startDate && endDate) {
      logs = logs.filter((log) => log.date >= startDate && log.date <= endDate);
    } else if (startDate) {
      logs = logs.filter((log) => log.date >= startDate);
    } else if (endDate) {
      logs = logs.filter((log) => log.date <= endDate);
    }

    // Sort by date descending
    return logs.sort((a, b) => b.date.localeCompare(a.date));
  } catch (error) {
    console.error('Failed to get habit logs:', error);
    throw error;
  }
}

export async function calculateStreak(habitId: number): Promise<number> {
  try {
    // Get the habit to know its type and target
    const habit = await getHabitById(habitId);
    if (!habit) return 0;

    const logs = await db.habitLogs
      .where('habitId')
      .equals(habitId)
      .toArray();

    if (logs.length === 0) return 0;

    // Filter logs to only include completed ones
    const completedLogs = logs.filter(log => {
      if (habit.type === 'boolean') {
        // Boolean: completed if value > 0
        return log.value > 0;
      } else {
        // Numeric: completed if value >= target (or > 0 if no target)
        return habit.target ? log.value >= habit.target : log.value > 0;
      }
    });

    if (completedLogs.length === 0) return 0;

    // Get unique dates from completed logs only
    const datesWithCompletedLogs = new Set(completedLogs.map(log => log.date));
    const sortedDates = Array.from(datesWithCompletedLogs).sort((a, b) => b.localeCompare(a));

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Start from today and go backwards
    let currentDate = new Date(today);
    let dateIndex = 0;

    while (dateIndex < sortedDates.length) {
      const dateString = currentDate.toISOString().split('T')[0];
      
      // Check if this date has a completed log
      if (sortedDates[dateIndex] === dateString) {
        streak++;
        dateIndex++;
        // Move to previous day
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        // Gap in streak, stop counting
        break;
      }
    }

    return streak;
  } catch (error) {
    console.error('Failed to calculate streak:', error);
    return 0;
  }
}

export async function calculateGlobalStreak(profileId: number): Promise<number> {
  try {
    // Get all active habits
    const habits = await getActiveHabits(profileId);
    
    if (habits.length === 0) return 0;

    // Filter out one-time goals - they don't contribute to daily streaks
    // Global streak is for days where all recurring habits are completed
    const recurringHabits = habits.filter(habit => habit.frequency !== 'one-time');
    
    // If no recurring habits, return 0 (can't have a daily streak without daily habits)
    if (recurringHabits.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let currentDate = new Date(today);
    let streak = 0;
    
    // Safety: limit to checking last 365 days to prevent infinite loops
    const maxDaysToCheck = 365;
    let daysChecked = 0;

    // Go backwards day by day
    while (daysChecked < maxDaysToCheck) {
      const dateString = currentDate.toISOString().split('T')[0];
      daysChecked++;
      
      // Check if all recurring habits have logs for this date and are completed
      let allCompleted = true;
      
      for (const habit of recurringHabits) {
        if (!habit.id) continue;
        
        // Check if completed on this specific date
        const log = await db.habitLogs
          .where('[habitId+date]')
          .equals([habit.id, dateString])
          .first();
        
        if (!log) {
          allCompleted = false;
          break;
        }
        
        // Check if habit is actually completed
        if (habit.type === 'boolean') {
          // Boolean habits: completed if value > 0
          if (log.value <= 0) {
            allCompleted = false;
            break;
          }
        } else if (habit.type === 'numeric') {
          // Numeric habits: completed if value >= target (or > 0 if no target)
          if (habit.target) {
            if (log.value < habit.target) {
              allCompleted = false;
              break;
            }
          } else {
            // No target set, just check if value > 0
            if (log.value <= 0) {
              allCompleted = false;
              break;
            }
          }
        }
      }
      
      if (allCompleted) {
        streak++;
        // Move to previous day
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        // Gap in streak, stop counting
        break;
      }
    }

    return streak;
  } catch (error) {
    console.error('Failed to calculate global streak:', error);
    return 0;
  }
}