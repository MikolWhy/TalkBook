/**
 * Database Schema Definitions
 * 
 * TypeScript interfaces representing the structure of all IndexedDB tables.
 * Used for type safety across the database repository and UI layers.
 * 
 * @module src/lib/db/schema.ts
 */

// HABIT INTERFACES

export interface Habit {
  id?: number;
  profileId: number;
  name: string;
  type: 'boolean' | 'numeric';
  target?: number; // for numeric habits
  unit?: string; // "pages", "reps", "km"
  color: string; // hex color
  frequency: 'daily' | 'weekly' | 'monthly' | 'one-time';
  weekDays?: number[]; // [0-6] for weekly, 0=Sunday
  description?: string;
  archived: boolean;
  locked: boolean; // prevent accidental deletion
  createdAt: string;
  order?: number; // for drag and drop ordering
}

export interface HabitLog {
  id?: number;
  habitId: number;
  date: string; // YYYY-MM-DD
  value: number; // 1 for boolean, actual number for numeric
  completedAt: string;
}