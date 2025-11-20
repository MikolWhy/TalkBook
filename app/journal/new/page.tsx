// new journal entry page - create entry form
// includes rich text editor, mood selector, weather, prompts, and save functionality
//
// WHAT WE'RE CREATING:
// - The main page where users create new journal entries
// - Rich text editor for writing (with formatting toolbar)
// - Mood selector (1-5 emoji scale)
// - Weather display/input (auto-fill if enabled)
// - AI prompts automatically inserted as headers when page loads
// - Save button that saves entry and extracts entities
//
// OWNERSHIP:
// - Aadil creates page structure (editor, mood, weather, save)
// - Michael adds auto-insert prompt logic (on separate branch or after Aadil creates page)
//
// COORDINATION NOTES:
// - Aadil creates page first with editor, mood, weather, save button
// - Aadil leaves marker: `{/* MICHAEL: Add prompt auto-insert here */}`
// - Michael adds useEffect to auto-insert prompts on page load
// - Michael uses editorRef.current?.insertPromptAsHeading() method
//
// CONTEXT FOR AI ASSISTANTS:
// - This is the main journal entry creation interface
// - Users write entries using the rich text editor
// - AI prompts are displayed and can be inserted as headings
// - Mood and weather are captured for each entry
// - Entry is saved to database with extracted entities (for prompt generation)
//
// DEVELOPMENT NOTES:
// - Use RichTextEditor component for text input
// - Auto-insert AI prompts (from prompts.ts) as headers when page loads
// - Prompts automatically appear as <h3> headers in editor (no clicking needed)
// - User can delete any header they don't want
// - User writes under each header
// - Auto-fill weather if enabled in settings
// - Save entry with mood, weather, and rich text content
// - Extract entities (people, topics, sentiment) after saving
// - Mark prompts as "used" if written about
//
// TODO: implement entry creation form
//
// FUNCTIONALITY:
// - Rich text editor for entry body
// - Mood selector (1-5 emoji scale, left to right = 5 to 1)
// - Weather display/input (auto-fill if enabled)
// - AI prompts auto-inserted as headers when page loads (no clicking needed)
// - Save entry to database
// - Extract and save entities after saving
// - Mark prompts as used
// - Navigate to journal list after save
//
// UI:
// - Form layout with editor, mood selector, weather
// - Prompts automatically inserted as headers in editor when page loads (no buttons needed)
// - Save button
// - Loading state during save
//
// SYNTAX:
// "use client";
// import { useState, useRef, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import RichTextEditor, { RichTextEditorRef } from "@/components/RichTextEditor";
// import PromptCard from "@/components/PromptCard";
// import { createEntry } from "@/lib/db/repo";
// import { extractMetadata } from "@/lib/nlp/extract";
// import { generatePrompts } from "@/lib/nlp/prompts";
//
// export default function NewEntryPage() {
//   // implementation
// }

"use client";

//listening for keyboard events - eg: esc key
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "../../components/DashboardLayout";
//to use richTextEditor component
// MODIFIED: Added RichTextEditorRef type import - NECESSARY for NLP prompt integration
// Original teammate code: import RichTextEditor from "../../../src/components/RichTextEditor";
import RichTextEditor, { RichTextEditorRef } from "../../../src/components/RichTextEditor";
// NLP components and functions (MICHAEL's code - added for prompt system)
import NLPResultsDisplay from "../../../src/components/NLPResultsDisplay";
import PromptSuggestions from "../../../src/components/PromptSuggestions";
import { extractMetadata } from "../../../src/lib/nlp/extract";
import { generatePrompts, filterUsedPrompts, filterExpiredPrompts, clearUsedPrompts, Prompt, getUsedPromptsCount, markPromptAsUsed } from "../../../src/lib/nlp/prompts";

// TODO: implement entry creation form

export default function NewEntryPage() {
  const router = useRouter(); // Hook to navigate programmatically
  
  // MODIFIED: Added editorRef - NECESSARY for NLP prompt integration (PromptSuggestions needs it)
  // Original teammate code: No editorRef
  const editorRef = useRef<RichTextEditorRef>(null);

  // ============================================================================
  // TEAMMATE'S CODE (AADIL) - Entry Form State - KEPT EXACTLY AS IS
  // ============================================================================
  const [title, setTitle] = useState(""); // State to store entry title
  const [content, setContent] = useState(""); // State to store editor content
  const [mood, setMood] = useState<string | null>(null); // State to store selected mood
  const [tags, setTags] = useState<string[]>([]); // State to store tags
  const [tagInput, setTagInput] = useState(""); // State for tag input field

  // ============================================================================
  // MICHAEL'S CODE - NLP Prompt System State
  // ============================================================================
  const [extractedData, setExtractedData] = useState<{
    people: string[];
    topics: string[];
    dates: Date[];
    sentiment: number;
  } | null>(null);
  
  // State for prompts
  const [allPrompts, setAllPrompts] = useState<Prompt[]>([]); // All available prompts
  const [insertedPromptIds, setInsertedPromptIds] = useState<Set<string>>(new Set()); // Prompts currently in editor
  
  // Filter prompts: show only those NOT currently inserted in editor
  const availablePrompts = allPrompts.filter(p => !insertedPromptIds.has(p.id));

  //  Dummy text for NLP testing - now using actual entries
  // const dummyText = "Had a great meeting with Zayn today about our group project, I am feeling lazy though and have been procrastinating some of my parts of the project. Not feeling great about it.";

  // Extract metadata and generate prompts when component loads
  useEffect(() => {
    const runExtractionAndPrompts = async () => {
      try {
        // Get actual entries from localStorage (last 7 days)
        const storedEntries = JSON.parse(
          localStorage.getItem("journalEntries") || "[]"
        );
        
        // Filter entries from last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        // #4: Filter Recent Entries and Exclude Drafts from Extraction
        // WHY: User requested that extraction only run on saved entries, not drafts.
        //      Drafts shouldn't contribute to prompt generation until they're saved as regular entries.
        // HOW: Filter by date (last 7 days) AND exclude drafts (entry.draft !== true).
        //      Only regular saved entries are included in extraction.
        // SYNTAX BREAKDOWN:
        //   - storedEntries.filter((entry: any) => { ... })
        //     - Array.filter() - JavaScript Array method, creates new array with filtered elements
        //     - Arrow function: (entry: any) => { ... } - callback function for each element
        //     - TypeScript: (entry: any) - any type allows any object structure
        //   - new Date(entry.createdAt) - Creates Date object from ISO string
        //     - entry.createdAt: ISO 8601 string (e.g., "2025-11-20T12:34:56.789Z")
        //   - entryDate >= sevenDaysAgo - Date comparison
        //     - >= operator: greater than or equal to (works with Date objects)
        //     - sevenDaysAgo: Date object calculated earlier (7 days before now)
        //   - entry.draft !== true - Strict inequality check
        //     - !== : strict not equal (checks both value and type)
        //     - true: boolean literal
        //     - This excludes entries where draft is true, includes undefined/null/false
        //   - return isRecent && isNotDraft - Logical AND
        //     - && operator: returns first falsy value or last truthy value
        //     - Both conditions must be true for entry to be included
        // REFERENCES:
        //   - Array.filter(): JavaScript Array.prototype.filter() - MDN Web Docs
        //   - Date comparison: JavaScript Date objects can be compared with >=, <=, etc.
        //   - Strict inequality: JavaScript !== operator - MDN Web Docs
        //   - Logical AND: JavaScript && operator - MDN Web Docs
        // APPROACH: Simple filter - check both date and draft status. Not over-engineered.
        // CONNECTION: This ensures drafts don't pollute prompt generation until they're finalized.
        //             Works with #7/#11 (draft saving) and #12 (extraction on draft conversion).
        const recentEntries = storedEntries.filter((entry: any) => {
          const entryDate = new Date(entry.createdAt); // Convert ISO string to Date object
          const isRecent = entryDate >= sevenDaysAgo; // Check if within last 7 days
          const isNotDraft = entry.draft !== true; // Exclude drafts - only include saved entries
          return isRecent && isNotDraft; // Both conditions must be true
        });
        
        // Combine content from recent SAVED entries for extraction
        // EXCLUDE drafts - drafts don't contribute to prompt generation until they're saved as regular entries
        const combinedText = recentEntries
          .map((entry: any) => entry.content || "")
          .filter((content: string) => content.trim().length > 0) // Only include entries with actual content
          .join(" ");
        
        // If no entries, use empty result (will show default prompts)
        let result;
        let originalText;
        
        if (combinedText.trim().length > 0) {
          // Extract metadata from actual entries
          result = await extractMetadata(combinedText);
          originalText = combinedText;
          
          // Debug: log extracted entities
          if (process.env.NODE_ENV === "development") {
            console.log("📊 Extracted entities:", {
              people: result.people,
              topics: result.topics,
              dates: result.dates.length,
              sentiment: result.sentiment,
            });
          }
        } else {
          // No entries yet - return null to trigger default prompts
          result = null;
          originalText = undefined;
        }
        
        setExtractedData(result);
        
        // #5: Generate More Prompts Initially to Ensure Variety After Filtering
        // WHY: After filtering out used prompts, we might end up with very few prompts.
        //      By generating 10 initially (instead of 5), we have a larger pool to filter from,
        //      ensuring we still have good variety even after removing used ones.
        // HOW: Call generatePrompts with count=10, then filter and limit to 5 for display.
        // APPROACH: Generate more than needed, filter, then limit - ensures variety.
        //           This is a simple strategy - not over-engineered.
        // CONNECTION: Works with filterUsedPrompts() and filterExpiredPrompts() to show best prompts.
        // Generate prompts based on extracted data (or null for defaults)
        // Increase count to ensure we get a good mix after filtering
        const generatedPrompts = await generatePrompts(result, "cozy", 10, originalText);
        
        // Debug: log generated prompts before filtering
        if (process.env.NODE_ENV === "development" && generatedPrompts.length > 0) {
          console.log("💡 Generated prompts (before filtering):", generatedPrompts.map(p => p.text));
        }
        
        // Check if these are default prompts (no extracted data)
        const areDefaults = !result;
        
        // Filter out prompts that were permanently used (from localStorage)
        // BUT: Don't filter defaults - they're always available as fallbacks
        const unusedPrompts = areDefaults 
          ? generatedPrompts // Defaults: don't filter by usage
          : filterUsedPrompts(generatedPrompts); // Extracted: filter used ones
        
        // Debug: log filtering results
        if (process.env.NODE_ENV === "development" && !areDefaults) {
          console.log("🔍 Prompt filtering:", {
            generated: generatedPrompts.length,
            unused: unusedPrompts.length,
            filteredOut: generatedPrompts.length - unusedPrompts.length,
          });
        }
        
        // Filter out expired prompts (default: 7 days)
        // TODO: Get expiryDays from settings store when available
        const expiryDays = 7; // Default, will be configurable in settings
        const validPrompts = filterExpiredPrompts(unusedPrompts, expiryDays);
        
        // If all extracted prompts were filtered out (all used), fall back to default prompts
        // Default prompts are always shown (not filtered by usage) since they're generic fallbacks
        let finalPrompts = validPrompts;
        if (validPrompts.length === 0 && result) {
          // Had extracted data but all prompts were used - get defaults (don't filter them)
          const defaultPromptsRaw = await generatePrompts(null, "cozy", 5);
          finalPrompts = defaultPromptsRaw; // Defaults are always available
        }
        
        // Debug: log final prompts
        if (process.env.NODE_ENV === "development") {
          console.log("✅ Final prompts:", finalPrompts.map(p => p.text));
          const usedCount = getUsedPromptsCount();
          if (usedCount > 0) {
            console.log(`ℹ️ ${usedCount} prompt(s) are marked as used and filtered out. To reset for testing, run: clearUsedPrompts()`);
          }
        }
        
        setAllPrompts(finalPrompts);
      } catch (error) {
        console.error("Error extracting metadata or generating prompts:", error);
      }
    };
    
    runExtractionAndPrompts();
  }, []); // Empty dependency array = run once on mount

  // Handle prompt being inserted into editor
  const handlePromptInserted = (promptId: string) => {
    // Add to inserted set (removes from available list)
    setInsertedPromptIds((prev) => {
      const newSet = new Set(prev);
      newSet.add(promptId);
      return newSet;
    });
  };

  // Monitor editor content to detect when prompts are removed
  useEffect(() => {
    if (!content || insertedPromptIds.size === 0) return;

    // Check which inserted prompts are still in the editor content
    const stillInEditor = new Set<string>();
    
    insertedPromptIds.forEach((promptId) => {
      const prompt = allPrompts.find(p => p.id === promptId);
      if (prompt) {
        // Check if prompt text (or similar) is still in content
        // Look for the prompt text as a heading (h3)
        const promptText = prompt.text;
        // Check if it exists as a heading in the HTML
        const headingPattern = new RegExp(`<h3[^>]*>.*?${promptText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}.*?</h3>`, "i");
        if (headingPattern.test(content)) {
          stillInEditor.add(promptId);
        }
      }
    });

    // If a prompt was removed from editor, remove it from inserted set
    // This makes it available again in the prompt list
    const removed = Array.from(insertedPromptIds).filter(id => !stillInEditor.has(id));
    if (removed.length > 0) {
      setInsertedPromptIds((prev) => {
        const newSet = new Set(prev);
        removed.forEach(id => newSet.delete(id));
        return newSet;
      });
    }
  }, [content, insertedPromptIds, allPrompts]);

  // TODO: When entry is saved (Aadil implements save functionality):
  // 1. Extract metadata from current entry content: extractMetadata(content)
  // 2. Save entry to database: createEntry({ content, mood, weather, date, ... })
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
    const entryTitle = title.trim() || formatDateAsTitle(new Date()); // Use date if title empty
    
    const entry = {
      id: Date.now().toString(), // Timestamp as string ID
      title: entryTitle,
      content: content, // Rich text HTML content from editor
      mood: mood, // Selected mood or null
      tags: tags, // Array of tag strings
      createdAt: new Date().toISOString(), // ISO 8601 timestamp string
      updatedAt: new Date().toISOString(), // Same as createdAt for new entries
      draft: true, // Mark as draft
      promptIds: Array.from(insertedPromptIds), // Convert Set to Array for storage
    };

    // Get existing entries from localStorage
    const existingEntries = JSON.parse(
      localStorage.getItem("journalEntries") || "[]" // Fallback to empty array if null
    );

    // Add new entry (spread operator creates new array)
    const updatedEntries = [...existingEntries, entry];

    // Save to localStorage (must be string, so JSON.stringify converts object to JSON)
    localStorage.setItem("journalEntries", JSON.stringify(updatedEntries));

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
  const handleSave = () => {
    if (!content.trim()) {
      alert("Please add some content before saving.");
      return;
    }

    const entryTitle = title.trim() || formatDateAsTitle(new Date());

    const entry = {
      id: Date.now().toString(),
      title: entryTitle,
      content: content,
      mood: mood,
      tags: tags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      draft: false, // Not a draft
      promptIds: Array.from(insertedPromptIds), // Store prompt IDs with entry
    };

    // Get existing entries from localStorage
    const existingEntries = JSON.parse(
      localStorage.getItem("journalEntries") || "[]"
    );

    // Add new entry
    const updatedEntries = [...existingEntries, entry];

    // Save to localStorage
    localStorage.setItem("journalEntries", JSON.stringify(updatedEntries));

    // MICHAEL'S CODE: Mark inserted prompts as permanently used
    // This prevents them from appearing again in future prompt suggestions
    if (insertedPromptIds.size > 0) {
      console.log("Marking prompts as used:", Array.from(insertedPromptIds));
      insertedPromptIds.forEach((promptId) => {
        markPromptAsUsed(promptId);
      });
      console.log("Used prompts after marking:", getUsedPromptsCount());
    }

    // Navigate back to journal page
    router.push("/journal");
  };

  // Function to navigate back to journal page
  const handleBack = () => {
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

        {/* Back/Exit Button */}
        <button
          onClick={handleBack}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
        >
          ← Back to Journal
        </button>
      </div>
      
      {/* ============================================================================ */}
      {/* MICHAEL'S CODE - Prompt Suggestions Component */}
      {/* ============================================================================ */}
      {availablePrompts.length > 0 && (
        <PromptSuggestions
          prompts={availablePrompts}
          editorRef={editorRef}
          onPromptInserted={handlePromptInserted}
        />
      )}
      
      {/* Debug: Show used prompts count and reset button (for testing) */}
      {process.env.NODE_ENV === "development" && getUsedPromptsCount() > 0 && (
        <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800 mb-2">
            ℹ️ <strong>Testing Mode:</strong> {getUsedPromptsCount()} prompt(s) marked as used and hidden.
          </p>
          <button
            onClick={() => {
              clearUsedPrompts();
              // Reload prompts from actual entries
              const runExtractionAndPrompts = async () => {
                try {
                  const storedEntries = JSON.parse(
                    localStorage.getItem("journalEntries") || "[]"
                  );
                  
                  const sevenDaysAgo = new Date();
                  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                  
                  const recentEntries = storedEntries.filter((entry: any) => {
                    const entryDate = new Date(entry.createdAt);
                    return entryDate >= sevenDaysAgo;
                  });
                  
                  const combinedText = recentEntries
                    .map((entry: any) => entry.content || "")
                    .join(" ");
                  
                  let result;
                  let originalText;
                  
                  if (combinedText.trim().length > 0) {
                    result = await extractMetadata(combinedText);
                    originalText = combinedText;
                  } else {
                    result = null;
                    originalText = undefined;
                  }
                  
                  const generatedPrompts = await generatePrompts(result, "cozy", 5, originalText);
                  setAllPrompts(generatedPrompts);
                  setInsertedPromptIds(new Set());
                } catch (error) {
                  console.error("Error:", error);
                }
              };
              runExtractionAndPrompts();
            }}
            className="px-3 py-1.5 bg-yellow-200 text-yellow-900 rounded text-xs font-medium hover:bg-yellow-300 transition-colors"
          >
            Reset Used Prompts (Testing Only)
          </button>
        </div>
      )}

      {/* ============================================================================ */}
      {/* TEAMMATE'S CODE (AADIL) - Entry Form - KEPT EXACTLY AS IS */}
      {/* ============================================================================ */}
      <div className="space-y-6 text-gray-900">
        <div>
          <div className="mb-2">
            <h2 className="text-lg font-bold text-gray-900">Title</h2>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="Enter a title for your journal entry..."
            />
          </div>
        </div>
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
        <div>
          <div className="mb-2">
            <h2 className="text-lg font-bold text-gray-900">Mood</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {moodOptions.map((moodOption) => (
              <button
                key={moodOption.id}
                onClick={() => setMood(mood === moodOption.id ? null : moodOption.id)}
                className={`flex flex-col items-center justify-center w-16 h-16 rounded-lg border-2 transition-all hover:scale-105 ${
                  mood === moodOption.id
                    ? "border-blue-500 bg-blue-50 shadow-md"
                    : "border-gray-300 bg-white hover:border-gray-400"
                }`}
                title={moodOption.label}
              >
                <span className="text-2xl">{moodOption.emoji}</span>
              </button>
            ))}
          </div>
        </div>
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
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
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
        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={handleBack}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveDraft}
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
          >
            Save as Draft
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            Save Entry
          </button>
        </div>
      </div>

      {/* ============================================================================ */}
      {/* MICHAEL'S CODE - NLP Results Display (Temporary for testing) */}
      {/* ============================================================================ */}
      {extractedData && (
        <div className="mb-6">
          <NLPResultsDisplay
            people={extractedData.people}
            topics={extractedData.topics}
            dates={extractedData.dates}
            sentiment={extractedData.sentiment}
          />
        </div>
      )}
    </DashboardLayout>
  );
}
