// Demo localStorage Data for TalkBook
// Date Range: September 18, 2025 - December 18, 2025
// Run this script in your browser console to populate localStorage

(function() {
  console.log('🚀 Populating localStorage with demo data...');

  // ============================================================================
  // JOURNALS
  // ============================================================================
  const journals = [
    {
      id: "journal-1",
      name: "Daily Journal",
      createdAt: "2025-09-10T08:00:00.000Z",
      updatedAt: "2025-09-10T08:00:00.000Z"
    },
    {
      id: "journal-2",
      name: "Work & Projects",
      createdAt: "2025-09-15T10:30:00.000Z",
      updatedAt: "2025-09-15T10:30:00.000Z"
    }
  ];
  localStorage.setItem("talkbook-journals", JSON.stringify(journals));
  localStorage.setItem("talkbook-active-journal", "journal-1");

  // ============================================================================
  // JOURNAL ENTRIES (entries from Sep 18 - Dec 18, 2025)
  // ============================================================================
  const moods = ["very-happy", "happy", "neutral", "sad", "excited", "calm", "anxious"];
  const tags = ["work", "personal", "health", "family", "friends", "hobbies", "reflection", "goals", "gratitude", "learning"];
  const cardColors = ["default", "blue", "green", "purple", "pink", "yellow"];

  const entryTitles = [
    "Morning Reflection",
    "End of Day Thoughts",
    "Weekend Vibes",
    "Productive Day",
    "Feeling Grateful",
    "New Beginnings",
    "Learning Journey",
    "Family Time",
    "Work Progress",
    "Self Care Day",
    "Weekend Adventures",
    "Monday Motivation",
    "Midweek Check-in",
    "Friday Feels",
    "Saturday Relaxation",
    "Sunday Planning",
    "Gratitude Practice",
    "Challenges Overcome",
    "Growth Moments",
    "Daily Wins",
    "Reflection Time",
    "New Insights",
    "Connection Day",
    "Focus Session",
    "Balance Achieved",
    "Creative Flow",
    "Mindful Moments",
    "Progress Update",
    "Thankful Thoughts",
    "Day Well Spent"
  ];

  const entryContents = [
    "<p>Started the day with a clear mind and positive energy. Had a great morning routine and feeling ready to tackle the day ahead.</p>",
    "<p>Reflecting on today's experiences. Learned something new and had meaningful conversations with friends. Feeling content.</p>",
    "<p>Spent the weekend recharging. Went for a long walk, read a good book, and caught up with family. These moments matter.</p>",
    "<p>Made significant progress on my project today. The momentum is building and I'm excited about the direction things are heading.</p>",
    "<p>Taking time to appreciate the good things in life. Grateful for health, relationships, and opportunities to grow.</p>",
    "<p>Starting a new chapter. Set some goals and feeling motivated to work towards them. Change can be exciting.</p>",
    "<p>Attended a workshop today and learned some valuable skills. Always good to invest in personal development.</p>",
    "<p>Quality time with family today. These connections are what truly matter in life. Feeling blessed.</p>",
    "<p>Completed several important tasks at work. The team is working well together and we're making good progress.</p>",
    "<p>Took a day to focus on self-care. Sometimes you need to slow down and recharge. Feeling refreshed.</p>",
    "<p>Explored a new place this weekend. Adventure and new experiences keep life interesting and exciting.</p>",
    "<p>Monday morning and feeling motivated. Set intentions for the week and ready to make it count.</p>",
    "<p>Midweek check-in: staying on track with goals. Some challenges but working through them one step at a time.</p>",
    "<p>Friday! Wrapped up the week feeling accomplished. Looking forward to some rest and relaxation.</p>",
    "<p>Saturday vibes. No rush, no pressure. Just enjoying the moment and being present.</p>",
    "<p>Sunday planning session. Organized the week ahead and feeling prepared for what's coming.</p>",
    "<p>Practicing gratitude today. There's always something to be thankful for, even on difficult days.</p>",
    "<p>Faced some challenges today but worked through them. Growth happens outside the comfort zone.</p>",
    "<p>Noticed some personal growth today. Small changes add up over time. Proud of the progress.</p>",
    "<p>Celebrating small wins today. Every step forward counts, no matter how small it seems.</p>",
    "<p>Taking time to reflect on recent experiences. Reflection helps process and learn from what happened.</p>",
    "<p>Had some new insights today. Sometimes clarity comes when you least expect it.</p>",
    "<p>Connected with friends today. Good conversations and shared laughter. These moments are precious.</p>",
    "<p>Deep focus session today. When you're in the zone, time flies and productivity soars.</p>",
    "<p>Found better balance today between work and personal life. It's an ongoing process but making progress.</p>",
    "<p>Creative energy flowing today. Worked on a personal project and felt inspired. Love these moments.</p>",
    "<p>Mindful moments throughout the day. Being present makes everything feel more meaningful.</p>",
    "<p>Progress update: things are moving forward. Sometimes slow progress is still progress.</p>",
    "<p>Feeling thankful for the people and opportunities in my life. Gratitude changes perspective.</p>",
    "<p>Ending the day feeling satisfied. Made the most of today and that's what matters.</p>"
  ];

  const entries = [];
  const startDate = new Date("2025-09-18");
  const endDate = new Date("2025-12-18");

  // Generate entries for ~91 days (Sep 18 - Dec 18, 2025)
  const daysDiff = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));
  for (let i = 0; i <= daysDiff; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    
    // Skip some days to make it more realistic (not every single day)
    if (Math.random() > 0.15) { // 85% chance of having an entry
      const hour = Math.floor(Math.random() * 12) + 8; // Between 8 AM and 8 PM
      const minute = Math.floor(Math.random() * 60);
      const entryDate = new Date(currentDate);
      entryDate.setHours(hour, minute, 0, 0);

      const entryId = `entry-${entryDate.getTime()}`;
      const titleIndex = i % entryTitles.length;
      const contentIndex = i % entryContents.length;
      
      // Random mood (80% chance of having a mood)
      const hasMood = Math.random() > 0.2;
      const selectedMood = hasMood ? moods[Math.floor(Math.random() * moods.length)] : null;
      
      // Random tags (1-4 tags)
      const numTags = Math.floor(Math.random() * 4) + 1;
      const selectedTags = [];
      const availableTags = [...tags];
      for (let j = 0; j < numTags; j++) {
        const tagIndex = Math.floor(Math.random() * availableTags.length);
        selectedTags.push(availableTags.splice(tagIndex, 1)[0]);
      }
      
      // Random card color
      const cardColor = cardColors[Math.floor(Math.random() * cardColors.length)];
      
      // Random journal (mostly journal-1, sometimes journal-2)
      const journalId = Math.random() > 0.85 ? "journal-2" : "journal-1";
      
      // Word count for XP calculation (50-300 words)
      const wordCount = Math.floor(Math.random() * 250) + 50;
      const extendedContent = entryContents[contentIndex] + 
        `<p>${Array(wordCount - 20).fill(0).map(() => "word").join(" ")}</p>`;

      entries.push({
        id: entryId,
        title: entryTitles[titleIndex] + ` - ${currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
        content: extendedContent,
        mood: selectedMood,
        tags: selectedTags,
        cardColor: cardColor,
        journalId: journalId,
        createdAt: entryDate.toISOString(),
        updatedAt: entryDate.toISOString(),
        draft: false,
        promptIds: [],
        extractedPeople: [],
        extractedTopics: [],
        extractedDates: []
      });
    }
  }

  // Sort entries by date (newest first)
  entries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  localStorage.setItem("journalEntries", JSON.stringify(entries));
  localStorage.setItem("entriesCacheVersion", "1");

  // ============================================================================
  // XP & LEVEL PROGRESSION
  // ============================================================================
  // Calculate realistic XP based on entries
  // Base: 25 XP per entry
  // Words: 1 XP per word (average ~150 words = 150 XP)
  // Daily bonus: 100 XP for first entry of day
  // Streak multipliers apply after 7+ days
  
  let totalXP = 0;
  let currentStreak = 0;
  let lastEntryDate = null;
  const entryDates = entries.map(e => e.createdAt.split('T')[0]).sort();
  
  // Calculate streak and XP
  for (let i = entryDates.length - 1; i >= 0; i--) {
    const entryDate = entryDates[i];
    if (lastEntryDate === null) {
      currentStreak = 1;
      lastEntryDate = entryDate;
    } else {
      const daysDiff = Math.floor((new Date(entryDate) - new Date(lastEntryDate)) / (1000 * 60 * 60 * 24));
      if (daysDiff === 1) {
        currentStreak++;
      } else if (daysDiff > 1) {
        currentStreak = 1; // Streak broken
      }
      lastEntryDate = entryDate;
    }
    
    // Calculate XP for this entry
    const entry = entries.find(e => e.createdAt.startsWith(entryDate));
    if (entry) {
      const wordCount = entry.content.split(/\s+/).length;
      let baseXP = 25; // Base XP
      let wordXP = wordCount; // Word XP
      let dailyBonus = i === entryDates.length - 1 ? 100 : 0; // First entry of day
      
      // Streak multiplier
      let streakMultiplier = 1.0;
      if (currentStreak >= 60) streakMultiplier = 2.0;
      else if (currentStreak >= 30) streakMultiplier = 1.85;
      else if (currentStreak >= 14) streakMultiplier = 1.75;
      else if (currentStreak >= 7) streakMultiplier = 1.5;
      
      const entryXP = Math.round((baseXP + wordXP + dailyBonus) * streakMultiplier);
      totalXP += entryXP;
    }
  }

  // Calculate level from total XP
  function getXPForLevel(level) {
    if (level <= 1) return 0;
    if (level <= 10) return (level - 1) * 500;
    if (level <= 30) {
      const baseXP = 10 * 500;
      const additionalLevels = level - 10;
      return baseXP + (additionalLevels * 800) + (additionalLevels * additionalLevels * 50);
    }
    if (level <= 60) {
      const baseXP = 10 * 500 + (20 * 800) + (20 * 20 * 50);
      const additionalLevels = level - 30;
      return baseXP + (additionalLevels * 1500) + (additionalLevels * additionalLevels * 100);
    }
    const baseXP = 10 * 500 + (20 * 800) + (20 * 20 * 50) + (30 * 1500) + (30 * 30 * 100);
    const additionalLevels = level - 60;
    return baseXP + (additionalLevels * 2500) + (additionalLevels * additionalLevels * 200);
  }

  function calculateLevelFromXP(xp) {
    let level = 1;
    let xpInCurrentLevel = xp;
    while (xpInCurrentLevel >= getXPForLevel(level + 1)) {
      xpInCurrentLevel -= getXPForLevel(level + 1);
      level++;
      if (level >= 100) break;
    }
    return level;
  }

  const calculatedLevel = calculateLevelFromXP(totalXP);
  
  localStorage.setItem("talkbook-xp", totalXP.toString());
  localStorage.setItem("talkbook-level", calculatedLevel.toString());
  localStorage.setItem("talkbook-last-entry-date", "2025-12-18");
  localStorage.setItem("talkbook-last-all-habits-bonus-date", "2025-12-16");

  // ============================================================================
  // USED PROMPTS
  // ============================================================================
  const usedPrompts = [
    "prompt-001",
    "prompt-002",
    "prompt-003",
    "prompt-004",
    "prompt-005"
  ];
  localStorage.setItem("talkbook-used-prompts", JSON.stringify(usedPrompts));

  // ============================================================================
  // BLACKLIST
  // ============================================================================
  const blacklist = [
    "example",
    "test"
  ];
  localStorage.setItem("talkbook-blacklist", JSON.stringify(blacklist));

  // ============================================================================
  // USER PROFILE (Optional - you can customize these)
  // ============================================================================
  localStorage.setItem("userName", "Demo User");
  // localStorage.setItem("userProfilePicture", ""); // Leave empty or add base64 image
  // localStorage.setItem("appPassword", ""); // Leave empty for demo
  // localStorage.setItem("appLocked", "false");
  localStorage.setItem("appBackgroundColor", "white");

  console.log('✅ Demo data populated successfully!');
  console.log(`📊 Statistics:`);
  console.log(`   - Journals: ${journals.length}`);
  console.log(`   - Entries: ${entries.length}`);
  console.log(`   - Total XP: ${totalXP}`);
  console.log(`   - Level: ${calculatedLevel}`);
  console.log(`   - Date Range: Sep 18, 2025 - Dec 18, 2025`);
  console.log('\n🔄 Refresh the page to see the changes!');
})();

