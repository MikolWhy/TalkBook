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
import { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import IOSList, { IOSListItem } from "../components/IOSList";

// Mood ID to emoji mapping
const moodMap: Record<string, string> = {
  "very-happy": "😄",
  "happy": "😊",
  "neutral": "😐",
  "sad": "😢",
  "very-sad": "😭",
  "excited": "🤩",
  "calm": "😌",
  "anxious": "😰",
  "angry": "😠",
  "grateful": "🙏",
};

// Tag color options (matching the new entry page)
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

// Function to strip HTML tags for preview
const stripHtml = (html: string): string => {
  if (typeof window === "undefined") return html;
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

// Function to format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Function to truncate text
const truncateText = (text: string, maxLength: number = 100): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

// TODO: implement journal list page

// TEMPORARY: Basic page structure to prevent navigation errors
// This will be replaced with full implementation later
export default function JournalPage() {
  const [selectedEntryId, setSelectedEntryId] = useState<string | number | null>(null);
  const [entries, setEntries] = useState<any[]>([]);

  // Load entries from localStorage
  const loadEntries = () => {
    try {
      const storedEntries = JSON.parse(
        localStorage.getItem("journalEntries") || "[]"
      );
      // Sort by createdAt (newest first)
      const sortedEntries = storedEntries.sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setEntries(sortedEntries);
    } catch (error) {
      console.error("Error loading entries from localStorage:", error);
      setEntries([]);
    }
  };

  // Load entries on mount and when page becomes visible
  useEffect(() => {
    loadEntries();

    // Reload when page becomes visible (user navigates back from new entry page)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadEntries();
      }
    };

    // Listen for storage changes (in case entries are added from another tab)
    window.addEventListener("storage", loadEntries);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    // Also reload on focus (when user switches back to this tab)
    window.addEventListener("focus", loadEntries);

    return () => {
      window.removeEventListener("storage", loadEntries);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", loadEntries);
    };
  }, []);

  // Transform entries to IOSListItem format
  const listItems: IOSListItem[] = entries.map((entry) => {
    const moodEmoji = entry.mood ? moodMap[entry.mood] || "😐" : "😐";
    const contentPreview = truncateText(stripHtml(entry.content || ""));
    const displayTitle = entry.title || formatDate(entry.createdAt);

    return {
      id: entry.id,
      title: displayTitle,
      description: contentPreview || "No content",
      startContent: (
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 text-lg">
          {moodEmoji}
        </div>
      ),
      endContent: entry.tags && entry.tags.length > 0 ? (
        <div className="flex flex-col items-end gap-1">
          <div className="flex flex-wrap gap-1 justify-end max-w-[100px]">
            {entry.tags.slice(0, 2).map((tag: string, index: number) => (
              <span
                key={tag}
                className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getTagColor(
                  index
                )}`}
              >
                {tag}
              </span>
            ))}
            {entry.tags.length > 2 && (
              <span className="text-xs text-gray-500">+{entry.tags.length - 2}</span>
            )}
          </div>
        </div>
      ) : null,
      onClick: () => {
        setSelectedEntryId(entry.id);
      },
    };
  });

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
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {selectedEntry.title || "Untitled Entry"}
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatDate(selectedEntry.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {selectedEntry.mood && (
                        <span className="text-2xl" title={selectedEntry.mood}>
                          {moodMap[selectedEntry.mood] || "😐"}
                        </span>
                      )}
                    </div>
                  </div>
                  {selectedEntry.tags && selectedEntry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedEntry.tags.map((tag: string, index: number) => (
                        <span
                          key={tag}
                          className={`px-3 py-1 rounded-full text-sm font-medium border ${getTagColor(
                            index
                          )}`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="prose max-w-none">
                    {selectedEntry.content ? (
                      <div
                        className="text-gray-700 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: selectedEntry.content }}
                      />
                    ) : (
                      <p className="text-gray-500 italic">No content</p>
                    )}
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

