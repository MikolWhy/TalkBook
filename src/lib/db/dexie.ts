// dexie database instance for indexeddb connection
// configures schema, versions, and indexes for fast queries

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