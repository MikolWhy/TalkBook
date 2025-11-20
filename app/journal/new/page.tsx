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

  const [title, setTitle] = useState(""); // State to store entry title
  const [content, setContent] = useState(""); // State to store editor content
  const [mood, setMood] = useState<string | null>(null); // State to store selected mood
  const [tags, setTags] = useState<string[]>([]); // State to store tags
  const [tagInput, setTagInput] = useState(""); // State for tag input field

  // Mood options with emoji icons
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

  // Tag color options
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

  // Function to save entry to localStorage
  const handleSave = () => {
    if (!title.trim() && !content.trim()) {
      alert("Please add a title or content before saving.");
      return;
    }

    const entry = {
      id: Date.now().toString(),
      title: title.trim(),
      content: content,
      mood: mood,
      tags: tags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Get existing entries from localStorage
    const existingEntries = JSON.parse(
      localStorage.getItem("journalEntries") || "[]"
    );

    // Add new entry
    const updatedEntries = [...existingEntries, entry];

    // Save to localStorage
    localStorage.setItem("journalEntries", JSON.stringify(updatedEntries));

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

      {/* Rich Text Editor */}
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter a title for your journal entry..."
            />
          </div>
        </div>
        <div className="">
          <div className="mb-2">
            <h2 className="text-lg font-bold text-gray-900">Entry Content</h2>
          </div>
          <RichTextEditor
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
                  className="hover:bg-black/10 rounded-full p-0.5 transition-colors"
                  aria-label={`Remove ${tag} tag`}
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
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            onClick={handleSave}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            Save Entry
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}

