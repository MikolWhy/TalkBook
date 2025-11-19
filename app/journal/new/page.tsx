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
import RichTextEditor, { RichTextEditorRef } from "../../../src/components/RichTextEditor";
// NLP components and functions
import NLPResultsDisplay from "../../../src/components/NLPResultsDisplay";
import PromptSuggestions from "../../../src/components/PromptSuggestions";
import { extractMetadata } from "../../../src/lib/nlp/extract";
import { generatePrompts, filterUsedPrompts, filterExpiredPrompts, clearUsedPrompts, Prompt, getUsedPromptsCount } from "../../../src/lib/nlp/prompts";

// TODO: implement entry creation form

export default function NewEntryPage() {
  const router = useRouter(); // Hook to navigate programmatically
  const editorRef = useRef<RichTextEditorRef>(null); // Ref to access editor methods
  
  const [content, setContent] = useState(""); // State to store editor content
  
  // State for extracted metadata
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

  // Dummy text for NLP testing (hardcoded) - TODO: Replace with actual entry content from previous entries
  const dummyText = "Had a great meeting with Zayn today about our group project, I am feeling lazy though and have been procrastinating some of my parts of the project. Not feeling great about it.";

  // Extract metadata and generate prompts when component loads
  useEffect(() => {
    const runExtractionAndPrompts = async () => {
      try {
        // Extract metadata from dummy text (in real app, this would be from previous entries)
        const result = await extractMetadata(dummyText);
        setExtractedData(result);
        
        // Generate prompts based on extracted data (pass original text for context)
        const generatedPrompts = await generatePrompts(result, "cozy", 5, dummyText);
        
        // Filter out prompts that were permanently used (from localStorage)
        const unusedPrompts = filterUsedPrompts(generatedPrompts);
        
        // Filter out expired prompts (default: 7 days)
        // TODO: Get expiryDays from settings store when available
        const expiryDays = 7; // Default, will be configurable in settings
        const validPrompts = filterExpiredPrompts(unusedPrompts, expiryDays);
        
        // Debug: log used prompts count
        const usedCount = getUsedPromptsCount();
        if (usedCount > 0) {
          console.log(`ℹ️ ${usedCount} prompt(s) are marked as used and filtered out. To reset for testing, run: clearUsedPrompts()`);
        }
        
        setAllPrompts(validPrompts);
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
      
      {/* Prompt Suggestions */}
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
            🧪 <strong>Testing Mode:</strong> {getUsedPromptsCount()} prompt(s) marked as used and hidden.
          </p>
          <button
            onClick={() => {
              clearUsedPrompts();
              // Reload prompts
              const runExtractionAndPrompts = async () => {
                try {
                  const result = await extractMetadata(dummyText);
                  const generatedPrompts = await generatePrompts(result, "cozy", 5, dummyText);
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

      {/* Rich Text Editor */}
      <div className="mb-6">
        <RichTextEditor
          ref={editorRef}
          value={content}
          onChange={(newContent: string) => setContent(newContent)}
          placeholder="Start writing your journal entry..."
        />
      </div>

      {/* NLP Results Display - Temporary for testing */}
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

