/**
 * Dexie Database Configuration
 * 
 * Initializes the IndexedDB instance and defines the store schema/indexes.
 * Versions are managed here to handle database migrations.
 * 
 * @module src/lib/db/dexie.ts
 */

import Dexie, { Table } from 'dexie';
import { Habit, HabitLog } from './schema';

export class TalkBookDB extends Dexie {
  habits!: Table<Habit, number>;
  habitLogs!: Table<HabitLog, number>;

  constructor() {
    super('TalkBookDB');

    this.version(1).stores({
      habits: '++id, profileId, archived, createdAt, order',
      habitLogs: '++id, habitId, date, [habitId+date], completedAt',
    });
  }
}

export const db = new TalkBookDB();