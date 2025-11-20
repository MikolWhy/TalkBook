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
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "../../components/DashboardLayout";
//to use richTextEditor component
import RichTextEditor from "../../../src/components/RichTextEditor";

// TODO: implement entry creation form

// TEMPORARY: Basic page structure to prevent navigation errors
export default function NewEntryPage() {
  const router = useRouter(); // Hook to navigate programmatically
  
  const [content, setContent] = useState(""); // State to store editor content

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
      
      {/* Rich Text Editor */}
      <div className="mb-6">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900">Entry Content</h2>
        </div>
        <RichTextEditor
          value={content}
          onChange={(newContent: string) => setContent(newContent)}
          placeholder="Start writing your journal entry..."
        />
      </div>
    </DashboardLayout>
  );
}

