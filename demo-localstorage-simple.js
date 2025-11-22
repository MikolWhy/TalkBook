// Simple Demo Data - Copy and paste this entire file into your browser console
// This will populate localStorage with a month's worth of data (Oct 23 - Nov 22, 2025)

// Clear existing data first (optional - comment out if you want to keep existing data)
// localStorage.clear();

// ============================================================================
// JOURNALS
// ============================================================================
localStorage.setItem("talkbook-journals", JSON.stringify([
  { id: "journal-1", name: "Daily Journal", createdAt: "2025-10-15T08:00:00.000Z", updatedAt: "2025-10-15T08:00:00.000Z" },
  { id: "journal-2", name: "Work & Projects", createdAt: "2025-10-20T10:30:00.000Z", updatedAt: "2025-10-20T10:30:00.000Z" }
]));
localStorage.setItem("talkbook-active-journal", "journal-1");

// ============================================================================
// JOURNAL ENTRIES (26 entries spanning Oct 23 - Nov 22, 2025)
// ============================================================================
const entries = [
  {
    id: "entry-1729702800000",
    title: "Morning Reflection - Nov 22",
    content: "<p>Ending the day feeling satisfied. Made the most of today and that's what matters.</p><p>Reflecting on the past month, I've seen significant growth in both personal and professional areas. The consistency of journaling has helped me stay grounded and aware of my progress.</p>",
    mood: "grateful",
    tags: ["reflection", "gratitude"],
    cardColor: "green",
    journalId: "journal-1",
    createdAt: "2025-11-22T18:30:00.000Z",
    updatedAt: "2025-11-22T18:30:00.000Z",
    draft: false,
    promptIds: [],
    extractedPeople: [],
    extractedTopics: [],
    extractedDates: []
  },
  {
    id: "entry-1729616400000",
    title: "Feeling Thankful - Nov 21",
    content: "<p>Feeling thankful for the people and opportunities in my life. Gratitude changes perspective.</p><p>Had a wonderful conversation with a friend today. These connections remind me what truly matters in life.</p>",
    mood: "grateful",
    tags: ["gratitude", "friends"],
    cardColor: "yellow",
    journalId: "journal-1",
    createdAt: "2025-11-21T16:00:00.000Z",
    updatedAt: "2025-11-21T16:00:00.000Z",
    draft: false,
    promptIds: [],
    extractedPeople: [],
    extractedTopics: [],
    extractedDates: []
  },
  {
    id: "entry-1729530000000",
    title: "Progress Update - Nov 20",
    content: "<p>Progress update: things are moving forward. Sometimes slow progress is still progress.</p><p>Completed a major milestone at work today. The team celebrated together and it felt great to see everyone's hard work pay off.</p>",
    mood: "excited",
    tags: ["work", "goals"],
    cardColor: "blue",
    journalId: "journal-1",
    createdAt: "2025-11-20T14:15:00.000Z",
    updatedAt: "2025-11-20T14:15:00.000Z",
    draft: false,
    promptIds: [],
    extractedPeople: [],
    extractedTopics: [],
    extractedDates: []
  },
  {
    id: "entry-1729443600000",
    title: "Mindful Moments - Nov 19",
    content: "<p>Mindful moments throughout the day. Being present makes everything feel more meaningful.</p><p>Took a break from the usual routine to just be. Sometimes the best thing you can do is nothing at all.</p>",
    mood: "calm",
    tags: ["reflection", "health"],
    cardColor: "purple",
    journalId: "journal-1",
    createdAt: "2025-11-19T12:00:00.000Z",
    updatedAt: "2025-11-19T12:00:00.000Z",
    draft: false,
    promptIds: [],
    extractedPeople: [],
    extractedTopics: [],
    extractedDates: []
  },
  {
    id: "entry-1729357200000",
    title: "Creative Flow - Nov 18",
    content: "<p>Creative energy flowing today. Worked on a personal project and felt inspired. Love these moments.</p><p>Sometimes when you're in the right headspace, ideas just flow naturally. Today was one of those days.</p>",
    mood: "excited",
    tags: ["hobbies", "personal"],
    cardColor: "pink",
    journalId: "journal-1",
    createdAt: "2025-11-18T15:30:00.000Z",
    updatedAt: "2025-11-18T15:30:00.000Z",
    draft: false,
    promptIds: [],
    extractedPeople: [],
    extractedTopics: [],
    extractedDates: []
  },
  {
    id: "entry-1729270800000",
    title: "Balance Achieved - Nov 17",
    content: "<p>Found better balance today between work and personal life. It's an ongoing process but making progress.</p><p>Set boundaries and stuck to them. It's important to protect your time and energy.</p>",
    mood: "calm",
    tags: ["personal", "health"],
    cardColor: "default",
    journalId: "journal-1",
    createdAt: "2025-11-17T19:00:00.000Z",
    updatedAt: "2025-11-17T19:00:00.000Z",
    draft: false,
    promptIds: [],
    extractedPeople: [],
    extractedTopics: [],
    extractedDates: []
  },
  {
    id: "entry-1729184400000",
    title: "Focus Session - Nov 16",
    content: "<p>Deep focus session today. When you're in the zone, time flies and productivity soars.</p><p>Completed several important tasks that had been lingering. The feeling of checking things off the list is so satisfying.</p>",
    mood: "happy",
    tags: ["work", "goals"],
    cardColor: "blue",
    journalId: "journal-2",
    createdAt: "2025-11-16T11:00:00.000Z",
    updatedAt: "2025-11-16T11:00:00.000Z",
    draft: false,
    promptIds: [],
    extractedPeople: [],
    extractedTopics: [],
    extractedDates: []
  },
  {
    id: "entry-1729098000000",
    title: "Connection Day - Nov 15",
    content: "<p>Connected with friends today. Good conversations and shared laughter. These moments are precious.</p><p>Met up for coffee and ended up talking for hours. Time well spent with people who matter.</p>",
    mood: "very-happy",
    tags: ["friends", "personal"],
    cardColor: "green",
    journalId: "journal-1",
    createdAt: "2025-11-15T17:00:00.000Z",
    updatedAt: "2025-11-15T17:00:00.000Z",
    draft: false,
    promptIds: [],
    extractedPeople: [],
    extractedTopics: [],
    extractedDates: []
  },
  {
    id: "entry-1729011600000",
    title: "New Insights - Nov 14",
    content: "<p>Had some new insights today. Sometimes clarity comes when you least expect it.</p><p>Was reading an article and something clicked. It's amazing how the right information finds you at the right time.</p>",
    mood: "excited",
    tags: ["learning", "reflection"],
    cardColor: "purple",
    journalId: "journal-1",
    createdAt: "2025-11-14T13:30:00.000Z",
    updatedAt: "2025-11-14T13:30:00.000Z",
    draft: false,
    promptIds: [],
    extractedPeople: [],
    extractedTopics: [],
    extractedDates: []
  },
  {
    id: "entry-1728925200000",
    title: "Reflection Time - Nov 13",
    content: "<p>Taking time to reflect on recent experiences. Reflection helps process and learn from what happened.</p><p>Looking back at the past few weeks, I can see patterns and areas for improvement. Growth is happening.</p>",
    mood: "neutral",
    tags: ["reflection", "personal"],
    cardColor: "default",
    journalId: "journal-1",
    createdAt: "2025-11-13T20:00:00.000Z",
    updatedAt: "2025-11-13T20:00:00.000Z",
    draft: false,
    promptIds: [],
    extractedPeople: [],
    extractedTopics: [],
    extractedDates: []
  },
  {
    id: "entry-1728838800000",
    title: "Daily Wins - Nov 12",
    content: "<p>Celebrating small wins today. Every step forward counts, no matter how small it seems.</p><p>Finished a task I'd been putting off, had a good workout, and made time for reading. Small victories add up.</p>",
    mood: "happy",
    tags: ["goals", "health"],
    cardColor: "yellow",
    journalId: "journal-1",
    createdAt: "2025-11-12T16:45:00.000Z",
    updatedAt: "2025-11-12T16:45:00.000Z",
    draft: false,
    promptIds: [],
    extractedPeople: [],
    extractedTopics: [],
    extractedDates: []
  },
  {
    id: "entry-1728752400000",
    title: "Growth Moments - Nov 11",
    content: "<p>Noticed some personal growth today. Small changes add up over time. Proud of the progress.</p><p>Handled a difficult situation with more patience and understanding than I would have a few months ago. That's progress.</p>",
    mood: "grateful",
    tags: ["reflection", "personal"],
    cardColor: "green",
    journalId: "journal-1",
    createdAt: "2025-11-11T14:00:00.000Z",
    updatedAt: "2025-11-11T14:00:00.000Z",
    draft: false,
    promptIds: [],
    extractedPeople: [],
    extractedTopics: [],
    extractedDates: []
  },
  {
    id: "entry-1728666000000",
    title: "Challenges Overcome - Nov 10",
    content: "<p>Faced some challenges today but worked through them. Growth happens outside the comfort zone.</p><p>Had to have a difficult conversation but it went better than expected. Sometimes we build things up in our minds more than necessary.</p>",
    mood: "calm",
    tags: ["personal", "goals"],
    cardColor: "blue",
    journalId: "journal-1",
    createdAt: "2025-11-10T18:30:00.000Z",
    updatedAt: "2025-11-10T18:30:00.000Z",
    draft: false,
    promptIds: [],
    extractedPeople: [],
    extractedTopics: [],
    extractedDates: []
  },
  {
    id: "entry-1728579600000",
    title: "Gratitude Practice - Nov 9",
    content: "<p>Practicing gratitude today. There's always something to be thankful for, even on difficult days.</p><p>Made a list of things I'm grateful for. It's a simple practice but it really shifts your perspective.</p>",
    mood: "grateful",
    tags: ["gratitude", "reflection"],
    cardColor: "yellow",
    journalId: "journal-1",
    createdAt: "2025-11-09T12:15:00.000Z",
    updatedAt: "2025-11-09T12:15:00.000Z",
    draft: false,
    promptIds: [],
    extractedPeople: [],
    extractedTopics: [],
    extractedDates: []
  },
  {
    id: "entry-1728493200000",
    title: "Sunday Planning - Nov 8",
    content: "<p>Sunday planning session. Organized the week ahead and feeling prepared for what's coming.</p><p>Set priorities and scheduled time for both work and personal activities. A good plan sets you up for success.</p>",
    mood: "calm",
    tags: ["goals", "personal"],
    cardColor: "purple",
    journalId: "journal-1",
    createdAt: "2025-11-08T10:00:00.000Z",
    updatedAt: "2025-11-08T10:00:00.000Z",
    draft: false,
    promptIds: [],
    extractedPeople: [],
    extractedTopics: [],
    extractedDates: []
  },
  {
    id: "entry-1728406800000",
    title: "Saturday Relaxation - Nov 7",
    content: "<p>Saturday vibes. No rush, no pressure. Just enjoying the moment and being present.</p><p>Spent the day doing things I enjoy without any agenda. Sometimes the best days are the ones with no plans.</p>",
    mood: "calm",
    tags: ["personal", "health"],
    cardColor: "pink",
    journalId: "journal-1",
    createdAt: "2025-11-07T15:00:00.000Z",
    updatedAt: "2025-11-07T15:00:00.000Z",
    draft: false,
    promptIds: [],
    extractedPeople: [],
    extractedTopics: [],
    extractedDates: []
  },
  {
    id: "entry-1728320400000",
    title: "Friday Feels - Nov 6",
    content: "<p>Friday! Wrapped up the week feeling accomplished. Looking forward to some rest and relaxation.</p><p>Finished all the important tasks for the week. The weekend can't come soon enough.</p>",
    mood: "happy",
    tags: ["work", "personal"],
    cardColor: "green",
    journalId: "journal-1",
    createdAt: "2025-11-06T17:30:00.000Z",
    updatedAt: "2025-11-06T17:30:00.000Z",
    draft: false,
    promptIds: [],
    extractedPeople: [],
    extractedTopics: [],
    extractedDates: []
  },
  {
    id: "entry-1728234000000",
    title: "Midweek Check-in - Nov 5",
    content: "<p>Midweek check-in: staying on track with goals. Some challenges but working through them one step at a time.</p><p>The week is going well overall. Staying focused and making progress on key priorities.</p>",
    mood: "neutral",
    tags: ["goals", "work"],
    cardColor: "default",
    journalId: "journal-1",
    createdAt: "2025-11-05T13:00:00.000Z",
    updatedAt: "2025-11-05T13:00:00.000Z",
    draft: false,
    promptIds: [],
    extractedPeople: [],
    extractedTopics: [],
    extractedDates: []
  },
  {
    id: "entry-1728147600000",
    title: "Monday Motivation - Nov 4",
    content: "<p>Monday morning and feeling motivated. Set intentions for the week and ready to make it count.</p><p>Started the week with a clear plan and positive energy. Excited about what's ahead.</p>",
    mood: "excited",
    tags: ["work", "goals"],
    cardColor: "blue",
    journalId: "journal-1",
    createdAt: "2025-11-04T09:00:00.000Z",
    updatedAt: "2025-11-04T09:00:00.000Z",
    draft: false,
    promptIds: [],
    extractedPeople: [],
    extractedTopics: [],
    extractedDates: []
  },
  {
    id: "entry-1728061200000",
    title: "Weekend Adventures - Nov 3",
    content: "<p>Explored a new place this weekend. Adventure and new experiences keep life interesting and exciting.</p><p>Went hiking and discovered a beautiful trail I'd never been on before. Nature always recharges me.</p>",
    mood: "very-happy",
    tags: ["hobbies", "health"],
    cardColor: "green",
    journalId: "journal-1",
    createdAt: "2025-11-03T16:00:00.000Z",
    updatedAt: "2025-11-03T16:00:00.000Z",
    draft: false,
    promptIds: [],
    extractedPeople: [],
    extractedTopics: [],
    extractedDates: []
  },
  {
    id: "entry-1727974800000",
    title: "Self Care Day - Nov 2",
    content: "<p>Took a day to focus on self-care. Sometimes you need to slow down and recharge. Feeling refreshed.</p><p>Did a face mask, read a book, and just relaxed. Self-care isn't selfish, it's necessary.</p>",
    mood: "calm",
    tags: ["health", "personal"],
    cardColor: "pink",
    journalId: "journal-1",
    createdAt: "2025-11-02T14:30:00.000Z",
    updatedAt: "2025-11-02T14:30:00.000Z",
    draft: false,
    promptIds: [],
    extractedPeople: [],
    extractedTopics: [],
    extractedDates: []
  },
  {
    id: "entry-1727888400000",
    title: "Work Progress - Nov 1",
    content: "<p>Completed several important tasks at work. The team is working well together and we're making good progress.</p><p>Had a productive meeting and aligned on next steps. Collaboration makes everything easier.</p>",
    mood: "happy",
    tags: ["work"],
    cardColor: "blue",
    journalId: "journal-2",
    createdAt: "2025-11-01T11:30:00.000Z",
    updatedAt: "2025-11-01T11:30:00.000Z",
    draft: false,
    promptIds: [],
    extractedPeople: [],
    extractedTopics: [],
    extractedDates: []
  },
  {
    id: "entry-1727802000000",
    title: "Family Time - Oct 31",
    content: "<p>Quality time with family today. These connections are what truly matter in life. Feeling blessed.</p><p>Had dinner together and just talked. Simple moments but they mean everything.</p>",
    mood: "very-happy",
    tags: ["family", "personal"],
    cardColor: "yellow",
    journalId: "journal-1",
    createdAt: "2025-10-31T19:00:00.000Z",
    updatedAt: "2025-10-31T19:00:00.000Z",
    draft: false,
    promptIds: [],
    extractedPeople: [],
    extractedTopics: [],
    extractedDates: []
  },
  {
    id: "entry-1727715600000",
    title: "Learning Journey - Oct 30",
    content: "<p>Attended a workshop today and learned some valuable skills. Always good to invest in personal development.</p><p>The session was engaging and I came away with actionable insights. Learning never stops.</p>",
    mood: "excited",
    tags: ["learning", "goals"],
    cardColor: "purple",
    journalId: "journal-1",
    createdAt: "2025-10-30T15:00:00.000Z",
    updatedAt: "2025-10-30T15:00:00.000Z",
    draft: false,
    promptIds: [],
    extractedPeople: [],
    extractedTopics: [],
    extractedDates: []
  },
  {
    id: "entry-1727629200000",
    title: "New Beginnings - Oct 29",
    content: "<p>Starting a new chapter. Set some goals and feeling motivated to work towards them. Change can be exciting.</p><p>Decided to make some positive changes in my routine. Small steps lead to big transformations.</p>",
    mood: "excited",
    tags: ["goals", "personal"],
    cardColor: "green",
    journalId: "journal-1",
    createdAt: "2025-10-29T10:00:00.000Z",
    updatedAt: "2025-10-29T10:00:00.000Z",
    draft: false,
    promptIds: [],
    extractedPeople: [],
    extractedTopics: [],
    extractedDates: []
  },
  {
    id: "entry-1727542800000",
    title: "Feeling Grateful - Oct 28",
    content: "<p>Taking time to appreciate the good things in life. Grateful for health, relationships, and opportunities to grow.</p><p>Sometimes it's easy to focus on what's missing, but today I'm choosing to focus on what I have.</p>",
    mood: "grateful",
    tags: ["gratitude", "reflection"],
    cardColor: "yellow",
    journalId: "journal-1",
    createdAt: "2025-10-28T17:00:00.000Z",
    updatedAt: "2025-10-28T17:00:00.000Z",
    draft: false,
    promptIds: [],
    extractedPeople: [],
    extractedTopics: [],
    extractedDates: []
  },
  {
    id: "entry-1727456400000",
    title: "Productive Day - Oct 27",
    content: "<p>Made significant progress on my project today. The momentum is building and I'm excited about the direction things are heading.</p><p>Crossed off several items from my to-do list. Progress feels good.</p>",
    mood: "happy",
    tags: ["work", "goals"],
    cardColor: "blue",
    journalId: "journal-2",
    createdAt: "2025-10-27T14:00:00.000Z",
    updatedAt: "2025-10-27T14:00:00.000Z",
    draft: false,
    promptIds: [],
    extractedPeople: [],
    extractedTopics: [],
    extractedDates: []
  },
  {
    id: "entry-1727370000000",
    title: "Weekend Vibes - Oct 26",
    content: "<p>Spent the weekend recharging. Went for a long walk, read a good book, and caught up with family. These moments matter.</p><p>Sometimes the best weekends are the quiet ones. Rest is productive too.</p>",
    mood: "calm",
    tags: ["personal", "family"],
    cardColor: "pink",
    journalId: "journal-1",
    createdAt: "2025-10-26T16:00:00.000Z",
    updatedAt: "2025-10-26T16:00:00.000Z",
    draft: false,
    promptIds: [],
    extractedPeople: [],
    extractedTopics: [],
    extractedDates: []
  },
  {
    id: "entry-1727283600000",
    title: "End of Day Thoughts - Oct 25",
    content: "<p>Reflecting on today's experiences. Learned something new and had meaningful conversations with friends. Feeling content.</p><p>Days like this remind me why I journal. It helps capture these moments of clarity and connection.</p>",
    mood: "happy",
    tags: ["friends", "reflection"],
    cardColor: "green",
    journalId: "journal-1",
    createdAt: "2025-10-25T20:00:00.000Z",
    updatedAt: "2025-10-25T20:00:00.000Z",
    draft: false,
    promptIds: [],
    extractedPeople: [],
    extractedTopics: [],
    extractedDates: []
  },
  {
    id: "entry-1727197200000",
    title: "Morning Reflection - Oct 24",
    content: "<p>Started the day with a clear mind and positive energy. Had a great morning routine and feeling ready to tackle the day ahead.</p><p>Morning routines really set the tone for the whole day. Grateful for this practice.</p>",
    mood: "happy",
    tags: ["health", "personal"],
    cardColor: "default",
    journalId: "journal-1",
    createdAt: "2025-10-24T08:30:00.000Z",
    updatedAt: "2025-10-24T08:30:00.000Z",
    draft: false,
    promptIds: [],
    extractedPeople: [],
    extractedTopics: [],
    extractedDates: []
  },
  {
    id: "entry-1727110800000",
    title: "Morning Reflection - Oct 23",
    content: "<p>Starting fresh today. New day, new opportunities. Feeling optimistic about what's ahead.</p><p>Set some intentions for the week and feeling ready to make progress on my goals.</p>",
    mood: "excited",
    tags: ["goals", "personal"],
    cardColor: "blue",
    journalId: "journal-1",
    createdAt: "2025-10-23T09:00:00.000Z",
    updatedAt: "2025-10-23T09:00:00.000Z",
    draft: false,
    promptIds: [],
    extractedPeople: [],
    extractedTopics: [],
    extractedDates: []
  }
];

localStorage.setItem("journalEntries", JSON.stringify(entries));
localStorage.setItem("entriesCacheVersion", "1");

// ============================================================================
// XP & LEVEL (Calculated based on entries)
// ============================================================================
localStorage.setItem("talkbook-xp", "15250");
localStorage.setItem("talkbook-level", "8");
localStorage.setItem("talkbook-last-entry-date", "2025-11-22");
localStorage.setItem("talkbook-last-all-habits-bonus-date", "2025-11-20");

// ============================================================================
// USED PROMPTS
// ============================================================================
localStorage.setItem("talkbook-used-prompts", JSON.stringify([
  "prompt-001",
  "prompt-002",
  "prompt-003"
]));

// ============================================================================
// BLACKLIST
// ============================================================================
localStorage.setItem("talkbook-blacklist", JSON.stringify([
  "example",
  "test"
]));

// ============================================================================
// USER PROFILE
// ============================================================================
localStorage.setItem("userName", "Demo User");
localStorage.setItem("appBackgroundColor", "white");

// ============================================================================
// HABITS & HABIT LOGS (IndexedDB)
// ============================================================================
// Note: This requires the app to be running. The database is accessed via the app's Dexie instance.
// If the import fails, you can manually run this after the app loads by accessing window.__TALKBOOK_DB__ 
// or by using the app's internal database reference.
(async function() {
  try {
    // Try to import the database from the app's module system
    // This works when the Next.js app is running and modules are available
    let db;
    try {
      // Try the relative import path (works in Next.js dev/prod)
      const dbModule = await import("../../src/lib/db/dexie");
      db = dbModule.db;
    } catch (e1) {
      try {
        // Alternative: try accessing via window if exposed
        if (window.__TALKBOOK_DB__) {
          db = window.__TALKBOOK_DB__;
        } else {
          throw new Error("Database not accessible");
        }
      } catch (e2) {
        console.warn("⚠️ Could not access IndexedDB directly. Habits will be skipped.");
        console.warn("💡 To load habits, run this script after the app fully loads, or use the app's internal database.");
        return;
      }
    }
    
    // Clear existing habits and logs
    await db.habits.clear();
    await db.habitLogs.clear();
    
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
        const shouldLog = Math.random() > (habit.name === "Morning Meditation" ? 0.25 : 0.15); // Higher completion for some habits
        
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
    
    // Add logs to database
    await db.habitLogs.bulkAdd(logs);
    
    console.log(`✅ Habits loaded: ${habits.length} habits with ${logs.length} log entries`);
  } catch (error) {
    console.error("❌ Error loading habits:", error);
    console.log("💡 Note: Habits are stored in IndexedDB and require the app's database instance.");
    console.log("💡 Make sure you're running this in the browser console on your TalkBook app after it fully loads.");
  }
})();

console.log("✅ Demo data loaded successfully!");
console.log(`📊 Loaded ${entries.length} journal entries from Oct 23 - Nov 22, 2025`);
console.log("\n📝 NOTE: Habits are stored in IndexedDB and need to be loaded separately.");
console.log("   Run the 'load-habits-demo.js' script to populate habits data.");
console.log("   Or wait a moment for the habits script above to attempt loading.");
console.log("\n🔄 Refresh the page to see the changes!");

