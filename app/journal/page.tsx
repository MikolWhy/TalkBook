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
import { useState, useEffect, useRef } from "react";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const filterDropdownRef = useRef<HTMLDivElement>(null);

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

  // #19: Click-Outside Detection for Tag Filter Dropdown
  // WHY: User experience - dropdown should close when clicking outside of it.
  //      This is standard dropdown behavior users expect.
  // HOW: Use ref to track dropdown element, add mousedown listener when open.
  //      Check if click target is outside dropdown element, close if so.
  // APPROACH: Standard React pattern - useEffect with event listener, cleanup on unmount.
  //           Uses ref.current.contains() to check if click is inside element.
  //           This is conventional - many UI libraries use this pattern.
  // CONNECTION: Works with #18 (tag filter dropdown) - closes dropdown on outside click.
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isFilterDropdownOpen &&
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(event.target as Node)
      ) {
        setIsFilterDropdownOpen(false);
      }
    };

    if (isFilterDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isFilterDropdownOpen]);

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

  // #13: Get All Unique Tags for Filter Dropdown
  // WHY: User requested filter-by-tag dropdown showing all available tags.
  //      Need to collect unique tags from all entries to populate the dropdown.
  // HOW: Use flatMap to get all tags, Set to deduplicate, sort alphabetically.
  // APPROACH: Simple array manipulation - conventional JavaScript patterns.
  //           Not over-engineered - straightforward data transformation.
  // CONNECTION: Used to populate tag filter dropdown (#15).
  const allTags = Array.from(
    new Set(
      entries.flatMap((entry) => entry.tags || [])
    )
  ).sort();

  // #14: Filter Entries by Search Query and Tag
  // WHY: User requested search functionality and tag filtering.
  //      Search should scan title, content, and tags. Tag filter should show only entries with that tag.
  // HOW: Filter entries array - check search query against title/content/tags (case-insensitive).
  //      Then check if entry has selected tag (if tag filter is active).
  //      Both filters work together (AND logic) - entry must match both.
  // SYNTAX BREAKDOWN:
  //   - entries.filter((entry) => { ... })
  //     - Array.filter() - JavaScript Array method, creates new array with filtered elements
  //     - Arrow function: (entry) => { ... } - callback for each entry
  //     - Returns true to include entry, false to exclude
  //   - searchQuery.trim() - String.trim() removes whitespace, returns empty string if all whitespace
  //     - Empty string is falsy, so if (searchQuery.trim()) checks if query exists
  //   - .toLowerCase() - String method, converts to lowercase for case-insensitive comparison
  //   - .includes(query) - String method, checks if string contains substring
  //     - Returns boolean (true/false)
  //   - stripHtml(entry.content || "") - Custom function (defined elsewhere)
  //     - || "" : fallback to empty string if content is falsy
  //     - Removes HTML tags from content for text search
  //   - (entry.tags || []).some((tag: string) => ...)
  //     - Array.some() - JavaScript Array method, returns true if ANY element matches condition
  //     - Arrow function: (tag: string) => tag.toLowerCase().includes(query)
  //     - Checks if any tag includes the search query
  //   - !titleMatch && !contentMatch && !tagMatch
  //     - Logical NOT (!) and Logical AND (&&)
  //     - All three must be false (no matches) to return false
  //   - entry.tags.includes(selectedTagFilter)
  //     - Array.includes() - JavaScript Array method, checks if array contains value
  //     - Returns boolean
  // REFERENCES:
  //   - Array.filter(): JavaScript Array.prototype.filter() - MDN Web Docs
  //   - String.toLowerCase(): JavaScript String.prototype.toLowerCase() - MDN Web Docs
  //   - String.includes(): JavaScript String.prototype.includes() - MDN Web Docs
  //   - Array.some(): JavaScript Array.prototype.some() - MDN Web Docs
  //   - Array.includes(): JavaScript Array.prototype.includes() - MDN Web Docs
  //   - stripHtml: Custom function (likely uses regex or DOM parsing)
  // APPROACH: Simple filter function with multiple conditions - conventional React pattern.
  //           Case-insensitive matching for better UX. HTML stripped from content for text search.
  // CONNECTION: filteredEntries used to render list items (#15).
  const filteredEntries = entries.filter((entry) => {
    // Search filter: check title and content
    if (searchQuery.trim()) { // Only filter if search query exists
      const query = searchQuery.toLowerCase(); // Convert to lowercase for case-insensitive search
      const titleMatch = (entry.title || "").toLowerCase().includes(query);
      const contentText = stripHtml(entry.content || "").toLowerCase(); // Strip HTML for text search
      const contentMatch = contentText.includes(query);
      const tagMatch = (entry.tags || []).some((tag: string) =>
        tag.toLowerCase().includes(query) // Check if any tag includes query
      );
      
      if (!titleMatch && !contentMatch && !tagMatch) {
        return false; // Entry doesn't match search query (exclude it)
      }
    }

    // Tag filter
    if (selectedTagFilter) { // Only filter if tag is selected
      if (!entry.tags || !entry.tags.includes(selectedTagFilter)) {
        return false; // Entry doesn't have selected tag (exclude it)
      }
    }

    return true; // Entry passes all filters (include it)
  });

  // #15: Transform Entries to List Items with Draft Badge
  // WHY: User requested draft entries show a badge indicator in the list.
  //      This helps users identify which entries are drafts vs regular entries.
  // HOW: Check entry.draft === true, conditionally render yellow "Draft" badge below mood emoji.
  //      Badge uses yellow color scheme to stand out but not be alarming.
  // APPROACH: Simple conditional rendering - conventional React pattern.
  //           Badge positioned below mood emoji in startContent for visual hierarchy.
  // CONNECTION: Works with #7/#11 (draft saving) - badges show draft status.
  const listItems: IOSListItem[] = filteredEntries.map((entry) => {
    const moodEmoji = entry.mood ? moodMap[entry.mood] || "😐" : "😐";
    const contentPreview = truncateText(stripHtml(entry.content || ""));
    const displayTitle = entry.title || formatDate(entry.createdAt);
    const isDraft = entry.draft === true;

    return {
      id: entry.id,
      title: displayTitle,
      description: contentPreview || "No content",
      startContent: (
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 text-lg">
            {moodEmoji}
          </div>
          {isDraft && (
            <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-medium rounded border border-yellow-300">
              Draft
            </span>
          )}
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

  const selectedEntry = filteredEntries.find((e) => e.id === selectedEntryId);

  // #16: Delete Entry Functionality
  // WHY: User requested delete button in journal list page.
  //      Users should be able to delete entries from the list view.
  // HOW: Show confirmation dialog, filter out entry from localStorage, reload list.
  //      Clear selection if deleted entry was currently selected.
  // APPROACH: Standard delete pattern - confirmation, remove from storage, update UI.
  //           Simple and conventional - not over-engineered.
  // CONNECTION: Delete button shown in entry detail view (#17).
  const handleDeleteEntry = (entryId: string | number) => {
    if (!confirm("Are you sure you want to delete this entry? This action cannot be undone.")) {
      return;
    }

    try {
      const storedEntries = JSON.parse(
        localStorage.getItem("journalEntries") || "[]"
      );

      const filteredEntries = storedEntries.filter((e: any) => e.id !== entryId);
      localStorage.setItem("journalEntries", JSON.stringify(filteredEntries));

      // Reload entries
      loadEntries();

      // Clear selection if deleted entry was selected
      if (selectedEntryId === entryId) {
        setSelectedEntryId(null);
      }
    } catch (error) {
      console.error("Error deleting entry:", error);
      alert("Failed to delete entry. Please try again.");
    }
  };
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
            {/* Search and Filter Section */}
            <div className="mb-4 space-y-3">
              {/* Search Input */}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search entries..."
                className="w-full px-4 py-2 border text-gray-900 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {/* #18: Filter by Tag Dropdown */}
              {/* WHY: User requested filter-by-tag functionality with dropdown showing all tags. */}
              {/*      Tags should be displayed with their color-coded badges matching entry tags. */}
              {/* HOW: Use ref for click-outside detection, state for open/close, conditional rendering. */}
              {/*      Show selected tag in button with color badge, dropdown shows "All Entries" + all tags. */}
              {/*      Tags displayed with same color scheme as in entries (getTagColor function). */}
              {/* APPROACH: Standard dropdown pattern - button toggles state, absolute positioned menu. */}
              {/*           Click-outside detection via useEffect (#19) closes dropdown. */}
              {/*           Not over-engineered - simple state + conditional rendering. */}
              {/* CONNECTION: Works with #14 (filter logic) - selectedTagFilter used to filter entries. */}
              <div className="relative" ref={filterDropdownRef}>
                <button
                  onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                  className="w-full px-4 py-2 border text-gray-900 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white hover:bg-gray-50 transition-colors flex items-center justify-between"
                >
                  <span>
                    {selectedTagFilter ? (
                      <span className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getTagColor(
                          allTags.indexOf(selectedTagFilter)
                        )}`}>
                          {selectedTagFilter}
                        </span>
                      </span>
                    ) : (
                      "Filter by tag..."
                    )}
                  </span>
                  <span className="text-gray-400">
                    {isFilterDropdownOpen ? "▲" : "▼"}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {isFilterDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    <button
                      onClick={() => {
                        setSelectedTagFilter(null);
                        setIsFilterDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors ${
                        selectedTagFilter === null ? "bg-blue-50 font-medium" : ""
                      }`}
                    >
                      All Entries
                    </button>
                    {allTags.length > 0 ? (
                      allTags.map((tag, index) => (
                        <button
                          key={tag}
                          onClick={() => {
                            setSelectedTagFilter(tag);
                            setIsFilterDropdownOpen(false);
                          }}
                          className={`w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors flex items-center gap-2 ${
                            selectedTagFilter === tag ? "bg-blue-50 font-medium" : ""
                          }`}
                        >
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getTagColor(
                            index
                          )}`}>
                            {tag}
                          </span>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-gray-500 text-sm">
                        No tags available
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Clear filters button */}
              {(searchQuery || selectedTagFilter) && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedTagFilter(null);
                  }}
                  className="w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Clear filters
                </button>
              )}
            </div>

            {/* Scrollable iOS-style List */}
            <div className="flex-1 min-h-0" >
              <IOSList
                items={listItems}
                onItemClick={(item) => {
                  setSelectedEntryId(item.id);
                }}
                selectedKeys={selectedEntryId ? new Set([String(selectedEntryId)]) : new Set()}
                emptyMessage={
                  searchQuery || selectedTagFilter
                    ? "No entries match your filters."
                    : "No journal entries yet. Create your first entry!"
                }
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
                  <div className="pt-4 border-t flex gap-3">
                    <Link
                      href={`/journal/${selectedEntry.id}`}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Edit Entry
                    </Link>
                    <button
                      onClick={() => handleDeleteEntry(selectedEntry.id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                    >
                      Delete Entry
                    </button>
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

