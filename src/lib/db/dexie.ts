// dexie database instance - initializes indexeddb connection
// configures database schema, versions, and indexes
//
// WHAT WE'RE CREATING:
// - A Dexie database class that connects to IndexedDB (browser database)
// - Sets up all tables (profiles, entries, entities, habits, habitLogs, dailyAggregates, settings)
// - Configures indexes for fast queries (e.g., query entries by date, habits by profileId)
// - Handles database versioning for future migrations
//
// OWNERSHIP:
// - Aadil implements this completely (critical foundation file)
//
// COORDINATION NOTES:
// - Must be created after schema.ts (uses interfaces from schema.ts)
// - Others depend on this - Aadil creates first
//
// CONTEXT FOR AI ASSISTANTS:
// - Dexie is a wrapper around IndexedDB that makes it easier to use
// - IndexedDB is a browser database that stores data locally (like SQLite for browsers)
// - This file creates the database connection and defines table structures
// - Schema versions allow us to migrate data when we change the structure
// - Indexes make queries faster (e.g., querying entries by date, habits by profileId)
//
// DEVELOPMENT NOTES:
// - Always increment version when changing schema
// - Define indexes for fields you'll query frequently (date, profileId, habitId)
// - Compound indexes (e.g., "[habitId+date]") allow efficient multi-field queries
// - The database instance is exported and used in repo.ts for all CRUD operations
//
// TODO: create dexie database class
// - Extend Dexie class
// - Define tables in constructor using schema from schema.ts
// - Set up indexes for common queries (entries by date, habits by profileId, etc.)
// - Configure versioning for future migrations
//
// SYNTAX: 
// export class TalkBookDB extends Dexie {
//   tableName!: Table<Interface, number>;
//   constructor() {
//     super("TalkBookDB");
//     this.version(1).stores({ tableName: "++id, field1, field2" });
//   }
// }
// export const db = new TalkBookDB();

// TODO: implement dexie database class

import Dexie, { Table } from 'dexie';
import { Habit, HabitLog } from './schema';

export class TalkBookDB extends Dexie {
  // Zayn's tables
  habits!: Table<Habit, number>;
  habitLogs!: Table<HabitLog, number>;

  // TODO: Aadil will add: profiles, entries, entities, settings, dailyAggregates

  constructor() {
    super('TalkBookDB');

    // Define schema version 1
    this.version(1).stores({
      // Zayn's tables
      habits: '++id, profileId, archived, createdAt',
      habitLogs: '++id, habitId, date, [habitId+date], completedAt',
      
      // TODO: Aadil will add other tables here
    });
  }
}

// Export singleton instance
export const db = new TalkBookDB();