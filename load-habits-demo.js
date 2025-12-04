// Load Habits Demo Data
// Run this AFTER loading the localStorage data
// This script should be run in the browser console on your TalkBook app
// It accesses the app's Dexie database instance

(async function() {
  try {
    // Access the database through the app's module system
    // This works when the Next.js app is running
    const { db } = await import("../../src/lib/db/dexie");
    
    // Clear existing habits and logs
    await db.habits.clear();
    await db.habitLogs.clear();
    
    console.log("🗑️ Cleared existing habits and logs");
    
    // Create sample habits
    const habits = [
      {
        profileId: 1,
        name: "Morning Meditation",
        type: "boolean",
        color: "#3B82F6", // blue
        frequency: "daily",
        archived: false,
        createdAt: "2025-10-15T08:00:00.000Z",
        order: 0
      },
      {
        profileId: 1,
        name: "Exercise",
        type: "boolean",
        color: "#EF4444", // red
        frequency: "daily",
        archived: false,
        createdAt: "2025-10-15T08:00:00.000Z",
        order: 1
      },
      {
        profileId: 1,
        name: "Read Pages",
        type: "numeric",
        target: 20,
        unit: "pages",
        color: "#10B981", // green
        frequency: "daily",
        archived: false,
        createdAt: "2025-10-16T09:00:00.000Z",
        order: 2
      },
      {
        profileId: 1,
        name: "Water Intake",
        type: "numeric",
        target: 8,
        unit: "glasses",
        color: "#8B5CF6", // purple
        frequency: "daily",
        archived: false,
        createdAt: "2025-10-17T10:00:00.000Z",
        order: 3
      },
      {
        profileId: 1,
        name: "Journal Entry",
        type: "boolean",
        color: "#F59E0B", // orange
        frequency: "daily",
        archived: false,
        createdAt: "2025-10-18T11:00:00.000Z",
        order: 4
      },
      {
        profileId: 1,
        name: "Gratitude Practice",
        type: "boolean",
        color: "#EC4899", // pink
        frequency: "daily",
        archived: false,
        createdAt: "2025-10-19T12:00:00.000Z",
        order: 5
      }
    ];
    
    // Add habits to database
    const habitIds = [];
    for (const habit of habits) {
      const id = await db.habits.add(habit);
      habitIds.push(id);
    }
    
    console.log(`✅ Created ${habits.length} habits`);
    
    // Generate habit logs for the month (Oct 23 - Nov 22, 2025)
    const startDate = new Date("2025-10-23");
    const logs = [];
    
    for (let i = 0; i <= 30; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      const dateString = currentDate.toISOString().split('T')[0];
      
      // For each habit, randomly log completion (70-90% completion rate)
      for (let j = 0; j < habitIds.length; j++) {
        const habitId = habitIds[j];
        const habit = habits[j];
        // Vary completion rates by habit type
        const completionRate = habit.name === "Morning Meditation" ? 0.25 : 
                              habit.name === "Exercise" ? 0.20 : 
                              habit.name === "Journal Entry" ? 0.10 : 0.15;
        const shouldLog = Math.random() > completionRate;
        
        if (shouldLog) {
          let value = 1; // Default for boolean
          
          if (habit.type === "numeric") {
            // For numeric habits, log 60-120% of target
            const minValue = Math.floor(habit.target * 0.6);
            const maxValue = Math.floor(habit.target * 1.2);
            value = Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;
          }
          
          const hour = Math.floor(Math.random() * 12) + 8; // Between 8 AM and 8 PM
          const minute = Math.floor(Math.random() * 60);
          const completedAt = new Date(currentDate);
          completedAt.setHours(hour, minute, 0, 0);
          
          logs.push({
            habitId: habitId,
            date: dateString,
            value: value,
            completedAt: completedAt.toISOString()
          });
        }
      }
    }
    
    // Add logs to database in batches to avoid memory issues
    const batchSize = 50;
    for (let i = 0; i < logs.length; i += batchSize) {
      const batch = logs.slice(i, i + batchSize);
      await db.habitLogs.bulkAdd(batch);
    }
    
    console.log(`✅ Created ${logs.length} habit log entries`);
    console.log(`📊 Date range: Oct 23, 2025 - Nov 22, 2025`);
    console.log("🔄 Refresh the habits page to see the data!");
    
  } catch (error) {
    console.error("❌ Error loading habits:", error);
    console.log("\n💡 Troubleshooting:");
    console.log("   1. Make sure you're running this in the browser console");
    console.log("   2. Make sure the TalkBook app is fully loaded");
    console.log("   3. Try running this script from the habits page");
    console.log("   4. If import fails, the database may not be accessible from console");
  }
})();

