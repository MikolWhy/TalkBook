// edit journal entry page - update existing entry
// similar to new page but pre-fills with existing entry data
//
// WHAT WE'RE CREATING:
// - A page for editing existing journal entries
// - Pre-fills form with existing entry data (content, mood, tags)
// - Same interface as new entry page but with update/delete actions
// - Handles entry not found (404 error)
// - Includes NLP prompt system for editing

"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "../../components/DashboardLayout";
import RichTextEditor, { RichTextEditorRef } from "../../../src/components/RichTextEditor";
import PromptSuggestions from "../../../src/components/PromptSuggestions";
import { extractMetadata } from "../../../src/lib/nlp/extract";
import { generatePrompts, filterUsedPrompts, filterExpiredPrompts, Prompt, markPromptAsUsed } from "../../../src/lib/nlp/prompts";
import { getEntries, getEntryById, updateEntry, saveEntries } from "../../../src/lib/cache/entriesCache";

// Mood options (same as new entry page)
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

// Tag colors (same as new entry page)
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

// Helper function to format date as a title if title is empty
const formatDateAsTitle = (date: Date): string => {
  const day = date.getDate();
  const daySuffix = 
    day === 1 || day === 21 || day === 31 ? "st" :
    day === 2 || day === 22 ? "nd" :
    day === 3 || day === 23 ? "rd" : "th";
  
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).replace(/\d+/, `${day}${daySuffix}`);
};

export default function EditEntryPage() {
  const params = useParams();
  const router = useRouter();
  const entryId = params.id as string;
  const editorRef = useRef<RichTextEditorRef>(null);

  // Entry form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [cardColor, setCardColor] = useState<string>("default");
  const [loading, setLoading] = useState(true);
  const [entryNotFound, setEntryNotFound] = useState(false);
  const [isDraft, setIsDraft] = useState(false); // Track if entry is a draft

  // NLP Prompt System State
  const [allPrompts, setAllPrompts] = useState<Prompt[]>([]);
  const [insertedPromptIds, setInsertedPromptIds] = useState<Set<string>>(new Set());
  const [originalPromptIds, setOriginalPromptIds] = useState<string[]>([]); // Prompts that were in entry when loaded

  // Filter prompts: show only those NOT currently inserted in editor
  const availablePrompts = allPrompts.filter(p => !insertedPromptIds.has(p.id));

  // #9: Load Entry Data and Pre-fill Form
  // WHY: Edit page needs to load existing entry data to pre-fill the form.
  //      Also need to track draft status and original prompt IDs for proper handling.
  // HOW: Load from localStorage, find entry by ID, pre-fill all form fields.
  //      Set isDraft flag and track original prompt IDs separately from current inserted ones.
  // SYNTAX BREAKDOWN:
  //   - useEffect(() => { ... }, [entryId])
  //     - React hook: useEffect(callback, dependencies)
  //     - Runs callback when component mounts OR when dependencies change
  //     - [entryId]: dependency array - effect runs when entryId changes
  //     - Empty dependency array [] would run only on mount
  //   - const loadEntry = () => { ... }
  //     - Arrow function defined inside useEffect (local scope)
  //     - Called immediately after definition
  //   - try { ... } catch (error) { ... }
  //     - JavaScript try-catch block for error handling
  //     - If error occurs in try block, catch block executes
  //   - storedEntries.find((e: any) => e.id === entryId)
  //     - Array.find() - JavaScript Array method, returns first element matching condition
  //     - Arrow function: (e: any) => e.id === entryId
  //     - === : strict equality (checks value and type)
  //     - Returns entry object or undefined if not found
  //   - if (!entry) { ... return; }
  //     - !entry: logical NOT operator (true if entry is falsy: null, undefined, false, 0, "")
  //     - Early return pattern - exits function early if condition met
  //   - setTitle(entry.title || "")
  //     - React state setter function (from useState hook)
  //     - || "" : fallback to empty string if entry.title is falsy
  //   - new Set(entry.promptIds || [])
  //     - Set constructor: JavaScript Set object (prevents duplicate values)
  //     - || [] : fallback to empty array if entry.promptIds is falsy
  //     - Converts array to Set for efficient lookup (O(1) vs O(n))
  // REFERENCES:
  //   - useEffect: React useEffect Hook - React Documentation
  //   - Array.find(): JavaScript Array.prototype.find() - MDN Web Docs
  //   - Set: JavaScript Set object - MDN Web Docs
  //   - useState: React useState Hook - React Documentation
  //   - localStorage: Web Storage API - MDN Web Docs
  // APPROACH: Standard React pattern - useEffect on mount to load data.
  //           Simple and conventional - not over-engineered.
  // CONNECTION: Draft status used to show/hide "Save as Draft" button (#11).
  //             Original prompt IDs tracked separately to show info about original prompts.
  useEffect(() => {
    const loadEntry = () => {
      try {
        // OPTIMIZATION: Use cached entry
        const entry = getEntryById(entryId as string);

        if (!entry) {
          setEntryNotFound(true); // Set error state
          setLoading(false); // Stop loading
          return; // Exit early
        }

        // Pre-fill form with existing entry data
        setTitle(entry.title || ""); // Use empty string if title missing
        setContent(entry.content || ""); // Use empty string if content missing
        setMood(entry.mood || null); // Use null if mood missing
        setTags(entry.tags || []); // Use empty array if tags missing
        setCardColor(entry.cardColor || "default"); // Load card color or use default
        setIsDraft(entry.draft === true); // Load draft status (strict check)
        setOriginalPromptIds(entry.promptIds || []); // Store original prompt IDs
        setInsertedPromptIds(new Set(entry.promptIds || [])); // Convert array to Set

        setLoading(false); // Mark as loaded
      } catch (error) {
        console.error("Error loading entry:", error); // Log error to console
        setEntryNotFound(true); // Set error state
        setLoading(false); // Stop loading
      }
    };

    loadEntry(); // Call immediately
  }, [entryId]); // Re-run if entryId changes

  // #10: Generate Prompts from Entry Content (One-Time on Load)
  // WHY: User requested prompts when editing, prioritized by keywords from that specific entry.
  //      This helps users continue writing about topics already in the entry.
  // HOW: Extract metadata from entry's content once when loaded, generate prompts from it.
  //      Filter out used/expired prompts, show defaults if none available.
  // APPROACH: Extract once on load, not live as user types - prevents extraction loops.
  //           This is simpler and more performant than live extraction.
  // CONNECTION: Uses same extraction/generation logic as new entry page, but extracts from single entry.
  //             Prompts shown here are suggestions, not automatically inserted.
  useEffect(() => {
    if (loading || !content) return;

    const generatePromptsForEntry = async () => {
      try {
        // Extract metadata from entry's current content (one-time extraction on load)
        const extractedData = await extractMetadata(content);

        // Generate prompts based on this entry's content
        // This prioritizes prompts with keywords matching this specific entry
        const generatedPrompts = await generatePrompts(extractedData, "cozy", 5, content);

        // Filter out used prompts
        const unusedPrompts = filterUsedPrompts(generatedPrompts);
        const expiryDays = 7;
        const validPrompts = filterExpiredPrompts(unusedPrompts, expiryDays);

        // If all prompts filtered out, show defaults
        let finalPrompts = validPrompts;
        if (validPrompts.length === 0 && extractedData) {
          const defaultPromptsRaw = await generatePrompts(null, "cozy", 5);
          finalPrompts = defaultPromptsRaw;
        }

        setAllPrompts(finalPrompts);
      } catch (error) {
        console.error("Error generating prompts for entry:", error);
      }
    };

    generatePromptsForEntry();
  }, [content, loading]); // Only runs when content is first loaded

  // Handle prompt being inserted into editor
  const handlePromptInserted = (promptId: string) => {
    setInsertedPromptIds((prev) => {
      const newSet = new Set(prev);
      newSet.add(promptId);
      return newSet;
    });
  };

  // Tag handlers
  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  // #11: Save as Draft (Edit Page) - No Extraction, Keeps Draft Status
  // WHY: When editing a draft, user should be able to save it as draft again.
  //      This allows saving progress without finalizing the entry.
  // HOW: Update entry with draft: true, don't run extraction, don't mark prompts as used.
  //      Default title to date if empty (same as new entry page).
  // APPROACH: Same logic as new entry page's handleSaveDraft - consistent behavior.
  //           Simple flag-based approach - not over-engineered.
  // CONNECTION: Works with #4 (drafts excluded from extraction) and #12 (extraction on save).
  const handleSaveDraft = () => {
    if (!content.trim()) {
      alert("Please add some content before saving as draft.");
      return;
    }

    try {
      const entryTitle = title.trim() || formatDateAsTitle(new Date());

      // OPTIMIZATION: Use cache update
      const success = updateEntry(entryId as string, {
        title: entryTitle,
        content: content,
        mood: mood,
        tags: tags,
        cardColor: cardColor,
        updatedAt: new Date().toISOString(),
        draft: true, // Keep as draft
        promptIds: Array.from(insertedPromptIds),
      });

      if (!success) {
        alert("Entry not found. It may have been deleted.");
        router.push("/journal");
        return;
      }

      // Don't mark prompts as used for drafts
      // Don't run extraction - drafts don't contribute to prompt generation

      router.push("/journal");
    } catch (error) {
      console.error("Error saving draft:", error);
      alert("Failed to save draft. Please try again.");
    }
  };

  // #12: Save Entry (Edit Page) - Extract Only If Converting Draft to Regular Entry
  // WHY: User requested extraction only run when draft is saved as regular entry (first time).
  //      If editing a regular entry, no need to extract again - it was already extracted.
  // HOW: Check if isDraft is true - only then call extractMetadata().
  //      Set draft: false, mark prompts as used, update entry.
  // APPROACH: Conditional extraction - only for draft conversion.
  //           This prevents unnecessary re-extraction of regular entries.
  //           Simple conditional - not over-engineered.
  // CONNECTION: Works with #4 (drafts excluded) - when draft becomes regular, it starts contributing.
  //             Extraction result is used next time new entry page loads (#4).
  const handleSave = async () => {
    if (!content.trim()) {
      alert("Please add some content before saving.");
      return;
    }

    try {
      const entryTitle = title.trim() || formatDateAsTitle(new Date());

      // OPTIMIZATION: Extract and cache metadata when saving
      // Always extract on save to update cache if content changed
      let cachedMetadata = null;
      try {
        cachedMetadata = await extractMetadata(content);
        console.log("✅ [Optimization] Updated cached metadata:", cachedMetadata);
      } catch (error) {
        console.error("Error extracting metadata:", error);
      }

      // OPTIMIZATION: Use cache update
      const success = updateEntry(entryId as string, {
        title: entryTitle,
        content: content,
        mood: mood,
        tags: tags,
        cardColor: cardColor,
        updatedAt: new Date().toISOString(),
        draft: false, // Remove draft status
        promptIds: Array.from(insertedPromptIds),
        extractedPeople: cachedMetadata?.people || [],
        extractedTopics: cachedMetadata?.topics || [],
        extractedDates: cachedMetadata?.dates || [],
      });

      if (!success) {
        alert("Entry not found. It may have been deleted.");
        router.push("/journal");
        return;
      }

      // Mark prompts as used (original prompts stay marked as used)
      // Note: insertedPromptIds contains prompts from original entry + any new ones
      if (insertedPromptIds.size > 0) {
        insertedPromptIds.forEach((promptId) => {
          markPromptAsUsed(promptId);
        });
      }

      router.push("/journal");
    } catch (error) {
      console.error("Error saving entry:", error);
      alert("Failed to save entry. Please try again.");
    }
  };

  // Delete function
  const handleDelete = () => {
    if (!confirm("Are you sure you want to delete this entry? This action cannot be undone.")) {
      return;
    }

    try {
      const storedEntries = JSON.parse(
        localStorage.getItem("journalEntries") || "[]"
      );

      const filteredEntries = storedEntries.filter((e: any) => e.id !== entryId);
      localStorage.setItem("journalEntries", JSON.stringify(filteredEntries));

      router.push("/journal");
    } catch (error) {
      console.error("Error deleting entry:", error);
      alert("Failed to delete entry. Please try again.");
    }
  };

  // Navigate back
  const handleBack = () => {
    router.push("/journal");
  };

  // Listen for ESC key press
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleBack();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [router]);

  // Loading state
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-gray-600">Loading entry...</p>
        </div>
      </DashboardLayout>
    );
  }

  // Entry not found
  if (entryNotFound) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Entry Not Found</h1>
          <p className="text-gray-600 mb-6">The entry you're looking for doesn't exist or may have been deleted.</p>
          <button
            onClick={handleBack}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            Back to Journal
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Entry</h1>
        <button
          onClick={handleBack}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
        >
          ← Back to Journal
        </button>
      </div>

      {/* Original Prompts Display (if any) */}
      {originalPromptIds.length > 0 && (
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            Original Prompts (from when entry was created)
          </h3>
          <p className="text-xs text-gray-500">
            These prompts were used when this entry was originally saved. 
            They remain marked as used even if you remove them from the entry.
          </p>
        </div>
      )}

      {/* Prompt Suggestions - prioritized by keywords from this entry */}
      {availablePrompts.length > 0 && (
        <PromptSuggestions
          prompts={availablePrompts}
          editorRef={editorRef}
          onPromptInserted={handlePromptInserted}
        />
      )}

      {/* Entry Form */}
      <div className="space-y-6 text-gray-900">
        <div>
          <div className="mb-2">
            <h2 className="text-lg font-bold text-gray-900">Title</h2>
          </div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
            placeholder="Enter a title for your journal entry..."
          />
        </div>

        <div>
          <div className="mb-2">
            <h2 className="text-lg font-bold text-gray-900">Entry Content</h2>
          </div>
          <RichTextEditor
            ref={editorRef}
            value={content}
            onChange={(newContent: string) => setContent(newContent)}
            placeholder="Start writing your journal entry..."
          />
        </div>

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
                className={`px-4 py-3 rounded-lg border-2 transition-all ${
                  colorOption.bgClass
                } ${
                  colorOption.borderClass
                } ${
                  cardColor === colorOption.id
                    ? "ring-2 ring-blue-500 ring-offset-2 scale-105"
                    : "hover:scale-105"
                }`}
              >
                <div className="text-sm font-medium text-gray-700">{colorOption.name}</div>
              </button>
            ))}
          </div>
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

        {/* Action Buttons */}
        <div className="flex justify-between gap-3 pt-4">
          <button
            onClick={handleDelete}
            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
          >
            Delete Entry
          </button>
          <div className="flex gap-3">
            <button
              onClick={handleBack}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Cancel
            </button>
            {/* #20: Conditional "Save as Draft" Button - Only Show for Drafts */}
            {/* WHY: User requested that "Save as Draft" button only appear when editing a draft, */}
            {/*      not when editing a regular entry. This makes sense - regular entries are already saved. */}
            {/* HOW: Conditional rendering based on isDraft state - only show if isDraft is true. */}
            {/*      Button text changes: "Save Entry" for drafts (converts to regular), "Save Changes" for regular. */}
            {/* APPROACH: Simple conditional rendering - conventional React pattern. */}
            {/*           Not over-engineered - just if/else logic. */}
            {/* CONNECTION: Works with #11 (handleSaveDraft) and #12 (handleSave) - different behaviors for drafts. */}
            {isDraft && (
              <button
                onClick={handleSaveDraft}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
              >
                Save as Draft
              </button>
            )}
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              {isDraft ? "Save Entry" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

    </DashboardLayout>
  );
}
