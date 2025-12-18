/**
 * Database Repository
 * 
 * The central data access layer for the application. Provides type-safe functions 
 * for all CRUD operations targeting IndexedDB.
 * 
 * Core areas:
 * - Habits & Habit Logs: Creation, tracking, and streak calculations.
 * - Global Stats: High-level analytics like global habit streaks.
 * 
 * Note: All database interactions should go through this repository to ensure 
 * consistent error handling and type safety.
 * 
 * @module src/lib/db/repo.ts
 */

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

export async function toggleHabitLock(habitId: number): Promise<void> {
  try {
    const habit = await db.habits.get(habitId);
    if (habit) {
      await db.habits.update(habitId, { locked: !habit.locked });
    }
  } catch (error) {
    console.error('Failed to toggle habit lock:', error);
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

export async function deleteHabit(id: number): Promise<void> {
  try {
    // Delete all logs for this habit first
    await db.habitLogs.where('habitId').equals(id).delete();
    // Delete the habit itself
    await db.habits.delete(id);
  } catch (error) {
    console.error('Failed to delete habit:', error);
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