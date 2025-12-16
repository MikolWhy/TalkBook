// new journal entry page - create entry form with rich text editor, mood selector, prompts

"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileText, Check } from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import dynamic from "next/dynamic";
import type { RichTextEditorRef } from "../../../src/components/RichTextEditor";

// Dynamically import RichTextEditor (TipTap) to reduce initial bundle size
const RichTextEditor = dynamic(
  () => import("../../../src/components/RichTextEditor").then(mod => mod.default),
  { ssr: false }
);
import PromptSuggestions from "../../../src/components/PromptSuggestions";
import TopicSuggestions from "../../../src/components/TopicSuggestions";
import { extractMetadata } from "../../../src/lib/nlp/extract";
import { generatePrompts, filterUsedPrompts, filterExpiredPrompts, Prompt, markPromptAsUsed, getTopicSuggestions, TopicSuggestion } from "../../../src/lib/nlp/prompts";
import { getActiveJournalId, getJournals, type Journal } from "../../../src/lib/journals/manager";
import { getEntries, addEntry, updateEntry } from "../../../src/lib/cache/entriesCache";
import { awardEntryXP } from "../../../src/lib/gamification/xp";
import XPNotification from "../../components/XPNotification";

export default function NewEntryPage() {
  const router = useRouter();
  const editorRef = useRef<RichTextEditorRef>(null);
  const [title, setTitle] = useState(""); // State to store entry title
  const [content, setContent] = useState(""); // State to store editor content
  const [mood, setMood] = useState<string | null>(null); // State to store selected mood
  const [tags, setTags] = useState<string[]>([]); // State to store tags
  const [tagInput, setTagInput] = useState(""); // State for tag input field
  const [cardColor, setCardColor] = useState<string>("default"); // State for card color
  const [journals, setJournals] = useState<Journal[]>([]); // All available journals
  const [selectedJournalId, setSelectedJournalId] = useState<string>(""); // Selected journal for this entry

  // ============================================================================
  // MICHAEL'S CODE - NLP Prompt System State
  // ============================================================================
  const [extractedData, setExtractedData] = useState<{
    people: string[];
    topics: string[];
    dates: Date[];
  } | null>(null);

  // Load journals and set default selected journal
  useEffect(() => {
    const allJournals = getJournals();
    setJournals(allJournals);
    const activeJournal = getActiveJournalId();
    setSelectedJournalId(activeJournal || (allJournals.length > 0 ? allJournals[0].id : ""));
  }, []);

  // State for prompts (SIMPLIFIED: Only people prompts are clickable)
  const [allPrompts, setAllPrompts] = useState<Prompt[]>([]); // All available prompts (people only)
  const [topicSuggestions, setTopicSuggestions] = useState<TopicSuggestion[]>([]); // Topic suggestions (non-clickable)
  const [insertedPromptIds, setInsertedPromptIds] = useState<Set<string>>(new Set()); // Prompts currently in editor (temporarily used)

  // XP Notification State
  const [showXPNotification, setShowXPNotification] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [leveledUp, setLeveledUp] = useState(false);
  const [oldLevel, setOldLevel] = useState<number | undefined>(undefined);
  const [newLevel, setNewLevel] = useState<number | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false); // Prevent duplicate saves

  // Filter prompts: show only those NOT currently inserted in editor
  const availablePrompts = allPrompts.filter(p => !insertedPromptIds.has(p.id));

  //  Dummy text for NLP testing - now using actual entries
  // const dummyText = "Had a great meeting with Zayn today about our group project, I am feeling lazy though and have been procrastinating some of my parts of the project. Not feeling great about it.";

  // Extract metadata and generate prompts when component loads
  useEffect(() => {
    const runExtractionAndPrompts = async () => {
      try {
        // SIMPLIFIED: Separate logic for people prompts vs topic suggestions
        // People prompts: Use last 7 days (for variety)
        // Topic suggestions: Use last 3 entries only (as requested)

        // OPTIMIZATION: Use cached entries instead of parsing localStorage
        const storedEntries = getEntries();

        // FILTER BY ACTIVE JOURNAL FIRST
        const activeJournalId = getActiveJournalId();
        const journalEntries = storedEntries.filter((entry: any) =>
          (entry.journalId || "journal-1") === activeJournalId
        );

        // Filter entries from last 7 days for people prompts
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentEntriesForPeople = journalEntries.filter((entry: any) => {
          const entryDate = new Date(entry.createdAt);
          const isRecent = entryDate >= sevenDaysAgo;
          const isNotDraft = entry.draft !== true;
          return isRecent && isNotDraft;
        });

        // Filter last 3 entries for topic suggestions (sorted by date, newest first)
        const sortedEntries = [...journalEntries].sort(
          (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        const lastThreeEntries = sortedEntries
          .filter((entry: any) => entry.draft !== true)
          .slice(0, 3);

        // use cached metadata if available, otherwise extract from content
        const allPeople = new Set<string>();
        let needsExtractionForPeople = false;

        for (const entry of recentEntriesForPeople) {
          if (entry.extractedPeople && Array.isArray(entry.extractedPeople)) {
            entry.extractedPeople.forEach((person: string) => allPeople.add(person));
          } else {
            needsExtractionForPeople = true;
            break;
          }
        }

        let peopleResult = null;
        let peopleOriginalText = undefined;

        if (needsExtractionForPeople) {
          console.log("⚠️ [Optimization] Some entries lack cached metadata, running extraction...");
          const combinedTextForPeople = recentEntriesForPeople
            .map((entry: any) => entry.content || "")
            .filter((content: string) => content.trim().length > 0)
            .join(" ");

          if (combinedTextForPeople.trim().length > 0) {
            peopleResult = await extractMetadata(combinedTextForPeople);
            peopleOriginalText = combinedTextForPeople;
          }
        } else if (allPeople.size > 0) {
          console.log("✅ [Optimization] Using cached metadata, skipping extraction!");
          peopleResult = {
            people: Array.from(allPeople),
            topics: [],
          };
        }

        // Aggregate cached topics from last 3 entries
        const allTopics = new Set<string>();
        const allTopicsPeople = new Set<string>();
        let needsExtractionForTopics = false;

        for (const entry of lastThreeEntries) {
          if (entry.extractedTopics && Array.isArray(entry.extractedTopics) &&
            entry.extractedPeople && Array.isArray(entry.extractedPeople)) {
            // Use cached data
            entry.extractedTopics.forEach((topic: string) => allTopics.add(topic));
            entry.extractedPeople.forEach((person: string) => allTopicsPeople.add(person));
          } else {
            // Entry doesn't have cached metadata
            needsExtractionForTopics = true;
            break;
          }
        }

        let topicsResult = null;
        let topicsPeopleResult = null;

        if (needsExtractionForTopics) {
          console.log("⚠️ [Optimization] Some entries lack cached metadata for topics, running extraction...");
          const combinedTextForTopics = lastThreeEntries
            .map((entry: any) => entry.content || "")
            .filter((content: string) => content.trim().length > 0)
            .join(" ");

          if (combinedTextForTopics.trim().length > 0) {
            topicsResult = await extractMetadata(combinedTextForTopics);
            // OPTIMIZATION FIX #3: Remove duplicate extraction call
            // We can reuse topicsResult.people instead of extracting again
            topicsPeopleResult = topicsResult;
          }
        } else if (allTopics.size > 0) {
          console.log("✅ [Optimization] Using cached topic metadata!");
          topicsResult = {
            people: Array.from(allTopicsPeople),
            topics: Array.from(allTopics),
          };
          topicsPeopleResult = topicsResult;
        }


        // Generate people prompts (clickable) - up to 10, with non-defaults taking priority
        const generatedPrompts = await generatePrompts(peopleResult, "cozy", 10, peopleOriginalText);

        // Filter out used prompts
        const unusedPrompts = peopleResult
          ? filterUsedPrompts(generatedPrompts)
          : generatedPrompts; // Don't filter defaults

        // Filter out expired prompts
        const expiryDays = 7;
        const validPrompts = filterExpiredPrompts(unusedPrompts, expiryDays);

        // Fallback to defaults if no prompts available
        let finalPrompts = validPrompts;
        if (validPrompts.length === 0 && peopleResult) {
          const defaultPromptsRaw = await generatePrompts(null, "cozy", 10);
          finalPrompts = defaultPromptsRaw;
        }

        setAllPrompts(finalPrompts);

        // Generate topic suggestions (non-clickable, from last 3 entries)
        // Exclude names - only show non-name topics
        // Always call getTopicSuggestions - it will return defaults if no topics found
        const namesFromPeopleExtraction = peopleResult?.people || [];
        const namesFromTopicsExtraction = topicsPeopleResult?.people || [];
        // Combine and deduplicate (case-insensitive)
        const allNames = new Set<string>();
        [...namesFromPeopleExtraction, ...namesFromTopicsExtraction].forEach(name => {
          allNames.add(name.toLowerCase().trim());
        });
        const namesToExclude = Array.from(allNames);

        // Always get topic suggestions (will return defaults if no extracted topics)
        const suggestions = getTopicSuggestions(topicsResult || null, 8, namesToExclude); // Cap at 8 topics, exclude names
        setTopicSuggestions(suggestions);
      } catch (error) {
        console.error("Error extracting metadata or generating prompts:", error);
      }
    };

    runExtractionAndPrompts();
  }, []); // Empty dependency array = run once on mount

  // Handle prompt being inserted into editor
  // SIMPLIFIED: Mark as temporarily used when clicked (even if user edits it)
  // Will be permanently marked when entry is saved, or unmarked if user exits without saving
  const handlePromptInserted = (promptId: string) => {
    setInsertedPromptIds((prev) => {
      const newSet = new Set(prev);
      newSet.add(promptId); // Mark as temporarily used
      return newSet;
    });
  };

  // Monitor editor content to detect when prompts are removed
  // DISABLED: User wants prompts to remain marked as used even if they edit the text
  // Only if they exit without saving should prompts reappear (which happens automatically on unmount)
  /* 
  useEffect(() => {
    // ... code ...
  }, [content, insertedPromptIds, allPrompts]);
  */

  // TODO: When entry is saved (Aadil implements save functionality):
  // 1. Extract metadata from current entry content: extractMetadata(content)
  // 2. Save entry to database: createEntry({ content, mood, date, ... })
  // 3. Save extracted entities to database (for future prompt generation)
  // 4. Mark inserted prompts as permanently used:
  //    insertedPromptIds.forEach(id => markPromptAsUsed(id));
  // 5. Clear inserted prompts: setInsertedPromptIds(new Set());
  //    This allows prompts to reappear if the same topics come up in future entries

  // ============================================================================
  // TEAMMATE'S CODE (AADIL) - Mood Options - KEPT EXACTLY AS IS
  // ============================================================================
  const moodOptions = [
    { id: "very-happy", emoji: "😄", label: "Very Happy" },
    { id: "happy", emoji: "😊", label: "Happy" },
    { id: "neutral", emoji: "😐", label: "Neutral" },
    { id: "sad", emoji: "😢", label: "Sad" },
    { id: "very-sad", emoji: "😭", label: "Very Sad" },
    { id: "excited", emoji: "🤩", label: "Excited" },
    { id: "calm", emoji: "😌", label: "Calm" },
    { id: "anxious", emoji: "😰", label: "Anxious" },
    { id: "angry", emoji: "😠", label: "Angry" },
    { id: "grateful", emoji: "🙏", label: "Grateful" },
  ];

  // ============================================================================
  // TEAMMATE'S CODE (AADIL) - Tag Functions - KEPT EXACTLY AS IS
  // ============================================================================
  const tagColors = [
    "bg-blue-100 text-blue-800 border-blue-300",
    "bg-green-100 text-green-800 border-green-300",
    "bg-purple-100 text-purple-800 border-purple-300",
    "bg-pink-100 text-pink-800 border-pink-300",
    "bg-yellow-100 text-yellow-800 border-yellow-300",
    "bg-red-100 text-red-800 border-red-300",
    "bg-indigo-100 text-indigo-800 border-indigo-300",
    "bg-teal-100 text-teal-800 border-teal-300",
    "bg-orange-100 text-orange-800 border-orange-300",
    "bg-cyan-100 text-cyan-800 border-cyan-300",
  ];

  // Function to get color for a tag based on its index
  const getTagColor = (index: number) => {
    return tagColors[index % tagColors.length];
  };

  // Card color options for journal entries
  const cardColorOptions = [
    { id: "default", name: "Default", bgClass: "bg-white", borderClass: "border-gray-200" },
    { id: "mint", name: "Mint Green", bgClass: "bg-emerald-50", borderClass: "border-emerald-200" },
    { id: "blue", name: "Baby Blue", bgClass: "bg-blue-50", borderClass: "border-blue-200" },
    { id: "pink", name: "Light Pink", bgClass: "bg-pink-50", borderClass: "border-pink-200" },
    { id: "red", name: "Light Red", bgClass: "bg-red-50", borderClass: "border-red-200" },
    { id: "purple", name: "Light Purple", bgClass: "bg-purple-50", borderClass: "border-purple-200" },
    { id: "orange", name: "Light Orange", bgClass: "bg-orange-50", borderClass: "border-orange-200" },
    { id: "yellow", name: "Warm Yellow", bgClass: "bg-amber-50", borderClass: "border-amber-200" },
    { id: "rose", name: "Light Rose", bgClass: "bg-rose-50", borderClass: "border-rose-200" },
    { id: "indigo", name: "Light Indigo", bgClass: "bg-indigo-50", borderClass: "border-indigo-200" },
  ];

  // Function to add a tag
  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput("");
    }
  };

  // Function to remove a tag
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  // Function to handle tag input key press
  const handleTagInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  // #6: Format Date as Title with Ordinal Suffix (e.g., "November 20th, 2025")
  // WHY: User requested that entries can be saved without a title, defaulting to the date.
  //      This provides a readable date format with ordinal suffixes (st, nd, rd, th).
  // HOW: Use toLocaleDateString to format, then replace day number with day + suffix.
  //      Handle special cases: 1st, 21st, 31st (st), 2nd, 22nd (nd), 3rd, 23rd (rd), else (th).
  // SYNTAX BREAKDOWN:
  //   - const formatDateAsTitle = (date: Date): string =>
  //     - Arrow function syntax: (param) => { body }
  //     - TypeScript: parameter type (Date) and return type (string)
  //     - const: function assigned to constant (cannot be reassigned)
  //   - date.getDate() - JavaScript Date method, returns day of month (1-31)
  //   - Ternary operator: condition ? valueIfTrue : valueIfFalse
  //     - Chained ternaries: condition1 ? value1 : condition2 ? value2 : value3
  //     - Logical OR: || operator (returns first truthy value or last value)
  //   - date.toLocaleDateString("en-US", options) - JavaScript Date method
  //     - "en-US": locale string (language-region format)
  //     - options object: { month: "long", day: "numeric", year: "numeric" }
  //       - month: "long" = full month name (e.g., "November")
  //       - day: "numeric" = day as number (e.g., "20")
  //       - year: "numeric" = full year (e.g., "2025")
  //   - .replace(/\d+/, replacement) - JavaScript String method
  //     - /\d+/: Regular expression (regex) - matches one or more digits
  //       - \d = digit character class, + = one or more (quantifier)
  //     - `${day}${daySuffix}`: Template literal with variable interpolation
  // REFERENCES:
  //   - getDate(): JavaScript Date.prototype.getDate() - MDN Web Docs
  //   - toLocaleDateString(): JavaScript Date.prototype.toLocaleDateString() - MDN Web Docs
  //   - replace(): JavaScript String.prototype.replace() - MDN Web Docs
  //   - Regular expressions: JavaScript RegExp - MDN Web Docs
  //   - Ternary operator: JavaScript conditional (ternary) operator - MDN Web Docs
  // APPROACH: Simple date formatting - conventional JavaScript date API usage.
  //           Not over-engineered - straightforward string manipulation.
  // CONNECTION: Used in both handleSaveDraft() and handleSave() when title is empty.
  const formatDateAsTitle = (date: Date): string => {
    const day = date.getDate(); // Get day of month (1-31)
    const daySuffix =
      day === 1 || day === 21 || day === 31 ? "st" : // 1st, 21st, 31st
        day === 2 || day === 22 ? "nd" : // 2nd, 22nd
          day === 3 || day === 23 ? "rd" : "th"; // 3rd, 23rd, else "th"

    return date.toLocaleDateString("en-US", {
      month: "long", // Full month name
      day: "numeric", // Day as number
      year: "numeric", // Full year
    }).replace(/\d+/, `${day}${daySuffix}`); // Replace day number with day + suffix
  };

  // #7: Save as Draft - No Extraction, Can Be Incomplete
  // WHY: User requested ability to save incomplete entries to continue later.
  //      Drafts shouldn't run extraction or mark prompts as used until they're saved properly.
  // HOW: Set draft: true, don't call extractMetadata(), don't call markPromptAsUsed().
  //      Default title to date if empty using formatDateAsTitle().
  // SYNTAX BREAKDOWN:
  //   - const handleSaveDraft = () => { ... }
  //     - Arrow function assigned to const (function expression)
  //     - No parameters needed - uses closure to access component state
  //   - title.trim() - JavaScript String method, removes whitespace from both ends
  //   - || operator - Logical OR, returns first truthy value or last value
  //     - If title.trim() is empty string (falsy), use formatDateAsTitle(new Date())
  //   - Date.now() - JavaScript Date static method, returns milliseconds since epoch
  //     - .toString() - Converts number to string (used as entry ID)
  //   - new Date().toISOString() - Creates new Date object, converts to ISO 8601 string
  //     - Format: "2025-11-20T12:34:56.789Z" (UTC timezone)
  //   - Array.from(insertedPromptIds) - Converts Set to Array
  //     - insertedPromptIds is a Set<string> (prevents duplicates)
  //     - Array.from() is JavaScript built-in method to convert iterable to array
  //   - localStorage.getItem("journalEntries") - Web Storage API
  //     - localStorage: Browser API for persistent storage (survives page refresh)
  //     - getItem(key): Returns string value or null if key doesn't exist
  //   - JSON.parse(string) - JavaScript built-in, parses JSON string to JavaScript object
  //     - || "[]" - Fallback to empty array string if getItem returns null
  //   - [...existingEntries, entry] - Spread operator
  //     - Spreads existingEntries array, adds new entry at end
  //     - Creates new array (doesn't mutate existingEntries)
  //   - router.push("/journal") - Next.js router navigation
  //     - router: useRouter() hook from "next/navigation" (imported at top)
  //     - push(path): Navigates to new route (client-side navigation)
  // REFERENCES:
  //   - trim(): JavaScript String.prototype.trim() - MDN Web Docs
  //   - Date.now(): JavaScript Date.now() - MDN Web Docs
  //   - toISOString(): JavaScript Date.prototype.toISOString() - MDN Web Docs
  //   - Array.from(): JavaScript Array.from() - MDN Web Docs
  //   - localStorage: Web Storage API - MDN Web Docs
  //   - JSON.parse(): JavaScript JSON.parse() - MDN Web Docs
  //   - Spread operator: JavaScript spread syntax (...) - MDN Web Docs
  //   - router.push(): Next.js useRouter hook - Next.js Documentation
  // APPROACH: Simple flag-based approach - draft flag controls behavior.
  //           This is conventional - many apps use draft flags.
  // CONNECTION: Drafts are excluded from extraction in new entry page (#4).
  //             When draft is saved as regular entry, extraction runs (#8 in edit page).
  const handleSaveDraft = () => {
    if (!content.trim()) {
      alert("Please add some content before saving as draft.");
      return;
    }

    // Prevent duplicate saves
    if (isSaving) {
      return;
    }

    setIsSaving(true);

    // Re-enable button after 5 seconds
    setTimeout(() => {
      setIsSaving(false);
    }, 5000);

    const entryTitle = title.trim() || formatDateAsTitle(new Date()); // Use date if title empty

    const entry = {
      id: Date.now().toString(), // Timestamp as string ID
      title: entryTitle,
      content: content, // Rich text HTML content from editor
      mood: mood, // Selected mood or null
      tags: tags, // Array of tag strings
      cardColor: cardColor, // Card color selection
      journalId: selectedJournalId || getActiveJournalId(), // Use selected journal or fallback to active
      createdAt: new Date().toISOString(), // ISO 8601 timestamp string
      updatedAt: new Date().toISOString(), // Same as createdAt for new entries
      draft: true, // Mark as draft
      promptIds: Array.from(insertedPromptIds), // Convert Set to Array for storage
    };

    // OPTIMIZATION: Use cache instead of localStorage
    addEntry(entry);

    // Don't mark prompts as used for drafts - they'll be marked when draft is saved properly
    // Don't run extraction - drafts don't contribute to prompt generation

    // Navigate back to journal page (Next.js client-side navigation)
    router.push("/journal");
  };

  // #8: Save Entry - Runs Extraction, Marks Prompts as Used
  // WHY: Regular saved entries should run extraction to contribute to future prompt generation.
  //      Prompts used in the entry should be marked as used so they don't appear again.
  // HOW: Set draft: false, call markPromptAsUsed() for inserted prompts.
  //      Note: Extraction happens automatically when creating new entries (extracts from all recent entries).
  // APPROACH: Simple - just mark prompts as used. Extraction happens on-demand when generating prompts.
  //           This is conventional - extraction on read, not on write.
  // CONNECTION: Works with filterUsedPrompts() to hide used prompts in future entries.
  const handleSave = async () => {
    if (!content.trim()) {
      alert("Please add some content before saving.");
      return;
    }

    // Prevent duplicate saves
    if (isSaving) {
      return;
    }

    setIsSaving(true);

    // Re-enable button after 5 seconds
    setTimeout(() => {
      setIsSaving(false);
    }, 5000);

    const entryTitle = title.trim() || formatDateAsTitle(new Date());
    const entryId = Date.now().toString();

    // OPTIMIZATION: Save entry immediately, extract metadata in background
    // This gives instant feedback to the user
    const entry = {
      id: entryId,
      title: entryTitle,
      content: content,
      mood: mood,
      tags: tags,
      cardColor: cardColor, // Card color selection
      journalId: selectedJournalId || getActiveJournalId(), // Use selected journal or fallback to active
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      draft: false, // Not a draft
      promptIds: Array.from(insertedPromptIds), // Store prompt IDs with entry
      // Metadata will be added in background
      extractedPeople: [],
      extractedTopics: [],
    };

    console.log("💾 [Save Entry] Saving entry immediately:", {
      title: entry.title,
      contentLength: content.length,
      draft: entry.draft,
    });

    // OPTIMIZATION: Save immediately for instant feedback
    addEntry(entry);

    // Extract metadata in background and update entry
    extractMetadata(content).then((cachedMetadata) => {
      console.log("✅ [Optimization] Extracted metadata in background:", cachedMetadata);
      updateEntry(entryId, {
        extractedPeople: cachedMetadata?.people || [],
        extractedTopics: cachedMetadata?.topics || [],
      });
    }).catch((error) => {
      console.error("Error extracting metadata in background:", error);
      // Non-critical, entry is already saved
    });

    // MICHAEL'S CODE: Mark inserted prompts as permanently used
    // This prevents them from appearing again in future prompt suggestions
    if (insertedPromptIds.size > 0) {
      console.log("Marking prompts as used:", Array.from(insertedPromptIds));
      insertedPromptIds.forEach((promptId) => {
        markPromptAsUsed(promptId);
      });
    }

    // Award XP for entry
    const wordCount = content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().split(/\s+/).filter((w: string) => w.length > 0).length;

    // OPTIMIZATION: Calculate streak more efficiently - only check last 60 entries (max streak is 60 days)
    const allEntries = getEntries().filter((e: any) => !e.draft);
    const sortedEntries = allEntries
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 60); // Only check last 60 entries for streak calculation

    let journalStreak = 0;
    if (sortedEntries.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const lastEntry = new Date(sortedEntries[0].createdAt);
      lastEntry.setHours(0, 0, 0, 0);
      const daysSinceLastEntry = Math.floor((today.getTime() - lastEntry.getTime()) / (1000 * 60 * 60 * 24));

      if (daysSinceLastEntry <= 1) {
        let streakDate = new Date(lastEntry);
        for (let i = 0; i < sortedEntries.length; i++) {
          const entryDate = new Date(sortedEntries[i].createdAt);
          entryDate.setHours(0, 0, 0, 0);
          const diff = Math.floor((streakDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
          if (diff === 0) {
            journalStreak++;
          } else if (diff === 1) {
            journalStreak++;
            streakDate = entryDate;
          } else {
            break;
          }
        }
      }
    }

    const xpResult = awardEntryXP(wordCount, journalStreak);
    console.log("🎉 XP Awarded:", xpResult);

    // Show XP notification
    setXpEarned(xpResult.xp);
    setLeveledUp(xpResult.leveledUp);
    setOldLevel(xpResult.oldLevel);
    setNewLevel(xpResult.newLevel);
    setShowXPNotification(true);

    // Dispatch event for XP bar to update
    window.dispatchEvent(new Event("xp-updated"));

    // Navigate back to journal page after a short delay (let notification show)
    setTimeout(() => {
      router.push("/journal");
    }, xpResult.leveledUp ? 4500 : 3500);
  };

  // Function to navigate back to journal page
  // SIMPLIFIED: Unmark temporarily used prompts if user exits without saving
  const handleBack = () => {
    // Clear temporarily inserted prompts - they weren't saved, so they should be available again
    setInsertedPromptIds(new Set());
    router.push("/journal");
  };

  // Listen for ESC key press
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if ESC key is pressed
      if (event.key === "Escape") {
        //calls exit/back button function
        handleBack();
      }
    };

    // Add event listener when component mounts
    window.addEventListener("keydown", handleKeyDown);

    // Clean up: remove event listener when component unmounts
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [router]); // Include router in dependency array

  return (
    <DashboardLayout>
      {/* Header Section with Title and Back Button */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">New Entry</h1>
        <div className="flex items-center gap-2">
          {/* Back/Exit Button */}
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Journal
          </button>
          <button
            onClick={handleSaveDraft}
            disabled={isSaving}
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            {isSaving ? "Saving..." : "Save as Draft"}
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            {isSaving ? "Saving..." : "Save Entry"}
          </button>
        </div>
      </div>

      {/* Two Column Layout: 2/3 left, 1/3 right */}
      <div className="flex gap-6">
        {/* Left Column (2/3) - Writing Section */}
        <div className="flex-[2] space-y-6 text-gray-900">
          {/* ============================================================================ */}
          {/* SIMPLIFIED: Clickable Name Prompts */}
          {/* ============================================================================ */}
          {availablePrompts.length > 0 && (
            <PromptSuggestions
              prompts={availablePrompts}
              editorRef={editorRef}
              onPromptInserted={handlePromptInserted}
            />
          )}

          <div className="flex items-start gap-4">
            {/* Title - 2/3 width */}
            <div className="flex-[2]">
              <div className="mb-2">
                <h2 className="text-lg font-bold text-gray-900">Title</h2>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
                  placeholder="Enter a title for your journal entry..."
                />
              </div>
            </div>

            {/* Journal Selector - 1/3 width */}
            {journals.length > 0 && (
              <div className="flex-1">
                <div className="mb-2">
                  <h2 className="text-lg font-bold text-gray-900">Journal</h2>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedJournalId}
                    onChange={(e) => setSelectedJournalId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    style={{ backgroundColor: "var(--background, #ffffff)" }}
                  >
                    {journals.map((journal) => (
                      <option key={journal.id} value={journal.id}>
                        {journal.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Entry Content */}
          <div className="">
            <div className="mb-2">
              <h2 className="text-lg font-bold text-gray-900">Entry Content</h2>
            </div>
            {/* MODIFIED: Added ref={editorRef} - NECESSARY for NLP prompt integration */}
            {/* Original teammate code: No ref prop */}
            <RichTextEditor
              ref={editorRef}
              value={content}
              onChange={(newContent: string) => setContent(newContent)}
              placeholder="Start writing your journal entry..."
            />
          </div>
        </div>

        {/* Right Column (1/3) - Settings and Suggestions */}
        <div className="flex-1 space-y-6 text-gray-900">
          {/* ============================================================================ */}
          {/* SIMPLIFIED: Non-Clickable Topic Suggestions */}
          {/* ============================================================================ */}
          {topicSuggestions.length > 0 && (
            <TopicSuggestions suggestions={topicSuggestions} />
          )}

          {/* Card Color Selector */}
          <div>
            <div className="mb-2">
              <h2 className="text-lg font-bold text-gray-900">Card Color</h2>
              <p className="text-sm text-gray-600">Choose a color for your journal card (optional)</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {cardColorOptions.map((colorOption) => (
                <button
                  key={colorOption.id}
                  onClick={() => setCardColor(colorOption.id)}
                  className={`px-4 py-3 rounded-lg border-2 transition-all ${colorOption.bgClass
                    } ${colorOption.borderClass
                    } ${cardColor === colorOption.id
                      ? "ring-2 ring-blue-500 ring-offset-2 scale-105"
                      : "hover:scale-105"
                    }`}
                >
                  <div className="text-sm font-medium text-gray-700">{colorOption.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Mood */}
          <div>
            <div className="mb-2">
              <h2 className="text-lg font-bold text-gray-900">Mood</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {moodOptions.map((moodOption) => (
                <button
                  key={moodOption.id}
                  onClick={() => setMood(mood === moodOption.id ? null : moodOption.id)}
                  className={`flex flex-col items-center justify-center w-16 h-16 rounded-lg border-2 transition-all hover:scale-105 ${mood === moodOption.id
                    ? "border-blue-500 bg-blue-50 shadow-md"
                    : "border-gray-300 hover:border-gray-400"
                    }`}
                  style={mood !== moodOption.id ? { backgroundColor: "var(--background, #ffffff)" } : undefined}
                  title={moodOption.label}
                >
                  <span className="text-2xl">{moodOption.emoji}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <div className="mb-2">
              <h2 className="text-lg font-bold text-gray-900">Tags</h2>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map((tag, index) => (
                <span
                  key={tag}
                  className={`px-3 py-1 rounded-full text-sm font-medium border ${getTagColor(
                    index
                  )} flex items-center gap-2`}
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:bg-red-100 hover:text-red-700 rounded-full p-0.5 transition-colors text-gray-600 font-bold"
                    aria-label={`Remove ${tag} tag`}
                    title={`Remove ${tag} tag`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleTagInputKeyPress}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
                placeholder="Add a tag and press Enter..."
              />
              <button
                onClick={handleAddTag}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                Add Tag
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================================ */}
      {/* MICHAEL'S CODE - NLP Results Display (Temporary for testing) */}
      {/* ============================================================================ */}
      {/* extractedData && (
        <div className="mb-6">
          <NLPResultsDisplay
            people={extractedData.people}
            topics={extractedData.topics}
            dates={extractedData.dates}
          />
        </div>
      ) */}

      {/* XP Notification */}
      <XPNotification
        xp={xpEarned}
        show={showXPNotification}
        onComplete={() => setShowXPNotification(false)}
        leveledUp={leveledUp}
        oldLevel={oldLevel}
        newLevel={newLevel}
      />
    </DashboardLayout>
  );
}
