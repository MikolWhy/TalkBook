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

