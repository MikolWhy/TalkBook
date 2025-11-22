"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "../components/DashboardLayout";
import { getBlacklist, addToBlacklist, removeFromBlacklist } from "../../src/lib/blacklist/manager";
import { rebuildAllMetadata } from "../../src/lib/cache/rebuildCache";
import { resetXP } from "../../src/lib/gamification/xp";
import { BACKGROUND_COLORS, type BackgroundColorKey } from "../components/BackgroundColorProvider";
import { User, RefreshCw, AlertTriangle, CheckCircle2, X } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  
  // Password settings
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [hasPassword, setHasPassword] = useState(false);
  const [removePasswordInput, setRemovePasswordInput] = useState("");
  const [removePasswordError, setRemovePasswordError] = useState("");
  
  // Profile settings
  const [userName, setUserName] = useState("");
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  
  // UI states
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  
  // Blacklist settings
  const [blacklist, setBlacklist] = useState<string[]>([]);
  const [blacklistInput, setBlacklistInput] = useState("");
  const [blacklistSuccess, setBlacklistSuccess] = useState("");
  
  // Reset confirmation
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  
  // Rebuild cache state
  const [isRebuilding, setIsRebuilding] = useState(false);
  const [rebuildMessage, setRebuildMessage] = useState("");

  // Demo data loading state
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);
  const [demoMessage, setDemoMessage] = useState("");

  // Background color settings
  const [backgroundColor, setBackgroundColor] = useState<BackgroundColorKey>("white");
  const [backgroundColorSuccess, setBackgroundColorSuccess] = useState("");

  useEffect(() => {
    // Load existing settings
    const savedPassword = localStorage.getItem("appPassword");
    const savedName = localStorage.getItem("userName");
    const savedPicture = localStorage.getItem("userProfilePicture");
    const savedBackgroundColor = localStorage.getItem("appBackgroundColor") as BackgroundColorKey | null;
    
    setHasPassword(!!savedPassword);
    setUserName(savedName || "");
    setProfilePicture(savedPicture);
    setBlacklist(getBlacklist());
    
    // Load background color preference
    if (savedBackgroundColor && savedBackgroundColor in BACKGROUND_COLORS) {
      setBackgroundColor(savedBackgroundColor);
    }
  }, []);

  const handleSetPassword = () => {
    setPasswordError("");
    setPasswordSuccess("");

    // Validation
    if (!password.trim()) {
      setPasswordError("Password cannot be empty");
      return;
    }

    if (password.length > 12) {
      setPasswordError("Password cannot exceed 12 characters");
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    // Save password and immediately lock the app
    localStorage.setItem("appPassword", password);
    localStorage.setItem("appLocked", "true");
    
    // Reload to show lock screen
    window.location.reload();
  };

  const handleRemovePassword = () => {
    setRemovePasswordError("");
    setPasswordSuccess("");
    
    // Verify the password before removing
    const savedPassword = localStorage.getItem("appPassword");
    
    if (!removePasswordInput.trim()) {
      setRemovePasswordError("Please enter your current password");
      return;
    }
    
    if (removePasswordInput !== savedPassword) {
      setRemovePasswordError("Incorrect password");
      setRemovePasswordInput("");
      return;
    }
    
    // Password is correct, remove it
    localStorage.removeItem("appPassword");
    localStorage.removeItem("appLocked");
    setHasPassword(false);
    setRemovePasswordInput("");
    setPasswordSuccess("Password removed successfully!");
  };

  const handleSaveProfile = () => {
    setProfileSuccess("");
    
    // Save name (max 20 characters to fit sidebar)
    const trimmedName = userName.trim().substring(0, 20);
    if (trimmedName) {
      localStorage.setItem("userName", trimmedName);
    } else {
      localStorage.removeItem("userName");
    }

    setProfileSuccess("Profile updated successfully!");
    
    // Force sidebar to re-render
    window.dispatchEvent(new Event('storage'));
  };

  const handlePictureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("Image size must be less than 2MB");
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setProfilePicture(base64String);
      localStorage.setItem("userProfilePicture", base64String);
      setProfileSuccess("Profile picture updated!");
      window.dispatchEvent(new Event('storage'));
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePicture = () => {
    setProfilePicture(null);
    localStorage.removeItem("userProfilePicture");
    setProfileSuccess("Profile picture removed!");
    window.dispatchEvent(new Event('storage'));
  };

  // Background color handler
  const handleBackgroundColorChange = (colorKey: BackgroundColorKey) => {
    setBackgroundColor(colorKey);
    localStorage.setItem("appBackgroundColor", colorKey);
    setBackgroundColorSuccess("Background color updated!");
    
    // Trigger background color update
    window.dispatchEvent(new Event('background-color-changed'));
    
    // Apply immediately
    const selectedColor = BACKGROUND_COLORS[colorKey];
    document.documentElement.style.setProperty("--background", selectedColor.value);
    document.body.style.backgroundColor = selectedColor.value;
    
    setTimeout(() => setBackgroundColorSuccess(""), 3000);
  };

  // Blacklist handlers
  const handleAddToBlacklist = () => {
    const word = blacklistInput.trim();
    if (word && !blacklist.includes(word.toLowerCase())) {
      addToBlacklist(word);
      setBlacklist(getBlacklist());
      setBlacklistInput("");
      setBlacklistSuccess(`"${word}" added to blacklist`);
      setTimeout(() => setBlacklistSuccess(""), 3000);
    }
  };

  const handleRemoveFromBlacklist = (word: string) => {
    removeFromBlacklist(word);
    setBlacklist(getBlacklist());
    setBlacklistSuccess(`"${word}" removed from blacklist`);
    setTimeout(() => setBlacklistSuccess(""), 3000);
  };

  // Reset all data
  const handleResetAllData = async () => {
    try {
      // === CLEAR ALL JOURNAL DATA ===
      localStorage.removeItem("journalEntries"); // All entries
      localStorage.removeItem("talkbook-journals"); // All journals
      localStorage.removeItem("talkbook-active-journal"); // Active journal
      
      // === CLEAR ALL NLP/EXTRACTION DATA ===
      localStorage.removeItem("talkbook-used-prompts"); // Used prompts
      localStorage.removeItem("talkbook-blacklist"); // Blacklist
      
      // === CLEAR ALL XP/GAMIFICATION DATA ===
      resetXP(); // XP, level, last entry date
      
      // === CLEAR ALL HABIT DATA (IndexedDB) ===
      const { db } = await import("../../src/lib/db/dexie");
      await db.habitLogs.clear();
      await db.habits.clear();
      console.log("✅ All habit data cleared from IndexedDB");
      
      // === CLEAR IN-MEMORY CACHE ===
      const { saveEntries: saveCachedEntries, invalidateCache } = await import("../../src/lib/cache/entriesCache");
      saveCachedEntries([]); // Clear all entries in cache
      invalidateCache(); // Force cache reload
      console.log("✅ Entries cache cleared");
      
      // === REINITIALIZE WITH DEFAULTS ===
      // Create default journal
      localStorage.setItem("talkbook-journals", JSON.stringify([{
        id: "journal-1",
        name: "Journal-1",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }]));
      localStorage.setItem("talkbook-active-journal", "journal-1");
      
      // Reset UI state
      setBlacklist([]);
      setShowResetConfirm(false);
      
      // Dispatch event for XP bar to update
      window.dispatchEvent(new Event("xp-updated"));
      
      alert("🗑️ All data deleted successfully!\n\n✅ Entries, journals, habits, XP, cache - all cleared.\n✓ Your profile (name, picture) and password were preserved.");
      
      // Redirect to homepage (fresh start)
      router.push("/");
    } catch (error) {
      console.error("Error during reset:", error);
      alert("Error clearing some data. Please try again or refresh the page.");
    }
  };

  const handleRebuildCache = async () => {
    setIsRebuilding(true);
    setRebuildMessage("Rebuilding cache... This may take a moment.");
    
    try {
      const result = await rebuildAllMetadata();
      setRebuildMessage(`✅ Successfully rebuilt cache! Updated ${result.updated} entries.`);
      
      // Reload page after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error("Error rebuilding cache:", error);
      setRebuildMessage("❌ Error rebuilding cache. Please try again.");
      setIsRebuilding(false);
    }
  };

  // Load demo data
  const handleLoadDemoData = async () => {
    setIsLoadingDemo(true);
    setDemoMessage("Loading demo data... This may take a moment.");
    
    try {
      // Import required modules
      const { db } = await import("../../src/lib/db/dexie");
      const { saveEntries, invalidateCache } = await import("../../src/lib/cache/entriesCache");
      
      // ============================================================================
      // JOURNALS
      // ============================================================================
      const journals = [
        { id: "journal-1", name: "Daily Journal", createdAt: "2025-10-15T08:00:00.000Z", updatedAt: "2025-10-15T08:00:00.000Z" },
        { id: "journal-2", name: "Work & Projects", createdAt: "2025-10-20T10:30:00.000Z", updatedAt: "2025-10-20T10:30:00.000Z" }
      ];
      localStorage.setItem("talkbook-journals", JSON.stringify(journals));
      localStorage.setItem("talkbook-active-journal", "journal-1");
      
      // ============================================================================
      // JOURNAL ENTRIES (26 entries spanning Oct 23 - Nov 22, 2025)
      // ============================================================================
      const entries = [
        { id: "entry-1729702800000", title: "Morning Reflection - Nov 22", content: "<p>Ending the day feeling satisfied. Made the most of today and that's what matters.</p><p>Reflecting on the past month, I've seen significant growth in both personal and professional areas. The consistency of journaling has helped me stay grounded and aware of my progress.</p>", mood: "grateful", tags: ["reflection", "gratitude"], cardColor: "green", journalId: "journal-1", createdAt: "2025-11-22T18:30:00.000Z", updatedAt: "2025-11-22T18:30:00.000Z", draft: false, promptIds: [], extractedPeople: [], extractedTopics: [], extractedDates: [] },
        { id: "entry-1729616400000", title: "Feeling Thankful - Nov 21", content: "<p>Feeling thankful for the people and opportunities in my life. Gratitude changes perspective.</p><p>Had a wonderful conversation with a friend today. These connections remind me what truly matters in life.</p>", mood: "grateful", tags: ["gratitude", "friends"], cardColor: "yellow", journalId: "journal-1", createdAt: "2025-11-21T16:00:00.000Z", updatedAt: "2025-11-21T16:00:00.000Z", draft: false, promptIds: [], extractedPeople: [], extractedTopics: [], extractedDates: [] },
        { id: "entry-1729530000000", title: "Progress Update - Nov 20", content: "<p>Progress update: things are moving forward. Sometimes slow progress is still progress.</p><p>Completed a major milestone at work today. The team celebrated together and it felt great to see everyone's hard work pay off.</p>", mood: "excited", tags: ["work", "goals"], cardColor: "blue", journalId: "journal-1", createdAt: "2025-11-20T14:15:00.000Z", updatedAt: "2025-11-20T14:15:00.000Z", draft: false, promptIds: [], extractedPeople: [], extractedTopics: [], extractedDates: [] },
        { id: "entry-1729443600000", title: "Mindful Moments - Nov 19", content: "<p>Mindful moments throughout the day. Being present makes everything feel more meaningful.</p><p>Took a break from the usual routine to just be. Sometimes the best thing you can do is nothing at all.</p>", mood: "calm", tags: ["reflection", "health"], cardColor: "purple", journalId: "journal-1", createdAt: "2025-11-19T12:00:00.000Z", updatedAt: "2025-11-19T12:00:00.000Z", draft: false, promptIds: [], extractedPeople: [], extractedTopics: [], extractedDates: [] },
        { id: "entry-1729357200000", title: "Creative Flow - Nov 18", content: "<p>Creative energy flowing today. Worked on a personal project and felt inspired. Love these moments.</p><p>Sometimes when you're in the right headspace, ideas just flow naturally. Today was one of those days.</p>", mood: "excited", tags: ["hobbies", "personal"], cardColor: "pink", journalId: "journal-1", createdAt: "2025-11-18T15:30:00.000Z", updatedAt: "2025-11-18T15:30:00.000Z", draft: false, promptIds: [], extractedPeople: [], extractedTopics: [], extractedDates: [] },
        { id: "entry-1729270800000", title: "Balance Achieved - Nov 17", content: "<p>Found better balance today between work and personal life. It's an ongoing process but making progress.</p><p>Set boundaries and stuck to them. It's important to protect your time and energy.</p>", mood: "calm", tags: ["personal", "health"], cardColor: "default", journalId: "journal-1", createdAt: "2025-11-17T19:00:00.000Z", updatedAt: "2025-11-17T19:00:00.000Z", draft: false, promptIds: [], extractedPeople: [], extractedTopics: [], extractedDates: [] },
        { id: "entry-1729184400000", title: "Focus Session - Nov 16", content: "<p>Deep focus session today. When you're in the zone, time flies and productivity soars.</p><p>Completed several important tasks that had been lingering. The feeling of checking things off the list is so satisfying.</p>", mood: "happy", tags: ["work", "goals"], cardColor: "blue", journalId: "journal-2", createdAt: "2025-11-16T11:00:00.000Z", updatedAt: "2025-11-16T11:00:00.000Z", draft: false, promptIds: [], extractedPeople: [], extractedTopics: [], extractedDates: [] },
        { id: "entry-1729098000000", title: "Connection Day - Nov 15", content: "<p>Connected with friends today. Good conversations and shared laughter. These moments are precious.</p><p>Met up for coffee and ended up talking for hours. Time well spent with people who matter.</p>", mood: "very-happy", tags: ["friends", "personal"], cardColor: "green", journalId: "journal-1", createdAt: "2025-11-15T17:00:00.000Z", updatedAt: "2025-11-15T17:00:00.000Z", draft: false, promptIds: [], extractedPeople: [], extractedTopics: [], extractedDates: [] },
        { id: "entry-1729011600000", title: "New Insights - Nov 14", content: "<p>Had some new insights today. Sometimes clarity comes when you least expect it.</p><p>Was reading an article and something clicked. It's amazing how the right information finds you at the right time.</p>", mood: "excited", tags: ["learning", "reflection"], cardColor: "purple", journalId: "journal-1", createdAt: "2025-11-14T13:30:00.000Z", updatedAt: "2025-11-14T13:30:00.000Z", draft: false, promptIds: [], extractedPeople: [], extractedTopics: [], extractedDates: [] },
        { id: "entry-1728925200000", title: "Reflection Time - Nov 13", content: "<p>Taking time to reflect on recent experiences. Reflection helps process and learn from what happened.</p><p>Looking back at the past few weeks, I can see patterns and areas for improvement. Growth is happening.</p>", mood: "neutral", tags: ["reflection", "personal"], cardColor: "default", journalId: "journal-1", createdAt: "2025-11-13T20:00:00.000Z", updatedAt: "2025-11-13T20:00:00.000Z", draft: false, promptIds: [], extractedPeople: [], extractedTopics: [], extractedDates: [] },
        { id: "entry-1728838800000", title: "Daily Wins - Nov 12", content: "<p>Celebrating small wins today. Every step forward counts, no matter how small it seems.</p><p>Finished a task I'd been putting off, had a good workout, and made time for reading. Small victories add up.</p>", mood: "happy", tags: ["goals", "health"], cardColor: "yellow", journalId: "journal-1", createdAt: "2025-11-12T16:45:00.000Z", updatedAt: "2025-11-12T16:45:00.000Z", draft: false, promptIds: [], extractedPeople: [], extractedTopics: [], extractedDates: [] },
        { id: "entry-1728752400000", title: "Growth Moments - Nov 11", content: "<p>Noticed some personal growth today. Small changes add up over time. Proud of the progress.</p><p>Handled a difficult situation with more patience and understanding than I would have a few months ago. That's progress.</p>", mood: "grateful", tags: ["reflection", "personal"], cardColor: "green", journalId: "journal-1", createdAt: "2025-11-11T14:00:00.000Z", updatedAt: "2025-11-11T14:00:00.000Z", draft: false, promptIds: [], extractedPeople: [], extractedTopics: [], extractedDates: [] },
        { id: "entry-1728666000000", title: "Challenges Overcome - Nov 10", content: "<p>Faced some challenges today but worked through them. Growth happens outside the comfort zone.</p><p>Had to have a difficult conversation but it went better than expected. Sometimes we build things up in our minds more than necessary.</p>", mood: "calm", tags: ["personal", "goals"], cardColor: "blue", journalId: "journal-1", createdAt: "2025-11-10T18:30:00.000Z", updatedAt: "2025-11-10T18:30:00.000Z", draft: false, promptIds: [], extractedPeople: [], extractedTopics: [], extractedDates: [] },
        { id: "entry-1728579600000", title: "Gratitude Practice - Nov 9", content: "<p>Practicing gratitude today. There's always something to be thankful for, even on difficult days.</p><p>Made a list of things I'm grateful for. It's a simple practice but it really shifts your perspective.</p>", mood: "grateful", tags: ["gratitude", "reflection"], cardColor: "yellow", journalId: "journal-1", createdAt: "2025-11-09T12:15:00.000Z", updatedAt: "2025-11-09T12:15:00.000Z", draft: false, promptIds: [], extractedPeople: [], extractedTopics: [], extractedDates: [] },
        { id: "entry-1728493200000", title: "Sunday Planning - Nov 8", content: "<p>Sunday planning session. Organized the week ahead and feeling prepared for what's coming.</p><p>Set priorities and scheduled time for both work and personal activities. A good plan sets you up for success.</p>", mood: "calm", tags: ["goals", "personal"], cardColor: "purple", journalId: "journal-1", createdAt: "2025-11-08T10:00:00.000Z", updatedAt: "2025-11-08T10:00:00.000Z", draft: false, promptIds: [], extractedPeople: [], extractedTopics: [], extractedDates: [] },
        { id: "entry-1728406800000", title: "Saturday Relaxation - Nov 7", content: "<p>Saturday vibes. No rush, no pressure. Just enjoying the moment and being present.</p><p>Spent the day doing things I enjoy without any agenda. Sometimes the best days are the ones with no plans.</p>", mood: "calm", tags: ["personal", "health"], cardColor: "pink", journalId: "journal-1", createdAt: "2025-11-07T15:00:00.000Z", updatedAt: "2025-11-07T15:00:00.000Z", draft: false, promptIds: [], extractedPeople: [], extractedTopics: [], extractedDates: [] },
        { id: "entry-1728320400000", title: "Friday Feels - Nov 6", content: "<p>Friday! Wrapped up the week feeling accomplished. Looking forward to some rest and relaxation.</p><p>Finished all the important tasks for the week. The weekend can't come soon enough.</p>", mood: "happy", tags: ["work", "personal"], cardColor: "green", journalId: "journal-1", createdAt: "2025-11-06T17:30:00.000Z", updatedAt: "2025-11-06T17:30:00.000Z", draft: false, promptIds: [], extractedPeople: [], extractedTopics: [], extractedDates: [] },
        { id: "entry-1728234000000", title: "Midweek Check-in - Nov 5", content: "<p>Midweek check-in: staying on track with goals. Some challenges but working through them one step at a time.</p><p>The week is going well overall. Staying focused and making progress on key priorities.</p>", mood: "neutral", tags: ["goals", "work"], cardColor: "default", journalId: "journal-1", createdAt: "2025-11-05T13:00:00.000Z", updatedAt: "2025-11-05T13:00:00.000Z", draft: false, promptIds: [], extractedPeople: [], extractedTopics: [], extractedDates: [] },
        { id: "entry-1728147600000", title: "Monday Motivation - Nov 4", content: "<p>Monday morning and feeling motivated. Set intentions for the week and ready to make it count.</p><p>Started the week with a clear plan and positive energy. Excited about what's ahead.</p>", mood: "excited", tags: ["work", "goals"], cardColor: "blue", journalId: "journal-1", createdAt: "2025-11-04T09:00:00.000Z", updatedAt: "2025-11-04T09:00:00.000Z", draft: false, promptIds: [], extractedPeople: [], extractedTopics: [], extractedDates: [] },
        { id: "entry-1728061200000", title: "Weekend Adventures - Nov 3", content: "<p>Explored a new place this weekend. Adventure and new experiences keep life interesting and exciting.</p><p>Went hiking and discovered a beautiful trail I'd never been on before. Nature always recharges me.</p>", mood: "very-happy", tags: ["hobbies", "health"], cardColor: "green", journalId: "journal-1", createdAt: "2025-11-03T16:00:00.000Z", updatedAt: "2025-11-03T16:00:00.000Z", draft: false, promptIds: [], extractedPeople: [], extractedTopics: [], extractedDates: [] },
        { id: "entry-1727974800000", title: "Self Care Day - Nov 2", content: "<p>Took a day to focus on self-care. Sometimes you need to slow down and recharge. Feeling refreshed.</p><p>Did a face mask, read a book, and just relaxed. Self-care isn't selfish, it's necessary.</p>", mood: "calm", tags: ["health", "personal"], cardColor: "pink", journalId: "journal-1", createdAt: "2025-11-02T14:30:00.000Z", updatedAt: "2025-11-02T14:30:00.000Z", draft: false, promptIds: [], extractedPeople: [], extractedTopics: [], extractedDates: [] },
        { id: "entry-1727888400000", title: "Work Progress - Nov 1", content: "<p>Completed several important tasks at work. The team is working well together and we're making good progress.</p><p>Had a productive meeting and aligned on next steps. Collaboration makes everything easier.</p>", mood: "happy", tags: ["work"], cardColor: "blue", journalId: "journal-2", createdAt: "2025-11-01T11:30:00.000Z", updatedAt: "2025-11-01T11:30:00.000Z", draft: false, promptIds: [], extractedPeople: [], extractedTopics: [], extractedDates: [] },
        { id: "entry-1727802000000", title: "Family Time - Oct 31", content: "<p>Quality time with family today. These connections are what truly matter in life. Feeling blessed.</p><p>Had dinner together and just talked. Simple moments but they mean everything.</p>", mood: "very-happy", tags: ["family", "personal"], cardColor: "yellow", journalId: "journal-1", createdAt: "2025-10-31T19:00:00.000Z", updatedAt: "2025-10-31T19:00:00.000Z", draft: false, promptIds: [], extractedPeople: [], extractedTopics: [], extractedDates: [] },
        { id: "entry-1727715600000", title: "Learning Journey - Oct 30", content: "<p>Attended a workshop today and learned some valuable skills. Always good to invest in personal development.</p><p>The session was engaging and I came away with actionable insights. Learning never stops.</p>", mood: "excited", tags: ["learning", "goals"], cardColor: "purple", journalId: "journal-1", createdAt: "2025-10-30T15:00:00.000Z", updatedAt: "2025-10-30T15:00:00.000Z", draft: false, promptIds: [], extractedPeople: [], extractedTopics: [], extractedDates: [] },
        { id: "entry-1727629200000", title: "New Beginnings - Oct 29", content: "<p>Starting a new chapter. Set some goals and feeling motivated to work towards them. Change can be exciting.</p><p>Decided to make some positive changes in my routine. Small steps lead to big transformations.</p>", mood: "excited", tags: ["goals", "personal"], cardColor: "green", journalId: "journal-1", createdAt: "2025-10-29T10:00:00.000Z", updatedAt: "2025-10-29T10:00:00.000Z", draft: false, promptIds: [], extractedPeople: [], extractedTopics: [], extractedDates: [] },
        { id: "entry-1727542800000", title: "Feeling Grateful - Oct 28", content: "<p>Taking time to appreciate the good things in life. Grateful for health, relationships, and opportunities to grow.</p><p>Sometimes it's easy to focus on what's missing, but today I'm choosing to focus on what I have.</p>", mood: "grateful", tags: ["gratitude", "reflection"], cardColor: "yellow", journalId: "journal-1", createdAt: "2025-10-28T17:00:00.000Z", updatedAt: "2025-10-28T17:00:00.000Z", draft: false, promptIds: [], extractedPeople: [], extractedTopics: [], extractedDates: [] },
        { id: "entry-1727456400000", title: "Productive Day - Oct 27", content: "<p>Made significant progress on my project today. The momentum is building and I'm excited about the direction things are heading.</p><p>Crossed off several items from my to-do list. Progress feels good.</p>", mood: "happy", tags: ["work", "goals"], cardColor: "blue", journalId: "journal-2", createdAt: "2025-10-27T14:00:00.000Z", updatedAt: "2025-10-27T14:00:00.000Z", draft: false, promptIds: [], extractedPeople: [], extractedTopics: [], extractedDates: [] },
        { id: "entry-1727370000000", title: "Weekend Vibes - Oct 26", content: "<p>Spent the weekend recharging. Went for a long walk, read a good book, and caught up with family. These moments matter.</p><p>Sometimes the best weekends are the quiet ones. Rest is productive too.</p>", mood: "calm", tags: ["personal", "family"], cardColor: "pink", journalId: "journal-1", createdAt: "2025-10-26T16:00:00.000Z", updatedAt: "2025-10-26T16:00:00.000Z", draft: false, promptIds: [], extractedPeople: [], extractedTopics: [], extractedDates: [] },
        { id: "entry-1727283600000", title: "End of Day Thoughts - Oct 25", content: "<p>Reflecting on today's experiences. Learned something new and had meaningful conversations with friends. Feeling content.</p><p>Days like this remind me why I journal. It helps capture these moments of clarity and connection.</p>", mood: "happy", tags: ["friends", "reflection"], cardColor: "green", journalId: "journal-1", createdAt: "2025-10-25T20:00:00.000Z", updatedAt: "2025-10-25T20:00:00.000Z", draft: false, promptIds: [], extractedPeople: [], extractedTopics: [], extractedDates: [] },
        { id: "entry-1727197200000", title: "Morning Reflection - Oct 24", content: "<p>Started the day with a clear mind and positive energy. Had a great morning routine and feeling ready to tackle the day ahead.</p><p>Morning routines really set the tone for the whole day. Grateful for this practice.</p>", mood: "happy", tags: ["health", "personal"], cardColor: "default", journalId: "journal-1", createdAt: "2025-10-24T08:30:00.000Z", updatedAt: "2025-10-24T08:30:00.000Z", draft: false, promptIds: [], extractedPeople: [], extractedTopics: [], extractedDates: [] },
        { id: "entry-1727110800000", title: "Morning Reflection - Oct 23", content: "<p>Starting fresh today. New day, new opportunities. Feeling optimistic about what's ahead.</p><p>Set some intentions for the week and feeling ready to make progress on my goals.</p>", mood: "excited", tags: ["goals", "personal"], cardColor: "blue", journalId: "journal-1", createdAt: "2025-10-23T09:00:00.000Z", updatedAt: "2025-10-23T09:00:00.000Z", draft: false, promptIds: [], extractedPeople: [], extractedTopics: [], extractedDates: [] }
      ];
      
      saveEntries(entries);
      localStorage.setItem("entriesCacheVersion", "1");
      
      // ============================================================================
      // XP & LEVEL
      // ============================================================================
      localStorage.setItem("talkbook-xp", "15250");
      localStorage.setItem("talkbook-level", "8");
      localStorage.setItem("talkbook-last-entry-date", "2025-11-22");
      localStorage.setItem("talkbook-last-all-habits-bonus-date", "2025-11-20");
      
      // ============================================================================
      // USED PROMPTS & BLACKLIST
      // ============================================================================
      localStorage.setItem("talkbook-used-prompts", JSON.stringify(["prompt-001", "prompt-002", "prompt-003"]));
      localStorage.setItem("talkbook-blacklist", JSON.stringify(["example", "test"]));
      
      // ============================================================================
      // HABITS & HABIT LOGS
      // ============================================================================
      await db.habits.clear();
      await db.habitLogs.clear();
      
      const habits = [
        { profileId: 1, name: "Morning Meditation", type: "boolean" as const, color: "#3B82F6", frequency: "daily" as const, archived: false, createdAt: "2025-10-15T08:00:00.000Z", order: 0 },
        { profileId: 1, name: "Exercise", type: "boolean" as const, color: "#EF4444", frequency: "daily" as const, archived: false, createdAt: "2025-10-15T08:00:00.000Z", order: 1 },
        { profileId: 1, name: "Read Pages", type: "numeric" as const, target: 20, unit: "pages", color: "#10B981", frequency: "daily" as const, archived: false, createdAt: "2025-10-16T09:00:00.000Z", order: 2 },
        { profileId: 1, name: "Water Intake", type: "numeric" as const, target: 8, unit: "glasses", color: "#8B5CF6", frequency: "daily" as const, archived: false, createdAt: "2025-10-17T10:00:00.000Z", order: 3 },
        { profileId: 1, name: "Journal Entry", type: "boolean" as const, color: "#F59E0B", frequency: "daily" as const, archived: false, createdAt: "2025-10-18T11:00:00.000Z", order: 4 },
        { profileId: 1, name: "Gratitude Practice", type: "boolean" as const, color: "#EC4899", frequency: "daily" as const, archived: false, createdAt: "2025-10-19T12:00:00.000Z", order: 5 }
      ];
      
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
        
        for (let j = 0; j < habitIds.length; j++) {
          const habitId = habitIds[j];
          const habit = habits[j];
          const completionRate = habit.name === "Morning Meditation" ? 0.25 : habit.name === "Exercise" ? 0.20 : habit.name === "Journal Entry" ? 0.10 : 0.15;
          const shouldLog = Math.random() > completionRate;
          
          if (shouldLog) {
            let value = 1;
            if (habit.type === "numeric") {
              const minValue = Math.floor(habit.target! * 0.6);
              const maxValue = Math.floor(habit.target! * 1.2);
              value = Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;
            }
            
            const hour = Math.floor(Math.random() * 12) + 8;
            const minute = Math.floor(Math.random() * 60);
            const completedAt = new Date(currentDate);
            completedAt.setHours(hour, minute, 0, 0);
            
            logs.push({ habitId, date: dateString, value, completedAt: completedAt.toISOString() });
          }
        }
      }
      
      await db.habitLogs.bulkAdd(logs);
      
      // Invalidate cache and dispatch events
      invalidateCache();
      window.dispatchEvent(new Event("xp-updated"));
      
      setDemoMessage(`Demo data loaded successfully! ${entries.length} entries, ${habits.length} habits, ${logs.length} habit logs.`);
      
      // Reload page after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error("Error loading demo data:", error);
      setDemoMessage("❌ Error loading demo data. Please try again.");
      setIsLoadingDemo(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Settings</h1>

        {/* Profile Settings */}
        <div className="border border-gray-200 rounded-lg p-6 mb-6" style={{ backgroundColor: "var(--background, #ffffff)" }}>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Settings</h2>
          
          {/* Profile Picture */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Picture
            </label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {profilePicture ? (
                  <img 
                    src={profilePicture} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10 text-gray-400" />
                )}
              </div>
              <div className="flex gap-2">
                <label className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition cursor-pointer">
                  Upload Picture
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePictureUpload}
                    className="hidden"
                  />
                </label>
                {profilePicture && (
                  <button
                    onClick={handleRemovePicture}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Max size: 2MB. Supported: JPG, PNG, GIF</p>
          </div>

          {/* Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              maxLength={20}
              placeholder="Enter your name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
            />
            <p className="text-xs text-gray-500 mt-1">
              Max 20 characters ({userName.length}/20)
            </p>
          </div>

          <button
            onClick={handleSaveProfile}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Save Profile
          </button>

          {profileSuccess && (
            <p className="text-green-600 text-sm mt-2 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              {profileSuccess}
            </p>
          )}
        </div>

        {/* Appearance Settings - Background Color */}
        <div className="border border-gray-200 rounded-lg p-6 mb-6" style={{ backgroundColor: "var(--background, #ffffff)" }}>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Appearance Settings</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Background Color
            </label>
            <p className="text-xs text-gray-500 mb-4">
              Choose a background color for the entire application. All colors are designed to keep text readable.
            </p>
            
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
              {Object.entries(BACKGROUND_COLORS).map(([key, color]) => (
                <button
                  key={key}
                  onClick={() => handleBackgroundColorChange(key as BackgroundColorKey)}
                  className={`
                    relative p-4 rounded-lg border-2 transition-all
                    ${backgroundColor === key 
                      ? "border-blue-500 ring-2 ring-blue-200" 
                      : "border-gray-200 hover:border-gray-300"
                    }
                  `}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                >
                  <div 
                    className="w-full h-16 rounded mb-2"
                    style={{ backgroundColor: color.value }}
                  />
                  <span className="text-xs font-medium text-gray-900 block text-center">
                    {color.name}
                  </span>
                  {backgroundColor === key && (
                    <div className="absolute top-1 right-1">
                      <CheckCircle2 className="w-5 h-5 text-blue-600" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {backgroundColorSuccess && (
            <p className="text-green-600 text-sm mt-2 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              {backgroundColorSuccess}
            </p>
          )}
        </div>

        {/* Password Settings */}
        <div className="border border-gray-200 rounded-lg p-6" style={{ backgroundColor: "var(--background, #ffffff)" }}>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Password Protection</h2>
          
          {hasPassword ? (
            <div>
              <p className="text-green-600 mb-4 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                Password is currently set
              </p>
              <p className="text-gray-600 mb-4">
                Your app is password protected. Use the Lock button in the sidebar to lock the app.
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter Current Password to Remove
                </label>
                <input
                  type="password"
                  value={removePasswordInput}
                  onChange={(e) => setRemovePasswordInput(e.target.value)}
                  maxLength={12}
                  placeholder="Enter current password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
                />
              </div>

              {removePasswordError && (
                <p className="text-red-600 text-sm mb-4 flex items-center gap-1">
                  <X className="w-4 h-4" />
                  {removePasswordError}
                </p>
              )}

              <button
                onClick={handleRemovePassword}
                className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                Remove Password
              </button>
            </div>
          ) : (
            <div>
              <p className="text-gray-600 mb-4">
                Set a password to protect your journal from unauthorized access.
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  maxLength={12}
                  placeholder="Enter password (max 12 characters)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  maxLength={12}
                  placeholder="Confirm password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
                />
              </div>

              {passwordError && (
                <p className="text-red-600 text-sm mb-4 flex items-center gap-1">
                  <X className="w-4 h-4" />
                  {passwordError}
                </p>
              )}

              <button
                onClick={handleSetPassword}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                Set Password
              </button>
            </div>
          )}

          {passwordSuccess && (
            <p className="text-green-600 text-sm mt-4 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              {passwordSuccess}
            </p>
          )}
        </div>

        {/* Blacklist Settings */}
        <div className="border-2 border-gray-100 rounded-2xl p-6 shadow-sm mb-6" style={{ backgroundColor: "var(--background, #ffffff)" }}>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Word Blacklist</h2>
          <p className="text-sm text-gray-600 mb-4">
            Words added to the blacklist will not appear in prompts or topic suggestions, even if extracted from your entries.
          </p>

          {/* Add to Blacklist */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Add Word to Blacklist
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={blacklistInput}
                onChange={(e) => setBlacklistInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleAddToBlacklist();
                  }
                }}
                placeholder="Enter a word..."
                maxLength={30}
                className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
              />
              <button
                onClick={handleAddToBlacklist}
                disabled={!blacklistInput.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-semibold"
              >
                Add
              </button>
            </div>
          </div>

          {/* Blacklist Display */}
          {blacklist.length > 0 ? (
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Blacklisted Words ({blacklist.length})
              </label>
              <div className="flex flex-wrap gap-2">
                {blacklist.map((word) => (
                  <div
                    key={word}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 border-2 border-gray-200 rounded-lg"
                  >
                    <span className="text-sm font-medium text-gray-900">{word}</span>
                    <button
                      onClick={() => handleRemoveFromBlacklist(word)}
                      className="text-red-600 hover:text-red-700 font-bold text-sm"
                      title="Remove from blacklist"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">No blacklisted words yet</p>
          )}

          {blacklistSuccess && (
            <p className="text-green-600 text-sm mt-3 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              {blacklistSuccess}
            </p>
          )}
        </div>

        {/* Load Demo Data */}
        <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-green-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Load Demo Data
          </h2>
          <p className="text-sm text-green-700 mb-4">
            <strong>Demo Mode</strong> - Loads a month's worth of sample data (Oct 23 - Nov 22, 2025) for demonstration purposes.
            This includes journal entries, habits, habit logs, XP, and more.
          </p>
          <p className="text-xs text-green-600 mb-4 italic flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            This will replace your existing data with demo data
          </p>
          
          <button
            onClick={handleLoadDemoData}
            disabled={isLoadingDemo}
            className={`px-6 py-2 rounded-lg transition-colors font-semibold ${
              isLoadingDemo
                ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            {isLoadingDemo ? "Loading Demo Data..." : "Load Demo Data"}
          </button>

          {demoMessage && (
            <p className="text-sm mt-3 text-green-900 font-medium">
              {demoMessage}
            </p>
          )}
        </div>

        {/* Rebuild Cache */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            Rebuild Metadata Cache
          </h2>
          <p className="text-sm text-blue-700 mb-4">
            <strong>Safe operation</strong> - Only refreshes extracted metadata (names, topics) from your existing entries. 
            Does NOT delete any data. Use this if you see incorrect words in prompts or after updates.
          </p>
          <p className="text-xs text-blue-600 mb-4 italic flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Keeps all entries, journals, habits, and XP intact
          </p>
          
          <button
            onClick={handleRebuildCache}
            disabled={isRebuilding}
            className={`px-6 py-2 rounded-lg transition-colors font-semibold ${
              isRebuilding
                ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {isRebuilding ? "Rebuilding..." : "Rebuild Cache"}
          </button>

          {rebuildMessage && (
            <p className="text-sm mt-3 text-blue-900 font-medium">
              {rebuildMessage}
            </p>
          )}
        </div>

        {/* Reset Data */}
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-red-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Delete All Data
          </h2>
          <p className="text-sm text-red-700 mb-2 flex items-center gap-1">
            <strong className="flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              DANGER ZONE:
            </strong>
            This will permanently delete EVERYTHING:
          </p>
          <ul className="text-sm text-red-700 mb-4 ml-6 list-disc space-y-1">
            <li>All journal entries and drafts</li>
            <li>All journals (folders)</li>
            <li>All habits and habit logs</li>
            <li>All XP and level progress</li>
            <li>All extracted metadata and cache</li>
            <li>All prompts and blacklist</li>
          </ul>
          <p className="text-xs text-red-600 mb-4 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Profile settings (name, picture) and password will be preserved
          </p>
          
          {!showResetConfirm ? (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
            >
              Delete All Data
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm font-bold text-red-900">
                Are you absolutely sure? This action cannot be undone!
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleResetAllData}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                >
                  Yes, Reset Everything
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}
