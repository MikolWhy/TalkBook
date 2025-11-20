// journal list page - displays all journal entries
// shows entries in chronological order with preview and actions
//
// WHAT WE'RE CREATING:
// - A page that lists all journal entries in reverse chronological order (newest first)
// - Each entry shows: date, mood emoji, weather, truncated content preview
// - Actions: click to view/edit, delete entry
// - Empty state when no entries exist
//
// OWNERSHIP:
// - Aadil implements this completely
//
// COORDINATION NOTES:
// - Uses repo.ts entry functions (Aadil creates)
// - No conflicts - Aadil owns this entirely
//
// CONTEXT FOR AI ASSISTANTS:
// - This page shows all journal entries in a list
// - Entries are displayed in reverse chronological order (newest first)
// - Each entry shows: date, mood, weather, truncated content preview
// - Actions: view, edit, delete
// - Supports filtering and search (future enhancement)
//
// DEVELOPMENT NOTES:
// - Fetch all entries from database (or use journalStore cache)
// - Display entries as cards with preview
// - Show rich text content (use dangerouslySetInnerHTML with sanitization)
// - Link to edit page for each entry
// - Delete confirmation before deleting
// - Empty state when no entries exist
//
// TODO: implement journal list page
//
// FUNCTIONALITY:
// - Load entries from database
// - Display entries in reverse chronological order
// - Show entry preview (date, mood emoji, weather, truncated content)
// - Link to edit page
// - Delete entry with confirmation
// - Empty state message
//
// UI:
// - List of entry cards
// - Each card: date, mood, weather, content preview, actions
// - Hover effects on cards
// - Responsive grid/list layout
//
// SYNTAX:
// "use client";
// import { useEffect, useState } from "react";
// import Link from "next/link";
// import { getEntries, deleteEntry } from "@/lib/db/repo";
//
// export default function JournalPage() {
//   // implementation
// }

"use client";

//adding to use nav links
import Link from "next/link";
import { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import IOSList, { IOSListItem } from "../components/IOSList";

// TODO: implement journal list page

// TEMPORARY: Basic page structure to prevent navigation errors
// This will be replaced with full implementation later
export default function JournalPage() {
  const [selectedEntryId, setSelectedEntryId] = useState<string | number | null>(null);

  const entries = [
    {
      id: 1,
      date: "2025-01-15",
      mood: "😊",
      weather: "☀️",
      content: "Today was a great day! I went for a walk in the park and enjoyed the beautiful weather. The sun was shining and I felt really positive about everything.",
    },
    {
      id: 2,
      date: "2025-01-14",
      mood: "😌",
      weather: "☁️",
      content: "Had a productive day at work. Finished the project I've been working on and felt accomplished. Looking forward to the weekend.",
    },
    {
      id: 3,
      date: "2025-01-13",
      mood: "🤔",
      weather: "🌧️",
      content: "Rainy day today. Spent most of it indoors reading and reflecting. Sometimes these quiet days are exactly what you need.",
    },
    {
      id: 4,
      date: "2025-01-12",
      mood: "😄",
      weather: "☀️",
      content: "Met up with friends for coffee. Great conversation and lots of laughter. These moments remind me what's truly important in life.",
    },
    {
      id: 5,
      date: "2025-01-11",
      mood: "😴",
      weather: "🌙",
      content: "Early morning entry. Feeling a bit tired but motivated to start the day. Planning to get a lot done today.",
    },
    {
      id: 6,
      date: "2025-01-11",
      mood: "😴",
      weather: "🌙",
      content: "Early morning entry. Feeling a bit tired but motivated to start the day. Planning to get a lot done today.",
    },
    {
      id: 7,
      date: "2025-01-11",
      mood: "😴",
      weather: "🌙",
      content: "Early morning entry. Feeling a bit tired but motivated to start the day. Planning to get a lot done today.",
    },
    {
      id: 8,
      date: "2025-01-11",
      mood: "😴",
      weather: "🌙",
      content: "Early morning entry. Feeling a bit tired but motivated to start the day. Planning to get a lot done today.",
    },
    {
      id: 9,
      date: "2025-01-11",
      mood: "😴",
      weather: "🌙",
      content: "Early morning entry. Feeling a bit tired but motivated to start the day. Planning to get a lot done today.",
    },
    {
      id: 10,
      date: "2025-01-11",
      mood: "😴",
      weather: "🌙",
      content: "Early morning entry. Feeling a bit tired but motivated to start the day. Planning to get a lot done today.",
    },
    {
      id: 11,
      date: "2025-01-11",
      mood: "😴",
      weather: "🌙",
      content: "Early morning entry. Feeling a bit tired but motivated to start the day. Planning to get a lot done today.",
    },
  ];

  // Transform entries to IOSListItem format
  const listItems: IOSListItem[] = entries.map((entry) => ({
    id: entry.id,
    title: entry.date,
    description: entry.content,
    startContent: (
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 text-lg">
        {entry.mood}
      </div>
    ),
    endContent: (
      <div className="flex flex-col items-end gap-1">
        <span className="text-lg">{entry.weather}</span>
      </div>
    ),
    onClick: () => {
      setSelectedEntryId(entry.id);
    },
  }));

  const selectedEntry = entries.find((e) => e.id === selectedEntryId);
  return (
    <DashboardLayout>
      <div className="container">

        {/* Header Section with Title and New Entry Button */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Journal</h1>

          {/* New Entry Button */}
          <Link
            href="/journal/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            ✍️ New Entry
          </Link>
        </div>
        <div className=" flex h-[calc(100vh-200px)] gap-4 mt-6">
          {/* Left Sidebar - 1/3 width: Search and Scrollable List */}
          <div className="w-1/3 flex flex-col border-r border-gray-200 pr-4">
            {/* Search Section */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search entries..."
                className="w-full px-4 py-2 border text-gray-900 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Scrollable iOS-style List */}
            <div className="flex-1 min-h-0" >
              <IOSList
                items={listItems}
                onItemClick={(item) => {
                  setSelectedEntryId(item.id);
                }}
                selectedKeys={selectedEntryId ? new Set([String(selectedEntryId)]) : new Set()}
                emptyMessage="No journal entries yet. Create your first entry!"
              />
            </div>
          </div>

          {/* Right Section - 2/3 width: View Selected Page */}
          <div className="w-2/3 flex flex-col">
            <div className="flex-1 border border-gray-200 rounded-lg p-6 bg-gray-50 overflow-y-auto">
              {selectedEntry ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-4">
                    <h2 className="text-2xl font-bold text-gray-900">{selectedEntry.date}</h2>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{selectedEntry.mood}</span>
                      <span className="text-2xl">{selectedEntry.weather}</span>
                    </div>
                  </div>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {selectedEntry.content}
                    </p>
                  </div>
                  <div className="pt-4 border-t">
                    <Link
                      href={`/journal/${selectedEntry.id}`}
                      className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Edit Entry
                    </Link>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center mt-8">Select an entry from the list to view it here</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

